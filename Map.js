var Ant = require('./Ant.js');

class Map  {
    constructor(height = 10, width = 10) {
        this.height = height;
        this.width = width;

        this.cell_lenght = 50;

        this.data;

        this.grid = [];
        this.temp_grid = [];

        this.max_ants_on_grid = 10;
        this.nb_ants_on_grid = 0;

        this.initMap();
    }

    initMap() {
        this.initGrids();

        this.grid[0][0].CASE_TYPE.nest = 1
        this.temp_grid[0][0].CASE_TYPE.nest = 1

        this.setFood(this.grid);
        this.setFood(this.temp_grid);
        this.setWall(this.grid);
        this.setWall(this.temp_grid);

    };

    initSimulation() {
        this.moveAnts();
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
        self.pheromoneV1 = 0,
        self.pheromoneV2 = 0,
        self.getCaseType = function () {
            if(self.CASE_TYPE.wall) {
                return 'WALL'
            } else if(self.CASE_TYPE.food.has) {
                return 'FOOD'
            } else if(self.CASE_TYPE.ant) {
                return 'ANT'
            } else  {
                return false
            }
        }

        return self;
    }

    initGrids() {
        for (var x = 0; x < this.width; x = x + 1) {
            this.grid[x] = [];
            this.temp_grid[x] = [];
            for (var y = 0; y < this.height; y = y + 1) {
                this.grid[x][y] = this.Case(x, y);
                this.temp_grid[x][y] = this.Case(x, y);
            }
        }
    }

    setFood(grid) {
        var x = 3
            //this.getRandomInt(0, this.width - 1);
        var y = 3
            //this.getRandomInt(0, this.height -1);

        grid[x][y].CASE_TYPE.food.has = true;
        grid[x][y].CASE_TYPE.food.foodLeft = 100;
    }

    setWall(grid) {
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
                this.grid[i][ii].CASE_TYPE.ant = this.temp_grid[i][ii].CASE_TYPE.ant;
                this.grid[i][ii].pheromoneV1 = this.temp_grid[i][ii].pheromoneV1;

            }
        }

        this.moveAntsOutOfNest();
    }

    moveAnt(x,y) {

        var next_coords = this.majPheromoneAndGetNextCoord(x, y);

        var xx = next_coords[0];
        var yy = next_coords[1];

        if (!this.temp_grid[xx][yy].CASE_TYPE.ant) {
            this.temp_grid[xx][yy].CASE_TYPE.ant = this.temp_grid[x][y].CASE_TYPE.ant;
            this.temp_grid[x][y].CASE_TYPE.ant = null;
        }
    }

    moveAntsOutOfNest() {
        if (!this.grid[0][0].CASE_TYPE.ant && this.nb_ants_on_grid < this.max_ants_on_grid) {
            this.grid[0][0].CASE_TYPE.ant = new Ant();
            this.temp_grid[0][0].CASE_TYPE.ant = this.grid[0][0].CASE_TYPE.ant;

            this.nb_ants_on_grid ++;
        }
    }



    majPheromoneAndGetNextCoord(x, y) {
        var cells_arounds = this.getArrayCoordinatesCellAround(x, y);
        var pheromones_V1 = []
        var pheromones_V2 = []
        var cell_with_max = null;
        var ant = this.grid[x][y].CASE_TYPE.ant;
        var self = this;

        cells_arounds.map(function (coords) {

            coords =  self.getBoundedIndex(coords[0], coords[1]);

            var cell = self.grid[coords[0]][coords[1]];
            if (!ant.has_food && (!cell_with_max || cell.pheromoneV1 > cell_with_max)) {
                cell_with_max = coords
            }
            if (ant.has_food && (!cell_with_max || cell.pheromoneV2 > cell_with_max)) {
                cell_with_max = coords
            }
            pheromones_V1.push(cell.pheromoneV1)
            pheromones_V2.push(cell.pheromoneV2)

        })

        if(this.grid[x][y].CASE_TYPE.food.has) {
            this.temp_grid[x][y].pheromoneV1 = 1;
            this.temp_grid[x][y].pheromoneV2 = 1

        }
        if (!this.grid[x][y].CASE_TYPE.food.has) {
            var sumV1 = pheromones_V1.reduce(function(a, b) { return a + b; }, 0);
            var sumV2 = pheromones_V2.reduce(function(a, b) { return a + b; }, 0);
            var V1 = ant.evaporation * (ant.bruit * Math.max.apply(Math, pheromones_V1));
            if (sumV1 > 0) {
                var avgV1 =  sumV1 / pheromones_V1.length;

                V1 += (1 - ant.bruit) * avgV1;
            }
            var V2 = ant.evaporation * (ant.bruit * Math.max.apply(Math, pheromones_V2));
            if (sumV2 > 0) {
                var avgV2 =  sumV1 / pheromones_V2.length;
                V2 += (1 - ant.bruit) * avgV2;
            }

            this.temp_grid[x][y].pheromoneV1 = V1;
            this.temp_grid[x][y].pheromoneV2 = V2;

        }

        if((ant.has_food && !cell_with_max.pheromoneV2) || !ant.has_food && !cell_with_max.pheromoneV1) {
            return this.getRandomCoordinates(x, y);
        }
        return cell_with_max;
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

