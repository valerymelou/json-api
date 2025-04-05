import { HttpClient, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BaseResource, JsonAttribute } from '@vmelou/jsonapi';

import { CreateMixin } from './create.mixin';

class Contact extends BaseResource {
  @JsonAttribute() email!: string;
  @JsonAttribute() phone!: string;
}

class Person extends BaseResource {
  @JsonAttribute() firstName!: string;
  @JsonAttribute() lastName!: string;
  @JsonAttribute(Contact) contact?: Contact;
  @JsonAttribute(Date) createdAt?: Date;
  @JsonAttribute(Contact, 'emergency_contacts') emergencyContacts?: Contact[];
}

describe('CreateMixin', () => {
  let httpMock: HttpTestingController;
  let createMixin: CreateMixin<Person>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    httpMock = TestBed.inject(HttpTestingController);
    createMixin = new CreateMixin<Person>(
      TestBed.inject(HttpClient),
      'persons',
      Person
    );
  });

  afterEach(() => httpMock.verify());

  // TODO: make this test more efficient
  it('should send a POST request to create a person', (done) => {
    const data = {
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date('2023-01-01'),
      contact: {
        email: 'test@lysties.com',
        phone: '+2371234567890',
      },
      emergency_contacts: [
        {
          email: 'test2@lysties.com',
          phone: '+2371234567891',
        },
      ],
    };

    createMixin.create(data).subscribe((person: Person) => {
      expect(person).toBeInstanceOf(Person);
      done();
    });

    const req = httpMock.expectOne('persons/');
    expect(req.request.method).toBe('POST');
    req.flush({
      data: {
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
        },
      },
      included: [
        {
          id: '1',
          type: 'Contact',
          attributes: {
            email: 'test@lysties.com',
            phone: '+2371234567890',
            created_at: '2023-01-01',
          },
        },
      ],
    });
  });
});
