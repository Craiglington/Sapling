type Equals<A, B, C> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? C
    : never;

type MutableElementKeys<TElement extends Element> = {
  [Key in keyof TElement]-?: Equals<
    { [K in Key]: TElement[Key] },
    { -readonly [K in Key]: TElement[Key] },
    Key
  >;
}[keyof TElement];

type MutableElementKeysOfType<TElement extends Element, Type> = {
  [Key in MutableElementKeys<TElement>]: TElement[Key] extends Type
    ? Key
    : never;
}[MutableElementKeys<TElement>];

type PropertyCallback<T, S> = (value: T) => S;
type AttributeCallback<T> = (value: T) => string;
type ClassCallback<T> = (value: T) => boolean;
type FieldElement<TElement extends Element, TValue> = {
  element: TElement;
  properties: Map<
    MutableElementKeys<TElement>,
    PropertyCallback<TValue, TElement[MutableElementKeys<TElement>]> | null
  >;
  attributes: Map<string, AttributeCallback<TValue> | null>;
  classes: Map<string, ClassCallback<TValue> | null>;
};

/**
 * A `Field` is a wrapper for any type of value and allows for one-way binding to `Element` properties, attributes, and classes.
 */
export class Field<TValue> {
  private _value: TValue;
  private elements: FieldElement<Element, TValue>[] = [];

  constructor(value: TValue) {
    this._value = value;
  }

  /**
   * Returns the current value of a `Field`.
   */
  get value() {
    return this._value;
  }

  /**
   * Sets the current value of a `Field` and updates all bound properties and attributes.
   */
  set value(value: TValue) {
    this._value = value;
    this.updateElementValues();
  }

  /**
   * Sets the current value of a `Field` using a callback and updates all bound properties and attributes.
   * @param callback A callback that is provided with the current value and must return a value of the same type.
   */
  set(callback: (value: TValue) => TValue) {
    this._value = callback(this._value);
    this.updateElementValues();
  }

  /**
   * Binds the value of a `Field` to a property of an `Element`.
   * When the value is updated, the property will be updated as well.
   *
   * @param element An `Element`.
   * @param property A property of the provided `Element`.
   */
  bindElementProperty<
    TElement extends Element,
    TProperty extends MutableElementKeysOfType<TElement, TValue>
  >(element: TElement, property: TProperty) {
    this.setElementProperty(element, property);

    let fieldElement = this.getFieldElement(element);

    fieldElement.properties.set(property, null);
  }

  /**
   * Binds the value of a `Field` to a property of an `Element` using a callback.
   * When the value is updated, the property will be updated as well.
   *
   * @param element An `Element`.
   * @param property A property of the provided `Element`.
   * @param callback A function that is passed a value and returns the property's value.
   */
  bindElementPropertyWith<
    TElement extends Element,
    TProperty extends MutableElementKeys<TElement>
  >(
    element: TElement,
    property: TProperty,
    callback: PropertyCallback<TValue, TElement[TProperty]>
  ) {
    this.setElementProperty(element, property, callback);

    const fieldElement = this.getFieldElement(element);

    fieldElement.properties.set(property, callback);
  }

  /**
   * Binds the value of a `Field` to an attribute of an `Element`.
   * When the value is updated, the attribute will be updated as well.
   *
   * If the value is not a string, `String(...)` is used to convert the
   * value into a boolean.
   *
   * @param element An `Element`.
   * @param attribute An attribute of the provided `Element`.
   */
  bindElementAttribute<TElement extends Element>(
    element: TElement,
    attribute: string
  ) {
    this.setElementAttribute(element, attribute);

    const fieldElement = this.getFieldElement(element);

    fieldElement.attributes.set(attribute, null);
  }

  /**
   * Binds the value of a `Field` to an attribute of an `Element` using a callback.
   * When the value is updated, the attribute will be updated as well.
   *
   * If the value is not a string, `String(...)` is used to convert the
   * value into a boolean.
   *
   * @param element An `Element`.
   * @param attribute An attribute of the provided `Element`.
   * @param callback A function that is passed a value and returns the attribute's value.
   */
  bindElementAttributeWith<TElement extends Element>(
    element: TElement,
    attribute: string,
    callback: AttributeCallback<TValue>
  ) {
    this.setElementAttribute(element, attribute, callback);

    const fieldElement = this.getFieldElement(element);

    fieldElement.attributes.set(attribute, callback);
  }

  /**
   * Binds the value of a `Field` to the presence of a class on an `Element`.
   * When the value is updated, the class will be updated as well.
   *
   * If the value is not a boolean, `!!` is used to convert the value into a boolean.
   *
   * @param element An `Element`.
   * @param className A class of the provided `Element`.
   */
  bindElementClass<TElement extends Element>(
    element: TElement,
    className: string
  ) {
    this.setElementClass(element, className);

    const fieldElement = this.getFieldElement(element);

    fieldElement.classes.set(className, null);
  }

