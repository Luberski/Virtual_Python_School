use serde::{Deserialize, Serialize};

use super::{
    assignment::UserAssignment,
    consts::{ClassroomUserRole, UserStatus, WhiteboardType},
    whiteboard::Whiteboard,
};

#[derive(Serialize, Deserialize, Debug)]
pub struct User {
    pub user_id: String,
    pub role: ClassroomUserRole,
    pub whiteboard: Whiteboard,
    pub user_assignments: Vec<UserAssignment>,
    pub status: UserStatus,
}

impl User {
    pub fn new(user_id: &str, role: ClassroomUserRole) -> User {
        User {
            user_id: user_id.to_string(),
            role,
            whiteboard: Whiteboard::new(WhiteboardType::Private),
            user_assignments: Vec::new(),
            status: UserStatus::Online,
        }
    }
}