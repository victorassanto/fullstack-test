import { Component, OnInit } from '@angular/core';
import { ItemService, SearchParams } from '../../services/item.service';
import { Item, PaginatedItems } from '../../models/item.model';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { ItemFormComponent } from '../item-form/item-form.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, ItemFormComponent, FormsModule],
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css'],
})
export class ItemListComponent implements OnInit {
  paginatedItems: PaginatedItems = {
    data: [],
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
  };
  isLoading = true;
  error: string | null = null;
  showForm = false;
  currentItem: Item | null = null;
  notification = { message: '', type: '' };

  filters: { title: string; description: string } = {
    title: '',
    description: '',
  };
  sort: { by: string; order: 'asc' | 'desc' } = {
    by: 'createdAt',
    order: 'desc',
  };

  private readonly API_URL = environment.apiUrl;

  constructor(private itemService: ItemService) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(page: number = 1): void {
    this.isLoading = true;
    this.error = null;

    const params: SearchParams = {
      page: page,
      limit: this.paginatedItems.limit,
      title: this.filters.title,
      description: this.filters.description,
      sortBy: this.sort.by,
      sortOrder: this.sort.order,
    };

    this.itemService.getItems(params).subscribe({
      next: (data) => {
        console.log('DADOS RECEBIDOS DENTRO DO COMPONENTE:', data);

        this.paginatedItems = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('ERRO NA REQUISIÇÃO:', err); // Adicione isso também
        this.error = 'Falha ao carregar os itens.';
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    this.loadItems(1);
  }

  clearFilters(): void {
    this.filters = { title: '', description: '' };
    this.sort = { by: 'createdAt', order: 'desc' };
    this.loadItems(1);
  }

  changeSort(sortByField: string): void {
    if (this.sort.by === sortByField) {
      this.sort.order = this.sort.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.sort.by = sortByField;
      this.sort.order = 'desc';
    }
    this.loadItems(1);
  }

  getImageUrl(photoUrl?: string): string {
    return photoUrl
      ? `${this.API_URL}${photoUrl}`
      : 'https://placehold.co/500x500?text=Sem+Foto';
  }

  editItem(item: Item): void {
    this.currentItem = item;
    this.showForm = true;
  }

  deleteItem(id: string): void {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      this.itemService.deleteItem(id).subscribe({
        next: () => {
          this.showNotification('Item excluído com sucesso!', 'success');
          if (
            this.paginatedItems.data.length === 1 &&
            this.paginatedItems.page > 1
          ) {
            this.loadItems(this.paginatedItems.page - 1);
          } else {
            this.loadItems(this.paginatedItems.page);
          }
        },
        error: () => this.showNotification('Falha ao excluir o item.', 'error'),
      });
    }
  }

  changePage(page: number): void {
    this.loadItems(page);
  }

  onFormClose(event: { success: boolean; isEdit: boolean }): void {
    this.showForm = false;
    this.currentItem = null;
    if (event.success) {
      this.showNotification('Item salvo com sucesso!', 'success');
      const pageToLoad = event.isEdit ? this.paginatedItems.page : 1;
      this.loadItems(pageToLoad);
    }
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.notification = { message, type };
    setTimeout(() => (this.notification.message = ''), 3000);
  }
}
