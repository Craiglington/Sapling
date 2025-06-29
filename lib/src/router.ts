import { Component } from "./component.js";

let routerElement: RouterElement | undefined = undefined;

class RouterElement extends HTMLElement {
  connectedCallback() {
    if (!routerElement) return;
    routerElement = this;
  }

  disconnectedCallback() {
    if (routerElement !== this) return;
    routerElement = undefined;
  }
}

window.customElements.define("app-router", RouterElement);

export type RouterConfig = {
  routes: {
    path: string;
    component: Component;
    guard?: () => boolean;
  }[];
  default?: Component;
};

export class RouterService {
  private static config?: RouterConfig;

  private constructor() {}

  static init(config: RouterConfig) {
    if (this.config) {
      throw new Error("The RouterService can only be initialized once.");
    }
    this.config = config;
  }

  static route(path: string) {
    if (!routerElement) {
      throw new Error(
        "The 'app-router' element has not been added to a template."
      );
    } else if (!this.config) {
      throw new Error("The RouterService has not been initialized.");
    }

    routerElement.nextSibling?.remove();

    for (const route of this.config.routes) {
      if (
        path.substring(0, route.path.length) !== route.path ||
        (route.guard && !route.guard())
      ) {
        continue;
      }
      this.insert(route.component);
      return;
    }

    if (!this.config.default) return;
    this.insert(this.config.default);
  }

  private static insert(component: Component) {
    routerElement?.parentNode?.insertBefore(
      component,
      routerElement.nextSibling
    );
  }
}
