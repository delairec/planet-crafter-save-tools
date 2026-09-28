import {A, Router, RouteSectionProps, useMatch} from "@solidjs/router";
import {FileRoutes} from "@solidjs/start/router";
import "./app.css";
import {Component, Show, Suspense} from "solid-js";
import {appName, resolveVersionLabel} from "~/messages/appMessages";
import HomeDisclaimer from "~/components/HomeDisclaimer";
import SaveManagerMenu from "~/components/shell/SaveManagerMenu";
import {preventDropOutsideAreas} from "~/lib/preventDropOutsideAreas";
import {PAGE_PATHS} from "~/lib/pagePaths";
import {version} from "../package.json";
import {LoadedSaveProvider} from "~/providers/LoadedSaveProvider.tsx";
import {MergedSavesProvider} from "~/providers/MergedSavesProvider.tsx";

const Layout: Component<RouteSectionProps> = (props) => {
  preventDropOutsideAreas();
  const isHomePage = useMatch(() => PAGE_PATHS.homePath);

  return (
    <LoadedSaveProvider>
      <header>
        <h1 class="text-center drop-shadow-engraved" data-testid="application-title">
          <A href={PAGE_PATHS.homePath} class="application-title-link" data-testid="application-title-link">{appName}</A>
        </h1>
      </header>
      <div class="container rounded-lg shell" classList={{"shell-without-menu": !!isHomePage()}}>
        <Show when={!isHomePage()}>
          <SaveManagerMenu/>
        </Show>
        <main class="shell-page">
          <HomeDisclaimer/>
          <Suspense>
            {props.children}
          </Suspense>
        </main>
      </div>
      <footer class="application-version" data-testid="application-version">
        {resolveVersionLabel(version)}
      </footer>
    </LoadedSaveProvider>
  );
};

export default function App() {
  return (
    <Suspense>
      <MergedSavesProvider>
        <Router root={Layout}>
          <FileRoutes/>
        </Router>
      </MergedSavesProvider>
    </Suspense>
  );
}
