import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from './items.service';
import { getModelToken } from '@nestjs/mongoose';
import { Item } from './schemas/item.schema';
import { Model } from 'mongoose';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import * as fs from 'fs';

jest.mock('fs');

const mockItem = {
  _id: 'some-id-123',
  title: 'Test Item',
  description: 'Test Description',
  photoUrl: '/uploads/test.webp',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockItemModel = {
  find: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn().mockResolvedValue(mockItem),
  findById: jest.fn().mockResolvedValue(mockItem),
  findByIdAndUpdate: jest.fn().mockResolvedValue(mockItem),
  findByIdAndDelete: jest.fn().mockResolvedValue(mockItem),
};

describe('ItemsService', () => {
  let service: ItemsService;
  let model: Model<Item>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        {
          provide: getModelToken(Item.name),
          useValue: mockItemModel,
        },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
    model = module.get<Model<Item>>(getModelToken(Item.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return an item', async () => {
      const createItemDto: CreateItemDto = {
        title: 'New Item',
        description: 'New Description',
      };
      const result = await service.create(createItemDto);
      expect(result).toEqual(mockItem);
      expect(model.create).toHaveBeenCalledWith(createItemDto);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of items', async () => {
      const itemsArray = [mockItem];
      (model.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(itemsArray),
      });
      (model.countDocuments as jest.Mock).mockResolvedValue(itemsArray.length);
      const result = await service.findAll({ page: 1, limit: 5 });
      expect(result.data).toEqual(itemsArray);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should find and return a single item by ID', async () => {
      (model.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockItem),
      });
      const result = await service.findOne('some-id-123');
      expect(model.findById).toHaveBeenCalledWith('some-id-123');
      expect(result).toEqual(mockItem);
    });
  });

  describe('update', () => {
    it('should find and update an item', async () => {
      const updateDto: UpdateItemDto = { title: 'Updated Title' };
      const updatedItem = { ...mockItem, ...updateDto };

      (model.findById as jest.Mock).mockResolvedValue(mockItem);
      (model.findByIdAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedItem),
      });

      const result = await service.update('some-id-123', updateDto);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'some-id-123',
        updateDto,
        { new: true },
      );
      expect(result).toEqual(updatedItem);
    });
  });

  describe('remove', () => {
    it('should find and delete an item and its photo', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const unlinkSyncSpy = jest
        .spyOn(fs, 'unlinkSync')
        .mockImplementation(() => {});

      (model.findByIdAndDelete as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockItem),
      });

      await service.remove('some-id-123');

      expect(model.findByIdAndDelete).toHaveBeenCalledWith('some-id-123');
      expect(unlinkSyncSpy).toHaveBeenCalled();
    });
  });
});
