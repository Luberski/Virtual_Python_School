use warp::ws::WebSocket;

use crate::models::{classroom::Classroom, user::User};

pub struct UserManager;

impl UserManager {
    pub fn new() -> UserManager {
        todo!()
    }

    pub fn create_student(
        &mut self,
        user_id: &str,
        classroom: &Classroom,
        websocket: WebSocket,
    ) -> User {
        todo!()
    }

    pub fn create_teacher(&mut self, user_id: &str, websocket: WebSocket) -> User {
        todo!()
    }
}
