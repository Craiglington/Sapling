type PropertyCallback<T> = ((value: T) => any) | undefined;
type AttributeCallback<T> = ((value: T) => string) | undefined;

type ValueElement<TElement extends Element, TValue> = {
  element: TElement;
  properties: Map<keyof TElement, PropertyCallback<TValue>>;
  attributes: Map<string, AttributeCallback<TValue>>;
};

/**
 * A `Value` is a wrapper for any type of variable.
 * A `Value` is useful because it allows for one-way binding to `Element` properties and attributes.
 */
export class Value<TValue> {
  private _value: TValue;
  private elements: ValueElement<any, TValue>[] = [];

  constructor(value: TValue) {
    this._value = value;
  }

  /**
   * Returns the current value of a `Value`.
   */
  get value() {
    return this._value;
  }

  /**
   * Sets the current value of a `Value` and updates all bound properties and attributes.
   */
  set value(value: TValue) {
    this._value = value;
    this.updateElementValues();
  }

  /**
   * Sets the current value of a `Value` using a callback and updates all bound properties and attributes.
   * @param callback A callback that is provided with the current value and must return a value of the same type.
   */
  set(callback: (value: TValue) => TValue) {
    this._value = callback(this._value);
    this.updateElementValues();
  }

  /**
   * Updates all bound properties and attributes with the current value of a `Value`.
   *
   * This method is automatically called when using the setter or the `set` method.
   */
  updateElementValues() {
    for (const templateElement of this.elements) {
      for (const property of templateElement.properties.entries()) {
        this.setElementProperty(
          templateElement.element,
          property[0],
          property[1]
        );
      }
      for (const attribute of templateElement.attributes.entries()) {
        this.setElementAttribute(
          templateElement.element,
          attribute[0],
          attribute[1]
        );
      }
    }
  }

  private setElementProperty<TElement extends Element>(
    element: TElement,
    property: keyof TElement,
    callback: PropertyCallback<TValue>
  ) {
    try {
      element[property] = callback ? callback(this._value) : this._value;
    } catch (error) {
      console.error("Error while setting template element property: ", error);
    }
  }

  private setElementAttribute<TElement extends Element>(
    element: TElement,
    attribute: string,
    callback: AttributeCallback<TValue>
  ) {
    try {
      element.setAttribute(
        attribute,
        callback
          ? callback(this._value)
          : typeof this._value === "string"
            ? this._value
            : String(this._value)
      );
    } catch (error) {
      console.error("Error while setting template element attribute: ", error);
    }
  }

  /**
   * Binds the value of a `Value` to a property of an `Element`.
   * When the value is updated, the property will be updated as well.
   *
   * Instead of simply setting the bound property to the value, an optional callback can be used to set the property based on the value.
   * @param element An `Element`.
   * @param property A property of the provided `Element`.
   * @param callback A function that is passed the value and returns the property's value.
   */
  bindElementProperty<TElement extends Element>(
    element: TElement,
    property: keyof TElement,
    callback?: PropertyCallback<TValue>
  ) {
    this.setElementProperty(element, property, callback);

    let existingElement = this.getValueElement(element);

    existingElement.properties.set(property, callback);
  }

  /**
   * Binds the value of a `Value` to an attribute of an `Element`.
   * When the value is updated, the attribute will be updated as well.
   *
   * Instead of simply setting the bound attribute to the value, an optional callback can be used to set the attribute based on the value.
   * @param element An `Element`.
   * @param attribute An attribute of the provided `Element`.
   * @param callback A function that is passed the value and returns the attribute's value.
   */
  bindElementAttribute<TElement extends Element>(
    element: TElement,
    attribute: string,
    callback?: AttributeCallback<TValue>
  ) {
    this.setElementAttribute(element, attribute, callback);

    let existingElement = this.getValueElement(element);

    existingElement.attributes.set(attribute, callback);
  }

  private getValueElement<TElement extends Element>(
    element: TElement
  ): ValueElement<TElement, TValue> {
    let existingElement = this.elements.find((e) => e.element === element) as
      | ValueElement<TElement, TValue>
      | undefined;

    if (!existingElement) {
      existingElement = {
        element: element,
        properties: new Map(),
        attributes: new Map()
      };
      this.elements.push(existingElement);
    }

    return existingElement;
  }

  /**
   * Unbinds the value of a `Value` from a property of an `Element`.
   * When the value is updated, the property will no longer be updated.
   *
   * This function does not clear the property's value.
   *
   * @param element An `Element`.
   * @param property A property of the provided `Element`.
   */
  unbindElementProperty<TElement extends Element>(
    element: TElement,
    property: keyof TElement
  ) {
    let elementIndex = this.elements.findIndex((e) => e.element === element);

    if (elementIndex === -1) return;

    const properties = this.elements[elementIndex].properties;

    if (properties.delete(property) && properties.size === 0) {
      this.elements.splice(elementIndex, 1);
    }
  }

  /**
   * Unbinds the value of a `Value` from an attribute of an `Element`.
   * When the value is updated, the attribute will no longer be updated.
   *
   * This function does not clear the attribute's value.
   *
   * @param element An `Element`.
   * @param attribute An attribute of the provided `Element`.
   */
  unbindElementAttribute<TElement extends Element>(
    element: TElement,
    attribute: string
  ) {
    let elementIndex = this.elements.findIndex((e) => e.element === element);

    if (elementIndex === -1) return;

    const attributes = this.elements[elementIndex].attributes;

    if (attributes.delete(attribute) && attributes.size === 0) {
      this.elements.splice(elementIndex, 1);
    }
  }

  /**
   * Unbinds the value of a `Value` from all bound properties and attributes.
   * When the value is updated, no properties or attributes will be updated.
   */
  unbindAllElementValues() {
    this.elements.length = 0;
  }
}
