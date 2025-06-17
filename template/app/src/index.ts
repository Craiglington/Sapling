import {Component} from "/simple-web-client/component.js";

export class HeaderComponent extends Component {
  constructor(parent: HTMLElement) {
    super({
      parent: parent,
      templateUrl: "./templates/header.html",
      
    });
  }
}

const header = new HeaderComponent(document.body);