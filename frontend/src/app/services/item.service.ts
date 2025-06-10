import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Item, PaginatedItems } from '../models/item.model';

export interface SearchParams {
  page?: number;
  limit?: number;
  title?: string;
  description?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private apiUrl = `${environment.apiUrl}/items`;

  constructor(private http: HttpClient) {}

  getItems(params: SearchParams): Observable<PaginatedItems> {
    let httpParams = new HttpParams();

    if (params.page)
      httpParams = httpParams.set('page', params.page.toString());
    if (params.limit)
      httpParams = httpParams.set('limit', params.limit.toString());
    if (params.title) httpParams = httpParams.set('title', params.title);
    if (params.description)
      httpParams = httpParams.set('description', params.description);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortOrder)
      httpParams = httpParams.set('sortOrder', params.sortOrder);

    return this.http.get<PaginatedItems>(this.apiUrl, { params: httpParams });
  }

  getItem(id: string): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${id}`);
  }

  createItem(formData: FormData): Observable<Item> {
    return this.http.post<Item>(this.apiUrl, formData);
  }

  updateItem(id: string, formData: FormData): Observable<Item> {
    return this.http.patch<Item>(`${this.apiUrl}/${id}`, formData);
  }

  deleteItem(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
