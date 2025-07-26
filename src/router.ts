class RouterElement extends HTMLElement {
  static routerElement: RouterElement | undefined = undefined;

  connectedCallback() {
    if (RouterElement.routerElement) return;
    RouterElement.routerElement = this;
  }

  disconnectedCallback() {
    if (RouterElement.routerElement !== this) return;
    RouterElement.routerElement = undefined;
  }
}

window.customElements.define("app-router", RouterElement);

/**
 * A `ComponentRoute` provides a custom `Component` and an optional route guard.
 */
export type ComponentRoute = {
  component: CustomElementConstructor;
  guard?: () => boolean;
};

/**
 * A `RedirectRoute` provides a path of redirection.
 */
export type RedirectRoute = {
  redirectTo: string;
};

/**
 * A `Route` consists of a path and either a `ComponentRoute` or a `RedirectRoute`.
 */
export type Route = { path: RegExp } & (ComponentRoute | RedirectRoute);

/**
 * Provided when initializing the `RouterService`.
 * The `RouterConfig` lists all application `Routes` and an optional custom `Component` to use if a path matches no `Route`.
 */
export type RouterConfig = {
  routes: Route[];
  notFound?: CustomElementConstructor;
};

/**
 * The `RouterService` appends custom `Components` after the `app-router` element.
 * To use, initialize the service and place `<app-router></app-router>` in a template file.
 *
 * The `RouterService` allows for manual entry of a url as well as using the `back` and `forward` buttons in a browser.
 *
 * If a route guard fails (returns `false`), the notFound `Component` will not be used. It is up to the route guard to redirect the user.
 */
export class RouterService {
  private static config?: RouterConfig;

  private constructor() {}

  /**
   * Initializes the `RouterService` with a `RouterConfig`.
   * @param config
   */
  static init(config: RouterConfig) {
    if (this.config) {
      throw new Error("The RouterService can only be initialized once.");
    }
    this.config = config;
    this.route(window.location.pathname);
  }

  /**
   * Takes a path and searches for a `Route` that matches. Only the first match will be used.
   * @param path The path to route towards. Also the path that will be inserted into the url.
   * @param pushToHistory An option to not save the route to the browser's history.
   */
  static route(path: string, pushToHistory: boolean = true) {
    if (!RouterElement.routerElement) {
      throw new Error(
        "The 'app-router' element has not been added to a template."
      );
    } else if (!this.config) {
      throw new Error("The RouterService has not been initialized.");
    }

    let matchingComponent: CustomElementConstructor | undefined = undefined;
    for (const route of this.config.routes) {
      if (!route.path.test(path)) {
        continue;
      }

      if ("component" in route) {
        if (route.guard && !route.guard()) return;
        matchingComponent = route.component;
        break;
      } else if ("redirectTo" in route) {
        this.route(route.redirectTo);
        return;
      }
    }

    if (!matchingComponent && this.config.notFound) {
      matchingComponent = this.config.notFound;
    }

    if (!matchingComponent) return;
    this.insert(matchingComponent);

    if (!pushToHistory) return;
    history.pushState({}, "", path);
  }

  private static insert(component: CustomElementConstructor) {
    const sibling = RouterElement.routerElement?.nextElementSibling;
    if (sibling && window.customElements.get(sibling.localName)) {
      sibling.remove();
    }

    RouterElement.routerElement?.parentNode?.insertBefore(
      new component(),
      RouterElement.routerElement.nextSibling
    );
  }
}

window.addEventListener("popstate", () => {
  RouterService.route(window.location.pathname, false);
});
