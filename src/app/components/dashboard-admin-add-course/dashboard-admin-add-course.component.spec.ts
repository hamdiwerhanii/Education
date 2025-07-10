import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAdminAddCourseComponent } from './dashboard-admin-add-course.component';

describe('DashboardAdminAddCourseComponent', () => {
  let component: DashboardAdminAddCourseComponent;
  let fixture: ComponentFixture<DashboardAdminAddCourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardAdminAddCourseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardAdminAddCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
