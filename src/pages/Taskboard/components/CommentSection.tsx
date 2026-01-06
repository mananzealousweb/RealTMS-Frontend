/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Edit, Trash2, MessageCircle } from "lucide-react";
import moment from "moment";
import { toast } from "sonner";

import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";

import type { Comment } from "../_types";
import { useTaskBoard } from "../TaskBoardContext";
import UserAvatar from "./UserAvatar";

interface CommentSectionProps {
  taskId: number;
  initialComments: Comment[];
  currentUserId?: number;
}

const CommentSection = ({
  taskId,
  initialComments,
  currentUserId,
}: CommentSectionProps) => {
  const { addComment, updateComment, deleteComment } = useTaskBoard();

  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const comments = initialComments || [];

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      await addComment(taskId, newComment.trim());
      setNewComment("");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.comment);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editingText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      await updateComment(commentId, editingText.trim());
      cancelEdit();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete comment");
    }
  };

  const canEditComment = (comment: Comment) => {
    if (!comment.created_at) return false;

    const createdAt = new Date(comment.created_at).getTime();
    const now = Date.now();

    const ALLOWED_MINUTES = 5 * 60 * 1000;

    return now - createdAt <= ALLOWED_MINUTES;
  };

  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        Comments ({comments.length})
      </h3>

      {/* Comment List */}
      <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
        {comments.length ? (
          comments.map((comment) => {
            const isOwner = comment.author?.id === currentUserId;

            return (
              <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">
                    <UserAvatar
                      first={comment.author.first_name}
                      last={comment.author.last_name}
                    />
                    {/* {comment.author.first_name} {comment.author.last_name} */}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {moment(comment.created_at).format("MMM DD, HH:mm")}
                    </span>

                    {isOwner && (
                      <>
                        {canEditComment(comment) && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEdit(comment)}
                            className="h-8 w-8 cursor-pointer"
                            title="Edit comment"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="h-8 w-8 cursor-pointer"
                          title="Delete comment"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {editingCommentId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateComment(comment.id)}
                        className="cursor-pointer"
                      >
                        Update
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                        className="cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {comment.comment}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            No comments yet
          </p>
        )}
      </div>

      {/* Add Comment */}
      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          disabled={isSubmitting}
        />
        <Button
          onClick={handleAddComment}
          disabled={isSubmitting || !newComment.trim()}
          size="sm"
          className="cursor-pointer"
        >
          {isSubmitting ? "Adding..." : "Add Comment"}
        </Button>
      </div>
    </div>
  );
};

export default CommentSection;
