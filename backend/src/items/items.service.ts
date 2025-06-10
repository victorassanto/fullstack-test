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

    const filterQuery: any = {};
    if (title) {
      filterQuery.title = { $regex: title, $options: 'i' };
    }
    if (description) {
      filterQuery.description = { $regex: description, $options: 'i' };
    }

    const sortQuery: any = {};
    if (sortBy && sortOrder) {
      sortQuery[sortBy] = sortOrder;
    }

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

    const payload: any = { ...updateItemDto };

    if (updateItemDto.removePhoto === 'true' && existingItem.photoUrl) {
      const oldPath = join(process.cwd(), 'public', existingItem.photoUrl);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (e) {
          console.error('Failed to delete old photo:', e);
        }
      }
      payload.photoUrl = null;
    } else if (file) {
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
      payload.photoUrl = await this.savePhoto(file);
    }

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
    if (item.photoUrl) {
      const path = join(__dirname, '..', '..', 'public', item.photoUrl);
      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
      }
    }
    console.log(`[DELETE] Item removido: ${item._id}`);
    return { message: 'Item successfully deleted', status: HttpStatus.OK };
  }
}
