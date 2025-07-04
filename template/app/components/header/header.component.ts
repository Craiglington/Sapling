import { Component } from "/simple-web-client/component.js";
import { RouterService } from "/simple-web-client/router.js";

export class HeaderComponent extends Component {
  constructor() {
    super({
      templateUrl: "/components/header/header.component.html",
      styleUrls: ["/components/header/header.component.css"]
    });
  }

  override async connectedCallback() {
    await super.connectedCallback();
    const loginLink = this.shadowRoot?.querySelector("#login-link");
    if (loginLink) {
      loginLink.addEventListener("click", (event: Event) => {
        event.preventDefault();
        console.log("Login clicked!");
        RouterService.route("/login");
      });
    }

    const aboutUsLink = this.shadowRoot?.querySelector("#about-us-link");
    if (aboutUsLink) {
      aboutUsLink.addEventListener("click", (event: Event) => {
        event.preventDefault();
        console.log("About Us clicked!");
        RouterService.route("/about-us");
      });
    }
  }
}

window.customElements.define("app-header", HeaderComponent);
