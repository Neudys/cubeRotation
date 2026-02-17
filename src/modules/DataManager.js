/**
 * DataManager - Gestiona la carga y acceso a datos del cubo
 * Responsabilidad: Única fuente de verdad para los datos
 */
export class DataManager {
    constructor() {
        this.data = null;
    }

    async loadFromJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            this.data = await response.json();
            if (!this.data?.cube?.edges?.[0]?.vessel) {
                console.warn('JSON externo sin estructura válida, usando datos por defecto');
                return this.loadDefaultData();
            }
            return this.data;
        } catch (error) {
            console.warn('Error cargando JSON, usando datos por defecto:', error);
            return this.loadDefaultData();
        }
    }

    loadInline(data) {
        this.data = data;
        return this.data;
    }

    loadDefaultData() {
        this.data = {
            cube: {
                vertices: [
                    {
                        id: 0,
                        name: "Shou Yang Ming",
                        position: [-1, 1, -1],
                        symbol: "♂",
                        number: "33",
                        data: { canal: "Intestino Grueso", elemento: "Metal", numero: "33", descripcion: "Meridiano Mano Yang Brillante" }
                    },
                    {
                        id: 1,
                        name: "Zu Yang Ming",
                        position: [1, 1, -1],
                        symbol: "II",
                        number: "64",
                        data: { canal: "Estómago", elemento: "Tierra", numero: "64", descripcion: "Meridiano Pie Yang Brillante" }
                    },
                    {
                        id: 2,
                        name: "Shou Shao Yin",
                        position: [-1, 1, 1],
                        symbol: "⊙",
                        number: "5",
                        data: { canal: "Corazón", elemento: "Fuego", numero: "5", descripcion: "Meridiano Mano Menor Yin" }
                    },
                    {
                        id: 3,
                        name: "Shou Tai Yin",
                        position: [1, 1, 1],
                        symbol: "♐",
                        number: "9",
                        data: { canal: "Pulmón", elemento: "Metal", numero: "9", descripcion: "Meridiano Mano Mayor Yin" }
                    },
                    {
                        id: 4,
                        name: "Zu Jue Yin",
                        position: [-1, -1, -1],
                        symbol: "♓",
                        number: "40-4",
                        data: { canal: "Hígado", elemento: "Madera", numero: "40-4", descripcion: "Meridiano Pie Jue Yin" }
                    },
                    {
                        id: 5,
                        name: "Shou Shao Yang",
                        position: [1, -1, -1],
                        symbol: "♑",
                        number: "27-9",
                        data: { canal: "Triple Calentador", elemento: "Fuego", numero: "27-9", descripcion: "Meridiano Mano Menor Yang" }
                    },
                    {
                        id: 6,
                        name: "Zu Shao Yin",
                        position: [-1, -1, 1],
                        symbol: "♏",
                        number: "55-10-1",
                        data: { canal: "Riñón", elemento: "Agua", numero: "55-10-1", descripcion: "Meridiano Pie Menor Yin" }
                    },
                    {
                        id: 7,
                        name: "Shou Jue Yin",
                        position: [1, -1, 1],
                        symbol: "⊕",
                        number: "8",
                        data: { canal: "Pericardio", elemento: "Fuego", numero: "8", descripcion: "Meridiano Mano Jue Yin" }
                    }
                ],
                edges: [
                    // Aristas cara superior
                    {
                        id: 0, from: 0, to: 1,
                        vessel: "Yang Wei Mai", trigram: "☰△", number: "4",
                        data: { vaso: "Yang Wei Mai", trigrama: "☰△", numero: "4", funcion: "Vincula todos los meridianos Yang" }
                    },
                    {
                        id: 1, from: 0, to: 2,
                        vessel: "Zu Tai Yin", trigram: "≡▽", number: "45-9",
                        data: { vaso: "Zu Tai Yin", trigrama: "≡▽", numero: "45-9", funcion: "Meridiano Bazo-Páncreas" }
                    },
                    {
                        id: 2, from: 1, to: 3,
                        vessel: "Shou Tai Yang", trigram: "≡☵", number: "24-6",
                        data: { vaso: "Shou Tai Yang", trigrama: "24-6", numero: "24-6", funcion: "Meridiano Intestino Delgado" }
                    },
                    {
                        id: 3, from: 2, to: 3,
                        vessel: "Du Mai", trigram: "≡△", number: "5",
                        data: { vaso: "Du Mai", trigrama: "≡△", numero: "5", funcion: "Vaso Gobernador — rige todos los Yang" }
                    },
                    // Aristas cara inferior
                    {
                        id: 4, from: 4, to: 5,
                        vessel: "Zu Tai Yang", trigram: "≡▽", number: "72-9",
                        data: { vaso: "Zu Tai Yang", trigrama: "72-9", numero: "72-9", funcion: "Meridiano Vejiga Urinaria" }
                    },
                    {
                        id: 5, from: 4, to: 6,
                        vessel: "Yin Wei Mai", trigram: "≡≡▽", number: "6",
                        data: { vaso: "Yin Wei Mai", trigrama: "≡≡▽", numero: "6", funcion: "Vincula todos los meridianos Yin" }
                    },
                    {
                        id: 6, from: 5, to: 7,
                        vessel: "Zu Shao Yang", trigram: "≈≈", number: "88-16-7",
                        data: { vaso: "Zu Shao Yang", trigrama: "88-16-7", numero: "88-16-7", funcion: "Meridiano Vesícula Biliar" }
                    },
                    {
                        id: 7, from: 6, to: 7,
                        vessel: "Ren Mai", trigram: "≡≡", number: "8",
                        data: { vaso: "Ren Mai", trigrama: "≡≡", numero: "8", funcion: "Vaso Concepción — rige todos los Yin" }
                    },
                    // Aristas verticales
                    {
                        id: 8, from: 0, to: 4,
                        vessel: "Yang Qiao Mai", trigram: "▽☿", number: "7",
                        data: { vaso: "Yang Qiao Mai", trigrama: "▽☿", numero: "7", funcion: "Vaso Yang del Talón" }
                    },
                    {
                        id: 9, from: 1, to: 5,
                        vessel: "Chong Mai", trigram: "♄△≡", number: "2",
                        data: { vaso: "Chong Mai", trigrama: "♄△≡", numero: "2", funcion: "Vaso Penetrante" }
                    },
                    {
                        id: 10, from: 2, to: 6,
                        vessel: "Dai Mai", trigram: "♃▽", number: "3",
                        data: { vaso: "Dai Mai", trigrama: "♃▽", numero: "3", funcion: "Vaso Cinturón" }
                    },
                    {
                        id: 11, from: 3, to: 7,
                        vessel: "Yin Qiao Mai", trigram: "⊕△≡", number: "9",
                        data: { vaso: "Yin Qiao Mai", trigrama: "⊕△≡", numero: "9", funcion: "Vaso Yin del Talón" }
                    }
                ]
            }
        };
        return this.data;
    }

    getVertexConnections(vertexId) {
        if (!this.data) return [];
        return this.data.cube.edges
            .filter(edge => edge.from === vertexId || edge.to === vertexId)
            .map(edge => ({
                edgeId: edge.id,
                connectedTo: edge.from === vertexId ? edge.to : edge.from,
                data: edge.data
            }));
    }

    getVertexById(id) {
        return this.data?.cube.vertices.find(v => v.id === id);
    }

    getEdgeById(id) {
        return this.data?.cube.edges.find(e => e.id === id);
    }

    getAllVertices() {
        return this.data?.cube.vertices || [];
    }

    getAllEdges() {
        return this.data?.cube.edges || [];
    }
}