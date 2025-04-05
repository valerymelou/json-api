import { HttpClient, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BaseResource, JsonAttribute } from '@vmelou/jsonapi';

import { DeleteMixin } from './delete.mixin';

class Person extends BaseResource {
  @JsonAttribute()
  name!: string;
}

describe('DeleteMixin', () => {
  let httpMock: HttpTestingController;
  let deleteMixin: DeleteMixin<Person>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    httpMock = TestBed.inject(HttpTestingController);
    deleteMixin = new DeleteMixin<Person>(
      TestBed.inject(HttpClient),
      'persons',
      Person
    );
  });

  afterEach(() => httpMock.verify());

  it('should send request to delete the resource', (done) => {
    deleteMixin.delete('1').subscribe({
      next: () => {
        done();
      },
    });

    const req = httpMock.expectOne('persons/1/');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
