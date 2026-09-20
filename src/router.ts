class RouterElement extends HTMLElement {
  static routerElements: RouterElement[] = [];

  connectedCallback() {
    RouterElement.routerElements.push(this);
    RouterService.route(window.location.pathname);
  }

  disconnectedCallback() {
    const routerElementIndex = RouterElement.routerElements.indexOf(this);
    if (routerElementIndex !== -1) {
      RouterElement.routerElements.splice(routerElementIndex, 1);
    }
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

export type ChildrenRoute = {
  component?: CustomElementConstructor;
  children: Route[];
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
export type Route = { path: RegExp } & (
  ComponentRoute | ChildrenRoute | RedirectRoute
);

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
  }

  /**
   * Takes a path and searches for a `Route` that matches. Only the first match will be used.
   * @param path The path to route towards. Also the path that will be inserted into the url.
   * @param pushToHistory An option to not save the route to the browser's history.
   */
  static route(path: string, pushToHistory: boolean = true) {
    if (RouterElement.routerElements.length === 0) {
      throw new Error("No 'app-router' element detected.");
    } else if (!this.config) {
      throw new Error("The RouterService has not been initialized.");
    }

    this.routeWithRoutes(
      path,
      window.location.pathname,
      this.config.routes,
      pushToHistory
    );
  }

  private static routeWithRoutes(
    newPath: string,
    currentPath: string,
    routes: Route[],
    pushToHistory: boolean = true
  ) {
    let matchingComponent: CustomElementConstructor | undefined = undefined;
    for (const route of routes) {
      if (!route.path.test(newPath)) {
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
    history.pushState({}, "", newPath);
  }

  private static insert(
    routerElement: RouterElement,
    component: CustomElementConstructor
  ) {
    const sibling = routerElement.nextElementSibling;
    if (sibling && window.customElements.get(sibling.localName)) {
      sibling.remove();
    }

    routerElement.parentNode?.insertBefore(
      new component(),
      routerElement.nextSibling
    );
  }
}

window.addEventListener("popstate", () => {
  RouterService.route(window.location.pathname, false);
});
