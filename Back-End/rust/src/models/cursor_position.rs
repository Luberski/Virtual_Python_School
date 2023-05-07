use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct CursorPosition {
    pub position: i32,
    pub row: i32,
    pub col: i32,
}
