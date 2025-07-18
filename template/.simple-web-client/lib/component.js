import { Subject } from "./subject.js";
/**
 * A `Component` is an extension of an `HTMLElement`. It can be extended to create custom HTML elements.
 * When creating a `Component`, paths to an `.html` file and `.css` files should be provided.
 * All `Component` elements will receive styling from the `/styles.css` file. Other global style sheets can be added.
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
 * There are several optional configuration options for a `Component`.
 * - `inputs`
 *   - Key value pairs used to create `Subjects` during `Component` construction.
 * The `Subjects` can be subscribed to from within the component and can be set from a parent component.
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
    static globalStyleSheets = ["/styles.css"];
    static savedTemplates = {};
    static savedStyles = {};
    templateUrl;
    styleUrls;
    getTemplatePromise;
    getStyleSheetsPromise;
    inputs = {};
    attachShadowRoot;
    insertSelector;
    constructor(config) {
        super();
        this.attachShadowRoot =
            config.attachShadowRoot !== undefined ? config.attachShadowRoot : true;
        this.insertSelector = config.insertSelector;
        this.templateUrl = config.templateUrl;
        this.styleUrls = config.styleUrls || [];
        this.getTemplatePromise = this.getTemplate();
        this.getStyleSheetsPromise = this.getStyleSheets();
        if (config.inputs) {
            for (const key in config.inputs) {
                this.inputs[key] = new Subject(config.inputs[key]);
            }
        }
    }
    /**
     *
     * Using this method will only add a global stylesheet to Components not yet created.
     * @param url The url of the stylesheet. Ex: `/global.css`.
     */
    static addGlobalStyleSheet(url) {
        Component.globalStyleSheets.push(url);
    }
    /**
     * Used to communicate to a child component. Set the value of an input.
     * @param key The input's key.
     * @param value The new value of the input.
     */
    setInput(key, value) {
        this.inputs[key].emit(value);
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
     * Queries the component and returns a list of child.
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
        const fetchResults = await Promise.all([
            this.getTemplatePromise,
            this.getStyleSheetsPromise
        ]);
        if (this.attachShadowRoot) {
            this.attachShadow({ mode: "open" });
            if (!this.shadowRoot) {
                throw new Error("Failed to attach a shadow DOM to the component.");
            }
            this.shadowRoot.innerHTML += fetchResults[0];
            this.shadowRoot.adoptedStyleSheets =
                this.shadowRoot.adoptedStyleSheets.concat(fetchResults[1]);
        }
        else {
            this.innerHTML += fetchResults[0];
            const root = this.getRootNode();
            root.adoptedStyleSheets = root.adoptedStyleSheets.concat(fetchResults[1]);
        }
        if (this.insertSelector && existingHTML) {
            this.insertExistingHTML(this.insertSelector, existingHTML);
        }
    }
    insertExistingHTML(selector, html) {
        const insertElement = this.getChild(selector);
        if (insertElement) {
            insertElement.innerHTML += html;
        }
    }
    /**
     * Provided as suggested by `mdn web docs`.
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
     */
    connectedMoveCallback() { }
    getTemplate() {
        return new Promise((resolve) => {
            if (Component.savedTemplates[this.templateUrl]) {
                resolve(Component.savedTemplates[this.templateUrl]);
                return;
            }
            this.fetchFile(this.templateUrl)
                .then((response) => {
                Component.savedTemplates[this.templateUrl] = response;
                resolve(response);
            })
                .catch((error) => {
                console.error(`Failed to fetch template at ${this.templateUrl}: `, error);
                resolve("");
            });
        });
    }
    async getStyleSheets() {
        const allStyleUrls = Component.globalStyleSheets.concat(this.styleUrls);
        if (allStyleUrls.length === 0) {
            return [];
        }
        const promises = [];
        const sheets = [];
        for (const styleUrl of allStyleUrls) {
            if (Component.savedStyles[styleUrl]) {
                sheets.push(Component.savedStyles[styleUrl]);
                continue;
            }
            promises.push(this.fetchFile(styleUrl)
                .then((response) => {
                const newSheet = new CSSStyleSheet();
                newSheet.replaceSync(response);
                Component.savedStyles[styleUrl] = newSheet;
                sheets.push(newSheet);
            })
                .catch((error) => {
                console.error(`Failed to fetch css at ${styleUrl}: `, error);
            }));
        }
        await Promise.all(promises);
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
