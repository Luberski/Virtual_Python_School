import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import {
  nextReduxCookieMiddleware,
  wrapMakeStore,
} from 'next-redux-cookie-wrapper';
import logger from 'redux-logger';
import authReducer from './features/auth/authSlice';
import playgroundReducer from './features/playground/playgroundSlice';
import coursesReducer from './features/courses/coursesSlice';
import courseReducer from './features/courses/courseSlice';
import featuredCoursesReducer from './features/courses/featuredCoursesSlice';
import enrolledCoursesReducer from './features/courses/enrolledCoursesSlice';
import lessonsReducer from './features/lessons/lessonsSlice';
import lessonReducer from './features/lessons/lessonSlice';
import answersReducer from './features/lessons/answersSlice';

const combinedReducers = combineReducers({
  auth: authReducer,
  playground: playgroundReducer,
  courses: coursesReducer,
  course: courseReducer,
  featuredCourses: featuredCoursesReducer,
  enrolledCourses: enrolledCoursesReducer,
  lessons: lessonsReducer,
  lesson: lessonReducer,
  answers: answersReducer,
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
  featuredCourses: ReturnType<typeof featuredCoursesReducer>;
  enrolledCourses: ReturnType<typeof enrolledCoursesReducer>;
  lessons: ReturnType<typeof lessonsReducer>;
  lesson: ReturnType<typeof lessonReducer>;
  answers: ReturnType<typeof answersReducer>;
};
