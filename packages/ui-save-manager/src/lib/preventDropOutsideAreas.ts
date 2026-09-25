import {onCleanup, onMount} from 'solid-js';

export function preventDropOutsideAreas(): void {
  const refuseWithoutOpening = (event: DragEvent) => {
    if (event.defaultPrevented) {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'none';
    }
  };
  const eventTypes = ['dragenter', 'dragover', 'drop'] as const;
  onMount(() => {
    eventTypes.forEach((type) => window.addEventListener(type, refuseWithoutOpening));
    onCleanup(() => eventTypes.forEach((type) => window.removeEventListener(type, refuseWithoutOpening)));
  });
}
