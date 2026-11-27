import { Component } from "/src/component.js";

type File = { url: string; content: string };

const templateFile: File = {
  url: "/template.html",
  content: '<h1>Hello world!</h1><div id="content"></div>'
};

const styleSheetsFiles: File[] = [
  {
    url: "/styles-one.css",
    content: "body { color: blue; } a { color: green; }"
  },
  {
    url: "/styles-two.css",
    content: "h1 { color: black !important; }"
  },
  {
    url: "/styles-three.css",
    content: ".spacer { flex: 1 1 auto; }"
  }
];

const globalStyleSheets: string[] = [
  "p { text-decoration: underline; } .flex { display: flex; }",
  ".flex-column { display: flex; flex-direction: column; }"
];

const globalStyleSheetFiles: File[] = [
  {
    url: "/global-styles-one.css",
    content: "p { font-weight: bold; } body { margin: 0px; }"
  },
  {
    url: "/global-styles-two.css",
    content: "p { padding-top: 15px; } .flex { display: flex; }"
  }
];

const mockFetch = async (input: RequestInfo | URL) => {
  if (input === templateFile.url) {
    return new Response(templateFile.content);
  }

  for (const sheet of globalStyleSheetFiles) {
    if (input === sheet.url) {
      return new Response(sheet.content);
    }
  }

  for (const sheet of styleSheetsFiles) {
    if (input === sheet.url) {
      return new Response(sheet.content);
    }
  }

  return new Response(null, {
    status: 404,
    statusText: "Not Found"
  });
};

function getCssStyleSheetStyles(cssStyleSheets: CSSStyleSheet[]): string[] {
  return cssStyleSheets.map((sheet) =>
    [...sheet.cssRules].map((cssRule) => cssRule.cssText).join(" ")
  );
}

