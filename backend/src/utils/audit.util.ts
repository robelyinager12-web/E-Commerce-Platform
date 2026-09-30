import { query } from "../config/database";

/**
 * Best-effort audit trail for admin/moderation actions. Never throws:
 * a failed audit write should not block the real action it's logging.
 */
export async function logAudit(input: {
  userId: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        input.userId,
        input.action,
        input.entityType ?? null,
        input.entityId ?? null,
        input.metadata ? JSON.stringify(input.metadata) : null,
      ]
    );
  } catch {
    // ignore — audit logging must never break the calling action
  }
}