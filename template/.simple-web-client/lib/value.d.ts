export declare class Value<T> {
    private _value;
    private templateElements;
    constructor(value: T);
    get value(): T;
    set value(value: T);
    private updateTemplateProperties;
    private setElementProperty;
    setTemplateProperty(element: HTMLElement, property: keyof HTMLElement, callback: (value: T) => any): void;
    clearTemplateProperty(element: HTMLElement, property: keyof HTMLElement): void;
    clearTemplateProperties(): void;
}
