import { Component, ComponentConfig } from "/__src__/component.js";

// Create component
const templateURL = "template.html";
const styleUrls = ["styles-one.css", "styles-two.css", "styles-three.css"];

class TestComponent extends Component {
  constructor() {
    super({
      templateUrl: templateURL,
      styleUrls: styleUrls
    });
  }
}

window.customElements.define("test-component", TestComponent);

describe("Component", () => {
  let testComponent: TestComponent;

  beforeEach(() => {
    spyOn(window, "fetch").and.callFake(async (input: RequestInfo | URL) => {
      if (input === templateURL) {
        return new Response("<h1>Hello world!</h1>");
      } else if (input === styleUrls[0]) {
        return new Response("body { color: blue; }");
      } else if (input === styleUrls[1]) {
        return new Response("h1 { color: black !important; }");
      } else if (input === styleUrls[2]) {
        return new Response(".spacer { flex: 1 1 auto; }");
      } else if (input === "/styles.css") {
        return new Response("p { font-weight: bold; }");
      }
      return new Response(null, {
        status: 404,
        statusText: "Not Found"
      });
    });

    testComponent = new TestComponent();
  });

  it("should have global style sheets", () => {
    expect(Component["globalStyleSheets"]).toEqual(["/styles.css"]);
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
    expect(testComponent.shadowRoot!.innerHTML).toBe("<h1>Hello world!</h1>");
    const sheets = testComponent.shadowRoot!.adoptedStyleSheets;
    expect(sheets.length).toBe(
      styleUrls.length + Component["globalStyleSheets"].length
    );
    expect(sheets.map((sheet) => sheet.cssRules.item(0)?.cssText)).toEqual([
      "p { font-weight: bold; }",
      "body { color: blue; }",
      "h1 { color: black !important; }",
      ".spacer { flex: 1 1 auto; }"
    ]);
  });
});
