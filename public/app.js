var app = angular.module('acoApp', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: '/index.html'
    });
}]);
app.factory('socket', ['$rootScope', function($rootScope) {
    var socket = io.connect('http://localhost:3000');

    return {
        on: function(eventName, callback){
            socket.on(eventName, callback);
        },
        emit: function(eventName, data) {
            socket.emit(eventName, data);
        }
    };
}]);

app.controller('IndexController', function($scope, socket) {
    this.mapParams = {};
    this.context;
    this.data;

    this.createCanvas = function (mapParams) {
        var canvas = document.createElement('canvas');
        canvas.id = "map";
        canvas.width = mapParams.width * mapParams.cell_lenght;
        canvas.height = mapParams.height * mapParams.cell_lenght;
        document.getElementsByTagName('body')[0].appendChild(canvas);

        this.context = canvas.getContext("2d");
    };

    this.drawCells = function (cell) {
        for (var x = 0; x < this.mapParams.width; x++) {
            for (var y = 0; y < this.mapParams.height; y++) {
                if (this.data && this.data[x][y] === this.colorCell(cell[x][y])) {
                    continue;
                }

                this.context.clearRect(x * this.mapParams.cell_lenght, y * this.mapParams.cell_lenght, this.mapParams.cell_lenght, this.mapParams.cell_lenght);
                this.context.fillStyle = this.colorCell(cell[x][y]);
                this.context.fillRect(x * this.mapParams.cell_lenght, y * this.mapParams.cell_lenght, this.mapParams.cell_lenght, this.mapParams.cell_lenght);
            }
        }
        if (!this.data) {
            this.data = [];
        }
        for (var x = 0; x < this.mapParams.width; x++) {
            this.data[x] = [];
            for (var y = 0; y < this.mapParams.height; y++){
                this.data[x][y] = this.colorCell(cell[x][y]);
            }
        }
    };

    this.colorCell  = function (cell) {
        if (cell.CASE_TYPE.ant) {
            return "rgb(0,0,0)";
        } else if(cell.CASE_TYPE.food.has) {
            return "rgb(14,55,250)";
        } else return "rgb(250,250,250)";
    };

    var self = this;
    socket.on('map:params', function(data) {
        self.mapParams = data;
        self.createCanvas(self.mapParams);
        self.drawCells(self.mapParams.grid.map(function(row) {
            return row.map(function(cell) {
                return cell;
            });
        }));
    });
    socket.on('map:update', function(data) {
        console.log(data)
        self.drawCells(data.map(function(row) {
            return row.map(function(cell) {
                return cell;
            });
        }));
    });
});