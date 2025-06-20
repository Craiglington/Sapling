export class PropertyObservable {
    property;
    value;
    subscribers = [];
    constructor(property, value, subscribers) {
        this.property = property;
        this.value = value || "";
        if (subscribers && subscribers.length > 0) {
            this.subscribers = this.subscribers.concat(subscribers);
        }
    }
    emit(value) {
        this.value = value;
        for (const subscriber of this.subscribers) {
            //subscriber[this.property] = this.value;
        }
    }
}
