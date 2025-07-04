import { Subject } from "./subject.js";
import { Subscriber, Subscription } from "./observable.js";

export class State {
  private static state: Record<string, Subject<any>> = {};

  static hasSlice(name: string): boolean {
    return name in this.state;
  }

  static addSlice<T>(name: string, initialValue: T) {
    if (this.hasSlice(name)) {
      throw new Error(`A slice named "${name}" already exists.`);
    }
    this.state[name] = new Subject(initialValue);
  }

  static subscribe<T>(name: string, subscriber: Subscriber<T>): Subscription {
    if (!this.hasSlice(name)) {
      throw new Error(`A slice named "${name}" does not exist.`);
    }
    return this.state[name].subscribe(subscriber);
  }

  static dispatch<T>(name: string, value: T) {
    if (!this.hasSlice(name)) {
      throw new Error(`A slice named "${name}" does not exist.`);
    }
    this.state[name].emit(value);
  }
}
