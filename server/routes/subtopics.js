const express = require("express");
const { z } = require("zod");
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");
const { recomputeTopicAndCourse } = require("../utils/progress");

const router = express.Router();
router.use(requireAuth);

const titleSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160),
});

async function getOwnedTopic(topicId, userId) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { course: true },
  });
  if (!topic || topic.course.userId !== userId) return null;
  return topic;
}

async function getSubtopicWithOwnedTopic(subtopicId, userId) {
  const subtopic = await prisma.subtopic.findUnique({
    where: { id: subtopicId },
    include: { topic: { include: { course: true } } },
  });
  if (!subtopic || subtopic.topic.course.userId !== userId) return null;
  return subtopic;
}

// POST /api/topics/:topicId/subtopics
router.post("/topics/:topicId/subtopics", async (req, res) => {
  const parsed = titleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const topic = await getOwnedTopic(req.params.topicId, req.userId);
    if (!topic) return res.status(404).json({ error: "Topic not found" });

    const result = await prisma.$transaction(async (tx) => {
      const last = await tx.subtopic.findFirst({
        where: { topicId: topic.id },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      const subtopic = await tx.subtopic.create({
        data: {
          title: parsed.data.title,
          position: (last?.position ?? -1) + 1,
          topicId: topic.id,
        },
      });

      const cascade = await recomputeTopicAndCourse(tx, topic.id);
      return { subtopic, cascade };
    });

    res.status(201).json(result);
  } catch (err) {
    console.error("create subtopic error:", err);
    res.status(500).json({ error: "Could not create subtopic" });
  }
});

// PUT /api/subtopics/:id - rename
router.put("/subtopics/:id", async (req, res) => {
  const parsed = titleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  try {
    const subtopic = await getSubtopicWithOwnedTopic(req.params.id, req.userId);
    if (!subtopic) return res.status(404).json({ error: "Subtopic not found" });

    const updated = await prisma.subtopic.update({
      where: { id: subtopic.id },
      data: { title: parsed.data.title },
    });

    res.json(updated);
  } catch (err) {
    console.error("update subtopic error:", err);
    res.status(500).json({ error: "Could not update subtopic" });
  }
});

// PATCH /api/subtopics/:id/toggle - the core "tick it off" action.
// Cascades: subtopic -> parent topic -> parent course.
router.patch("/subtopics/:id/toggle", async (req, res) => {
  try {
    const subtopic = await getSubtopicWithOwnedTopic(req.params.id, req.userId);
    if (!subtopic) return res.status(404).json({ error: "Subtopic not found" });

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.subtopic.update({
        where: { id: subtopic.id },
        data: { completed: !subtopic.completed },
      });

      const cascade = await recomputeTopicAndCourse(tx, subtopic.topicId);
      return { subtopic: updated, cascade };
    });

    res.json(result);
  } catch (err) {
    console.error("toggle subtopic error:", err);
    res.status(500).json({ error: "Could not update subtopic" });
  }
});

// DELETE /api/subtopics/:id
router.delete("/subtopics/:id", async (req, res) => {
  try {
    const subtopic = await getSubtopicWithOwnedTopic(req.params.id, req.userId);
    if (!subtopic) return res.status(404).json({ error: "Subtopic not found" });

    const result = await prisma.$transaction(async (tx) => {
      await tx.subtopic.delete({ where: { id: subtopic.id } });
      const cascade = await recomputeTopicAndCourse(tx, subtopic.topicId);
      return cascade;
    });

    res.json({ deleted: true, cascade: result });
  } catch (err) {
    console.error("delete subtopic error:", err);
    res.status(500).json({ error: "Could not delete subtopic" });
  }
});

module.exports = router;
