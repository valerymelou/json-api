import { HttpClient, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BaseResource, JsonAttribute, Results } from '@vmelou/jsonapi';

import { ListMixin } from './list.mixin';

class Contact extends BaseResource {
  @JsonAttribute() email!: string;
  @JsonAttribute() phone!: string;
}

class Person extends BaseResource {
  @JsonAttribute() firstName!: string;
  @JsonAttribute() lastName!: string;
  @JsonAttribute(Contact) contact?: Contact;
  @JsonAttribute(Contact, 'emergency_contacts') emergencyContacts?: Contact[];
}

describe('ListMixin', () => {
  let httpMock: HttpTestingController;
  let listMixin: ListMixin<Person>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    httpMock = TestBed.inject(HttpTestingController);
    listMixin = new ListMixin<Person>(
      TestBed.inject(HttpClient),
      'persons',
      Person
    );
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should send a GET request to the specified endpoint with query parameters', (done) => {
    const query = { param1: 'value1', param2: 'value2' };
    const expectedUrl = 'persons/?param1=value1&param2=value2';

    listMixin.list(query).subscribe({
      next: (results: Results<Person>) => {
        expect(results).toBeDefined();
        expect(results.data.length).toBe(1);
        expect(results.data[0].id).toBe('1');
        expect(results.data[0].firstName).toBe('John');
        expect(results.data[0].lastName).toBe('Doe');
        expect(results.data[0].contact).toBeDefined();
        expect(results.data[0].contact?.id).toBe('1');
        expect(results.data[0].contact?.email).toBe('test@lysties.com');
        expect(results.data[0].contact?.phone).toBe('+2371234567890');
        expect(results.data[0].emergencyContacts).toBeDefined();
        expect(results.data[0].emergencyContacts?.length).toBe(2);
        expect(results.data[0].emergencyContacts?.[0].id).toBe('2');
        expect(results.data[0].emergencyContacts?.[1].id).toBe('3');
        expect(results.data[0].emergencyContacts?.[0].email).toBe(
          'emergency1@lysties.com'
        );
        expect(results.data[0].emergencyContacts?.[1].email).toBe(
          'emergency2@lysties.com'
        );
        expect(results.data[0].emergencyContacts?.[0].phone).toBe(
          '+2371234567891'
        );
        expect(results.data[0].emergencyContacts?.[1].phone).toBe(
          '+2371234567892'
        );
        expect(results.meta.pagination.page).toBe(1);
        expect(results.meta.pagination.pages).toBe(1);
        expect(results.meta.pagination.count).toBe(1);
        expect(results.links.first).toBeNull();
        expect(results.links.last).toBeNull();
        expect(results.links.next).toBeNull();
        expect(results.links.prev).toBeNull();

        done();
      },
    });

    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('GET');
    // Add more assertions based on the expected request
    req.flush({
      data: [
        {
          id: '1',
          type: 'Person',
          attributes: {
            firstName: 'John',
            lastName: 'Doe',
          },
          relationships: {
            contact: {
              data: {
                id: '1',
                type: 'Contact',
              },
            },
            emergency_contacts: {
              data: [
                {
                  id: '2',
                  type: 'Contact',
                },
                {
                  id: '3',
                  type: 'Contact',
                },
              ],
            },
          },
        },
      ],
      included: [
        {
          id: '1',
          type: 'Contact',
          attributes: {
            email: 'test@lysties.com',
            phone: '+2371234567890',
          },
        },
        {
          id: '2',
          type: 'Contact',
          attributes: {
            email: 'emergency1@lysties.com',
            phone: '+2371234567891',
          },
        },
        {
          id: '3',
          type: 'Contact',
          attributes: {
            email: 'emergency2@lysties.com',
            phone: '+2371234567892',
          },
        },
      ],
      links: {
        first: null,
        last: null,
        next: null,
        prev: null,
      },
      meta: {
        pagination: {
          count: 1,
          page: 1,
          pages: 1,
        },
      },
    });
  });

  it('should send a GET request to the specified endpoint without query parameters', () => {
    listMixin.list().subscribe((results: Results<BaseResource>) => {
      expect(results).toBeDefined();
      // Add more assertions based on the expected response
    });

    const req = httpMock.expectOne('persons/');
    expect(req.request.method).toBe('GET');
    // Add more assertions based on the expected request
    req.flush({
      /* Add the expected response here */
    });
  });

  // Add more test cases for other methods and scenarios
});
