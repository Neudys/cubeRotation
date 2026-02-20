import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * RenderManager - Gestiona la escena Three.js y el renderizado
 * Responsabilidad: Todo lo relacionado con Three.js y la visualización
 */
export class RenderManager {
    constructor(containerId = 'canvas-container') {
        this.controls = null;
        this.containerId = containerId;
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.lights = [];

        this.init();
    }

    init() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            throw new Error(`Container #${this.containerId} no encontrado`);
        }

        // Escena con fondo BLANCO y sin niebla
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);

        // Cámara
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(4, 3, 5);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);
        
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enablePan = false;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.01;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 15;
        
        this.setupLights();

        window.addEventListener('resize', () => this.handleResize());
    }

    setupLights() {
        // Luz ambiental fuerte para fondo claro
        const ambient = new THREE.AmbientLight(0xffffff, 1.1);
        this.scene.add(ambient);
        this.lights.push(ambient);

        // Luz direccional principal suave
        const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.7);
        dirLight1.position.set(5, 10, 5);
        dirLight1.castShadow = true;
        dirLight1.shadow.mapSize.width = 1024;
        dirLight1.shadow.mapSize.height = 1024;
        this.scene.add(dirLight1);
        this.lights.push(dirLight1);

        // Luz fría complementaria
        const dirLight2 = new THREE.DirectionalLight(0xdce8f5, 0.4);
        dirLight2.position.set(-5, 5, -5);
        this.scene.add(dirLight2);
        this.lights.push(dirLight2);

        // Punto de luz suave
        const pointLight = new THREE.PointLight(0xaabbcc, 0.5, 100);
        pointLight.position.set(0, 5, 0);
        this.scene.add(pointLight);
        this.lights.push(pointLight);
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.controls.update();  
        this.renderer.render(this.scene, this.camera);
    }

    addToScene(object) { this.scene.add(object); }
    removeFromScene(object) { this.scene.remove(object); }
    dispose() { this.renderer.dispose(); }

    getScene() { return this.scene; }
    getCamera() { return this.camera; }
    getRenderer() { return this.renderer; }
}