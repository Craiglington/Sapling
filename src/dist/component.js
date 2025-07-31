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
export class Component extends HTMLElement {
    static observedAttributes = [];
    static globalStyleSheets = [];
    static globalStyleUrls = [];
    static savedTemplates = new Map();
    static savedStyles = new Map();
    template;
    styles = [];
    attachShadowRoot;
    insertSelector;
    constructor(config) {
        super();
        this.attachShadowRoot =
            config.attachShadowRoot !== undefined ? config.attachShadowRoot : true;
        this.insertSelector = config.insertSelector;
        if (config.template) {
            this.template = Promise.resolve(config.template);
        }
        else if (config.templateUrl) {
            this.template = this.getTemplate(config.templateUrl);
        }
        else {
            throw new Error("Either a template or a template url must be provided.");
        }
        this.styles = Component.globalStyleSheets
            .map((sheet) => Promise.resolve(sheet))
            .concat(this.getStyleSheets(Component.globalStyleUrls));
        if (config.styles) {
            this.styles = this.styles.concat(config.styles.map((css) => Promise.resolve(Component.getCSSStyleSheet(css))));
        }
        else if (config.styleUrls) {
            this.styles = this.styles.concat(this.getStyleSheets(config.styleUrls));
        }
    }
    static getCSSStyleSheet(css) {
        const newSheet = new CSSStyleSheet();
        newSheet.replaceSync(css);
        return newSheet;
    }
    /**
     *
     * Using this method will only add a global stylesheet to Components not yet created.
     * @param css The css.
     */
    static addGlobalStyleSheet(css) {
        Component.globalStyleSheets.push(Component.getCSSStyleSheet(css));
    }
    /**
     *
     * Using this method will only add a global stylesheet to Components not yet created.
     * @param url The url of the stylesheet. Ex: `/global.css`.
     */
    static addGlobalStyleUrl(url) {
        Component.globalStyleUrls.push(url);
    }
    /**
     * Queries the component and returns a child.
     * @param selectors A valid CSS selector.
     * @returns `null` if the element is not found or an `Element`.
     */
    getChild(selectors) {
        return this.attachShadowRoot
            ? this.shadowRoot?.querySelector(selectors) || null
            : this.querySelector(selectors);
    }
    /**
     * Queries the component and returns a list of children.
     * @param selectors A valid CSS selector.
     * @returns `null` if the element is not found or a list of `Elements`.
     */
    getChildren(selectors) {
        return this.attachShadowRoot
            ? this.shadowRoot?.querySelectorAll(selectors) || null
            : this.querySelectorAll(selectors);
    }
    /**
     * This method is called once the element has been connected in the `DOM`.
     *
     * Make sure to call `super.connectedCallback()` or `await super.connectedCallback()` if overriding.
     * Use `await` to ensure that all template and style files have finished loading and being applied before continuing.
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
     */
    async connectedCallback() {
        const existingHTML = this.innerHTML;
        this.innerHTML = "";
        const template = await this.template;
        const styles = await Promise.all(this.styles);
        if (this.attachShadowRoot) {
            this.attachShadow({ mode: "open" });
            if (!this.shadowRoot) {
                throw new Error("Failed to attach a shadow DOM to the component.");
            }
            this.shadowRoot.innerHTML += template;
            this.shadowRoot.adoptedStyleSheets =
                this.shadowRoot.adoptedStyleSheets.concat(styles);
        }
        else {
            this.innerHTML += template;
            const root = this.getRootNode();
            root.adoptedStyleSheets = root.adoptedStyleSheets.concat(styles);
        }
        if (this.insertSelector && existingHTML) {
            const insertElement = this.getChild(this.insertSelector);
            if (insertElement) {
                insertElement.innerHTML += existingHTML;
            }
        }
    }
    /**
     * Provided as suggested by mdn web docs.
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
     */
    connectedMoveCallback() { }
    getTemplate(templateUrl) {
        const saved = Component.savedTemplates.get(templateUrl);
        if (saved)
            return saved;
        const fetchResult = this.fetchFile(templateUrl).catch((error) => {
            console.error(`Failed to fetch template at ${templateUrl}: `, error);
            return "";
        });
        Component.savedTemplates.set(templateUrl, fetchResult);
        return fetchResult;
    }
    getStyleSheets(styleUrls) {
        if (styleUrls.length === 0)
            return [];
        const sheets = [];
        for (const styleUrl of styleUrls) {
            const saved = Component.savedStyles.get(styleUrl);
            if (saved) {
                sheets.push(saved);
                continue;
            }
            const sheet = this.fetchFile(styleUrl)
                .then((response) => {
                const newSheet = new CSSStyleSheet();
                newSheet.replaceSync(response);
                return newSheet;
            })
                .catch((error) => {
                console.error(`Failed to fetch styles at ${styleUrl}: `, error);
                return new CSSStyleSheet();
            });
            Component.savedStyles.set(styleUrl, sheet);
            sheets.push(sheet);
        }
        return sheets;
    }
    async fetchFile(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response not ok. Status: ${response.status}. ${response.statusText}`);
        }
        return await response.text();
    }
}
