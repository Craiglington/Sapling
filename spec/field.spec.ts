import { Field } from "/src/field.js";

fdescribe("Field", () => {
  const initialValue = "Burt";
  let field: Field<string>;
  let inputElement: HTMLInputElement;

  beforeEach(() => {
    field = new Field(initialValue);
    inputElement = document.createElement("input");
  });

  describe("constructor()", () => {
    it("should create with an initial value", () => {
      expect(field.value).toBe(initialValue);
    });
  });

  describe("get value()", () => {
    it("should return the inner value", () => {
      expect(field.value).toBe(field["_value"]);
    });
  });

  describe("set value()", () => {
    it("should set the inner value", () => {
      const newValue = initialValue.concat(" Macklin");

      field.value = newValue;

      expect(field.value).toBe(newValue);
    });

    it("should update elements", () => {});
  });

  describe("set()", () => {
    it("should set the inner value", () => {
      const newValue = initialValue.concat(" Macklin");

      field.value = newValue;

      expect(field.value).toBe(newValue);
    });

    it("should update elements", () => {});
  });

  describe("bindElementProperty()", () => {
    it("should add a new element and bind a property", () => {
      field.bindElementProperty(inputElement, "id");

      expect(inputElement.id).toBe(field.value);
      expect(field["elements"].length).toBe(1);
      expect(field["elements"][0].element).toBe(inputElement);
      expect(field["elements"][0].properties.get("id")).toBeNull();
    });

    it("should update an existing element and bind a property", () => {
      field.bindElementProperty(inputElement, "id");
      field.bindElementProperty(inputElement, "title");

      expect(inputElement.title).toBe(field.value);
      expect(field["elements"].length).toBe(1);
      expect(field["elements"][0].element).toBe(inputElement);
      expect(
        (field["elements"][0].properties as Map<string, unknown>).get("title")
      ).toBeNull();
    });
  });

  describe("bindElementPropertyWith()", () => {
    let id: Field<number>;
    let callback: jasmine.Spy;

    beforeEach(() => {
      id = new Field(1);
      callback = jasmine.createSpy().and.returnValue("callback");
    });

    it("should add a new element and bind a property", () => {
      id.bindElementPropertyWith(inputElement, "id", callback);

      expect(inputElement.id).toBe("callback");
      expect(callback).toHaveBeenCalledOnceWith(id.value);
      expect(id["elements"].length).toBe(1);
      expect(id["elements"][0].element).toBe(inputElement);
      expect(id["elements"][0].properties.get("id")).toBe(callback);
    });

    it("should update an existing element and bind a property", () => {
      id.bindElementPropertyWith(inputElement, "id", () => "");
      id.bindElementPropertyWith(inputElement, "title", callback);

      expect(inputElement.title).toBe("callback");
      expect(callback).toHaveBeenCalledOnceWith(id.value);
      expect(id["elements"].length).toBe(1);
      expect(id["elements"][0].element).toBe(inputElement);
      expect(
        (id["elements"][0].properties as Map<string, unknown>).get("title")
      ).toBe(callback);
    });
  });

  describe("bindElementAttribute()", () => {
    it("should add a new element and bind an attribute", () => {
      field.bindElementAttribute(inputElement, "title");

      expect(inputElement.getAttribute("title")).toBe(field.value);
      expect(field["elements"].length).toBe(1);
      expect(field["elements"][0].element).toBe(inputElement);
      expect(field["elements"][0].attributes.get("title")).toBeNull();
    });

    it("should update an existing element and bind an attribute", () => {
      field.bindElementAttribute(inputElement, "title");
      field.bindElementAttribute(inputElement, "name");

      expect(inputElement.getAttribute("name")).toBe(field.value);
      expect(field["elements"].length).toBe(1);
      expect(field["elements"][0].element).toBe(inputElement);
      expect(field["elements"][0].attributes.get("name")).toBeNull();
    });
  });

  describe("bindElementAttributeWith()", () => {
    let callback: jasmine.Spy;

    beforeEach(() => {
      callback = jasmine.createSpy().and.returnValue("callback");
    });

    it("should add a new element and bind an attribute", () => {
      field.bindElementAttributeWith(inputElement, "title", callback);

      expect(inputElement.getAttribute("title")).toBe("callback");
      expect(callback).toHaveBeenCalledOnceWith(field.value);
      expect(field["elements"].length).toBe(1);
      expect(field["elements"][0].element).toBe(inputElement);
      expect(field["elements"][0].attributes.get("title")).toBe(callback);
    });

    it("should update an existing element and bind an attribute", () => {
      field.bindElementAttributeWith(inputElement, "title", () => "");
      field.bindElementAttributeWith(inputElement, "name", callback);

      expect(inputElement.getAttribute("name")).toBe("callback");
      expect(field["elements"].length).toBe(1);
      expect(field["elements"][0].element).toBe(inputElement);
      expect(field["elements"][0].attributes.get("name")).toBe(callback);
    });
  });

  describe("bindElementClass()", () => {
    it("should add a new element and bind a class with a truthy value", () => {
      field.bindElementClass(inputElement, "hidden");

      expect(inputElement.classList.contains("hidden")).toBe(true);
      expect(field["elements"].length).toBe(1);
      expect(field["elements"][0].element).toBe(inputElement);
      expect(field["elements"][0].classes.get("hidden")).toBeNull();
    });

    it("should bind a class but not apply it with a false value", () => {
      const hidden = new Field(false);
      hidden.bindElementClass(inputElement, "hidden");

      expect(inputElement.classList.contains("hidden")).toBe(false);
      expect(hidden["elements"].length).toBe(1);
      expect(hidden["elements"][0].element).toBe(inputElement);
      expect(hidden["elements"][0].classes.get("hidden")).toBeNull();
    });

    it("should bind a class but not apply it with a falsey value", () => {
      const hidden = new Field(0);
      hidden.bindElementClass(inputElement, "hidden");

      expect(inputElement.classList.contains("hidden")).toBe(false);
      expect(hidden["elements"].length).toBe(1);
      expect(hidden["elements"][0].element).toBe(inputElement);
      expect(hidden["elements"][0].classes.get("hidden")).toBeNull();
    });

    it("should update an existing element and bind a class", () => {
      field.bindElementClass(inputElement, "hidden");
      field.bindElementClass(inputElement, "disabled");

      expect(inputElement.classList.contains("disabled")).toBe(true);
      expect(field["elements"].length).toBe(1);
      expect(field["elements"][0].element).toBe(inputElement);
      expect(field["elements"][0].classes.get("disabled")).toBeNull();
    });
  });

  describe("bindElementClassWith()", () => {
    let callback: jasmine.Spy;

    it("should add a new element and bind a class", () => {
      callback = jasmine.createSpy().and.returnValue(true);

      field.bindElementClassWith(inputElement, "hidden", callback);

      expect(inputElement.classList.contains("hidden")).toBe(true);
      expect(callback).toHaveBeenCalledOnceWith(field.value);
      expect(field["elements"].length).toBe(1);
      expect(field["elements"][0].element).toBe(inputElement);
      expect(field["elements"][0].classes.get("hidden")).toBe(callback);
    });

    it("should update an existing element and bind a class", () => {
      callback = jasmine.createSpy().and.returnValue(true);

      field.bindElementClassWith(inputElement, "hidden", () => false);
      field.bindElementClassWith(inputElement, "disabled", callback);

      expect(inputElement.classList.contains("hidden")).toBeFalse();
      expect(inputElement.classList.contains("disabled")).toBeTrue();
      expect(callback).toHaveBeenCalledOnceWith(field.value);
      expect(field["elements"].length).toBe(1);
      expect(field["elements"][0].element).toBe(inputElement);
      expect(field["elements"][0].classes.get("hidden")).toBeTruthy();
      expect(field["elements"][0].classes.get("disabled")).toBe(callback);
    });
  });

  describe("unbindElementProperty()", () => {
    it("should do nothing if the element does not exist", () => {
      const newElement = document.createElement("input");

      field.bindElementProperty(inputElement, "id");
      field.unbindElementProperty(newElement, "id");

      expect(field["elements"].length).toBe(1);
      expect(field["elements"][0].element).toBe(inputElement);
    });

    it("should do nothing if the property is not bound", () => {
      field.bindElementProperty(inputElement, "id");
      field.unbindElementProperty(inputElement, "value");

      expect(field["elements"].length).toBe(1);
      expect(field["elements"][0].element).toBe(inputElement);
      expect(field["elements"][0].properties.get("id")).toBeNull();
    });

    it("should unbind a bound property and remove the element", () => {
      field.bindElementProperty(inputElement, "id");
      field.unbindElementProperty(inputElement, "id");

      expect(field["elements"].length).toBe(0);
    });

    it("should unbind a bound property and keep the element", () => {
      field.bindElementProperty(inputElement, "id");
      field.bindElementProperty(inputElement, "value");
      field.unbindElementProperty(inputElement, "id");

      expect(field["elements"].length).toBe(1);
      expect(field["elements"][0].element).toBe(inputElement);
      expect(field["elements"][0].properties.has("id")).toBeFalse();
      expect(
        (field["elements"][0].properties as Map<string, unknown>).get("value")
      ).toBeNull();
    });
  });

  //   it("should create", () => {
  //     expect(value).toBeTruthy();
  //     expect(value.value).toBe("Hello world!");
  //     expect(header).toBeTruthy();
  //   });
  //
  //   it("should bind a property on an Element", () => {
  //     expect(value["elements"].length).toBe(0);
  //     value.bindElementProperty(header, "innerText");
  //     expect(value["elements"].length).toBe(1);
  //     expect(header.innerText).toBe("Hello world!");
  //     value.value = "New value!";
  //     expect(header.innerText).toBe("New value!");
  //   });
  //
  //   it("should bind an attribute on an Element", () => {
  //     expect(value["elements"].length).toBe(0);
  //     value.bindElementAttribute(header, "id");
  //     expect(value["elements"].length).toBe(1);
  //     expect(header.getAttribute("id")).toBe("Hello world!");
  //     value.value = "New value!";
  //     expect(header.getAttribute("id")).toBe("New value!");
  //   });
  //
  //   it("should bind a non-string value to an attribute on an Element", () => {
  //     const numValue = new Value(12);
  //     expect(numValue["elements"].length).toBe(0);
  //     numValue.bindElementAttribute(header, "id");
  //     expect(numValue["elements"].length).toBe(1);
  //     expect(header.getAttribute("id")).toBe("12");
  //     numValue.value = 15;
  //     expect(header.getAttribute("id")).toBe("15");
  //   });
  //
  //   it("should bind a class on an Element", () => {
  //     expect(value["elements"].length).toBe(0);
  //     value.bindElementClass(header, "bold", (value) => value === "Hello world!");
  //     expect(value["elements"].length).toBe(1);
  //     expect(header.classList.contains("bold")).toBeTrue();
  //     value.value = "New value!";
  //     expect(header.classList.contains("bold")).toBeFalse();
  //   });
  //
  //   it("should bind multiple properties on an Element", () => {
  //     value.bindElementProperty(header, "innerText");
  //     value.bindElementPropertyWith(
  //       header,
  //       "hidden",
  //       (value) => value === "Hello world!"
  //     );
  //     expect(header.innerText).toBe("Hello world!");
  //     expect(header.hidden).toBeTrue();
  //     value.value = "New value!";
  //     expect(header.innerText).toBe("New value!");
  //     expect(header.hidden).toBeFalse();
  //   });
  //
  //   it("should bind multiple attributes on an Element", () => {
  //     value.bindElementAttribute(header, "id");
  //     value.bindElementAttribute(header, "title", (value) =>
  //       value === "Hello world!" ? "true" : "false"
  //     );
  //     expect(header.getAttribute("id")).toBe("Hello world!");
  //     expect(header.getAttribute("title")).toBe("true");
  //     value.value = "New value!";
  //     expect(header.getAttribute("id")).toBe("New value!");
  //     expect(header.getAttribute("title")).toBe("false");
  //   });
  //
  //   it("should bind a property on an Element while setting with the set method", () => {
  //     expect(value["elements"].length).toBe(0);
  //     value.bindElementProperty(header, "innerText");
  //     expect(value["elements"].length).toBe(1);
  //     expect(header.innerText).toBe("Hello world!");
  //     value.set((currentValue) => currentValue + "!");
  //     expect(header.innerText).toBe("Hello world!!");
  //   });
  //
  //   it("should bind an attribute on an Element while setting with the set method", () => {
  //     expect(value["elements"].length).toBe(0);
  //     value.bindElementAttribute(header, "id");
  //     expect(value["elements"].length).toBe(1);
  //     expect(header.getAttribute("id")).toBe("Hello world!");
  //     value.set((currentValue) => currentValue + "!");
  //     expect(header.getAttribute("id")).toBe("Hello world!!");
  //   });
  //
  //   it("should bind a class on an Element while setting with the set method", () => {
  //     expect(value["elements"].length).toBe(0);
  //     value.bindElementClass(header, "bold", (value) => value === "Hello world!");
  //     expect(value["elements"].length).toBe(1);
  //     expect(header.classList.contains("bold")).toBeTrue();
  //     value.set((currentValue) => currentValue + "!");
  //     expect(header.classList.contains("bold")).toBeFalse();
  //   });
  //
  //   it("should bind multiple properties on an Element while setting with the set method", () => {
  //     value.bindElementProperty(header, "innerText");
  //     value.bindElementPropertyWith(
  //       header,
  //       "hidden",
  //       (value) => value === "Hello world!"
  //     );
  //     expect(header.innerText).toBe("Hello world!");
  //     expect(header.hidden).toBeTrue();
  //     value.set((currentValue) => currentValue + "!");
  //     expect(header.innerText).toBe("Hello world!!");
  //     expect(header.hidden).toBeFalse();
  //   });
  //
  //   it("should bind multiple attributes on an Element while setting with the set method", () => {
  //     value.bindElementAttribute(header, "id");
  //     value.bindElementAttribute(header, "title", (value) =>
  //       value === "Hello world!" ? "true" : "false"
  //     );
  //     expect(header.getAttribute("id")).toBe("Hello world!");
  //     expect(header.getAttribute("title")).toBe("true");
  //     value.set((currentValue) => currentValue + "!");
  //     expect(header.getAttribute("id")).toBe("Hello world!!");
  //     expect(header.getAttribute("title")).toBe("false");
  //   });
  //
  //   it("should bind multiple properties on multiple Elements", () => {
  //     expect(value["elements"].length).toBe(0);
  //     value.value = "test";
  //     value.bindElementProperty(header, "innerText");
  //     value.bindElementPropertyWith(
  //       header,
  //       "hidden",
  //       (value) => value === "new-test"
  //     );
  //     expect(header.innerText).toBe("test");
  //     expect(header.hidden).toBeFalse();
  //     expect(value["elements"].length).toBe(1);
  //
  //     const link = document.createElement("a");
  //     value.bindElementProperty(link, "innerText");
  //     value.bindElementPropertyWith(
  //       link,
  //       "href",
  //       (value) => `https://test.com/${value}`
  //     );
  //     expect(link.innerText).toBe("test");
  //     expect(link.href).toBe("https://test.com/test");
  //     expect(value["elements"].length).toBe(2);
  //
  //     value.value = "new-test";
  //     expect(header.innerText).toBe("new-test");
  //     expect(header.hidden).toBeTrue();
  //     expect(link.innerText).toBe("new-test");
  //     expect(link.href).toBe("https://test.com/new-test");
  //   });
  //
  //   it("should bind multiple attributes on multiple Elements", () => {
  //     expect(value["elements"].length).toBe(0);
  //     value.value = "test";
  //     value.bindElementAttribute(header, "id");
  //     value.bindElementAttribute(header, "title", (value) =>
  //       value === "new-test" ? "true" : "false"
  //     );
  //     expect(header.getAttribute("id")).toBe("test");
  //     expect(header.getAttribute("title")).toBe("false");
  //     expect(value["elements"].length).toBe(1);
  //
  //     const link = document.createElement("a");
  //     value.bindElementAttribute(link, "id");
  //     value.bindElementAttribute(
  //       link,
  //       "href",
  //       (value) => `https://test.com/${value}`
  //     );
  //     expect(link.getAttribute("id")).toBe("test");
  //     expect(link.getAttribute("href")).toBe("https://test.com/test");
  //     expect(value["elements"].length).toBe(2);
  //
  //     value.value = "new-test";
  //     expect(header.getAttribute("id")).toBe("new-test");
  //     expect(header.getAttribute("title")).toBe("true");
  //     expect(link.getAttribute("id")).toBe("new-test");
  //     expect(link.getAttribute("href")).toBe("https://test.com/new-test");
  //   });
  //
  //   it("should unbind a template property", () => {
  //     spyOn(value["elements"], "splice").and.callThrough();
  //     value.bindElementProperty(header, "innerText");
  //     value.bindElementPropertyWith(
  //       header,
  //       "hidden",
  //       (value) => value === "Hello world!"
  //     );
  //     expect(header.innerText).toBe("Hello world!");
  //     expect(header.hidden).toBeTrue();
  //
  //     value.unbindElementProperty(header, "hidden");
  //
  //     value.value = "new value";
  //     expect(header.innerText).toBe("new value");
  //     expect(header.hidden).toBeTrue();
  //
  //     expect(value["elements"].length).toBe(1);
  //     value.unbindElementProperty(header, "innerText");
  //     expect(value["elements"].length).toBe(0);
  //
  //     value.value = "new value 2";
  //     expect(header.innerText).toBe("new value");
  //     expect(header.hidden).toBeTrue();
  //     expect(value["elements"].splice).toHaveBeenCalledTimes(1);
  //   });
  //
  //   it("should unbind a template attribute", () => {
  //     spyOn(value["elements"], "splice").and.callThrough();
  //     value.bindElementAttribute(header, "id");
  //     value.bindElementAttribute(header, "title", (value) =>
  //       value === "Hello world!" ? "true" : "false"
  //     );
  //     expect(header.getAttribute("id")).toBe("Hello world!");
  //     expect(header.getAttribute("title")).toBe("true");
  //
  //     value.unbindElementAttribute(header, "title");
  //
  //     value.value = "new value";
  //     expect(header.getAttribute("id")).toBe("new value");
  //     expect(header.getAttribute("title")).toBe("true");
  //
  //     expect(value["elements"].length).toBe(1);
  //     value.unbindElementAttribute(header, "id");
  //     expect(value["elements"].length).toBe(0);
  //
  //     value.value = "new value 2";
  //     expect(header.getAttribute("id")).toBe("new value");
  //     expect(header.getAttribute("title")).toBe("true");
  //     expect(value["elements"].splice).toHaveBeenCalledTimes(1);
  //   });
  //
  //   it("should unbind a template class", () => {
  //     spyOn(value["elements"], "splice").and.callThrough();
  //     value.bindElementClass(header, "bold", (value) => value === "Hello world!");
  //     value.bindElementClass(
  //       header,
  //       "underlined",
  //       (value) => value !== "Hello world!"
  //     );
  //
  //     expect(header.classList.contains("bold")).toBeTrue();
  //     expect(header.classList.contains("underlined")).toBeFalse();
  //
  //     value.unbindElementClass(header, "bold");
  //
  //     value.value = "new value";
  //     expect(header.classList.contains("bold")).toBeTrue();
  //     expect(header.classList.contains("underlined")).toBeTrue();
  //
  //     expect(value["elements"].length).toBe(1);
  //     value.unbindElementClass(header, "underlined");
  //     expect(value["elements"].length).toBe(0);
  //
  //     value.value = "Hello world!";
  //     expect(header.classList.contains("bold")).toBeTrue();
  //     expect(header.classList.contains("underlined")).toBeTrue();
  //     expect(value["elements"].splice).toHaveBeenCalledTimes(1);
  //   });
  //
  //   it("should do nothing if unbinding a property that does not exist", () => {
  //     value.bindElementProperty(header, "innerText");
  //     spyOn(value["elements"], "splice").and.callThrough();
  //     value.unbindElementProperty(header, "onclick");
  //     expect(value["elements"].splice).toHaveBeenCalledTimes(0);
  //   });
  //
  //   it("should do nothing if unbinding an attribute that does not exist", () => {
  //     value.bindElementAttribute(header, "id");
  //     spyOn(value["elements"], "splice").and.callThrough();
  //     value.unbindElementAttribute(header, "title");
  //     expect(value["elements"].splice).toHaveBeenCalledTimes(0);
  //   });
  //
  //   it("should only remove an element if it has no more bindings", () => {
  //     spyOn(value["elements"], "splice").and.callThrough();
  //     expect(value["elements"].length).toBe(0);
  //     value.bindElementProperty(header, "innerText");
  //     value.bindElementAttribute(header, "id");
  //     value.bindElementClass(header, "bold", () => true);
  //     expect(value["elements"].length).toBe(1);
  //
  //     value.unbindElementProperty(header, "innerText");
  //     expect(value["elements"].splice).toHaveBeenCalledTimes(0);
  //     expect(value["elements"].length).toBe(1);
  //
  //     value.unbindElementAttribute(header, "id");
  //     expect(value["elements"].splice).toHaveBeenCalledTimes(0);
  //     expect(value["elements"].length).toBe(1);
  //
  //     value.unbindElementClass(header, "bold");
  //     expect(value["elements"].splice).toHaveBeenCalledTimes(1);
  //     expect(value["elements"].length).toBe(0);
  //   });
  //
  //   it("should unbind all properties and attributes", () => {
  //     value.bindElementProperty(header, "innerText");
  //     value.bindElementAttribute(header, "id");
  //     const link = document.createElement("a");
  //     value.bindElementProperty(link, "innerText");
  //     value.bindElementAttribute(link, "id");
  //     expect(header.innerText).toBe("Hello world!");
  //     expect(header.getAttribute("id")).toBe("Hello world!");
  //     expect(link.innerText).toBe("Hello world!");
  //     expect(link.getAttribute("id")).toBe("Hello world!");
  //     expect(value["elements"].length).toBe(2);
  //
  //     value.unbindAllElementValues();
  //     value.value = "new value";
  //     expect(header.innerText).toBe("Hello world!");
  //     expect(header.getAttribute("id")).toBe("Hello world!");
  //     expect(link.innerText).toBe("Hello world!");
  //     expect(link.getAttribute("id")).toBe("Hello world!");
  //     expect(value["elements"].length).toBe(0);
  //   });
});
