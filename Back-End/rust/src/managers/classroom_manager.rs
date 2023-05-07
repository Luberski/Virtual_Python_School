use std::collections::HashMap;

use crate::models::classroom::Classroom;

pub struct ClassroomManager {
    existing_classes: HashMap<String, Classroom>,
}

impl ClassroomManager {
    pub fn new() -> ClassroomManager {
        ClassroomManager {
            existing_classes: HashMap::new(),
        }
    }

    pub fn get_classroom(&self, classroom_id: &str) -> Option<&Classroom> {
        self.existing_classes.get(classroom_id)
    }

    pub fn add_classroom(&mut self, classroom_id: &str) {
        if !self.existing_classes.contains_key(classroom_id) {
            self.existing_classes
                .insert(classroom_id.to_string(), Classroom::new(classroom_id));
        }
    }

    pub fn remove_classroom(&mut self, classroom_id: &str) {
        self.existing_classes.remove(classroom_id);
    }
}
