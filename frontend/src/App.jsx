import React, { Suspense } from "react"; // <-- import React here
import { Routes, Route, Navigate } from "react-router-dom";
import Loading from "./components/Loading";

const SignUp = React.lazy(() => import("./pages/Signup/SignUp"));
const Login = React.lazy(() => import("./pages/Login/Login"));
function App() {
  return (
    <div className="text-red-400">
      <Suspense fallback={<Loading/>}>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          {/* default redirect if no route matches */}
          <Route path="*" element={<Navigate to="/signup" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
