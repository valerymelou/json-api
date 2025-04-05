import { BaseResource } from '../lib/resources/base-resource';
import { JsonResource } from '../lib/decorators/json-resource';
import { JsonAttribute } from '../lib/decorators/json-attribute';
import { deserialize, serialize, deserializeCollection } from '../lib/api/api';
import { Results } from '../lib/resources/results';
import { Links } from '../lib/resources/links';
import { Meta, Pagination } from '../lib/resources/meta';

// Sample models for testing
@JsonResource('authors')
class Author extends BaseResource {
  @JsonAttribute()
  name = '';

  @JsonAttribute(Date, 'created-at')
  createdAt: Date = new Date();

  constructor(init?: Partial<Author>) {
    super(init);
    Object.assign(this, init);
  }
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

  constructor(init?: Partial<Book>) {
    super(init);
    Object.assign(this, init);
  }
}

describe('JSON:API Serialization', () => {
  describe('Simple resource serialization', () => {
    it('should serialize a simple resource with primitive attributes', () => {
      const author = new Author({
        id: '1',
        name: 'John Doe',
        createdAt: new Date('2025-01-01'),
      });

      const result = serialize(Author, author);

      expect(result).toEqual({
        data: {
          id: '1',
          type: 'authors',
          attributes: {
            name: 'John Doe',
            'created-at': '2025-1-1',
          },
        },
      });
    });

    it('should deserialize a simple resource with primitive attributes', () => {
      const json = {
        id: '1',
        type: 'authors',
        attributes: {
          name: 'John Doe',
          'created-at': '2025-01-01',
        },
      };

      const result = deserialize(Author, json, []);

      expect(result).toBeInstanceOf(Author);
      expect(result.id).toBe('1');
      expect(result.name).toBe('John Doe');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.getFullYear()).toBe(2025);
    });
  });

  describe('Complex resource serialization', () => {
    it('should serialize a resource with relationships', () => {
      const author = new Author({
        id: '1',
        name: 'John Doe',
        createdAt: new Date('2025-01-01'),
      });

      const coAuthor = new Author({
        id: '2',
        name: 'Jane Smith',
        createdAt: new Date('2025-01-02'),
      });

      const book = new Book({
        id: '1',
        title: 'Test Book',
        isbn: '123-456-789',
        author,
        coAuthors: [coAuthor],
      });

      const result = serialize(Book, book);

      expect(result).toEqual({
        data: {
          id: '1',
          type: 'books',
          attributes: {
            title: 'Test Book',
            isbn: '123-456-789',
          },
          relationships: {
            author: {
              data: {
                id: '1',
                type: 'authors',
              },
            },
            'co-authors': {
              data: [
                {
                  id: '2',
                  type: 'authors',
                },
              ],
            },
          },
        },
      });
    });

    it('should deserialize a resource with relationships', () => {
      const json = {
        id: '1',
        type: 'books',
        attributes: {
          title: 'Test Book',
          isbn: '123-456-789',
        },
        relationships: {
          author: {
            data: {
              id: '1',
              type: 'authors',
            },
          },
          'co-authors': {
            data: [
              {
                id: '2',
                type: 'authors',
              },
            ],
          },
        },
      };

      const related = [
        {
          id: '1',
          type: 'authors',
          attributes: {
            name: 'John Doe',
            'created-at': '2025-01-01',
          },
        },
        {
          id: '2',
          type: 'authors',
          attributes: {
            name: 'Jane Smith',
            'created-at': '2025-01-02',
          },
        },
      ];

      const result = deserialize(Book, json, related);

      expect(result).toBeInstanceOf(Book);
      expect(result.id).toBe('1');
      expect(result.title).toBe('Test Book');
      expect(result.isbn).toBe('123-456-789');

      expect(result.author).toBeInstanceOf(Author);
      expect(result.author.id).toBe('1');
      expect(result.author.name).toBe('John Doe');

      expect(result.coAuthors).toHaveLength(1);
      expect(result.coAuthors[0]).toBeInstanceOf(Author);
      expect(result.coAuthors[0].id).toBe('2');
      expect(result.coAuthors[0].name).toBe('Jane Smith');
    });
  });

  describe('Collection resource deserialization', () => {
    it('should deserialize a collection of resources with included relationships', () => {
      const json = {
        data: [
          {
            id: '1',
            type: 'books',
            attributes: {
              title: 'First Book',
              isbn: '123-456-789',
            },
            relationships: {
              author: {
                data: {
                  id: '1',
                  type: 'authors',
                },
              },
              'co-authors': {
                data: [
                  {
                    id: '2',
                    type: 'authors',
                  },
                  {
                    id: '3',
                    type: 'authors',
                  },
                ],
              },
            },
          },
          {
            id: '2',
            type: 'books',
            attributes: {
              title: 'Second Book',
              isbn: '987-654-321',
            },
            relationships: {
              author: {
                data: {
                  id: '2',
                  type: 'authors',
                },
              },
              'co-authors': {
                data: [
                  {
                    id: '1',
                    type: 'authors',
                  },
                  {
                    id: '3',
                    type: 'authors',
                  },
                ],
              },
            },
          },
        ],
        included: [
          {
            id: '1',
            type: 'authors',
            attributes: {
              name: 'John Doe',
              'created-at': '2025-01-01',
            },
          },
          {
            id: '2',
            type: 'authors',
            attributes: {
              name: 'Jane Smith',
              'created-at': '2025-01-02',
            },
          },
          {
            id: '3',
            type: 'authors',
            attributes: {
              name: 'Alice Johnson',
              'created-at': '2025-01-03',
            },
          },
        ],
      };

      const books = json.data.map((bookData) =>
        deserialize(Book, bookData, json.included)
      );

      // Verify first book
      expect(books[0]).toBeInstanceOf(Book);
      expect(books[0].id).toBe('1');
      expect(books[0].title).toBe('First Book');
      expect(books[0].isbn).toBe('123-456-789');

      expect(books[0].author).toBeInstanceOf(Author);
      expect(books[0].author.id).toBe('1');
      expect(books[0].author.name).toBe('John Doe');

      expect(books[0].coAuthors).toHaveLength(2);
      expect(books[0].coAuthors[0]).toBeInstanceOf(Author);
      expect(books[0].coAuthors[0].id).toBe('2');
      expect(books[0].coAuthors[0].name).toBe('Jane Smith');
      expect(books[0].coAuthors[1].id).toBe('3');
      expect(books[0].coAuthors[1].name).toBe('Alice Johnson');

      // Verify second book
      expect(books[1]).toBeInstanceOf(Book);
      expect(books[1].id).toBe('2');
      expect(books[1].title).toBe('Second Book');
      expect(books[1].isbn).toBe('987-654-321');

      expect(books[1].author).toBeInstanceOf(Author);
      expect(books[1].author.id).toBe('2');
      expect(books[1].author.name).toBe('Jane Smith');

      expect(books[1].coAuthors).toHaveLength(2);
      expect(books[1].coAuthors[0]).toBeInstanceOf(Author);
      expect(books[1].coAuthors[0].id).toBe('1');
      expect(books[1].coAuthors[0].name).toBe('John Doe');
      expect(books[1].coAuthors[1].id).toBe('3');
      expect(books[1].coAuthors[1].name).toBe('Alice Johnson');
    });
  });

  describe('Collection deserialization', () => {
    it('should deserialize a collection with included resources and pagination', () => {
      const json = {
        data: [
          {
            id: '1',
            type: 'books',
            attributes: {
              title: 'First Book',
              isbn: '123-456-789',
            },
            relationships: {
              author: {
                data: {
                  id: '1',
                  type: 'authors',
                },
              },
              'co-authors': {
                data: [
                  {
                    id: '2',
                    type: 'authors',
                  },
                ],
              },
            },
          },
          {
            id: '2',
            type: 'books',
            attributes: {
              title: 'Second Book',
              isbn: '987-654-321',
            },
            relationships: {
              author: {
                data: {
                  id: '2',
                  type: 'authors',
                },
              },
              'co-authors': {
                data: [
                  {
                    id: '1',
                    type: 'authors',
                  },
                ],
              },
            },
          },
        ],
        included: [
          {
            id: '1',
            type: 'authors',
            attributes: {
              name: 'John Doe',
              'created-at': '2025-01-01',
            },
          },
          {
            id: '2',
            type: 'authors',
            attributes: {
              name: 'Jane Smith',
              'created-at': '2025-01-02',
            },
          },
        ],
        links: {
          first: 'https://api.example.com/books?page=1',
          last: 'https://api.example.com/books?page=5',
          next: 'https://api.example.com/books?page=2',
          prev: null,
        },
        meta: {
          pagination: {
            count: 42,
            page: 1,
            pages: 5,
          },
        },
      };

      const results = deserializeCollection(Book, json);

      // Verify results structure
      expect(results).toBeInstanceOf(Results);
      expect(results.data).toHaveLength(2);
      expect(results.links).toBeInstanceOf(Links);
      expect(results.meta).toBeInstanceOf(Meta);
      expect(results.meta.pagination).toBeInstanceOf(Pagination);

      // Verify first book and its relationships
      const firstBook = results.data[0];
      expect(firstBook).toBeInstanceOf(Book);
      expect(firstBook.id).toBe('1');
      expect(firstBook.title).toBe('First Book');
      expect(firstBook.isbn).toBe('123-456-789');
      expect(firstBook.author).toBeInstanceOf(Author);
      expect(firstBook.author.id).toBe('1');
      expect(firstBook.author.name).toBe('John Doe');
      expect(firstBook.coAuthors).toHaveLength(1);
      expect(firstBook.coAuthors[0]).toBeInstanceOf(Author);
      expect(firstBook.coAuthors[0].id).toBe('2');
      expect(firstBook.coAuthors[0].name).toBe('Jane Smith');

      // Verify second book and its relationships
      const secondBook = results.data[1];
      expect(secondBook).toBeInstanceOf(Book);
      expect(secondBook.id).toBe('2');
      expect(secondBook.title).toBe('Second Book');
      expect(secondBook.isbn).toBe('987-654-321');
      expect(secondBook.author).toBeInstanceOf(Author);
      expect(secondBook.author.id).toBe('2');
      expect(secondBook.author.name).toBe('Jane Smith');
      expect(secondBook.coAuthors).toHaveLength(1);
      expect(secondBook.coAuthors[0]).toBeInstanceOf(Author);
      expect(secondBook.coAuthors[0].id).toBe('1');
      expect(secondBook.coAuthors[0].name).toBe('John Doe');

      // Verify pagination links
      expect(results.links.first).toBe('https://api.example.com/books?page=1');
      expect(results.links.last).toBe('https://api.example.com/books?page=5');
      expect(results.links.next).toBe('https://api.example.com/books?page=2');
      expect(results.links.prev).toBeNull();

      // Verify pagination meta
      expect(results.meta.pagination.count).toBe(42);
      expect(results.meta.pagination.page).toBe(1);
      expect(results.meta.pagination.pages).toBe(5);
    });

    it('should handle collection without included resources, links or meta', () => {
      const json = {
        data: [
          {
            id: '1',
            type: 'authors',
            attributes: {
              name: 'John Doe',
              'created-at': '2025-01-01',
            },
          },
          {
            id: '2',
            type: 'authors',
            attributes: {
              name: 'Jane Smith',
              'created-at': '2025-01-02',
            },
          },
        ],
      };

      const results = deserializeCollection(Author, json);

      expect(results).toBeInstanceOf(Results);
      expect(results.data).toHaveLength(2);

      // Verify first author
      expect(results.data[0]).toBeInstanceOf(Author);
      expect(results.data[0].id).toBe('1');
      expect(results.data[0].name).toBe('John Doe');
      expect(results.data[0].createdAt).toBeInstanceOf(Date);
      expect(results.data[0].createdAt.getFullYear()).toBe(2025);

      // Verify second author
      expect(results.data[1]).toBeInstanceOf(Author);
      expect(results.data[1].id).toBe('2');
      expect(results.data[1].name).toBe('Jane Smith');
      expect(results.data[1].createdAt).toBeInstanceOf(Date);
      expect(results.data[1].createdAt.getFullYear()).toBe(2025);

      // Verify default links and meta
      expect(results.links.first).toBeNull();
      expect(results.links.last).toBeNull();
      expect(results.links.next).toBeNull();
      expect(results.links.prev).toBeNull();
      expect(results.meta.pagination.count).toBe(0);
      expect(results.meta.pagination.page).toBe(1);
      expect(results.meta.pagination.pages).toBe(0);
    });
  });
});
