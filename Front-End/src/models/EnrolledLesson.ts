type EnrolledLesson = {
  id: number;
  lessonId: number;
  startDate: string;
  endDate: string;
  completed: boolean;
  name: string;
  description: string;
};

export default EnrolledLesson;
