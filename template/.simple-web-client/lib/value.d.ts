export declare class Value<TValue> {
    private _value;
    private templateElements;
    constructor(value: TValue);
    get value(): TValue;
    set value(value: TValue);
    private updateTemplateProperties;
    private setElementProperty;
    bindTemplateProperty<TElement extends HTMLElement>(element: TElement, property: keyof TElement, callback?: (value: TValue) => any): void;
    unbindTemplateProperty<TElement extends HTMLElement>(element: TElement, property: keyof TElement): void;
    unbindTemplateProperties(): void;
}
