use std::collections::HashMap;

use warp::ws::WebSocket;

use crate::models::classroom::Classroom;

pub struct PayloadHandler {
    pub payload_action: i32,
    pub payload_user_id: String,
    pub payload_data: HashMap<String, String>,
    pub source_classroom_id: String,
    pub selected_classroom: Classroom,
    pub source_websocket: WebSocket,
}

impl PayloadHandler {
    pub fn new() -> PayloadHandler {
        todo!()
    }

    pub fn set_message_data(
        &mut self,
        payload: HashMap<String, String>,
        classroom_id: &str,
        websocket: WebSocket,
    ) {
        todo!()
    }

    pub async fn process_message(
        &mut self,
        payload: HashMap<String, String>,
        classroom_id: &str,
        websocket: WebSocket,
    ) {
        todo!()
    }

    pub async fn join(&mut self) {
        todo!()
    }

    pub async fn student_join(&mut self) {
        todo!()
    }

    pub async fn code_change(&mut self) {
        todo!()
    }

    pub async fn get_data(&mut self) {
        todo!()
    }

    pub async fn assignment_create(&mut self) {
        todo!()
    }

    pub async fn lock_code(&mut self) {
        todo!()
    }
    pub async fn unlock_code(&mut self) {
        todo!()
    }

    pub async fn classroom_deleted(&mut self) {
        todo!()
    }

    pub async fn submit_assignment(&mut self) {
        todo!()
    }

    pub async fn grade_assignment(&mut self) {
        todo!()
    }
}
