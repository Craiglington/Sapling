/**
 * All Urls should be relative to the `app` directory.
 */
export type ComponentConfig = {
    templateUrl: string;
    styleUrls?: string[];
};
/**
 * See https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements for details on lifecycle events.
 */
export declare class Component extends HTMLElement {
    static observedAttributes: never[];
    private static globalStyleSheets;
    private static savedTemplates;
    private static savedStyles;
    private config;
    private getTemplatePromise;
    private getStyleSheetsPromise;
    constructor(config: ComponentConfig);
    /**
     * Using this method will only add a global stylesheet to Components not yet created.
     * @param url The url of the stylesheet. Ex: `/global.css`.
     */
    static addGlobalStyleSheet(url: string): void;
    connectedCallback(): Promise<void>;
    connectedMoveCallback(): void;
    private getTemplate;
    private getStyleSheets;
    private fetchFile;
}
