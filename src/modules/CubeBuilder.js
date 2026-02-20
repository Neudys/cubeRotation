import * as THREE from 'three';

/**
 * CubeBuilder - Construye el cubo 3D interactivo
 *
 * Diseño de vértices (según indicaciones de Cristina):
 *   - Círculo pequeño con el símbolo planetario dentro
 *   - Alrededor (satélites): número, trigrama, vaso — texto oscuro y legible
 *   - Sin tarjetas/paneles que tapen la estructura
 *
 * Aristas:
 *   - Líneas más gruesas (TubeGeometry)
 *   - Etiqueta mínima (signo + número + canal) en el punto medio
 */
export class CubeBuilder {
    constructor(dataManager, renderManager) {
        this.dataManager = dataManager;
        this.renderManager = renderManager;
        this.cubeGroup = new THREE.Group();
        this.vertices = [];
        this.edges = [];
        this.labels = [];
    }

    build() {
        this.createVertices();
        this.createEdges();
        this.renderManager.addToScene(this.cubeGroup);
        return { vertices: this.vertices, edges: this.edges };
    }

    // ─── Sprite desde canvas ──────────────────────────────────────────────────
    makeSprite(canvas, scaleX, scaleY) {
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        const mat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(scaleX, scaleY, 1);
        sprite.userData = { type: 'label' };
        return sprite;
    }

    // ─── Círculo del vértice con símbolo planetario ───────────────────────────
    createVertexCircle(planet) {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Círculo blanco con borde negro nítido
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.98)';
        ctx.fill();
        ctx.strokeStyle = '#0a1520';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Símbolo planetario — negro puro
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 58px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(planet, size / 2, size / 2 + 2);

