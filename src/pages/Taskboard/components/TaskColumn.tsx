
import type { Task, TaskStatus } from "../_types";
import TaskCard from "./TaskCard";

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  count: number;
}

const TaskColumn = ({
  title,
  status,
  tasks,
  onTaskClick,
  count,
}: TaskColumnProps) => {
  const statusColors = {
    to_do: "bg-slate-100 border-slate-300",
    in_progress: "bg-blue-50 border-blue-300",
    done: "bg-green-50 border-green-300",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div
        className={`p-4 rounded-t-lg border-b-2 ${statusColors[status]} sticky top-0 z-10`}
      >
        <h2 className="font-semibold text-gray-700 flex items-center justify-between">
          <span>{title}</span>
          <span className="bg-white px-2 py-1 rounded-full text-sm">
            {count}
          </span>
        </h2>
      </div>

      {/* Task Cards */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50">
        {tasks.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-8">No tasks yet</p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))
        )}
      </div>
    </div>
  );
};

export default TaskColumn;
