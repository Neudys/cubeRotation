import * as THREE from 'three';

/**
 * HypercubeBuilder - Construye visualización de hipercubo 4D (tesseract)
 * Responsabilidad: Crear proyección 3D de un hipercubo 4D
 */
export class HypercubeBuilder {
    constructor(renderManager) {
        this.renderManager = renderManager;
        this.hypercubeGroup = new THREE.Group();
        this.scale = 1.8;
        this.w = 0.5; // Coordenada 4ta dimensión
    }

    /**
     * Construye el hipercubo
     * @returns {THREE.Group} Grupo del hipercubo
     */
    build() {
        // Vértices 4D del tesseract
        const vertices4D = this.generateVertices4D();
        
        // Proyectar a 3D
        const vertices3D = vertices4D.map(v => this.project4Dto3D(v));

        // Crear vértices
        this.createVertices(vertices3D);

        // Crear aristas
        this.createEdges(vertices3D);

        // Posicionar el hipercubo
        this.hypercubeGroup.position.set(6, 0, 0);

        this.renderManager.addToScene(this.hypercubeGroup);

        return this.hypercubeGroup;
    }

    /**
     * Genera los 16 vértices del tesseract en 4D
     * @returns {Array<Array<number>>} Vértices en 4D
     */
    generateVertices4D() {
        const w = this.w;
        return [
            // Cubo interno (w = -0.5)
            [-1, -1, -1, -w], [1, -1, -1, -w], [1, 1, -1, -w], [-1, 1, -1, -w],
            [-1, -1, 1, -w], [1, -1, 1, -w], [1, 1, 1, -w], [-1, 1, 1, -w],
            // Cubo externo (w = 0.5)
            [-1, -1, -1, w], [1, -1, -1, w], [1, 1, -1, w], [-1, 1, -1, w],
            [-1, -1, 1, w], [1, -1, 1, w], [1, 1, 1, w], [-1, 1, 1, w]
        ];
    }

    /**
     * Proyecta un punto 4D a 3D usando proyección de perspectiva
     * @param {Array<number>} v4d - Punto en 4D [x, y, z, w]
     * @returns {Array<number>} Punto en 3D [x, y, z]
     */
    project4Dto3D(v4d) {
        const distance = 3;
        const factor = distance / (distance - v4d[3]);
        return [
            v4d[0] * factor * this.scale,
            v4d[1] * factor * this.scale,
            v4d[2] * factor * this.scale
        ];
    }

    /**
     * Crea los vértices del hipercubo
     * @param {Array<Array<number>>} vertices3D - Vértices proyectados en 3D
     */
    createVertices(vertices3D) {
        vertices3D.forEach(pos => {
            const geometry = new THREE.SphereGeometry(0.08, 16, 16);
            const material = new THREE.MeshPhongMaterial({
                color: 0x9d4edd,
                transparent: true,
                opacity: 0.6,
                emissive: 0x9d4edd,
                emissiveIntensity: 0.3
            });
            const vertex = new THREE.Mesh(geometry, material);
            vertex.position.set(...pos);
            this.hypercubeGroup.add(vertex);
        });
    }

    /**
     * Crea las aristas del hipercubo
     * @param {Array<Array<number>>} vertices3D - Vértices proyectados en 3D
     */
    createEdges(vertices3D) {
        const edges = this.getEdgeIndices();

        edges.forEach(([from, to]) => {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(...vertices3D[from]),
                new THREE.Vector3(...vertices3D[to])
            ]);
            const material = new THREE.LineBasicMaterial({
                color: 0x9d4edd,
                transparent: true,
                opacity: 0.4
            });
            const line = new THREE.Line(geometry, material);
            this.hypercubeGroup.add(line);
        });
    }

    /**
     * Obtiene los índices de las aristas del tesseract
     * @returns {Array<Array<number>>} Pares de índices [from, to]
     */
    getEdgeIndices() {
        return [
            // Aristas del cubo interno (0-7)
            [0,1], [1,2], [2,3], [3,0],
            [4,5], [5,6], [6,7], [7,4],
            [0,4], [1,5], [2,6], [3,7],
            
            // Aristas del cubo externo (8-15)
            [8,9], [9,10], [10,11], [11,8],
            [12,13], [13,14], [14,15], [15,12],
            [8,12], [9,13], [10,14], [11,15],
            
            // Conexiones entre cubos (4ta dimensión)
            [0,8], [1,9], [2,10], [3,11],
            [4,12], [5,13], [6,14], [7,15]
        ];
    }

    /**
     * Anima el hipercubo (rotación en 4D)
     * @param {number} time - Tiempo actual
     */
    animate(time) {
        // Rotación continua para efecto 4D
        this.hypercubeGroup.rotation.y = time * 0.0003;
        this.hypercubeGroup.rotation.x = time * 0.0002;
    }

    /**
     * Obtiene el grupo del hipercubo
     * @returns {THREE.Group}
     */
    getGroup() {
        return this.hypercubeGroup;
    }

    /**
     * Limpia recursos
     */
    dispose() {
        this.hypercubeGroup.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
        this.renderManager.removeFromScene(this.hypercubeGroup);
    }
}
