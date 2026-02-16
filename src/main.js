import './style.css';
import { App } from './modules/App.js';

// ========================================
// PUNTO DE ENTRADA - VITE + VANILLA JS
// ========================================

/**
 * Inicialización de la aplicación
 * Este es el único archivo que importa index.html
 */
window.addEventListener('DOMContentLoaded', () => {
    
    try {
        const app = new App();
        
        // Exponer app globalmente para debugging (opcional)
        if (import.meta.env.DEV) {
            window.__app = app;
        }
    } catch (error) {
        console.error('❌ Error al inicializar la aplicación:', error);
    }
});
