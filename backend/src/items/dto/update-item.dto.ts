import { ApiProperty } from '@nestjs/swagger';
import { IsBooleanString, IsOptional } from 'class-validator';
import { CreateItemDto } from './create-item.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateItemDto extends PartialType(CreateItemDto) {
  @ApiProperty({
    description: 'Sinaliza se a foto existente deve ser removida.',
    example: 'true',
    required: false,
  })
  @IsOptional()
  @IsBooleanString()
  removePhoto?: string;
}
