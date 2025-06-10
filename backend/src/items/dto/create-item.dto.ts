import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty({
    description: 'O título do item',
    example: 'Meu Item Incrível',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'A descrição detalhada do item',
    example: 'Este item é muito útil para...',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
