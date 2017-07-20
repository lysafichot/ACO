class Ant  {
    constructor() {

        this.state = 'EMPTY'; // FULL OR EMPTY
        this.Case = {x: 0, y: 0};
        this.exploration = 0.4; // Degré de témérité de la fourmi et son goût pour l’exploration.
        this.confiance = 0.7; // Confiance dans le déplacement.
        this.evaporation = 0.9999; // Permet la modification du chemin en cas de changement.
        this.bruit = 0.7;
        this.road_trip = 0;

    }

    // get state() {
    //     return this.state;
    // }
    //
    // set state(haveFreight) {
    //      this.state = haveFreight;
    // }
}

module.exports = Ant;

