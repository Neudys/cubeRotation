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
        this.applyUIChanges();
    }

    // ─── Boot-time UI adjustments ────────────────────────────────────────────

    applyUIChanges() {
        // 1. Cambiar título
        const titleEl =
            document.querySelector('h1') ||
            document.querySelector('.app-title') ||
            document.querySelector('[data-title]') ||
            document.getElementById('app-title');
        if (titleEl) titleEl.textContent = 'Cubo: Fuerzas y Meridianos';

        // Also try updating <title> tag in head
        if (document.title) document.title = 'Cubo: Fuerzas y Meridianos';

        // 2. Ocultar bloque de instrucciones
        const instrEl =
            document.getElementById('instructions') ||
            document.querySelector('.instructions') ||
            document.querySelector('[data-section="instructions"]');
        if (instrEl) instrEl.style.display = 'none';

        // 3. Ocultar leyenda lateral derecha
        const legendEl =
            document.getElementById('legend') ||
            document.querySelector('.legend') ||
            document.querySelector('[data-section="legend"]') ||
            document.querySelector('.legend-panel');
        if (legendEl) legendEl.style.display = 'none';
    }

    validateElements() {
        Object.entries(this.elements).forEach(([key, element]) => {
            if (!element) {
                console.warn(`Elemento UI no encontrado: ${key}`);
            }
        });
    }

    updateStatus(message) {
        if (this.elements.status) {
            this.elements.status.innerHTML = message;
        }
    }

    // ─── Single vertex card ──────────────────────────────────────────────────

    showVertexCard(userData) {
        if (!this.elements.dataDisplay) return;

        const d = userData.data || {};
        const html = `
            <div class="panel-block panel-vertex">
                <div class="panel-block-header">
                    <span class="panel-planet">${userData.planet || ''}</span>
                    <div>
                        <div class="panel-title">${userData.name || ''}</div>
                        <div class="panel-subtitle">${userData.planetName || ''}</div>
                    </div>
                </div>
                <div class="panel-rows">
                    ${userData.number  ? `<div class="panel-row"><span class="panel-label">Número</span><span class="panel-value">${userData.number}</span></div>` : ''}
                    ${userData.trigram ? `<div class="panel-row"><span class="panel-label">Trigrama</span><span class="panel-value">${userData.trigram} ${userData.trigramName || ''}</span></div>` : ''}
                    ${userData.vessel  ? `<div class="panel-row"><span class="panel-label">Vaso</span><span class="panel-value">${userData.vessel}</span></div>` : ''}
                    ${userData.element ? `<div class="panel-row"><span class="panel-label">Elemento</span><span class="panel-value">${userData.element}</span></div>` : ''}
                    ${Object.entries(d).map(([k, v]) =>
                        `<div class="panel-row"><span class="panel-label">${this.formatKey(k)}</span><span class="panel-value">${v}</span></div>`
                    ).join('')}
                </div>
            </div>`;

        this.elements.dataDisplay.innerHTML = html;
        this.elements.dataDisplay.style.display = 'block';
        this._injectPanelStyles();
    }

    // ─── Connection panel: vertex1 + edge + vertex2 ──────────────────────────

    showConnectionPanel(v1Data, edgeData, v2Data) {
        if (!this.elements.dataDisplay) return;

        const html = `
            ${this._buildVertexBlock(v1Data, '1')}
            ${this._buildEdgeBlock(edgeData)}
            ${this._buildVertexBlock(v2Data, '2')}
        `;

        this.elements.dataDisplay.innerHTML = html;
        this.elements.dataDisplay.style.display = 'block';
        this._injectPanelStyles();
    }

    _buildVertexBlock(userData, label) {
        const d = userData.data || {};
        return `
            <div class="panel-block panel-vertex">
                <div class="panel-block-tag">Vértice ${label}</div>
                <div class="panel-block-header">
                    <span class="panel-planet">${userData.planet || ''}</span>
                    <div>
                        <div class="panel-title">${userData.name || ''}</div>
                        <div class="panel-subtitle">${userData.planetName || ''}</div>
                    </div>
                </div>
                <div class="panel-rows">
                    ${userData.number  ? `<div class="panel-row"><span class="panel-label">Número</span><span class="panel-value">${userData.number}</span></div>` : ''}
                    ${userData.trigram ? `<div class="panel-row"><span class="panel-label">Trigrama</span><span class="panel-value">${userData.trigram} ${userData.trigramName || ''}</span></div>` : ''}
                    ${userData.vessel  ? `<div class="panel-row"><span class="panel-label">Vaso</span><span class="panel-value">${userData.vessel}</span></div>` : ''}
                    ${userData.element ? `<div class="panel-row"><span class="panel-label">Elemento</span><span class="panel-value">${userData.element}</span></div>` : ''}
                </div>
            </div>`;
    }

    _buildEdgeBlock(edgeData) {
        const d = edgeData.data || {};
        return `
            <div class="panel-block panel-edge">
                <div class="panel-block-tag">Conexión</div>
                <div class="panel-block-header">
                    <span class="panel-sign">${edgeData.sign || ''}</span>
                    <div>
                        <div class="panel-title">${edgeData.vessel || edgeData.signName || 'Vaso'}</div>
                        <div class="panel-subtitle">${edgeData.signName || ''}</div>
                    </div>
                </div>
                <div class="panel-rows">
                    ${edgeData.number  ? `<div class="panel-row"><span class="panel-label">Secuencia</span><span class="panel-value">${edgeData.number}</span></div>` : ''}
                    ${edgeData.trigram ? `<div class="panel-row"><span class="panel-label">Trigrama</span><span class="panel-value">${edgeData.trigram}</span></div>` : ''}
                    ${Object.entries(d).map(([k, v]) =>
                        `<div class="panel-row"><span class="panel-label">${this.formatKey(k)}</span><span class="panel-value">${v}</span></div>`
                    ).join('')}
                </div>
            </div>`;
    }

    // ─── Legacy showDataPanel (fallback) ────────────────────────────────────

    showDataPanel(title, data) {
        if (!this.elements.dataDisplay) return;

        let html = `<div class="panel-block"><div class="panel-title">${title}</div><div class="panel-rows">`;
        Object.entries(data).forEach(([key, value]) => {
            html += `<div class="panel-row"><span class="panel-label">${this.formatKey(key)}</span><span class="panel-value">${value}</span></div>`;
        });
        html += `</div></div>`;
        this.elements.dataDisplay.innerHTML = html;
        this.elements.dataDisplay.style.display = 'block';
        this._injectPanelStyles();
    }

    hideDataPanel() {
        if (this.elements.dataDisplay) {
            this.elements.dataDisplay.style.display = 'none';
        }
    }

    // ─── Inject panel CSS once ───────────────────────────────────────────────

    _injectPanelStyles() {
        if (document.getElementById('ui-panel-styles')) return;

        const style = document.createElement('style');
        style.id = 'ui-panel-styles';
        style.textContent = `
            .panel-block {
                background: rgba(255,255,255,0.97);
                border-radius: 10px;
                padding: 12px 14px;
                margin-bottom: 10px;
                border-left: 4px solid #9b3060;
                box-shadow: 0 2px 8px rgba(0,0,0,0.10);
                font-family: Georgia, serif;
            }
            .panel-block.panel-edge {
                border-left-color: #1a3a6a;
            }
            .panel-block-tag {
                font-size: 10px;
                font-weight: 900;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                color: #9b3060;
                margin-bottom: 6px;
                opacity: 0.75;
            }
            .panel-block.panel-edge .panel-block-tag {
                color: #1a3a6a;
            }
            .panel-block-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
            }
            .panel-planet, .panel-sign {
                font-size: 28px;
                line-height: 1;
                min-width: 36px;
                text-align: center;
            }
            .panel-title {
                font-size: 14px;
                font-weight: 900;
                color: #0a1520;
                line-height: 1.2;
            }
            .panel-subtitle {
                font-size: 11px;
                color: #556677;
                margin-top: 2px;
            }
            .panel-rows {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .panel-row {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                font-size: 12px;
                border-bottom: 1px solid rgba(0,0,0,0.06);
                padding: 2px 0;
            }
            .panel-label {
                color: #667788;
                font-weight: 600;
                flex-shrink: 0;
                margin-right: 8px;
            }
            .panel-value {
                color: #0a1520;
                text-align: right;
            }
        `;
        document.head.appendChild(style);
    }

    // ─── Tooltip ─────────────────────────────────────────────────────────────

    showTooltip(content, x, y) {
        if (!this.elements.tooltip) return;
        this.elements.tooltip.innerHTML = content;
        this.elements.tooltip.style.display = 'block';
        this.elements.tooltip.style.left = (x + 15) + 'px';
        this.elements.tooltip.style.top = (y + 15) + 'px';
    }

    hideTooltip() {
        if (this.elements.tooltip) {
            this.elements.tooltip.style.display = 'none';
        }
    }

    setCursor(cursor = 'default') {
        document.body.style.cursor = cursor;
    }

    // ─── Button callbacks ─────────────────────────────────────────────────────

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

    // ─── Notifications ────────────────────────────────────────────────────────

    showError(message) {
        this.updateStatus(`<strong style="color:#e74c3c;">${message}</strong>`);
    }

    showSuccess(message) {
        this.updateStatus(`<strong style="color:#27ae60;">${message}</strong>`);
    }

    showWarning(message) {
        this.updateStatus(`<strong style="color:#c0392b;">${message}</strong>`);
    }

    setButtonState(buttonId, active) {
        const button = this.elements[buttonId];
        if (button) {
            button.style.backgroundColor = active ? '#1e3c72' : '#2a5298';
        }
    }

    showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: rgba(10,21,32,0.92);
            color: white;
            padding: 12px 18px;
            border-radius: 8px;
            z-index: 10000;
            font-family: Georgia, serif;
            font-size: 13px;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    formatKey(key) {
        return key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    dispose() {
        this.hideDataPanel();
        this.hideTooltip();
    }
}