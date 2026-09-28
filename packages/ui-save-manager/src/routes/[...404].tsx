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
    <div class="py-4 text-center text-xl">
      <p class="text-6xl">
        {notFoundRouteStatusCode}&nbsp;
        <span class="uppercase middle text-lg" data-testid="not-found-title">{notFoundRouteTitle}</span>
      </p>
      <A href="/" data-testid="back-home-link"><Icon content={notFoundRouteBackHomeIcon}/> {notFoundRouteBackHomeLabel}</A>
    </div>
  );
}
