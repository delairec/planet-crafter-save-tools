import {breadcrumbLabel} from '~/messages/shellMessages';

interface BreadcrumbProps {
  group: string;
  page: string;
}

export default function Breadcrumb(props: BreadcrumbProps) {
  return (
    <nav class="breadcrumb" aria-label={breadcrumbLabel}>
      <ol>
        <li>{props.group}</li>
        <li aria-current="page">{props.page}</li>
      </ol>
    </nav>
  );
}
