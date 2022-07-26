import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import {
  nextReduxCookieMiddleware,
  wrapMakeStore,
} from 'next-redux-cookie-wrapper';
import logger from 'redux-logger';
import authReducer from '@app/features/auth/authSlice';
import playgroundReducer from '@app/features/playground/playgroundSlice';
import coursesReducer from '@app/features/courses/coursesSlice';
import courseReducer from '@app/features/courses/courseSlice';
import enrollCourseReducer from '@app/features/courses/enrollCourseSlice';
import courseWithLessonsReducer from '@app/features/courses/courseWithLessonsSlice';
import featuredCoursesReducer from '@app/features/courses/featuredCoursesSlice';
import enrolledCoursesReducer from '@app/features/courses/enrolledCoursesSlice';
import lessonsReducer from '@app/features/lessons/lessonsSlice';
import lessonReducer from '@app/features/lessons/lessonSlice';
import answersReducer from '@app/features/lessons/answersSlice';
import answerReducer from '@app/features/lessons/answerSlice';

const combinedReducers = combineReducers({
  auth: authReducer,
  playground: playgroundReducer,
  courses: coursesReducer,
  course: courseReducer,
  enrollCourse: enrollCourseReducer,
  courseWithLessons: courseWithLessonsReducer,
  featuredCourses: featuredCoursesReducer,
  enrolledCourses: enrolledCoursesReducer,
  lessons: lessonsReducer,
  lesson: lessonReducer,
  answers: answersReducer,
  answer: answerReducer,
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
        .concat(process.env.NODE_ENV === 'development' ? [logger] : []),
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
  featuredCourses: ReturnType<typeof featuredCoursesReducer>;
  enrolledCourses: ReturnType<typeof enrolledCoursesReducer>;
  lessons: ReturnType<typeof lessonsReducer>;
  lesson: ReturnType<typeof lessonReducer>;
  answers: ReturnType<typeof answersReducer>;
  answer: ReturnType<typeof answerReducer>;
};
