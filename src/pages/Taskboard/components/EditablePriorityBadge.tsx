import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

import type { TaskPriority } from "../_types";
import { useTaskBoard } from "../TaskBoardContext";
import { Button } from "../../../components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";


interface Props {
  taskId: number;
  priority: TaskPriority;
  disabled?: boolean;
}

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "bg-blue-100 text-blue-700 border-blue-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high: "bg-red-100 text-red-700 border-red-200",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

const EditablePriorityBadge = ({ taskId, priority, disabled }: Props) => {
  const { updateTask } = useTaskBoard();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const changePriority = async (newPriority: TaskPriority) => {
    if (newPriority === priority) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("priority", newPriority);

      await updateTask(taskId, formData);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-sm font-medium border cursor-pointer transition ${
            PRIORITY_STYLES[priority]
          } ${disabled ? "opacity-80 cursor-not-allowed" : ""}`}
        >
          {PRIORITY_LABELS[priority]}
          {!disabled && <ChevronDown className="h-3 w-3" />}
        </button>
      </PopoverTrigger>

      {!disabled && (
        <PopoverContent className="w-36 p-1">
          {PRIORITIES.map((p) => (
            <Button
              key={p}
              variant="ghost"
              size="sm"
              disabled={loading}
              onClick={() => changePriority(p)}
              className="w-full justify-between"
            >
              {PRIORITY_LABELS[p]}
              {p === priority && <Check className="h-4 w-4" />}
            </Button>
          ))}
        </PopoverContent>
      )}
    </Popover>
  );
};

export default EditablePriorityBadge;
