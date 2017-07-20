var Ant = require('./Ant.js');

class Map  {
    constructor(height = 10, width = 10) {
        this.height = height;
        this.width = width;

        this.cell_lenght = 20;

        this.grid = [];
        this.temp_grid = [];

        this.max_ants_on_grid = 10;
        this.nb_ants_on_grid = 0;

        this.pourcentage_wall = 0.1

        this.initMap();
    }

    initMap() {
        this.initGrids();

        this.grid[0][0].CASE_TYPE.nest = 1;
        this.setWall(this.grid);
        this.setFood(this.grid);

        this.temp_grid = this.cloneGrid(this.grid);

    };

    initSimulation() {
        this.moveAnts();
    }

    cloneGrid(array) {
        return JSON.parse(JSON.stringify(array))
    }

    Case(x, y) {
        var self = {};
        self.x = x;
        self.y = y;
        self.CASE_TYPE = {
            nest: 0,
            wall: 0,
            ant: null,
            food: {
                has: 0,
                foodLeft: 0
            },
        };
        self.pheromoneV1 = 0;
        self.pheromoneV2 = 0;

        return self;
    }

    initGrids() {
        for (var x = 0; x < this.width; x = x + 1) {
            this.grid[x] = [];
            for (var y = 0; y < this.height; y = y + 1) {
                this.grid[x][y] = this.Case(x, y);
            }
        }
    }

    setFood(grid) {
        var x = this.getRandomInt(0, this.width - 1);
        var y = this.getRandomInt(0, this.height -1);
        while (grid[x][y].CASE_TYPE.wall || grid[x][y].CASE_TYPE.nest) {
            var x = this.getRandomInt(0, this.width - 1);
            var y = this.getRandomInt(0, this.height -1);
        }
        grid[x][y].CASE_TYPE.food.has = true;
        grid[x][y].CASE_TYPE.food.foodLeft = 100;
    }

    setWall(grid) {

        for (var x = 2; x < this.width; x = x + 1) {
            for (var y = 2; y < this.height; y = y + 1) {
                if(Math.random() < this.pourcentage_wall) {
                    grid[x][y].CASE_TYPE.wall = 1;

                }

            }
        }

        for (var x = 2; x < this.width; x = x + 1) {
            grid[x][0].CASE_TYPE.wall = 1;
            grid[x][this.height - 1].CASE_TYPE.wall = 1;
            grid[1][this.height - 1].CASE_TYPE.wall = 1;

        }
        for (var y = 2; y < this.height; y = y + 1) {
            grid[0][y].CASE_TYPE.wall = 1;
            grid[this.width - 1][y].CASE_TYPE.wall = 1;
            grid[this.width - 1][1].CASE_TYPE.wall = 1;
        }
    }

    moveAnts() {
        for (var x = 0; x < this.width; x = x + 1) {
            for (var y = 0; y < this.height; y = y + 1) {
                if (this.grid[x][y].CASE_TYPE.ant) {
                    this.moveAnt(x, y);
                }
            }
        }
        for (var i = 0; i < this.width; i = i + 1) {
            for (var ii = 0; ii < this.height; ii = ii + 1) {
                this.grid = this.cloneGrid(this.temp_grid);
            }
        }
        this.moveAntsOutOfNest();
    }

    moveAntsOutOfNest() {
        if (!this.grid[0][0].CASE_TYPE.ant && this.nb_ants_on_grid < this.max_ants_on_grid) {
            this.grid[0][0].CASE_TYPE.ant = new Ant();
            this.temp_grid[0][0].CASE_TYPE.ant = this.grid[0][0].CASE_TYPE.ant;

            this.nb_ants_on_grid ++;
        }
    }

    moveAnt(x, y) {
        this.majPheromone(x, y);
        this.moveToThisCase(x, y);
    }

    majPheromone(x, y) {
        var cells_arounds = this.getArrayCoordinatesCellAround(x, y);
        var pheromones_V1 = [];
        var pheromones_V2 = [];
        var ant = this.temp_grid[x][y].CASE_TYPE.ant;
        var self = this;

        cells_arounds.map(function (coords) {
            coords = self.getBoundedIndex(coords[0], coords[1]);
            var cell = self.temp_grid[coords[0]][coords[1]];
            pheromones_V1.push(cell.pheromoneV1);
            pheromones_V2.push(cell.pheromoneV2);
        });

        var V1 = this.calculPheromonesRate(pheromones_V1, ant);
        var V2 = this.calculPheromonesRate(pheromones_V2, ant);
        if(this.temp_grid[x][y].CASE_TYPE.food.has) {
            if(ant.state == 'EMPTY') {
                this.temp_grid[x][y].CASE_TYPE.food.foodLeft -= 1;
                ant.state = 'FULL';
            }
            if (this.temp_grid[x][y].CASE_TYPE.food.foodLeft == 0 ) {
                this.temp_grid[x][y].CASE_TYPE.food.has = false;
                this.temp_grid[x][y].pheromoneV1 = V1;
                this.temp_grid[x][y].pheromoneV2 = V2;
            } else {
                this.temp_grid[x][y].pheromoneV1 = 1;
                this.temp_grid[x][y].pheromoneV2 = V2;
            }
        } else if(this.temp_grid[x][y].CASE_TYPE.nest && ant.state == 'FULL') {
            this.temp_grid[x][y].pheromoneV1 = V1;
            this.temp_grid[x][y].pheromoneV2 = 1;
        } else {
            this.temp_grid[x][y].pheromoneV1 = V1;
            this.temp_grid[x][y].pheromoneV2 = V2;
        }
    }

