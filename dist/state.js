import { Subject } from "./subject.js";
export class State {
    state = {};
    constructor(initial) {
        for (const key in initial) {
            this.state[key] = new Subject(initial[key]);
        }
    }
    /**
     * Adds a subscriber to a slice of the state.
     * Slices are stored with subjects, so the subscriber is immediately called with the current value of the slice.
     * @param key The key of the slice.
     * @param subscriber The new subscriber.
     * @returns A subscription which can be used to unsubscribe.
     */
    subscribe(key, subscriber) {
        return this.state[key].subscribe(subscriber);
    }
    /**
     * Dispatches a new value to a slice.
     * @param key The key of the slice.
     * @param value The new value for the slice.
     */
    dispatchValue(key, value) {
        this.state[key].emit(value);
    }
    /**
     * Dispatches a new value to a slice using a callback.
     * @param key The key of the slice.
     * @param callback A callback that is passed the current value of the slice and returns the new value for the slice.
     */
    dispatch(key, callback) {
        this.state[key].emit(callback(this.state[key].value));
    }
}
