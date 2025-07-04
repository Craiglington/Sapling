import { State } from "/__src__/state.js";

fdescribe("State", () => {
  beforeEach(() => {
    State["state"] = {};
  });

  it("should create with a state container", () => {
    expect(State["state"]).toBeTruthy();
  });

  it("should addSlice", () => {
    expect(State.hasSlice("title")).toBeFalse();
    State.addSlice("title", "Hello World");
    expect(State.hasSlice("title")).toBeTrue();
  });
});
