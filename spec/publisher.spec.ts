import { Publisher, Subscription } from "/src/publisher.js";

describe("Publisher", () => {
  let publisher: Publisher<number>;

  beforeEach(() => {
    publisher = new Publisher<number>();
  });

  describe("constructor()", () => {
    it("should create with a list of subscribers", () => {
      expect(publisher).toBeTruthy();
      expect(publisher["subscribers"]).toBeTruthy();
      expect(publisher["subscribers"].length).toBe(0);
    });
  });

  describe("subscribe()", () => {
    it("should add a subscriber", () => {
      publisher.subscribe(() => {});

      expect(publisher["subscribers"].length).toBe(1);
    });

    it("should not call the subscriber when subscribing", () => {
      let value: number | undefined = undefined;

      publisher.subscribe((newValue) => {
        value = newValue;
      });

      expect(value).toBeUndefined();
    });

    it("should return a subscription and allow unsubscribing", () => {
      const subscription = publisher.subscribe(() => {});

      subscription.unsubscribe();

      expect(publisher["subscribers"].length).toBe(0);
    });

    it("should do nothing if the subscriber doesn't exist when unsubscribing", () => {
      publisher.subscribe(() => {});
      const subscription = publisher.subscribe(() => {});

      expect(publisher["subscribers"].length).toBe(2);

      publisher["subscribers"].pop();

      expect(publisher["subscribers"].length).toBe(1);

      subscription.unsubscribe();

      expect(publisher["subscribers"].length).toBe(1);
    });

    it("should remove the correct subscriber when unsubscribing", () => {
      const subscriberOne = () => {};
      publisher.subscribe(subscriberOne);
      const subscriptionTwo = publisher.subscribe(() => {});

      expect(publisher["subscribers"].length).toBe(2);

      subscriptionTwo.unsubscribe();

      expect(publisher["subscribers"].length).toBe(1);
      expect(publisher["subscribers"][0]).toBe(subscriberOne);
    });
  });

  describe("emit()", () => {
    it("should do nothing when emitting to no subscriber", () => {
      expect(() => {
        publisher.emit(1);
      }).not.toThrow();
    });

    it("should emit to a single subscriber", () => {
      let value: number | undefined;
      const subscription = publisher.subscribe((newValue) => {
        value = newValue;
      });

      publisher.emit(1);

      expect(value).toBe(1);

      subscription.unsubscribe();

      publisher.emit(2);

      expect(value).toBe(1);
    });

    it("should emit nothing to a single subscriber after unsubscribing", () => {
      let value: number | undefined;
      const subscription = publisher.subscribe((newValue) => {
        value = newValue;
      });

      publisher.emit(1);
      subscription.unsubscribe();
      publisher.emit(2);

      expect(value).toBe(1);
    });

    it("should emit to multiple subscribers", () => {
      const values = new Array<number>(5);
      for (let i = 0; i < values.length; ++i) {
        publisher.subscribe((newValue) => {
          values[i] = newValue;
        });
      }

      publisher.emit(1);

      expect(values.every((value) => value === 1)).toBeTrue();
    });

    it("should emit to some subscribers after multiple unsubscriptions", () => {
      const subscriptions = new Array<Subscription>(5);
      const values = new Array<number>(subscriptions.length);
      for (let i = 0; i < subscriptions.length; ++i) {
        subscriptions[i] = publisher.subscribe((newValue) => {
          values[i] = newValue;
        });
      }

      publisher.emit(1);

      const unsubscribers = subscriptions.splice(
        Math.max(subscriptions.length - 3, 1)
      );
      unsubscribers.forEach((subsciption) => subsciption.unsubscribe());

      publisher.emit(2);

      for (let i = 0; i < subscriptions.length; ++i) {
        if (i < subscriptions.length) {
          expect(values[i]).toBe(2);
        } else {
          expect(values[i]).toBe(1);
        }
      }
    });

    it("should emit nothing to multiple subscribers after unsubscribing", () => {
      const subscriptions = new Array<Subscription>(5);
      const values = new Array<number>(subscriptions.length);
      for (let i = 0; i < subscriptions.length; ++i) {
        subscriptions[i] = publisher.subscribe((newValue) => {
          values[i] = newValue;
        });
      }

      publisher.emit(1);
      subscriptions.forEach((subsciption) => subsciption.unsubscribe());
      publisher.emit(2);

      expect(values.every((value) => value === 1)).toBeTrue();
    });
  });
});
