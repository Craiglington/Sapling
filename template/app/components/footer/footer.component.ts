import { Component } from "/simple-web-client/component.js";

export class FooterComponent extends Component {
  constructor() {
    super({
      templateUrl: "/components/footer/footer.component.html",
      styleUrls: ["/components/footer/footer.component.css"]
    });
  }

  override async connectedCallback() {
    super.connectedCallback();
  }
}

window.customElements.define("app-footer", FooterComponent);
