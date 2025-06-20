import { Component } from "/simple-web-client/component.js";
import { env } from "../../envs/env.js";

class LoginComponent extends Component {
  constructor() {
    super({
      templateUrl: "/components/login/login.component.html",
      styleUrls: ["/components/login/login.component.css"]
    });
  }

  override async connectedCallback() {
    super.connectedCallback();
  }
}

window.customElements.define("app-login", LoginComponent);
