import client from "./client";

export const CoursesAPI = {
  list: () => client.get("/courses").then((r) => r.data),
  create: (data) => client.post("/courses", data).then((r) => r.data),
  update: (id, data) => client.put(`/courses/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/courses/${id}`),
};

export const TopicsAPI = {
  create: (courseId, data) =>
    client.post(`/courses/${courseId}/topics`, data).then((r) => r.data),
  update: (id, data) => client.put(`/topics/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/topics/${id}`).then((r) => r.data),
};

export const SubtopicsAPI = {
  create: (topicId, data) =>
    client.post(`/topics/${topicId}/subtopics`, data).then((r) => r.data),
  update: (id, data) => client.put(`/subtopics/${id}`, data).then((r) => r.data),
  toggle: (id) => client.patch(`/subtopics/${id}/toggle`).then((r) => r.data),
  remove: (id) => client.delete(`/subtopics/${id}`).then((r) => r.data),
};
