import type { PartRequestStatus } from "@/types/repair";

export const partRequestStatusLabels: Record<PartRequestStatus, string> = {
  pending: "Pending",
  ordered: "Ordered",
  received: "Received",
  cancelled: "Cancelled",
};

export function partRequestBadgeVariant(
  status: PartRequestStatus
): "default" | "secondary" | "warning" | "success" | "muted" | "destructive" {
  switch (status) {
    case "pending":
      return "warning";
    case "ordered":
      return "default";
    case "received":
      return "success";
    case "cancelled":
      return "muted";
  }
}
