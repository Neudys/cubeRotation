/**
 * DataManager - Gestiona la carga y acceso a datos del cubo
 * Datos exactos según el PDF de vértices y aristas
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
                // ─── 8 VÉRTICES (según PDF) ───────────────────────────────
                // x: -1=izquierda  +1=derecha
                // y: -1=inferior   +1=superior
                // z: -1=posterior  +1=frontal
                vertices: [
                    {
                        id: 0,
                        name: "Dai Mai",
                        position: [-1, 1, 1],
                        planet: "♃",
                        planetName: "Júpiter",
                        number: "3",
                        element: "▽",
                        trigram: "☲",
                        trigramName: "Fuego",
                        vessel: "Dai Mai",
                        data: { planeta: "Júpiter ♃", numero: "3", elemento: "Tierra ▽", trigrama: "☲ Fuego", vaso: "Dai Mai" }
                    },
                    {
                        id: 1,
                        name: "Du Mai",
                        position: [1, 1, 1],
                        planet: "☉",
                        planetName: "Sol",
                        number: "5",
                        element: "△",
                        trigram: "☰",
                        trigramName: "Cielo",
                        vessel: "Du Mai",
                        data: { planeta: "Sol ☉", numero: "5", elemento: "Fuego △", trigrama: "☰ Cielo", vaso: "Du Mai" }
                    },
                    {
                        id: 2,
                        name: "Yang Wei Mai",
                        position: [1, 1, -1],
                        planet: "♂",
                        planetName: "Marte",
                        number: "4",
                        element: "△",
                        trigram: "☱",
                        trigramName: "Lago",
                        vessel: "Yang Wei Mai",
                        data: { planeta: "Marte ♂", numero: "4", elemento: "Aire △", trigrama: "☱ Lago", vaso: "Yang Wei Mai" }
                    },
                    {
                        id: 3,
                        name: "Yang Qiao Mai",
                        position: [-1, 1, -1],
                        planet: "☿",
                        planetName: "Mercurio",
                        number: "7",
                        element: "▽",
                        trigram: "☳",
                        trigramName: "Trueno",
                        vessel: "Yang Qiao Mai",
                        data: { planeta: "Mercurio ☿", numero: "7", elemento: "Agua ▽", trigrama: "☳ Trueno", vaso: "Yang Qiao Mai" }
                    },
                    {
                        id: 4,
                        name: "Yin Wei Mai",
                        position: [-1, -1, 1],
                        planet: "♀",
                        planetName: "Venus",
                        number: "6",
                        element: "▽",
                        trigram: "☶",
                        trigramName: "Montaña",
                        vessel: "Yin Wei Mai",
                        data: { planeta: "Venus ♀", numero: "6", elemento: "Tierra ▽", trigrama: "☶ Montaña", vaso: "Yin Wei Mai" }
                    },
                    {
                        id: 5,
                        name: "Yin Qiao Mai",
                        position: [1, -1, 1],
                        planet: "⊕",
                        planetName: "Tierra",
                        number: "9",
                        element: "△",
                        trigram: "☴",
                        trigramName: "Viento",
                        vessel: "Yin Qiao Mai",
                        data: { planeta: "Tierra ⊕", numero: "9", elemento: "Fuego △", trigrama: "☴ Viento", vaso: "Yin Qiao Mai" }
                    },
                    {
                        id: 6,
                        name: "Chong Mai",
                        position: [1, -1, -1],
                        planet: "♄",
                        planetName: "Saturno",
                        number: "2",
                        element: "△",
                        trigram: "☵",
                        trigramName: "Agua/Kan",
                        vessel: "Chong Mai",
                        data: { planeta: "Saturno ♄", numero: "2", elemento: "Aire △", trigrama: "☵ Agua/Kan", vaso: "Chong Mai" }
                    },
                    {
                        id: 7,
                        name: "Ren Mai",
                        position: [-1, -1, -1],
                        planet: "☽",
                        planetName: "Luna",
                        number: "8",
                        element: "▽",
                        trigram: "☷",
                        trigramName: "Tierra/Kun",
                        vessel: "Ren Mai",
                        data: { planeta: "Luna ☽", numero: "8", elemento: "Agua ▽", trigrama: "☷ Tierra/Kun", vaso: "Ren Mai" }
                    }
                ],

                // ─── 12 ARISTAS (según PDF) ──────────────────────────────
                edges: [
                    // A1 – Inferior frontal  (V5–V6)  id4–id5
                    {
                        id: 0, from: 4, to: 5,
                        sign: "♐", signName: "Sagitario",
                        vessel: "Shou Jue Yin",
                        trigram: "♐",
                        number: "8",
                        data: { signo: "♐ Sagitario", numero: "8", canal: "Shou Jue Yin" }
                    },
                    // A2 – Inferior derecha  (V6–V7)  id5–id6
                    {
                        id: 1, from: 5, to: 6,
                        sign: "♒", signName: "Acuario",
                        vessel: "Zu Shao Yang",
                        trigram: "♒",
                        number: "88→16→7",
                        data: { signo: "♒ Acuario", numero: "88→16→7", canal: "Zu Shao Yang" }
                    },
                    // A3 – Inferior izquierda  (V5–V8)  id4–id7
                    {
                        id: 2, from: 4, to: 7,
                        sign: "♏", signName: "Escorpio",
                        vessel: "Zu Shao Yin",
                        trigram: "♏",
                        number: "55→10→1",
                        data: { signo: "♏ Escorpio", numero: "55→10→1", canal: "Zu Shao Yin" }
                    },
                    // A4 – Inferior posterior  (V7–V8)  id6–id7
                    {
                        id: 3, from: 6, to: 7,
                        sign: "♑", signName: "Capricornio",
                        vessel: "Shou Shao Yang",
                        trigram: "♑",
                        number: "27→9",
                        data: { signo: "♑ Capricornio", numero: "27→9", canal: "Shou Shao Yang" }
                    },
                    // A5 – Lateral derecha anterior  (V2–V6)  id1–id5
                    {
                        id: 4, from: 1, to: 5,
                        sign: "♈", signName: "Aries",
                        vessel: "Shou Tai Yin",
                        trigram: "♈",
                        number: "9",
                        data: { signo: "♈ Aries", numero: "9", canal: "Shou Tai Yin" }
                    },
                    // A6 – Lateral izquierda anterior  (V1–V5)  id0–id4
                    {
                        id: 5, from: 0, to: 4,
                        sign: "♎", signName: "Libra",
                        vessel: "Zu Tai Yang",
                        trigram: "♎",
                        number: "72→9",
                        data: { signo: "♎ Libra", numero: "72→9", canal: "Zu Tai Yang" }
                    },
                    // A7 – Lateral derecha posterior  (V3–V7)  id2–id6
                    {
                        id: 6, from: 2, to: 6,
                        sign: "♍", signName: "Virgo",
                        vessel: "Shou Tai Yang",
                        trigram: "♍",
                        number: "24→6",
                        data: { signo: "♍ Virgo", numero: "24→6", canal: "Shou Tai Yang" }
                    },
                    // A8 – Lateral izquierda posterior  (V4–V8)  id3–id7
                    {
                        id: 7, from: 3, to: 7,
                        sign: "♓", signName: "Piscis",
                        vessel: "Zu Jue Yin",
                        trigram: "♓",
                        number: "40→4",
                        data: { signo: "♓ Piscis", numero: "40→4", canal: "Zu Jue Yin" }
                    },
                    // A9 – Superior frontal  (V1–V2)  id0–id1
                    {
                        id: 8, from: 0, to: 1,
                        sign: "♌", signName: "Leo",
                        vessel: "Shou Shao Yin",
                        trigram: "♌",
                        number: "11→2",
                        data: { signo: "♌ Leo", numero: "11→2", canal: "Shou Shao Yin" }
                    },
                    // A10 – Superior derecha  (V2–V3)  id1–id2
                    {
                        id: 9, from: 1, to: 2,
                        sign: "♊", signName: "Géminis",
                        vessel: "Zu Yang Ming",
                        trigram: "♊",
                        number: "64",
                        data: { signo: "♊ Géminis", numero: "64", canal: "Zu Yang Ming" }
                    },
                    // A11 – Superior izquierda  (V1–V4)  id0–id3
                    {
                        id: 10, from: 0, to: 3,
                        sign: "♋", signName: "Cáncer",
                        vessel: "Zu Tai Yin",
                        trigram: "♋",
                        number: "45→9",
                        data: { signo: "♋ Cáncer", numero: "45→9", canal: "Zu Tai Yin" }
                    },
                    // A12 – Superior posterior  (V3–V4)  id2–id3
                    {
                        id: 11, from: 2, to: 3,
                        sign: "♉", signName: "Tauro",
                        vessel: "Shou Yang Ming",
                        trigram: "♉",
                        number: "33",
                        data: { signo: "♉ Tauro", numero: "33", canal: "Shou Yang Ming" }
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