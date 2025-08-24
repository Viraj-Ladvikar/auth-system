import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../../../utils/APIURL";

export const signupHandler = (formData) => async (dispatch) => {
  dispatch(setFetchingsignup(true));
  try {
    const response = await axios.post(`${API_URL}api/auth/signup`, formData);
    if (response.status === 200) {
      dispatch(setSignupDetailsData(response.data));
    } else {
      dispatch(setSignupDetailsError("Error"));
      dispatch(setFetchingsignup(false));
    }
  } catch (error) {
    dispatch(setSignupDetailsError(error.message));
    dispatch(setFetchingsignup(false));
  }
};

const initialState = {
  apiStatus: 0,
  fetching: false,
  response: [],
  error: "",
};

const signupSlice = createSlice({
  name: "auth/signupSlice",
  initialState,
  reducers: {
    setSignupDetailsData: (state, action) => {
      state.response = action.payload;
      state.error = "";
      state.apiStatus = state.apiStatus + 1;
    },
    setFetchingsignup: (state, action) => {
      state.fetching = action.payload;
    },
    setSignupDetailsError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setFetchingsignup,
  setSignupDetailsData,
  setSignupDetailsError,
} = signupSlice.actions;

export default signupSlice.reducer;
