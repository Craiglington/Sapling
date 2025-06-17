export type ComponentOptions = {
    parent: HTMLElement;
    template?: string;
    templateUrl?: string;
};
export declare class Component {
    private parent;
    private template?;
    constructor(options: ComponentOptions);
}
