import { Observable, Subscriber, Subscription } from "./observable.js";

/**
 * A `Subject` is an extension of an `Observable`.
 * A `Subject` stores an initial value on creation and updates that value when the `Subject` emits.
 * When a new `Subscriber` subscribes, that `Subscriber` is immediately passed the `Subject`'s stored value.
 */
export class Subject<T> extends Observable<T> {
  private value: T;
  constructor(value: T) {
    super();
    this.value = value;
  }

  override emit(value: T): void {
    this.value = value;
    super.emit(value);
  }

  override subscribe(subscriber: Subscriber<T>): Subscription {
    subscriber(this.value);
    return super.subscribe(subscriber);
  }
}
