import './style.css';
import { App } from './modules/App.js';

window.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new App();

        if (import.meta.env.DEV) {
            window.__app = app;
        }
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
    }
});