import { Source } from "./source.js";
import { Subscriber, Subscription } from "./publisher.js";

/**
 * A `Container` holds a group of `Source` objects.
 */
export class Container<T extends { [key: string]: any }> {
  private sources: { [K in keyof T]: Source<T[K]> } = {} as any;

  constructor(initial: T) {
    for (const key in initial) {
      this.sources[key] = new Source(initial[key]);
    }
  }

  /**
   * Adds a subscriber to a source in the container.
   * @param key The key of the source.
   * @param subscriber The new subscriber.
   * @returns A subscription which can be used to unsubscribe.
   */
  subscribe<K extends keyof T>(
    key: K,
    subscriber: Subscriber<T[K]>
  ): Subscription {
    return this.sources[key].subscribe(subscriber);
  }

  /**
   * Dispatches a new value to a source.
   * @param key The key of the source.
   * @param value The new value for the source.
   */
  dispatch<K extends keyof T>(key: K, value: T[K]) {
    this.sources[key].emit(value);
  }

  /**
   * Dispatches a new value to a source using a callback.
   * @param key The key of the source.
   * @param callback A callback that is passed the current value of the source and returns the new value for the source.
   */
  dispatchWithCallback<K extends keyof T>(
    key: K,
    callback: (value: T[K]) => T[K]
  ) {
    this.sources[key].emit(callback(this.sources[key].value));
  }
}
