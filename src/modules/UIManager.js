/**
 * UIManager - Gestiona la interfaz de usuario
 * Responsabilidad: Actualización del DOM y feedback visual
 */
export class UIManager {
    constructor() {
        this.elements = {
            status: document.getElementById('status'),
            dataDisplay: document.getElementById('data-display'),
            tooltip: document.getElementById('tooltip'),
            resetBtn: document.getElementById('reset-btn'),
            toggleHypercube: document.getElementById('toggle-hypercube'),
            autoRotate: document.getElementById('auto-rotate')
        };

        this.validateElements();
    }

    /**
     * Valida que todos los elementos existan
     */
    validateElements() {
        Object.entries(this.elements).forEach(([key, element]) => {
            if (!element) {
                console.warn(`Elemento UI no encontrado: ${key}`);
            }
        });
    }

    /**
     * Actualiza el mensaje de estado
     * @param {string} message - Mensaje HTML a mostrar
     */
    updateStatus(message) {
        if (this.elements.status) {
            this.elements.status.innerHTML = message;
        }
    }

    /**
     * Muestra el panel de datos
     * @param {string} title - Título del panel
     * @param {Object} data - Datos a mostrar
     */
    showDataPanel(title, data) {
        if (!this.elements.dataDisplay) return;

        let html = `<h3>${title}</h3>`;
        
        Object.entries(data).forEach(([key, value]) => {
            const formattedKey = this.formatKey(key);
            html += `<div class="data-item"><strong>${formattedKey}:</strong> ${value}</div>`;
        });
        
        this.elements.dataDisplay.innerHTML = html;
        this.elements.dataDisplay.style.display = 'block';
    }

    /**
     * Oculta el panel de datos
     */
    hideDataPanel() {
        if (this.elements.dataDisplay) {
            this.elements.dataDisplay.style.display = 'none';
        }
    }

    /**
     * Muestra el tooltip
     * @param {string} content - Contenido HTML del tooltip
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     */
    showTooltip(content, x, y) {
        if (!this.elements.tooltip) return;

        this.elements.tooltip.innerHTML = content;
        this.elements.tooltip.style.display = 'block';
        this.elements.tooltip.style.left = (x + 15) + 'px';
        this.elements.tooltip.style.top = (y + 15) + 'px';
    }

    /**
     * Oculta el tooltip
     */
    hideTooltip() {
        if (this.elements.tooltip) {
            this.elements.tooltip.style.display = 'none';
        }
    }

    /**
     * Actualiza el cursor
     * @param {string} cursor - Tipo de cursor CSS
     */
    setCursor(cursor = 'default') {
        document.body.style.cursor = cursor;
    }

    /**
     * Formatea una clave para mostrarla
     * @param {string} key - Clave a formatear
     * @returns {string} Clave formateada
     */
    formatKey(key) {
        return key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Registra callbacks de botones
     * @param {Object} callbacks - Objeto con callbacks
     */
    setupButtonCallbacks(callbacks) {
        if (this.elements.resetBtn && callbacks.onReset) {
            this.elements.resetBtn.addEventListener('click', callbacks.onReset);
        }

        if (this.elements.toggleHypercube && callbacks.onToggleHypercube) {
            this.elements.toggleHypercube.addEventListener('click', callbacks.onToggleHypercube);
        }

        if (this.elements.autoRotate && callbacks.onAutoRotate) {
            this.elements.autoRotate.addEventListener('click', callbacks.onAutoRotate);
        }

    }

    /**
     * Muestra mensaje de error
     * @param {string} message - Mensaje de error
     */
    showError(message) {
        this.updateStatus(`<strong style="color: #e74c3c;"> ${message}</strong>`);
    }

    /**
     * Muestra mensaje de éxito
     * @param {string} message - Mensaje de éxito
     */
    showSuccess(message) {
        this.updateStatus(`<strong style="color: #27ae60;"> ${message}</strong>`);
    }

    /**
     * Muestra mensaje de advertencia
     * @param {string} message - Mensaje de advertencia
     */
    showWarning(message) {
        this.updateStatus(`<strong style="color: #f39c12;"> ${message}</strong>`);
    }

    /**
     * Actualiza el estado de un botón
     * @param {string} buttonId - ID del botón
     * @param {boolean} active - Si está activo
     */
    setButtonState(buttonId, active) {
        const button = this.elements[buttonId];
        if (button) {
            button.style.backgroundColor = active ? '#1e3c72' : '#2a5298';
        }
    }

    /**
     * Crea una notificación temporal
     * @param {string} message - Mensaje
     * @param {number} duration - Duración en ms
     */
    showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    /**
     * Limpia recursos
     */
    dispose() {
        this.hideDataPanel();
        this.hideTooltip();
    }
}
