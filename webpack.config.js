const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    bundle: "./src/index.js",
    app: "./src/app.js",
    faceAPI: "./src/facejs",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  watch: true,
};
