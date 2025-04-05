import { HttpClient, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BaseResource, JsonAttribute } from '@vmelou/jsonapi';

import { UpdateMixin } from './update.mixin';

class Person extends BaseResource {
  @JsonAttribute() firstName!: string;
  @JsonAttribute() lastName!: string;
  @JsonAttribute(Date) birthdate!: Date;
}

describe('UpdateMixin', () => {
  let httpTestingController: HttpTestingController;
  let updateMixin: UpdateMixin<Person>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    updateMixin = new UpdateMixin<Person>(
      TestBed.inject(HttpClient),
      'persons',
      Person
    );
  });

  it('should send a PATCH request to the specified endpoint with the specified id and data', (done) => {
    // * This is 2010-11-01 in Javascript Date format.
    const date = new Date(2010, 10, 1, 0, 0, 0);
    updateMixin
      .update('1', { firstName: 'Jane', lastName: 'Doe', birthdate: date })
      .subscribe({
        next: (person: Person) => {
          expect(person).toBeDefined();
          expect(person.id).toBe('1');
          expect(person.firstName).toBe('Jane');
          expect(person.lastName).toBe('Doe');
          expect(person.birthdate.getFullYear()).toBe(2010);
          expect(person.birthdate.getMonth()).toBe(10);
          expect(person.birthdate.getDate()).toBe(1);

          done();
        },
      });

    const request = httpTestingController.expectOne('persons/1/');
    expect(request.request.method).toBe('PATCH');
    request.flush({
      data: {
        id: '1',
        type: 'Person',
        attributes: {
          firstName: 'Jane',
          lastName: 'Doe',
          birthdate: '2010-11-01',
        },
      },
    });
    httpTestingController.verify();
  });
});
