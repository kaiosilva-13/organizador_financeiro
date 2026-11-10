import { BadRequestException } from '@nestjs/common';

/** Limite de tamanho do comprovante (mesmo valor validado no front-end). */
export const RECEIPT_MAX_SIZE = 10 * 1024 * 1024;

/** Allowlist de tipos aceitos (extensão -> MIME type). */
const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

/** Parte do arquivo enviado (multipart) que o back-end utiliza. */
export interface UploadedReceiptFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export type ValidatedReceipt = {
  dados: Buffer;
};

function matchesFileSignature(mimeType: string, bytes: Buffer): boolean {
  const startsWith = (signature: number[]) =>
    signature.every((value, index) => bytes[index] === value);

  switch (mimeType) {
    case 'application/pdf':
      // A especificação permite lixo antes do cabeçalho nos primeiros 1024 bytes.
      return bytes.subarray(0, 1024).includes('%PDF');
    case 'image/png':
      return startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case 'image/jpeg':
      return startsWith([0xff, 0xd8, 0xff]);
    default:
      return false;
  }
}

/**
 * Valida o comprovante recebido: extensão, MIME type (PDF, JPG ou PNG),
 * tamanho (até 10 MB) e assinatura (magic bytes) do arquivo.
 */
export function validateReceiptFile(
  file: UploadedReceiptFile,
): ValidatedReceipt {
  // O multer entrega o nome em latin1; converte de volta para UTF-8.
  const name = Buffer.from(file.originalname, 'latin1')
    .toString('utf8')
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}._ -]/gu, '_')
    .trim()
    .slice(-100);

  const extension = name.includes('.')
    ? (name.split('.').pop()?.toLowerCase() ?? '')
    : '';
  const mimeType = MIME_BY_EXTENSION[extension];

  if (mimeType === undefined || mimeType !== file.mimetype) {
    throw new BadRequestException(
      'Formato inválido. Envie um arquivo PDF, JPG ou PNG.',
    );
  }

  if (file.size <= 0 || file.buffer.length <= 0) {
    throw new BadRequestException('O comprovante enviado está vazio.');
  }

  if (file.size > RECEIPT_MAX_SIZE || file.buffer.length > RECEIPT_MAX_SIZE) {
    throw new BadRequestException('O comprovante deve ter no máximo 10 MB.');
  }

  if (!matchesFileSignature(mimeType, file.buffer)) {
    throw new BadRequestException(
      'O conteúdo do arquivo não corresponde ao formato informado.',
    );
  }

  return { dados: file.buffer };
}

/** Descobre o tipo do comprovante pelo conteúdo (o tipo não é salvo no banco). */
export function detectReceiptMimeType(bytes: Buffer): string {
  for (const mimeType of ['application/pdf', 'image/png', 'image/jpeg']) {
    if (matchesFileSignature(mimeType, bytes)) {
      return mimeType;
    }
  }

  return 'application/octet-stream';
}
