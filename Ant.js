class Ant  {
    constructor() {
        this.state = 'EMPTY'; // FULL OR EMPTY
        this.Case = {x: 0, y: 0};
        this.exploration = 0.8; // Degré de témérité de la fourmi et son goût pour l’exploration.
        this.confiance = 0.5; // Confiance dans le déplacement.
        this.evaporation = 0.9999; // Permet la modification du chemin en cas de changement.
        this.bruit = 0.7;
        this.road_trip = 0;

    }
}

module.exports = Ant;

