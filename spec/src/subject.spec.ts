import { Subject } from "/__src__/subject.js";

describe("Subject", () => {
  let subject: Subject<number>;

  beforeEach(() => {
    subject = new Subject(2);
  });

  it("should create", () => {
    expect(subject).toBeTruthy();
    expect(subject["value"]).toBe(2);
  });

  it("should call subscriber on subscribe", () => {
    let result: number | undefined;
    const subscription = subject.subscribe((value) => (result = value));
    expect(subject["subscribers"].length).toBe(1);
    expect(subscription).toBeTruthy();
    expect(result).toBe(2);
  });

  it("should update the inner value on emit", () => {
    let result: number | undefined;
    const subscription = subject.subscribe((value) => (result = value));

    subject.emit(4);
    expect(subject["value"]).toBe(4);
    expect(result).toBe(4);
  });
});
