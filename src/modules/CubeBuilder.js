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
        this.labels = [];
    }

    build() {
        this.createVertices();
        this.createEdges();
        this.renderManager.addToScene(this.cubeGroup);
        return { vertices: this.vertices, edges: this.edges };
    }

    // ─── Helper: canvas rounded rect ─────────────────────────────────────────
    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    createVertexLabel(symbol, number, name) {
        const canvas = document.createElement('canvas');
        canvas.width = 192;
        canvas.height = 112;
        const ctx = canvas.getContext('2d');

        // Sombra suave
        ctx.shadowColor = 'rgba(0,0,0,0.18)';
        ctx.shadowBlur = 8;

        // Fondo blanco con borde gris suave
        ctx.fillStyle = 'rgba(255,255,255,0.97)';
        ctx.strokeStyle = '#b8c4d0';
        ctx.lineWidth = 2;
        this.roundRect(ctx, 3, 3, 186, 106, 12);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Símbolo grande centrado arriba
        ctx.fillStyle = '#1a2b40';
        ctx.font = 'bold 38px serif';
        ctx.textAlign = 'center';
        ctx.fillText(symbol, 96, 52);

        // Número en color vino
        ctx.fillStyle = '#8b2252';
        ctx.font = 'bold 16px "Georgia", serif';
        ctx.textAlign = 'center';
        ctx.fillText(number, 96, 74);

        // Nombre del meridiano
        ctx.fillStyle = '#334455';
        ctx.font = '11px "Georgia", serif';
        ctx.textAlign = 'center';
        ctx.fillText(name, 96, 94);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(0.75, 0.44, 1);
        sprite.userData = { type: 'label' };
        return sprite;
    }

    // ─── Etiqueta de arista ───────────────────────────────────────────────────
    createEdgeLabel(vessel, trigram, number) {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');

        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 6;

        // Fondo blanco con borde vino suave
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.strokeStyle = '#9b3060';
        ctx.lineWidth = 1.5;
        this.roundRect(ctx, 2, 2, 196, 76, 10);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Trigrama a la izquierda
        ctx.fillStyle = '#666';
        ctx.font = '14px serif';
        ctx.textAlign = 'left';
        ctx.fillText(trigram || '', 10, 26);

        // Número en rojo vino a la derecha
        ctx.fillStyle = '#9b3060';
        ctx.font = 'bold 13px "Georgia", serif';
        ctx.textAlign = 'right';
        ctx.fillText(number || '', 190, 26);

        // Nombre del vaso centrado abajo
        ctx.fillStyle = '#1a2b40';
        ctx.font = 'bold 12px "Georgia", serif';
        ctx.textAlign = 'center';
        ctx.fillText(vessel, 100, 56);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(1.0, 0.40, 1);
        sprite.userData = { type: 'label' };
        return sprite;
    }

    // ─── Crear vértices ───────────────────────────────────────────────────────
    createVertices() {
        const vertexData = this.dataManager.getAllVertices();

        vertexData.forEach(data => {
            // Esfera del vértice
            const geometry = new THREE.SphereGeometry(0.13, 32, 32);
            const material = new THREE.MeshPhongMaterial({
                color: 0x7a8fa6,
                emissive: 0x2a3f55,
                emissiveIntensity: 0.15,
                shininess: 80,
                transparent: true,
                opacity: 1
            });

            const vertex = new THREE.Mesh(geometry, material);
            vertex.position.set(...data.position);
            vertex.castShadow = true;
            vertex.receiveShadow = true;

            vertex.userData = {
                type: 'vertex',
                id: data.id,
                name: data.name,
                symbol: data.symbol,
                number: data.number,
                data: data.data,
                connections: this.dataManager.getVertexConnections(data.id)
            };

            this.vertices.push(vertex);
            this.cubeGroup.add(vertex);

            // Etiqueta flotante sobre el vértice
            const label = this.createVertexLabel(data.symbol, data.number, data.name);
            label.position.set(...data.position);
            label.position.y += 0.42;
            this.labels.push(label);
            this.cubeGroup.add(label);
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

            // Línea visual
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([from3, to3]);
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x556677,
                linewidth: 2,
                transparent: true,
                opacity: 0.8
            });
            const line = new THREE.Line(lineGeometry, lineMaterial);

            // Cilindro invisible para raycasting
            const direction = new THREE.Vector3().subVectors(to3, from3);
            const length = direction.length();
            const cylinderGeometry = new THREE.CylinderGeometry(0.06, 0.06, length, 8);
            const cylinderMaterial = new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0,
                visible: false
            });
            const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

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
                vessel: data.vessel,
                trigram: data.trigram,
                number: data.number,
                data: data.data,
                visualLine: line,
                isActive: false
            };

            this.edges.push(cylinder);
            this.cubeGroup.add(line);
            this.cubeGroup.add(cylinder);

            // Etiqueta del vaso extraordinario en el punto medio
            if (data.vessel) {
                const mid = new THREE.Vector3(...fromVertex.position)
                    .add(new THREE.Vector3(...toVertex.position))
                    .multiplyScalar(0.5);

                const edgeLabel = this.createEdgeLabel(data.vessel, data.trigram, data.number);
                edgeLabel.position.copy(mid);
                edgeLabel.position.y += 0.18;
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
            if (e.userData.visualLine) {
                e.userData.visualLine.geometry.dispose();
                e.userData.visualLine.material.dispose();
            }
        });
        this.labels.forEach(l => {
            if (l.material?.map) l.material.map.dispose();
            l.material?.dispose();
        });
        this.renderManager.removeFromScene(this.cubeGroup);
    }
}