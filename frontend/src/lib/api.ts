import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;

export const auth = {
  register: (data: { email: string; password: string; full_name?: string }) =>
    api.post("/auth/register", data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
};

export const profiles = {
  get: () => api.get("/profile").then((r) => r.data),
  upsert: (data: { tech_stack: string[]; experience_level: string; target_role: string; target_companies?: string[] }) =>
    api.put("/profile", data).then((r) => r.data),
};

export const roadmaps = {
  list: () => api.get("/roadmaps").then((r) => r.data),
  create: (data: { target_role: string; tech_stack: string[] }) =>
    api.post("/roadmaps", data).then((r) => r.data),
};

export const interviews = {
  list: () => api.get("/interviews").then((r) => r.data),
  start: (data: { type?: string; role?: string; tech_stack?: string[]; company?: string }) =>
    api.post("/interviews", data).then((r) => r.data),
  respond: (id: number, message: string) =>
    api.post(`/interviews/${id}/respond`, { message }).then((r) => r.data),
  end: (id: number) =>
    api.post(`/interviews/${id}/end`).then((r) => r.data),
};
