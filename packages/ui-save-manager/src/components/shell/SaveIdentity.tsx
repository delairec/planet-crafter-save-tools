import {Show} from 'solid-js';
import {SaveIdentityViewModel} from 'core-mapping/presentation/viewModels/SaveIdentityViewModel';
import Surface from '~/components/structure/Surface';
import {saveIdentityLabel} from '~/messages/shellMessages';

interface SaveIdentityProps {
  saveIdentity: SaveIdentityViewModel;
}

export default function SaveIdentity(props: SaveIdentityProps) {
  return (
    <section class="menu-identity" aria-label={saveIdentityLabel} data-testid="save-identity">
      <Surface bordered>
        <p class="menu-identity-file" data-testid="save-identity-file-name">{props.saveIdentity.fileName}</p>
        <Show when={props.saveIdentity.displayName}>
          {(displayName) => <p class="menu-identity-detail" data-testid="save-identity-detail">{displayName()}</p>}
        </Show>
        <Show when={props.saveIdentity.mode}>
          {(mode) => <p class="menu-identity-detail" data-testid="save-identity-detail">{mode()}</p>}
        </Show>
        <Show when={props.saveIdentity.gameRelease}>
          {(gameRelease) => <p class="menu-identity-detail" data-testid="save-identity-detail">{gameRelease()}</p>}
        </Show>
      </Surface>
    </section>
  );
}
