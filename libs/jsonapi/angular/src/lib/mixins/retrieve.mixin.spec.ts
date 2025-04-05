import { HttpClient, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BaseResource, JsonAttribute } from '@vmelou/jsonapi';

import { RetrieveMixin } from './retrieve.mixin';

class Contact extends BaseResource {
  @JsonAttribute() email!: string;
  @JsonAttribute() phone!: string;
  @JsonAttribute(Date, 'created_at') createdAt!: Date;
}

class Person extends BaseResource {
  @JsonAttribute() firstName!: string;
  @JsonAttribute() lastName!: string;
  @JsonAttribute(Contact) contact?: Contact;
  @JsonAttribute(Contact, 'emergency_contacts') emergencyContacts?: Contact[];
}

describe('RetrieveMixin', () => {
  let httpTestingController: HttpTestingController;
  let retrieveMixin: RetrieveMixin<Person>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    retrieveMixin = new RetrieveMixin<Person>(
      TestBed.inject(HttpClient),
      'persons',
      Person
    );
  });

  it('should send a GET request to the specified endpoint with the specified id', (done) => {
    retrieveMixin.retrieve('1').subscribe({
      next: (person: Person) => {
        expect(person).toBeDefined();
        expect(person.id).toBe('1');
        expect(person.firstName).toBe('John');
        expect(person.lastName).toBe('Doe');
        expect(person.contact).toBeDefined();
        expect(person.contact?.id).toBe('1');
        expect(person.contact?.email).toBe('test@lysties.com');
        expect(person.contact?.phone).toBe('+2371234567890');
        expect(person.contact?.createdAt).toBeInstanceOf(Date);
        expect(person.emergencyContacts).toBeDefined();
        expect(person.emergencyContacts?.length).toBe(2);
        expect(person.emergencyContacts?.[0].id).toBe('2');
        expect(person.emergencyContacts?.[0].email).toBe(
          'emergency1@lysties.com'
        );
        expect(person.emergencyContacts?.[0].phone).toBe('+2371234567891');
        expect(person.emergencyContacts?.[1].id).toBe('3');
        expect(person.emergencyContacts?.[1].email).toBe(
          'emergency2@lysties.com'
        );
        expect(person.emergencyContacts?.[1].phone).toBe('+2371234567892');

        done();
      },
    });

    const request = httpTestingController.expectOne('persons/1/');
    expect(request.request.method).toBe('GET');
    request.flush({
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
        {
          id: '2',
          type: 'Contact',
          attributes: {
            email: 'emergency1@lysties.com',
            phone: '+2371234567891',
            created_at: '2023-01-01',
          },
        },
        {
          id: '3',
          type: 'Contact',
          attributes: {
            email: 'emergency2@lysties.com',
            phone: '+2371234567892',
            created_at: '2023-01-01',
          },
        },
      ],
    });
    httpTestingController.verify();
  });
});
