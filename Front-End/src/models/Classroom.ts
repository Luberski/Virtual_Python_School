export type Classroom = {
  id: number;
  name: string;
  teacher_id: number;
  teacher_name: string;
  teacher_last_name: string;
  num_of_students: number;
  is_public: boolean;
  access_code: string;
};

export default Classroom;
