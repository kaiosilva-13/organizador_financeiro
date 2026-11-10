import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const DATE_MESSAGE = 'A data deve estar no formato YYYY-MM-DD.';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateTransactionDto {
  @Type(() => Number)
  @IsInt({ message: 'Selecione uma conta financeira válida.' })
  @Min(1, { message: 'Selecione uma conta financeira válida.' })
  accountId: number;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Informe o título da movimentação.' })
  @MaxLength(255, { message: 'O título deve ter no máximo 255 caracteres.' })
  title: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(255, { message: 'A descrição deve ter no máximo 255 caracteres.' })
  description?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Informe um valor válido.' })
  @IsPositive({ message: 'Informe um valor maior que zero.' })
  @Max(99999999.99, { message: 'O valor máximo permitido é 99.999.999,99.' })
  amount: number;

  @IsIn(['income', 'expense'], { message: 'Tipo de movimentação inválido.' })
  type: 'income' | 'expense';

  @Type(() => Number)
  @IsInt({ message: 'Selecione uma categoria.' })
  @Min(1, { message: 'Selecione uma categoria.' })
  categoryId: number;

  @IsOptional()
  @Matches(DATE_PATTERN, { message: DATE_MESSAGE })
  date?: string;

  /**
   * O comprovante em si segue no campo multipart `receipt` (arquivo), validado
   * em `validateReceiptFile`. Aqui chega apenas a flag de remoção.
   */
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  removeReceipt?: boolean;
}
