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

const mockInput = {
  title: "Hello world!",
  value: 15
};

describe("Component", () => {
  class TestComponent extends Component<typeof mockInput> {
    constructor() {
      super({
        templateUrl: template.url,
        styleUrls: styleSheets.map((sheet) => sheet.url),
        inputs: mockInput
      });
    }
  }

  window.customElements.define("test-component", TestComponent);

  let testComponent: TestComponent;

  beforeAll(() => {
    Component["savedTemplates"] = {};
    Component["savedStyles"] = {};
    spyOn(window, "fetch").and.callFake(mockFetch);
  });

  beforeEach(() => {
    testComponent = new TestComponent();
  });

  afterEach(async () => {
    // For the sake of accurately counting fetch calls.
    await Promise.all([
      testComponent["getTemplatePromise"],
      testComponent["getStyleSheetsPromise"]
    ]);
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
    expect(Object.keys(testComponent["inputs"]).length).toBe(
      Object.keys(mockInput).length
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

  it("should use and update inputs", () => {
    let title = "";
    testComponent["inputs"].title.subscribe((value) => {
      title = value;
    });
    expect(title).toBe(mockInput.title);

    let value = 0;
    testComponent["inputs"].value.subscribe((newValue) => {
      value = newValue;
    });
    expect(value).toBe(mockInput.value);

    testComponent.setInput("title", "New title!");
    expect(title).not.toBe(mockInput.title);
    expect(title).toBe("New title!");

    testComponent.setInput("value", 10);
    expect(value).not.toBe(mockInput.value);
    expect(value).toBe(10);
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
    Component["savedTemplates"] = {};
    Component["savedStyles"] = {};
    spyOn(window, "fetch").and.callFake(mockFetch);
    spyOn(console, "error");
  });

  beforeEach(() => {
    (console.error as jasmine.Spy<any>).calls.reset();
    badFilesComponent = new BadFilesComponent();
  });

  it("should have an empty template", async () => {
    await badFilesComponent.connectedCallback();
    expect(badFilesComponent.shadowRoot).toBeTruthy();
    expect(badFilesComponent.shadowRoot!.innerHTML).toBe("");
    expect(console.error).toHaveBeenCalled();
  });

  it("should not have a stylesheet for bad files", async () => {
    await badFilesComponent.connectedCallback();
    const sheets = badFilesComponent.shadowRoot!.adoptedStyleSheets;
    expect(sheets.length).toBe(styleSheets.length + globalStyleSheets.length);
    expect(sheets.map((sheet) => sheet.cssRules.item(0)?.cssText)).toEqual(
      globalStyleSheets
        .map((sheet) => sheet.content)
        .concat(styleSheets.map((sheet) => sheet.content))
    );
    expect(console.error).toHaveBeenCalled();
  });
});
