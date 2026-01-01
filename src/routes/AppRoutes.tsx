import { Routes, Route, Navigate } from "react-router-dom";
// import Login from "../pages/Login";
// import Register from "../pages/Register";
// import TaskBoard from "../pages/TaskBoard";

const AppRoutes = () => {
  const isAuth = !!localStorage.getItem("access_token");

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={isAuth ? <TaskBoard /> : <Navigate to="/login" />}
      />
    </Routes>
  );
};

export default AppRoutes;
