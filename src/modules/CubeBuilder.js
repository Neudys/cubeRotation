import * as THREE from 'three';

export class CubeBuilder {
    constructor(dataManager, renderManager) {
        this.dataManager = dataManager;
        this.renderManager = renderManager;
        this.cubeGroup = new THREE.Group();
        this.vertices = [];
        this.edges = [];
        this.labels = [];

        // Cache de imágenes cargadas para no repetir fetch
        this._imgCache = {};
    }

    // ─── Carga una imagen (SVG/PNG) desde URL, con caché ─────────────────────
    _loadImage(url) {
        if (this._imgCache[url]) return this._imgCache[url];

        const promise = new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.warn(`No se pudo cargar icono: ${url}`);
                resolve(null);   // null → fallback a emoji
            };
            img.src = url;
        });

        this._imgCache[url] = promise;
        return promise;
    }

    // ─── Precarga todos los iconos antes de construir ─────────────────────────
    async _preloadIcons() {
        const urls = new Set();

        this.dataManager.getAllVertices().forEach(v => {
            if (v.planetIcon) urls.add(v.planetIcon);
            if (v.trigramIcon) urls.add(v.trigramIcon);
            if (v.elementIcon) urls.add(v.elementIcon);
        });
        this.dataManager.getAllEdges().forEach(e => {
            if (e.signIcon) urls.add(e.signIcon);
        });

        await Promise.all([...urls].map(url => this._loadImage(url)));
    }

    // ─── Build (async para esperar precarga de iconos) ────────────────────────
    async build() {
        await this._preloadIcons();
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

    // ─── Dibuja icono SVG en canvas, con fallback a emoji ────────────────────
    async _drawIcon(ctx, iconUrl, fallbackEmoji, x, y, size) {
        const img = iconUrl ? await this._loadImage(iconUrl) : null;

        if (img) {
            // Dibujar en canvas temporal e invertir blanco → negro
            const tmp = document.createElement('canvas');
            tmp.width = size;
            tmp.height = size;
            const tctx = tmp.getContext('2d');

            // Dibujar imagen original
            // Dibujar imagen con aspect ratio (fit)
            const ratio = Math.min(size / img.width, size / img.height);
            const w = img.width * ratio;
            const h = img.height * ratio;
            tctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

            // Rellenar de negro conservando solo el alfa (white → black)
            tctx.globalCompositeOperation = 'source-in';
            tctx.fillStyle = '#000000';
            tctx.fillRect(0, 0, size, size);

            ctx.drawImage(tmp, x - size / 2, y - size / 2, size, size);
        } else {
            // Fallback: símbolo Unicode
            ctx.fillStyle = '#000000';
            ctx.font = `bold ${Math.round(size * 0.85)}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(fallbackEmoji, x, y + 2);
        }
    }

    // ─── Círculo del vértice con icono planetario ─────────────────────────────
    async createVertexCircleAsync(planet, planetIcon) {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Fondo círculo blanco
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.98)';
        ctx.fill();
        ctx.strokeStyle = '#0a1520';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Icono SVG o emoji fallback
        await this._drawIcon(ctx, planetIcon, planet, size / 2, size / 2, 72);

        return this.makeSprite(canvas, 0.28, 0.28);
    }

    // ─── Etiqueta satélite de texto (número, trigrama, vaso) ─────────────────
    createSatelliteLabel(text, color) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, 256, 64);
        ctx.fillStyle = 'rgba(255,255,255,0.97)';
        ctx.beginPath();
        ctx.roundRect(2, 4, 252, 56, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.font = '900 28px "Georgia", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 34);

        return this.makeSprite(canvas, 0.50, 0.125);
    }

    // ─── Etiqueta izquierda: icono SVG de elemento + nombre ──────────────────
    async createElementLabelAsync(element, elementName, elementIcon) {
        const W = 256;
        const H = 64;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, W, H);

        // Fondo blanco redondeado — igual que los otros satélites
        ctx.fillStyle = 'rgba(255,255,255,0.97)';
        ctx.beginPath();
        ctx.roundRect(2, 4, W - 4, H - 8, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        const img = elementIcon ? await this._loadImage(elementIcon) : null;

        if (img) {
            // Icono a la izquierda (invertir blanco → negro) + nombre a la derecha
            const iconSize = 38;
            const iconX = 10;
            const iconY = (H - iconSize) / 2;

            const tmp = document.createElement('canvas');
            tmp.width = iconSize;
            tmp.height = iconSize;
            const tctx = tmp.getContext('2d');
            tctx.drawImage(img, 0, 0, iconSize, iconSize);
            tctx.globalCompositeOperation = 'source-in';
            tctx.fillStyle = '#000000';
            tctx.fillRect(0, 0, iconSize, iconSize);

            const ratio = Math.min(iconSize / img.width, iconSize / img.height);
            const w = img.width * ratio;
            const h = img.height * ratio;
            tctx.drawImage(img, (iconSize - w) / 2, (iconSize - h) / 2, w, h);

            // Texto: nombre del elemento
            const label = elementName || element;
            ctx.fillStyle = '#0a1a3a';
            ctx.font = '700 18px "Georgia", serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, iconX + iconSize + 8, H / 2 + 2);
        } else {
            // Sin SVG: símbolo + nombre
            ctx.fillStyle = '#2a4a2a';
            ctx.font = '900 22px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${element} ${elementName || ''}`, W / 2, H / 2 + 2);
        }

        return this.makeSprite(canvas, 0.55, 0.125);
    }

    // ─── Etiqueta de arista: icono zodiacal prominente ────────────────────────
    async createEdgeLabelAsync(sign, signIcon, number, canal) {
        const W = 220;
        const H = 220;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, W, H);

        const cx = W / 2;
        const boxW = 180;
        const boxH = 104;
        const boxX = (W - boxW) / 2;
        const boxY = 6;
        const radius = 18;

        // ── Rectángulo redondeado para el signo (igual estética que satélites) ──
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, radius);
        ctx.fillStyle = 'rgba(255,255,255,0.97)';
        ctx.fill();
        ctx.strokeStyle = '#1a3a6a';
        ctx.lineWidth = 5;
        ctx.stroke();

        // Icono zodiacal centrado en la caja
        const iconCy = boxY + boxH / 2;
        await this._drawIcon(ctx, signIcon, sign, cx, iconCy, 78);

        // ── Caja blanca para el canal ─────────────────────────────────────────
        const row1Y = boxY + boxH + 10;
        const rowH = 34;
        ctx.beginPath();
        ctx.roundRect(boxX, row1Y, boxW, rowH, 8);
        ctx.fillStyle = 'rgba(255,255,255,0.97)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#0a1520';
        ctx.font = 'bold 17px "Georgia", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const canalText = canal && canal.length > 18 ? canal.slice(0, 17) + '…' : (canal || '');
        ctx.fillText(canalText, cx, row1Y + rowH / 2);

        // ── Caja blanca para el número ────────────────────────────────────────
        const row2Y = row1Y + rowH + 6;
        ctx.beginPath();
        ctx.roundRect(boxX, row2Y, boxW, rowH, 8);
        ctx.fillStyle = 'rgba(255,255,255,0.97)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#6b0a3a';
        ctx.font = '700 16px "Georgia", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(number || '', cx, row2Y + rowH / 2);

        return this.makeSprite(canvas, 0.58, 0.58);
    }

    // ─── Crear vértices ───────────────────────────────────────────────────────
    createVertices() {
        const vertexData = this.dataManager.getAllVertices();

        vertexData.forEach(data => {
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
                planetIcon: data.planetIcon,
                planetName: data.planetName,
                number: data.number,
                trigram: data.trigram,
                trigramIcon: data.trigramIcon,
                trigramName: data.trigramName,
                vessel: data.vessel,
                element: data.element,
                elementName: data.elementName,
                elementIcon: data.elementIcon,
                data: data.data,
                connections: this.dataManager.getVertexConnections(data.id)
            };

            this.vertices.push(vertex);
            this.cubeGroup.add(vertex);

            const pos = new THREE.Vector3(...data.position);

            // 1) Círculo con icono SVG (async)
            this.createVertexCircleAsync(data.planet, data.planetIcon).then(circle => {
                circle.position.copy(pos);
                this.labels.push(circle);
                this.cubeGroup.add(circle);
            });

            // 2) Número — encima
            const numLabel = this.createSatelliteLabel(data.number, '#6b0a3a');
            numLabel.position.copy(pos);
            numLabel.position.y += 0.26;
            this.labels.push(numLabel);
            this.cubeGroup.add(numLabel);

            // 3) Trigrama — a la derecha
            const triLabel = this.createSatelliteLabel(
                data.trigram + '  ' + data.trigramName,
                '#0a1a3a'
            );
            triLabel.position.copy(pos);
            triLabel.position.x += 0.38;
            triLabel.position.y += 0.10;
            this.labels.push(triLabel);
            this.cubeGroup.add(triLabel);

            // 4) Vaso — debajo
            const vasLabel = this.createSatelliteLabel(data.vessel, '#0a2010');
            vasLabel.position.copy(pos);
            vasLabel.position.y -= 0.26;
            this.labels.push(vasLabel);
            this.cubeGroup.add(vasLabel);

            // 5) Elemento — a la izquierda, con icono SVG
            this.createElementLabelAsync(data.element, data.elementName, data.elementIcon).then(elemLabel => {
                elemLabel.position.copy(pos);
                elemLabel.position.x -= 0.38;
                elemLabel.position.y += 0.10;
                this.labels.push(elemLabel);
                this.cubeGroup.add(elemLabel);
            });
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

            const path = new THREE.LineCurve3(from3, to3);
            const tubeGeo = new THREE.TubeGeometry(path, 1, 0.018, 6, false);
            const tubeMat = new THREE.MeshBasicMaterial({
                color: 0x223344,
                transparent: true,
                opacity: 0.85
            });
            const tube = new THREE.Mesh(tubeGeo, tubeMat);

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
                signIcon: data.signIcon,
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

            // Etiqueta con icono zodiacal (async)
            if (data.sign) {
                const mid = from3.clone().add(to3).multiplyScalar(0.5);
                this.createEdgeLabelAsync(
                    data.sign,
                    data.signIcon,
                    data.number,
                    data.vessel
                ).then(edgeLabel => {
                    edgeLabel.position.copy(mid);
                    edgeLabel.position.y += 0.20;
                    this.labels.push(edgeLabel);
                    this.cubeGroup.add(edgeLabel);
                });
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