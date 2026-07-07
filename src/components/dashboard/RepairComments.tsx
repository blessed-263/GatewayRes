import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { RepairComment } from "@/types/repair";

interface RepairCommentsProps {
  comments: RepairComment[];
  onAdd: (author: string, body: string) => Promise<void>;
  defaultAuthor?: string;
  readOnly?: boolean;
  highlightSupervisorNotes?: boolean;
}

export function RepairComments({
  comments,
  onAdd,
  defaultAuthor = "Staff",
  readOnly = false,
  highlightSupervisorNotes = false,
}: RepairCommentsProps) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await onAdd(defaultAuthor.trim(), body.trim());
      setBody("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {!readOnly && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4"
        >
          <div className="space-y-2">
            <Label htmlFor="comment-body">Add note</Label>
            <Textarea
              id="comment-body"
              placeholder="Add a note…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? "Saving…" : "Add note"}
          </Button>
        </form>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => {
            const isSupervisorNote =
              highlightSupervisorNotes && comment.isSupervisor === true;
            return (
              <li
                key={comment.id}
                className={cn(
                  "rounded-xl border px-4 py-3",
                  isSupervisorNote
                    ? "border-red-300 bg-red-50"
                    : "border-border/60 bg-card"
                )}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span
                    className={cn(
                      "font-medium",
                      isSupervisorNote && "text-red-700"
                    )}
                  >
                    {comment.author}
                    {isSupervisorNote ? " · Supervisor" : ""}
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      isSupervisorNote ? "text-red-600/80" : "text-muted-foreground"
                    )}
                  >
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-2 whitespace-pre-wrap text-sm",
                    isSupervisorNote ? "text-red-800" : "text-muted-foreground"
                  )}
                >
                  {comment.body}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
