import {
  Component,
  ElementRef,
  Input,
  OnInit,
  OnChanges,
  ViewChild,
  SimpleChanges
} from '@angular/core';

import * as THREE from 'three';

@Component({
  selector: 'app-pallet-view',
  standalone: true,
  templateUrl: './pallet-view.html',
  styleUrl: './pallet-view.css',
})
export class PalletView implements OnInit, OnChanges {

  @ViewChild('canvasContainer', { static: true }) container!: ElementRef;

  @Input() cajasLargo!: number;
  @Input() cajasAncho!: number;
  @Input() niveles!: number;
  @Input() palletDims!: { large: number; width: number; height: number };
  @Input() cajaDims!: { large: number; width: number; height: number };

  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera;
  private renderer!: THREE.WebGLRenderer;

  ngOnInit(): void {
    this.createScene();
    this.drawScene();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.scene) return;
    this.drawScene();
  }

  // ========================================
  //   CREAR ESCENA + CÁMARA AUTOMÁTICA
  // ========================================

  private createScene() {
    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    this.camera = new THREE.OrthographicCamera(
      width / -100,
      width / 100,
      height / 100,
      height / -100,
      1,
      5000
    );

    this.camera.position.set(-1, 1, -1).normalize(); // dirección isométrica
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);

    this.container.nativeElement.innerHTML = '';
    this.container.nativeElement.appendChild(this.renderer.domElement);

    this.animate();
  }

  // ========================================
  //      TEXTO 3D (SPRITE)
  // ========================================

  private makeTextLabel(text: string, size = 1300): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.font = `${size}px Arial`;

    canvas.width = ctx.measureText(text).width;
    canvas.height = size * 1.4;

    ctx.font = `${size}px Arial`;
    ctx.fillStyle = "blue";
    ctx.textBaseline = "top";
    ctx.fillText(text, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.SpriteMaterial({
      map: texture,
      depthTest: false,
      depthWrite: false,
      transparent: true
    });

    const sprite = new THREE.Sprite(material);

    sprite.scale.set(canvas.width * 0.015, canvas.height * 0.015, 1);

    sprite.onBeforeRender = () => {
      sprite.quaternion.copy(this.camera.quaternion);
    };

    sprite.renderOrder = 9999;

    return sprite;
  }

  // ========================================
  //        COTAS (DIMENSIONS)
  // ========================================

  private addDimension(p1: THREE.Vector3, p2: THREE.Vector3, label: string) {
    const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
    const length = p1.distanceTo(p2);

    const arrow = new THREE.ArrowHelper(dir, p1, length, 0x888888);
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    const text = this.makeTextLabel(label);
    text.position.copy(mid);

    // Empujar ligeramente hacia la cámara
    const towardsCamera = new THREE.Vector3(230, 25, 25);
    arrow.position.add(towardsCamera);
    text.position.add(towardsCamera);

    this.scene.add(arrow);
    this.scene.add(text);
  }

  // ========================================
  //         REDIBUJAR ESCENA
  // ========================================

  private drawScene() {

    // limpiar
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    // luces
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(200, 400, 200);
    this.scene.add(light);

    this.scene.add(new THREE.AmbientLight(0x888888));

    // ======================================
    //          TARIMA REAL
    // ======================================

    const palletGeo = new THREE.BoxGeometry(
      this.palletDims.large,
      this.palletDims.height,
      this.palletDims.width
    );

    const pallet = new THREE.Mesh(
      palletGeo,
      new THREE.MeshPhongMaterial({ color: 0x8b5a2b })
    );

    pallet.position.set(
      this.palletDims.large / 2,
      this.palletDims.height / 2,
      this.palletDims.width / 2
    );

    this.scene.add(pallet);

    // ======================================
    //            CAJAS REALES
    // ======================================

    const boxGeo = new THREE.BoxGeometry(
      this.cajaDims.large,
      this.cajaDims.height,
      this.cajaDims.width
    );
    const boxMat = new THREE.MeshPhongMaterial({ color: 0x9ec5fe });

    for (let h = 0; h < this.niveles; h++) {
      for (let x = 0; x < this.cajasLargo; x++) {
        for (let z = 0; z < this.cajasAncho; z++) {
          const box = new THREE.Mesh(boxGeo, boxMat);

          box.position.set(
            x * this.cajaDims.large + this.cajaDims.large / 2,
            this.palletDims.height + h * this.cajaDims.height + this.cajaDims.height / 2,
            z * this.cajaDims.width + this.cajaDims.width / 2
          );

          this.scene.add(box);

          // bordes
          const edges = new THREE.EdgesGeometry(boxGeo);
          const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0x000000 })
          );
          line.position.copy(box.position);
          this.scene.add(line);
        }
      }
    }

    // ======================================
    //              COTAS REALES
    // ======================================

    const totalHeight = this.palletDims.height + this.niveles * this.cajaDims.height;
    const totalLarge = this.palletDims.large;
    const totalWidth = this.palletDims.width;

    // ======================================
    //    AJUSTE REAL DE LA CAMARA ORTOGRAFICA
    // ======================================

    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;

    const maxDimension = Math.max(totalHeight, totalLarge, totalWidth);
    const margin = maxDimension * 1;      // margen alrededor
    const viewSize = maxDimension + margin; // tamaño visible

    const aspect = width / height;

    // ortográfica correcta
    const zoomFactor = 0.5; // más pequeño = más zoom

    this.camera.left = -viewSize * aspect * zoomFactor;
    this.camera.right = viewSize * aspect * zoomFactor;
    this.camera.top = viewSize * zoomFactor;
    this.camera.bottom = -viewSize * zoomFactor;


    this.camera.near = 0.1;
    this.camera.far = 5000;
    this.camera.updateProjectionMatrix();

    // posición isométrica
    const d = maxDimension * 1.4;
    this.camera.position.set(d, d, d);

    // centro de la escena
    this.camera.lookAt(
      totalLarge / 2,
      totalHeight / 2,
      totalWidth / 2
    );

    // Altura
    this.addDimension(
      new THREE.Vector3(0, 0, -20),
      new THREE.Vector3(0, totalHeight, -20),
      `${(totalHeight / 100).toFixed(2)} m`
    );

    // Largo
    this.addDimension(
      new THREE.Vector3(0, 0, -20),
      new THREE.Vector3(totalLarge, 0, -20),
      `${(totalLarge / 100).toFixed(2)} m`
    );

    // Ancho
    this.addDimension(
      new THREE.Vector3(-20, 0, 0),
      new THREE.Vector3(-20, 0, totalWidth),
      `${(totalWidth / 100).toFixed(2)} m`
    );
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };
}
