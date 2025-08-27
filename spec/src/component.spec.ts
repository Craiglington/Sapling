import { Component } from "/__src__/component.js";

type File = { url: string; content: string };
const template: File = {
  url: "/template.html",
  content: '<h1>Hello world!</h1><div id="content"></div>'
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

for (const sheet of globalStyleSheets) {
  Component.addGlobalStyleUrl(sheet.url);
}

const mockFetch = async (input: RequestInfo | URL) => {
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
};

describe("Component with no template", () => {
  class TestNoTemplateComponent extends Component {
    constructor() {
      super({
        styleUrls: styleSheets.map((sheet) => sheet.url)
      });
    }
  }
  window.customElements.define(
    "test-no-template-component",
    TestNoTemplateComponent
  );

  it("should throw in constructor", async () => {
    expect(() => {
      new TestNoTemplateComponent();
    }).toThrowError();
  });
});

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
    Component["savedTemplates"] = new Map();
    Component["savedStyles"] = new Map();
    spyOn(window, "fetch").and.callFake(mockFetch);
  });

  beforeEach(() => {
    testComponent = new TestComponent();
  });

  afterEach(async () => {
    // For the sake of accurately counting fetch calls.
    await testComponent["template"];
    await testComponent["styles"];
  });

  it("should have global style sheets", () => {
    expect(Component["globalStyleUrls"]).toEqual(
      globalStyleSheets.map((sheet) => sheet.url)
    );
  });

  it("should create and begin fetching files", () => {
    expect(testComponent).toBeTruthy();
    expect(testComponent["template"]).toBeTruthy();
    expect(testComponent["styles"].length).toBe(
      styleSheets.length + globalStyleSheets.length
    );
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

    // 1 for the template file
    expect(window.fetch).toHaveBeenCalledTimes(
      1 + globalStyleSheets.length + styleSheets.length
    );
  });

  it("should get a child from the shadowRoot", async () => {
    const noShadowRoot = testComponent.getChild("a");
    expect(noShadowRoot).toBeNull();

    await testComponent.connectedCallback();

    const header = testComponent.getChild("h1");
    expect(header).toBeInstanceOf(HTMLHeadingElement);

    const notPresent = testComponent.getChild("p");
    expect(notPresent).toBeNull();
  });

  it("should get children from the shadowRoot", async () => {
    await testComponent.connectedCallback();

    const children = testComponent.getChildren("*");
    expect(children).toBeTruthy();
    expect(children?.length).toBe(2);
  });
});

describe("Component with defined template and styles", () => {
  class TestDefinedComponent extends Component {
    constructor() {
      super({
        template: template.content,
        styles: styleSheets.map((sheet) => sheet.content)
      });
    }
  }
  window.customElements.define("test-defined-component", TestDefinedComponent);

  let testComponent: TestDefinedComponent;

  beforeAll(() => {
    Component["savedTemplates"] = new Map();
    Component["savedStyles"] = new Map();
    spyOn(window, "fetch").and.callFake(mockFetch);
  });

  beforeEach(() => {
    testComponent = new TestDefinedComponent();
  });

  afterEach(async () => {
    // For the sake of accurately counting fetch calls.
    await testComponent["template"];
    await testComponent["styles"];
  });

  it("should create and begin fetching files", () => {
    expect(testComponent).toBeTruthy();
    expect(testComponent["template"]).toBeTruthy();
    expect(testComponent["styles"].length).toBe(
      styleSheets.length + globalStyleSheets.length
    );
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
    expect(sheets.length).toBe(globalStyleSheets.length + styleSheets.length);
  });

  it("should have called fetch once for each global css file", async () => {
    await testComponent.connectedCallback();

    expect(window.fetch).toHaveBeenCalledTimes(globalStyleSheets.length);
  });
});

describe("Component with bad files", () => {
  class BadFilesComponent extends Component {
    constructor() {
      super({
        templateUrl: "/not-found.html",
        styleUrls: styleSheets
          .map((sheet) => sheet.url)
          .concat("/not-found.css")
      });
    }
  }

  window.customElements.define("bad-files-component", BadFilesComponent);

  let badFilesComponent: BadFilesComponent;

  beforeAll(() => {
    spyOn(window, "fetch").and.callFake(mockFetch);
    spyOn(console, "error");
  });

  beforeEach(() => {
    Component["savedTemplates"] = new Map();
    Component["savedStyles"] = new Map();
    (console.error as jasmine.Spy<any>).calls.reset();
    badFilesComponent = new BadFilesComponent();
  });

  it("should have an empty template", async () => {
    await badFilesComponent.connectedCallback();
    expect(badFilesComponent.shadowRoot).toBeTruthy();
    expect(badFilesComponent.shadowRoot!.innerHTML).toBe("");
    expect(console.error).toHaveBeenCalled();
  });

  it("should have an empty stylesheet for bad files", async () => {
    await badFilesComponent.connectedCallback();
    const sheets = badFilesComponent.shadowRoot!.adoptedStyleSheets;
    expect(sheets.length).toBe(
      styleSheets.length + globalStyleSheets.length + 1
    );
    const badStyleSheet: CSSStyleSheet | undefined =
      await Component["savedStyles"].get("/not-found.css");
    expect(badStyleSheet).toBeTruthy();
    expect(badStyleSheet?.cssRules.length).toBe(0);
    expect(console.error).toHaveBeenCalled();
  });
});
