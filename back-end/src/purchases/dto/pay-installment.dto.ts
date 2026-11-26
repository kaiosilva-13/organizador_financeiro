import { Type } from 'class-transformer';
import { IsInt, IsOptional, Matches, Min } from 'class-validator';
import {
  DATE_MESSAGE,
  DATE_PATTERN,
} from '../../transactions/dto/create-transaction.dto';

/**
 * Pagamento de uma parcela (multipart/form-data). O comprovante segue no
 * campo `receipt` (arquivo opcional: PDF, JPG ou PNG de até 10 MB).
 */
export class PayInstallmentDto {
  @Type(() => Number)
  @IsInt({ message: 'Selecione uma conta financeira válida.' })
  @Min(1, { message: 'Selecione uma conta financeira válida.' })
  accountId: number;

  /** `YYYY-MM-DD`. Se omitida, usa a data de hoje (fuso de São Paulo). */
  @IsOptional()
  @Matches(DATE_PATTERN, { message: DATE_MESSAGE })
  date?: string;
}
