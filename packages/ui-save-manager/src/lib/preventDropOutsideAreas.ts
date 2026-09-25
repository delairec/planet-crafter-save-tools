import {onCleanup, onMount} from 'solid-js';

export function preventDropOutsideAreas(): void {
  const keepThePage = (event: DragEvent) => event.preventDefault();
  onMount(() => {
    window.addEventListener('dragover', keepThePage);
    window.addEventListener('drop', keepThePage);
    onCleanup(() => {
      window.removeEventListener('dragover', keepThePage);
      window.removeEventListener('drop', keepThePage);
    });
  });
}
