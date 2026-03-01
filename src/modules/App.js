import * as THREE from 'three';
import { DataManager } from './DataManager.js';
import { RenderManager } from './RenderManager.js';
import { CubeBuilder } from './CubeBuilder.js';
import { InteractionManager } from './InteractionManager.js';
import { StateManager } from './StateManager.js';
import { UIManager } from './UIManager.js';

export class App {
    constructor() {
        this.dataManager = new DataManager();
        this.stateManager = new StateManager();
        this.uiManager = new UIManager();
        this.renderManager = null;
        this.cubeBuilder = null;
        this.interactionManager = null;
        this.clock = new THREE.Clock();

        this.cubeGroup = null;

        // Two-click selection state
        this.firstVertex = null;
        this.secondVertex = null;
        this.activeEdge = null;

        this.isDragging = false;
        this.previousMouse = { x: 0, y: 0 };

        this.init();
    }

    async init() {
        try {
            await this.loadData();

            this.renderManager = new RenderManager('canvas-container');

            this.cubeBuilder = new CubeBuilder(this.dataManager, this.renderManager);
            await this.cubeBuilder.build();
            this.cubeGroup = this.cubeBuilder.getGroup();

            this.interactionManager = new InteractionManager(this.renderManager, this.cubeBuilder);
            this.setupInteractions();

            this.setupUIControls();
            this.setupMouseDrag();

            this.stateManager.subscribe((newState, oldState) => {
                this.onStateChange(newState, oldState);
            });

            this.animate();

            this.uiManager.showSuccess('Aplicación cargada correctamente');

        } catch (error) {
            console.error('Error en inicialización:', error);
            this.uiManager.showError('Error al cargar la aplicación');
        }
    }

    async loadData() {
        try {
            await this.dataManager.loadFromJSON('/cube-data.json');
        } catch (error) {
            console.warn('No se pudo cargar JSON externo, usando datos por defecto');
            this.dataManager.loadDefaultData();
        }
    }

    setupInteractions() {
        this.interactionManager.on('onVertexClick', (vertex) => {
            this.handleVertexClick(vertex);
        });

        this.interactionManager.on('onEdgeClick', (edge) => {
            this.handleEdgeClick(edge);
        });

        this.interactionManager.on('onHover', ({ vertex, edge, event }) => {
            this.handleHover(vertex, edge, event);
        });

        this.interactionManager.on('onNoSelection', () => {
            this.resetSelection();
        });
    }

    // ─── Visual helpers ──────────────────────────────────────────────────────

// DESPUÉS:
    _highlightVertex(vertex) {
        vertex.material.color.setHex(0xc0305a);
        vertex.material.emissive.setHex(0xc0305a);
        vertex.material.emissiveIntensity = 0.5;
        vertex.material.opacity = 0.85;
        vertex.material.transparent = true;
        vertex.scale.set(2.0, 2.0, 2.0);
    }

    _resetVertexVisual(vertex) {
        if (!vertex) return;
        vertex.material.color.setHex(0x7a8fa6);
        vertex.material.emissive.setHex(0x2a3f55);
        vertex.material.emissiveIntensity = 0.15;
        vertex.material.opacity = 0.0;
        vertex.material.transparent = true;
        vertex.scale.set(1, 1, 1);
    }

    // DESPUÉS (bien):
    _highlightEdge(edge) {
        edge.userData.visualTube.material.color.setHex(0xc0305a);
        edge.userData.visualTube.material.opacity = 1;
        edge.userData.isActive = true;
    }

    _resetEdgeVisual(edge) {
        if (!edge) return;
        edge.userData.visualTube.material.color.setHex(0x223344);
        edge.userData.visualTube.material.opacity = 0.85;
        edge.userData.isActive = false;
    }

    // ─── Find direct edge between two vertices ────────────────────────────────

    _findEdgeBetween(v1, v2) {
        const id1 = v1.userData.id;
        const id2 = v2.userData.id;
        return this.cubeBuilder.getEdges().find(e =>
            (e.userData.from === id1 && e.userData.to === id2) ||
            (e.userData.from === id2 && e.userData.to === id1)
        ) || null;
    }

    // ─── Main click handler ───────────────────────────────────────────────────

