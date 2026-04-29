import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDatabase } from "./db.js";
import formRoutes from "./routes/formRoutes.js";
import responseRoutes from "./routes/responseRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandlers.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendBuildPath = path.resolve(__dirname, "..", "build");
const corsAllowAll = process.env.CORS_ALLOW_ALL === "true";
const normalizeOrigin = (origin) => origin.replace(/\/$/, "");
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    console.log("Request Origin:", origin || "<no-origin>");

    if (corsAllowAll) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = origin ? normalizeOrigin(origin) : origin;

    if (!normalizedOrigin || allowedOrigins.length === 0 || allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "nocode-form-backend",
    message: "Backend is running. Use /api/health to verify API health.",
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: "mysql" });
});

app.use("/api/forms", formRoutes);
app.use("/api/responses", responseRoutes);

if (process.env.NODE_ENV === "production" && fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));

  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendBuildPath, "index.html"));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
  });
});