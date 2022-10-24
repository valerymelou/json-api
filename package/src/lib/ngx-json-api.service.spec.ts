import { TestBed } from '@angular/core/testing';

import { NgxJsonApiService } from './ngx-json-api.service';

describe('NgxJsonApiService', () => {
  let service: NgxJsonApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxJsonApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
