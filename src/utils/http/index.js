import Axios from "axios";
import NProgress from "../progress";
import { showFailToast } from "vant";
import "vant/es/toast/style";
import { HTTP_BIZ_CODE, HTTP_TIMEOUT } from "@/constants/http";
import { getToken } from "@/utils/auth-token";
import { handleUnauthorized } from "@/utils/unauthorized";

const configDefault = {
  headers: {
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
  },
  timeout: HTTP_TIMEOUT,
  baseURL: import.meta.env.VITE_BASE_API,
  data: {}
};

class Http {
  constructor(config) {
    Http.axiosConfigDefault = config;
    Http.axiosInstance = Axios.create(config);
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  static axiosInstance;
  static axiosConfigDefault;

  httpInterceptorsRequest() {
    Http.axiosInstance.interceptors.request.use(
      config => {
        NProgress.start();
        const token = getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        showFailToast(error.message);
        return Promise.reject(error);
      }
    );
  }

  httpInterceptorsResponse() {
    Http.axiosInstance.interceptors.response.use(
      response => {
        NProgress.done();
        const { code, message, result } = response.data || {};

        if (code === HTTP_BIZ_CODE.UNAUTHORIZED) {
          showFailToast(message || "登录已过期，请重新登录");
          handleUnauthorized();
          return Promise.reject(response.data);
        }

        const isSuccess =
          Reflect.has(response.data || {}, "code") &&
          code === HTTP_BIZ_CODE.SUCCESS;

        if (isSuccess) {
          return result;
        }

        showFailToast(message || "请求失败");
        return Promise.reject(response.data);
      },
      error => {
        NProgress.done();
        const status = error.response?.status;
        let message = "";

        switch (status) {
          case 400:
            message = "请求错误";
            break;
          case 401:
            message = "未授权，请登录";
            handleUnauthorized();
            break;
          case 403:
            message = "拒绝访问";
            break;
          case 404:
            message = `请求地址出错: ${error.response?.config?.url}`;
            break;
          case 408:
            message = "请求超时";
            break;
          case 500:
            message = "服务器内部错误";
            break;
          case 501:
            message = "服务未实现";
            break;
          case 502:
            message = "网关错误";
            break;
          case 503:
            message = "服务不可用";
            break;
          case 504:
            message = "网关超时";
            break;
          case 505:
            message = "HTTP版本不受支持";
            break;
          default:
            message = error.message?.includes("timeout")
              ? "请求超时"
              : "网络连接故障";
        }

        if (message) showFailToast(message);
        return Promise.reject(error);
      }
    );
  }

  request(paramConfig) {
    const config = { ...Http.axiosConfigDefault, ...paramConfig };
    return new Promise((resolve, reject) => {
      Http.axiosInstance
        .request(config)
        .then(response => resolve(response))
        .catch(err => reject(err));
    });
  }
}

export const http = new Http(configDefault);
