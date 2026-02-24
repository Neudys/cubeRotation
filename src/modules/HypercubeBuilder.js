import * as THREE from 'three';

export class HypercubeBuilder {
    constructor(renderManager) {
        this.renderManager = renderManager;
        this.hypercubeGroup = new THREE.Group();
        this.scale = 1.8;
        this.w = 0.5;
    }

    build() {
        const vertices4D = this.generateVertices4D();
        const vertices3D = vertices4D.map(v => this.project4Dto3D(v));

        this.createVertices(vertices3D);
        this.createEdges(vertices3D);

        this.hypercubeGroup.position.set(6, 0, 0);
        this.renderManager.addToScene(this.hypercubeGroup);

        return this.hypercubeGroup;
    }

    generateVertices4D() {
        const w = this.w;
        return [
            [-1, -1, -1, -w], [1, -1, -1, -w], [1, 1, -1, -w], [-1, 1, -1, -w],
            [-1, -1, 1, -w],  [1, -1, 1, -w],  [1, 1, 1, -w],  [-1, 1, 1, -w],
            [-1, -1, -1, w],  [1, -1, -1, w],  [1, 1, -1, w],  [-1, 1, -1, w],
            [-1, -1, 1, w],   [1, -1, 1, w],   [1, 1, 1, w],   [-1, 1, 1, w]
        ];
    }

    project4Dto3D(v4d) {
        const distance = 3;
        const factor = distance / (distance - v4d[3]);
        return [
            v4d[0] * factor * this.scale,
            v4d[1] * factor * this.scale,
            v4d[2] * factor * this.scale
        ];
    }

    createVertices(vertices3D) {
        vertices3D.forEach(pos => {
            const geometry = new THREE.SphereGeometry(0.07, 16, 16);
            const material = new THREE.MeshPhongMaterial({
                color: 0x9b7aa0,
                transparent: true,
                opacity: 0.55,
                emissive: 0x6b3a70,
                emissiveIntensity: 0.2
            });
            const vertex = new THREE.Mesh(geometry, material);
            vertex.position.set(...pos);
            this.hypercubeGroup.add(vertex);
        });
    }

    createEdges(vertices3D) {
        const edges = this.getEdgeIndices();
        edges.forEach(([from, to]) => {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(...vertices3D[from]),
                new THREE.Vector3(...vertices3D[to])
            ]);
            const material = new THREE.LineBasicMaterial({
                color: 0xaa88bb,
                transparent: true,
                opacity: 0.35
            });
            const line = new THREE.Line(geometry, material);
            this.hypercubeGroup.add(line);
        });
    }

    getEdgeIndices() {
        return [
            [0,1], [1,2], [2,3], [3,0],
            [4,5], [5,6], [6,7], [7,4],
            [0,4], [1,5], [2,6], [3,7],
            [8,9], [9,10], [10,11], [11,8],
            [12,13], [13,14], [14,15], [15,12],
            [8,12], [9,13], [10,14], [11,15],
            [0,8], [1,9], [2,10], [3,11],
            [4,12], [5,13], [6,14], [7,15]
        ];
    }

    getGroup() { return this.hypercubeGroup; }

    dispose() {
        this.hypercubeGroup.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
        this.renderManager.removeFromScene(this.hypercubeGroup);
    }
}