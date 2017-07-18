var Ant = require('./Ant.js');

class Map  {
    constructor(height = 10, width = 10, socket = null) {
        this.height = height;
        this.width = width;
        this.socket = socket;

        this.cell_lenght = 50;

        this.data;
        this.grid = [];
        this.temp_grid = [];

        this.max_ants_on_grid = 2;
        this.nb_ants_on_grid = 0;

        this.initMap();

        var that = this;

        setInterval(function() {
            return that.initSimulation()
        }, 2000);
    }

    initMap() {
        this.initGrids();
    };

    Case(x, y) {
        var self = {};
        self.x = x;
        self.y = y;
        self.CASE_TYPE = {
            wall: 0,
            ant: null,
            food: {
                has: 0,
                foodLeft: 0
            },
            pheromoneV1: 0,
            pheromoneV2:0
        };

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

        this.setFood()
    }

    setFood() {
        var x = this.getRandomInt(0, this.width);
        var y = this.getRandomInt(0, this.height);

        this.grid[x][y].CASE_TYPE.food.has = true;
        this.grid[x][y].CASE_TYPE.food.foodLeft = 100;

    }

    setWall() {

    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (Math.floor(max) - min + 1) + min);
    }

    moveAntsOutOfNest() {
        var x = 0;
        var y = 0;
         if (!this.avgPheroScanNext()) {
             var next_coords = this.getRandomCoordinates(x, y);
         }
        var xx = next_coords[0];
        var yy = next_coords[1];
        if (!this.grid[xx][yy].CASE_TYPE.ant && this.nb_ants_on_grid < this.max_ants_on_grid) {
            this.grid[xx][yy].CASE_TYPE.ant = new Ant();
            this.temp_grid[xx][yy].CASE_TYPE.ant = this.grid[xx][yy].CASE_TYPE.ant;
            this.nb_ants_on_grid ++;
        }
    }

    avgPheroScanNext() {
        // formule
        return 0;

        // return coord [x, y] + phero
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
        if (x >= this.width) {
            x = this.width - 1;
        }
        if (y < 0) {
            y = 0
        }
        if (y >= this.height) {
            y = this.height - 1;
        }

        return [x, y]
    }

    initSimulation() {
        this.moveAntsOutOfNest();
        this.socket.emit('map:update', this.grid);
    }
}

module.exports = Map;

