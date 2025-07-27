import { Observable, Subscriber, Subscription } from "./observable.js";

/**
 * A `Subject` is an extension of an `Observable`.
 * A `Subject` stores an initial value on creation and updates that value when the `Subject` emits.
 * When a new `Subscriber` subscribes, that `Subscriber` is immediately passed the `Subject`'s stored value.
 */
export class Subject<T> extends Observable<T> {
  private _value: T;
  constructor(value: T) {
    super();
    this._value = value;
  }

  public get value() {
    return this._value;
  }

  /**
   * Emits the value to the subject's subscribers.
   * @param value The value to emit.
   */
  override emit(value: T): void {
    this._value = value;
    super.emit(value);
  }

  /**
   * Adds a subscriber to the subject and returns a subscription.
   * The subscriber is immediately called with the subject's current value.
   * @param subscriber The new subscriber.
   * @returns A subscription which can be used to unsubscribe.
   */
  override subscribe(subscriber: Subscriber<T>): Subscription {
    subscriber(this._value);
    return super.subscribe(subscriber);
  }
}
