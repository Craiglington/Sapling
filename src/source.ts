import { Publisher, Subscriber, Subscription } from "./publisher.js";

/**
 * A `Source` is an extension of a `Publisher`.
 * A source stores an initial value on creation and updates that value when `emit()` is called.
 * Additionally, subscribers are immediately passed the stored value when they subscribe.
 */
export class Source<T> extends Publisher<T> {
  private _value: T;
  constructor(value: T) {
    super();
    this._value = value;
  }

  public get value() {
    return this._value;
  }

  /**
   * Emits the value to the source's subscribers.
   * @param value The value to emit.
   */
  override emit(value: T): void {
    this._value = value;
    super.emit(value);
  }

  /**
   * Adds a subscriber to the source and returns a subscription.
   * The subscriber is immediately called with the source's current value.
   * @param subscriber The new subscriber.
   * @returns A subscription which can be used to unsubscribe.
   */
  override subscribe(subscriber: Subscriber<T>): Subscription {
    subscriber(this._value);
    return super.subscribe(subscriber);
  }
}
