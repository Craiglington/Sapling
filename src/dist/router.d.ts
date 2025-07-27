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
export type Route = {
    path: RegExp;
} & (ComponentRoute | RedirectRoute);
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
export declare class RouterService {
    private static config?;
    private constructor();
    /**
     * Initializes the `RouterService` with a `RouterConfig`.
     * @param config
     */
    static init(config: RouterConfig): void;
    /**
     * Takes a path and searches for a `Route` that matches. Only the first match will be used.
     * @param path The path to route towards. Also the path that will be inserted into the url.
     * @param pushToHistory An option to not save the route to the browser's history.
     */
    static route(path: string, pushToHistory?: boolean): void;
    private static insert;
}
