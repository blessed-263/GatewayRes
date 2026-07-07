import type { AttachmentKind, RepairAttachment } from "@/types/repair";

const MAX_FILE_BYTES = 4 * 1024 * 1024;

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_BYTES) {
      reject(new Error(`${file.name} is too large (max 4 MB for demo storage)`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export async function filesToAttachments(
  repairId: string,
  files: File[],
  kind: AttachmentKind,
  uploadedBy?: string
): Promise<RepairAttachment[]> {
  const results: RepairAttachment[] = [];
  for (const file of files) {
    const url = await readFileAsDataUrl(file);
    results.push({
      id: crypto.randomUUID(),
      repairId,
      url,
      filename: file.name,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      kind,
      uploadedAt: new Date().toISOString(),
      uploadedBy,
    });
  }
  return results;
}
