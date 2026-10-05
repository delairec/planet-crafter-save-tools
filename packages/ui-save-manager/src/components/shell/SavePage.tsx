import {JSX, Show} from 'solid-js';
import {Navigate} from '@solidjs/router';
import Breadcrumb from '~/components/shell/Breadcrumb';
import {useLoadedSave} from '~/hooks/useLoadedSave.ts';
import {PAGE_PATHS} from '~/lib/pagePaths';

interface SavePageProps {
  group?: string;
  page: string;
  subject?: string;
  children: JSX.Element;
}

export default function SavePage(props: SavePageProps) {
  const loadedSave = useLoadedSave();

  return (
    <Show when={loadedSave.isSaveLoaded()} fallback={<Navigate href={PAGE_PATHS.loadSavePath}/>}>
      <Breadcrumb group={props.group} page={props.page} subject={props.subject}/>
      {props.children}
    </Show>
  );
}
