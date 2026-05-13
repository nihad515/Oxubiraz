import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios';

import { APP_CONFIG } from '@/config/app';
import { useAuthStore } from '@/store/auth-store';
import { useStringStore } from '@/store/string-store';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: `${APP_CONFIG.apiUrl}/api/v1`,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        const locale = typeof window !== 'undefined'
          ? (localStorage.getItem('locale') ?? APP_CONFIG.defaultLocale)
          : APP_CONFIG.defaultLocale;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        config.headers['Accept-Language'] = locale;

        return config;
      },
      (error) => Promise.reject(error),
    );

    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          useAuthStore.getState().logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        if (error.response?.status === 403) {
          const strings = useStringStore.getState().getString;
          console.warn(strings('errors.forbidden'));
        }

        if (error.response?.status === 429) {
          const strings = useStringStore.getState().getString;
          console.warn(strings('errors.rate_limit'));
        }

        return Promise.reject(error);
      },
    );
  }

  get axios(): AxiosInstance {
    return this.instance;
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  async upload<T>(url: string, formData: FormData, config?: AxiosRequestConfig) {
    const response = await this.instance.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
