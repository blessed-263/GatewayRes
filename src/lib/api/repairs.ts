import { apiFetch, apiUrl } from "./client";
import type {
  AttachmentKind,
  CreateRepairInput,
  Repair,
  RepairAttachment,
  RepairComment,
  UpdateRepairInput,
} from "@/types/repair";

export function fetchRepairs() {
  return apiFetch<Repair[]>("/repairs");
}

export function fetchRepair(id: string) {
  return apiFetch<Repair>(`/repairs/${id}`);
}

export function createRepair(input: CreateRepairInput) {
  return apiFetch<Repair>("/repairs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function patchRepair(id: string, input: UpdateRepairInput) {
  return apiFetch<Repair>(`/repairs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function deleteRepairApi(id: string) {
  return apiFetch<void>(`/repairs/${id}`, { method: "DELETE" });
}

export async function uploadAttachments(
  repairId: string,
  files: File[],
  kind: AttachmentKind = "report",
  uploadedBy = "Staff"
) {
  const form = new FormData();
  for (const file of files) {
    form.append("files", file);
  }
  form.append("kind", kind);
  form.append("uploadedBy", uploadedBy);

  const res = await fetch(apiUrl(`/repairs/${repairId}/attachments`), {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? "Upload failed");
  }

  return res.json() as Promise<RepairAttachment[]>;
}

export function deleteAttachment(id: string) {
  return apiFetch<void>(`/attachments/${id}`, { method: "DELETE" });
}

export function addComment(repairId: string, author: string, body: string) {
  return apiFetch<RepairComment>(`/repairs/${repairId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ author, body }),
  });
}

export function checkApiHealth() {
  return apiFetch<{ ok: boolean }>("/health");
}
