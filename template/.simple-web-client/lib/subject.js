import { Observable } from "./observable.js";
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
