export function selectFileInInput(input: HTMLInputElement, file: File | undefined): void {
  const selection = new DataTransfer();
  if (file) {
    selection.items.add(file);
  }
  input.files = selection.files;
  input.dispatchEvent(new Event('change', {bubbles: true}));
}
