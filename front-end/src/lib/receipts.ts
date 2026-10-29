import type { TransactionReceipt } from "../types/transaction";

/**
 * Navegadores bloqueiam a abertura de URLs `data:` em uma nova aba. Para
 * manter os comprovantes persistentes e visualizáveis, o valor salvo continua
 * sendo a data URL e convertemos para uma URL `blob:` apenas na exibição.
 *
 * TODO [BACKEND]: Com o upload no S3, esta conversão deixa de ser necessária.
 */
const objectUrlCache = new Map<string, string>();

function dataUrlToBlob(dataUrl: string): Blob {
  const [metadata, base64] = dataUrl.split(",");

  if (!metadata || base64 === undefined) {
    throw new Error("Comprovante inválido.");
  }

  const mimeType =
    metadata.match(/^data:([^;,]+)/)?.[1] ?? "application/octet-stream";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

export function getReceiptOpenUrl(receipt: TransactionReceipt): string {
  if (!receipt.url.startsWith("data:")) {
    return receipt.url;
  }

  const cachedUrl = objectUrlCache.get(receipt.url);

  if (cachedUrl) {
    return cachedUrl;
  }

  try {
    const objectUrl = URL.createObjectURL(dataUrlToBlob(receipt.url));
    objectUrlCache.set(receipt.url, objectUrl);

    return objectUrl;
  } catch (error) {
    console.error(
      "Não foi possível preparar o comprovante para visualização:",
      error,
    );
    return receipt.url;
  }
}
