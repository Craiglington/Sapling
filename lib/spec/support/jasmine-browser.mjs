export default {
  srcDir: "dist",
  srcFiles: [],
  specDir: "spec/dist",
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
