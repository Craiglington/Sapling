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
export class Component extends HTMLElement {
  static observedAttributes = [];
  private static globalStyleSheets: CSSStyleSheet[] = [];
  private static globalStyleUrls: string[] = [];
  private static savedTemplates: Map<string, Promise<string>> = new Map();
  private static savedStyles: Map<string, Promise<CSSStyleSheet>> = new Map();

  private template: Promise<string>;
  private styles: Promise<CSSStyleSheet>[] = [];

  constructor(config: {
    template?: string;
    templateUrl?: string;
    styles?: string[];
    styleUrls?: string[];
  }) {
    super();

    if (config.template !== undefined) {
      this.template = Promise.resolve(config.template);
    } else if (config.templateUrl) {
      this.template = this.getTemplate(config.templateUrl);
    } else {
      throw new Error("Either a template or a template url must be provided.");
    }

    this.styles = Component.globalStyleSheets
      .map((sheet) => Promise.resolve(sheet))
      .concat(this.getStyleSheets(Component.globalStyleUrls));
    if (config.styles) {
      this.styles = this.styles.concat(
        config.styles.map((css) =>
          Promise.resolve(Component.getCSSStyleSheet(css))
        )
      );
    } else if (config.styleUrls) {
      this.styles = this.styles.concat(this.getStyleSheets(config.styleUrls));
    }
  }

  static getCSSStyleSheet(css: string): CSSStyleSheet {
    const newSheet = new CSSStyleSheet();
    newSheet.replaceSync(css);
    return newSheet;
  }

  /**
   *
   * Using this method will only add a global stylesheet to Components not yet created.
   * @param css The css.
   */
  static addGlobalStyleSheet(css: string) {
    Component.globalStyleSheets.push(Component.getCSSStyleSheet(css));
  }

  /**
   *
   * Using this method will only add a global stylesheet to Components not yet created.
   * @param url The url of the stylesheet. Ex: `/global.css`.
   */
  static addGlobalStyleUrl(url: string) {
    Component.globalStyleUrls.push(url);
  }

  /**
   * Queries the component and returns a child.
   * @param selectors A valid CSS selector.
   * @returns `null` if the element is not found or an `Element`.
   */
  getChild<E extends Element = Element>(selectors: string): E | null {
    return this.shadowRoot?.querySelector(selectors) || null;
  }

  /**
   * Queries the component and returns a list of children.
   * @param selectors A valid CSS selector.
   * @returns `null` if the element is not found or a list of `Elements`.
   */
  getChildren<E extends Element = Element>(
    selectors: string
  ): NodeListOf<E> | null {
    return this.shadowRoot?.querySelectorAll(selectors) || null;
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
    const template = await this.template;

    const styles = await Promise.all(this.styles);

    this.attachShadow({ mode: "open" });

    if (!this.shadowRoot) {
      throw new Error("Failed to attach a shadow DOM to the component.");
    }
    this.shadowRoot.innerHTML = template;
    this.shadowRoot.adoptedStyleSheets =
      this.shadowRoot.adoptedStyleSheets.concat(styles);
  }

  /**
   * Provided as suggested by mdn web docs.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
   */
  connectedMoveCallback() {}

  private getTemplate(templateUrl: string): Promise<string> {
    const saved = Component.savedTemplates.get(templateUrl);
    if (saved) return saved;

    const fetchResult = this.fetchFile(templateUrl).catch((error: Error) => {
      console.error(`Failed to fetch template at ${templateUrl}: `, error);
      return "";
    });
    Component.savedTemplates.set(templateUrl, fetchResult);
    return fetchResult;
  }

  private getStyleSheets(styleUrls: string[]): Promise<CSSStyleSheet>[] {
    if (styleUrls.length === 0) return [];

    const sheets: Promise<CSSStyleSheet>[] = [];
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
        .catch((error: Error) => {
          console.error(`Failed to fetch styles at ${styleUrl}: `, error);
          return new CSSStyleSheet();
        });
      Component.savedStyles.set(styleUrl, sheet);
      sheets.push(sheet);
    }
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
