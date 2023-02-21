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
import dashboardReducer from '@app/features/dashboard/dashboardSlice';
import classroomsReducer from '@app/features/classrooms/classroomsSlice';
import classroomSessionsReducer from '@app/features/classrooms/sessions/classroomSessionsSlice';
import courseTagsReducer from '@app/features/tags/courseTagsSlice';
import recommendedCoursesReducer from '@app/features/recommender/recommendedCoursesSlice';
import recommendedLessonsReducer from '@app/features/recommender/recommendedLessonsSlice';
import knowledgeTestReducer from '@app/features/dynamic-courses/knowledge-test/knowledgeTestSlice';
import knowledgeTestQuestionReducer from '@app/features/dynamic-courses/knowledge-test/knowledgeTestQuestionSlice';
import knowledgeTestResultsReducer from '@app/features/dynamic-courses/knowledge-test/knowledgeTestResultsSlice';
import knowledgeTestsReducer from '@app/features/dynamic-courses/knowledge-test/knowledgeTestsSlice';
import knowledgeTestResultsStatsReducer from '@app/features/dynamic-courses/knowledge-test/knowledgeTestResultsStatsSlice';
import globalKnowledgeTestReducer from '@app/features/dynamic-courses/global-knowledge-test/globalKnowledgeTestSlice';
import globalKnowledgeTestQuestionReducer from '@app/features/dynamic-courses/global-knowledge-test/globalKnowledgeTestQuestionSlice';
import globalKnowledgeTestResultsReducer from '@app/features/dynamic-courses/global-knowledge-test/globalKnowledgeTestResultsSlice';
import globalKnowledgeTestsReducer from '@app/features/dynamic-courses/global-knowledge-test/globalKnowledgeTestsSlice';
import globalKnowledgeTestResultsStatsReducer from '@app/features/dynamic-courses/global-knowledge-test/globalKnowledgeTestResultsStatsSlice';

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
  classrooms: classroomsReducer,
  classroomSessions: classroomSessionsReducer,
  dynamicCourses: dynamicCoursesReducer,
  dynamicLesson: dynamicLessonReducer,
  surveyQuestion: surveyQuestionReducer,
  surveyAnswer: surveyAnswerReducer,
  surveys: surveysReducer,
  dashboard: dashboardReducer,
  courseTags: courseTagsReducer,
  recommendedCourses: recommendedCoursesReducer,
  recommendedLessons: recommendedLessonsReducer,
  knowledgeTest: knowledgeTestReducer,
  knowledgeTestQuestion: knowledgeTestQuestionReducer,
  knowledgeTestResults: knowledgeTestResultsReducer,
  knowledgeTests: knowledgeTestsReducer,
  knowledgeTestResultsStats: knowledgeTestResultsStatsReducer,
  globalKnowledgeTest: globalKnowledgeTestReducer,
  globalKnowledgeTestQuestion: globalKnowledgeTestQuestionReducer,
  globalKnowledgeTestResults: globalKnowledgeTestResultsReducer,
  globalKnowledgeTests: globalKnowledgeTestsReducer,
  globalKnowledgeTestResultsStats: globalKnowledgeTestResultsStatsReducer,
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

export type AppStore = ReturnType<typeof store>;

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
  classrooms: ReturnType<typeof classroomsReducer>;
  classroomSessions: ReturnType<typeof classroomSessionsReducer>;
  dynamicCourses: ReturnType<typeof dynamicCoursesReducer>;
  dynamicLesson: ReturnType<typeof dynamicLessonReducer>;
  surveyQuestion: ReturnType<typeof surveyQuestionReducer>;
  surveyAnswer: ReturnType<typeof surveyAnswerReducer>;
  surveys: ReturnType<typeof surveysReducer>;
  dashboard: ReturnType<typeof dashboardReducer>;
  courseTags: ReturnType<typeof courseTagsReducer>;
  recommendedCourses: ReturnType<typeof recommendedCoursesReducer>;
  recommendedLessons: ReturnType<typeof recommendedLessonsReducer>;
  knowledgeTest: ReturnType<typeof knowledgeTestReducer>;
  knowledgeTestQuestion: ReturnType<typeof knowledgeTestQuestionReducer>;
  knowledgeTestResults: ReturnType<typeof knowledgeTestResultsReducer>;
  knowledgeTests: ReturnType<typeof knowledgeTestsReducer>;
  knowledgeTestResultsStats: ReturnType<
    typeof knowledgeTestResultsStatsReducer
  >;
  globalKnowledgeTest: ReturnType<typeof globalKnowledgeTestReducer>;
  globalKnowledgeTestQuestion: ReturnType<
    typeof globalKnowledgeTestQuestionReducer
  >;
  globalKnowledgeTestResults: ReturnType<
    typeof globalKnowledgeTestResultsReducer
  >;
  globalKnowledgeTests: ReturnType<typeof globalKnowledgeTestsReducer>;
  globalKnowledgeTestResultsStats: ReturnType<
    typeof globalKnowledgeTestResultsStatsReducer
  >;
};

export const wrapper = createWrapper<AppStore>(store);
