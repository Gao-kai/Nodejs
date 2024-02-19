import qs from "qs";
import { isPlainObject } from "lodash";
import { message } from "antd";

class HttpRequest {
  constructor() {
    /* 初始值和校验 */
    this.baseConfig = {};
  }

  /* 将自己携带的对象进行合并 然后调用request请求 */
  get(url, config) {
    if (!isPlainObject(config)) config = {};
    config.method = "GET";
    return this.request(url, config);
  }

  post(url, body, config) {
    if (!isPlainObject(config)) config = {};
    config.body = body;
    config.method = "POST";
    return this.request(url, config);
  }

  put(url, body, config) {
    if (!isPlainObject(config)) config = {};
    config.body = body;
    config.method = "PUT";
    return this.request(url, config);
  }

  delete(url, config) {
    if (!isPlainObject(config)) config = {};
    config.method = "DELETE";
    return this.request(url, config);
  }

  /**
   * 统一处理请求逻辑的地方
   * @param {*} url
   * @param {*} method
   * @param {*} options
   */
  request(url, config) {
    /* 初始值进行合并 */
    if (!isPlainObject(config)) config = {};
    config = Object.assign(
      {
        method: "GET",
        cache: "no-cache",
        credential: "include",
        headers: {},
        body: null,
        params: null,
        responseType: "json",
        signal: null,
      },
      config
    );

    /* 参数校验 */
    if (!url) {
      throw new TypeError("请求url不能为空！");
    }

    if (config.headers && !isPlainObject(config.headers)) {
      throw new TypeError("请求headers格式 必须为普通对象！");
    }

    let { method, params, body, responseType } = config;

    /* 请求发起前处理 */
    config.method = method.toUpperCase();

    if (config.params && ["GET", "DELETE"].includes(method)) {
      config.params = url += `${url.includes("?") ? "&" : "?"}${qs.stringify(
        params
      )}`;
    }

    if (isPlainObject(body)) {
      body = qs.stringify(body);
      config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }

    if (localStorage.getItem("token")) {
      config.headers["Authorization"] = localStorage.getItem("token");
    }

    return fetch(url, config)
      .then((response) => {
        const { ok, status, statusText } = response;
        if (ok) {
          let res;
          switch (responseType) {
            case "text":
              res = response.text();
              break;
            case "blob":
              res = response.blob();
              break;
            case "arrayBuffer":
              res = response.arrayBuffer();
              break;
            case "formData":
              res = response.formData();
              break;

            default:
              res = response.json();
              break;
          }
          return res;
        }

        /* 走到resolve中并不一定成功 这里会有断网或者超时等情况 */
        return Promise.reject({
          code: 0,
          status,
          statusText,
        });
      })
      .catch((err) => {
        if (err && typeof err === "object") {
          const { code, status, statusText } = err;
          // code=0表示这是一个走到resolve的失败情况或者数据转换报错的情况
          if (code === 0) {
            message.error(`请求出错: ${status}-${statusText}`);
          } else if (code === 20) {
            // 如果code===20 那么说明是用户手动调用了controller.abort
            message.error("请求中断！");
          } else {
            message.error("当前网络繁忙，请你稍后再试！");
          }
        } else {
          message.error("当前网络繁忙，请你稍后再试！");
        }

        return Promise.reject(err);
      });
  }
}

export const http = new HttpRequest();
