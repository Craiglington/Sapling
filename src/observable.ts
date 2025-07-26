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
export class Observable<T> {
  private subscribers: Subscriber<T>[] = [];

  /**
   * Emits a value to all subscribers.
   * @param value The value to be emitted to the subscribers.
   */
  emit(value: T): void {
    for (const subscriber of this.subscribers) {
      subscriber(value);
    }
  }

  /**
   * Adds a `Subscriber` to an `Observable`'s list of subscribers.
   * @param subscriber The new `Subscriber`.
   * @returns A `Subscription` that allows for unsubscribing.
   */
  subscribe(subscriber: Subscriber<T>): Subscription {
    this.subscribers.push(subscriber);
    return {
      unsubscribe: () => {
        const index = this.subscribers.findIndex(
          (currentSubscriber) => currentSubscriber === subscriber
        );
        if (index === -1) return;
        this.subscribers.splice(index, 1);
      }
    };
  }
}
