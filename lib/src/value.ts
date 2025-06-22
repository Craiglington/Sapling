type TemplateElement<T> = {
  element: HTMLElement;
  properties: Map<keyof HTMLElement, (value: T) => any>;
};

export class Value<T> {
  private _value: T;
  private templateElements: TemplateElement<T>[] = [];

  constructor(value: T) {
    this._value = value;
  }

  get value() {
    return this._value;
  }

  set value(value: T) {
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

  private setElementProperty(
    element: HTMLElement,
    property: keyof HTMLElement,
    callback: (value: T) => any
  ) {
    try {
      (element as any)[property] = callback(this._value);
    } catch (error) {
      console.error("Error while setting template element property: ", error);
    }
  }

  setTemplateProperty(
    element: HTMLElement,
    property: keyof HTMLElement,
    callback: (value: T) => any
  ) {
    this.setElementProperty(element, property, callback);
    let templateElement = this.templateElements.find(
      (existingTemplateElement) => existingTemplateElement.element === element
    );
    if (!templateElement) {
      templateElement = {
        element: element,
        properties: new Map()
      };
      this.templateElements.push(templateElement);
    }
    templateElement.properties.set(property, callback);
  }

  clearTemplateProperty(element: HTMLElement, property: keyof HTMLElement) {
    let templateElementIndex = this.templateElements.findIndex(
      (existingTemplateElement) => existingTemplateElement.element === element
    );
    if (templateElementIndex === -1) return;
    const properties = this.templateElements[templateElementIndex].properties;
    if (properties.delete(property) && properties.size === 0) {
      this.templateElements.splice(templateElementIndex, 1);
    }
  }

  clearTemplateProperties() {
    this.templateElements.length = 0;
  }
}
