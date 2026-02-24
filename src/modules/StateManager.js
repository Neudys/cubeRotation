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

    setState(newState) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...newState };
        this.addToHistory(oldState, this.state);
        this.notifyListeners(this.state, oldState);
    }

    getState() {
        return { ...this.state };
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notifyListeners(newState, oldState) {
        this.listeners.forEach(listener => {
            try {
                listener(newState, oldState);
            } catch (error) {
                console.error('Error en listener:', error);
            }
        });
    }

    addToHistory(oldState, newState) {
        this.history.push({
            timestamp: Date.now(),
            from: oldState,
            to: newState
        });
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }

    getHistory() { return [...this.history]; }

    reset() {
        this.setState({
            selectedVertex: null,
            activeConnections: [],
            hoveredObject: null,
            isDragging: false
        });
    }

    hasSelectedVertex() { return this.state.selectedVertex !== null; }
    hasActiveConnections() { return this.state.activeConnections.length > 0; }

    getDebugInfo() {
        return {
            state: this.state,
            listeners: this.listeners.length,
            history: this.history.length
        };
    }
}