import { Observable, Subscriber, Subscription } from "./observable.js";
/**
 * A `Subject` is an extension of an `Observable`.
 * A `Subject` stores an initial value on creation and updates that value when the `Subject` emits.
 * When a new `Subscriber` subscribes, that `Subscriber` is immediately passed the `Subject`'s stored value.
 */
export declare class Subject<T> extends Observable<T> {
    private value;
    constructor(value: T);
    emit(value: T): void;
    subscribe(subscriber: Subscriber<T>): Subscription;
}
