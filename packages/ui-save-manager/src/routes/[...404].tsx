import {A} from "@solidjs/router";
import {
  notFoundRouteBackHomeIcon,
  notFoundRouteBackHomeLabel,
  notFoundRouteStatusCode,
  notFoundRouteTitle
} from "~/messages/notFoundRouteMessages";
import Icon from "~/components/Icon";
import {PAGE_PATHS} from "~/lib/pagePaths";

export default function NotFound() {
  return (
    <div class="py-4 text-center text-xl">
      <p class="text-6xl">
        {notFoundRouteStatusCode}&nbsp;
        <span class="uppercase middle text-lg" data-testid="not-found-title">{notFoundRouteTitle}</span>
      </p>
      <A href={PAGE_PATHS.homePath} data-testid="home-page-link"><Icon content={notFoundRouteBackHomeIcon}/> {notFoundRouteBackHomeLabel}</A>
    </div>
  );
}
