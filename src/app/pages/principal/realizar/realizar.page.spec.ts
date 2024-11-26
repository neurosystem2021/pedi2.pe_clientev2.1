import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RealizarPage } from './realizar.page';

describe('RealizarPage', () => {
  let component: RealizarPage;
  let fixture: ComponentFixture<RealizarPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RealizarPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RealizarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
