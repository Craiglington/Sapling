export default {
  srcDir: "app",
  srcFiles: ["**/*.js"],
  specFiles: ["**/*[sS]pec.js"],
  helpers: ["helpers/**/*.js"],
  env: {
    random: false,
    forbidDuplicateNames: true
  },

  // For security, listen only to localhost. You can also specify a different
  // hostname or IP address, or remove the property or set it to "*" to listen
  // to all network interfaces.
  listenAddress: "localhost",

  // The hostname that the browser will use to connect to the server.
  hostname: "localhost",

  browser: {
    name: "chrome"
  }
};
