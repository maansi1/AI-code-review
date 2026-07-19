import api from "./api";

export const reviewService = {
  async submitCode(payload) {
    const { data } = await api.post("/reviews", payload);
    return data;
  },
  async uploadFile(file, projectName) {
    const form = new FormData();
    form.append("file", file);
    if (projectName) form.append("projectName", projectName);
    const { data } = await api.post("/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  async listReviews(query) {
    const { data } = await api.get("/reviews", { params: query ? { query } : {} });
    return data;
  },
  async getReview(id) {
    const { data } = await api.get(`/reviews/${id}`);
    return data;
  },
  async deleteReview(id) {
    const { data } = await api.delete(`/reviews/${id}`);
    return data;
  },
};
