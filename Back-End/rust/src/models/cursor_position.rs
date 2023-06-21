use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct CursorPosition {
    position: i32,
    row: i32,
    col: i32,
}

impl CursorPosition {
    pub fn new(position: i32, row: i32, col: i32) -> Self {
        Self {
            position,
            row,
            col,
        }
    }
}

impl Default for CursorPosition {
    fn default() -> Self {
        Self {
            position: 0,
            row: 0,
            col: 0,
        }
    }
}
