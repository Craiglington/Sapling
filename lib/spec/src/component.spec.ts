import { Component } from "/__src__/component.js";

type File = { url: string; content: string };
const template: File = {
  url: "/template.html",
  content: "<h1>Hello world!</h1>"
};
const styleSheets: File[] = [
  {
    url: "/styles-one.css",
    content: "body { color: blue; }"
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
const globalStyleSheets: File[] = [
  {
    url: "/styles.css",
    content: "p { font-weight: bold; }"
  }
];

describe("Component", () => {
  class TestComponent extends Component {
    constructor() {
      super({
        templateUrl: template.url,
        styleUrls: styleSheets.map((sheet) => sheet.url)
      });
    }
  }

  window.customElements.define("test-component", TestComponent);

  let testComponent: TestComponent;

  beforeAll(() => {
    spyOn(window, "fetch").and.callFake(async (input: RequestInfo | URL) => {
      if (input === template.url) {
        return new Response(template.content);
      }

      for (const sheet of globalStyleSheets) {
        if (input === sheet.url) {
          return new Response(sheet.content);
        }
      }

      for (const sheet of styleSheets) {
        if (input === sheet.url) {
          return new Response(sheet.content);
        }
      }

      return new Response(null, {
        status: 404,
        statusText: "Not Found"
      });
    });
  });

  beforeEach(() => {
    testComponent = new TestComponent();
  });

  it("should have global style sheets", () => {
    expect(Component["globalStyleSheets"]).toEqual(
      globalStyleSheets.map((sheet) => sheet.url)
    );
  });

  it("should create and begin fetching files", () => {
    expect(testComponent).toBeTruthy();
    expect(testComponent["getTemplatePromise"]).toBeTruthy();
    expect(testComponent["getStyleSheetsPromise"]).toBeTruthy();
  });

  it("should attach the shadow element in the connectedCallback", async () => {
    spyOn(testComponent, "attachShadow").and.callThrough();
    await testComponent.connectedCallback();
    expect(testComponent.attachShadow).toHaveBeenCalledOnceWith({
      mode: "open"
    });
    expect(testComponent.shadowRoot).toBeTruthy();
  });

  it("should finish fetching all files in the connectedCallback", async () => {
    await testComponent.connectedCallback();
    expect(testComponent.shadowRoot).toBeTruthy();
    expect(testComponent.shadowRoot!.innerHTML).toBe(template.content);
    const sheets = testComponent.shadowRoot!.adoptedStyleSheets;
    expect(sheets.length).toBe(styleSheets.length + globalStyleSheets.length);
    expect(sheets.map((sheet) => sheet.cssRules.item(0)?.cssText)).toEqual(
      globalStyleSheets
        .map((sheet) => sheet.content)
        .concat(styleSheets.map((sheet) => sheet.content))
    );
  });

  it("should have called fetch once for each file", async () => {
    await testComponent.connectedCallback();
    expect(window.fetch).toHaveBeenCalledTimes(
      1 + globalStyleSheets.length + styleSheets.length
    );
  });
});
