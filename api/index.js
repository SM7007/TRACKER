// Vercel entrypoint. vercel.json rewrites every /api/* request here, and
// the Express app (unchanged, from server/index.js) handles the routing
// internally — /api/auth, /api/courses, /api/topics, /api/subtopics, etc.
module.exports = require("../server/index.js");
