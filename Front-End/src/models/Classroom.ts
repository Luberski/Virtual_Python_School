export type Classroom = {
  id: number;
  name: string;
  teacher_id: number;
  num_of_students: number;
  is_public: boolean;
  access_code: string;
};

export default Classroom;
