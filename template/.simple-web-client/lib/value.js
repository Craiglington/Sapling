export class Value {
    _value;
    templateElements = [];
    constructor(value) {
        this._value = value;
    }
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;
        this.updateTemplateProperties();
    }
    updateTemplateProperties() {
        for (const templateElement of this.templateElements) {
            for (const property of templateElement.properties.entries()) {
                this.setElementProperty(templateElement.element, property[0], property[1]);
            }
        }
    }
    setElementProperty(element, property, callback) {
        try {
            element[property] = callback(this._value);
        }
        catch (error) {
            console.error("Error while setting template element property: ", error);
        }
    }
    bindTemplateProperty(element, property, callback) {
        const setCallback = callback || ((value) => value);
        this.setElementProperty(element, property, setCallback);
        let templateElement = this.templateElements.find((existingTemplateElement) => existingTemplateElement.element === element);
        if (!templateElement) {
            templateElement = {
                element: element,
                properties: new Map()
            };
            this.templateElements.push(templateElement);
        }
        templateElement.properties.set(property, setCallback);
    }
    unbindTemplateProperty(element, property) {
        let templateElementIndex = this.templateElements.findIndex((existingTemplateElement) => existingTemplateElement.element === element);
        if (templateElementIndex === -1)
            return;
        const properties = this.templateElements[templateElementIndex]
            .properties;
        if (properties.delete(property) && properties.size === 0) {
            this.templateElements.splice(templateElementIndex, 1);
        }
    }
    unbindTemplateProperties() {
        this.templateElements.length = 0;
    }
}
