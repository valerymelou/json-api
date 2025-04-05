# @vmelou/jsonapi-angular

[![npm version](https://img.shields.io/npm/v/@vmelou/jsonapi-angular)](https://www.npmjs.com/package/@vmelou/jsonapi-angular)
[![License: MIT](https://img.shields.io/npm/l/@vmelou/jsonapi-angular)](https://opensource.org/licenses/MIT)

Angular integration for [@vmelou/jsonapi](../core/README.md) library. Provides mixins for easy integration with Angular's HttpClient and RxJS for JSON:API endpoints.

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Usage](#usage)
  - [Basic Setup](#basic-setup)
  - [Using Mixins](#using-mixins)
  - [Handling Relationships](#handling-relationships)
  - [Error Handling](#error-handling)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

## Installation

```bash
npm install @vmelou/jsonapi @vmelou/jsonapi-angular
# or
yarn add @vmelou/jsonapi @vmelou/jsonapi-angular
```

## Features

- Complete integration with Angular's HttpClient
- RxJS Observables for all API operations
- Support for CRUD operations (Create, Read, Update, Delete)
- List operations with pagination and filtering
- Error handling with JSON:API error objects
- TypeScript type safety

## Usage

### Basic Setup

First, define your models using the core library's decorators:

```typescript
import { BaseResource, JsonResource, JsonAttribute } from '@vmelou/jsonapi';

@JsonResource('authors')
export class Author extends BaseResource {
  @JsonAttribute()
  name = '';

  @JsonAttribute(Date, 'created-at')
  createdAt: Date = new Date();
}
```

### Using Mixins

Create a service that uses the provided mixins through composition:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateMixin, RetrieveMixin, UpdateMixin, DeleteMixin, ListMixin } from '@vmelou/jsonapi-angular';
import { Observable } from 'rxjs';
import { Author } from './author.model';

@Injectable({ providedIn: 'root' })
export class AuthorService {
  private createMixin: CreateMixin<Author>;
  private retrieveMixin: RetrieveMixin<Author>;
  private updateMixin: UpdateMixin<Author>;
  private deleteMixin: DeleteMixin<Author>;
  private listMixin: ListMixin<Author>;
  private endpoint = 'authors';

  constructor(http: HttpClient) {
    this.createMixin = new CreateMixin<Author>(http, this.endpoint, Author);
    this.retrieveMixin = new RetrieveMixin<Author>(http, this.endpoint, Author);
    this.updateMixin = new UpdateMixin<Author>(http, this.endpoint, Author);
    this.deleteMixin = new DeleteMixin<Author>(http, this.endpoint, Author);
    this.listMixin = new ListMixin<Author>(http, this.endpoint, Author);
  }

  list(query?: { [key: string]: string }): Observable<Results<Author>> {
    return this.listMixin.list(query);
  }

  create(data: Partial<Author>): Observable<Author> {
    return this.createMixin.create(data);
  }

  retrieve(id: string, include: string[] = []): Observable<Author> {
    return this.retrieveMixin.retrieve(id, include);
  }

  update(id: string, data: Partial<Author>): Observable<Author> {
    return this.updateMixin.update(id, data);
  }

  delete(id: string): Observable<void> {
    return this.deleteMixin.delete(id);
  }

  // Custom endpoint example
  retrieveProfile(id: string): Observable<Author> {
    return this.retrieveMixin.retrieve(`${id}/profile`);
  }
}
```

Now you can use the service in your components:

```typescript
@Component({
  selector: 'app-authors',
  template: `
    <div *ngFor="let author of authors$ | async">
      {{ author.name }}
    </div>
  `,
})
export class AuthorsComponent {
  authors$ = this.authorService.list();

  constructor(private authorService: AuthorService) {}
}
```

### Handling Relationships

The mixins automatically handle relationships defined in your models:

```typescript
@JsonResource('books')
export class Book extends BaseResource {
  @JsonAttribute()
  title = '';

  @JsonAttribute(Author)
  author?: Author;

  @JsonAttribute(Author, 'co-authors')
  coAuthors: Author[] = [];
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private retrieveMixin: RetrieveMixin<Book>;
  private endpoint = 'books';

  constructor(http: HttpClient) {
    this.retrieveMixin = new RetrieveMixin<Book>(http, this.endpoint, Book);
  }

  getBookWithAuthor(id: string): Observable<Book> {
    return this.retrieveMixin.retrieve(id, ['author', 'co-authors']);
  }

  // Custom endpoint example
  getBookReviews(id: string): Observable<Book> {
    return this.retrieveMixin.retrieve(`${id}/reviews`);
  }
}
```

### Error Handling

All mixins include built-in error handling that converts JSON:API error responses to ApiError objects:

```typescript
this.bookService.create(newBook).subscribe({
  next: (book) => console.log('Book created:', book),
  error: (errors: ApiError[]) => {
    errors.forEach((error) => {
      console.error(`Error: ${error.title} - ${error.detail}`);
    });
  },
});
```

## API Reference

### Mixins

- `ListMixin<T>`: List resources with pagination and filtering

  - `list(query?: { [key: string]: string }, url?: string): Observable<Results<T>>`

- `CreateMixin<T>`: Create new resources

  - `create(data: Partial<T>): Observable<T>`

- `RetrieveMixin<T>`: Retrieve single resources

  - `retrieve(id: string, include: string[] = []): Observable<T>`

- `UpdateMixin<T>`: Update existing resources

  - `update(id: string, data: Partial<T>): Observable<T>`

- `DeleteMixin<T>`: Delete resources
  - `delete(id: string): Observable<void>`

### Query Parameters

The `list` method supports various query parameters:

```typescript
// Pagination
service.list({ 'page[number]': '1', 'page[size]': '10' });

// Filtering
service.list({ 'filter[name]': 'John' });

// Including relationships
service.list({ include: 'author,co-authors' });

// Sorting
service.list({ sort: '-created-at,name' });
```

## Examples

### Complete CRUD Example

```typescript
@Component({
  template: `
    <div *ngFor="let book of books$ | async">
      <h2>{{ book.title }}</h2>
      <p>Author: {{ book.author?.name }}</p>
      <button (click)="updateBook(book)">Edit</button>
      <button (click)="deleteBook(book)">Delete</button>
    </div>
  `,
})
export class BooksComponent {
  books$ = this.bookService.list();

  constructor(private bookService: BookService) {}

  createBook(bookData: Partial<Book>) {
    this.bookService.create(bookData).subscribe({
      next: (book) => console.log('Book created:', book),
      error: (errors) => console.error('Failed to create book:', errors),
    });
  }

  updateBook(book: Book) {
    this.bookService.update(book.id, { title: 'Updated Title' }).subscribe({
      next: (updated) => console.log('Book updated:', updated),
      error: (errors) => console.error('Failed to update book:', errors),
    });
  }

  deleteBook(book: Book) {
    this.bookService.delete(book.id).subscribe({
      next: () => console.log('Book deleted'),
      error: (errors) => console.error('Failed to delete book:', errors),
    });
  }
}
```

### Handling Pagination Results

```typescript
interface PaginationMeta {
  pagination: {
    count: number;
    page: number;
    pages: number;
  };
}

@Component({
  template: `
    <div *ngIf="results$ | async as results">
      <div *ngFor="let item of results.data">
        {{ item.title }}
      </div>

      <div class="pagination">
        <button [disabled]="!results.links?.prev" (click)="loadPage(results.links?.prev)">Previous</button>
        <span>Page {{ results.meta?.pagination?.page }} of {{ results.meta?.pagination?.pages }}</span>
        <button [disabled]="!results.links?.next" (click)="loadPage(results.links?.next)">Next</button>
      </div>
    </div>
  `,
})
export class PaginatedListComponent {
  results$: Observable<Results<Book>>;

  constructor(private bookService: BookService) {
    this.results$ = this.bookService.list({ 'page[size]': '10' });
  }

  loadPage(url: string | null) {
    if (url) {
      this.results$ = this.bookService.list({}, url);
    }
  }
}
```

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](../../../CONTRIBUTING.md) for more details on how to get involved.

## Changelog

Detailed changes for each release are documented in the [CHANGELOG.md](../../../CHANGELOG.md) file.

## License

MIT
