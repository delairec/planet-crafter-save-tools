import {Page} from "@playwright/test";

declare global {
  interface Window {
    releaseTheHeldFileReads(): void;
    holdTheFileReadsAgain(): void;
  }
}

export async function holdEveryFileRead(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const readTextOfBlob = Blob.prototype.text;
    const readArrayBufferOfBlob = Blob.prototype.arrayBuffer;
    let letTheReadsThrough = () => {};
    const holdTheReads = () => new Promise<void>((resolve) => {
      letTheReadsThrough = resolve;
    });
    let readsReleased = holdTheReads();

    window.releaseTheHeldFileReads = () => letTheReadsThrough();
    window.holdTheFileReadsAgain = () => {
      readsReleased = holdTheReads();
    };

    Blob.prototype.text = function (this: Blob) {
      return readsReleased.then(() => readTextOfBlob.call(this));
    };
    Blob.prototype.arrayBuffer = function (this: Blob) {
      return readsReleased.then(() => readArrayBufferOfBlob.call(this));
    };
    Blob.prototype.stream = function (this: Blob) {
      const bytesRead = readsReleased.then(() => readArrayBufferOfBlob.call(this));

      return new ReadableStream({
        async start(controller) {
          controller.enqueue(new Uint8Array(await bytesRead));
          controller.close();
        }
      });
    };
  });
}

export async function releaseTheHeldFileReads(page: Page): Promise<void> {
  await page.evaluate(() => window.releaseTheHeldFileReads());
}

export async function holdTheFileReadsAgain(page: Page): Promise<void> {
  await page.evaluate(() => window.holdTheFileReadsAgain());
}
