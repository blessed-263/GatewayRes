export type UserRole = "supervisor" | "worker";

export interface DemoUser {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  /** Matches repair `assignedTo` for workers */
  assigneeName?: string;
  subtitle?: string;
}

export interface AuthSession {
  userId: string;
  username: string;
  name: string;
  role: UserRole;
  assigneeName?: string;
}
