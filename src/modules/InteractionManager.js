import * as THREE from 'three';

/**
 * InteractionManager - Gestiona interacciones del usuario (clicks, hover)
 * Responsabilidad: Raycasting y detección de eventos
 */
export class InteractionManager {
    constructor(renderManager, cubeBuilder) {
        this.renderManager = renderManager;
        this.cubeBuilder = cubeBuilder;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Callbacks
        this.callbacks = {
            onVertexClick: null,
            onEdgeClick: null,
            onHover: null,
            onNoSelection: null
        };

        this.setupEventListeners();
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        const canvas = this.renderManager.getRenderer().domElement;

        canvas.addEventListener('click', (e) => this.handleClick(e));
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));

    }

    /**
     * Maneja eventos de click
     * @param {MouseEvent} event
     */
    handleClick(event) {
        this.updateMouse(event);
        this.raycaster.setFromCamera(this.mouse, this.renderManager.getCamera());

        // Verificar vértices
        const vertexIntersects = this.raycaster.intersectObjects(this.cubeBuilder.getVertices());
        if (vertexIntersects.length > 0) {
            const vertex = vertexIntersects[0].object;
            if (this.callbacks.onVertexClick) {
                this.callbacks.onVertexClick(vertex);
            }
            return;
        }

        // Verificar aristas
        const edgeIntersects = this.raycaster.intersectObjects(this.cubeBuilder.getEdges());
        if (edgeIntersects.length > 0) {
            const edge = edgeIntersects[0].object;
            if (this.callbacks.onEdgeClick) {
                this.callbacks.onEdgeClick(edge);
            }
            return;
        }

        // Sin selección
        if (this.callbacks.onNoSelection) {
            this.callbacks.onNoSelection();
        }
    }

    /**
     * Maneja movimiento del mouse (hover)
     * @param {MouseEvent} event
     */
    handleMouseMove(event) {
        this.updateMouse(event);
        this.raycaster.setFromCamera(this.mouse, this.renderManager.getCamera());

        const vertexIntersects = this.raycaster.intersectObjects(this.cubeBuilder.getVertices());
        const edgeIntersects = this.raycaster.intersectObjects(this.cubeBuilder.getEdges());

        if (this.callbacks.onHover) {
            this.callbacks.onHover({
                vertex: vertexIntersects[0]?.object || null,
                edge: edgeIntersects[0]?.object || null,
                event
            });
        }
    }

    /**
     * Actualiza posición del mouse normalizada
     * @param {MouseEvent} event
     */
    updateMouse(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    /**
     * Registra un callback para un evento
     * @param {string} event - Nombre del evento
     * @param {Function} callback - Función callback
     */
    on(event, callback) {
        if (this.callbacks.hasOwnProperty(event)) {
            this.callbacks[event] = callback;
        } else {
            console.warn(`Evento desconocido: ${event}`);
        }
    }

    /**
     * Limpia event listeners
     */
    dispose() {
        const canvas = this.renderManager.getRenderer().domElement;
        canvas.removeEventListener('click', this.handleClick);
        canvas.removeEventListener('mousemove', this.handleMouseMove);
    }
}
