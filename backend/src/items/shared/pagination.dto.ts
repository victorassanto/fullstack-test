import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({ required: false, description: 'Número da página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    required: false,
    description: 'Quantidade de itens por página (Máx: 50)',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiProperty({
    required: false,
    description: 'Filtrar itens que contenham este texto no título',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    required: false,
    description: 'Filtrar itens que contenham este texto na descrição',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    required: false,
    description: 'Campo para ordenação',
    enum: ['title', 'createdAt', 'description'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn(['title', 'createdAt', 'description'])
  sortBy?: string = 'createdAt';

  @ApiProperty({
    required: false,
    description: 'Ordem da classificação',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: string = 'desc';
}
