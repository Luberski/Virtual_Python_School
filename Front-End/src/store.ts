import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import playgroundReducer from "./features/playground/playgroundSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    playground: playgroundReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
