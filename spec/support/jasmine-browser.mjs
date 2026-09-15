import serveStatic from "serve-static";

// All "./" paths are relative to the current directory of the node process.
export default {
  srcDir: "./src/dist",
  specDir: "./spec/dist",
  specFiles: ["**/*spec.js"],
  helpers: ["./spec/helpers/**/*.js"],
  esmFilenameExtension: ".js",
  modulesWithSideEffectsInSrcFiles: false,
  enableTopLevelAwait: false,
  env: {
    random: false,
    forbidDuplicateNames: true
  },
  listenAddress: "localhost",
  hostname: "localhost",
  browser: {
    name: "headlessChrome"
  },

  // /src is a browser URL path.
  middleware: {
    "/src": serveStatic("./src/dist")
  }
};
