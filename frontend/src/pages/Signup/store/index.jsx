import { combineReducers } from "@reduxjs/toolkit";
import signupSlice from "./signupSlice";

 const signupReducer = combineReducers({
  signupSlice,
});


export default signupReducer

