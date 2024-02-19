const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/api", {
      // target: "https://developer.mozilla.org/api/v1",
      target: "https://dog.ceo",
      changeOrigin: true,
      ws: true,
      pathRewrite: {
        "^/api": "/api",
      },
    })
  );
};
