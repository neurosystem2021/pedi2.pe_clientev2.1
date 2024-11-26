import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UbicarPage } from './ubicar.page';

describe('UbicarPage', () => {
  let component: UbicarPage;
  let fixture: ComponentFixture<UbicarPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UbicarPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UbicarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
