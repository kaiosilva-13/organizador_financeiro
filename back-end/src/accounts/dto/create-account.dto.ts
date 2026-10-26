
import { IsString, IsNotEmpty, IsNumber, Min, MaxLength } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  balance: number;
}
