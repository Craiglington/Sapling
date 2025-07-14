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
     * Updates all bound properties, attributes, and classes with the current value of a `Value`.
     *
     * This method is automatically called when using the setter or the `set` method.
     */
    updateElementValues() {
        for (const templateElement of this.elements) {
            for (const propertyEntry of templateElement.properties.entries()) {
                this.setElementProperty(templateElement.element, propertyEntry[0], propertyEntry[1]);
            }
            for (const attributeEntry of templateElement.attributes.entries()) {
                this.setElementAttribute(templateElement.element, attributeEntry[0], attributeEntry[1]);
            }
            for (const classEntry of templateElement.classes.entries()) {
                this.setElementClass(templateElement.element, classEntry[0], classEntry[1]);
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
    setElementClass(element, className, callback) {
        try {
            if (callback(this._value)) {
                element.classList.add(className);
            }
            else {
                element.classList.remove(className);
            }
        }
        catch (error) {
            console.error("Error while setting template element class: ", error);
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
    /**
     * Binds the value of a `Value` to the presence of a class on an `Element`.
     * A callback that returns a boolean is required.
     * When the value is updated, the class will be updated as well.
     *
     * @param element An `Element`.
     * @param attribute An attribute of the provided `Element`.
     * @param callback A function that is passed the value and returns the attribute's value.
     */
    bindElementClass(element, className, callback) {
        this.setElementClass(element, className, callback);
        let existingElement = this.getValueElement(element);
        existingElement.classes.set(className, callback);
    }
    getValueElement(element) {
        let existingElement = this.elements.find((e) => e.element === element);
        if (!existingElement) {
            existingElement = {
                element: element,
                properties: new Map(),
                attributes: new Map(),
                classes: new Map()
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
        this.unbindElementValue(element, "properties", property);
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
        this.unbindElementValue(element, "attributes", attribute);
    }
    /**
     * Unbinds the value of a `Value` from the presence of a class on an `Element`.
     * When the value is updated, the class will no longer be updated.
     *
     * This function does not remove the class from the element.
     *
     * @param element An `Element`.
     * @param className A class of the provided `Element`.
     */
    unbindElementClass(element, className) {
        this.unbindElementValue(element, "classes", className);
    }
    unbindElementValue(element, map, key) {
        let elementIndex = this.elements.findIndex((e) => e.element === element);
        if (elementIndex === -1)
            return;
        const valueElement = this.elements[elementIndex];
        if (valueElement[map].delete(key) && this.elementNotBound(valueElement)) {
            this.elements.splice(elementIndex, 1);
        }
    }
    elementNotBound(element) {
        return (element.properties.size === 0 &&
            element.attributes.size === 0 &&
            element.classes.size === 0);
    }
    /**
     * Unbinds the value of a `Value` from all bound properties and attributes.
     * When the value is updated, no properties or attributes will be updated.
     */
    unbindAllElementValues() {
        this.elements.length = 0;
    }
}
