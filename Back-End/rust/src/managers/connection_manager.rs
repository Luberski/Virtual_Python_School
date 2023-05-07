use std::collections::HashMap;

use warp::ws::WebSocket;

use crate::models::classroom::Classroom;

pub struct ConnectionManager {
    pub existing_classes: HashMap<String, Classroom>,
}

impl ConnectionManager {
    pub fn new() -> ConnectionManager {
        ConnectionManager {
            existing_classes: HashMap::new(),
        }
    }
    pub async fn connect(&mut self, classroom_id: &str, websocket: WebSocket) {
        todo!()
    }

    pub async fn disconnect(&mut self, classroom_id: &str, websocket: WebSocket) {
        todo!()
    }

    pub async fn broadcast_class_online(&mut self, payload: &str, classroom_id: &str) {
        todo!()
    }

    pub async fn broadcast_class_students(&mut self, payload: &str, classroom_id: &str) {
        todo!()
    }
}
