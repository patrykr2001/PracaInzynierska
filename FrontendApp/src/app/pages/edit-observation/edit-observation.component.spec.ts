import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditObservationComponent } from './edit-observation.component';

describe('EditObservationComponent', () => {
  let component: EditObservationComponent;
  let fixture: ComponentFixture<EditObservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditObservationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditObservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
