import { State } from "/__src__/state.js";

function getMockInitialState() {
  return {
    name: "Burt Macklin",
    age: 32
  };
}

describe("State", () => {
  let initialState: ReturnType<typeof getMockInitialState>;
  let state: State<ReturnType<typeof getMockInitialState>>;

  beforeEach(() => {
    initialState = getMockInitialState();
    state = new State(getMockInitialState());
  });

  it("should create with a state container", () => {
    expect(state["state"]).toBeTruthy();
  });

  it("should subscribe and dispatchValue", () => {
    let name: string = "";
    state.subscribe("name", (value: string) => {
      name = value;
    });
    expect(name).toBe(initialState.name);

    state.dispatchValue("name", "Burt Tyrannosaurus Macklin");
    expect(name).toBe("Burt Tyrannosaurus Macklin");

    let age = 0;
    state.subscribe("age", (value) => {
      age = value;
    });
    expect(age).toBe(initialState.age);

    state.dispatchValue("age", 33);
    expect(age).not.toBe(initialState.age);
    expect(age).toBe(33);
  });

  it("should subscribe and dispatch", () => {
    let name: string = "";
    state.subscribe("name", (value: string) => {
      name = value;
    });
    expect(name).toBe(initialState.name);

    state.dispatch("name", (value) =>
      value.split(" ").toSpliced(1, 0, "Tyrannosaurus").join(" ")
    );
    expect(name).toBe(
      initialState.name.split(" ").toSpliced(1, 0, "Tyrannosaurus").join(" ")
    );

    let age = 0;
    state.subscribe("age", (value) => {
      age = value;
    });
    expect(age).toBe(initialState.age);

    state.dispatch("age", (value) => value + 1);
    expect(age).not.toBe(initialState.age);
    expect(age).toBe(initialState.age + 1);
  });
});
