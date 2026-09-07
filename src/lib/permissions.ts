import { UserRole } from "@/types";

export type PermissionAction =
  | "finance:view"
  | "finance:create_expense"
  | "finance:approve_expense"
  | "finance:export_cashbook"
  | "donations:collect"
  | "donations:view_all"
  | "members:manage"
  | "members:issue_id_card"
  | "festival:manage_schedule"
  | "inventory:manage"
  | "volunteers:assign_duty"
  | "volunteers:mark_attendance"
  | "audit_log:view"
  | "notices:broadcast"
  | "settings:manage";

const PERMISSIONS_MATRIX: Record<UserRole, PermissionAction[]> = {
  SUPER_ADMIN: [
    "finance:view",
    "finance:create_expense",
    "finance:approve_expense",
    "finance:export_cashbook",
    "donations:collect",
    "donations:view_all",
    "members:manage",
    "members:issue_id_card",
    "festival:manage_schedule",
    "inventory:manage",
    "volunteers:assign_duty",
    "volunteers:mark_attendance",
    "audit_log:view",
    "notices:broadcast",
    "settings:manage",
  ],
  PRESIDENT: [
    "finance:view",
    "finance:create_expense",
    "finance:approve_expense",
    "finance:export_cashbook",
    "donations:collect",
    "donations:view_all",
    "members:manage",
    "members:issue_id_card",
    "festival:manage_schedule",
    "inventory:manage",
    "volunteers:assign_duty",
    "volunteers:mark_attendance",
    "audit_log:view",
    "notices:broadcast",
    "settings:manage",
  ],
  TREASURER: [
    "finance:view",
    "finance:create_expense",
    "finance:approve_expense",
    "finance:export_cashbook",
    "donations:collect",
    "donations:view_all",
    "audit_log:view",
  ],
  SECRETARY: [
    "members:manage",
    "members:issue_id_card",
    "festival:manage_schedule",
    "volunteers:assign_duty",
    "volunteers:mark_attendance",
    "notices:broadcast",
    "donations:collect",
    "donations:view_all",
  ],
  EVENT_INCHARGE: [
    "festival:manage_schedule",
    "inventory:manage",
    "volunteers:assign_duty",
    "volunteers:mark_attendance",
    "donations:collect",
    "finance:create_expense",
  ],
  COMMITTEE_MEMBER: [
    "festival:manage_schedule",
    "inventory:manage",
    "volunteers:assign_duty",
    "volunteers:mark_attendance",
    "donations:collect",
    "donations:view_all",
  ],
  VOLUNTEER: [
    "volunteers:mark_attendance",
  ],
  AUDITOR: [
    "finance:view",
    "finance:export_cashbook",
    "donations:view_all",
    "audit_log:view",
  ],
  MEMBER: [],
  GUEST: [],
};

export function hasPermission(
  role: UserRole | string | undefined,
  action: PermissionAction | string,
  ..._rest: unknown[]
): boolean {
  if (!role) return false;
  const userRole = role as UserRole;
  if (userRole === "SUPER_ADMIN") return true;

  const allowed = (PERMISSIONS_MATRIX as any)[userRole] || [];
  return allowed.includes(action as PermissionAction);
}

export function hasAnyPermission(
  role: UserRole | string | undefined,
  actions: (PermissionAction | string)[]
): boolean {
  return actions.some((act) => hasPermission(role, act));
}
