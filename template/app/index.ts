import { env } from "./envs/env.js";

// Needed for automatic browser reload.
if (env.ENV === "DEV") {
  const script = document.createElement("script");
  script.setAttribute("type", "module");
  script.src = "/client-listener.js";
  document.body.append(script);
}
