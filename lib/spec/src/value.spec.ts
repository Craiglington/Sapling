import { Value } from "/__src__/value.js";

describe("Value", () => {
  it("should create", () => {
    const value = new Value<string>("test");
    expect(true).toBeTruthy();
  });
});
