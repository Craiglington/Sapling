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

  it("should subscribe and dispatch", () => {
    let name: string = "";
    state.subscribe("name", (value: string) => {
      name = value;
    });
    expect(name).toBe(initialState.name);

    state.dispatch("name", "Burt Tyrannosaurus Macklin");
    expect(name).toBe("Burt Tyrannosaurus Macklin");

    let age = 0;
    state.subscribe("age", (value) => {
      age = value;
    });
    expect(age).toBe(initialState.age);

    state.dispatch("age", 33);
    expect(age).not.toBe(initialState.age);
    expect(age).toBe(33);
  });
});
