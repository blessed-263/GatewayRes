import type { DemoUser, UserRole } from "@/types/auth";

export const supervisorDemo: DemoUser = {
  id: "u-thabo",
  username: "thabo",
  password: "demo",
  name: "Thabo M.",
  role: "supervisor",
  subtitle: "Senior supervisor · full dashboard access",
};

export const maintenanceDemo: DemoUser = {
  id: "u-sipho",
  username: "sipho",
  password: "demo",
  name: "Sipho N.",
  role: "worker",
  assigneeName: "Sipho N.",
  subtitle: "Senior technician · assigned jobs only",
};

export const demoUsers: DemoUser[] = [supervisorDemo, maintenanceDemo];

export function demoUserForRole(role: UserRole): DemoUser {
  return role === "worker" ? maintenanceDemo : supervisorDemo;
}

export function findDemoUser(username: string, password: string) {
  const key = username.trim().toLowerCase();
  return demoUsers.find(
    (user) => user.username.toLowerCase() === key && user.password === password
  );
}
