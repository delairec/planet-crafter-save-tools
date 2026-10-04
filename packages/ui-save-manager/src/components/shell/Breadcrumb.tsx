import {Show} from 'solid-js';
import {A} from '@solidjs/router';
import {breadcrumbLabel} from '~/messages/shellMessages';

interface BreadcrumbProps {
  group?: string;
  page: string;
  pageHref?: string;
  subject?: string;
}

export default function Breadcrumb(props: BreadcrumbProps) {
  return (
    <nav class="breadcrumb" aria-label={breadcrumbLabel}>
      <ol>
        <Show when={props.group}>
          {(group) => <li data-testid="current-page-group">{group()}</li>}
        </Show>
        <Show
          when={props.pageHref}
          fallback={<li class="breadcrumb-page" aria-current={props.subject ? undefined : 'page'} data-testid="current-page-name">{props.page}</li>}
        >
          {(pageHref) => (
            <li class="breadcrumb-page" aria-current={props.subject ? undefined : 'page'}>
              <A href={pageHref()} data-testid="current-page-name">{props.page}</A>
            </li>
          )}
        </Show>
        <Show when={props.subject}>
          {(subject) => <li class="breadcrumb-page" aria-current="page" data-testid="current-page-subject">{subject()}</li>}
        </Show>
      </ol>
    </nav>
  );
}
