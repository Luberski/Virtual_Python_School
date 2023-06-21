use super::{consts::AssignmentStatus, whiteboard::Whiteboard, consts::WhiteboardType};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Assignment {
    pub assignment_name: String,
    pub assignment_description: String,
    pub assignment_code: String,
}

impl Assignment {
    pub fn new(
        assignment_name: &str,
        assignment_description: &str,
        assignment_code: &str,
    ) -> Assignment {
        Assignment {
            assignment_name: assignment_name.to_string(),
            assignment_description: assignment_description.to_string(),
            assignment_code: assignment_code.to_string(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UserAssignment {
    pub user_id: String,
    pub assignment: Assignment,
    pub whiteboard: Whiteboard,
    pub grade: Option<i32>,
    pub feedback: Option<String>,
    pub grade_history: Vec<i32>,
    pub feedback_history: Vec<String>,
    pub status: AssignmentStatus,
}

impl UserAssignment {
    pub fn new(user_id: &str, assignment: Assignment) -> UserAssignment {
        UserAssignment {
            user_id: user_id.to_string(),
            assignment,
            whiteboard: Whiteboard::new(WhiteboardType::Assignment),
            grade: None,
            feedback: None,
            grade_history: Vec::new(),
            feedback_history: Vec::new(),
            status: AssignmentStatus::NotStarted,
        }
    }
}