        return this.makeSprite(canvas, 0.28, 0.28);
    }

    // ─── Satélite: texto negro/oscuro y muy bold ──────────────────────────────
    createSatelliteLabel(text, color) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, 256, 64);

        // Fondo blanco opaco — máximo contraste
        ctx.fillStyle = 'rgba(255,255,255,0.97)';
        ctx.beginPath();
        ctx.roundRect(2, 4, 252, 56, 8);
        ctx.fill();

        // Borde sutil
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Texto: negro/oscuro, 900 weight, grande
        ctx.fillStyle = color;
        ctx.font = '900 28px "Georgia", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 34);

        return this.makeSprite(canvas, 0.50, 0.125);
    }

    // ─── Etiqueta mínima para aristas ────────────────────────────────────────
    createEdgeLabel(sign, number, canal) {
        const canvas = document.createElement('canvas');
        canvas.width = 280;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, 280, 80);

        // Fondo blanco sólido
        ctx.fillStyle = 'rgba(255,255,255,0.97)';
        ctx.beginPath();
        ctx.roundRect(2, 2, 276, 76, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Signo zodiacal — negro puro
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 28px serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(sign, 10, 26);

        // Número — vino muy oscuro
        ctx.fillStyle = '#6b0a3a';
        ctx.font = '900 18px "Georgia", serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(number, 270, 22);

        // Canal — negro puro
        ctx.fillStyle = '#0a0a0a';
        ctx.font = 'bold 17px "Georgia", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(canal, 140, 56);

        return this.makeSprite(canvas, 0.72, 0.18);
    }

    // ─── Crear vértices ───────────────────────────────────────────────────────
    createVertices() {
        const vertexData = this.dataManager.getAllVertices();

        vertexData.forEach(data => {

            // Esfera invisible — solo para raycasting
            const geometry = new THREE.SphereGeometry(0.10, 24, 24);
            const material = new THREE.MeshPhongMaterial({
                color: 0x5577aa,
                emissive: 0x223355,
                emissiveIntensity: 0.2,
                shininess: 60,
                transparent: true,
                opacity: 0.0
            });

            const vertex = new THREE.Mesh(geometry, material);
            vertex.position.set(...data.position);

            vertex.userData = {
                type: 'vertex',
                id: data.id,
                name: data.name,
                planet: data.planet,
                planetName: data.planetName,
                number: data.number,
                trigram: data.trigram,
                trigramName: data.trigramName,
                vessel: data.vessel,
                element: data.element,
                data: data.data,
                connections: this.dataManager.getVertexConnections(data.id)
            };

            this.vertices.push(vertex);
            this.cubeGroup.add(vertex);

            const pos = new THREE.Vector3(...data.position);

            // 1) Círculo con símbolo planetario — centrado en el vértice
            const circle = this.createVertexCircle(data.planet);
            circle.position.copy(pos);
            this.labels.push(circle);
            this.cubeGroup.add(circle);

            // 2) Número — encima, vino muy oscuro
            const numLabel = this.createSatelliteLabel(data.number, '#6b0a3a');
            numLabel.position.copy(pos);
            numLabel.position.y += 0.26;
            this.labels.push(numLabel);
            this.cubeGroup.add(numLabel);

            // 3) Trigrama — a la derecha, azul muy oscuro
            const triLabel = this.createSatelliteLabel(
                data.trigram + '  ' + data.trigramName,
                '#0a1a3a'
            );
            triLabel.position.copy(pos);
            triLabel.position.x += 0.38;
            triLabel.position.y += 0.10;
            this.labels.push(triLabel);
            this.cubeGroup.add(triLabel);

            // 4) Vaso — debajo, verde muy oscuro
            const vasLabel = this.createSatelliteLabel(data.vessel, '#0a2010');
            vasLabel.position.copy(pos);
            vasLabel.position.y -= 0.26;
            this.labels.push(vasLabel);
            this.cubeGroup.add(vasLabel);
        });
    }

    // ─── Crear aristas ────────────────────────────────────────────────────────
    createEdges() {
        const edgeData = this.dataManager.getAllEdges();

        edgeData.forEach(data => {
            const fromVertex = this.dataManager.getVertexById(data.from);
            const toVertex = this.dataManager.getVertexById(data.to);

            if (!fromVertex || !toVertex) {
                console.warn(`Arista ${data.id} tiene vértices inválidos`);
                return;
            }

            const from3 = new THREE.Vector3(...fromVertex.position);
            const to3 = new THREE.Vector3(...toVertex.position);

            // Tubo para grosor real en WebGL
            const path = new THREE.LineCurve3(from3, to3);
            const tubeGeo = new THREE.TubeGeometry(path, 1, 0.018, 6, false);
            const tubeMat = new THREE.MeshBasicMaterial({
                color: 0x223344,
                transparent: true,
                opacity: 0.85
            });
            const tube = new THREE.Mesh(tubeGeo, tubeMat);

            // Cilindro invisible para raycasting
            const direction = new THREE.Vector3().subVectors(to3, from3);
            const length = direction.length();
            const cylGeo = new THREE.CylinderGeometry(0.07, 0.07, length, 6);
            const cylMat = new THREE.MeshBasicMaterial({ visible: false });
            const cylinder = new THREE.Mesh(cylGeo, cylMat);

            cylinder.position.copy(from3.clone().add(to3).multiplyScalar(0.5));
            cylinder.quaternion.setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                direction.normalize()
            );

            cylinder.userData = {
                type: 'edge',
                id: data.id,
                from: data.from,
                to: data.to,
                sign: data.sign,
                signName: data.signName,
                vessel: data.vessel,
                trigram: data.trigram,
                number: data.number,
                data: data.data,
                visualTube: tube,
                isActive: false
            };

            this.edges.push(cylinder);
            this.cubeGroup.add(tube);
            this.cubeGroup.add(cylinder);

            // Etiqueta en el punto medio
            if (data.sign) {
                const mid = from3.clone().add(to3).multiplyScalar(0.5);
                const edgeLabel = this.createEdgeLabel(
                    data.sign,
                    data.number,
                    data.vessel
                );
                edgeLabel.position.copy(mid);
                edgeLabel.position.y += 0.14;
                this.labels.push(edgeLabel);
                this.cubeGroup.add(edgeLabel);
            }
        });
    }

    getGroup() { return this.cubeGroup; }
    getVertices() { return this.vertices; }
    getEdges() { return this.edges; }

    dispose() {
        this.vertices.forEach(v => { v.geometry.dispose(); v.material.dispose(); });
        this.edges.forEach(e => {
            e.geometry.dispose();
            e.material.dispose();
            if (e.userData.visualTube) {
                e.userData.visualTube.geometry.dispose();
                e.userData.visualTube.material.dispose();
            }
        });
        this.labels.forEach(l => {
            if (l.material?.map) l.material.map.dispose();
            l.material?.dispose();
        });
        this.renderManager.removeFromScene(this.cubeGroup);
    }
}