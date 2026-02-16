import * as THREE from 'three';

/**
 * CubeBuilder - Construye el cubo 3D interactivo
 * Responsabilidad: Crear geometría del cubo (vértices y aristas)
 */
export class CubeBuilder {
    constructor(dataManager, renderManager) {
        this.dataManager = dataManager;
        this.renderManager = renderManager;
        this.cubeGroup = new THREE.Group();
        this.vertices = [];
        this.edges = [];
    }

    /**
     * Construye el cubo completo
     * @returns {Object} { vertices, edges } - Referencias a los objetos creados
     */
    build() {
        this.createVertices();
        this.createEdges();
        this.renderManager.addToScene(this.cubeGroup);
        
        return { 
            vertices: this.vertices, 
            edges: this.edges 
        };
    }

    /**
     * Crea los vértices (esferas)
     */
    createVertices() {
        const vertexData = this.dataManager.getAllVertices();

        vertexData.forEach(data => {
            const geometry = new THREE.SphereGeometry(0.15, 32, 32);
            const material = new THREE.MeshPhongMaterial({
                color: 0xff6b6b,
                emissive: 0xff0000,
                emissiveIntensity: 0.2,
                shininess: 100,
                transparent: true,
                opacity: 1
            });
            
            const vertex = new THREE.Mesh(geometry, material);
            vertex.position.set(...data.position);
            vertex.castShadow = true;
            vertex.receiveShadow = true;
            
            // Metadata para interacción
            vertex.userData = {
                type: 'vertex',
                id: data.id,
                name: data.name,
                data: data.data,
                connections: this.dataManager.getVertexConnections(data.id)
            };

            this.vertices.push(vertex);
            this.cubeGroup.add(vertex);
        });
    }

    /**
     * Crea las aristas (líneas + cilindros invisibles para raycasting)
     */
    createEdges() {
        const edgeData = this.dataManager.getAllEdges();

        edgeData.forEach(data => {
            const fromVertex = this.dataManager.getVertexById(data.from);
            const toVertex = this.dataManager.getVertexById(data.to);

            if (!fromVertex || !toVertex) {
                console.warn(`Arista ${data.id} tiene vértices inválidos`);
                return;
            }

            // Línea visual
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(...fromVertex.position),
                new THREE.Vector3(...toVertex.position)
            ]);

            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x4ecdc4,
                linewidth: 2,
                transparent: true,
                opacity: 0.6
            });

            const line = new THREE.Line(lineGeometry, lineMaterial);

            // Cilindro invisible para raycasting
            const direction = new THREE.Vector3()
                .subVectors(
                    new THREE.Vector3(...toVertex.position),
                    new THREE.Vector3(...fromVertex.position)
                );
            const length = direction.length();

            const cylinderGeometry = new THREE.CylinderGeometry(0.06, 0.06, length, 8);
            const cylinderMaterial = new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0,
                visible: false
            });
            
            const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
            
            // Posicionar y orientar el cilindro
            cylinder.position.copy(
                new THREE.Vector3(...fromVertex.position)
                    .add(new THREE.Vector3(...toVertex.position))
                    .multiplyScalar(0.5)
            );
            
            cylinder.quaternion.setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                direction.normalize()
            );

            // Metadata
            cylinder.userData = {
                type: 'edge',
                id: data.id,
                from: data.from,
                to: data.to,
                data: data.data,
                visualLine: line
            };

            this.edges.push(cylinder);
            this.cubeGroup.add(line);
            this.cubeGroup.add(cylinder);
        });
    }

    /**
     * Obtiene el grupo del cubo
     * @returns {THREE.Group}
     */
    getGroup() {
        return this.cubeGroup;
    }

    /**
     * Obtiene los vértices
     * @returns {Array<THREE.Mesh>}
     */
    getVertices() {
        return this.vertices;
    }

    /**
     * Obtiene las aristas
     * @returns {Array<THREE.Mesh>}
     */
    getEdges() {
        return this.edges;
    }

    /**
     * Limpia recursos
     */
    dispose() {
        this.vertices.forEach(v => {
            v.geometry.dispose();
            v.material.dispose();
        });
        
        this.edges.forEach(e => {
            e.geometry.dispose();
            e.material.dispose();
            if (e.userData.visualLine) {
                e.userData.visualLine.geometry.dispose();
                e.userData.visualLine.material.dispose();
            }
        });

        this.renderManager.removeFromScene(this.cubeGroup);
    }
}
