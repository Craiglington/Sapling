import { Publisher } from "/src/publisher.js";
import { Source } from "/src/source.js";

describe("Source", () => {
  const initialValue = 0;
  let source: Source<number>;

  beforeEach(() => {
    source = new Source(initialValue);
  });

  describe("constructor()", () => {
    it("should create with an initial value", () => {
      expect(source).toBeTruthy();
      expect(source.value).toBe(initialValue);
    });
  });

  describe("get value()", () => {
    it("should return the inner value", () => {
      expect(source.value).toBe(source["_value"]);
    });
  });

  describe("subscribe()", () => {
    it("should immediately call the subscriber", () => {
      const subscriber = jasmine.createSpy();
      spyOn(Publisher.prototype, "subscribe");

      source.subscribe(subscriber);

      expect(subscriber).toHaveBeenCalledOnceWith(initialValue);
      expect(Publisher.prototype.subscribe).toHaveBeenCalledOnceWith(
        subscriber
      );
    });
  });

  describe("emit()", () => {
    it("should update the source value", () => {
      spyOn(Publisher.prototype, "emit");
      const newValue = initialValue + 1;

      source.emit(newValue);

      expect(source.value).toBe(newValue);
      expect(Publisher.prototype.emit).toHaveBeenCalledOnceWith(newValue);
    });
  });
});
