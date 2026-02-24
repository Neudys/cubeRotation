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
                        name: "Dai Mai",
                        position: [-1, 1, 1],
                        planet: "♃",
                        planetIcon: "/icons/jupiter.svg",
                        planetName: "Júpiter",
                        number: "3",
                        element: "▽",
                        elementName: "Tierra",
                        elementIcon: "/icons/element-down-line.svg",
                        trigram: "䷝",
                        trigramName: "Fuego",
                        vessel: "Dai Mai",
                        data: { planeta: "Júpiter ♃", numero: "3", elemento: "Tierra ▽", trigrama: "䷝ Fuego", vaso: "Dai Mai" }
                    },
                    {
                        id: 1,
                        name: "Du Mai",
                        position: [1, 1, 1],
                        planet: "☉",
                        planetIcon: "/icons/sun.svg",
                        planetName: "Sol",
                        number: "5",
                        element: "△",
                        elementName: "Fuego",
                        elementIcon: "/icons/element-up.svg",
                        trigram: "䷀",
                        trigramName: "Cielo",
                        vessel: "Du Mai",
                        data: { planeta: "Sol ☉", numero: "5", elemento: "Fuego △", trigrama: "䷀ Cielo", vaso: "Du Mai" }
                    },
                    {
                        id: 2,
                        name: "Yang Wei Mai",
                        position: [1, 1, -1],
                        planet: "♂",
                        planetIcon: "/icons/mars.svg",
                        planetName: "Marte",
                        number: "4",
                        element: "△",
                        elementName: "Aire",
                        elementIcon: "/icons/element-up-line.svg",
                        trigram: "䷹",
                        trigramName: "Lago",
                        vessel: "Yang Wei Mai",
                        data: { planeta: "Marte ♂", numero: "4", elemento: "Aire △", trigrama: "䷹ Lago", vaso: "Yang Wei Mai" }
                    },
                    {
                        id: 3,
                        name: "Yang Qiao Mai",
                        position: [-1, 1, -1],
                        planet: "☿",
                        planetIcon: "/icons/mercury.svg",
                        planetName: "Mercurio",
                        number: "7",
                        element: "▽",
                        elementName: "Agua",
                        elementIcon: "/icons/element-down.svg",
                        trigram: "䷲",
                        trigramName: "Trueno / Zhen",
                        vessel: "Yang Qiao Mai",
                        data: { planeta: "Mercurio ☿", numero: "7", elemento: "Agua ▽", trigrama: "䷲ Trueno / Zhen", vaso: "Yang Qiao Mai" }
                    },
                    {
                        id: 4,
                        name: "Yin Wei Mai",
                        position: [-1, -1, 1],
                        planet: "♀",
                        planetIcon: "/icons/venus.svg",
                        planetName: "Venus",
                        number: "6",
                        element: "▽",
                        elementName: "Tierra",
                        elementIcon: "/icons/element-down-line.svg",
                        trigram: "䷳",
                        trigramName: "Montaña / Gen",
                        vessel: "Yin Wei Mai",
                        data: { planeta: "Venus ♀", numero: "6", elemento: "Tierra ▽", trigrama: "䷳ Montaña / Gen", vaso: "Yin Wei Mai" }
                    },
                    {
                        id: 5,
                        name: "Yin Qiao Mai",
                        position: [1, -1, 1],
                        planet: "⊕",
                        planetIcon: "/icons/earth.svg",
                        planetName: "Tierra",
                        number: "9",
                        element: "△",
                        elementName: "Fuego alquímico",
                        elementIcon: "/icons/element-up.svg",
                        trigram: "䷸",
                        trigramName: "Viento / Xun",
                        vessel: "Yin Qiao Mai",
                        data: { planeta: "Tierra ⊕", numero: "9", elemento: "Fuego alquímico △", trigrama: "䷸ Viento / Xun", vaso: "Yin Qiao Mai" }
                    },
                    {
                        id: 6,
                        name: "Chong Mai",
                        position: [1, -1, -1],
                        planet: "♄",
                        planetIcon: "/icons/saturn.svg",
                        planetName: "Saturno",
                        number: "2",
                        element: "△",
                        elementName: "Aire alquímico",
                        elementIcon: "/icons/element-up-line.svg",
                        trigram: "䷜",
                        trigramName: "Agua / Kan",
                        vessel: "Chong Mai",
                        data: { planeta: "Saturno ♄", numero: "2", elemento: "Aire alquímico △", trigrama: "䷜ Agua / Kan", vaso: "Chong Mai" }
                    },
                    {
                        id: 7,
                        name: "Ren Mai",
                        position: [-1, -1, -1],
                        planet: "☽",
                        planetIcon: "/icons/moon.svg",
                        planetName: "Luna",
                        number: "8",
                        element: "▽",
                        elementName: "Agua alquímica",
                        elementIcon: "/icons/element-down.svg",
                        trigram: "䷁",
                        trigramName: "Tierra / Kun",
                        vessel: "Ren Mai",
                        data: { planeta: "Luna ☽", numero: "8", elemento: "Agua alquímica ▽", trigrama: "䷁ Tierra / Kun", vaso: "Ren Mai" }
                    }
                ],

                edges: [
                    
                    {
                        id: 0, from: 4, to: 5,
                        sign: "♐", signIcon: "/icons/sagittarius.svg", signName: "Sagitario",
                        vessel: "Shou Jue Yin",
                        trigram: "♐",
                        number: "8",
                        data: { signo: "♐ Sagitario", numero: "8", canal: "Shou Jue Yin" }
                    },
                    
                    {
                        id: 1, from: 5, to: 6,
                        sign: "♒", signIcon: "/icons/aquarius.svg", signName: "Acuario",
                        vessel: "Zu Shao Yang",
                        trigram: "♒",
                        number: "88→16→7",
                        data: { signo: "♒ Acuario", numero: "88→16→7", canal: "Zu Shao Yang" }
                    },
                   
                    {
                        id: 2, from: 4, to: 7,
                        sign: "♏", signIcon: "/icons/scorpio.svg", signName: "Escorpio",
                        vessel: "Zu Shao Yin",
                        trigram: "♏",
                        number: "55→10→1",
                        data: { signo: "♏ Escorpio", numero: "55→10→1", canal: "Zu Shao Yin" }
                    },
                    {
                        id: 3, from: 6, to: 7,
                        sign: "♑", signIcon: "/icons/capricorn.svg", signName: "Capricornio",
                        vessel: "Shou Shao Yang",
                        trigram: "♑",
                        number: "27→9",
                        data: { signo: "♑ Capricornio", numero: "27→9", canal: "Shou Shao Yang" }
                    },
                    {
                        id: 4, from: 1, to: 5,
                        sign: "♈", signIcon: "/icons/aries.svg", signName: "Aries",
                        vessel: "Shou Tai Yin",
                        trigram: "♈",
                        number: "9",
                        data: { signo: "♈ Aries", numero: "9", canal: "Shou Tai Yin" }
                    },
                    {
                        id: 5, from: 0, to: 4,
                        sign: "♎", signIcon: "/icons/libra.svg", signName: "Libra",
                        vessel: "Zu Tai Yang",
                        trigram: "♎",
                        number: "72→9",
                        data: { signo: "♎ Libra", numero: "72→9", canal: "Zu Tai Yang" }
                    },
                    {
                        id: 6, from: 2, to: 6,
                        sign: "♍", signIcon: "/icons/virgo.svg", signName: "Virgo",
                        vessel: "Shou Tai Yang",
                        trigram: "♍",
                        number: "24→6",
                        data: { signo: "♍ Virgo", numero: "24→6", canal: "Shou Tai Yang" }
                    },
                    
                    {
                        id: 7, from: 3, to: 7,
                        sign: "♓", signIcon: "/icons/pisces.svg", signName: "Piscis",
                        vessel: "Zu Jue Yin",
                        trigram: "♓",
                        number: "40→4",
                        data: { signo: "♓ Piscis", numero: "40→4", canal: "Zu Jue Yin" }
                    },
                    
                    {
                        id: 8, from: 0, to: 1,
                        sign: "♌", signIcon: "/icons/leo.svg", signName: "Leo",
                        vessel: "Shou Shao Yin",
                        trigram: "♌",
                        number: "11→2",
                        data: { signo: "♌ Leo", numero: "11→2", canal: "Shou Shao Yin" }
                    },
                   
                    {
                        id: 9, from: 1, to: 2,
                        sign: "♊", signIcon: "/icons/gemini.svg", signName: "Géminis",
                        vessel: "Zu Yang Ming",
                        trigram: "♊",
                        number: "64",
                        data: { signo: "♊ Géminis", numero: "64", canal: "Zu Yang Ming" }
                    },
                    
                    {
                        id: 10, from: 0, to: 3,
                        sign: "♋", signIcon: "/icons/cancer.svg", signName: "Cáncer",
                        vessel: "Zu Tai Yin",
                        trigram: "♋",
                        number: "45→9",
                        data: { signo: "♋ Cáncer", numero: "45→9", canal: "Zu Tai Yin" }
                    },
                   
                    {
                        id: 11, from: 2, to: 3,
                        sign: "♉", signIcon: "/icons/taurus.svg", signName: "Tauro",
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