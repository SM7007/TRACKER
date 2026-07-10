require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const topicRoutes = require("./routes/topics");
const subtopicRoutes = require("./routes/subtopics");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
// topics & subtopics routers each define their own full paths
// (e.g. /courses/:courseId/topics, /topics/:id) so they're mounted at /api
app.use("/api", topicRoutes);
app.use("/api", subtopicRoutes);

// ---- Serve the built React app (created by `npm run build` in /frontend,
// which outputs straight into ./public) so this single server handles
// both the API and the UI. ----
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

// Any non-API route falls back to index.html so React Router can handle it.
app.get(/^(?!\/api).*/, (req, res, next) => {
  res.sendFile(path.join(publicDir, "index.html"), (err) => {
    if (err) next(err);
  });
});

// 404 fallback for unmatched /api/* routes
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Central error handler (catches anything thrown outside try/catch)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong" });
});

const PORT = process.env.PORT || 4000;

// Only bind to a port when this file is run directly (e.g. `node server/index.js`
// or `npm run dev:server`). On Vercel, this file is instead `require()`'d by
// /api/index.js, which just needs the `app` export — it must NOT call
// app.listen(), since Vercel's serverless runtime manages the actual server.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
