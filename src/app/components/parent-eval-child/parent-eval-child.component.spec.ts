import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentEvalChildComponent } from './parent-eval-child.component';

describe('ParentEvalChildComponent', () => {
  let component: ParentEvalChildComponent;
  let fixture: ComponentFixture<ParentEvalChildComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParentEvalChildComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentEvalChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
