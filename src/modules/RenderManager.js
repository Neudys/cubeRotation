import * as THREE from 'three';

/**
 * RenderManager - Gestiona la escena Three.js y el renderizado
 * Responsabilidad: Todo lo relacionado con Three.js y la visualización
 */
export class RenderManager {
    constructor(containerId = 'canvas-container') {
        this.containerId = containerId;
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.lights = [];
        
        this.init();
    }

    /**
     * Inicializa la escena Three.js
     */
    init() {
        this.container = document.getElementById(this.containerId);
        
        if (!this.container) {
            throw new Error(`❌ Container #${this.containerId} no encontrado`);
        }

        // Crear escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        this.scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

        // Crear cámara
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(5, 4, 6);
        this.camera.lookAt(0, 0, 0);

        // Crear renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.container.appendChild(this.renderer.domElement);

        // Configurar luces
        this.setupLights();

        // Añadir helpers
        this.addHelpers();

        // Manejar resize
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * Configura las luces de la escena
     */
    setupLights() {
        // Luz ambiental
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambient);
        this.lights.push(ambient);

        // Luces direccionales
        const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight1.position.set(5, 10, 5);
        dirLight1.castShadow = true;
        dirLight1.shadow.mapSize.width = 1024;
        dirLight1.shadow.mapSize.height = 1024;
        this.scene.add(dirLight1);
        this.lights.push(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0x667eea, 0.4);
        dirLight2.position.set(-5, 5, -5);
        this.scene.add(dirLight2);
        this.lights.push(dirLight2);

        // Luz puntual
        const pointLight = new THREE.PointLight(0x764ba2, 1, 100);
        pointLight.position.set(0, 5, 0);
        this.scene.add(pointLight);
        this.lights.push(pointLight);

    }

    /**
     * Añade helpers visuales (grid, ejes, etc.)
     */
    addHelpers() {
        // Grid
        const gridHelper = new THREE.GridHelper(10, 10, 0x667eea, 0x333366);
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.3;
        this.scene.add(gridHelper);

        // Axes helper (solo en desarrollo)
        if (import.meta.env.DEV) {
            const axesHelper = new THREE.AxesHelper(2);
            this.scene.add(axesHelper);
        }
    }

    /**
     * Maneja el redimensionamiento de la ventana
     */
    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Renderiza la escena
     */
    render() {
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Añade un objeto a la escena
     * @param {THREE.Object3D} object - Objeto a añadir
     */
    addToScene(object) {
        this.scene.add(object);
    }

    /**
     * Elimina un objeto de la escena
     * @param {THREE.Object3D} object - Objeto a eliminar
     */
    removeFromScene(object) {
        this.scene.remove(object);
    }

    /**
     * Limpia recursos
     */
    dispose() {
        this.renderer.dispose();
    }

    /**
     * Getters
     */
    getScene() { return this.scene; }
    getCamera() { return this.camera; }
    getRenderer() { return this.renderer; }
}
