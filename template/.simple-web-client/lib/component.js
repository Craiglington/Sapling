var Component = (function () {
    function Component(options) {
        this.parent = options.parent;
        if (options.template) {
            this.template = options.template;
        }
        else if (options.templateUrl) {
            var headers = new Headers({
                "Content-Type": "text/html"
            });
            fetch(options.templateUrl, {
                headers: headers
            })
                .then(function (response) { return response.text(); })
                .then(function (response) {
                console.log(response);
            });
        }
        else {
            throw new Error("Either the template or templateUrl property must be set in the ComponentOptions.");
        }
    }
    return Component;
}());
export { Component };
