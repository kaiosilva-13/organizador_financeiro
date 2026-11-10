import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'Informe o nome da categoria.' })
  @MaxLength(80, { message: 'O nome da categoria deve ter no máximo 80 caracteres.' })
  name: string;

  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'A cor da categoria deve estar no formato hexadecimal (#RRGGBB).',
  })
  color: string;
}
