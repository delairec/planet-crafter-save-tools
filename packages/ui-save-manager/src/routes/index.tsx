import {Navigate} from '@solidjs/router';
import {PAGE_PATHS} from '~/lib/pagePaths';

export default function HomePage() {
  return <Navigate href={PAGE_PATHS.loadSavePath}/>;
}
