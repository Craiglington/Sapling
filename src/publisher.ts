/**
 * A `Subscriber` is a function that is passed a value.
 */
export type Subscriber<T> = (value: T) => void;

/**
 * A `Subscription` is returned when subscribing to an `Publisher`. Allows for unsubscribing.
 */
export interface Subscription {
  unsubscribe: () => void;
}

/**
 * A `Publisher` emits values to a list of subscribers.
 */
export class Publisher<T> {
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
   * Adds a subscriber to a publisher's list of subscribers.
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
