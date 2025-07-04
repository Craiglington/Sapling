import { Component } from "/simple-web-client/component.js";

export class AboutUsComponent extends Component {
  constructor() {
    super({
      templateUrl: "/components/about-us/about-us.component.html",
      styleUrls: ["/components/about-us/about-us.component.css"]
    });
  }

  override async connectedCallback() {
    super.connectedCallback();
  }
}

window.customElements.define("app-about-us", AboutUsComponent);
