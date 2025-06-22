export type Subscriber<T> = (value: T) => void;
export type Subscription = {
    unsubscribe: () => void;
};
export declare class Observable<T> {
    private subscribers;
    emit(value: T): void;
    subscribe(subscriber: Subscriber<T>): Subscription;
}
