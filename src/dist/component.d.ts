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
 * See https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks for details on lifecycle events.
 */
export declare class Component extends HTMLElement {
    static observedAttributes: string[];
    private static globalStyleSheets;
    private static globalStyleUrls;
    private static savedTemplates;
    private static savedStyles;
    private template;
    private styles;
    constructor(config: {
        template?: string;
        templateUrl?: string;
        styles?: string[];
        styleUrls?: string[];
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
