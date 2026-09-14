import {A} from "@solidjs/router";
import {
  notFoundRouteBackHomeIcon,
  notFoundRouteBackHomeLabel,
  notFoundRouteStatusCode,
  notFoundRouteTitle
} from "~/messages/notFoundRouteMessages";
import Icon from "~/components/Icon";

export default function NotFound() {
  return (
    <main class="py-4 text-center text-xl">
      <p class="text-6xl">
        {notFoundRouteStatusCode}&nbsp;
        <span class="uppercase middle text-lg">{notFoundRouteTitle}</span>
      </p>
      <A href="/"><Icon content={notFoundRouteBackHomeIcon}/> {notFoundRouteBackHomeLabel}</A>
    </main>
  );
}
