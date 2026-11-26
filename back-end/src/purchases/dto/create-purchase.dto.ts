import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
} from 'class-validator';
import {
  DATE_MESSAGE,
  DATE_PATTERN,
} from '../../transactions/dto/create-transaction.dto';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/** Cadastro de uma compra parcelada (`POST /api/purchases`). */
export class CreatePurchaseDto {
  @Transform(trim)
  @IsString({ message: 'Informe o nome da compra.' })
  @IsNotEmpty({ message: 'Informe o nome da compra.' })
  @MaxLength(150, { message: 'O nome deve ter no máximo 150 caracteres.' })
  name: string;

  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'Informe uma descrição válida.' })
  @MaxLength(255, {
    message: 'A descrição deve ter no máximo 255 caracteres.',
  })
  description?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Informe um valor válido.' })
  @IsPositive({ message: 'Informe um valor maior que zero.' })
  @Max(99999999.99, { message: 'O valor máximo permitido é 99.999.999,99.' })
  totalAmount: number;

  /** Início dos pagamentos (`YYYY-MM-DD`) -> `data_inicio`. */
  @Matches(DATE_PATTERN, { message: DATE_MESSAGE })
  startDate: string;

  /** Fim previsto (`YYYY-MM-DD`) -> `data_fim_prevista`. */
  @Matches(DATE_PATTERN, { message: DATE_MESSAGE })
  endDate: string;
}
