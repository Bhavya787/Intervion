import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL ||
  "https://interview-ai-backend-jpck.onrender.com/api";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

export default axiosInstance;
