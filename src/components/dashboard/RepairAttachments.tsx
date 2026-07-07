import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AttachmentKind, RepairAttachment } from "@/types/repair";

const kindLabels: Record<AttachmentKind, string> = {
  report: "Report photo",
  before: "Before repair",
  after: "After repair",
  invoice: "Invoice / receipt",
};

interface RepairAttachmentsProps {
  attachments: RepairAttachment[];
  onUpload: (files: File[], kind: AttachmentKind) => Promise<void>;
  onDelete?: (attachmentId: string) => Promise<void>;
  readOnly?: boolean;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function RepairAttachments({
  attachments,
  onUpload,
  onDelete,
  readOnly = false,
}: RepairAttachmentsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<AttachmentKind>("report");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      await onUpload(Array.from(files), kind);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label>Upload type</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as AttachmentKind)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(kindLabels) as AttachmentKind[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {kindLabels[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading…" : "Add files"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
            multiple
            onChange={(e) => void handleFiles(e.target.files)}
          />
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {attachments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No files attached yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {attachments.map((file) => (
            <AttachmentCard
              key={file.id}
              file={file}
              onDelete={onDelete}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AttachmentCard({
  file,
  onDelete,
  readOnly,
}: {
  file: RepairAttachment;
  onDelete?: (id: string) => Promise<void>;
  readOnly?: boolean;
}) {
  const [deleting, setDeleting] = useState(false);
  const isImage = file.mimeType.startsWith("image/");

  return (
    <div className="photo-card overflow-hidden">
      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {isImage ? (
          <img
            src={file.url}
            alt={file.originalName}
            className="aspect-square w-full object-cover"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-muted text-sm font-bold text-muted-foreground">
            {file.mimeType.includes("pdf") ? "PDF" : "DOC"}
          </div>
        )}
      </a>
      <div className="space-y-2 p-3">
        <p className="truncate text-sm font-medium">{file.originalName}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded bg-muted px-1.5 py-0.5">
            {kindLabels[file.kind]}
          </span>
          <span>{formatSize(file.size)}</span>
        </div>
        {!readOnly && onDelete && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            disabled={deleting}
            onClick={() => {
              setDeleting(true);
              void onDelete(file.id).finally(() => setDeleting(false));
            }}
          >
            {deleting ? "Removing…" : "Remove"}
          </Button>
        )}
      </div>
    </div>
  );
}
