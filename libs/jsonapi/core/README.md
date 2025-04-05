# @vmelou/jsonapi

[![npm version](https://img.shields.io/npm/v/@vmelou/jsonapi)](https://www.npmjs.com/package/@vmelou/jsonapi)
[![License: MIT](https://img.shields.io/npm/l/@vmelou/jsonapi)](https://opensource.org/licenses/MIT)

A TypeScript library for serializing and deserializing classes to/from [JSON:API](https://jsonapi.org/) format.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Define Your Models](#define-your-models)
  - [Serialization](#serialization)
  - [Deserialization](#deserialization)
- [Advanced Usage](#advanced-usage)
  - [Custom Attribute Transformation](#custom-attribute-transformation)
  - [Handling Relationships](#handling-relationships)
  - [Accessing Links and Meta](#accessing-links-and-meta)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

## Features

- Serialize TypeScript classes to JSON:API compliant objects
- Deserialize JSON:API responses into TypeScript class instances
- Support for relationships and included resources
- Handles primitive types and Date objects
- Support for collection responses with pagination
- Error handling with JSON:API error objects

## Installation

```bash
npm install @vmelou/jsonapi
# or
yarn add @vmelou/jsonapi
```

## Usage

### Define Your Models

Use decorators to define how your classes map to JSON:API resources:

```typescript
import { BaseResource, JsonResource, JsonAttribute } from '@vmelou/jsonapi';

@JsonResource('authors')
class Author extends BaseResource {
  @JsonAttribute()
  name = '';

  @JsonAttribute(Date, 'created-at')
  createdAt: Date = new Date();
}

@JsonResource('books')
class Book extends BaseResource {
  @JsonAttribute()
  title = '';

  @JsonAttribute()
  isbn = '';

  @JsonAttribute(Author)
  author: Author = new Author();

  @JsonAttribute(Author, 'co-authors')
  coAuthors: Author[] = [];
}
```

### Serialization

```typescript
import { serialize } from '@vmelou/jsonapi';

const author = new Author({
  id: '1',
  name: 'John Doe',
  createdAt: new Date('2025-01-01'),
});

const book = new Book({
  id: '1',
  title: 'My Book',
  isbn: '123-456-789',
  author,
});

const serialized = serialize(Book, book);
// Result:
// {
//   data: {
//     id: '1',
//     type: 'books',
//     attributes: {
//       title: 'My Book',
//       isbn: '123-456-789'
//     },
//     relationships: {
//       author: {
//         data: { id: '1', type: 'authors' }
//       }
//     }
//   }
// }
```

### Deserialization

```typescript
import { deserialize, deserializeCollection } from '@vmelou/jsonapi';

// Deserialize single resource
const json = {
  data: {
    id: '1',
    type: 'books',
    attributes: {
      title: 'My Book',
      isbn: '123-456-789'
    },
    relationships: {
      author: {
        data: { id: '1', type: 'authors' }
      }
    }
  },
  included: [
    {
      id: '1',
      type: 'authors',
      attributes: {
        name: 'John Doe',
        'created-at': '2025-01-01'
      }
    }
  ]
};

const book = deserialize(Book, json.data, json.included);

// Deserialize collection
const collection = deserializeCollection(Book, {
  data: [...],
  included: [...],
  links: {
    first: '...',
    last: '...',
    next: '...',
    prev: '...'
  },
  meta: {
    pagination: {
      count: 42,
      page: 1,
      pages: 5
    }
  }
});
```

## Advanced Usage

Here are some examples for more complex scenarios:

### Custom Attribute Transformation

You can provide a transformation function to the `@JsonAttribute` decorator to modify how values are serialized and deserialized. The transform function is applied in both directions (serialization and deserialization).

```typescript
import { BaseResource, JsonResource, JsonAttribute, serialize, deserialize } from '@vmelou/jsonapi';

@JsonResource('products')
class Product extends BaseResource {
  // Always store and retrieve the name in uppercase
  @JsonAttribute(String, 'product-name', (value) => {
    if (typeof value === 'string') {
      return value.toUpperCase();
    }
    return value;
  })
  name = '';

  // Store and display price in cents
  @JsonAttribute(Number, 'price', (value) => {
    if (typeof value === 'number') {
      return Math.round(value);
    }
    return value;
  })
  priceInCents = 0;
}

// Example Usage
const product = new Product({ id: '1', name: 'widget', priceInCents: 1999 });
const serialized = serialize(Product, product);
/* serialized.data.attributes will be:
{
  "product-name": "WIDGET",
  "price": 1999
}
*/

const jsonData = {
    id: '1',
    type: 'products',
    attributes: {
        'product-name': 'gadget',
        'price': 5000
    }
};
const deserializedProduct = deserialize(Product, jsonData, []);
/* deserializedProduct will have:
{
  id: '1',
  name: 'GADGET',
  priceInCents: 5000
}
```

The transform function receives the value being processed and should return the transformed value. The same transform is used for both serialization and deserialization, so make sure your transformation logic works in both directions.

### Handling Relationships

Define relationships using `@JsonAttribute` with the related class type. The library automatically handles linking resources during serialization and populating related objects during deserialization using the `included` array.

```typescript
import { BaseResource, JsonResource, JsonAttribute, deserialize } from '@vmelou/jsonapi';

@JsonResource('stores')
class Store extends BaseResource {
  @JsonAttribute()
  storeName = '';
}

@JsonResource('employees')
class Employee extends BaseResource {
  @JsonAttribute()
  firstName = '';

  @JsonAttribute(Store) // To-one relationship
  store: Store | null = null;
}

@JsonResource('departments')
class Department extends BaseResource {
  @JsonAttribute()
  deptName = '';

  @JsonAttribute(Employee, 'staff') // To-many relationship
  employees: Employee[] = [];
}

// Example Deserialization with included data
const departmentJson = {
  id: 'D1',
  type: 'departments',
  attributes: { deptName: 'Sales' },
  relationships: {
    staff: {
      data: [
        { id: 'E1', type: 'employees' },
        { id: 'E2', type: 'employees' },
      ],
    },
  },
};

const includedData = [
  { id: 'E1', type: 'employees', attributes: { firstName: 'Alice' }, relationships: { store: { data: { id: 'S1', type: 'stores' } } } },
  { id: 'E2', type: 'employees', attributes: { firstName: 'Bob' }, relationships: { store: { data: { id: 'S1', type: 'stores' } } } },
  { id: 'S1', type: 'stores', attributes: { storeName: 'Main Street Branch' } },
];

const department = deserialize(Department, departmentJson, includedData);

// department.employees will be an array of Employee instances
// department.employees[0].store will be a Store instance
console.log(department.employees[0].firstName); // Output: Alice
console.log(department.employees[0].store?.storeName); // Output: Main Street Branch
```

### Accessing Links and Meta

When deserializing a collection using `deserializeCollection`, the returned `Results` object provides access to the `links` and `meta` objects from the JSON:API response.

```typescript
import { deserializeCollection, Results, Book } from '@vmelou/jsonapi'; // Assuming Book model exists

const jsonResponse = {
  data: [
    // ... book resource objects ...
  ],
  included: [
    // ... included author resource objects ...
  ],
  meta: {
    pagination: { total: 100, pages: 10, currentPage: 2 },
  },
  links: {
    self: '/books?page=2',
    first: '/books?page=1',
    prev: '/books?page=1',
    next: '/books?page=3',
    last: '/books?page=10',
  },
};

const results: Results<Book> = deserializeCollection(Book, jsonResponse);

// Access deserialized data
const books: Book[] = results.data;

// Access pagination metadata
const totalBooks = results.meta?.pagination?.total; // 100
const currentPage = results.meta?.pagination?.currentPage; // 2

// Access links
const nextPageLink = results.links?.next; // '/books?page=3'

console.log(`Displaying page ${currentPage} of ${results.meta?.pagination?.pages}. Total items: ${totalBooks}`);
if (nextPageLink) {
  console.log(`Next page: ${nextPageLink}`);
}
```

## API Reference

### Decorators

- `@JsonResource(type: string)`: Defines the JSON:API resource type for a class
- `@JsonAttribute(type?: any, attribute?: string, transform?: Function | { serialize: Function, deserialize: Function })`: Maps class properties to JSON:API attributes, optionally providing transformation logic.

### Functions

- `serialize<T extends BaseResource>(cls: Constructor<T>, data: T | T[], relationship?: boolean): { data: JsonResource | JsonResource[] }`
- `deserialize<T extends BaseResource>(cls: Constructor<T>, data: JsonResource, included?: JsonResource[]): T`
- `deserializeCollection<T extends BaseResource>(cls: Constructor<T>, response: JsonListResponse): Results<T>`

### Classes

- `BaseResource`: Base class for all JSON:API resources.
- `Results<T>`: Container for collection responses, including data, links, and meta.

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](../../../CONTRIBUTING.md) for more details on how to get involved.

## Changelog

Detailed changes for each release are documented in the [CHANGELOG.md](../../../CHANGELOG.md) file.

## License

MIT
