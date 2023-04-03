import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type Lesson from '@app/models/Lesson';
import type ApiPayload from '@app/models/ApiPayload';
import type ApiStatus from '@app/models/ApiStatus';

export type LessonsState = {
  data: Lesson[];
  status: ApiStatus;
  error: string | null;
};

const initialState: LessonsState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchLessonsByCourseId = createAsyncThunk<
  ApiPayload<Lesson[]>,
  number
>('api/lessons/byCourseId', async (courseId, thunkApi) => {
  try {
    const state = thunkApi.getState() as RootState;
    const { accessToken } = state.auth.token;
    const res = await apiClient.get(`courses/${courseId}/lessons`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    return data as ApiPayload<Lesson[]>;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const fetchAllLessons = createAsyncThunk<ApiPayload<Lesson[]>>(
  'api/lessons/all',
  async (_: void, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.get(`lessons`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      return data as ApiPayload<Lesson[]>;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const deleteLesson = createAsyncThunk<ApiPayload<Lesson>, number>(
  'api/lessons/delete',
  async (id, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.delete(`lessons/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      return data as ApiPayload<Lesson>;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const createLesson = createAsyncThunk<
  ApiPayload<Lesson>,
  {
    courseId: number;
    name: string;
    description: string;
    type: number;
    numberOfAnswers: number;
    answer: string;
    answerCheckRule: string;
  }
>(
  'api/lessons/create',
  async (
    {
      courseId,
      name,
      description,
      type,
      numberOfAnswers,
      answer,
      answerCheckRule,
    },
    thunkApi
  ) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.post('lessons', {
        json: {
          data: {
            course_id: courseId,
            name,
            description,
            type,
            number_of_answers: numberOfAnswers,
            final_answer: answer,
            answer_check_rule: answerCheckRule,
          },
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      return data as ApiPayload<Lesson>;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

// TODO: support more fields
export const editLesson = createAsyncThunk<
  ApiPayload<Lesson>,
  {
    courseId: number;
    lessonId: number;
    name?: string;
    description?: string;
    type?: number;
    numberOfAnswers?: number;
    answer?: string;
    answerCheckRule?: string;
    order?: number;
  }
>(
  'api/lessons/edit',
  async (
    {
      courseId,
      lessonId,
      name,
      description,
      type,
      numberOfAnswers,
      answer,
      answerCheckRule,
      order,
    },
    thunkApi
  ) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.patch('lessons', {
        json: {
          data: {
            course_id: courseId,
            lesson_id: lessonId,
            ...(name && { name }),
            ...(description && { description }),
            ...(type && { type }),
            ...(numberOfAnswers && { number_of_answers: numberOfAnswers }),
            ...(answer && { final_answer: answer }),
            ...(answerCheckRule && { answer_check_rule: answerCheckRule }),
            ...(order && { order }),
          },
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      return data as ApiPayload<Lesson>;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const lessonsSlice = createSlice({
  name: 'lessons',
  initialState,
  reducers: {
    changeLessonOrderUp: (
      state,
      action: PayloadAction<{
        lessonId: number;
        currentOrder: number;
      }>
    ) => {
      const { lessonId, currentOrder } = action.payload;
      const lesson = state.data.find((lesson) => lesson.id === lessonId);
      if (lesson) {
        const index = state.data.findIndex((lesson) => lesson.id === lessonId);
        const prevLesson = state.data[index - 1];
        if (prevLesson) {
          lesson.order = prevLesson.order;
          prevLesson.order = currentOrder;
        }
        state.data = state.data.sort((a, b) => a.order - b.order);
      }
    },
    changeLessonOrderDown: (
      state,
      action: PayloadAction<{
        lessonId: number;
        currentOrder: number;
      }>
    ) => {
      const { lessonId, currentOrder } = action.payload;
      const lesson = state.data.find((lesson) => lesson.id === lessonId);
      if (lesson) {
        const index = state.data.findIndex((lesson) => lesson.id === lessonId);
        const nextLesson = state.data[index + 1];
        if (nextLesson) {
          lesson.order = nextLesson.order;
          nextLesson.order = currentOrder;
        }
        state.data = state.data.sort((a, b) => a.order - b.order);
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.lessons });
      })
      .addCase(fetchLessonsByCourseId.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchLessonsByCourseId.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload<Lesson[]> }
        ) => {
          if (error) {
            state.data = null;
            state.error = error;
            state.status = 'failed';
          } else {
            state.data = data;
            state.error = null;
            state.status = 'succeeded';
          }
        }
      )
      .addCase(fetchLessonsByCourseId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(deleteLesson.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        deleteLesson.fulfilled,
        (state, { payload }: { payload: ApiPayload<Lesson> }) => {
          state.data = state.data.filter(
            (course) => course.id !== payload.data.id
          );
        }
      )
      .addCase(deleteLesson.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(createLesson.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        createLesson.fulfilled,
        (state, { payload }: { payload: ApiPayload<Lesson> }) => {
          state.data = [...state.data, payload.data];
        }
      )
      .addCase(createLesson.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(editLesson.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        editLesson.fulfilled,
        (state, { payload }: { payload: ApiPayload<Lesson> }) => {
          if (payload.error) {
            state.error = payload.error;
          } else {
            state.data = state.data.map((lesson) =>
              lesson.id === payload.data.id ? payload.data : lesson
            );
          }
        }
      )
      .addCase(editLesson.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(fetchAllLessons.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchAllLessons.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload<Lesson[]> }
        ) => {
          if (error) {
            state.data = null;
            state.error = error;
            state.status = 'failed';
          } else {
            state.data = data;
            state.error = null;
            state.status = 'succeeded';
          }
        }
      )
      .addCase(fetchAllLessons.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectLessonsData = (state: RootState) => state.lessons.data;
export const selectLessonsError = (state: RootState) => state.lessons.error;
export const selectLessonsStatus = (state: RootState) => state.lessons.status;

export const { changeLessonOrderUp, changeLessonOrderDown } =
  lessonsSlice.actions;

export default lessonsSlice.reducer;
