export type ComponentOptions = {
  parent: HTMLElement;
  template?: string;
  templateUrl?: string;
};

export class Component {
  private parent: HTMLElement;
  private template?: string;
  constructor(options: ComponentOptions) {
    this.parent = options.parent;
    if (options.template) {
      this.template = options.template;
    } else if (options.templateUrl) {
      const headers = new Headers({
        "Content-Type": "text/html"
      });
      fetch(options.templateUrl, {
        headers: headers
      })
        .then((response) => response.text())
        .then((response) => {
          console.log(response);
        });
    } else {
      throw new Error(
        "Either the template or templateUrl property must be set in the ComponentOptions."
      );
    }
  }
}
