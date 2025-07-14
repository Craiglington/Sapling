import { Subject } from "./subject.js";
/**
 * A `Component` is an extension of an `HTMLElement`. It can be extended to create custom HTML elements.
 * When creating a `Component`, paths to an `.html` file and `.css` files should be provided.
 * All `Component` elements will receive styling from the `/styles.css` file. Other global style sheets can be added.
 *
 * For every custom `Component`, make sure to add it to the custom element registry.
 * This is what allows for the custom `Component` to be used in an `.html` file.
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
export declare class Component<T extends {
    [key: string]: any;
} = {}> extends HTMLElement {
    static observedAttributes: never[];
    private static globalStyleSheets;
    private static savedTemplates;
    private static savedStyles;
    private templateUrl;
    private styleUrls;
    private getTemplatePromise;
    private getStyleSheetsPromise;
    protected inputs: {
        [K in keyof T]: Subject<T[K]>;
    };
    constructor(config: {
        templateUrl: string;
        styleUrls?: string[];
        inputs?: T;
    });
    /**
     *
     * Using this method will only add a global stylesheet to Components not yet created.
     * @param url The url of the stylesheet. Ex: `/global.css`.
     */
    static addGlobalStyleSheet(url: string): void;
    /**
     * Used to communicate to a child component. Set the value of an input.
     * @param key The input's key.
     * @param value The new value of the input.
     */
    setInput<K extends keyof T>(key: K, value: T[K]): void;
    /**
     * Queries the shadowRoot and returns a child.
     * @param selectors A valid CSS selector.
     * @returns `undefined` if `shadowRoot` is not defined, `null` if the element is not found, or an `Element`.
     */
    getChild<E extends Element = Element>(selectors: string): E | null | undefined;
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
     * Provided as suggested by `mdn web docs`.
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
     */
    connectedMoveCallback(): void;
    private getTemplate;
    private getStyleSheets;
    private fetchFile;
}
