import { Observable } from "/__src__/observable.js";
describe("Observable", () => {
    let observable;
    beforeEach(() => {
        observable = new Observable();
    });
    it("should create", () => {
        expect(observable).toBeTruthy();
        expect(observable["subscribers"].length).toBe(0);
    });
    it("should allow subscribers", () => {
        let result;
        const subscription = observable.subscribe((value) => (result = value));
        expect(observable["subscribers"].length).toBe(1);
        expect(subscription).toBeTruthy();
        expect(result).toBeFalsy();
    });
    it("should emit to subscribers", () => {
        let result;
        const subscription = observable.subscribe((value) => (result = value));
        observable.emit(2);
        expect(result).toBe(2);
    });
    it("should let subscribers unsubscribe", () => {
        let result;
        const subscription = observable.subscribe((value) => (result = value));
        observable.emit(2);
        expect(result).toBe(2);
        subscription.unsubscribe();
        expect(observable["subscribers"].length).toBe(0);
        observable.emit(4);
        expect(result).toBe(2);
    });
    it("should allow multiple subscriptions", () => {
        let resultOne;
        const subscriptionOne = observable.subscribe((value) => (resultOne = value));
        observable.emit(2);
        expect(resultOne).toBe(2);
        let resultTwo;
        const subscriptionTwo = observable.subscribe((value) => (resultTwo = value * 2));
        expect(observable["subscribers"].length).toBe(2);
        observable.emit(3);
        expect(resultOne).toBe(3);
        expect(resultTwo).toBe(6);
        // Test unsubscribing multiple times
        subscriptionOne.unsubscribe();
        expect(observable["subscribers"].length).toBe(1);
        subscriptionOne.unsubscribe();
        expect(observable["subscribers"].length).toBe(1);
        observable.emit(4);
        expect(resultOne).toBe(3);
        expect(resultTwo).toBe(8);
    });
});
