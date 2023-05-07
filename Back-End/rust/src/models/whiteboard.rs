use super::consts::WhiteboardType;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Whiteboard {
    pub code: String,
    pub whiteboard_type: WhiteboardType,
}