    handleVertexClick(vertex) {
        // Clicking the same first vertex → deselect everything
        if (this.firstVertex === vertex && !this.secondVertex) {
            this.resetSelection();
            return;
        }

        // Clicking the same second vertex → deselect second
        if (this.secondVertex === vertex) {
            this._resetVertexVisual(this.secondVertex);
            this._resetEdgeVisual(this.activeEdge);
            this.secondVertex = null;
            this.activeEdge = null;
            this.stateManager.setState({ activeConnections: [] });
            // Back to single vertex state
            const d = this.firstVertex.userData;
            this.uiManager.showVertexCard(d);
            this.uiManager.updateStatus(
                `<strong>${d.name}</strong> seleccionado. Haz clic en otro vértice para ver la conexión.`
            );
            return;
        }

        // ── No vertex selected → first click ──────────────────────────────────
        if (!this.firstVertex) {
            this.firstVertex = vertex;
            this._highlightVertex(vertex);
            this.stateManager.setState({ selectedVertex: vertex, activeConnections: [] });

            const d = vertex.userData;
            this.uiManager.showVertexCard(d);
            this.uiManager.updateStatus(
                `<strong>${d.name}</strong> seleccionado · Haz clic en otro vértice para ver su conexión`
            );
            return;
        }

        // ── First vertex exists → second click ────────────────────────────────
        // Reset previous second vertex and edge if any
        this._resetVertexVisual(this.secondVertex);
        this._resetEdgeVisual(this.activeEdge);

        this.secondVertex = vertex;
        this._highlightVertex(vertex);

        const connectingEdge = this._findEdgeBetween(this.firstVertex, this.secondVertex);
        this.activeEdge = connectingEdge;

        if (connectingEdge) {
            this._highlightEdge(connectingEdge);
            this.stateManager.setState({ activeConnections: [connectingEdge] });
            this.uiManager.showConnectionPanel(
                this.firstVertex.userData,
                connectingEdge.userData,
                this.secondVertex.userData
            );
            this.uiManager.updateStatus(
                `${this.firstVertex.userData.name} ↔ ${this.secondVertex.userData.name}`
            );
        } else {
            // No direct connection → reset everything and select new vertex as first
            this._resetVertexVisual(this.firstVertex);
            this._resetVertexVisual(this.secondVertex);
            this._resetEdgeVisual(this.activeEdge);

            this.secondVertex = null;
            this.activeEdge = null;

            // Make the attempted vertex the new first selection
            this.firstVertex = vertex;
            this._highlightVertex(vertex);
            this.stateManager.setState({ selectedVertex: vertex, activeConnections: [] });

            const d = vertex.userData;
            this.uiManager.showVertexCard(d);
            this.uiManager.updateStatus(
                `<strong>${d.name}</strong> seleccionado · Haz clic en otro vértice para ver su conexión`
            );
        }
    }

    handleEdgeClick(edge) {
        // Edge click now only relevant if it's the active edge
        if (edge === this.activeEdge) {
            // Already shown in panel — could show expanded info if needed
            edge.userData.visualTube.material.color.setHex(0xb8860b);
        }
    }

    handleHover(vertex, edge, event) {
        const state = this.stateManager.getState();

        if (vertex) {
            this.uiManager.showTooltip(
                `<strong>${vertex.userData.name}</strong><br>
                 ${vertex.userData.planet || ''} ${vertex.userData.planetName || ''} · Nº ${vertex.userData.number || ''}<br>
                 <em>Clic para seleccionar</em>`,
                event.clientX, event.clientY
            );
            this.uiManager.setCursor('pointer');
        } else if (edge && state.activeConnections.includes(edge)) {
            this.uiManager.showTooltip(
                `<strong>${edge.userData.vessel || 'Arista'}</strong><br>
                 ${edge.userData.sign || ''} ${edge.userData.signName || ''} · Nº ${edge.userData.number || ''}<br>
                 <em>Conexión activa</em>`,
                event.clientX, event.clientY
            );
            this.uiManager.setCursor('pointer');
        } else {
            this.uiManager.hideTooltip();
            this.uiManager.setCursor('default');
        }
    }

    resetSelection() {
        this._resetVertexVisual(this.firstVertex);
        this._resetVertexVisual(this.secondVertex);
        this._resetEdgeVisual(this.activeEdge);

        this.firstVertex = null;
        this.secondVertex = null;
        this.activeEdge = null;

        this.stateManager.setState({ selectedVertex: null, activeConnections: [] });
        this.uiManager.hideDataPanel();
        this.uiManager.updateStatus('Haz clic en un vértice para explorar sus conexiones');
    }

    setupUIControls() {
        this.uiManager.setupButtonCallbacks({
            onReset: () => {
                this.resetSelection();
                this.uiManager.showNotification('Selección reseteada');
            },
            onAutoRotate: () => {
                const state = this.stateManager.getState();
                this.stateManager.setState({ autoRotate: !state.autoRotate });
                this.uiManager.showNotification(
                    !state.autoRotate ? 'Auto-rotación activada' : 'Auto-rotación desactivada'
                );
            }
        });
    }

    setupMouseDrag() {
        const canvas = this.renderManager.getRenderer().domElement;

        canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.previousMouse = { x: e.clientX, y: e.clientY };
        });

        canvas.addEventListener('mouseup', () => { this.isDragging = false; });
        canvas.addEventListener('mouseleave', () => { this.isDragging = false; });
    }

    onStateChange(newState, oldState) {
        if (newState.autoRotate !== oldState.autoRotate) {
            this.uiManager.setButtonState('autoRotate', newState.autoRotate);
        }
    }

    animate() {
        const state = this.stateManager.getState();
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();

        if (state.autoRotate) {
            this.cubeGroup.rotation.y += 0.2 * delta;
            this.cubeGroup.rotation.x += 0.1 * delta;
        }

        // Pulse active edge
        if (this.activeEdge) {
            const time = Date.now() * 0.001;
            const pulse = Math.sin(time * 3) * 0.25 + 0.75;
            this.activeEdge.userData.visualTube.material.opacity = pulse;
        }

        this.renderManager.render();
    }

    dispose() {
        if (this.cubeBuilder) this.cubeBuilder.dispose();
        if (this.interactionManager) this.interactionManager.dispose();
        if (this.renderManager) this.renderManager.dispose();
        if (this.uiManager) this.uiManager.dispose();
    }
}