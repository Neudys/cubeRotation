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

    // ─── Dibuja icono PNG (blanco sobre negro) en canvas ───────────────────
    // Convierte: blanco→negro, negro→transparente (usando brillo como alfa)
    async _drawIcon(ctx, iconUrl, fallbackEmoji, x, y, size) {
        const img = iconUrl ? await this._loadImage(iconUrl) : null;

        if (img) {
            const tmp = document.createElement('canvas');
            tmp.width = size;
            tmp.height = size;
            const tctx = tmp.getContext('2d');

            // Dibujar imagen con aspect ratio (fit)
            const ratio = Math.min(size / img.width, size / img.height);
            const w = img.width * ratio;
            const h = img.height * ratio;
            tctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);

            // Pixel-level: brillo → alfa, color → negro
            const imageData = tctx.getImageData(0, 0, size, size);
            const d = imageData.data;
            for (let i = 0; i < d.length; i += 4) {
                const brightness = (d[i] + d[i + 1] + d[i + 2]) / 3;
                const alpha = d[i + 3] > 0 ? brightness : 0;
                d[i] = 0;       // R → negro
                d[i + 1] = 0;   // G → negro
                d[i + 2] = 0;   // B → negro
                d[i + 3] = alpha; // alfa = brillo original
            }
            tctx.putImageData(imageData, 0, 0);

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
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Fondo círculo blanco
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.98)';
        ctx.fill();
        ctx.strokeStyle = '#0a1520';
        ctx.lineWidth = 12;
        ctx.stroke();

        // Icono SVG o emoji fallback
        await this._drawIcon(ctx, planetIcon, planet, size / 2, size / 2, 300);

        return this.makeSprite(canvas, 0.28, 0.28);
    }

    // ─── Etiqueta satélite de texto (número, trigrama, vaso) ─────────────────
    createSatelliteLabel(text, color) {
        // Medir ancho del texto primero
        const measure = document.createElement('canvas').getContext('2d');
        measure.font = '900 56px "Georgia", serif';
        const textWidth = measure.measureText(text).width;
        const W = Math.max(256, Math.ceil(textWidth + 80));
        const H = 128;

        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(255,255,255,0.97)';
        ctx.beginPath();
        ctx.roundRect(4, 8, W - 8, H - 16, 16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.font = '900 56px "Georgia", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, W / 2, 68);

        // Escalar sprite proporcionalmente al ancho
        const spriteW = 0.50 * (W / 512);
        return this.makeSprite(canvas, spriteW, 0.125);
    }

    // ─── Etiqueta izquierda: icono SVG de elemento + nombre ──────────────────
    async createElementLabelAsync(element, elementName, elementIcon) {
        const H = 128;
        const img = elementIcon ? await this._loadImage(elementIcon) : null;

        // Medir ancho del texto para ajustar el canvas
        const measure = document.createElement('canvas').getContext('2d');
        measure.font = '700 36px "Georgia", serif';
        const label = elementName || element;
        const textWidth = measure.measureText(label).width;

        const iconSize = 76;
        const padding = 40;
        const W = img
            ? Math.max(256, Math.ceil(padding + iconSize + 16 + textWidth + padding))
            : Math.max(256, Math.ceil(textWidth + 80));

        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, W, H);

        // Fondo blanco redondeado
        ctx.fillStyle = 'rgba(255,255,255,0.97)';
        ctx.beginPath();
        ctx.roundRect(4, 8, W - 8, H - 16, 16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (img) {
            const iconX = 20;
            const iconY = (H - iconSize) / 2;

            const tmp = document.createElement('canvas');
            tmp.width = iconSize;
            tmp.height = iconSize;
            const tctx = tmp.getContext('2d');

            const ratio = Math.min(iconSize / img.width, iconSize / img.height);
            const w = img.width * ratio;
            const h = img.height * ratio;
            tctx.drawImage(img, (iconSize - w) / 2, (iconSize - h) / 2, w, h);

            // Pixel-level: brillo → alfa, color → negro
            const imageData = tctx.getImageData(0, 0, iconSize, iconSize);
            const d = imageData.data;
            for (let i = 0; i < d.length; i += 4) {
                const brightness = (d[i] + d[i + 1] + d[i + 2]) / 3;
                const alpha = d[i + 3] > 0 ? brightness : 0;
                d[i] = 0;
                d[i + 1] = 0;
                d[i + 2] = 0;
                d[i + 3] = alpha;
            }
            tctx.putImageData(imageData, 0, 0);

            ctx.drawImage(tmp, iconX, iconY, iconSize, iconSize);

            ctx.fillStyle = '#0a1a3a';
            ctx.font = '700 36px "Georgia", serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, iconX + iconSize + 16, H / 2 + 4);
        } else {
            // Sin SVG: símbolo + nombre
            ctx.fillStyle = '#2a4a2a';
            ctx.font = '900 44px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${element} ${elementName || ''}`, W / 2, H / 2 + 4);
        }

        const spriteW = 0.55 * (W / 512);
        return this.makeSprite(canvas, spriteW, 0.125);
    }

    // ─── Icono zodiacal redondo (mismo estilo que los planetas) ─────────────
    async createEdgeCircleAsync(sign, signIcon) {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Fondo círculo blanco — idéntico al de los planetas
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.98)';
        ctx.fill();
        ctx.strokeStyle = '#1a3a6a';
        ctx.lineWidth = 12;
        ctx.stroke();

        // Icono zodiacal SVG o emoji fallback
        await this._drawIcon(ctx, signIcon, sign, size / 2, size / 2, 300);

        return this.makeSprite(canvas, 0.28, 0.28);
    }

    // ─── Etiqueta satélite para datos de arista (canal + número) ─────────────
    createEdgeInfoLabel(canal, number) {
        const H = 128;
        const canalText = canal && canal.length > 20 ? canal.slice(0, 19) + '…' : (canal || '');
        const label = number ? `${canalText}  ·  ${number}` : canalText;

        // Medir ancho
        const measure = document.createElement('canvas').getContext('2d');
        measure.font = '700 40px "Georgia", serif';
        const textWidth = measure.measureText(label).width;
        const W = Math.max(256, Math.ceil(textWidth + 80));

        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, W, H);

        ctx.fillStyle = 'rgba(255,255,255,0.97)';
        ctx.beginPath();
        ctx.roundRect(4, 8, W - 8, H - 16, 16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#0a1520';
        ctx.font = '700 40px "Georgia", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, W / 2, H / 2 + 4);

        const spriteW = 0.55 * (W / 512);
        return this.makeSprite(canvas, spriteW, 0.125);
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

            // Icono zodiacal redondo centrado en la arista (sobre la línea)
            if (data.sign) {
                const mid = from3.clone().add(to3).multiplyScalar(0.5);

                // Círculo redondo con signo zodiacal — directamente sobre la arista
                this.createEdgeCircleAsync(data.sign, data.signIcon).then(circle => {
                    circle.position.copy(mid);
                    this.labels.push(circle);
                    this.cubeGroup.add(circle);
                });

                // Etiqueta info (canal + número) debajo del círculo
                const infoLabel = this.createEdgeInfoLabel(data.vessel, data.number);
                infoLabel.position.copy(mid);
                infoLabel.position.y -= 0.22;
                this.labels.push(infoLabel);
                this.cubeGroup.add(infoLabel);
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