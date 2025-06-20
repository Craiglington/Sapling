export class PropertyObservable {
  private property: keyof HTMLElement;
  private value: string;
  private subscribers: HTMLElement[] = [];

  constructor(
    property: keyof HTMLElement,
    value?: string,
    subscribers?: HTMLElement[]
  ) {
    this.property = property;
    this.value = value || "";
    if (subscribers && subscribers.length > 0) {
      this.subscribers = this.subscribers.concat(subscribers);
    }
  }

  emit(value: string) {
    this.value = value;
    for (const subscriber of this.subscribers) {
      (subscriber as any)[this.property] = this.value;
    }
  }
}
