import { RouterService } from "/__src__/router.js";
import { Component } from "/__src__/component.js";

type File = { url: string; content: string };
const templateOne: File = {
  url: "/template-one.html",
  content: "<h1>Hello one!</h1>"
};
const templateTwo: File = {
  url: "/template-two.html",
  content: "<h1>Hello two!</h1>"
};
const templateThree: File = {
  url: "/template-three.html",
  content: "<h1>Hello three!</h1>"
};
const globalStyleSheet: File = {
  url: "/styles.css",
  content: "p { font-weight: bold; }"
};

const mockFetch = async (input: RequestInfo | URL) => {
  if (input === templateOne.url) {
    return new Response(templateOne.content);
  } else if (input === templateTwo.url) {
    return new Response(templateTwo.content);
  } else if (input === templateThree.url) {
    return new Response(templateThree.content);
  } else if (input === globalStyleSheet.url) {
    return new Response(globalStyleSheet.content);
  }

  return new Response(null, {
    status: 404,
    statusText: "Not Found"
  });
};

describe("Router", () => {
  class ComponentOne extends Component {
    constructor() {
      super({
        templateUrl: templateOne.url
      });
    }
  }
  window.customElements.define("component-one", ComponentOne);

  class ComponentTwo extends Component {
    constructor() {
      super({
        templateUrl: templateTwo.url
      });
    }
  }
  window.customElements.define("component-two", ComponentTwo);

  class ComponentThree extends Component {
    constructor() {
      super({
        templateUrl: templateThree.url
      });
    }
  }
  window.customElements.define("component-three", ComponentThree);

  let router: HTMLElement | undefined = undefined;
  let div: HTMLDivElement;

  beforeAll(() => {
    Component["savedTemplates"] = {};
    Component["savedStyles"] = {};
    spyOn(window, "fetch").and.callFake(mockFetch);
    div = document.createElement("div");
    div.hidden = true;
    document.body.append(div);
  });

  beforeEach(() => {
    spyOn(history, "pushState");
    router = document.createElement("app-router");
    div.append(router);
    RouterService["config"] = undefined;
  });

  afterEach(() => {
    router?.remove();
  });

  it("should init the RouterService and redirect", () => {
    const routeSpy = spyOn(RouterService, "route").and.callThrough();
    const insertSpy = spyOn<typeof RouterService, any>(
      RouterService,
      "insert"
    ).and.callThrough();
    RouterService.init({
      routes: [
        {
          path: new RegExp(/^\/?$/),
          redirectTo: "/one"
        },
        {
          path: new RegExp(/^\/one$/),
          component: ComponentOne
        },
        {
          path: new RegExp(/^\/two$/),
          component: ComponentTwo
        }
      ]
    });
    expect(routeSpy).toHaveBeenCalledTimes(2);
    const args = routeSpy.calls.allArgs();
    expect(args[0]).toEqual(["/"]);
    expect(args[1]).toEqual(["/one"]);
    expect(insertSpy).toHaveBeenCalledOnceWith(ComponentOne);
    expect(history.pushState).toHaveBeenCalledTimes(1);
    expect(
      (history.pushState as jasmine.Spy<any>).calls.mostRecent().args[2]
    ).toBe("/one");
  });

  it("should not allow multiple inits", () => {
    expect(() => {
      RouterService.init({
        routes: []
      });
      RouterService.init({
        routes: []
      });
    }).toThrow(new Error("The RouterService can only be initialized once."));
  });

  it("should not allow routing if no 'app-router' element has been found", () => {
    router?.remove();
    const routeSpy = spyOn(RouterService, "route").and.callThrough();
    expect(() => {
      RouterService.init({
        routes: []
      });
    }).toThrow(
      new Error("The 'app-router' element has not been added to a template.")
    );
    expect(routeSpy).toHaveBeenCalledTimes(1);

    expect(() => {
      RouterService.route("/one");
    }).toThrow(
      new Error("The 'app-router' element has not been added to a template.")
    );

    expect(routeSpy).toHaveBeenCalledTimes(2);
  });

  it("should not allow routing if RouterService has not been initialized", () => {
    expect(() => {
      RouterService.route("/one");
    }).toThrow(new Error("The RouterService has not been initialized."));
  });

  it("should not insert with no match", () => {
    const routeSpy = spyOn(RouterService, "route").and.callThrough();
    const insertSpy = spyOn<typeof RouterService, any>(
      RouterService,
      "insert"
    ).and.callThrough();
    RouterService.init({
      routes: [
        {
          path: new RegExp(/^\/one$/),
          component: ComponentOne
        },
        {
          path: new RegExp(/^\/two$/),
          component: ComponentTwo
        }
      ]
    });
    expect(routeSpy).toHaveBeenCalledTimes(1);
    expect(insertSpy).toHaveBeenCalledTimes(0);
    expect(history.pushState).toHaveBeenCalledTimes(0);
  });

  it("should insert notFound component with no match", () => {
    const routeSpy = spyOn(RouterService, "route").and.callThrough();
    const insertSpy = spyOn<typeof RouterService, any>(
      RouterService,
      "insert"
    ).and.callThrough();
    RouterService.init({
      routes: [
        {
          path: new RegExp(/^\/one$/),
          component: ComponentOne
        }
      ],
      notFound: ComponentThree
    });
    expect(routeSpy).toHaveBeenCalledTimes(1);
    const args = routeSpy.calls.allArgs();
    expect(args[0]).toEqual(["/"]);
    expect(insertSpy).toHaveBeenCalledOnceWith(ComponentThree);
    expect(history.pushState).toHaveBeenCalledTimes(1);
    expect(
      (history.pushState as jasmine.Spy<any>).calls.mostRecent().args[2]
    ).toBe("/");
  });

  it("should insert correct component with match", () => {
    const routeSpy = spyOn(RouterService, "route").and.callThrough();
    const insertSpy = spyOn<typeof RouterService, any>(
      RouterService,
      "insert"
    ).and.callThrough();
    RouterService.init({
      routes: [
        {
          path: new RegExp(/^\/one$/),
          component: ComponentOne
        },
        {
          path: new RegExp(/^\/two$/),
          component: ComponentTwo
        }
      ]
    });
    RouterService.route("/two");
    expect(routeSpy).toHaveBeenCalledTimes(2);
    const args = routeSpy.calls.allArgs();
    expect(args[0]).toEqual(["/"]);
    expect(args[1]).toEqual(["/two"]);
    expect(insertSpy).toHaveBeenCalledOnceWith(ComponentTwo);
    expect(history.pushState).toHaveBeenCalledTimes(1);
    expect(
      (history.pushState as jasmine.Spy<any>).calls.mostRecent().args[2]
    ).toBe("/two");
  });

  it("should not insert with match and guard fail", () => {
    const insertSpy = spyOn<typeof RouterService, any>(
      RouterService,
      "insert"
    ).and.callThrough();
    RouterService.init({
      routes: [
        {
          path: new RegExp(/^\/one$/),
          component: ComponentOne
        },
        {
          path: new RegExp(/^\/two$/),
          component: ComponentTwo,
          guard: () => false
        }
      ]
    });
    RouterService.route("/two");
    expect(insertSpy).toHaveBeenCalledTimes(0);
  });

  it("should insert with match and guard success", () => {
    const insertSpy = spyOn<typeof RouterService, any>(
      RouterService,
      "insert"
    ).and.callThrough();
    RouterService.init({
      routes: [
        {
          path: new RegExp(/^\/one$/),
          component: ComponentOne
        },
        {
          path: new RegExp(/^\/two$/),
          component: ComponentTwo,
          guard: () => true
        }
      ]
    });
    RouterService.route("/two");
    expect(insertSpy).toHaveBeenCalledOnceWith(ComponentTwo);
  });

  it("should call route on popstate event", () => {
    RouterService.init({
      routes: [
        {
          path: new RegExp(/^\/one$/),
          component: ComponentOne
        },
        {
          path: new RegExp(/^\/two$/),
          component: ComponentTwo
        }
      ]
    });
    const routeSpy = spyOn(RouterService, "route").and.callThrough();
    window.dispatchEvent(new Event("popstate"));
    expect(routeSpy).toHaveBeenCalledTimes(1);
    const args = routeSpy.calls.allArgs();
    expect(args[0]).toEqual(["/", false]);
    expect(history.pushState).toHaveBeenCalledTimes(0);
  });
});
