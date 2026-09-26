import {JSX, Show} from 'solid-js';
import {Navigate} from '@solidjs/router';
import Breadcrumb from '~/components/shell/Breadcrumb';
import {useLoadedSave} from '~/lib/loadedSave';
import {overviewPath} from '~/lib/pagePaths';

interface SavePageProps {
  group: string;
  page: string;
  children: JSX.Element;
}

export default function SavePage(props: SavePageProps) {
  const loadedSave = useLoadedSave();

  return (
    <Show when={loadedSave.isSaveLoaded()} fallback={<Navigate href={overviewPath}/>}>
      <Breadcrumb group={props.group} page={props.page}/>
      {props.children}
    </Show>
  );
}
