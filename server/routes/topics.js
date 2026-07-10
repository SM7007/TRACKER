const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");
const { recomputeCourse } = require("../utils/progress");

const router = express.Router();
router.use(requireAuth);

const titleSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
});

async function getOwnedCourse(courseId, userId) {
  return prisma.course.findFirst({ where: { id: courseId, userId } });
}

async function getTopicWithOwnedCourse(topicId, userId) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { course: true },
  });
  if (!topic || topic.course.userId !== userId) return null;
  return topic;
}

// POST /api/courses/:courseId/topics
router.post("/courses/:courseId/topics", async (req, res) => {
  const parsed = titleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const course = await getOwnedCourse(req.params.courseId, req.userId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const result = await prisma.$transaction(async (tx) => {
      const last = await tx.topic.findFirst({
        where: { courseId: course.id },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      const topic = await tx.topic.create({
        data: {
          title: parsed.data.title,
          position: (last?.position ?? -1) + 1,
          courseId: course.id,
        },
        include: { subtopics: true },
      });

      // A brand new empty topic can never make the course "complete", but
      // it CAN flip a previously-complete course back to incomplete.
      const updatedCourse = await recomputeCourse(tx, course.id);

      return { topic, course: updatedCourse };
    });

    res.status(201).json(result);
  } catch (err) {
    console.error("create topic error:", err);
    res.status(500).json({ error: "Could not create topic" });
  }
});

// PUT /api/topics/:id - rename
router.put("/topics/:id", async (req, res) => {
  const parsed = titleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const topic = await getTopicWithOwnedCourse(req.params.id, req.userId);
    if (!topic) return res.status(404).json({ error: "Topic not found" });

    const updated = await prisma.topic.update({
      where: { id: topic.id },
      data: { title: parsed.data.title },
    });

    res.json(updated);
  } catch (err) {
    console.error("update topic error:", err);
    res.status(500).json({ error: "Could not update topic" });
  }
});

// DELETE /api/topics/:id
router.delete("/topics/:id", async (req, res) => {
  try {
    const topic = await getTopicWithOwnedCourse(req.params.id, req.userId);
    if (!topic) return res.status(404).json({ error: "Topic not found" });

    const course = await prisma.$transaction(async (tx) => {
      await tx.topic.delete({ where: { id: topic.id } });
      return recomputeCourse(tx, topic.courseId);
    });

    res.json({ deleted: true, course });
  } catch (err) {
    console.error("delete topic error:", err);
    res.status(500).json({ error: "Could not delete topic" });
  }
});

module.exports = router;
