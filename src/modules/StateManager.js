/**
 * StateManager - Gestiona el estado de la aplicación
 * Responsabilidad: Estado centralizado con patrón Observer
 */
export class StateManager {
    constructor() {
        this.state = {
            selectedVertex: null,
            activeConnections: [],
            autoRotate: false,
            showHypercube: true,
            hoveredObject: null,
            isDragging: false
        };

        this.listeners = [];
        this.history = [];
        this.maxHistory = 50;
    }

    /**
     * Actualiza el estado
     * @param {Object} newState - Nuevo estado parcial
     */
    setState(newState) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        // Guardar en historial
        this.addToHistory(oldState, this.state);
        
        // Notificar listeners
        this.notifyListeners(this.state, oldState);

        if (import.meta.env.DEV) {
        }
    }

    /**
     * Obtiene el estado actual
     * @returns {Object} Estado actual
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Suscribe un listener a cambios de estado
     * @param {Function} listener - Función que se llama cuando cambia el estado
     * @returns {Function} Función para desuscribirse
     */
    subscribe(listener) {
        this.listeners.push(listener);
        
        // Retornar función unsubscribe
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Notifica a todos los listeners
     * @param {Object} newState - Nuevo estado
     * @param {Object} oldState - Estado anterior
     */
    notifyListeners(newState, oldState) {
        this.listeners.forEach(listener => {
            try {
                listener(newState, oldState);
            } catch (error) {
                console.error('❌ Error en listener:', error);
            }
        });
    }

    /**
     * Añade entrada al historial
     * @param {Object} oldState - Estado anterior
     * @param {Object} newState - Nuevo estado
     */
    addToHistory(oldState, newState) {
        this.history.push({
            timestamp: Date.now(),
            from: oldState,
            to: newState
        });

        // Limitar tamaño del historial
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }

    /**
     * Obtiene el historial de cambios
     * @returns {Array} Historial
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * Resetea el estado a valores iniciales
     */
    reset() {
        this.setState({
            selectedVertex: null,
            activeConnections: [],
            hoveredObject: null,
            isDragging: false
        });
    }

    /**
     * Verifica si hay un vértice seleccionado
     * @returns {boolean}
     */
    hasSelectedVertex() {
        return this.state.selectedVertex !== null;
    }

    /**
     * Verifica si hay conexiones activas
     * @returns {boolean}
     */
    hasActiveConnections() {
        return this.state.activeConnections.length > 0;
    }

    /**
     * Obtiene información del estado para debugging
     * @returns {Object}
     */
    getDebugInfo() {
        return {
            state: this.state,
            listeners: this.listeners.length,
            history: this.history.length
        };
    }
}
