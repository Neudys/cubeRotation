import * as THREE from 'three';

export class InteractionManager {
    constructor(renderManager, cubeBuilder) {
        this.renderManager = renderManager;
        this.cubeBuilder = cubeBuilder;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.callbacks = {
            onVertexClick: null,
            onEdgeClick: null,
            onHover: null,
            onNoSelection: null
        };

        // Guardamos referencia bound para poder removerlos luego
        this._handleClick = (e) => this.handleClick(e);
        this._handleMouseMove = (e) => this.handleMouseMove(e);
        this._handleMouseDown = (e) => { this._mouseDownPos = { x: e.clientX, y: e.clientY }; };

        this.setupEventListeners();
    }

    setupEventListeners() {
        const canvas = this.renderManager.getRenderer().domElement;
        canvas.addEventListener('mousedown', this._handleMouseDown);
        canvas.addEventListener('click', this._handleClick);
        canvas.addEventListener('mousemove', this._handleMouseMove);
    }

    handleClick(event) {
        // Ignore clicks that followed a drag (orbit rotation)
        if (this._mouseDownPos) {
            const dx = event.clientX - this._mouseDownPos.x;
            const dy = event.clientY - this._mouseDownPos.y;
            if (Math.sqrt(dx * dx + dy * dy) > 5) return;
        }
        this.updateMouse(event);
        this.raycaster.setFromCamera(this.mouse, this.renderManager.getCamera());

        const vertexIntersects = this.raycaster.intersectObjects(this.cubeBuilder.getVertices());
        if (vertexIntersects.length > 0) {
            const vertex = vertexIntersects[0].object;
            if (this.callbacks.onVertexClick) this.callbacks.onVertexClick(vertex);
            return;
        }

        const edgeIntersects = this.raycaster.intersectObjects(this.cubeBuilder.getEdges());
        if (edgeIntersects.length > 0) {
            const edge = edgeIntersects[0].object;
            if (this.callbacks.onEdgeClick) this.callbacks.onEdgeClick(edge);
            return;
        }

        if (this.callbacks.onNoSelection) this.callbacks.onNoSelection();
    }

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

    updateMouse(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    on(event, callback) {
        if (Object.prototype.hasOwnProperty.call(this.callbacks, event)) {
            this.callbacks[event] = callback;
        } else {
            console.warn(`Evento desconocido: ${event}`);
        }
    }

    dispose() {
        const canvas = this.renderManager.getRenderer().domElement;
        canvas.removeEventListener('mousedown', this._handleMouseDown);
        canvas.removeEventListener('click', this._handleClick);
        canvas.removeEventListener('mousemove', this._handleMouseMove);
    }
}