extern crate pretty_env_logger;
#[macro_use]
extern crate log;

pub mod managers;
pub mod models;

use std::collections::HashMap;
use std::sync::{
    atomic::{AtomicUsize, Ordering},
    Arc,
};

use futures_util::{SinkExt, StreamExt, TryFutureExt};
use tokio::sync::{mpsc, RwLock};
use tokio_stream::wrappers::UnboundedReceiverStream;
use warp::ws::{Message, WebSocket};
use warp::Filter;

/// Our global unique user id counter.
static NEXT_USER_ID: AtomicUsize = AtomicUsize::new(1);

/// Our state of currently connected users.
///
/// - Key is their id
/// - Value is a sender of `warp::ws::Message`
type WebsocketConnections = Arc<RwLock<HashMap<usize, mpsc::UnboundedSender<Message>>>>;

#[tokio::main]
async fn main() {
    pretty_env_logger::init();
    run().await;
}

// Returns Response provided by applying the Filter.
async fn run() {
    // GET / -> index html
    let index = warp::path::end().map(|| warp::reply::html(INDEX_HTML));
    let routes = index.or(serve_ws());

    warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;
}

fn serve_ws() -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
    // Keep track of all connected users, key is usize, value
    // is a websocket sender.
    let ws_connections = WebsocketConnections::default();
    // Turn our "state" into a new Filter...
    let ws_connections = warp::any().map(move || ws_connections.clone());
    warp::path("ws")
        // The `ws()` filter will prepare Websocket handshake...
        .and(warp::ws())
        .and(ws_connections)
        .and(warp::path::param::<u32>())
        .map(|ws: warp::ws::Ws, ws_connections, classroom_id: u32| {
            // This will call our function if the handshake succeeds.
            ws.on_upgrade(move |socket| user_connected(socket, ws_connections, classroom_id))
        })
}

async fn user_connected(ws: WebSocket, ws_connections: WebsocketConnections, classroom_id: u32) {
    // Use a counter to assign a new unique ID for this user.
    let my_id = NEXT_USER_ID.fetch_add(1, Ordering::Relaxed);

    info!("new chat user: {}", my_id);
    info!("classroom_id: {}", classroom_id);

    // Split the socket into a sender and receive of messages.
    let (mut user_ws_tx, mut user_ws_rx) = ws.split();

    // Use an unbounded channel to handle buffering and flushing of messages
    // to the websocket...
    let (tx, rx) = mpsc::unbounded_channel();
    let mut rx = UnboundedReceiverStream::new(rx);

    tokio::task::spawn(async move {
        while let Some(message) = rx.next().await {
            user_ws_tx
                .send(message)
                .unwrap_or_else(|e| {
                    eprintln!("websocket send error: {}", e);
                })
                .await;
        }
    });

    // Save the sender in our list of connected users.
    ws_connections.write().await.insert(my_id, tx);

    // Return a `Future` that is basically a state machine managing
    // this specific user's connection.

    // Every time the user sends a message, broadcast it to
    // all other users...
    while let Some(result) = user_ws_rx.next().await {
        let msg = match result {
            Ok(msg) => msg,
            Err(e) => {
                eprintln!("websocket error(uid={}): {}", my_id, e);
                break;
            }
        };
        user_message(my_id, msg, &ws_connections).await;
    }

    // user_ws_rx stream will keep processing as long as the user stays
    // connected. Once they disconnect, then...
    user_disconnected(my_id, &ws_connections).await;
}

async fn user_message(my_id: usize, msg: Message, ws_connections: &WebsocketConnections) {
    // Skip any non-Text messages...
    let msg = if let Ok(s) = msg.to_str() {
        s
    } else {
        return;
    };

    let new_msg = format!("<User#{}>: {}", my_id, msg);

    // New message from this user, send it to everyone else (except same uid)...
    for (&uid, tx) in ws_connections.read().await.iter() {
        if my_id != uid {
            if let Err(_disconnected) = tx.send(Message::text(new_msg.clone())) {
                // The tx is disconnected, our `user_disconnected` code
                // should be happening in another task, nothing more to
                // do here.
            }
        }
    }
}

async fn user_disconnected(my_id: usize, users: &WebsocketConnections) {
    eprintln!("good bye user: {}", my_id);

    // Stream closed up, so remove from the user list
    users.write().await.remove(&my_id);
}

static INDEX_HTML: &str = r#"<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Warp Chat</title>
    </head>
    <body>
        <h1>Warp chat</h1>
        <div id="chat">
            <p><em>Connecting...</em></p>
        </div>
        <input type="text" id="text" />
        <button type="button" id="send">Send</button>
        <script type="text/javascript">
        const chat = document.getElementById('chat');
        const text = document.getElementById('text');
        const uri = 'ws://' + location.host + '/ws/1';
        const ws = new WebSocket(uri);

        function message(data) {
            const line = document.createElement('p');
            line.innerText = data;
            chat.appendChild(line);
        }

        ws.onopen = function() {
            chat.innerHTML = '<p><em>Connected!</em></p>';
        };

        ws.onmessage = function(msg) {
            message(msg.data);
        };

        ws.onclose = function() {
            chat.getElementsByTagName('em')[0].innerText = 'Disconnected!';
        };

        send.onclick = function() {
            const msg = text.value;
            ws.send(msg);
            text.value = '';

            message('<You>: ' + msg);
        };
        </script>
    </body>
</html>
"#;

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_ws() {
        let server = serve_ws();

        let mut client1 = warp::test::ws()
            .path("/ws/1")
            .handshake(server.clone())
            .await
            .expect("handshake");

        let mut client2 = warp::test::ws()
            .path("/ws/1")
            .handshake(server.clone())
            .await
            .expect("handshake");

        client1.send_text("hello").await;
        client2.send_text("world").await;

        assert_eq!(
            client1.recv().await.unwrap().to_str().unwrap(),
            "<User#2>: world"
        );
        assert_eq!(
            client2.recv().await.unwrap().to_str().unwrap(),
            "<User#1>: hello"
        );
    }
}