  /**
   * Binds the value of a `Field` to the presence of a class on an `Element` using a callback.
   * When the value is updated, the class will be updated as well.
   *
   * If the value is not a boolean, `!!` is used to convert the value into a boolean.
   *
   * @param element An `Element`.
   * @param className A class of the provided `Element`.
   * @param callback A function that is passed a value and returns a boolean.
   */
  bindElementClassWith<TElement extends Element>(
    element: TElement,
    className: string,
    callback: ClassCallback<TValue>
  ) {
    this.setElementClass(element, className, callback);

    const fieldElement = this.getFieldElement(element);

    fieldElement.classes.set(className, callback);
  }

  /**
   * Unbinds the value of a `Field` from a property of an `Element`.
   * When the value is updated, the property will no longer be updated.
   *
   * This function does not clear the property's value.
   *
   * @param element An `Element`.
   * @param property A property of the provided `Element`.
   */
  unbindElementProperty<TElement extends Element>(
    element: TElement,
    property: MutableElementKeys<TElement>
  ) {
    this.unbindElementValue(element, "properties", property);
  }

  /**
   * Unbinds the value of a `Field` from an attribute of an `Element`.
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
    this.unbindElementValue(element, "attributes", attribute);
  }

  /**
   * Unbinds the value of a `Field` from the presence of a class on an `Element`.
   * When the value is updated, the class will no longer be updated.
   *
   * This function does not remove the class from the element.
   *
   * @param element An `Element`.
   * @param className A class of the provided `Element`.
   */
  unbindElementClass<TElement extends Element>(
    element: TElement,
    className: string
  ) {
    this.unbindElementValue(element, "classes", className);
  }

  /**
   * Unbinds the value of a `Field` from all bound properties, attributes, and classes.
   * When the value is updated, no elements will be updated.
   */
  unbindAllElements() {
    this.elements.length = 0;
  }

  private updateElementValues() {
    for (const templateElement of this.elements) {
      for (const propertyEntry of templateElement.properties.entries()) {
        this.setElementProperty(
          templateElement.element,
          propertyEntry[0],
          propertyEntry[1]
        );
      }
      for (const attributeEntry of templateElement.attributes.entries()) {
        this.setElementAttribute(
          templateElement.element,
          attributeEntry[0],
          attributeEntry[1]
        );
      }
      for (const classEntry of templateElement.classes.entries()) {
        this.setElementClass(
          templateElement.element,
          classEntry[0],
          classEntry[1]
        );
      }
    }
  }

  private getFieldElement<TElement extends Element>(
    element: TElement
  ): FieldElement<TElement, TValue> {
    let fieldElement = this.elements.find((e) => e.element === element);

    if (!fieldElement) {
      fieldElement = {
        element: element,
        properties: new Map(),
        attributes: new Map(),
        classes: new Map()
      };
      this.elements.push(fieldElement);
    }

    return fieldElement as FieldElement<TElement, TValue>;
  }

  private setElementProperty<
    TElement extends Element,
    TProperty extends MutableElementKeys<TElement>
  >(
    element: TElement,
    property: TProperty,
    callback: PropertyCallback<TValue, TElement[TProperty]> | null = null
  ) {
    try {
      element[property] = callback
        ? callback(this._value)
        : (this._value as TElement[TProperty]);
    } catch (error) {
      console.error("Error while setting template element property: ", error);
    }
  }

  private setElementAttribute<TElement extends Element>(
    element: TElement,
    attribute: string,
    callback: AttributeCallback<TValue> | null = null
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

  private setElementClass<TElement extends Element>(
    element: TElement,
    className: string,
    callback: ClassCallback<TValue> | null = null
  ) {
    try {
      element.classList.toggle(
        className,
        callback
          ? callback(this._value)
          : typeof this._value === "boolean"
            ? this._value
            : !!this._value
      );
    } catch (error) {
      console.error("Error while setting template element class: ", error);
    }
  }

  private unbindElementValue<TElement extends Element>(
    element: TElement,
    map: keyof Omit<FieldElement<TElement, TValue>, "element">,
    key: PropertyKey
  ) {
    const elementIndex = this.elements.findIndex((e) => e.element === element);

    if (elementIndex === -1) return;

    const fieldElement = this.elements[elementIndex];

    if (
      (fieldElement[map] as Map<PropertyKey, unknown>).delete(key) &&
      fieldElement.properties.size === 0 &&
      fieldElement.attributes.size === 0 &&
      fieldElement.classes.size === 0
    ) {
      this.elements.splice(elementIndex, 1);
    }
  }
}
