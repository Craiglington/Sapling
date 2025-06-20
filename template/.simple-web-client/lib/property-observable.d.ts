export declare class PropertyObservable {
    private property;
    private value;
    private subscribers;
    constructor(property: keyof HTMLElement, value?: string, subscribers?: HTMLElement[]);
    emit(value: string): void;
}
