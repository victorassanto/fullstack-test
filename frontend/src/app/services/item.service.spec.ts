import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ItemService, SearchParams } from './item.service';
import { environment } from '../../environments/environment';
import { PaginatedItems } from '../models/item.model';

describe('ItemService', () => {
  let service: ItemService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/items`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ItemService],
    });
    service = TestBed.inject(ItemService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get items with correct params', () => {
    const mockResponse: PaginatedItems = {
      data: [],
      total: 0,
      page: 1,
      limit: 5,
      totalPages: 0,
    };
    const searchParams: SearchParams = { page: 1, limit: 5, title: 'test' };

    service.getItems(searchParams).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const expectedUrl = `${apiUrl}?page=1&limit=5&title=test`;
    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create an item with POST', () => {
    const formData = new FormData();
    formData.append('title', 'new title');

    service.createItem(formData).subscribe();

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(formData);
    req.flush({});
  });

  it('should update an item with PATCH', () => {
    const formData = new FormData();
    formData.append('title', 'updated title');
    const itemId = '123';

    service.updateItem(itemId, formData).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/${itemId}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(formData);
    req.flush({});
  });

  it('should delete an item with DELETE', () => {
    const itemId = '123';

    service.deleteItem(itemId).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/${itemId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
