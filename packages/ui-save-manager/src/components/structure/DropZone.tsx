import {createSignal, JSX, Show} from 'solid-js';
import {resolveNotJsonFileMessage} from '~/messages/dropZoneMessages';

interface DropZoneProps {
  label: string;
  maximumFileCount: number;
  tooManyFilesMessage: string;
  onFilesDropped: (files: File[]) => void;
  class?: string;
  children: JSX.Element;
}

const JSON_FILE_NAME = /\.json$/i;

export default function DropZone(props: DropZoneProps) {
  const [dragEnterDepth, setDragEnterDepth] = createSignal<number>(0);
  const [rejectionMessage, setRejectionMessage] = createSignal<string | null>(null);

  const findRejectionMessage = (files: File[]): string | null => {
    if (files.length > props.maximumFileCount) {
      return props.tooManyFilesMessage;
    }
    const notJsonFile = files.find((file) => !JSON_FILE_NAME.test(file.name));
    return notJsonFile ? resolveNotJsonFileMessage(notJsonFile.name) : null;
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragEnterDepth(0);
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (!files.length) {
      return;
    }
    const message = findRejectionMessage(files);
    setRejectionMessage(message);
    if (!message) {
      props.onFilesDropped(files);
    }
  };

  return (
    <div role="group" aria-label={props.label}
         class={`drop-zone ${props.class ?? ''}`}
         classList={{'drop-zone-active': dragEnterDepth() > 0}}
         onDragEnter={() => setDragEnterDepth((depth) => depth + 1)}
         onDragLeave={() => setDragEnterDepth((depth) => Math.max(depth - 1, 0))}
         onDragOver={handleDragOver}
         onDrop={handleDrop}>
      {props.children}
      <Show when={rejectionMessage()}>
        {(message) => <p class="text-color-danger">{message()}</p>}
      </Show>
    </div>
  );
}
