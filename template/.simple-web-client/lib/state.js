import { Subject } from "./subject.js";
export class State {
    state = {};
    constructor(initial) {
        for (const key in initial) {
            this.state[key] = new Subject(initial[key]);
        }
    }
    subscribe(key, subscriber) {
        return this.state[key].subscribe(subscriber);
    }
    dispatch(key, value) {
        this.state[key].emit(value);
    }
}
