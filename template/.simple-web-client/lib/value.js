/**
 * A `Value` is a wrapper for any type of variable.
 * A `Value` is useful because it allows for one-way binding to `Element` properties and attributes.
 */
export class Value {
    _value;
    elements = [];
    constructor(value) {
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
    set value(value) {
        this._value = value;
        this.updateElementValues();
    }
    /**
     * Sets the current value of a `Value` using a callback and updates all bound properties and attributes.
     * @param callback A callback that is provided with the current value and must return a value of the same type.
     */
    set(callback) {
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
                this.setElementProperty(templateElement.element, property[0], property[1]);
            }
            for (const attribute of templateElement.attributes.entries()) {
                this.setElementAttribute(templateElement.element, attribute[0], attribute[1]);
            }
        }
    }
    setElementProperty(element, property, callback) {
        try {
            element[property] = callback ? callback(this._value) : this._value;
        }
        catch (error) {
            console.error("Error while setting template element property: ", error);
        }
    }
    setElementAttribute(element, attribute, callback) {
        try {
            element.setAttribute(attribute, callback
                ? callback(this._value)
                : typeof this._value === "string"
                    ? this._value
                    : String(this._value));
        }
        catch (error) {
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
    bindElementProperty(element, property, callback) {
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
    bindElementAttribute(element, attribute, callback) {
        this.setElementAttribute(element, attribute, callback);
        let existingElement = this.getValueElement(element);
        existingElement.attributes.set(attribute, callback);
    }
    getValueElement(element) {
        let existingElement = this.elements.find((e) => e.element === element);
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
    unbindElementProperty(element, property) {
        let elementIndex = this.elements.findIndex((e) => e.element === element);
        if (elementIndex === -1)
            return;
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
    unbindElementAttribute(element, attribute) {
        let elementIndex = this.elements.findIndex((e) => e.element === element);
        if (elementIndex === -1)
            return;
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
