export type ComponentConfig = {
  templateUrl: string;
  styleUrls?: string[];
};

/**
 * See https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements
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
   * @param url The url of the stylesheet. Ex: `/styles/global.css`.
   */
  static addGlobalStyleSheet(url: string) {
    Component.globalStyleSheets.push(url);
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });

    this.getTemplatePromise.then((template) => {
      this.shadowRoot!.innerHTML += template;
    });

    this.getStyleSheetsPromise.then((sheets) => {
      this.shadowRoot!.adoptedStyleSheets =
        this.shadowRoot!.adoptedStyleSheets.concat(sheets);
    });
  }

  private getTemplate(): Promise<string> {
    return new Promise<string>((resolve) => {
      if (Component.savedTemplates[this.config.templateUrl]) {
        resolve(Component.savedTemplates[this.config.templateUrl]);
      } else {
        fetch(this.config.templateUrl)
          .then((response) => response.text())
          .then((response) => {
            Component.savedTemplates[this.config.templateUrl] = response;
            resolve(response);
          });
      }
    });
  }

  private getStyleSheets(): Promise<CSSStyleSheet[]> {
    const styleUrls = Component.globalStyleSheets.concat(
      this.config.styleUrls || []
    );

    if (styleUrls.length === 0) {
      return Promise.resolve([]);
    }

    const promises: Promise<CSSStyleSheet>[] = [];

    for (const styleUrl of styleUrls) {
      if (Component.savedStyles[styleUrl]) {
        promises.push(Promise.resolve(Component.savedStyles[styleUrl]));
        continue;
      }
      promises.push(
        fetch(styleUrl)
          .then((response) => response.text())
          .then((response) => {
            const newSheet = new CSSStyleSheet();
            newSheet.replaceSync(response);
            Component.savedStyles[styleUrl] = newSheet;
            return newSheet;
          })
      );
    }

    return Promise.all(promises);
  }
}
