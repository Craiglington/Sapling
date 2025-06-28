import { Component } from "/simple-web-client/component.js";
import { Value } from "/simple-web-client/value.js";

class HeaderComponent extends Component {
  message = new Value("Hello world!");

  constructor() {
    super({
      templateUrl: "/components/header/header.component.html",
      styleUrls: ["/components/header/header.component.css"]
    });
  }

  override async connectedCallback() {
    await super.connectedCallback();
    const header = this.shadowRoot?.querySelector("h1");
    if (header) {
      this.message.bindTemplateProperty(header, "innerText", (value) => value);
    }
  }
}

window.customElements.define("app-header", HeaderComponent);