    calculPheromonesRate(pheromones, ant){
        var sum = pheromones.reduce(function(a, b) { return a + b; }, 0);
        var rate = ant.evaporation * (ant.bruit * Math.max.apply(Math, pheromones));
        if (sum > 0) {
            var avg =  sum / pheromones.length;
            rate += (1 - ant.bruit) * avg;
        }

        return rate
    }

    getNextCoordinates(x, y) {
        var cells_arounds = this.getArrayCoordinatesCellAround(x, y);
        var cell_with_max_pheromone = null;
        var ant = this.temp_grid[x][y].CASE_TYPE.ant;
        if (!ant) {
            return;
        }
        var self = this;
        cells_arounds.map(function (coords) {
            coords =  self.getBoundedIndex(coords[0], coords[1]);

            var cell = self.temp_grid[coords[0]][coords[1]];
            if (ant.state == 'EMPTY' && (!cell_with_max_pheromone || cell.pheromoneV1 > cell_with_max_pheromone.pheromoneV1)) {
                cell_with_max_pheromone = self.temp_grid[coords[0]][coords[1]];
            }
            if (ant.state == 'FULL' && (!cell_with_max_pheromone || cell.pheromoneV2 > cell_with_max_pheromone.pheromoneV2)) {
                cell_with_max_pheromone = self.temp_grid[coords[0]][coords[1]];
            }
        });

        if(ant && (
            (ant.state == 'FULL' && !cell_with_max_pheromone.pheromoneV2) ||
            (ant.state == 'EMPTY' && !cell_with_max_pheromone.pheromoneV1)) ||
            (Math.random() > (1 - ant.exploration) / (1 - ant.confiance))
        ) {
            return this.getRandomCoordinates(x, y);
        }

        return [cell_with_max_pheromone.x, cell_with_max_pheromone.y];
    }

    moveToThisCase(x, y) {
        var next_coords = this.getNextCoordinates(x, y);

        var xx = next_coords[0];
        var yy = next_coords[1];
        if(this.grid[x][y].CASE_TYPE.nest && this.grid[x][y].CASE_TYPE.ant.state == 'FULL') {
            if(this.temp_grid[x][y].CASE_TYPE.ant.road_trip == 3) {


                this.temp_grid[x][y].CASE_TYPE.ant = null;
            } else if (this.temp_grid[x][y].CASE_TYPE.ant.road_trip < 3) {
                this.temp_grid[x][y].CASE_TYPE.ant.state = 'EMPTY'
                this.temp_grid[x][y].CASE_TYPE.ant.road_trip++
            }
        }

        if(this.temp_grid[xx][yy].CASE_TYPE.wall) {
            this.temp_grid[xx][yy].pheromoneV1 = -1;
            this.temp_grid[xx][yy].pheromoneV2 = -1;
        }
        if (!this.temp_grid[xx][yy].CASE_TYPE.ant && !this.temp_grid[xx][yy].CASE_TYPE.wall) {
            this.temp_grid[xx][yy].CASE_TYPE.ant = this.temp_grid[x][y].CASE_TYPE.ant;
            this.temp_grid[x][y].CASE_TYPE.ant = null;
        }
    }

    getRandomCoordinates(x, y) {
        var direction = this.getRandomInt(1, 4);
        var xx = x;
        var yy = y;
        switch(direction) {
            case 1:
                yy -= 1;
                break;
            case 2:
                xx +=1;
                break;
            case 3:
                yy += 1;
                break;
            case 4:
                xx -=1;
                break;
        }

        return this.getBoundedIndex(xx, yy);
    }

    getBoundedIndex(x, y) {
        if (x < 0) {
            x = 0;
        }
        if (x > this.width - 1) {
            x = this.width - 1;
        }
        if (y < 0) {
            y = 0
        }
        if (y > this.height - 1) {
            y = this.height - 1;
        }
        return [x, y]
    }

    getArrayCoordinatesCellAround(x, y) {
        return [
            [x, y + 1],
            [x + 1, y],
            [x, y - 1],
            [x - 1, y]
        ];
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (Math.floor(max) - min + 1) + min);
    }
}

module.exports = Map;

