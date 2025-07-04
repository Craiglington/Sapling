import { RouterService } from "/simple-web-client/router.js";
import { LoginComponent } from "./components/login/login.component.js";
import { AboutUsComponent } from "./components/about-us/about-us.component.js";
import "./components/header/header.component.js";
import "./components/footer/footer.component.js";

try {
  RouterService.init({
    routes: [
      {
        path: new RegExp(/^\/?$/),
        redirectTo: "/login"
      },
      {
        path: new RegExp(/^\/login.*$/),
        component: LoginComponent
      },
      {
        path: new RegExp(/^\/about-us.*$/),
        component: AboutUsComponent
      }
    ],
    notFound: LoginComponent
  });
} catch (error) {
  console.error(error);
}
