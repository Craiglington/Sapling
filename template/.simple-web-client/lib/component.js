/**
 * See https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements for details on lifecycle events.
 */
export class Component extends HTMLElement {
    static observedAttributes = [];
    static globalStyleSheets = ["/styles.css"];
    static savedTemplates = {};
    static savedStyles = {};
    config;
    getTemplatePromise;
    getStyleSheetsPromise;
    constructor(config) {
        super();
        this.config = config;
        this.getTemplatePromise = this.getTemplate();
        this.getStyleSheetsPromise = this.getStyleSheets();
    }
    /**
     * Using this method will only add a global stylesheet to Components not yet created.
     * @param url The url of the stylesheet. Ex: `/global.css`.
     */
    static addGlobalStyleSheet(url) {
        Component.globalStyleSheets.push(url);
    }
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
    connectedMoveCallback() { }
    getTemplate() {
        return new Promise((resolve) => {
            if (Component.savedTemplates[this.config.templateUrl]) {
                resolve(Component.savedTemplates[this.config.templateUrl]);
                return;
            }
            this.fetchFile(this.config.templateUrl)
                .then((response) => {
                Component.savedTemplates[this.config.templateUrl] = response;
                resolve(response);
            })
                .catch((error) => {
                console.error(`Failed to fetch template at ${this.config.templateUrl}: `, error);
                resolve("");
            });
        });
    }
    async getStyleSheets() {
        const styleUrls = Component.globalStyleSheets.concat(this.config.styleUrls || []);
        if (styleUrls.length === 0) {
            return [];
        }
        const promises = [];
        const sheets = [];
        for (const styleUrl of styleUrls) {
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
