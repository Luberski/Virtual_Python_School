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
import enrolledLessonReducer from '@app/features/lessons/enrolledLessonSlice';

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
};
