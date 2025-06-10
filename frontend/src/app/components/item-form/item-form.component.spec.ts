import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemFormComponent } from './item-form.component';
import { ItemService } from '../../services/item.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Item } from '../../models/item.model';

describe('ItemFormComponent', () => {
  let component: ItemFormComponent;
  let fixture: ComponentFixture<ItemFormComponent>;
  let mockItemService: jasmine.SpyObj<ItemService>;

  const mockItemToEdit: Item = {
    _id: '123',
    title: 'Existing Item',
    description: 'Existing Desc',
    createdAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    mockItemService = jasmine.createSpyObj('ItemService', [
      'createItem',
      'updateItem',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        ItemFormComponent,
      ],
      providers: [{ provide: ItemService, useValue: mockItemService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should populate form when an item is passed for editing', () => {
    component.itemToEdit = mockItemToEdit;
    fixture.detectChanges();

    expect(component.itemForm.value.title).toBe('Existing Item');
    expect(component.itemForm.value.description).toBe('Existing Desc');
  });

  it('should call createItem on submit when creating a new item', () => {
    mockItemService.createItem.and.returnValue(of({} as Item));
    fixture.detectChanges();

    component.itemForm.patchValue({
      title: 'New Title',
      description: 'New Desc',
    });

    component.onSubmit();

    expect(mockItemService.createItem).toHaveBeenCalled();
    expect(mockItemService.updateItem).not.toHaveBeenCalled();
  });

  it('should call updateItem on submit when editing an item', () => {
    mockItemService.updateItem.and.returnValue(of({} as Item));
    component.itemToEdit = mockItemToEdit;
    fixture.detectChanges();

    component.itemForm.patchValue({ title: 'Updated Title' });

    component.onSubmit();

    expect(mockItemService.updateItem).toHaveBeenCalled();
    expect(mockItemService.createItem).not.toHaveBeenCalled();
  });
});
