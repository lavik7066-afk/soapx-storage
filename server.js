import express from "express";
import fs from "fs";
import path from "path";

const app = express();

const PORT = process.env.PORT || 3000;
const STORAGE_TOKEN = process.env.STORAGE_TOKEN;
const DATA_DIR = "/app/data";

fs.mkdirSync(DATA_DIR, { recursive: true });

app.use(express.json({ limit: "50mb" }));

function authorized(req) {
  return req.headers.authorization === `Bearer ${STORAGE_TOKEN}`;
}

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "Soapx Storage",
  });
});

// List files
app.get("/files", (req, res) => {
  if (!authorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const files = fs.readdirSync(DATA_DIR);
  res.json(files);
});

// Download file
app.get("/files/:name", (req, res) => {
  if (!authorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const file = path.join(DATA_DIR, path.basename(req.params.name));

  if (!fs.existsSync(file)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.sendFile(file);
});

// Upload file
app.post("/files/:name", (req, res) => {
  if (!authorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const filename = path.basename(req.params.name);
  const file = path.join(DATA_DIR, filename);

  try {
    const data = Buffer.from(req.body.data, "base64");

    fs.writeFileSync(file, data);

    res.json({
      success: true,
      file: filename,
      size: data.length,
    });
  } catch (error) {
    res.status(400).json({
      error: "Invalid file data",
    });
  }
});

// Delete file
app.delete("/files/:name", (req, res) => {
  if (!authorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const file = path.join(DATA_DIR, path.basename(req.params.name));

  if (!fs.existsSync(file)) {
    return res.status(404).json({ error: "File not found" });
  }

  fs.unlinkSync(file);

  res.json({
    success: true,
    deleted: req.params.name,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Soapx Storage running on port ${PORT}`);
});