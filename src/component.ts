/**
 * Before Components can be used, Component initialization must be completed by calling the static `Component.init()` method.
 *
 * A `Component` is an extension of an `HTMLElement`. It can be extended to create custom HTML elements.
 * When creating a `Component`, a template must be provided as either raw html or a URL. Style sheets can also be provided.
 *
 * For details on lifecycle events, see https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks.
 * For details on responding to attribute changes, see https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes.
 *
 * ```
 * class TestComponent extends Component {
 *   static observedAttributes = ["color"];
 *
 *   constructor() {
 *     super({
 *       templateUrl: "/components/app/app.component.html",
 *       styleUrls: ["/components/app/app.component.css"]
 *     });
 *   }
 *
 *   connectedCallback() {
 *     console.log("Custom element added to page.");
 *   }
 *
 *   disconnectedCallback() {
 *     console.log("Custom element removed from page.");
 *   }
 *
 *   connectedMoveCallback() {
 *     console.log("Custom element moved with moveBefore()");
 *   }
 *
 *   adoptedCallback() {
 *     console.log("Custom element moved to new page.");
 *   }
 *
 *   attributeChangedCallback(name, oldValue, newValue) {
 *     console.log(`Attribute ${name} has changed.`);
 *   }
 * }
 * ```
 */
export class Component extends HTMLElement {
  static observedAttributes: string[] = [];
  private static readonly componentNames = new Set<string>();
  private static readonly globalStyleSheets: CSSStyleSheet[] = [];
  private static readonly globalStyleUrls: string[] = [];
  private static readonly savedTemplates = new Map<string, Promise<string>>();
  private static readonly savedStyles = new Map<
    string,
    Promise<CSSStyleSheet>
  >();

  private template: Promise<string>;
  private styles: Promise<CSSStyleSheet>[] = [];

  /**
   * @returns A boolean that describes if Component initialization is complete.
   */
  static isInitialized(): boolean {
    return this.componentNames.size > 0;
  }

  /**
   * Initializes the Component with various options.
   * @param options A list of components, global styles, and global style URLs.
   * @throws If Component initialization is already complete, no components are provided in the `options` parameter,
   * or `window.customElements.define()` fails. See https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define#exceptions.
   */
  static init(options: {
    components: { name: string; constructor: CustomElementConstructor }[];
    globalStyles?: string[];
    globalStyleUrls?: string[];
  }) {
    if (this.isInitialized()) {
      throw new Error("Component initialization is already complete.");
    }

    if (options.components.length === 0) {
      throw new Error(
        "At least one component must be provided during Component initialization."
      );
    }

    try {
      if (options.globalStyles !== undefined) {
        for (const globalStyle of options.globalStyles) {
          this.globalStyleSheets.push(this.getCSSStyleSheet(globalStyle));
        }
      }

      if (options.globalStyleUrls !== undefined) {
        for (const globalStyleUrl of options.globalStyleUrls) {
          this.globalStyleUrls.push(globalStyleUrl);
        }
      }

      for (const component of options.components) {
        /**
         * No need to check if a component name already exists because the
         * custom element registry's define method will throw if a custom element
         * with either the same name or constructor has already been defined.
         * https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define#exceptions
         */
        this.componentNames.add(component.name);
        window.customElements.define(component.name, component.constructor);
      }
    } catch (error) {
      this.componentNames.clear();
      this.globalStyleSheets.length = 0;
      this.globalStyleUrls.length = 0;
      console.error("Component initialization failed.", error);
      throw error;
    }
  }

  private static getCSSStyleSheet(css: string): CSSStyleSheet {
    const newSheet = new CSSStyleSheet();
    newSheet.replaceSync(css);
    return newSheet;
  }

  constructor(config: {
    template?: string;
    templateUrl?: string;
    styles?: string[];
    styleUrls?: string[];
  }) {
    super();

    if (!Component.isInitialized()) {
      throw new Error("Component initialization has not been completed.");
    } else if (!Component.componentNames.has(this.localName)) {
      throw new Error(
        `${this.localName} was not listed as a component during Component initialization.`
      );
    }

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

  private getTemplate(templateUrl: string): Promise<string> {
    const saved = Component.savedTemplates.get(templateUrl);
    if (saved) return saved;

    const fetchResult = this.fetchFile(templateUrl).catch((error: Error) => {
      console.error(`Failed to fetch template at ${templateUrl}.`, error);
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
          console.error(`Failed to fetch styles at ${styleUrl}.`, error);
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
        `Response not ok: ${response.status} ${response.statusText}.`
      );
    }
    return await response.text();
  }
}
