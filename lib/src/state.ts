import { Subject } from "./subject.js";
import { Subscriber, Subscription } from "./observable.js";

export class State<T extends { [key: string]: any }> {
  private state: { [K in keyof T]: Subject<T[K]> } = {} as any;

  constructor(initial: T) {
    for (const key in initial) {
      this.state[key] = new Subject(initial[key]);
    }
  }

  subscribe<K extends keyof T>(
    key: K,
    subscriber: Subscriber<T[K]>
  ): Subscription {
    return this.state[key].subscribe(subscriber);
  }

  dispatch<K extends keyof T>(key: K, value: T[K]) {
    this.state[key].emit(value);
  }
}
