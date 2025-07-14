type PropertyCallback<T> = ((value: T) => any) | undefined;
type AttributeCallback<T> = ((value: T) => string) | undefined;
type ClassCallback<T> = (value: T) => boolean;
/**
 * A `Value` is a wrapper for any type of variable.
 * A `Value` is useful because it allows for one-way binding to `Element` properties and attributes.
 */
export declare class Value<TValue> {
    private _value;
    private elements;
    constructor(value: TValue);
    /**
     * Returns the current value of a `Value`.
     */
    get value(): TValue;
    /**
     * Sets the current value of a `Value` and updates all bound properties and attributes.
     */
    set value(value: TValue);
    /**
     * Sets the current value of a `Value` using a callback and updates all bound properties and attributes.
     * @param callback A callback that is provided with the current value and must return a value of the same type.
     */
    set(callback: (value: TValue) => TValue): void;
    /**
     * Updates all bound properties, attributes, and classes with the current value of a `Value`.
     *
     * This method is automatically called when using the setter or the `set` method.
     */
    updateElementValues(): void;
    private setElementProperty;
    private setElementAttribute;
    private setElementClass;
    /**
     * Binds the value of a `Value` to a property of an `Element`.
     * When the value is updated, the property will be updated as well.
     *
     * Instead of simply setting the bound property to the value, an optional callback can be used to set the property based on the value.
     * @param element An `Element`.
     * @param property A property of the provided `Element`.
     * @param callback A function that is passed the value and returns the property's value.
     */
    bindElementProperty<TElement extends Element>(element: TElement, property: keyof TElement, callback?: PropertyCallback<TValue>): void;
    /**
     * Binds the value of a `Value` to an attribute of an `Element`.
     * When the value is updated, the attribute will be updated as well.
     *
     * Instead of simply setting the bound attribute to the value, an optional callback can be used to set the attribute based on the value.
     * @param element An `Element`.
     * @param attribute An attribute of the provided `Element`.
     * @param callback A function that is passed the value and returns the attribute's value.
     */
    bindElementAttribute<TElement extends Element>(element: TElement, attribute: string, callback?: AttributeCallback<TValue>): void;
    /**
     * Binds the value of a `Value` to the presence of a class on an `Element`.
     * A callback that returns a boolean is required.
     * When the value is updated, the class will be updated as well.
     *
     * @param element An `Element`.
     * @param attribute An attribute of the provided `Element`.
     * @param callback A function that is passed the value and returns the attribute's value.
     */
    bindElementClass<TElement extends Element>(element: TElement, className: string, callback: ClassCallback<TValue>): void;
    private getValueElement;
    /**
     * Unbinds the value of a `Value` from a property of an `Element`.
     * When the value is updated, the property will no longer be updated.
     *
     * This function does not clear the property's value.
     *
     * @param element An `Element`.
     * @param property A property of the provided `Element`.
     */
    unbindElementProperty<TElement extends Element>(element: TElement, property: keyof TElement): void;
    /**
     * Unbinds the value of a `Value` from an attribute of an `Element`.
     * When the value is updated, the attribute will no longer be updated.
     *
     * This function does not clear the attribute's value.
     *
     * @param element An `Element`.
     * @param attribute An attribute of the provided `Element`.
     */
    unbindElementAttribute<TElement extends Element>(element: TElement, attribute: string): void;
    /**
     * Unbinds the value of a `Value` from the presence of a class on an `Element`.
     * When the value is updated, the class will no longer be updated.
     *
     * This function does not remove the class from the element.
     *
     * @param element An `Element`.
     * @param className A class of the provided `Element`.
     */
    unbindElementClass<TElement extends Element>(element: TElement, className: string): void;
    private unbindElementValue;
    private elementNotBound;
    /**
     * Unbinds the value of a `Value` from all bound properties and attributes.
     * When the value is updated, no properties or attributes will be updated.
     */
    unbindAllElementValues(): void;
}
export {};
