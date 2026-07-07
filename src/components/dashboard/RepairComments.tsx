import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import type { RepairComment } from "@/types/repair";

interface RepairCommentsProps {
  comments: RepairComment[];
  onAdd: (author: string, body: string) => Promise<void>;
  defaultAuthor?: string;
  readOnly?: boolean;
}

export function RepairComments({
  comments,
  onAdd,
  defaultAuthor = "Staff",
  readOnly = false,
}: RepairCommentsProps) {
  const [author, setAuthor] = useState(defaultAuthor);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await onAdd(author.trim(), body.trim());
      setBody("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {!readOnly && (
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="comment-author">Your name</Label>
            <Input
              id="comment-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="comment-body">Note</Label>
            <Textarea
              id="comment-body"
              placeholder="Add a technician note or update for the team…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>
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
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-xl border border-border/60 bg-card px-4 py-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium">{comment.author}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {comment.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
