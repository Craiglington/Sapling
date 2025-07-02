import { Value } from "/__src__/value.js";

describe("Value", () => {
  let value: Value<string>;
  let header: HTMLHeadElement;

  beforeEach(() => {
    value = new Value("Hello world!");
    header = document.createElement("h1");
  });

  it("should create", () => {
    expect(value).toBeTruthy();
    expect(value.value).toBe("Hello world!");
    expect(header).toBeTruthy();
  });

  it("should bind a property on an HTMLElement", () => {
    expect(value["elements"].length).toBe(0);
    value.bindElementProperty(header, "innerText");
    expect(value["elements"].length).toBe(1);
    expect(header.innerText).toBe("Hello world!");
    value.value = "New value!";
    expect(header.innerText).toBe("New value!");
  });

  it("should bind multiple properties on an HTMLElement", () => {
    value.bindElementProperty(header, "innerText");
    value.bindElementProperty(
      header,
      "hidden",
      (value) => value === "Hello world!"
    );
    expect(header.innerText).toBe("Hello world!");
    expect(header.hidden).toBeTrue();
    value.value = "New value!";
    expect(header.innerText).toBe("New value!");
    expect(header.hidden).toBeFalse();
  });

  it("should bind multiple properties on multiple HTMLElements", () => {
    expect(value["elements"].length).toBe(0);
    value.value = "test";
    value.bindElementProperty(header, "innerText");
    value.bindElementProperty(
      header,
      "hidden",
      (value) => value === "new-test"
    );
    expect(header.innerText).toBe("test");
    expect(header.hidden).toBeFalse();
    expect(value["elements"].length).toBe(1);

    const link = document.createElement("a");
    value.bindElementProperty(link, "innerText");
    value.bindElementProperty(
      link,
      "href",
      (value) => `https://test.com/${value}`
    );
    expect(link.innerText).toBe("test");
    expect(link.href).toBe("https://test.com/test");
    expect(value["elements"].length).toBe(2);

    value.value = "new-test";
    expect(header.innerText).toBe("new-test");
    expect(header.hidden).toBeTrue();
    expect(link.innerText).toBe("new-test");
    expect(link.href).toBe("https://test.com/new-test");
  });

  it("should unbind a template property", () => {
    spyOn(value["elements"], "splice").and.callThrough();
    value.bindElementProperty(header, "innerText");
    value.bindElementProperty(
      header,
      "hidden",
      (value) => value === "Hello world!"
    );
    expect(header.innerText).toBe("Hello world!");
    expect(header.hidden).toBeTrue();

    value.unbindElementProperty(header, "hidden");

    value.value = "new value";
    expect(header.innerText).toBe("new value");
    expect(header.hidden).toBeTrue();

    expect(value["elements"].length).toBe(1);
    value.unbindElementProperty(header, "innerText");
    expect(value["elements"].length).toBe(0);

    value.value = "new value 2";
    expect(header.innerText).toBe("new value");
    expect(header.hidden).toBeTrue();
    expect(value["elements"].splice).toHaveBeenCalledTimes(1);
  });

  it("should do nothing if unbinding a property that does not exist", () => {
    value.bindElementProperty(header, "innerText");
    spyOn(value["elements"], "splice").and.callThrough();
    value.unbindElementProperty(header, "onclick");
    expect(value["elements"].splice).toHaveBeenCalledTimes(0);
  });

  it("should unbind all properties", () => {
    value.bindElementProperty(header, "innerText");
    const link = document.createElement("a");
    value.bindElementProperty(link, "innerText");
    expect(header.innerText).toBe("Hello world!");
    expect(link.innerText).toBe("Hello world!");
    expect(value["elements"].length).toBe(2);

    value.unbindAllElementProperties();
    value.value = "new value";
    expect(header.innerText).toBe("Hello world!");
    expect(link.innerText).toBe("Hello world!");
    expect(value["elements"].length).toBe(0);
  });
});
