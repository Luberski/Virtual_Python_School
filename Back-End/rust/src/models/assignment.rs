use super::{consts::AssignmentStatus, whiteboard::Whiteboard};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Assignment {
    pub assignment_name: String,
    pub assignment_description: String,
    pub assignment_code: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UserAssignment {
    pub user_id: String,
    pub assignment: Assignment,
    pub whiteboard: Whiteboard,
    pub grade: Option<i32>,
    pub feedback: Option<String>,
    pub grade_history: Vec<i32>,
    pub status: AssignmentStatus,
}
