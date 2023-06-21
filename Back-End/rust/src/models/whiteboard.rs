use super::consts::WhiteboardType;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Whiteboard {
    code: String,
    whiteboard_type: WhiteboardType,
}

impl Whiteboard {
    pub fn new(whiteboard_type: WhiteboardType) -> Self {
        Self {
            code: String::from("print(\"Hello world!\")"),
            whiteboard_type,
        }
    }

    pub fn with_code(whiteboard_type: WhiteboardType, code: &str) -> Self {
        Self {
            code: code.to_string(),
            whiteboard_type,
        }
    }

    pub fn code(&self) -> &str {
        &self.code
    }

    pub fn set_code(&mut self, code: String) {
        self.code = code;
    }

    pub fn whiteboard_type(&self) -> &WhiteboardType {
        &self.whiteboard_type
    }
}