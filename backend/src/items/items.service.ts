import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from './schemas/item.schema';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PaginationDto } from './shared/pagination.dto';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';
import * as fs from 'fs';
import { join } from 'path';
import { readdirSync, statSync } from 'fs';

const UPLOAD_DIR = join(__dirname, '..', '..', 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

@Injectable()
export class ItemsService {
  constructor(@InjectModel(Item.name) private itemModel: Model<Item>) {}

  private async savePhoto(file: Express.Multer.File): Promise<string> {
    const filename = `${uuidv4()}.webp`;
    const outputPath = join(UPLOAD_DIR, filename);

    await sharp(file.buffer)
      .resize(500, 500, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(outputPath);

    return `/uploads/${filename}`;
  }

  async create(
    createItemDto: CreateItemDto,
    file?: Express.Multer.File,
  ): Promise<Item> {
    const payload: Partial<Item> = { ...createItemDto };

    if (file) {
      payload.photoUrl = await this.savePhoto(file);
    }

    const saved = await this.itemModel.create(payload);

    console.log(`[CREATE] Item criado: ${saved._id}`);
    return saved;
  }

  async findAll(paginationDto: PaginationDto) {
    const {
      page = 1,
      limit = 5,
      title,
      description,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = paginationDto;

    const skip = (page - 1) * limit;

    // 1. Constrói a query de filtro dinamicamente
    const filterQuery: any = {};
    if (title) {
      // Usa $regex para fazer uma busca "contém", 'i' para ser case-insensitive
      filterQuery.title = { $regex: title, $options: 'i' };
    }
    if (description) {
      filterQuery.description = { $regex: description, $options: 'i' };
    }

    // 2. Constrói o objeto de ordenação
    const sortQuery: any = {};
    if (sortBy && sortOrder) {
      sortQuery[sortBy] = sortOrder;
    }

    // 3. Executa as buscas no banco de dados com os filtros
    const [data, total] = await Promise.all([
      this.itemModel.find(filterQuery).skip(skip).limit(Number(limit)).exec(),
      this.itemModel.countDocuments(filterQuery),
    ]);

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Item | null> {
    return this.itemModel.findById(id).exec();
  }

  async update(
    id: string,
    updateItemDto: UpdateItemDto,
    file?: Express.Multer.File,
  ): Promise<Item | null> {
    const existingItem = await this.itemModel.findById(id);
    if (!existingItem) {
      throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
    }

    // Clona os dados do DTO para o payload de atualização.
    const payload: any = { ...updateItemDto };

    // Se o sinal para remover a foto for enviado e o item tiver uma foto...
    if (updateItemDto.removePhoto === 'true' && existingItem.photoUrl) {
      const oldPath = join(process.cwd(), 'public', existingItem.photoUrl);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath); // Deleta o arquivo físico
        } catch (e) {
          console.error('Failed to delete old photo:', e);
        }
      }
      payload.photoUrl = null; // Define a URL da foto como nula no banco de dados
    }
    // Se não for para remover, verifica se um NOVO arquivo foi enviado para substituir
    else if (file) {
      // Apaga a foto antiga, se ela existir.
      if (existingItem.photoUrl) {
        const oldPath = join(process.cwd(), 'public', existingItem.photoUrl);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (e) {
            console.error('Failed to delete old photo:', e);
          }
        }
      }
      // Salva a nova foto.
      payload.photoUrl = await this.savePhoto(file);
    }

    // Remove a propriedade 'removePhoto' do payload para não tentar salvá-la no banco.
    delete payload.removePhoto;

    const updatedItem = await this.itemModel
      .findByIdAndUpdate(id, payload, { new: true })
      .exec();

    return updatedItem;
  }

  async remove(id: string) {
    const item = await this.itemModel.findByIdAndDelete(id).exec();
    if (!item) {
      throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
    }
    // Deletar a foto associada
    if (item.photoUrl) {
      const path = join(__dirname, '..', '..', 'public', item.photoUrl);
      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
      }
    }
    console.log(`[DELETE] Item removido: ${item._id}`);
    return { message: 'Item successfully deleted', status: HttpStatus.OK };
  }

  /**
   * Remove arquivos órfãos da pasta de uploads (que não estão associados a nenhum item).
   */
  async cleanOrphanUploads(): Promise<{ deleted: string[] }> {
    const allFiles = readdirSync(UPLOAD_DIR);
    const items = await this.itemModel.find({}, 'photoUrl').exec();
    const usedFiles = new Set(
      items.map((i) => i.photoUrl?.split('/').pop()).filter(Boolean),
    );
    const orphanFiles = allFiles.filter((f) => !usedFiles.has(f));
    const deleted: string[] = [];
    for (const file of orphanFiles) {
      try {
        fs.unlinkSync(join(UPLOAD_DIR, file));
        deleted.push(file);
      } catch (e) {
        console.error('Erro ao deletar arquivo órfão:', file, e);
      }
    }
    return { deleted };
  }
}
