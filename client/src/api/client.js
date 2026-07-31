import axios from "axios";

const api = axios.create({ baseURL: "/api", withCredentials: true });

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.url?.includes("/auth/")) {
      window.dispatchEvent(new CustomEvent("nutrix:unauthorized"));
    }
    return Promise.reject(err);
  }
);

export default api;
