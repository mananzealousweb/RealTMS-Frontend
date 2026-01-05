import type { TaskPriority } from "../_types";


interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

const PriorityBadge = ({ priority, className = "" }: PriorityBadgeProps) => {
  const styles = {
    low: "bg-blue-100 text-blue-700 border-blue-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    high: "bg-red-100 text-red-700 border-red-200",
  };

  const labels = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[priority]} ${className}`}
    >
      {labels[priority]}
    </span>
  );
};

export default PriorityBadge;
