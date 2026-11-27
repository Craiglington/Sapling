import { Component } from "./component.js";
import { Lock } from "./lock.js";

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
export type Route = { path: RegExp } & (
  ComponentRoute | ChildrenRoute | RedirectRoute
);

/**
 * Before the Router can be used, Router initialization must be completed by calling the static `Router.init()` method.
 * Additionally, before Router initialization can take place, Component initialization must be complete.
 *
 * The `Router` class links the current URL path to specific views by appending custom `Component` elements
 * directly after `Router` elements.
 *
 * To use, place `<sapling-router></sapling-router>` in a template file or the `index.html` file.
 * Multiple router elements can be used, but they must all exist one inside another in a single hierarchical line.
 */
export class Router extends HTMLElement {
  private static readonly ELEMENT_SELECTOR = "sapling-router";
  private static routeLock = new Lock();
  private static routers: Router[] = [];
  private static routes?: Route[];
  private static currentRoutes: Route[] = [];
  private static routePathRegExp = new RegExp(
    /^(\/(?!\/)[a-zA-Z0-9\-\.\_\~]*)*$/
  );

  async connectedCallback() {
    const lock = await Router.routeLock.acquire();
    try {
      if (!Router.isRouterLocationValid(this)) {
        console.error(
          "Invalid router location detected. Only one router can exist directly inside another router."
        );
        return;
      }

      Router.routers.push(this);

      const currentRoutesWithComponents = Router.getRoutesWithComponents(
        Router.currentRoutes
      );

      if (currentRoutesWithComponents.length >= Router.routers.length) {
        Router.insert(
          this,
          currentRoutesWithComponents[Router.routers.length - 1].component
        );
      } else {
        Router.route(window.location.pathname);
      }
    } finally {
      lock.release();
    }
  }

  async disconnectedCallback() {
    const lock = await Router.routeLock.acquire();
    try {
      const routerIndex = Router.routers.indexOf(this);
      if (routerIndex >= 0) {
        Router.routers.splice(routerIndex, 1);
      }
    } finally {
      lock.release();
    }
  }

  /**
   * @returns A boolean that describes if Router initialization is complete.
   */
  static isInitialized(): boolean {
    return this.routes !== undefined;
  }

  /**
   * Initializes the Router with a list of `Route` objects.
   * @param routes An array of `Route` objects.
   * @throws If Router initialization is already complete or Component initialization is not complete.
   */
  static init(routes: Route[]) {
    if (this.isInitialized()) {
      throw new Error("Router initialization is already complete.");
    }

    if (!Component.isInitialized()) {
      throw new Error(
        "Perform Component initialization before Router initialization."
      );
    }

    window.customElements.define(this.ELEMENT_SELECTOR, Router);

    window.addEventListener("popstate", () => {
      this.route(window.location.pathname, false);
    });

    this.routes = routes;
  }

  /**
   * Takes a path and searches for a `Route` that matches.
   * The corresponding `Components` will be inserted into the DOM where the `Router` elements are located.
   *
   * If successful, the browser's URL will be updated to match the path provided.
   * @param path The path to route towards.
   * @param pushToHistory An option to not save the route to the browser's history.
   * @throws If the `Router` has not been initialized or the provided path is invalid.
   */
  static async route(
    path: string,
    pushToHistory: boolean = true
  ): Promise<boolean> {
    if (!this.isInitialized()) {
      throw new Error("The Router has not been initialized.");
    }

    if (!this.routePathRegExp.test(path)) {
      throw new Error(
        `Invalid route path detected. Make sure all route paths match this regex: ${this.routePathRegExp}.`
      );
    }

    const lock = await this.routeLock.acquire();
    try {
      const newRoutes: Route[] = [];
      const routeResult = this.findNewRoutes(path, this.routes!, newRoutes);

      if (typeof routeResult === "string") {
        return this.route(routeResult);
      }

      if (routeResult) {
        const commonRoutes = [];
        for (
          let i = 0;
          i < this.currentRoutes.length &&
          i < newRoutes.length &&
          this.currentRoutes[i] === newRoutes[i];
          ++i
        ) {
          commonRoutes.push(this.currentRoutes[i]);
        }

        const numCommonRoutesWithComponents =
          this.getRoutesWithComponents(commonRoutes).length;
        const nextRouteWithComponent: ComponentRoute | undefined =
          this.getRoutesWithComponents(newRoutes.slice(commonRoutes.length))[0];

        if (
          nextRouteWithComponent &&
          numCommonRoutesWithComponents + 1 <= this.routers.length
        ) {
          this.insert(
            this.routers[numCommonRoutesWithComponents],
            nextRouteWithComponent.component
          );
        }

        this.currentRoutes = newRoutes;

        if (pushToHistory) {
          history.pushState({}, "", path);
        }
      }
      return routeResult;
    } finally {
      lock.release();
    }
  }

  private static findNewRoutes(
    path: string,
    availableRoutes: Route[],
    newRoutes: Route[]
  ): boolean | string {
    let match: { route: Route; path: string } | undefined = undefined;
    for (const route of availableRoutes) {
      const execResult = route.path.exec(path);
      if (!execResult) continue;

      if ("guard" in route) {
        const guardResult = route.guard!();
        if (typeof guardResult === "string") {
          return guardResult;
        } else if (!guardResult) {
          continue;
        }
      }

      match = { route: route, path: execResult["0"] };
      break;
    }

    if (!match) {
      return path.length === 0 ? true : false;
    }

    if ("redirectTo" in match.route) {
      return match.route.redirectTo;
    }

    newRoutes.push(match.route);

    if ("children" in match.route) {
      return this.findNewRoutes(
        path.slice(match.path.length),
        match.route.children,
        newRoutes
      );
    }

    return true;
  }

  private static insert(router: Router, component: CustomElementConstructor) {
    const sibling = router.nextElementSibling;
    if (
      sibling !== null &&
      sibling.localName !== this.ELEMENT_SELECTOR &&
      window.customElements.get(sibling.localName) !== undefined
    ) {
      sibling.remove();
    }

    router.parentNode?.insertBefore(new component(), router.nextSibling);
  }

  private static isRouterLocationValid(router: Router): boolean {
    if (this.routers.length === 0) return true;

    let element: Element = router;
    do {
      const rootNode = element.getRootNode();
      if (rootNode instanceof Document || !(rootNode instanceof ShadowRoot))
        return false;
      element = rootNode.host;
    } while (!(element.previousElementSibling instanceof Router));

    if (
      this.routers[this.routers.length - 1] !== element.previousElementSibling
    ) {
      return false;
    }

    return true;
  }

  private static getRoutesWithComponents(routes: Route[]): ComponentRoute[] {
    return routes.filter((route) => "component" in route) as ComponentRoute[];
  }
}
