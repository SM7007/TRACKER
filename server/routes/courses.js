const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const courseSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(500).optional().nullable(),
});

// GET /api/courses - full nested tree for the dashboard
router.get("/", async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { userId: req.userId },
      orderBy: { position: "asc" },
      include: {
        topics: {
          orderBy: { position: "asc" },
          include: {
            subtopics: { orderBy: { position: "asc" } },
          },
        },
      },
    });
    res.json(courses);
  } catch (err) {
    console.error("list courses error:", err);
    res.status(500).json({ error: "Could not load courses" });
  }
});

// POST /api/courses
router.post("/", async (req, res) => {
  const parsed = courseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const last = await prisma.course.findFirst({
      where: { userId: req.userId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const course = await prisma.course.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        position: (last?.position ?? -1) + 1,
        userId: req.userId,
      },
      include: { topics: { include: { subtopics: true } } },
    });

    res.status(201).json(course);
  } catch (err) {
    console.error("create course error:", err);
    res.status(500).json({ error: "Could not create course" });
  }
});

// PUT /api/courses/:id - edit title/description
router.put("/:id", async (req, res) => {
  const parsed = courseSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const { count } = await prisma.course.updateMany({
      where: { id: req.params.id, userId: req.userId },
      data: parsed.data,
    });

    if (count === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    res.json(course);
  } catch (err) {
    console.error("update course error:", err);
    res.status(500).json({ error: "Could not update course" });
  }
});

// DELETE /api/courses/:id
router.delete("/:id", async (req, res) => {
  try {
    const { count } = await prisma.course.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    });

    if (count === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("delete course error:", err);
    res.status(500).json({ error: "Could not delete course" });
  }
});

module.exports = router;
