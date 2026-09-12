import { getDb, schema } from "@/db";

export interface AuditActionParams {
  actorMemberId: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "REJECT" | "EXPORT" | "ROLE_CHANGE" | "LOGIN";
  entity: "donations" | "transactions" | "expense_approvals" | "members" | "inventory" | "roles" | "system";
  entityId: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ipAddress?: string;
}

export async function logAuditAction(params: AuditActionParams): Promise<void> {
  const logItem = {
    id: `audit-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    actorMemberId: params.actorMemberId,
    action: params.action,
    entity: params.entity,
    entityId: params.entityId,
    oldValue: params.oldValue || null,
    newValue: params.newValue || null,
    ipAddress: params.ipAddress || "127.0.0.1",
    timestamp: new Date(),
  };

  console.log(`[AUDIT LOG] ${params.action} on ${params.entity}:${params.entityId} by ${params.actorMemberId}`);

  try {
    const db = getDb();
    await db.insert(schema.auditLog).values(logItem);
  } catch (err) {
    // Audit log failure must never crash the main operation
    console.warn("[Audit Log] Database write error:", err);
  }
}
