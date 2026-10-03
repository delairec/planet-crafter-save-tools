import {JSX} from 'solid-js';
import {A} from '@solidjs/router';
import {PAGE_PATHS} from '~/lib/pagePaths';

interface ApplicationTitleProps {
  class: string;
  children: JSX.Element;
}

export default function ApplicationTitle(props: ApplicationTitleProps) {
  return (
    <h1 class={props.class} data-testid="application-title">
      <A href={PAGE_PATHS.homePath} class="application-title-link" data-testid="application-title-link">{props.children}</A>
    </h1>
  );
}
