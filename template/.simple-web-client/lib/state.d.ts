import { Subscriber, Subscription } from "./observable.js";
export declare class State<T extends {
    [key: string]: any;
}> {
    private state;
    constructor(initial: T);
    subscribe<K extends keyof T>(key: K, subscriber: Subscriber<T[K]>): Subscription;
    dispatch<K extends keyof T>(key: K, value: T[K]): void;
}
