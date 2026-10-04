import {createEffect, JSX, on} from 'solid-js';
import {closeMenuButtonLabel, menuLabel} from '~/messages/shellMessages';

interface FoldableMenuProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  children: JSX.Element;
}

export default function FoldableMenu(props: FoldableMenuProps) {
  let closeButton!: HTMLButtonElement;

  createEffect(on(() => props.isOpen, (isOpen) => {
    if (isOpen) {
      closeButton.focus();
    }
  }, {defer: true}));

  function closeOnEscape(event: KeyboardEvent) {
    if (props.isOpen && event.key === 'Escape') {
      props.onClose();
    }
  }

  return (
    <div id={props.id} class="menu-dialog" classList={{'menu-dialog-open': props.isOpen}}
         role={props.isOpen ? 'dialog' : undefined} aria-modal={props.isOpen ? 'true' : undefined}
         aria-label={props.isOpen ? menuLabel : undefined} data-testid="menu-dialog" onKeyDown={closeOnEscape}>
      <button ref={closeButton} type="button" class="menu-close" data-testid="menu-close" onClick={() => props.onClose()}>
        {closeMenuButtonLabel}
      </button>
      {props.children}
    </div>
  );
}
