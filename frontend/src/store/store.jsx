import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";
import { authSlice } from "./reducer/authSlice";

const staticReducers = {
  auth: authSlice.reducer,
};

const store = configureStore({
  reducer: (state = {}) => state, // empty
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(createLogger()),
});

const injectedReducers = { ...staticReducers };

export function injectReducer(key, reducer) {
  if (injectedReducers[key]) return false;

  injectedReducers[key] = reducer;
  store.replaceReducer(combinedInjectedReducers());
  return true;
}

function combinedInjectedReducers() {
  return combineReducers({
    ...injectedReducers,
  });
}

export default store;
