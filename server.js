import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;
const STORAGE_TOKEN = process.env.STORAGE_TOKEN;
const DATA_DIR = "/app/data";

app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "Soapx Storage",
  });
});

// List stored files
app.get("/files", (req, res) => {
  if (req.headers.authorization !== `Bearer ${STORAGE_TOKEN}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const files = fs.existsSync(DATA_DIR)
    ? fs.readdirSync(DATA_DIR)
    : [];

  res.json(files);
});

// Download a file
app.get("/files/:name", (req, res) => {
  if (req.headers.authorization !== `Bearer ${STORAGE_TOKEN}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const file = path.join(DATA_DIR, path.basename(req.params.name));

  if (!fs.existsSync(file)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.sendFile(file);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Soapx Storage running on port ${PORT}`);
});