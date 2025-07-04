import { Component } from "/simple-web-client/component.js";
import { Value } from "/simple-web-client/value.js";

export class LoginComponent extends Component {
  textHidden = new Value(false);
  constructor() {
    super({
      templateUrl: "/components/login/login.component.html",
      styleUrls: ["/components/login/login.component.css"]
    });
  }

  override async connectedCallback() {
    await super.connectedCallback();
    const paragraph = this.shadowRoot?.querySelector("p");
    if (paragraph) {
      this.textHidden.bindTemplateProperty(paragraph, "hidden");
    }
  }
}

window.customElements.define("app-login", LoginComponent);