describe("Component", () => {
  let component: Component;
  let customElementsDefineSpy: jasmine.Spy<typeof window.customElements.define>;
  let fetchSpy: jasmine.Spy<typeof window.fetch>;

  function getFetchCalls(): string[] {
    return fetchSpy.calls.all().map((call) => String(call.args[0]));
  }

  class ComponentWithTemplateAndStyleUrl extends Component {
    static name = "component-with-template-and-style-url";
    static observedAttributes = ["size"];
    constructor() {
      super({
        templateUrl: templateFile.url,
        styleUrls: styleSheetsFiles.map((sheet) => sheet.url)
      });
    }
  }

  class ComponentWithTemplateAndStyle extends Component {
    static name = "component-with-template-and-style";
    static observedAttributes = ["color"];
    constructor() {
      super({
        template: templateFile.content,
        styles: styleSheetsFiles.map((sheet) => sheet.content)
      });
    }
  }

  class ComponentWithNoStyle extends Component {
    static name = "component-with-no-style";
    constructor() {
      super({
        templateUrl: templateFile.url
      });
    }
  }

  class ComponentWithNoTemplate extends Component {
    static name = "component-with-no-template";
    constructor() {
      super({});
    }
  }

  class ComponentNotProvided extends Component {
    static name = "component-not-provided";
    constructor() {
      super({
        templateUrl: templateFile.url
      });
    }
  }

  beforeAll(() => {
    window.customElements.define(
      ComponentWithTemplateAndStyleUrl.name,
      ComponentWithTemplateAndStyleUrl
    );
    window.customElements.define(
      ComponentWithTemplateAndStyle.name,
      ComponentWithTemplateAndStyle
    );
    window.customElements.define(
      ComponentWithNoStyle.name,
      ComponentWithNoStyle
    );
    window.customElements.define(
      ComponentWithNoTemplate.name,
      ComponentWithNoTemplate
    );
    window.customElements.define(
      ComponentNotProvided.name,
      ComponentNotProvided
    );
  });

  beforeEach(() => {
    Component["componentNames"].clear();
    Component["globalStyleSheets"].length = 0;
    Component["globalStyleUrls"].length = 0;
    Component["savedTemplates"].clear();
    Component["savedStyles"].clear();

    customElementsDefineSpy = spyOn(window.customElements, "define");
    fetchSpy = spyOn(window, "fetch").and.callFake(mockFetch);
  });

  afterEach(async () => {
    if (component) {
      await component["template"];
      for (const style of component["styles"]) {
        await style;
      }
    }
  });

  describe("init()", () => {
    it("should not be automatically initialized", () => {
      expect(Component.isInitialized()).toBeFalse();
    });

    it("should throw an error during initialization if already initialized", () => {
      const isInitializedSpy = spyOn(
        Component,
        "isInitialized"
      ).and.returnValue(true);

      expect(() => {
        Component.init({ components: [] });
      }).toThrow();

      expect(isInitializedSpy).toHaveBeenCalled();
    });

    it("should throw an error during initialization if no components are provided", () => {
      expect(Component.isInitialized()).toBeFalse();
      expect(() => {
        Component.init({ components: [] });
      }).toThrow();
    });

    it("should add global styles, global style URLs, and component names", () => {
      Component.init({
        components: [
          {
            name: ComponentWithTemplateAndStyleUrl.name,
            constructor: ComponentWithTemplateAndStyleUrl
          }
        ],
        globalStyles: globalStyleSheets,
        globalStyleUrls: globalStyleSheetFiles.map((file) => file.url)
      });

      expect(Component["globalStyleSheets"].length).toBe(
        globalStyleSheets.length
      );
      expect(getCssStyleSheetStyles(Component["globalStyleSheets"])).toEqual(
        globalStyleSheets
      );

      expect(Component["globalStyleUrls"].length).toBe(
        globalStyleSheetFiles.length
      );
      expect(Component["globalStyleUrls"]).toEqual(
        globalStyleSheetFiles.map((file) => file.url)
      );

      expect(Component["componentNames"].size).toBe(1);
      expect(
        Component["componentNames"].has(ComponentWithTemplateAndStyleUrl.name)
      ).toBeTrue();
      expect(customElementsDefineSpy).toHaveBeenCalledOnceWith(
        ComponentWithTemplateAndStyleUrl.name,
        ComponentWithTemplateAndStyleUrl
      );
    });

    it("should reset component properties when define throws", () => {
      customElementsDefineSpy.and.throwError("Test error message.");
      const consoleErrorSpy = spyOn(console, "error");

      expect(() => {
        Component.init({
          components: [
            {
              name: ComponentWithTemplateAndStyleUrl.name,
              constructor: ComponentWithTemplateAndStyleUrl
            }
          ],
          globalStyles: globalStyleSheets,
          globalStyleUrls: globalStyleSheetFiles.map((file) => file.url)
        });
      }).toThrow();

      expect(Component["globalStyleSheets"].length).toBe(0);
      expect(Component["globalStyleUrls"].length).toBe(0);
      expect(Component["componentNames"].size).toBe(0);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("constructor()", () => {
    beforeEach(() => {
      Component.init({
        components: [
          {
            name: ComponentWithTemplateAndStyleUrl.name,
            constructor: ComponentWithTemplateAndStyleUrl
          },
          {
            name: ComponentWithTemplateAndStyle.name,
            constructor: ComponentWithTemplateAndStyle
          },
          {
            name: ComponentWithNoTemplate.name,
            constructor: ComponentWithNoTemplate
          },
          {
            name: ComponentWithNoStyle.name,
            constructor: ComponentWithNoStyle
          }
        ],
        globalStyles: globalStyleSheets,
        globalStyleUrls: globalStyleSheetFiles.map((file) => file.url)
      });
    });

    it("should throw if Component initialization is not complete", () => {
      const isInitializedSpy = spyOn(
        Component,
        "isInitialized"
      ).and.returnValue(false);

      expect(() => {
        new ComponentWithTemplateAndStyleUrl();
      }).toThrowError("Component initialization has not been completed.");

      expect(isInitializedSpy).toHaveBeenCalled();
    });

    it("should throw if the component was not provided during Component initialization", () => {
      expect(() => {
        new ComponentNotProvided();
      }).toThrowError(
        `${ComponentNotProvided.name} was not listed as a component during Component initialization.`
      );
    });

    it("should throw if no template is provided", () => {
      expect(() => {
        new ComponentWithNoTemplate();
      }).toThrowError("Either a template or a template url must be provided.");
    });

    it("should create and begin fetching files for a component with a literal template and styles", () => {
      component = new ComponentWithTemplateAndStyle();

      expect(component).toBeTruthy();
      expect(component["template"]).toBeTruthy();
      expect(component["styles"].length).toBe(
        styleSheetsFiles.length +
          globalStyleSheets.length +
          globalStyleSheetFiles.length
      );
    });

    it("should create and begin fetching files for a component with a URL template and styles", () => {
      component = new ComponentWithTemplateAndStyleUrl();

      expect(component).toBeTruthy();
      expect(component["template"]).toBeTruthy();
      expect(component["styles"].length).toBe(
        styleSheetsFiles.length +
          globalStyleSheets.length +
          globalStyleSheetFiles.length
      );
    });

    it("should create and begin fetching files for a component with a literal template", () => {
      component = new ComponentWithNoStyle();

      expect(component).toBeTruthy();
      expect(component["template"]).toBeTruthy();
      expect(component["styles"].length).toBe(
        globalStyleSheets.length + globalStyleSheetFiles.length
      );
    });
  });

  describe("connectedCallback()", () => {
    beforeEach(() => {
      fetchSpy.calls.reset();
      Component.init({
        components: [
          {
            name: ComponentWithTemplateAndStyleUrl.name,
            constructor: ComponentWithTemplateAndStyleUrl
          },
          {
            name: ComponentWithTemplateAndStyle.name,
            constructor: ComponentWithTemplateAndStyle
          },
          {
            name: ComponentWithNoStyle.name,
            constructor: ComponentWithNoStyle
          }
        ],
        globalStyles: globalStyleSheets,
        globalStyleUrls: globalStyleSheetFiles.map((file) => file.url)
      });
    });

    it("should throw if the shadow root is null", async () => {
      component = new ComponentWithTemplateAndStyle();
      spyOn(component, "attachShadow");

      await expectAsync(component.connectedCallback()).toBeRejectedWithError(
        "Failed to attach a shadow DOM to the component."
      );

      expect(component.attachShadow).toHaveBeenCalledOnceWith({ mode: "open" });
    });

    it("should successfully attach the shadow root and add the literal template and styles", async () => {
      component = new ComponentWithTemplateAndStyle();
      spyOn(component, "attachShadow").and.callThrough();

      await component.connectedCallback();

      expect(component.attachShadow).toHaveBeenCalledOnceWith({
        mode: "open"
      });
      expect(component.shadowRoot).toBeTruthy();
      expect(component.shadowRoot!.innerHTML).toBe(templateFile.content);
      expect(
        getCssStyleSheetStyles(component.shadowRoot!.adoptedStyleSheets)
      ).toEqual(
        globalStyleSheets.concat(
          globalStyleSheetFiles
            .concat(styleSheetsFiles)
            .map((file) => file.content)
        )
      );
      const fetchCalls = getFetchCalls();
      expect(fetchCalls.includes(templateFile.url)).toBeFalse();
      for (const styleSheet of styleSheetsFiles) {
        expect(fetchCalls.includes(styleSheet.url)).toBeFalse();
      }
      for (const globalStyleSheet of globalStyleSheetFiles) {
        expect(fetchCalls.includes(globalStyleSheet.url)).toBeTrue();
      }
    });

    it("should successfully attach the shadow root and add the template and styles from URLs", async () => {
      component = new ComponentWithTemplateAndStyleUrl();
      spyOn(component, "attachShadow").and.callThrough();

      await component.connectedCallback();

      expect(component.attachShadow).toHaveBeenCalledOnceWith({
        mode: "open"
      });
      expect(component.shadowRoot).toBeTruthy();
      expect(component.shadowRoot!.innerHTML).toBe(templateFile.content);
      expect(
        getCssStyleSheetStyles(component.shadowRoot!.adoptedStyleSheets)
      ).toEqual(
        globalStyleSheets.concat(
          globalStyleSheetFiles
            .concat(styleSheetsFiles)
            .map((file) => file.content)
        )
      );
      const fetchCalls = getFetchCalls();
      expect(fetchCalls.includes(templateFile.url)).toBeTrue();
      for (const styleSheet of styleSheetsFiles) {
        expect(fetchCalls.includes(styleSheet.url)).toBeTrue();
      }
      for (const globalStyleSheet of globalStyleSheetFiles) {
        expect(fetchCalls.includes(globalStyleSheet.url)).toBeTrue();
      }
    });

    it("should successfully attach the shadow root and add the literal template", async () => {
      component = new ComponentWithNoStyle();
      spyOn(component, "attachShadow").and.callThrough();

      await component.connectedCallback();

      expect(component.attachShadow).toHaveBeenCalledOnceWith({
        mode: "open"
      });
      expect(component.shadowRoot).toBeTruthy();
      expect(component.shadowRoot!.innerHTML).toBe(templateFile.content);
      expectAsync(
        Component["savedTemplates"].get(templateFile.url)
      ).toBeResolvedTo(templateFile.content);
      expect(
        getCssStyleSheetStyles(component.shadowRoot!.adoptedStyleSheets)
      ).toEqual(
        globalStyleSheets.concat(
          globalStyleSheetFiles.map((file) => file.content)
        )
      );
      const fetchCalls = getFetchCalls();
      expect(fetchCalls.includes(templateFile.url)).toBeTrue();
      for (const styleSheet of styleSheetsFiles) {
        expect(fetchCalls.includes(styleSheet.url)).toBeFalse();
      }
      for (const globalStyleSheet of globalStyleSheetFiles) {
        expect(fetchCalls.includes(globalStyleSheet.url)).toBeTrue();
      }
    });

    it("should set an empty template if fetch fails with 500 error", async () => {
      spyOn(console, "error");
      const errorResponse = new Response(null, {
        status: 500,
        statusText: "Internal Server Error"
      });

      fetchSpy.and.callFake(async (input: RequestInfo | URL) => {
        if (input === templateFile.url) {
          return errorResponse;
        }

        for (const sheet of globalStyleSheetFiles) {
          if (input === sheet.url) {
            return new Response(sheet.content);
          }
        }

        for (const sheet of styleSheetsFiles) {
          if (input === sheet.url) {
            return new Response(sheet.content);
          }
        }

        return new Response(null, {
          status: 404,
          statusText: "Not Found"
        });
      });

      component = new ComponentWithTemplateAndStyleUrl();

      await expectAsync(component.connectedCallback()).toBeResolved();
      expect(component.shadowRoot).toBeTruthy();
      expect(component.shadowRoot!.innerHTML).toBe("");
      expectAsync(
        Component["savedTemplates"].get(templateFile.url)
      ).toBeResolvedTo("");
      expect(console.error).toHaveBeenCalledOnceWith(
        `Failed to fetch template at ${templateFile.url}.`,
        new Error(
          `Response not ok: ${errorResponse.status} ${errorResponse.statusText}.`
        )
      );
    });

    it("should set an empty template if fetch fails with 404 error", async () => {
      spyOn(console, "error");

      fetchSpy.and.callFake(async (input: RequestInfo | URL) => {
        for (const sheet of globalStyleSheetFiles) {
          if (input === sheet.url) {
            return new Response(sheet.content);
          }
        }

        for (const sheet of styleSheetsFiles) {
          if (input === sheet.url) {
            return new Response(sheet.content);
          }
        }

        return new Response(null, {
          status: 404,
          statusText: "Not Found"
        });
      });

      component = new ComponentWithTemplateAndStyleUrl();

      await expectAsync(component.connectedCallback()).toBeResolved();
      expect(component.shadowRoot).toBeTruthy();
      expect(component.shadowRoot!.innerHTML).toBe("");
      expectAsync(
        Component["savedTemplates"].get(templateFile.url)
      ).toBeResolvedTo("");
      expect(console.error).toHaveBeenCalledOnceWith(
        `Failed to fetch template at ${templateFile.url}.`,
        new Error("Response not ok: 404 Not Found.")
      );
    });

    it("should set an empty CSS style sheet if fetch fails with 500 error", async () => {
      spyOn(console, "error");
      const errorResponse = new Response(null, {
        status: 500,
        statusText: "Internal Server Error"
      });

      fetchSpy.and.callFake(async (input: RequestInfo | URL) => {
        if (input === templateFile.url) {
          return new Response(templateFile.content);
        }

        for (const sheet of globalStyleSheetFiles) {
          if (input === sheet.url) {
            return errorResponse;
          }
        }

        for (const sheet of styleSheetsFiles) {
          if (input === sheet.url) {
            return errorResponse;
          }
        }

        return new Response(null, {
          status: 404,
          statusText: "Not Found"
        });
      });

      component = new ComponentWithTemplateAndStyleUrl();

      await expectAsync(component.connectedCallback()).toBeResolved();
      expect(component.shadowRoot).toBeTruthy();
      for (const styleSheet of styleSheetsFiles) {
        expect(Component["savedStyles"].get(styleSheet.url)).toBeTruthy();
        expectAsync(
          Component["savedStyles"].get(styleSheet.url)
        ).toBeResolvedTo(new CSSStyleSheet());
        expect(console.error).toHaveBeenCalledWith(
          `Failed to fetch styles at ${styleSheet.url}.`,
          new Error(
            `Response not ok: ${errorResponse.status} ${errorResponse.statusText}.`
          )
        );
      }
      for (const styleSheet of globalStyleSheetFiles) {
        expect(Component["savedStyles"].get(styleSheet.url)).toBeTruthy();
        expectAsync(
          Component["savedStyles"].get(styleSheet.url)
        ).toBeResolvedTo(new CSSStyleSheet());
        expect(console.error).toHaveBeenCalledWith(
          `Failed to fetch styles at ${styleSheet.url}.`,
          new Error(
            `Response not ok: ${errorResponse.status} ${errorResponse.statusText}.`
          )
        );
      }
    });

    it("should set an empty CSS style sheet if fetch fails with 404 error", async () => {
      spyOn(console, "error");

      fetchSpy.and.callFake(async (input: RequestInfo | URL) => {
        if (input === templateFile.url) {
          return new Response(templateFile.content);
        }

        return new Response(null, {
          status: 404,
          statusText: "Not Found"
        });
      });

      component = new ComponentWithTemplateAndStyleUrl();

      await expectAsync(component.connectedCallback()).toBeResolved();
      expect(component.shadowRoot).toBeTruthy();
      for (const styleSheet of styleSheetsFiles) {
        expect(Component["savedStyles"].get(styleSheet.url)).toBeTruthy();
        expectAsync(
          Component["savedStyles"].get(styleSheet.url)
        ).toBeResolvedTo(new CSSStyleSheet());
        expect(console.error).toHaveBeenCalledWith(
          `Failed to fetch styles at ${styleSheet.url}.`,
          new Error("Response not ok: 404 Not Found.")
        );
      }
      for (const styleSheet of globalStyleSheetFiles) {
        expect(Component["savedStyles"].get(styleSheet.url)).toBeTruthy();
        expectAsync(
          Component["savedStyles"].get(styleSheet.url)
        ).toBeResolvedTo(new CSSStyleSheet());
        expect(console.error).toHaveBeenCalledWith(
          `Failed to fetch styles at ${styleSheet.url}.`,
          new Error("Response not ok: 404 Not Found.")
        );
      }
    });

    it("should only call fetch once per URL", async () => {
      component = new ComponentWithTemplateAndStyleUrl();

      await expectAsync(component.connectedCallback()).toBeResolved();

      expect(fetchSpy).toHaveBeenCalledTimes(
        1 + styleSheetsFiles.length + globalStyleSheetFiles.length
      );
      expect(Component["savedTemplates"].get(templateFile.url)).toBeTruthy();
      for (const styleSheet of styleSheetsFiles) {
        expect(Component["savedStyles"].get(styleSheet.url)).toBeTruthy();
      }
      for (const styleSheet of globalStyleSheetFiles) {
        expect(Component["savedStyles"].get(styleSheet.url)).toBeTruthy();
      }

      fetchSpy.calls.reset();
      const secondComponent = new ComponentWithTemplateAndStyleUrl();
      spyOn(secondComponent, "attachShadow").and.callThrough();

      await secondComponent.connectedCallback();

      expect(secondComponent.attachShadow).toHaveBeenCalledOnceWith({
        mode: "open"
      });
      expect(secondComponent.shadowRoot).toBeTruthy();
      expect(secondComponent.shadowRoot!.innerHTML).toBe(templateFile.content);
      expect(
        getCssStyleSheetStyles(secondComponent.shadowRoot!.adoptedStyleSheets)
      ).toEqual(
        globalStyleSheets.concat(
          globalStyleSheetFiles
            .concat(styleSheetsFiles)
            .map((file) => file.content)
        )
      );
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe("getChild()", () => {
    beforeEach(() => {
      Component.init({
        components: [
          {
            name: ComponentWithNoStyle.name,
            constructor: ComponentWithNoStyle
          }
        ]
      });
      component = new ComponentWithNoStyle();
    });

    it("should return null if the shadow root does not exist", () => {
      expect(component.getChild("a")).toBeNull();
    });

    it("should return null if the child does not exist", async () => {
      await component.connectedCallback();

      expect(component.getChild("p")).toBeNull();
    });

    it("should get a child from the shadow root", async () => {
      await component.connectedCallback();

      expect(component.getChild("h1")).toBeInstanceOf(HTMLHeadingElement);
    });
  });

  describe("getChildren()", () => {
    beforeEach(() => {
      Component.init({
        components: [
          {
            name: ComponentWithNoStyle.name,
            constructor: ComponentWithNoStyle
          }
        ]
      });
      component = new ComponentWithNoStyle();
    });

    it("should return null if the shadow root does not exist", () => {
      expect(component.getChildren("a")).toBeNull();
    });

    it("should return an empty list if no children exist", async () => {
      await component.connectedCallback();

      const children = component.getChildren("p");
      expect(children).toBeTruthy();
      expect(children!.length).toBe(0);
    });

    it("should get children from the shadow root", async () => {
      await component.connectedCallback();

      const children = component.getChildren("*");
      expect(children).toBeTruthy();
      expect(children!.length).toBe(2);
    });
  });
});
