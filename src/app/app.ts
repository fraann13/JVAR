import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login';
import { PalletView } from './pallet-view/pallet-view';
import { Observable, map, take, switchMap, of, combineLatest } from 'rxjs';

// Services
import { AuthService } from './services/auth.service';
import { BultoService } from './services/bulto.service';
import { ContenedorService } from './services/contenedor.service';
import { PalletService } from './services/pallet.service';

// Models
import { Bulto } from './models/bulto.model';
import { Contenedor } from './models/contenedor.model';
import { Pallet } from './models/pallet.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoginComponent, FormsModule, PalletView],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('JVAR');

  isLoggedIn$: Observable<boolean>;
  userName: string = '';

  // Bultos
  bultos$: Observable<Bulto[]> | undefined;
  selectedBulto$: Observable<Bulto | undefined> | undefined;

  selectedBultoValue?: Bulto;
  selectedBultoId: string | null = null;

  // Contenedores
  contenedores$: Observable<Contenedor[]> | undefined;
  contenedoresFiltrados: Contenedor[] = [];

  selectedContenedor$: Observable<Contenedor | undefined> | undefined;
  selectedContenedorId: string | null = null;
  selectedType: number | null = null;

  // Pallets
  pallets$: Observable<Pallet[]> | undefined;
  selectedPallet$: Observable<Pallet | undefined> | undefined;

  selectedPalletValue?: Pallet;
  selectedPalletId: string | null = null;

  // Resultados
  bultoWeight: number = 0;
  cajasExportar: number = 0;
  factorEstiba: number = 0.0025;

  largeBulto: number | null = null;
  widthBulto: number | null = null;
  heightBulto: number | null = null;

  calculationResult: boolean = false;
  cajasLargo: number = 0;
  cajasAncho: number = 0;
  altoEstiba: number = 0;
  nivelAltura: number = 0;
  nivelAlturaReal: number = 0;
  alturaReal: number = 0;
  alturaMaxima: number = 0;

  cajasTarima: number = 0;
  noTarimas: number = 0;
  pesoBrutoCarga: number = 0;
  pesoBrutoTarimas: number = 0;
  pesoBrutoTotal: number = 0;

  alturaMaximaTarima: number = 0;
  tarimasCompletas: number = 0;
  cajasSobrantes: number = 0;
  tarimasExtras: number = 0;
  alturaTarimaExtra: number = 0;
  pesoVolumetrico: number = 0;

  tarimasContenedor: number = 0;

  palletDims: any;
  cajaDims: any;

  constructor(
    private authService: AuthService,
    private bultoService: BultoService,
    private contenedorService: ContenedorService,
    private palletService: PalletService,
    private cdr: ChangeDetectorRef
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;

    this.authService.userName.subscribe(name => {
      this.userName = name;
    });

    this.isLoggedIn$.subscribe(loggedIn => {
      if (loggedIn) {
        this.authService.getUserName();
        this.filterAndLoadContenedores();
        this.loadPallets();
        this.loadBultos();
      } else {
        this.contenedores$ = undefined;
        this.selectedContenedorId = null;
        this.selectedContenedor$ = undefined;

        this.pallets$ = undefined;
        this.selectedPalletId = null;
        this.selectedPallet$ = undefined;

        this.bultos$ = undefined;
        this.selectedBultoId = null;
        this.selectedBulto$ = undefined;
      }
    });
  }

  async ngOnInit() {
    if (await this.isUserLoggedIn()) {
      this.filterAndLoadContenedores();
      this.loadPallets();
      this.loadBultos();

      combineLatest([
        this.selectedPallet$ ?? of(undefined),
        this.selectedBulto$ ?? of(undefined)
      ]).subscribe(([pallet, bulto]) => {
        this.selectedPalletValue = pallet ?? undefined;
        this.selectedBultoValue = bulto ?? undefined;

        this.updateDims();
      });
    }
  }

  private isUserLoggedIn(): Promise<boolean> {
    return new Promise(resolve => {
      this.isLoggedIn$.subscribe(loggedIn => resolve(loggedIn)).unsubscribe();
    });
  }

  private filterAndLoadContenedores(): void {
    this.contenedores$ = this.contenedorService.getContenedores().pipe(
      map(contenedores => {
        if (this.selectedType === null) {
          return contenedores;
        }
        return contenedores.filter(c => c.type === this.selectedType);
      })
    );

    this.contenedores$.pipe(take(1)).subscribe(data => {
      this.contenedoresFiltrados = data;
    });
  }

  private loadPallets(): void {
    this.pallets$ = this.palletService.getPallets();
  }

  private loadBultos(): void {
    this.bultos$ = this.bultoService.getBultos();
  }

  // ============================
  // SELECTORES
  // ============================

  onTypeSelect(event: Event) {
    this.clearFields();

    const target = event.target as HTMLSelectElement;

    this.selectedType = target.value ? parseInt(target.value, 10) : null;
    this.selectedContenedorId = null;
    this.selectedContenedor$ = of(undefined);

    this.filterAndLoadContenedores();
  }

  onContenedorSelect(event: Event) {
    this.clearFields();

    const target = event.target as HTMLSelectElement;
    let selectedId = target.value;

    this.selectedContenedorId = selectedId;

    if (!selectedId || selectedId === "null") {
      this.selectedContenedor$ = of(undefined);
      return;
    }

    const cleanId = selectedId.replace(/^\d+:\s*/, '').trim();
    this.selectedContenedor$ = of(cleanId).pipe(
      switchMap(id => {
        return this.contenedorService.getContenedorById(id);
      })
    );
  }

  onPalletSelect(event: Event) {
    this.clearFields();

    const target = event.target as HTMLSelectElement;
    let selectedId = target.value;

    this.selectedPalletId = selectedId;

    if (!selectedId || selectedId === "null") {
      this.selectedPallet$ = of(undefined);
      return;
    }

    const cleanId = selectedId.replace(/^\d+:\s*/, '').trim();
    this.selectedPallet$ = of(cleanId).pipe(
      switchMap(id => {
        return this.palletService.getPalletById(id);
      })
    );
  }

  onBultoSelect(event: Event) {
    this.clearFields();

    const target = event.target as HTMLSelectElement;
    let selectedId = target.value;

    this.selectedBultoId = selectedId;

    if (!selectedId || selectedId === "null") {
      this.selectedBulto$ = of(undefined);
      return;
    }

    const cleanId = selectedId.replace(/^\d+:\s*/, '').trim();
    this.selectedBulto$ = of(cleanId).pipe(
      switchMap(id => {
        return this.bultoService.getBultoById(id);
      })
    );

    this.selectedBulto$.subscribe(bulto => {
      if (bulto) {
        this.largeBulto = bulto.dimensions.large;
        this.widthBulto = bulto.dimensions.width;
        this.heightBulto = bulto.dimensions.height;
      }
    });
  }

  isLoggingOut = signal(false);

  // ============================
  // CALCULAR DIMENSIONES PARA <app-pallet-view>
  // ============================

  updateDims() {
    const pallet = this.selectedPalletValue;
    const bulto = this.selectedBultoValue;

    if (!pallet || !bulto) return;
    if (this.cajasLargo <= 0 || this.cajasAncho <= 0) return;

    this.palletDims = {
      large: (pallet.dimensions.large ?? 1.2) * 100,
      width: (pallet.dimensions.width ?? 1) * 100,
      height: (pallet.dimensions.height ?? 0.14) * 100
    };

    this.cajaDims = {
      large: ((bulto.dimensions.large ?? 1.2) * 100) / this.cajasLargo,
      width: ((bulto.dimensions.width ?? 1) * 100) / this.cajasAncho,
      height: (bulto.dimensions.height ?? 0.24) * 100
    };

    this.cdr.detectChanges();
  }

  clearFields() {
    this.calculationResult = false;

    this.cajasLargo = 0;
    this.cajasAncho = 0;
    this.altoEstiba = 0;
    this.nivelAltura = 0;
    this.nivelAlturaReal = 0;
    this.alturaMaxima = 0;

    this.cajasTarima = 0;
    this.noTarimas = 0;
    this.pesoBrutoCarga = 0;
    this.pesoBrutoTarimas = 0;
    this.pesoBrutoTotal = 0;

    this.alturaMaximaTarima = 0;
    this.tarimasCompletas = 0;
    this.cajasSobrantes = 0;
    this.tarimasExtras = 0;
    this.alturaTarimaExtra = 0;
    this.pesoVolumetrico = 0;

    this.tarimasContenedor = 0;

    this.palletDims = undefined;
    this.cajaDims = undefined;
  }

  // ============================
  // CÁLCULOS
  // ============================

  async calculate(): Promise<void> {
    const Swal = (await import('sweetalert2')).default;

    // Swal de carga
    Swal.fire({
      title: 'Calculando...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // Esperamos los valores seleccionados
      const selectedContenedor = await this.selectedContenedor$?.pipe(take(1)).toPromise();
      const selectedPallet = await this.selectedPallet$?.pipe(take(1)).toPromise();
      const selectedBulto = await this.selectedBulto$?.pipe(take(1)).toPromise();

      // -------------------------------
      // VALIDACIONES
      // -------------------------------
      Swal.hideLoading();
      await Swal.close();
      await new Promise(res => setTimeout(res, 20));

      if (!selectedContenedor || !selectedPallet || !selectedBulto) {
        await Swal.fire({
          title: 'Atención',
          text: 'Por favor selecciona contenedor, pallet y bulto válidos.',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false
        });
        this.calculationResult = false;
        return;
      }

      if (this.bultoWeight <= 0) {
        await Swal.fire({
          title: 'Atención',
          text: 'El peso del bulto debe ser mayor a 0.',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false
        });
        this.calculationResult = false;
        return;
      }

      if (this.cajasExportar <= 0) {
        await Swal.fire({
          title: 'Atención',
          text: 'La cantidad a exportar debe ser mayor a 0.',
          icon: 'warning',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false
        });
        this.calculationResult = false;
        return;
      }

      if (selectedBulto.free) {
        if (
          !this.largeBulto || isNaN(this.largeBulto) || this.largeBulto <= 0 ||
          !this.widthBulto || isNaN(this.widthBulto) || this.widthBulto <= 0 ||
          !this.heightBulto || isNaN(this.heightBulto) || this.heightBulto <= 0
        ) {
          await Swal.fire({
            title: 'Atención',
            text: 'Todas las dimensiones del bulto deben ser mayores a 0.',
            icon: 'warning',
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false
          });
          this.calculationResult = false;
          return;
        }
      } else {
        this.largeBulto = selectedBulto.dimensions.large;
        this.widthBulto = selectedBulto.dimensions.width;
        this.heightBulto = selectedBulto.dimensions.height;
      }

      // // DEBUG
      // console.log('Selected Contenedor:', selectedContenedor);
      // console.log('Selected Pallet:', selectedPallet);
      // console.log('Selected Bulto:', selectedBulto);

      // console.log("===============================");

      // console.log('Large Contenedor:', selectedContenedor.dimensions.large);
      // console.log('Width Contenedor:', selectedContenedor.dimensions.width);
      // console.log('Height Contenedor:', selectedContenedor.dimensions.height);

      // console.log("===============================");

      // console.log('Large Pallet:', selectedPallet.dimensions.large);
      // console.log('Width Pallet:', selectedPallet.dimensions.width);
      // console.log('Height Pallet:', selectedPallet.dimensions.height);

      // console.log("===============================");

      // console.log('Large Bulto:', this.largeBulto);
      // console.log('Width Bulto:', this.widthBulto);
      // console.log('Height Bulto:', this.heightBulto);

      // console.log("===============================");

      // console.log('Bulto Weight:', this.bultoWeight);
      // console.log('Cajas a Exportar:', this.cajasExportar);

      // -------------------------------
      // AL LLEGAR AQUÍ TODO ES VÁLIDO
      // Mostramos Swal de cálculo
      // -------------------------------
      Swal.fire({
        title: 'Calculando...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // ================================
      // Conversión a centímetros
      // ================================
      const toCM = (m: number) => Math.round(m * 100);

      const containerLargeCM = toCM(selectedContenedor.dimensions.large);
      const containerWidthCM = toCM(selectedContenedor.dimensions.width);
      //const containerHeightCM = toCM(selectedContenedor.dimensions.height);

      const palletLargeCM = toCM(selectedPallet.dimensions.large);
      const palletWidthCM = toCM(selectedPallet.dimensions.width);
      const palletHeightCM = toCM(selectedPallet.dimensions.height);

      const bultoLargeCM = toCM(this.largeBulto);
      const bultoWidthCM = toCM(this.widthBulto);
      const bultoHeightCM = toCM(this.heightBulto);

      const contHeightCM = toCM(selectedContenedor.dimensions.height);

      // ================================
      // CÁLCULOS CON PRECISIÓN
      // ================================
      this.cajasLargo = Math.floor(palletLargeCM / bultoLargeCM);
      this.cajasAncho = Math.floor(palletWidthCM / bultoWidthCM);

      this.altoEstiba = (contHeightCM - palletHeightCM) / bultoHeightCM;
      this.nivelAltura = Math.floor(this.altoEstiba);

      this.alturaMaxima = parseFloat(((this.nivelAltura * this.heightBulto) + selectedPallet.dimensions.height).toFixed(2));

      // Ajustar altura real
      if (this.alturaMaxima > (this.altoEstiba * this.heightBulto)) {
        this.nivelAlturaReal = this.nivelAltura - 1;
      } else {
        this.nivelAlturaReal = this.nivelAltura;
      }

      this.alturaReal = parseFloat(((this.nivelAlturaReal * this.heightBulto) + selectedPallet.dimensions.height).toFixed(2));

      this.cajasTarima = this.cajasLargo * this.cajasAncho * this.nivelAlturaReal;

      this.noTarimas = Math.ceil(this.cajasExportar / this.cajasTarima);

      this.pesoBrutoCarga = parseFloat((this.cajasExportar * this.bultoWeight).toFixed(2));
      this.pesoBrutoTarimas = parseFloat((this.noTarimas * selectedPallet.weight).toFixed(2));
      this.pesoBrutoTotal = parseFloat((this.pesoBrutoCarga + this.pesoBrutoTarimas).toFixed(2));

      this.alturaMaximaTarima =
        (this.nivelAlturaReal * this.heightBulto) + selectedPallet.dimensions.height;

      this.tarimasCompletas = Math.floor(this.cajasExportar / this.cajasTarima);

      this.cajasSobrantes = this.cajasExportar - (this.tarimasCompletas * this.cajasTarima);
      this.tarimasExtras = Math.ceil(this.cajasSobrantes / this.cajasTarima);

      this.alturaTarimaExtra =
        (this.cajasSobrantes / (this.cajasLargo * this.cajasAncho)) * this.heightBulto +
        selectedPallet.dimensions.height;

      this.pesoVolumetrico = parseFloat((
        (this.cajasTarima *
          selectedPallet.dimensions.large *
          selectedPallet.dimensions.width *
          this.alturaMaximaTarima +
          this.tarimasExtras *
          selectedPallet.dimensions.large *
          selectedPallet.dimensions.width *
          this.alturaTarimaExtra
        ) / this.factorEstiba
      ).toFixed(2));

      this.tarimasContenedor = Math.floor(
        (containerLargeCM * containerWidthCM) /
        (palletLargeCM * palletWidthCM)
      );

      this.calculationResult = true;
      this.updateDims();
    } finally {
      Swal.hideLoading();
      Swal.close();
      this.cdr.detectChanges();
    }
  }

  async logout(): Promise<void> {
    const Swal = (await import('sweetalert2')).default;

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Estás seguro de que deseas cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Cerrando sesión...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.isLoggingOut.set(true);
      try {
        await Promise.resolve(this.authService.logout());

        this.selectedContenedorId = null;
        this.selectedType = null;
        this.selectedContenedor$ = of(undefined);
        this.userName = '';
      } finally {
        this.isLoggingOut.set(false);
        Swal.close();
      }
    }
  }
}