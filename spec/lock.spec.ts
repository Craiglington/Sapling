import { Lock } from "/src/lock.js";

describe("Lock", () => {
  let lock: Lock;

  beforeEach(() => {
    lock = new Lock();
  });

  describe("acquire()", () => {
    it("should acquire the lock in the correct order", (done) => {
      let value = 0;
      lock.acquire().then((acquiredLock) => {
        expect(value++).toBe(1);
        acquiredLock.release();
      });

      lock.acquire().then((acquiredLock) => {
        expect(value++).toBe(2);
        acquiredLock.release();
      });

      lock.acquire().then((acquiredLock) => {
        expect(value).toBe(3);
        acquiredLock.release();
        done();
      });

      expect(value++).toBe(0);
    });
  });
});
