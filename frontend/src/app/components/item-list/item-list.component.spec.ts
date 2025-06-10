import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemListComponent } from './item-list.component';
import { ItemService } from '../../services/item.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { PaginatedItems } from '../../models/item.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ItemListComponent', () => {
  let component: ItemListComponent;
  let fixture: ComponentFixture<ItemListComponent>;
  let mockItemService: jasmine.SpyObj<ItemService>;

  const mockPaginatedItems: PaginatedItems = {
    data: [
      {
        _id: '1',
        title: 'Test Item from Mock',
        description: 'Desc',
        createdAt: new Date().toISOString(),
      },
    ],
    total: 1,
    page: 1,
    limit: 5,
    totalPages: 1,
  };

  beforeEach(async () => {
    mockItemService = jasmine.createSpyObj('ItemService', ['getItems']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        NoopAnimationsModule,
        ItemListComponent,
      ],
      providers: [{ provide: ItemService, useValue: mockItemService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadItems on init and populate the items list', () => {
    mockItemService.getItems.and.returnValue(of(mockPaginatedItems));
    fixture.detectChanges();

    expect(mockItemService.getItems).toHaveBeenCalledWith({
      page: 1,
      limit: 5,
      title: '',
      description: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    expect(component.paginatedItems.data.length).toBe(1);
    expect(component.isLoading).toBe(false);
  });

  it('should call loadItems with page 1 when applyFilters is called', () => {
    mockItemService.getItems.and.returnValue(of(mockPaginatedItems));
    component.filters.title = 'new filter';
    component.applyFilters();

    expect(mockItemService.getItems).toHaveBeenCalledWith({
      page: 1,
      limit: 5,
      title: 'new filter',
      description: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });
});
