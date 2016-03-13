/**
 * Created by gime on 3/4/2016.
 */

function Drawing() {
    var me = this;

    me.stage = $('#stage');

    me.stage.children().each(function () {
        $(this).attr('width',me.stage.css('width'));
        $(this).attr('height',me.stage.css('height'));
    });

    me.layers = {
        graph: $('canvas')[0],
        runnerPath: $('canvas')[1],
        runnerObject: $('canvas')[2]
    };

    me.dom = {};

    me.config = {
        POINT_SIZE: 4,

        COLOR: {
            vertex: "black",
            edge: "black",
            RUNNER: [
                {location: "red", direction: "red"},
                {location: "green", direction: "green"}
            ]
        }
    }
}

Drawing.prototype.reset = function () {
    for (var i in this.layers) {
        this.resetLayer(this.layers[i]);
    }
};


Drawing.prototype.resetLayer = function (layer) {
    this.dom = layer;
    var ctx = this.dom.getContext("2d");
    ctx.clearRect(0, 0, this.dom.width, this.dom.height);
};

Drawing.prototype.dot = function (point) {
    var p = point.scale();
    var ctx = this.dom.getContext("2d");
    ctx.fillStyle = this.config.COLOR.vertex;
    ctx.fillRect(
        p.x - this.config.POINT_SIZE / 2,
        p.y - this.config.POINT_SIZE / 2,
        this.config.POINT_SIZE,
        this.config.POINT_SIZE
    )
};

Drawing.prototype.line = function (a, b) {
    var p1 = a.scale();
    var p2 = b.scale();
    var ctx = this.dom.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = this.config.COLOR.edge;
    ctx.stroke();
};

Drawing.prototype.drawGraphVertices = function (graph) {
    this.dom = this.layers.graph;
    for (var i=0; i<graph.vertices.length; i++) {
        this.dot(graph.vertices[i]);
    }
};

Drawing.prototype.drawGraphEdges = function (graph) {
    this.dom = this.layers.graph;
    for (var i=0; i<graph.edges.length; i++) {
        this.line(graph.edges[i].a, graph.edges[i].b);
    }
};



Drawing.prototype.reDrawRunners = function (runners) {
    this.resetLayer(this.layers.runnerObject);
    for (var i=0; i<runners.length; i++) {
        var runner = runners[i];
        this.dom = this.layers.runnerObject;
        this.setRunnersLocation(runner);
        this.setRunnersDirection(runner);
        this.dom = this.layers.runnerPath;
        this.setRunnersPath(runner);
    }
};

Drawing.prototype.setRunnersDirection = function (runner) {
    if (runner.direction !== null) {
        var p2 = runner.direction.scale();
        var ctx = this.dom.getContext("2d");
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, 8, 0, 2 * Math.PI);
        ctx.lineWidth = 5;
        ctx.strokeStyle = this.config.COLOR.RUNNER[runner.type].direction;
        ctx.stroke();
    }
};

Drawing.prototype.setRunnersLocation = function (runner) {
    if (runner.location !== null) {
        var p2 = runner.location.scale();
        var ctx = this.dom.getContext("2d");
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = this.config.COLOR.RUNNER[runner.type].location;
        ctx.fill();
    }
};

Drawing.prototype.setRunnersPath = function (runner) {
    if (runner.prev !== null && runner.location !== null) {
        var p1 = runner.prev.scale();
        var p2 = runner.location.scale();
        var ctx = this.dom.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineWidth = 4;
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = this.config.COLOR.RUNNER[runner.type].location;
        ctx.stroke();
    }
};

