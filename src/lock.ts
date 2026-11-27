/**
 * A simple, asynchronous lock (mutex) that utilizes a promise chain.
 */
export class Lock {
  private newestLink = Promise.resolve();

  /**
   * Acquires the lock.
   * @returns A promise that resolves when the lock has been acquired.
   * Call the `release()` method on the acquired lock to release it.
   */
  async acquire(): Promise<{ release: () => void }> {
    const previousLink = this.newestLink;
    let release: () => void;
    this.newestLink = new Promise((resolve) => {
      release = resolve;
    });
    await previousLink;
    return { release: release! };
  }
}
