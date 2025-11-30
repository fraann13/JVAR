import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PalletView } from './pallet-view';

describe('PalletView', () => {
  let component: PalletView;
  let fixture: ComponentFixture<PalletView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PalletView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PalletView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
