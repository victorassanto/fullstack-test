import { ApiProperty } from '@nestjs/swagger';

export class ItemResponseDto {
  @ApiProperty({ example: '6665e7a9c3b4a5d6e7f8b9c0' })
  _id: string;

  @ApiProperty({ example: 'Meu Item' })
  title: string;

  @ApiProperty({ example: 'Descrição do meu item.' })
  description: string;

  @ApiProperty({ required: false, example: '/uploads/arquivo.webp' })
  photoUrl?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
