import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import {
  nextReduxCookieMiddleware,
  wrapMakeStore,
} from 'next-redux-cookie-wrapper';
import NextReduxLogger from 'next-redux-logger';
import authReducer from '@app/features/auth/authSlice';
import playgroundReducer from '@app/features/playground/playgroundSlice';
import coursesReducer from '@app/features/courses/coursesSlice';
import courseReducer from '@app/features/courses/courseSlice';
import enrollCourseReducer from '@app/features/courses/enrollCourseSlice';
import courseWithLessonsReducer from '@app/features/courses/courseWithLessonsSlice';
import enrolledCourseWithLessonsReducer from '@app/features/courses/enrolled/enrolledCourseWithLessonsSlice';
import featuredCoursesReducer from '@app/features/courses/featured/featuredCoursesSlice';
import enrolledCoursesReducer from '@app/features/courses/enrolled/enrolledCoursesSlice';
import lessonsReducer from '@app/features/lessons/lessonsSlice';
import lessonReducer from '@app/features/lessons/lessonSlice';
import answersReducer from '@app/features/lessons/answersSlice';
import answerReducer from '@app/features/lessons/answerSlice';
import enrollLessonReducer from '@app/features/lessons/enrollLessonSlice';
import enrolledLessonReducer from '@app/features/lessons/enrolled/enrolledLessonSlice';
import surveyReducer from '@app/features/dynamic-courses/survey/surveySlice';
import surveyResultsReducer from '@app/features/dynamic-courses/survey/surveyResultsSlice';
import enrollDynamicCourseReducer from '@app/features/dynamic-courses/enrollDynamicCourseSlice';
import dynamicCourseReducer from '@app/features/dynamic-courses/dynamicCourseSlice';
import dynamicCoursesReducer from '@app/features/dynamic-courses/dynamicCoursesSlice';
import surveyQuestionReducer from '@app/features/dynamic-courses/survey/surveyQuestionSlice';
import surveyAnswerReducer from '@app/features/dynamic-courses/survey/surveyAnswerSlice';
import surveysReducer from '@app/features/dynamic-courses/survey/surveysSlice';
import dynamicLessonReducer from '@app/features/dynamic-courses/dynamicLessonSlice';

const combinedReducers = combineReducers({
  auth: authReducer,
  playground: playgroundReducer,
  courses: coursesReducer,
  course: courseReducer,
  enrollCourse: enrollCourseReducer,
  courseWithLessons: courseWithLessonsReducer,
  enrolledCourseWithLessons: enrolledCourseWithLessonsReducer,
  featuredCourses: featuredCoursesReducer,
  enrolledCourses: enrolledCoursesReducer,
  lessons: lessonsReducer,
  lesson: lessonReducer,
  answers: answersReducer,
  answer: answerReducer,
  enrollLesson: enrollLessonReducer,
  enrolledLesson: enrolledLessonReducer,
  survey: surveyReducer,
  surveyResults: surveyResultsReducer,
  enrollDynamicCourse: enrollDynamicCourseReducer,
  dynamicCourse: dynamicCourseReducer,
  dynamicCourses: dynamicCoursesReducer,
  dynamicLesson: dynamicLessonReducer,
  surveyQuestion: surveyQuestionReducer,
  surveyAnswer: surveyAnswerReducer,
  surveys: surveysReducer,
});

export const store = wrapMakeStore(() =>
  configureStore({
    reducer: combinedReducers,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(
          nextReduxCookieMiddleware({
            // Here, set the cookie data you want to share between the client and the server. I set the following three data. Just set them according to your own needs
            subtrees: ['auth.user', 'auth.token', 'auth.isLoggedIn'],
          })
        )
        .concat(
          process.env.NODE_ENV === 'development' ? [NextReduxLogger] : []
        ),
  })
);

export const wrapper = createWrapper(store);

export type RootState = {
  auth: ReturnType<typeof authReducer>;
  playground: ReturnType<typeof playgroundReducer>;
  courses: ReturnType<typeof coursesReducer>;
  course: ReturnType<typeof courseReducer>;
  enrollCourse: ReturnType<typeof enrollCourseReducer>;
  courseWithLessons: ReturnType<typeof courseWithLessonsReducer>;
  enrolledCourseWithLessons: ReturnType<
    typeof enrolledCourseWithLessonsReducer
  >;
  featuredCourses: ReturnType<typeof featuredCoursesReducer>;
  enrolledCourses: ReturnType<typeof enrolledCoursesReducer>;
  lessons: ReturnType<typeof lessonsReducer>;
  lesson: ReturnType<typeof lessonReducer>;
  answers: ReturnType<typeof answersReducer>;
  answer: ReturnType<typeof answerReducer>;
  enrollLesson: ReturnType<typeof enrollLessonReducer>;
  enrolledLesson: ReturnType<typeof enrolledLessonReducer>;
  survey: ReturnType<typeof surveyReducer>;
  surveyResults: ReturnType<typeof surveyResultsReducer>;
  enrollDynamicCourse: ReturnType<typeof enrollDynamicCourseReducer>;
  dynamicCourse: ReturnType<typeof dynamicCourseReducer>;
  dynamicCourses: ReturnType<typeof dynamicCoursesReducer>;
  dynamicLesson: ReturnType<typeof dynamicLessonReducer>;
  surveyQuestion: ReturnType<typeof surveyQuestionReducer>;
  surveyAnswer: ReturnType<typeof surveyAnswerReducer>;
  surveys: ReturnType<typeof surveysReducer>;
};
