import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { seedRepairs } from "./seed-data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "gateway.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS repairs (
    id TEXT PRIMARY KEY,
    unit TEXT NOT NULL,
    building TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT NOT NULL DEFAULT 'medium',
    reported_at TEXT NOT NULL,
    completed_at TEXT,
    reported_by TEXT NOT NULL,
    resident_phone TEXT,
    assigned_to TEXT,
    scheduled_for TEXT,
    estimated_cost REAL,
    actual_cost REAL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS attachments (
    id TEXT PRIMARY KEY,
    repair_id TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    kind TEXT NOT NULL DEFAULT 'report',
    uploaded_at TEXT NOT NULL,
    uploaded_by TEXT,
    FOREIGN KEY (repair_id) REFERENCES repairs(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    repair_id TEXT NOT NULL,
    author TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (repair_id) REFERENCES repairs(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id TEXT PRIMARY KEY,
    repair_id TEXT NOT NULL,
    action TEXT NOT NULL,
    detail TEXT,
    actor TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (repair_id) REFERENCES repairs(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_repairs_status ON repairs(status);
  CREATE INDEX IF NOT EXISTS idx_repairs_scheduled ON repairs(scheduled_for);
  CREATE INDEX IF NOT EXISTS idx_attachments_repair ON attachments(repair_id);
  CREATE INDEX IF NOT EXISTS idx_comments_repair ON comments(repair_id);
`);

function rowToRepair(row, extras = {}) {
  return {
    id: row.id,
    unit: row.unit,
    building: row.building,
    title: row.title,
    description: row.description,
    category: row.category,
    status: row.status,
    priority: row.priority,
    reportedAt: row.reported_at,
    completedAt: row.completed_at ?? undefined,
    reportedBy: row.reported_by,
    residentPhone: row.resident_phone ?? undefined,
    assignedTo: row.assigned_to ?? undefined,
    scheduledFor: row.scheduled_for ?? undefined,
    estimated_cost: row.estimated_cost ?? undefined,
    actual_cost: row.actual_cost ?? undefined,
    updatedAt: row.updated_at,
    ...extras,
  };
}

function rowToAttachment(row) {
  return {
    id: row.id,
    repairId: row.repair_id,
    url: `/api/uploads/${row.stored_name}`,
    filename: row.stored_name,
    originalName: row.original_name,
    mimeType: row.mime_type,
    size: row.size,
    kind: row.kind,
    uploadedAt: row.uploaded_at,
    uploadedBy: row.uploaded_by ?? undefined,
  };
}

function rowToComment(row) {
  return {
    id: row.id,
    repairId: row.repair_id,
    author: row.author,
    body: row.body,
    createdAt: row.created_at,
  };
}

function rowToActivity(row) {
  return {
    id: row.id,
    repairId: row.repair_id,
    action: row.action,
    detail: row.detail ?? undefined,
    actor: row.actor ?? undefined,
    createdAt: row.created_at,
  };
}

function logActivity(repairId, action, detail, actor) {
  db.prepare(
    `INSERT INTO activity_log (id, repair_id, action, detail, actor, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(randomUUID(), repairId, action, detail ?? null, actor ?? null, new Date().toISOString());
}

function seedIfEmpty() {
  const count = db.prepare("SELECT COUNT(*) AS c FROM repairs").get().c;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO repairs (
      id, unit, building, title, description, category, status, priority,
      reported_at, completed_at, reported_by, assigned_to, scheduled_for,
      estimated_cost, actual_cost, updated_at
    ) VALUES (
      @id, @unit, @building, @title, @description, @category, @status, @priority,
      @reportedAt, @completedAt, @reportedBy, @assignedTo, @scheduledFor,
      @estimated_cost, @actual_cost, @updatedAt
    )
  `);

  const tx = db.transaction((rows) => {
    for (const r of rows) {
      insert.run({
        id: r.id,
        unit: r.unit,
        building: r.building,
        title: r.title,
        description: r.description,
        category: r.category,
        status: r.status,
        priority: r.priority,
        reportedAt: r.reportedAt,
        completedAt: r.completedAt ?? null,
        reportedBy: r.reportedBy,
        assignedTo: r.assignedTo ?? null,
        scheduledFor: r.scheduledFor ?? null,
        estimated_cost: r.estimated_cost ?? null,
        actual_cost: r.actual_cost ?? null,
        updatedAt: r.reportedAt,
      });
      logActivity(r.id, "created", `Repair ${r.id} logged`, r.reportedBy);
    }
  });

  tx(seedRepairs);
}

seedIfEmpty();

export function listRepairs() {
  const rows = db
    .prepare(
      `SELECT r.*,
        (SELECT COUNT(*) FROM attachments a WHERE a.repair_id = r.id) AS attachment_count,
        (SELECT COUNT(*) FROM comments c WHERE c.repair_id = r.id) AS comment_count
       FROM repairs r
       ORDER BY r.reported_at DESC`
    )
    .all();

  return rows.map((row) =>
    rowToRepair(row, {
      attachmentCount: row.attachment_count,
      commentCount: row.comment_count,
    })
  );
}

export function getRepair(id) {
  const row = db.prepare("SELECT * FROM repairs WHERE id = ?").get(id);
  if (!row) return null;

  const attachments = db
    .prepare("SELECT * FROM attachments WHERE repair_id = ? ORDER BY uploaded_at DESC")
    .all(id)
    .map(rowToAttachment);

  const comments = db
    .prepare("SELECT * FROM comments WHERE repair_id = ? ORDER BY created_at ASC")
    .all(id)
    .map(rowToComment);

  const activity = db
    .prepare("SELECT * FROM activity_log WHERE repair_id = ? ORDER BY created_at DESC")
    .all(id)
    .map(rowToActivity);

  return rowToRepair(row, { attachments, comments, activity });
}

export function nextRepairId() {
  const year = new Date().getFullYear();
  const prefix = `GR-${year}-`;
  const row = db
    .prepare("SELECT id FROM repairs WHERE id LIKE ? ORDER BY id DESC LIMIT 1")
    .get(`${prefix}%`);
  const seq = row ? parseInt(row.id.split("-").pop(), 10) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

export function createRepair(input, actor) {
  const id = nextRepairId();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO repairs (
      id, unit, building, title, description, category, status, priority,
      reported_at, reported_by, resident_phone, estimated_cost, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.unit,
    input.building,
    input.title,
    input.description,
    input.category,
    input.priority,
    now,
    input.reportedBy,
    input.residentPhone ?? null,
    input.estimated_cost ?? null,
    now
  );

  logActivity(id, "created", input.title, actor ?? input.reportedBy);
  return getRepair(id);
}

export function updateRepair(id, patch, actor = "Staff") {
  const existing = db.prepare("SELECT * FROM repairs WHERE id = ?").get(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const fields = [];
  const values = [];

  const map = {
    unit: "unit",
    building: "building",
    title: "title",
    description: "description",
    category: "category",
    status: "status",
    priority: "priority",
    reportedBy: "reported_by",
    residentPhone: "resident_phone",
    assignedTo: "assigned_to",
    scheduledFor: "scheduled_for",
    estimated_cost: "estimated_cost",
    actual_cost: "actual_cost",
    completedAt: "completed_at",
  };

  for (const [key, col] of Object.entries(map)) {
    if (patch[key] !== undefined) {
      fields.push(`${col} = ?`);
      values.push(patch[key] === "" ? null : patch[key]);
    }
  }

  if (patch.status === "completed" && !patch.completedAt && !existing.completed_at) {
    fields.push("completed_at = ?");
    values.push(now);
  }

  if (patch.status && patch.status !== "completed" && existing.completed_at) {
    fields.push("completed_at = ?");
    values.push(null);
  }

  if (fields.length === 0) return getRepair(id);

  fields.push("updated_at = ?");
  values.push(now);
  values.push(id);

  db.prepare(`UPDATE repairs SET ${fields.join(", ")} WHERE id = ?`).run(...values);

  if (patch.status && patch.status !== existing.status) {
    logActivity(id, "status_changed", `${existing.status} → ${patch.status}`, actor);
  }
  if (patch.assignedTo !== undefined && patch.assignedTo !== existing.assigned_to) {
    logActivity(
      id,
      "assigned",
      patch.assignedTo ? `Assigned to ${patch.assignedTo}` : "Unassigned",
      actor
    );
  }
  if (patch.scheduledFor !== undefined && patch.scheduledFor !== existing.scheduled_for) {
    logActivity(
      id,
      "scheduled",
      patch.scheduledFor ? `Scheduled for ${patch.scheduledFor}` : "Schedule cleared",
      actor
    );
  }
  if (patch.actual_cost !== undefined && patch.actual_cost !== existing.actual_cost) {
    logActivity(id, "cost_updated", `Actual cost: R${patch.actual_cost}`, actor);
  }

  return getRepair(id);
}

export function deleteRepair(id) {
  const attachments = db
    .prepare("SELECT stored_name FROM attachments WHERE repair_id = ?")
    .all(id);
  const result = db.prepare("DELETE FROM repairs WHERE id = ?").run(id);
  return { changes: result.changes, attachments };
}

export function addAttachment(repairId, file, kind = "report", uploadedBy) {
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO attachments (id, repair_id, stored_name, original_name, mime_type, size, kind, uploaded_at, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    repairId,
    file.filename,
    file.originalname,
    file.mimetype,
    file.size,
    kind,
    now,
    uploadedBy ?? null
  );

  logActivity(repairId, "attachment_added", file.originalname, uploadedBy);
  return rowToAttachment(
    db.prepare("SELECT * FROM attachments WHERE id = ?").get(id)
  );
}

export function getAttachment(id) {
  return db.prepare("SELECT * FROM attachments WHERE id = ?").get(id);
}

export function removeAttachment(id) {
  const row = db.prepare("SELECT * FROM attachments WHERE id = ?").get(id);
  if (!row) return null;
  db.prepare("DELETE FROM attachments WHERE id = ?").run(id);
  logActivity(row.repair_id, "attachment_removed", row.original_name);
  return row;
}

export function addComment(repairId, author, body) {
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO comments (id, repair_id, author, body, created_at) VALUES (?, ?, ?, ?, ?)`
  ).run(id, repairId, author, body, now);
  logActivity(repairId, "comment_added", body.slice(0, 80), author);
  return rowToComment(db.prepare("SELECT * FROM comments WHERE id = ?").get(id));
}

export { db, dbPath };
