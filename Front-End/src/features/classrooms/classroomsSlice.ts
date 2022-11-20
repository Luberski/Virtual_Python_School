import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import apiClient from '@app/apiClient';
import type { RootState } from '@app/store';
import type { Classroom } from '@app/models/Classroom';
import type { ApiPayload } from '@app/models/ApiPayload';

export type ClassroomsState = {
  data: Classroom[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: ClassroomsState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchClassrooms = createAsyncThunk(
  'api/classrooms',
  async (showFull: boolean, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const endpoint = `classrooms?showFull=${showFull}`;
      const res = await apiClient.get(endpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

// export const deleteClassroom = createAsyncThunk(
//   'api/courses/delete',
//   async (id: string | number, thunkApi) => {
//     try {
//       const state = thunkApi.getState() as RootState;
//       const { accessToken } = state.auth.token;
//       const res = await apiClient.delete(`courses/${id}`, {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });

//       const data = await res.json();
//       return data;
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   }
// );

export const createClassroom = createAsyncThunk(
  'api/courses/create',
  async ({ name, isPublic }: { name: string; isPublic: boolean }, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const { accessToken } = state.auth.token;
      const res = await apiClient.post('classrooms', {
        json: {
          data: { name, isPublic },
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

export const classroomsSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(HYDRATE, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Object.assign({}, state, { ...action.payload.courses });
      })
      .addCase(fetchClassrooms.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(
        fetchClassrooms.fulfilled,
        (
          state,
          { payload: { data, error } }: { payload: ApiPayload | any }
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
      .addCase(fetchClassrooms.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
    // .addCase(
    //   deleteClassroom.fulfilled,
    //   (state, { payload }: { payload: ApiPayload | any }) => {
    //     state.data = state.data.filter(
    //       (course) => course.id !== payload.data.id
    //     );
    //   }
    // )
    .addCase(
      createClassroom.fulfilled,
      (state, { payload }: { payload: ApiPayload | any }) => {
        state.data = [...state.data, payload.data];
      }
    );
  },
});

export const selectClassroomsData = (state: RootState) => state.classrooms.data;
export const selectClassroomsError = (state: RootState) =>
  state.classrooms.error;
export const selectClassroomsStatus = (state: RootState) =>
  state.classrooms.status;

export default classroomsSlice.reducer;
