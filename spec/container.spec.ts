import { Container } from "/src/container.js";

function getInitialContainerValue() {
  return {
    name: "Burt Macklin",
    age: 32
  };
}

describe("Container", () => {
  let initialContainerValue: ReturnType<typeof getInitialContainerValue>;
  let container: Container<ReturnType<typeof getInitialContainerValue>>;

  beforeEach(() => {
    initialContainerValue = getInitialContainerValue();
    container = new Container(getInitialContainerValue());
  });

  describe("constructor()", () => {
    it("should create with a sources object", () => {
      expect(container["sources"]).toBeTruthy();
    });

    it("should create with the correct initial values", () => {
      let property: keyof ReturnType<typeof getInitialContainerValue>;
      for (property in initialContainerValue) {
        expect(container["sources"][property]).toBeTruthy();
        expect(container["sources"][property].value).toEqual(
          initialContainerValue[property]
        );
      }
    });
  });

  describe("subscribe()", () => {
    it("should subscribe to a source in the container", () => {
      const subscription = container.subscribe("name", () => {});
      expect("unsubscribe" in subscription).toBeTrue();
    });
  });

  describe("dispatch()", () => {
    it("should update the source value and call the subscriber", () => {
      let name = "";
      const subscription = container.subscribe("name", (newName: string) => {
        name = newName;
      });

      expect(name).toBe(initialContainerValue.name);

      container.dispatch("name", "Burt Tyrannosaurus Macklin");

      expect(name).toBe("Burt Tyrannosaurus Macklin");

      subscription.unsubscribe();

      container.dispatch("name", "");

      expect(name).toBe("Burt Tyrannosaurus Macklin");
    });
  });

  describe("dispatchWithCallback()", () => {
    it("should update the source value and call the subscriber", () => {
      let age = 0;
      const subscription = container.subscribe("age", (newAge: number) => {
        age = newAge;
      });

      expect(age).toBe(initialContainerValue.age);

      container.dispatchWithCallback("age", (currentAge) => currentAge + 1);

      expect(age).toBe(initialContainerValue.age + 1);

      subscription.unsubscribe();

      container.dispatch("age", 0);

      expect(age).toBe(initialContainerValue.age + 1);
    });
  });
});
