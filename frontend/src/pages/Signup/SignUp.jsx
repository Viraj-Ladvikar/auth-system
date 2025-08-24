import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import {  signupHandler } from "./store/signupSlice";
import withReducer from "../../store/withReducer";
import signupReducer from "./store";

const SignUp = () => {

  const dispatch = useDispatch()
  const defaultValues = {
    name: "",
    email: "",
    password: "",
  };

  const schema = yup.object().shape({
    name: yup.string().required("Full Name is  required"),
    email: yup.string().email("Invalid Format").required("Email is required"),
    password: yup
      .string()
      .matches(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least 8 characters"
      )
      .required("Password is required"),
  });
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: yupResolver(schema),
  });
const [data,setData] = useState({})

const onSubmit = (formData) => {

  dispatch(signupHandler(formData))
};
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="bg-gray-700 p-6 h-auto rounded shadow-md w-96">
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold">Signup</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-4">
            <Typography className="text-white" variant="subtitle1" gutterBottom>
              Full Name
            </Typography>
            <Controller
              name="name"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  slotProps={{
                    input: {
                      className: "bg-gray-300 text-gray-300", // Tailwind applied to input element
                    },
                  }}
                />
              )}
            />
          </div>
          <div className="mt-4">
            <Typography className="text-white" variant="subtitle1" gutterBottom>
              Email
            </Typography>
            <Controller
              name="email"
              defaultValue=""
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  slotProps={{
                    input: {
                      className: "bg-gray-300 text-gray-900", // Tailwind applied to input element
                    },
                  }}
                />
              )}
            />
          </div>
          <div className="mt-4">
            <Typography className="text-white" variant="subtitle1" gutterBottom>
              Password
            </Typography>
            <Controller
              name="password"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  margin="normal"
                  type="password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  slotProps={{
                    input: {
                      className: "bg-gray-300 text-gray-900", // Tailwind applied to input element
                    },
                  }}
                />
              )}
            />
          </div>
          <div className="mt-2 flex justify-center items-center">
            <Button variant="contained" type="submit">
              SignUp
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default withReducer("Signup",signupReducer)(SignUp);
