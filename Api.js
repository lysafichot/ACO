var Map = require('./Map.js');

class Api {
    constructor() {
        this.initServer();
    }

    initServer() {
        var express = require('express');
        var app = express();
        var server = require('http').Server(app);
        var io = require('socket.io')(server);

        app.use(express.static(__dirname + '/node_modules'));
        app.use(express.static(__dirname + '/public'));

        app.set('this', this);

        this.map = new Map(20, 20, io);

        io.on('connection', function(socket) {
            var api = app.get('this');
            socket.emit('map:params', api.getMapParams());

        });

        server.listen(3000, function() {
            console.log('Server up and running at 3000 port');
        });
    }

    getMapParams() {
        return {
            height: this.map.height,
            width: this.map.width,
            cell_lenght: this.map.cell_lenght,
            grid: this.map.grid
        }
    }
}

new Api();
