import {A} from "@solidjs/router";
import {
  notFoundRouteBackHomeLabel,
  notFoundRouteStatusCode,
  notFoundRouteTitle
} from "~/messages/notFoundRouteMessages";

export default function NotFound() {
  return (
    <main class="py-4 text-center text-xl">
      <p class="text-6xl">
        {notFoundRouteStatusCode}&nbsp;
        <span class="uppercase middle text-lg">{notFoundRouteTitle}</span>
      </p>
      <A href="/">{notFoundRouteBackHomeLabel}</A>
    </main>
  );
}
