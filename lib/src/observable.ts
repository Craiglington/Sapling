export type Subscriber<T> = (value: T) => void;

export type Subscription = {
  unsubscribe: () => void;
};

export class Observable<T> {
  private subscribers: Subscriber<T>[] = [];

  emit(value: T): void {
    for (const subscriber of this.subscribers) {
      subscriber(value);
    }
  }

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
