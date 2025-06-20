import { Component } from "/simple-web-client/component.js";

class HeaderComponent extends Component {
  message: string = "Hello world!";

  constructor() {
    super({
      templateUrl: "/components/header/header.component.html",
      styleUrls: ["/components/header/header.component.css"]
    });
  }

  override async connectedCallback() {
    await super.connectedCallback();
    console.log(this.shadowRoot?.querySelector("h1"));
  }
}

window.customElements.define("app-header", HeaderComponent);
