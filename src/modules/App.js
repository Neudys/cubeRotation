import * as THREE from 'three';
import { DataManager } from './DataManager.js';
import { RenderManager } from './RenderManager.js';
import { CubeBuilder } from './CubeBuilder.js';
import { HypercubeBuilder } from './HypercubeBuilder.js';
import { InteractionManager } from './InteractionManager.js';
import { StateManager } from './StateManager.js';
import { UIManager } from './UIManager.js';

/**
 * App - Aplicación principal
 * Responsabilidad: Orquestar todos los módulos
 */
export class App {
    constructor() {
        // Módulos
        this.dataManager = new DataManager();
        this.stateManager = new StateManager();
        this.uiManager = new UIManager();
        this.renderManager = null;
        this.cubeBuilder = null;
        this.hypercubeBuilder = null;
        this.interactionManager = null;

        // Grupos 3D
        this.cubeGroup = null;
        this.hypercubeGroup = null;

        // Control de rotación con mouse
        this.isDragging = false;
        this.previousMouse = { x: 0, y: 0 };

        // Inicializar
        this.init();
    }

    /**
     * Inicializa la aplicación
     */
    async init() {
        try {

            // 1. Cargar datos
            await this.loadData();

            // 2. Inicializar render
            this.renderManager = new RenderManager('canvas-container');

            // 3. Construir cubo
            this.cubeBuilder = new CubeBuilder(this.dataManager, this.renderManager);
            this.cubeBuilder.build();
            this.cubeGroup = this.cubeBuilder.getGroup();

            // 4. Construir hipercubo
            this.hypercubeBuilder = new HypercubeBuilder(this.renderManager);
            this.hypercubeGroup = this.hypercubeBuilder.build();

            // 5. Configurar interacciones
            this.interactionManager = new InteractionManager(this.renderManager, this.cubeBuilder);
            this.setupInteractions();

            // 6. Configurar controles UI
            this.setupUIControls();

            // 7. Configurar rotación con mouse
            this.setupMouseDrag();

            // 8. Suscribirse a cambios de estado
            this.stateManager.subscribe((newState, oldState) => {
                this.onStateChange(newState, oldState);
            });

            // 9. Iniciar loop de animación
            this.animate();

            this.uiManager.showSuccess('Aplicación cargada correctamente');

        } catch (error) {
            console.error('Error en inicialización:', error);
            this.uiManager.showError('Error al cargar la aplicación');
        }
    }

    /**
     * Carga datos del cubo
     */
    async loadData() {
        // Intentar cargar desde JSON externo
        // Si falla, usa datos por defecto
        try {
            await this.dataManager.loadFromJSON('/cube-data.json');
        } catch (error) {
            console.warn('No se pudo cargar JSON externo, usando datos por defecto');
            this.dataManager.loadDefaultData();
        }
    }

    /**
     * Configura las interacciones
     */
    setupInteractions() {
        // Click en vértice
        this.interactionManager.on('onVertexClick', (vertex) => {
            this.handleVertexClick(vertex);
        });

        // Click en arista
        this.interactionManager.on('onEdgeClick', (edge) => {
            this.handleEdgeClick(edge);
        });

        // Hover
        this.interactionManager.on('onHover', ({ vertex, edge, event }) => {
            this.handleHover(vertex, edge, event);
        });

    }

    /**
     * Maneja click en vértice
     * @param {THREE.Mesh} vertex - Vértice clicado
     */
    handleVertexClick(vertex) {
        const state = this.stateManager.getState();

        // Si es el mismo vértice, deseleccionar
        if (state.selectedVertex === vertex) {
            this.resetSelection();
            return;
        }

        // Resetear selección anterior
        this.resetSelection();

        // Seleccionar nuevo vértice
        vertex.material.color.setHex(0xffd93d);
        vertex.material.emissive.setHex(0xffaa00);
        vertex.material.emissiveIntensity = 0.5;

        // Obtener y resaltar conexiones
        const connections = vertex.userData.connections;
        const activeConnections = [];

        connections.forEach(conn => {
            const edge = this.cubeBuilder.getEdges().find(e => e.userData.id === conn.edgeId);
            if (edge) {
                edge.userData.visualLine.material.color.setHex(0x6bcf7f);
                edge.userData.visualLine.material.opacity = 1;
                edge.userData.isActive = true;
                activeConnections.push(edge);
            }
        });

        // Actualizar estado
        this.stateManager.setState({
            selectedVertex: vertex,
            activeConnections
        });

        // Actualizar UI
        this.uiManager.updateStatus(
            `<strong>Vértice:</strong> ${vertex.userData.name}<br>
            <strong>Conexiones:</strong> ${connections.length}<br>
            Haz clic en una conexión verde para ver datos`
        );
    }

