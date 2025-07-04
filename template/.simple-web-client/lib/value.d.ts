type Callback<T> = ((value: T) => any) | undefined;
/**
 * A `Value` is a wrapper for any type of variable.
 * A `Value` is useful because it allows for one-way binding to `HTMLElement` properties.
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
    private updateElementProperties;
    private setElementProperty;
    /**
     * Binds the value of a `Value` to a property of an `HTMLElement`.
     * When the value is updated, the property will be updated as well.
     *
     * Instead of simply setting the bound property to the value, an optional callback can be used to set the property based on the value.
     * @param element An `HTMLElement`.
     * @param property A property of the provided `HTMLElement`.
     * @param callback A function that is passed the value and returns the property's value.
     */
    bindElementProperty<TElement extends HTMLElement>(element: TElement, property: keyof TElement, callback?: Callback<TValue>): void;
    /**
     * Unbinds the value of a `Value` from a property of an `HTMLElement`.
     * When the value is updated, the property will no longer be updated.
     *
     * This function does not clear the property's value.
     *
     * @param element An `HTMLElement`.
     * @param property A property of the provided `HTMLElement`.
     */
    unbindElementProperty<TElement extends HTMLElement>(element: TElement, property: keyof TElement): void;
    /**
     * Unbinds the value of a `Value` from all bound properties.
     * When the value is updated, no property will be updated.
     */
    unbindAllElementProperties(): void;
}
export {};
