import { Observable } from "./observable.js";
/**
 * A `Subject` is an extension of an `Observable`.
 * A `Subject` stores an initial value on creation and updates that value when the `Subject` emits.
 * When a new `Subscriber` subscribes, that `Subscriber` is immediately passed the `Subject`'s stored value.
 */
export class Subject extends Observable {
    value;
    constructor(value) {
        super();
        this.value = value;
    }
    emit(value) {
        this.value = value;
        super.emit(value);
    }
    subscribe(subscriber) {
        subscriber(this.value);
        return super.subscribe(subscriber);
    }
}
