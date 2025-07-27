import { Observable, Subscriber, Subscription } from "./observable.js";
/**
 * A `Subject` is an extension of an `Observable`.
 * A `Subject` stores an initial value on creation and updates that value when the `Subject` emits.
 * When a new `Subscriber` subscribes, that `Subscriber` is immediately passed the `Subject`'s stored value.
 */
export declare class Subject<T> extends Observable<T> {
    private _value;
    constructor(value: T);
    get value(): T;
    /**
     * Emits the value to the subject's subscribers.
     * @param value The value to emit.
     */
    emit(value: T): void;
    /**
     * Adds a subscriber to the subject and returns a subscription.
     * The subscriber is immediately called with the subject's current value.
     * @param subscriber The new subscriber.
     * @returns A subscription which can be used to unsubscribe.
     */
    subscribe(subscriber: Subscriber<T>): Subscription;
}
