const supervisorPrefixes = [
  "/dashboard",
  "/tasks",
  "/calendar",
  "/analytics",
  "/team",
];
export function loginPathForProtectedPath(pathname: string): string {
  if (pathname.startsWith("/my-jobs")) {
    return "/login/maintenance";
  }

  if (supervisorPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return "/login/supervisor";
  }

  return "/";
}

export function isStaffLoginPath(pathname: string): boolean {
  return pathname.startsWith("/login");
}
