use serde::{Deserialize, Serialize};

use super::{
    assignment::UserAssignment,
    consts::{ClassroomUserRole, UserStatus},
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
