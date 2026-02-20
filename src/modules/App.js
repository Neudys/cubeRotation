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

        this.isDragging = false;
        this.previousMouse = { x: 0, y: 0 };

        this.init();
    }

    async init() {
        try {
            await this.loadData();

            this.renderManager = new RenderManager('canvas-container');

            this.cubeBuilder = new CubeBuilder(this.dataManager, this.renderManager);
            this.cubeBuilder.build();
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
    }

    handleVertexClick(vertex) {
        const state = this.stateManager.getState();

        if (state.selectedVertex === vertex) {
            this.resetSelection();
            return;
        }

        this.resetSelection();

        // Color de selección: vino/rosa como en el diagrama original
        vertex.material.color.setHex(0x9b3060);
        vertex.material.emissive.setHex(0x6b1040);
        vertex.material.emissiveIntensity = 0.4;

        const connections = vertex.userData.connections;
        const activeConnections = [];

        connections.forEach(conn => {
            const edge = this.cubeBuilder.getEdges().find(e => e.userData.id === conn.edgeId);
            if (edge) {
                edge.userData.visualTube.material.color.setHex(0x9b3060);
                edge.userData.visualTube.material.opacity = 1;
                edge.userData.isActive = true;
                activeConnections.push(edge);
            }
        });

        this.stateManager.setState({ selectedVertex: vertex, activeConnections });

        const d = vertex.userData.data;
        this.uiManager.updateStatus(
            `<strong>${vertex.userData.name}</strong><br>
             Canal: ${d.canal} &nbsp;|&nbsp; Elemento: ${d.elemento}<br>
             Nº ${vertex.userData.number} &nbsp;·&nbsp; ${d.descripcion || ''}<br>
             <span style="color:#9b3060">↓ Clic en una arista resaltada para ver el vaso</span>`
        );
    }

    handleEdgeClick(edge) {
        const state = this.stateManager.getState();

        if (!state.selectedVertex) {
            this.uiManager.showWarning('Primero selecciona un vértice');
            return;
        }

        if (!state.activeConnections.includes(edge)) {
            this.uiManager.showWarning('Esta arista no está conectada al vértice seleccionado');
            return;
        }

        const fromVertex = this.dataManager.getVertexById(edge.userData.from);
        const toVertex = this.dataManager.getVertexById(edge.userData.to);

        this.uiManager.showDataPanel(
            `Vaso Extraordinario`,
            {
                'Vaso': edge.userData.vessel || '—',
                'Trigrama': edge.userData.trigram || '—',
                'Número': edge.userData.number || '—',
                'Desde': fromVertex.name,
                'Hasta': toVertex.name,
                ...edge.userData.data
            }
        );

        // Resaltar arista seleccionada en dorado
        edge.userData.visualTube.material.color.setHex(0xb8860b);
    }

    handleHover(vertex, edge, event) {
        const state = this.stateManager.getState();

        if (vertex) {
            this.uiManager.showTooltip(
                `<strong>${vertex.userData.name}</strong><br>
                 ${vertex.userData.planet} ${vertex.userData.planetName} · Nº ${vertex.userData.number}<br>
                 <em>Clic para seleccionar</em>`,
                event.clientX, event.clientY
            );
            this.uiManager.setCursor('pointer');
        } else if (edge && state.activeConnections.includes(edge)) {
            this.uiManager.showTooltip(
                `<strong>${edge.userData.vessel || 'Vaso'}</strong><br>
                 ${edge.userData.trigram || ''} · Nº ${edge.userData.number || ''}<br>
                 <em>Clic para ver datos</em>`,
                event.clientX, event.clientY
            );
            this.uiManager.setCursor('pointer');
        } else {
            this.uiManager.hideTooltip();
            this.uiManager.setCursor('default');
        }
    }

    resetSelection() {
        const state = this.stateManager.getState();

        if (state.selectedVertex) {
            state.selectedVertex.material.color.setHex(0x7a8fa6);
            state.selectedVertex.material.emissive.setHex(0x2a3f55);
            state.selectedVertex.material.emissiveIntensity = 0.15;
        }

        state.activeConnections.forEach(edge => {
            edge.userData.visualTube.material.color.setHex(0x556677);
            edge.userData.visualTube.material.opacity = 0.8;
            edge.userData.isActive = false;
        });

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

        // Pulsación suave en conexiones activas
        const time = Date.now() * 0.001;
        state.activeConnections.forEach(edge => {
            const pulse = Math.sin(time * 3) * 0.25 + 0.75;
            edge.userData.visualTube.material.opacity = pulse;
        });

        this.renderManager.render();
    }

    dispose() {
        if (this.cubeBuilder) this.cubeBuilder.dispose();
        if (this.interactionManager) this.interactionManager.dispose();
        if (this.renderManager) this.renderManager.dispose();
        if (this.uiManager) this.uiManager.dispose();
    }
}