use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub enum Actions {
    None = 0,
    Join = 1,
    CodeChange = 2,
    SyncData = 3,
    Leave = 4,
    GetData = 5,
    LockCode = 6,
    UnlockCode = 7,
    TeacherJoin = 8,
    ClassroomDeleted = 9,
    AssignmentCreate = 10,
    SubmitAssignment = 11,
    GradeAssignment = 12,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum ClassroomUserRole {
    Student = 0,
    Teacher = 1,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum AssignmentStatus {
    NotStarted = 0,
    InProgress = 1,
    Submitted = 2,
    Completed = 3,
    Correctable = 4,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum UserStatus {
    Offline = 0,
    Online = 1,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum WhiteboardType {
    Public = 0,
    Private = 1,
    Assignment = 2,
}
