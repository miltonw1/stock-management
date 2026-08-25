import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
} from 'class-validator';

const MONEY_REGEX = /^\d{1,12}(\.\d{1,2})?$/;

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minStock?: number;

  @IsOptional()
  @IsString()
  @Matches(MONEY_REGEX)
  price?: string;

  @IsOptional()
  @IsString()
  @Matches(MONEY_REGEX)
  cost?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsInt()
  supplierId?: number;

  @IsOptional()
  @IsInt()
  locationId?: number;
}
