/**
 * Recomputes the `completed` flag for a topic based on its subtopics,
 * then recomputes the parent course based on all its topics.
 *
 * A topic with zero subtopics is never "complete" (nothing to complete yet),
 * same rule applies to a course with zero topics.
 *
 * Runs inside the given Prisma transaction client (`tx`) so every write from
 * a single user action (e.g. toggling one subtopic) is atomic.
 */
async function recomputeTopicAndCourse(tx, topicId) {
  const topic = await tx.topic.findUnique({
    where: { id: topicId },
    select: {
      id: true,
      completed: true,
      courseId: true,
      subtopics: { select: { completed: true } },
    },
  });

  if (!topic) return null;

  const topicShouldBeComplete =
    topic.subtopics.length > 0 && topic.subtopics.every((s) => s.completed);

  let updatedTopic = topic;
  if (topicShouldBeComplete !== topic.completed) {
    updatedTopic = await tx.topic.update({
      where: { id: topicId },
      data: { completed: topicShouldBeComplete },
    });
  }

  const course = await recomputeCourse(tx, topic.courseId);

  return { topic: { ...updatedTopic, completed: topicShouldBeComplete }, course };
}

async function recomputeCourse(tx, courseId) {
  const course = await tx.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      completed: true,
      topics: { select: { completed: true } },
    },
  });

  if (!course) return null;

  const courseShouldBeComplete =
    course.topics.length > 0 && course.topics.every((t) => t.completed);

  if (courseShouldBeComplete === course.completed) {
    return course;
  }

  return tx.course.update({
    where: { id: courseId },
    data: { completed: courseShouldBeComplete },
  });
}

module.exports = { recomputeTopicAndCourse, recomputeCourse };