    /**
     * Maneja click en arista
     * @param {THREE.Mesh} edge - Arista clicada
     */
    handleEdgeClick(edge) {
        const state = this.stateManager.getState();

        // Verificar que hay un vértice seleccionado
        if (!state.selectedVertex) {
            this.uiManager.showWarning('Primero selecciona un vértice');
            return;
        }

        // Verificar que la arista está conectada
        if (!state.activeConnections.includes(edge)) {
            this.uiManager.showWarning('Esta arista no está conectada al vértice seleccionado');
            return;
        }

        // Mostrar datos
        const fromVertex = this.dataManager.getVertexById(edge.userData.from);
        const toVertex = this.dataManager.getVertexById(edge.userData.to);

        this.uiManager.showDataPanel(
            `Datos de la Conexión`,
            {
                'Desde': fromVertex.name,
                'Hasta': toVertex.name,
                ...edge.userData.data
            }
        );

        // Resaltar arista seleccionada
        edge.userData.visualLine.material.color.setHex(0xffff00);
    }

    /**
     * Maneja hover sobre objetos
     * @param {THREE.Mesh|null} vertex - Vértice bajo el cursor
     * @param {THREE.Mesh|null} edge - Arista bajo el cursor
     * @param {MouseEvent} event - Evento del mouse
     */
    handleHover(vertex, edge, event) {
        const state = this.stateManager.getState();

        if (vertex) {
            this.uiManager.showTooltip(
                `<strong>${vertex.userData.name}</strong><br>Clic para seleccionar`,
                event.clientX,
                event.clientY
            );
            this.uiManager.setCursor('pointer');
        } else if (edge && state.activeConnections.includes(edge)) {
            this.uiManager.showTooltip(
                `<strong>Conexión</strong><br>Clic para ver datos`,
                event.clientX,
                event.clientY
            );
            this.uiManager.setCursor('pointer');
        } else {
            this.uiManager.hideTooltip();
            this.uiManager.setCursor('default');
        }
    }

    /**
     * Resetea la selección actual
     */
    resetSelection() {
        const state = this.stateManager.getState();

        // Resetear vértice
        if (state.selectedVertex) {
            state.selectedVertex.material.color.setHex(0xff6b6b);
            state.selectedVertex.material.emissive.setHex(0xff0000);
            state.selectedVertex.material.emissiveIntensity = 0.2;
        }

        // Resetear conexiones
        state.activeConnections.forEach(edge => {
            edge.userData.visualLine.material.color.setHex(0x4ecdc4);
            edge.userData.visualLine.material.opacity = 0.6;
            edge.userData.isActive = false;
        });

        // Actualizar estado
        this.stateManager.setState({
            selectedVertex: null,
            activeConnections: []
        });

        // Actualizar UI
        this.uiManager.hideDataPanel();
        this.uiManager.updateStatus('Estado: Esperando interacción...');
    }

    /**
     * Configura controles de UI (botones)
     */
    setupUIControls() {
        this.uiManager.setupButtonCallbacks({
            onReset: () => {
                this.resetSelection();
                this.uiManager.showNotification('Selección reseteada');
            },
            
            onToggleHypercube: () => {
                const state = this.stateManager.getState();
                const newState = !state.showHypercube;
                this.hypercubeGroup.visible = newState;
                this.stateManager.setState({ showHypercube: newState });
                this.uiManager.showNotification(
                    newState ? 'Hipercubo visible' : 'Hipercubo oculto'
                );
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

    /**
     * Configura rotación con mouse (drag)
     */
    setupMouseDrag() {
        const canvas = this.renderManager.getRenderer().domElement;

        canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.previousMouse = { x: e.clientX, y: e.clientY };
        });

        canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.previousMouse.x;
                const deltaY = e.clientY - this.previousMouse.y;

                this.cubeGroup.rotation.y += deltaX * 0.01;
                this.cubeGroup.rotation.x += deltaY * 0.01;

                this.previousMouse = { x: e.clientX, y: e.clientY };
            }
        });

        canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });

    }

    /**
     * Callback cuando cambia el estado
     * @param {Object} newState - Nuevo estado
     * @param {Object} oldState - Estado anterior
     */
    onStateChange(newState, oldState) {
        // Aquí puedes añadir lógica que reaccione a cambios de estado
        // Por ejemplo, actualizar botones, sincronizar UI, etc.
        
        if (newState.autoRotate !== oldState.autoRotate) {
            this.uiManager.setButtonState('autoRotate', newState.autoRotate);
        }
    }

    /**
     * Loop de animación
     */
    animate() {
        requestAnimationFrame(() => this.animate());

        const state = this.stateManager.getState();

        // Auto-rotación
        if (state.autoRotate) {
            this.cubeGroup.rotation.y += 0.005;
            this.hypercubeGroup.rotation.y += 0.003;
            this.hypercubeGroup.rotation.x += 0.002;
        }

        // Animación de conexiones activas (pulsación)
        const time = Date.now() * 0.001;
        state.activeConnections.forEach(edge => {
            const pulse = Math.sin(time * 3) * 0.3 + 0.7;
            edge.userData.visualLine.material.opacity = pulse;
        });

        // Renderizar
        this.renderManager.render();
    }

    /**
     * Limpia recursos (útil para HMR en desarrollo)
     */
    dispose() {
        if (this.cubeBuilder) this.cubeBuilder.dispose();
        if (this.hypercubeBuilder) this.hypercubeBuilder.dispose();
        if (this.interactionManager) this.interactionManager.dispose();
        if (this.renderManager) this.renderManager.dispose();
        if (this.uiManager) this.uiManager.dispose();
        
    }
}
