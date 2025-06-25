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
export class Component extends HTMLElement {
  static observedAttributes = [];
  private static globalStyleSheets: string[] = ["/styles.css"];
  private static savedTemplates: Record<string, string> = {};
  private static savedStyles: Record<string, CSSStyleSheet> = {};

  private config: ComponentConfig;
  private getTemplatePromise: Promise<string>;
  private getStyleSheetsPromise: Promise<CSSStyleSheet[]>;

  constructor(config: ComponentConfig) {
    super();
    this.config = config;
    this.getTemplatePromise = this.getTemplate();
    this.getStyleSheetsPromise = this.getStyleSheets();
  }

  /**
   * Using this method will only add a global stylesheet to Components not yet created.
   * @param url The url of the stylesheet. Ex: `/global.css`.
   */
  static addGlobalStyleSheet(url: string) {
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

  connectedMoveCallback() {}

  private getTemplate(): Promise<string> {
    return new Promise<string>((resolve) => {
      if (Component.savedTemplates[this.config.templateUrl]) {
        resolve(Component.savedTemplates[this.config.templateUrl]);
        return;
      }
      this.fetchFile(this.config.templateUrl)
        .then((response) => {
          Component.savedTemplates[this.config.templateUrl] = response;
          resolve(response);
        })
        .catch((error: Error) => {
          console.error(
            `Failed to fetch template at ${this.config.templateUrl}: `,
            error
          );
          resolve("");
        });
    });
  }

  private async getStyleSheets(): Promise<CSSStyleSheet[]> {
    const styleUrls = Component.globalStyleSheets.concat(
      this.config.styleUrls || []
    );

    if (styleUrls.length === 0) {
      return [];
    }

    const promises: Promise<void>[] = [];
    const sheets: CSSStyleSheet[] = [];

    for (const styleUrl of styleUrls) {
      if (Component.savedStyles[styleUrl]) {
        sheets.push(Component.savedStyles[styleUrl]);
        continue;
      }
      promises.push(
        this.fetchFile(styleUrl)
          .then((response) => {
            const newSheet = new CSSStyleSheet();
            newSheet.replaceSync(response);
            Component.savedStyles[styleUrl] = newSheet;
            sheets.push(newSheet);
          })
          .catch((error: Error) => {
            console.error(`Failed to fetch css at ${styleUrl}: `, error);
          })
      );
    }

    await Promise.all(promises);

    return sheets;
  }

  private async fetchFile(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Response not ok. Status: ${response.status}. ${response.statusText}`
      );
    }
    return await response.text();
  }
}
