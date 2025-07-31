/**
 * A `Component` is an extension of an `HTMLElement`. It can be extended to create custom HTML elements.
 * When creating a `Component`, a template must be provided. Style sheets can also be provided to either individual components or to all components.
 *
 * For every custom `Component`, make sure to add it to the custom element registry.
 * This is what allows for the custom component to be used in an `.html` file.
 *
 * For example:
 * ```
 * class TestComponent extends Component {
 *   constructor() {
 *     super({
 *       templateUrl: "/components/app/app.component.html",
 *       styleUrls: ["/components/app/app.component.css"]
 *     });
 *   }
 * }
 *
 * window.customElements.define("test-component", TestComponent);
 * ```
 *
 * There are optional configuration options for a `Component`.
 * - `attachShadowRoot`
 *   - Whether or not this component should be inserted into its own shadow DOM.
 * If `false`, this component will be inserted into its parent component's shadow DOM. If not provided, defaults to `true`.
 * - `insertSelector`
 *   - If provided, a component instance with existing HTML inside it will have that HTML inserted into an element in the template with a matching CSS selector.
 * This allows for a parent component to provide custom HTML to a child component within the parent component's template.
 *    - Example:
 *       ```
 *       // Custom component instance in a template
 *       <app-menu>
 *         // Custom html that will be inserted into the custom component's instance
 *         <span>Home</span>
 *         <span>Login</span>
 *         <span>Logout</span>
 *       </app-menu>
 *       ```
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks for details on lifecycle events.
 */
export declare class Component extends HTMLElement {
    static observedAttributes: never[];
    private static globalStyleSheets;
    private static globalStyleUrls;
    private static savedTemplates;
    private static savedStyles;
    private template;
    private styles;
    private attachShadowRoot;
    private insertSelector?;
    constructor(config: {
        template?: string;
        templateUrl?: string;
        styles?: string[];
        styleUrls?: string[];
        attachShadowRoot?: boolean;
        insertSelector?: string;
    });
    static getCSSStyleSheet(css: string): CSSStyleSheet;
    /**
     *
     * Using this method will only add a global stylesheet to Components not yet created.
     * @param css The css.
     */
    static addGlobalStyleSheet(css: string): void;
    /**
     *
     * Using this method will only add a global stylesheet to Components not yet created.
     * @param url The url of the stylesheet. Ex: `/global.css`.
     */
    static addGlobalStyleUrl(url: string): void;
    /**
     * Queries the component and returns a child.
     * @param selectors A valid CSS selector.
     * @returns `null` if the element is not found or an `Element`.
     */
    getChild<E extends Element = Element>(selectors: string): E | null;
    /**
     * Queries the component and returns a list of children.
     * @param selectors A valid CSS selector.
     * @returns `null` if the element is not found or a list of `Elements`.
     */
    getChildren<E extends Element = Element>(selectors: string): NodeListOf<E> | null;
    /**
     * This method is called once the element has been connected in the `DOM`.
     *
     * Make sure to call `super.connectedCallback()` or `await super.connectedCallback()` if overriding.
     * Use `await` to ensure that all template and style files have finished loading and being applied before continuing.
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
     */
    connectedCallback(): Promise<void>;
    /**
     * Provided as suggested by mdn web docs.
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
     */
    connectedMoveCallback(): void;
    private getTemplate;
    private getStyleSheets;
    private fetchFile;
}
