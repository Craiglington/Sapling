import { Component } from "/simple-web-client/component.js";

class LoginComponent extends Component {
  constructor() {
    super({
      templateUrl: "/templates/login.component.html",
      styleUrls: ["/styles/login.component.css"]
    });
  }

  override connectedCallback() {
    super.connectedCallback();
    console.log("CONNECTED CALLBACK OVERRIDE!");
  }
}

window.customElements.define("app-login", LoginComponent);
