import { IsString, IsNotEmpty, IsPositive, IsUrl, IsOptional } from 'class-validator';

export class UpdateBookDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @IsPositive()
  @IsOptional()
  price?: number;

  @IsUrl()
  @IsOptional()
  ebookFileUrl?: string;
}
