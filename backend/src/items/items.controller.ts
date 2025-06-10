import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PaginationDto } from './shared/pagination.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { PaginatedItemsResponseDto } from './dto/response/paginated-items-response.dto';
import { ItemResponseDto } from './dto/response/item-response.dto';

@ApiTags('items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo item' })
  @ApiResponse({
    status: 201,
    description: 'O item foi criado com sucesso.',
    type: ItemResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos.' })
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'description'],
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        photo: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem (opcional)',
        },
      },
    },
  })
  create(
    @Body() createItemDto: CreateItemDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.itemsService.create(createItemDto, file);
  }

  @Get()
  @ApiOperation({
    summary: 'Lista todos os itens com paginação, filtro e ordenação',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de itens retornada com sucesso.',
    type: PaginatedItemsResponseDto,
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.itemsService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um item pelo seu ID' })
  @ApiResponse({
    status: 200,
    description: 'Item retornado com sucesso.',
    type: ItemResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  @ApiParam({
    name: 'id',
    description: 'ID único do item no formato MongoDB ObjectId',
  })
  async findOne(@Param('id') id: string) {
    const item = await this.itemsService.findOne(id);
    if (!item) {
      throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
    }
    return item;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um item existente' })
  @ApiResponse({
    status: 200,
    description: 'Item atualizado com sucesso.',
    type: ItemResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  @ApiParam({ name: 'id', description: 'ID do item a ser atualizado' })
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        photo: { type: 'string', format: 'binary' },
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.itemsService.update(id, updateItemDto, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um item' })
  @ApiResponse({
    status: 200,
    description: 'Item removido com sucesso.',
    schema: { example: { message: 'Item successfully deleted' } },
  })
  @ApiResponse({ status: 404, description: 'Item não encontrado.' })
  @ApiParam({ name: 'id', description: 'ID do item a ser removido' })
  remove(@Param('id') id: string) {
    return this.itemsService.remove(id);
  }
}
