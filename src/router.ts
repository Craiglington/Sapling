class RouterElement extends HTMLElement {
  async connectedCallback() {
    await RouterService.addRouterElement(this);
    RouterService.route(window.location.pathname);
  }

  async disconnectedCallback() {
    await RouterService.removeRouterElement(this);
  }
}

window.customElements.define("app-router", RouterElement);

/**
 * A `ComponentRoute` provides a custom `Component` and an optional route guard.
 */
export interface ComponentRoute {
  component: CustomElementConstructor;
  guard?: () => boolean | string;
}

/**
 * A `ChildrenRoute` provides a list of sub-routes alongside an optional custom `Component` and route guard.
 */
export type ChildrenRoute = Partial<ComponentRoute> & { children: Route[] };

/**
 * A `RedirectRoute` provides a path of redirection.
 */
export interface RedirectRoute {
  redirectTo: string;
}

/**
 * A `Route` consists of a path and either a `ComponentRoute`, a `ChildrenRoute`, or a `RedirectRoute`.
 */
export type Route = { path: string } & (
  ComponentRoute | ChildrenRoute | RedirectRoute
);

class AsyncLock {
  private lock = Promise.resolve();

  async acquire(): Promise<{ release: () => void }> {
    const previousLock = this.lock;
    let releaseLock: () => void;
    this.lock = new Promise((resolve) => {
      releaseLock = resolve;
    });
    await previousLock;
    return { release: releaseLock! };
  }
}

/**
 * The `RouterService` appends custom `Components` after the `app-router` element.
 * To use, initialize the service and place `<app-router></app-router>` in a template file.
 *
 * The `RouterService` allows for manual entry of a url as well as using the `back` and `forward` buttons in a browser.
 *
 * If a route guard fails (returns `false`), the notFound `Component` will not be used. It is up to the route guard to redirect the user.
 */
export class RouterService {
  private static routerElements: RouterElement[] = [];
  private static routes?: Route[];
  private static currentRoutes: Route[] = [];
  private static routeLock = new AsyncLock();
  private static;

  private constructor() {}

  /**
   * Initializes the `RouterService` with a list of `Route` objects.
   * @param routes
   */
  static init(routes: Route[]) {
    if (this.routes !== undefined) {
      throw new Error("The RouterService can only be initialized once.");
    }
    this.routes = routes;
  }

  static async addRouterElement(routerElement: RouterElement): Promise<void> {
    const lock = await this.routeLock.acquire();
    try {
      this.routerElements.push(routerElement);
    } finally {
      lock.release();
    }
  }

  static async removeRouterElement(
    routerElement: RouterElement
  ): Promise<void> {
    const lock = await this.routeLock.acquire();
    try {
      const routerElementIndex = this.routerElements.indexOf(routerElement);
      if (routerElementIndex >= 0) {
        this.routerElements.splice(routerElementIndex, 1);
      }
    } finally {
      lock.release();
    }
  }

  /**
   * Takes a path and searches for a `Route` that matches. Only the first match will be used.
   * @param path The path to route towards. Also the path that will be inserted into the url.
   * @param pushToHistory An option to not save the route to the browser's history.
   */
  static async route(
    path: string,
    pushToHistory: boolean = true
  ): Promise<boolean> {
    if (this.routes === undefined) {
      throw new Error("The RouterService has not been initialized.");
    }

    let routeResult: boolean;
    const lock = await this.routeLock.acquire();
    try {
      let unmatchedPath = path;
      for (let i = 0; i < this.currentRoutes.length; ++i) {}

      routeResult = this.routeWithRoutes(
        path,
        window.location.pathname,
        this.routes
      );

      if (routeResult && pushToHistory) {
        history.pushState({}, "", path);
      }
    } finally {
      lock.release();
    }

    return routeResult;
  }

  private static routeWithRoutes(
    newPath: string,
    currentPath: string,
    routes: Route[]
  ): boolean {
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
