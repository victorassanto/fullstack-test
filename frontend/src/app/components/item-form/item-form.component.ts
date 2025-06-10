import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Item } from '../../models/item.model';
import { ItemService } from '../../services/item.service';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.css'],
})
export class ItemFormComponent implements OnInit {
  @Input() itemToEdit: Item | null = null;
  @Output() formClose = new EventEmitter<{
    success: boolean;
    isEdit: boolean;
  }>();

  itemForm: FormGroup;
  isSubmitting = false;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  isImageMarkedForDeletion = false;

  constructor(private fb: FormBuilder, private itemService: ItemService) {
    this.itemForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.itemToEdit) {
      this.itemForm.patchValue(this.itemToEdit);
      if (this.itemToEdit.photoUrl) {
        this.imagePreview = `${environment.apiUrl}${this.itemToEdit.photoUrl}`;
      }
    }
  }

  get title() {
    return this.itemForm.get('title');
  }
  get description() {
    return this.itemForm.get('description');
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.isImageMarkedForDeletion = false;
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.isImageMarkedForDeletion = true;
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('title', this.itemForm.value.title);
    formData.append('description', this.itemForm.value.description);

    if (this.selectedFile) {
      formData.append('photo', this.selectedFile, this.selectedFile.name);
    } else if (this.isImageMarkedForDeletion) {
      formData.append('removePhoto', 'true');
    }

    const isEdit = !!this.itemToEdit;
    const operation = isEdit
      ? this.itemService.updateItem(this.itemToEdit!._id, formData)
      : this.itemService.createItem(formData);

    operation.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.formClose.emit({ success: true, isEdit });
      },
      error: (err) => {
        console.error('Falha ao salvar o item', err);
        alert(
          'Ocorreu um erro ao salvar. Verifique o console para mais detalhes.'
        );
        this.isSubmitting = false;
      },
    });
  }

  close(): void {
    this.formClose.emit({ success: false, isEdit: !!this.itemToEdit });
  }
}
