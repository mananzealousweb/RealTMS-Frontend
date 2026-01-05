// routes/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import TaskBoard from "../pages/Taskboard/TaskBoard";
import RequireGuest from "./navigators/RequireGuest";
import RequireAuth from "./navigators/RequireAuth";
import { TaskBoardProvider } from "../pages/Taskboard/TaskBoardContext";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Guest Routes - Only accessible when NOT logged in */}
      <Route element={<RequireGuest />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Routes - Only accessible when logged in */}
      <Route element={<RequireAuth />}>
        <Route
          path="/"
          element={
            <TaskBoardProvider>
              <TaskBoard />
            </TaskBoardProvider>
          }
        />
        {/* Add more protected routes here */}
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
