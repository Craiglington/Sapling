/**
 * A `Subscriber` is a function that is passed a value.
 */
export type Subscriber<T> = (value: T) => void;
/**
 * A `Subscription` is returned when subscribing to an `Observable`. Allows for unsubscribing.
 */
export type Subscription = {
    unsubscribe: () => void;
};
/**
 * Inspired by the RxJS `Observable`. An `Observable` emits values to a list of subscribers.
 */
export declare class Observable<T> {
    private subscribers;
    /**
     * Emits a value to all subscribers.
     * @param value The value to be emitted to the subscribers.
     */
    emit(value: T): void;
    /**
     * Adds a `Subscriber` to an `Observable`'s list of subscribers.
     * @param subscriber The new `Subscriber`.
     * @returns A `Subscription` that allows for unsubscribing.
     */
    subscribe(subscriber: Subscriber<T>): Subscription;
}
