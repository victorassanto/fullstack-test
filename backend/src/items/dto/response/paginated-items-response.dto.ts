import { ApiProperty } from '@nestjs/swagger';
import { ItemResponseDto } from './item-response.dto';

export class PaginatedItemsResponseDto {
  @ApiProperty({ type: [ItemResponseDto] })
  data: ItemResponseDto[];

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 5 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}
