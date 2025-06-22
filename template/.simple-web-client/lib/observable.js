export class Observable {
    subscribers = [];
    emit(value) {
        for (const subscriber of this.subscribers) {
            subscriber(value);
        }
    }
    subscribe(subscriber) {
        this.subscribers.push(subscriber);
        return {
            unsubscribe: () => {
                const index = this.subscribers.findIndex((currentSubscriber) => currentSubscriber === subscriber);
                if (index === -1)
                    return;
                this.subscribers.splice(index, 1);
            }
        };
    }
}
