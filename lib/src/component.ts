/**
 * All urls should consider the `app` directory as the root directory.
 */
export type ComponentConfig = {
  templateUrl: string;
  styleUrls?: string[];
};

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
   *
   * Using this method will only add a global stylesheet to Components not yet created.
   * @param url The url of the stylesheet. Ex: `/global.css`.
   */
  static addGlobalStyleSheet(url: string) {
    Component.globalStyleSheets.push(url);
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
