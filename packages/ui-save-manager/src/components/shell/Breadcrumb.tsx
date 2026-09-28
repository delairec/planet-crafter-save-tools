import {breadcrumbLabel} from '~/messages/shellMessages';

interface BreadcrumbProps {
  group: string;
  page: string;
}

export default function Breadcrumb(props: BreadcrumbProps) {
  return (
    <nav class="breadcrumb" aria-label={breadcrumbLabel}>
      <ol>
        <li data-testid="breadcrumb-step">{props.group}</li>
        <li class="breadcrumb-page" aria-current="page" data-testid="breadcrumb-step">{props.page}</li>
      </ol>
    </nav>
  );
}
