export default {
  srcDir: "src/dist",
  srcFiles: [],
  specDir: "spec/src/dist",
  specFiles: ["**/*[sS]pec.js"],
  helpers: ["helpers/**/*.js"],
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
  }
};
