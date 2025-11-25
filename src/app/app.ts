import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login';
import { Observable, map, take, switchMap, of } from 'rxjs';

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
  imports: [CommonModule, LoginComponent, FormsModule],
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

  // Eventos
  onTypeSelect(event: Event) {
    const target = event.target as HTMLSelectElement;

    this.selectedType = target.value ? parseInt(target.value, 10) : null;
    this.selectedContenedorId = null;
    this.selectedContenedor$ = of(undefined);

    this.filterAndLoadContenedores();
  }

  onContenedorSelect(event: Event) {
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
          title: 'Error',
          text: 'Por favor selecciona contenedor, pallet y bulto válidos.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false
        });
        this.calculationResult = false;
        return;
      }

      if (this.bultoWeight <= 0) {
        await Swal.fire({
          title: 'Dato inválido',
          text: 'El peso del bulto debe ser mayor a 0.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          allowOutsideClick: false
        });
        this.calculationResult = false;
        return;
      }

      if (this.cajasExportar <= 0) {
        await Swal.fire({
          title: 'Dato inválido',
          text: 'La cantidad de cajas a exportar debe ser mayor a 0.',
          icon: 'error',
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
            title: 'Dimensiones inválidas',
            text: 'Todas las dimensiones del bulto deben ser mayores a 0.',
            icon: 'error',
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

      // -------------------------------
      // CÁLCULOS
      // -------------------------------
      this.cajasLargo = Math.floor(selectedPallet.dimensions.large / this.largeBulto);
      this.cajasAncho = Math.floor(selectedPallet.dimensions.width / this.widthBulto);

      this.altoEstiba = (selectedContenedor.dimensions.height - selectedPallet.dimensions.height) / this.heightBulto;
      this.nivelAltura = Math.floor(this.altoEstiba);

      this.alturaMaxima = parseFloat(((this.nivelAltura * this.heightBulto) + selectedPallet.dimensions.height).toFixed(2));

      if (this.alturaMaxima > this.altoEstiba * this.heightBulto) {
        this.nivelAlturaReal = this.nivelAltura - 1;
      } else {
        this.nivelAlturaReal = this.nivelAltura;
      }

      this.cajasTarima = this.cajasLargo * this.cajasAncho * this.nivelAlturaReal;
      this.noTarimas = Math.ceil(this.cajasExportar / this.nivelAlturaReal);

      this.pesoBrutoCarga = parseFloat((this.cajasExportar * this.bultoWeight).toFixed(2));
      this.pesoBrutoTarimas = parseFloat((this.noTarimas * selectedPallet.weight).toFixed(2));
      this.pesoBrutoTotal = parseFloat((this.pesoBrutoCarga + this.pesoBrutoTarimas).toFixed(2));

      this.alturaMaximaTarima = this.nivelAlturaReal * selectedPallet.dimensions.height + selectedPallet.dimensions.height;
      this.tarimasCompletas = Math.floor(this.cajasExportar / this.cajasTarima);

      this.cajasSobrantes = this.cajasExportar - (this.tarimasCompletas * this.cajasTarima);
      this.tarimasExtras = Math.ceil(this.cajasSobrantes / this.cajasTarima);

      this.alturaTarimaExtra = (this.cajasSobrantes / (this.cajasLargo * this.cajasAncho)) * this.heightBulto + selectedPallet.dimensions.height;

      this.pesoVolumetrico = parseFloat(((this.cajasTarima *
        selectedPallet.dimensions.large *
        selectedPallet.dimensions.width *
        this.alturaMaximaTarima +
        this.tarimasExtras *
        selectedPallet.dimensions.large *
        selectedPallet.dimensions.width *
        this.alturaTarimaExtra) / this.factorEstiba).toFixed(2));

      this.calculationResult = true;
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