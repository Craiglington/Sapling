import { Component } from "/simple-web-client/component.js";

class HeaderComponent extends Component {
  constructor() {
    super({
      templateUrl: "/templates/header.component.html",
      styleUrls: ["/styles/header.component.css"]
    });
  }
}

window.customElements.define("app-header", HeaderComponent);
