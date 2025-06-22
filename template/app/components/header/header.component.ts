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
      this.message.setTemplateProperty(header, "innerText", (value) => value);
    }
    setTimeout(() => {
      this.message.value += " How you doin?";
    }, 5000);
    setTimeout(() => {
      this.message.value = "";
      this.message.clearTemplateProperties();
      this.message.value = "TESTING!";
    }, 10000);
  }
}

window.customElements.define("app-header", HeaderComponent);
