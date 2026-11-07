import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';

/** A conta de uma movimentação não pode ser alterada após o cadastro. */
export class UpdateTransactionDto extends PartialType(
  OmitType(CreateTransactionDto, ['accountId'] as const),
) {}
