import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  addAttachment,
  addComment,
  createRepair,
  db,
  deleteRepair,
  getRepair,
  listRepairs,
  removeAttachment,
  updateRepair,
} from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "uploads");
const distDir = path.join(__dirname, "..", "dist");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => {
    const allowed =
      /^image\//.test(file.mimetype) ||
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    cb(allowed ? null : new Error("Only images, PDF, and Word files are allowed"), allowed);
  },
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "gateway-maintenance-api" });
});

app.get("/api/team", (_req, res) => {
  res.json([
    { id: "1", name: "Sipho N.", role: "Senior Technician", active: true },
    { id: "2", name: "Maintenance Team A", role: "General Repairs", active: true },
    { id: "3", name: "Maintenance Team B", role: "General Repairs", active: true },
    { id: "4", name: "External Pest Co.", role: "Contractor", active: true },
    { id: "5", name: "Thabo M.", role: "Supervisor", active: true },
  ]);
});

app.get("/api/repairs", (_req, res) => {
  res.json(listRepairs());
});

app.get("/api/repairs/:id", (req, res) => {
  const repair = getRepair(req.params.id);
  if (!repair) return res.status(404).json({ error: "Repair not found" });
  res.json(repair);
});

app.post("/api/repairs", (req, res) => {
  const { unit, building, title, description, category, priority, reportedBy } =
    req.body ?? {};

  if (!unit || !building || !title || !description || !category || !priority || !reportedBy) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const repair = createRepair(req.body, req.body.reportedBy);
  res.status(201).json(repair);
});

app.patch("/api/repairs/:id", (req, res) => {
  const repair = updateRepair(req.params.id, req.body, req.body.actor ?? "Staff");
  if (!repair) return res.status(404).json({ error: "Repair not found" });
  res.json(repair);
});

app.delete("/api/repairs/:id", (req, res) => {
  const { changes, attachments } = deleteRepair(req.params.id);
  if (!changes) return res.status(404).json({ error: "Repair not found" });

  for (const a of attachments) {
    const filePath = path.join(uploadsDir, a.stored_name);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  res.status(204).end();
});

app.post("/api/repairs/:id/attachments", (req, res, next) => {
  upload.array("files", 8)(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, (req, res) => {
  const repair = getRepair(req.params.id);
  if (!repair) return res.status(404).json({ error: "Repair not found" });

  const files = req.files ?? [];
  if (files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const kind = req.body.kind ?? "report";
  const uploadedBy = req.body.uploadedBy ?? "Staff";
  const created = files.map((file) =>
    addAttachment(req.params.id, file, kind, uploadedBy)
  );

  res.status(201).json(created);
});

app.delete("/api/attachments/:id", (req, res) => {
  const row = removeAttachment(req.params.id);
  if (!row) return res.status(404).json({ error: "Attachment not found" });

  const filePath = path.join(uploadsDir, row.stored_name);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  res.status(204).end();
});

app.post("/api/repairs/:id/comments", (req, res) => {
  const { author, body } = req.body ?? {};
  if (!author?.trim() || !body?.trim()) {
    return res.status(400).json({ error: "Author and body are required" });
  }

  const repair = getRepair(req.params.id);
  if (!repair) return res.status(404).json({ error: "Repair not found" });

  const comment = addComment(req.params.id, author.trim(), body.trim());
  res.status(201).json(comment);
});

app.get("/api/uploads/:filename", (req, res) => {
  const attachment = db
    .prepare("SELECT * FROM attachments WHERE stored_name = ?")
    .get(req.params.filename);
  const filePath = path.join(uploadsDir, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  if (attachment?.mime_type) {
    res.type(attachment.mime_type);
  }

  res.sendFile(filePath);
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message ?? "Internal server error" });
});

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Gateway maintenance API running on http://localhost:${PORT}`);
});
