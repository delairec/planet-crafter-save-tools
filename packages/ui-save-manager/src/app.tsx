import {Router, RouteSectionProps} from "@solidjs/router";
import {FileRoutes} from "@solidjs/start/router";
import "./app.css";
import {Component, Suspense} from "solid-js";
import {appName, resolveVersionLabel} from "~/messages/appMessages";
import HomeDisclaimer from "~/components/HomeDisclaimer";
import SaveManagerMenu from "~/components/shell/SaveManagerMenu";
import {LoadedSaveProvider} from "~/lib/loadedSave";
import {preventDropOutsideAreas} from "~/lib/preventDropOutsideAreas";
import {version} from "../package.json";

const Layout: Component<RouteSectionProps> = (props) => {
  preventDropOutsideAreas();

  return (
    <LoadedSaveProvider>
      <header>
        <h1 class="text-center drop-shadow-engraved">{appName}</h1>
      </header>
      <div class="container rounded-lg shell">
        <SaveManagerMenu/>
        <main class="shell-page">
          <HomeDisclaimer/>
          <Suspense>
            {props.children}
          </Suspense>
        </main>
      </div>
      <footer class="text-center">
        {resolveVersionLabel(version)}
      </footer>
    </LoadedSaveProvider>
  );
};

export default function App() {
  return (
    <Suspense>
      <Router root={Layout}>
        <FileRoutes/>
      </Router>
    </Suspense>
  );
}
