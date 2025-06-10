export interface Item {
  _id: string;
  title: string;
  description: string;
  photoUrl?: string;
  createdAt: string;
}

export interface PaginatedItems {
  data: Item[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
