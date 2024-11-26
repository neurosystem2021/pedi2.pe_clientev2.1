import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HablanosPage } from './hablanos.page';

describe('HablanosPage', () => {
  let component: HablanosPage;
  let fixture: ComponentFixture<HablanosPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HablanosPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HablanosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
