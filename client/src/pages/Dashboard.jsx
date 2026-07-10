import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { CoursesAPI, TopicsAPI, SubtopicsAPI } from "../api/courses.js";
import Header from "../components/Header.jsx";
import CourseCard from "../components/CourseCard.jsx";
import InlineAddForm from "../components/InlineAddForm.jsx";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    CoursesAPI.list()
      .then((data) => {
        if (!cancelled) setCourses(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load your courses. Try refreshing.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- small immutable-update helpers over the 3-level tree ----
  const patchCourse = (courseId, patch) =>
    setCourses((cs) => cs.map((c) => (c.id === courseId ? { ...c, ...patch } : c)));

  const patchTopic = (courseId, topicId, patch) =>
    setCourses((cs) =>
      cs.map((c) =>
        c.id !== courseId
          ? c
          : {
              ...c,
              topics: c.topics.map((t) =>
                t.id === topicId ? { ...t, ...patch } : t
              ),
            }
      )
    );

  const patchSubtopic = (courseId, topicId, subId, patch) =>
    setCourses((cs) =>
      cs.map((c) =>
        c.id !== courseId
          ? c
          : {
              ...c,
              topics: c.topics.map((t) =>
                t.id !== topicId
                  ? t
                  : {
                      ...t,
                      subtopics: t.subtopics.map((s) =>
                        s.id === subId ? { ...s, ...patch } : s
                      ),
                    }
              ),
            }
      )
    );

  // ---- Course handlers ----
  const handleAddCourse = useCallback(async (title) => {
    const course = await CoursesAPI.create({ title });
    setCourses((cs) => [...cs, course]);
  }, []);

  const handleRenameCourse = useCallback(async (courseId, title) => {
    await CoursesAPI.update(courseId, { title });
    patchCourse(courseId, { title });
  }, []);

  const handleDeleteCourse = useCallback(async (courseId) => {
    await CoursesAPI.remove(courseId);
    setCourses((cs) => cs.filter((c) => c.id !== courseId));
  }, []);

  // ---- Topic handlers ----
  const handleAddTopic = useCallback(async (courseId, title) => {
    const { topic, course } = await TopicsAPI.create(courseId, { title });
    setCourses((cs) =>
      cs.map((c) =>
        c.id !== courseId
          ? c
          : { ...c, completed: course.completed, topics: [...c.topics, topic] }
      )
    );
    return topic;
  }, []);

  const handleRenameTopic = useCallback(async (courseId, topicId, title) => {
    await TopicsAPI.update(topicId, { title });
    patchTopic(courseId, topicId, { title });
  }, []);

  const handleDeleteTopic = useCallback(async (courseId, topicId) => {
    const { course } = await TopicsAPI.remove(topicId);
    setCourses((cs) =>
      cs.map((c) =>
        c.id !== courseId
          ? c
          : {
              ...c,
              completed: course?.completed ?? c.completed,
              topics: c.topics.filter((t) => t.id !== topicId),
            }
      )
    );
  }, []);

  // ---- Subtopic handlers ----
  const handleAddSubtopic = useCallback(async (courseId, topicId, title) => {
    const { subtopic, cascade } = await SubtopicsAPI.create(topicId, { title });
    setCourses((cs) =>
      cs.map((c) =>
        c.id !== courseId
          ? c
          : {
              ...c,
              completed: cascade?.course?.completed ?? c.completed,
              topics: c.topics.map((t) =>
                t.id !== topicId
                  ? t
                  : {
                      ...t,
                      completed: cascade?.topic?.completed ?? t.completed,
                      subtopics: [...t.subtopics, subtopic],
                    }
              ),
            }
      )
    );
  }, []);

  const handleRenameSubtopic = useCallback(
    async (courseId, topicId, subId, title) => {
      await SubtopicsAPI.update(subId, { title });
      patchSubtopic(courseId, topicId, subId, { title });
    },
    []
  );

  const handleToggleSubtopic = useCallback(async (courseId, topicId, subId) => {
    let previousCourses;

    // Optimistic update: flip the checkbox (and cascade topic/course
    // completion) immediately, before the request even goes out.
    setCourses((cs) => {
      previousCourses = cs;
      return cs.map((c) => {
        if (c.id !== courseId) return c;
        const topics = c.topics.map((t) => {
          if (t.id !== topicId) return t;
          const subtopics = t.subtopics.map((s) =>
            s.id === subId ? { ...s, completed: !s.completed } : s
          );
          const topicCompleted =
            subtopics.length > 0 && subtopics.every((s) => s.completed);
          return { ...t, subtopics, completed: topicCompleted };
        });
        const courseCompleted = topics.length > 0 && topics.every((t) => t.completed);
        return { ...c, topics, completed: courseCompleted };
      });
    });

    try {
      const { subtopic, cascade } = await SubtopicsAPI.toggle(subId);
      // Reconcile with the authoritative server state.
      setCourses((cs) =>
        cs.map((c) =>
          c.id !== courseId
            ? c
            : {
                ...c,
                completed: cascade?.course?.completed ?? c.completed,
                topics: c.topics.map((t) =>
                  t.id !== topicId
                    ? t
                    : {
                        ...t,
                        completed: cascade?.topic?.completed ?? t.completed,
                        subtopics: t.subtopics.map((s) =>
                          s.id === subId ? { ...s, completed: subtopic.completed } : s
                        ),
                      }
                ),
              }
        )
      );
    } catch (error) {
      console.error("Failed to toggle subtopic:", error);
      if (previousCourses) setCourses(previousCourses);
      alert(`Failed to update subtopic: ${error.response?.data?.error || error.message}`);
    }
  }, []);

  const handleDeleteSubtopic = useCallback(async (courseId, topicId, subId) => {
    try {
      const { cascade } = await SubtopicsAPI.remove(subId);
      setCourses((cs) =>
        cs.map((c) =>
          c.id !== courseId
            ? c
            : {
                ...c,
                completed: cascade?.course?.completed ?? c.completed,
                topics: c.topics.map((t) =>
                  t.id !== topicId
                    ? t
                    : {
                        ...t,
                        completed: cascade?.topic?.completed ?? t.completed,
                        subtopics: t.subtopics.filter((s) => s.id !== subId),
                      }
                ),
              }
        )
      );
    } catch (error) {
      console.error("Failed to delete subtopic:", error);
      alert(`Failed to delete subtopic: ${error.response?.data?.error || error.message}`);
    }
  }, []);

  const stats = useMemo(() => {
    let totalSubtopics = 0;
    let completedSubtopics = 0;
    let completedCourses = 0;
    for (const c of courses) {
      if (c.completed) completedCourses += 1;
      for (const t of c.topics) {
        for (const s of t.subtopics) {
          totalSubtopics += 1;
          if (s.completed) completedSubtopics += 1;
        }
      }
    }
    return {
      totalCourses: courses.length,
      completedCourses,
      totalSubtopics,
      completedSubtopics,
    };
  }, [courses]);

  return (
    <div className="min-h-screen">
      <Header username={user?.username} stats={stats} onLogout={logout} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {loading && (
          <p className="font-mono text-sm text-ink2-muted">Loading your tracker…</p>
        )}

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {!loading && !error && courses.length === 0 && (
          <div className="text-center py-16 border border-dashed border-rule rounded-2xl">
            <p className="font-display italic text-2xl text-ink2-text mb-2">
              Your tracker is empty
            </p>
            <p className="text-sm text-ink2-muted mb-5">
              Add your first course to start tracking what you're learning.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          courses.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              index={i}
              onRenameCourse={(title) => handleRenameCourse(course.id, title)}
              onDeleteCourse={() => handleDeleteCourse(course.id)}
              onAddTopic={(title) => handleAddTopic(course.id, title)}
              onRenameTopic={(topicId, title) =>
                handleRenameTopic(course.id, topicId, title)
              }
              onDeleteTopic={(topicId) => handleDeleteTopic(course.id, topicId)}
              onAddSubtopic={(topicId, title) =>
                handleAddSubtopic(course.id, topicId, title)
              }
              onToggleSubtopic={(topicId, subId) =>
                handleToggleSubtopic(course.id, topicId, subId)
              }
              onRenameSubtopic={(topicId, subId, title) =>
                handleRenameSubtopic(course.id, topicId, subId, title)
              }
              onDeleteSubtopic={(topicId, subId) =>
                handleDeleteSubtopic(course.id, topicId, subId)
              }
            />
          ))}

        {!loading && !error && (
          <div className="pt-2">
            <InlineAddForm
              placeholder="New course title (e.g. React, DSA, System Design)"
              buttonLabel="Add course"
              onSubmit={handleAddCourse}
            />
          </div>
        )}
      </main>
    </div>
  );
}
