import axios, { AxiosInstance } from "axios";
import { getSession } from "next-auth/react";

export const axiosInstance: AxiosInstance = axios.create();

// Request Interceptor: Attach the Access Token
axiosInstance.interceptors.request.use(
  async (config) => {
    // const session = await getSession()
    // console.log("session", session);
    // if (session) {
    //   config.headers.Authorization = `Bearer ${session.token.accessToken}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // if (error.response?.status === 401 && !originalRequest._retry) {
    //   originalRequest._retry = true;
    //   try {
    //     const newToken = await refreshToken();
    //     authService.setAccessToken(newToken);
    //     axiosInstance.defaults.headers.Authorization = `Bearer ${newToken}`;
    //     return axiosInstance(originalRequest);
    //   } catch (refreshError) {
    //     try {
    //       await signOut();
    //       console.error("Token refresh failed:", refreshError);
    //     } catch (error) {
    //       console.error("Token refresh failed:", refreshError);
    //     }
    //   }
    // }

    return Promise.reject(error);
  }
);

export default axiosInstance;
