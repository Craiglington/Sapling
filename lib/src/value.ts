type TemplateElement<TElement extends HTMLElement, TValue> = {
  element: TElement;
  properties: Map<keyof TElement, (value: TValue) => any>;
};

export class Value<TValue> {
  private _value: TValue;
  private templateElements: TemplateElement<any, TValue>[] = [];

  constructor(value: TValue) {
    this._value = value;
  }

  get value() {
    return this._value;
  }

  set value(value: TValue) {
    this._value = value;
    this.updateTemplateProperties();
  }

  private updateTemplateProperties() {
    for (const templateElement of this.templateElements) {
      for (const property of templateElement.properties.entries()) {
        this.setElementProperty(
          templateElement.element,
          property[0],
          property[1]
        );
      }
    }
  }

  private setElementProperty<TElement extends HTMLElement>(
    element: TElement,
    property: keyof TElement,
    callback: (value: TValue) => any
  ) {
    try {
      (element as any)[property] = callback(this._value);
    } catch (error) {
      console.error("Error while setting template element property: ", error);
    }
  }

  bindTemplateProperty<TElement extends HTMLElement>(
    element: TElement,
    property: keyof TElement,
    callback?: (value: TValue) => any
  ) {
    const setCallback = callback || ((value) => value);
    this.setElementProperty(element, property, setCallback);

    let templateElement = this.templateElements.find(
      (existingTemplateElement) => existingTemplateElement.element === element
    ) as TemplateElement<TElement, TValue> | undefined;

    if (!templateElement) {
      templateElement = {
        element: element,
        properties: new Map()
      };
      this.templateElements.push(templateElement);
    }

    templateElement.properties.set(property, setCallback);
  }

  unbindTemplateProperty<TElement extends HTMLElement>(
    element: TElement,
    property: keyof TElement
  ) {
    let templateElementIndex = this.templateElements.findIndex(
      (existingTemplateElement) => existingTemplateElement.element === element
    );

    if (templateElementIndex === -1) return;

    const properties = this.templateElements[templateElementIndex]
      .properties as Map<keyof TElement, (value: TValue) => any>;

    if (properties.delete(property) && properties.size === 0) {
      this.templateElements.splice(templateElementIndex, 1);
    }
  }

  unbindTemplateProperties() {
    this.templateElements.length = 0;
  }
}
