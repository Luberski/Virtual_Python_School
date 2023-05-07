use super::user::User;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Classroom {
    pub classroom_id: String,
    pub users: Vec<User>,
}

impl Classroom {
    pub fn new(classroom_id: &str) -> Classroom {
        Classroom {
            classroom_id: classroom_id.to_string(),
            users: Vec::new(),
        }
    }
}
