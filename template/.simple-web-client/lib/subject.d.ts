import { Observable, Subscriber, Subscription } from "./observable.js";
export declare class Subject<T> extends Observable<T> {
    private value;
    constructor(value: T);
    emit(value: T): void;
    subscribe(subscriber: Subscriber<T>): Subscription;
}
