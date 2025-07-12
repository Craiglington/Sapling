type PropertyCallback<T> = ((value: T) => any) | undefined;
/**
 * A `Value` is a wrapper for any type of variable.
 * A `Value` is useful because it allows for one-way binding to `Element` properties.
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
     * Sets the current value of a `Value` and updates all bound properties.
     */
    set value(value: TValue);
    /**
     * Sets the current value of a `Value` using a callback and updates all bound properties.
     * @param callback A callback that is provided with the current value and must return a value of the same type.
     */
    set(callback: (value: TValue) => TValue): void;
    /**
     * Updates all bound properties with the current value of a `Value`.
     *
     * This method is automatically called when using the setter or the `set` method.
     */
    updateElementProperties(): void;
    private setElementProperty;
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
     * Unbinds the value of a `Value` from all bound properties.
     * When the value is updated, no property will be updated.
     */
    unbindAllElementProperties(): void;
}
export {};
