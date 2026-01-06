/* eslint-disable @typescript-eslint/no-explicit-any */
import { Plus, Loader2, LogOutIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import TaskColumn from "./components/TaskColumn";
import TaskDetailModal from "./components/TaskDetailModal";
import { useAuth } from "../../providers/AuthProvider";
import { useTaskBoard } from "./TaskBoardContext";
import { useState } from "react";
import TaskFormModal from "./components/TaskFormModal";
import { authService } from "../../services/authService";
import { useNavigate } from "react-router-dom";

const TaskBoard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {
    loading,
    selectedTask,
    selectTask,
    todoTasks,
    inProgressTasks,
    doneTasks,
  } = useTaskBoard();

  const handleTaskClick = (task: any) => {
    selectTask(task);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Board</h1>
          <p className="text-gray-600 mt-1">
            Manage your tasks across different stages
          </p>
        </div>
        <div className="flex items-end gap-1">
          <Button
            onClick={() => setIsFormOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>

          <Button
            onClick={async () => {
              await authService.logout();
              navigate("/login");
            }}
            className="cursor-pointer bg-red-200 text-red-700 hover:bg-red-600 hover:text-white"
          >
            <LogOutIcon className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Task Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        <TaskColumn
          title="To Do"
          status="to_do"
          tasks={todoTasks}
          onTaskClick={handleTaskClick}
          count={todoTasks.length}
        />

        <TaskColumn
          title="In Progress"
          status="in_progress"
          tasks={inProgressTasks}
          onTaskClick={handleTaskClick}
          count={inProgressTasks.length}
        />

        <TaskColumn
          title="Done"
          status="done"
          tasks={doneTasks}
          onTaskClick={handleTaskClick}
          count={doneTasks.length}
        />
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => selectTask(null)}
          currentUserId={user?.id}
        />
      )}

      <TaskFormModal
        key={isFormOpen ? "open" : "closed"}
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        mode="create"
      />
    </div>
  );
};

export default TaskBoard;
