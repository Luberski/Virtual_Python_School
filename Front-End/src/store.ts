import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";
import {
  nextReduxCookieMiddleware,
  wrapMakeStore,
} from "next-redux-cookie-wrapper";
import logger from "redux-logger";
import authReducer from "./features/auth/authSlice";
import playgroundReducer from "./features/playground/playgroundSlice";

const combinedReducers = combineReducers({
  auth: authReducer,
  playground: playgroundReducer,
});

export const store = wrapMakeStore(() =>
  configureStore({
    reducer: combinedReducers,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(
          nextReduxCookieMiddleware({
            // Here, set the cookie data you want to share between the client and the server. I set the following three data. Just set them according to your own needs
            subtrees: ["auth.user", "auth.token", "auth.isLoggedIn"],
          })
        )
        .concat(logger),
  })
);
export const wrapper = createWrapper(store);

export type RootState = {
  auth: ReturnType<typeof authReducer>;
  playground: ReturnType<typeof playgroundReducer>;
};
