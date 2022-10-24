import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxJsonApiComponent } from './ngx-json-api.component';

describe('NgxJsonApiComponent', () => {
  let component: NgxJsonApiComponent;
  let fixture: ComponentFixture<NgxJsonApiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxJsonApiComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxJsonApiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
