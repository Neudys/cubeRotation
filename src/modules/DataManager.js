/**
 * DataManager - Gestiona la carga y acceso a datos del cubo
 * Responsabilidad: Única fuente de verdad para los datos
 */
export class DataManager {
    constructor() {
        this.data = null;
    }

    /**
     * Carga datos desde un archivo JSON externo
     * @param {string} url - URL del archivo JSON
     * @returns {Promise<Object>} Datos del cubo
     */
    async loadFromJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
            return this.data;
        } catch (error) {
            console.warn('Error cargando JSON, usando datos por defecto:', error);
            return this.loadDefaultData();
        }
    }

    /**
     * Carga datos inline (para cuando ya tienes el objeto)
     * @param {Object} data - Objeto con datos del cubo
     */
    loadInline(data) {
        this.data = data;
        return this.data;
    }

    /**
     * Datos por defecto (fallback)
     * @returns {Object} Estructura de datos del cubo
     */
    loadDefaultData() {
        this.data = {
            cube: {
                vertices: [
                    { 
                        id: 0, 
                        name: "Vértice A", 
                        position: [-1, -1, -1], 
                        data: { 
                            tipo: "Esquina inferior frontal izquierda",
                            conexiones: 3, 
                            valor: 42,
                            categoria: "Estructural",
                            peso: 125
                        }
                    },
                    { 
                        id: 1, 
                        name: "Vértice B", 
                        position: [1, -1, -1], 
                        data: { 
                            tipo: "Esquina inferior frontal derecha",
                            conexiones: 3, 
                            valor: 87,
                            categoria: "Estructural",
                            peso: 130
                        }
                    },
                    { 
                        id: 2, 
                        name: "Vértice C", 
                        position: [1, 1, -1], 
                        data: { 
                            tipo: "Esquina superior frontal derecha",
                            conexiones: 3, 
                            valor: 156,
                            categoria: "Crítico",
                            peso: 142
                        }
                    },
                    { 
                        id: 3, 
                        name: "Vértice D", 
                        position: [-1, 1, -1], 
                        data: { 
                            tipo: "Esquina superior frontal izquierda",
                            conexiones: 3, 
                            valor: 234,
                            categoria: "Crítico",
                            peso: 138
                        }
                    },
                    { 
                        id: 4, 
                        name: "Vértice E", 
                        position: [-1, -1, 1], 
                        data: { 
                            tipo: "Esquina inferior trasera izquierda",
                            conexiones: 3, 
                            valor: 321,
                            categoria: "Estructural",
                            peso: 128
                        }
                    },
                    { 
                        id: 5, 
                        name: "Vértice F", 
                        position: [1, -1, 1], 
                        data: { 
                            tipo: "Esquina inferior trasera derecha",
                            conexiones: 3, 
                            valor: 412,
                            categoria: "Estructural",
                            peso: 135
                        }
                    },
                    { 
                        id: 6, 
                        name: "Vértice G", 
                        position: [1, 1, 1], 
                        data: { 
                            tipo: "Esquina superior trasera derecha",
                            conexiones: 3, 
                            valor: 578,
                            categoria: "Crítico",
                            peso: 145
                        }
                    },
                    { 
                        id: 7, 
                        name: "Vértice H", 
                        position: [-1, 1, 1], 
                        data: { 
                            tipo: "Esquina superior trasera izquierda",
                            conexiones: 3, 
                            valor: 689,
                            categoria: "Crítico",
                            peso: 140
                        }
                    }
                ],
                edges: [
                    { id: 0, from: 0, to: 1, data: { longitud: 2.0, resistencia: "Alta", material: "Acero inoxidable" }},
                    { id: 1, from: 1, to: 2, data: { longitud: 2.0, resistencia: "Alta", material: "Acero inoxidable" }},
                    { id: 2, from: 2, to: 3, data: { longitud: 2.0, resistencia: "Media", material: "Aluminio reforzado" }},
                    { id: 3, from: 3, to: 0, data: { longitud: 2.0, resistencia: "Alta", material: "Acero inoxidable" }},
                    { id: 4, from: 4, to: 5, data: { longitud: 2.0, resistencia: "Media", material: "Aluminio reforzado" }},
                    { id: 5, from: 5, to: 6, data: { longitud: 2.0, resistencia: "Alta", material: "Acero inoxidable" }},
                    { id: 6, from: 6, to: 7, data: { longitud: 2.0, resistencia: "Alta", material: "Acero inoxidable" }},
                    { id: 7, from: 7, to: 4, data: { longitud: 2.0, resistencia: "Media", material: "Aluminio reforzado" }},
                    { id: 8, from: 0, to: 4, data: { longitud: 2.0, resistencia: "Alta", material: "Acero inoxidable" }},
                    { id: 9, from: 1, to: 5, data: { longitud: 2.0, resistencia: "Alta", material: "Acero inoxidable" }},
                    { id: 10, from: 2, to: 6, data: { longitud: 2.0, resistencia: "Media", material: "Aluminio reforzado" }},
                    { id: 11, from: 3, to: 7, data: { longitud: 2.0, resistencia: "Alta", material: "Acero inoxidable" }}
                ]
            }
        };
        
        return this.data;
    }

    /**
     * Obtiene las conexiones de un vértice específico
     * @param {number} vertexId - ID del vértice
     * @returns {Array} Array de conexiones
     */
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

    /**
     * Busca un vértice por ID
     * @param {number} id - ID del vértice
     * @returns {Object|undefined} Vértice encontrado
     */
    getVertexById(id) {
        return this.data?.cube.vertices.find(v => v.id === id);
    }

    /**
     * Busca una arista por ID
     * @param {number} id - ID de la arista
     * @returns {Object|undefined} Arista encontrada
     */
    getEdgeById(id) {
        return this.data?.cube.edges.find(e => e.id === id);
    }

    /**
     * Obtiene todos los vértices
     * @returns {Array} Array de vértices
     */
    getAllVertices() {
        return this.data?.cube.vertices || [];
    }

    /**
     * Obtiene todas las aristas
     * @returns {Array} Array de aristas
     */
    getAllEdges() {
        return this.data?.cube.edges || [];
    }
}
