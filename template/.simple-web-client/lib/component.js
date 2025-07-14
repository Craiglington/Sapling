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
    constructor(config) {
        super();
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
     * Queries the shadowRoot and returns a child.
     * @param selectors A valid CSS selector.
     * @returns `undefined` if `shadowRoot` is not defined, `null` if the element is not found, or an `Element`.
     */
    getChild(selectors) {
        return this.shadowRoot?.querySelector(selectors);
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
        this.attachShadow({ mode: "open" });
        if (!this.shadowRoot) {
            return;
        }
        const fetchResults = await Promise.all([
            this.getTemplatePromise,
            this.getStyleSheetsPromise
        ]);
        this.shadowRoot.innerHTML += fetchResults[0];
        this.shadowRoot.adoptedStyleSheets =
            this.shadowRoot.adoptedStyleSheets.concat(fetchResults[1]);
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
