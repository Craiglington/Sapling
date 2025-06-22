import { Observable, Subscriber, Subscription } from "./observable.js";

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
