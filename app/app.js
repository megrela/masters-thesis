/**
 * Created by gime on 3/4/2016.
 */

var app = {
    config: {},
    init: function() {
        var me = this;
        me.drawing = new Drawing($('canvas')[0]);
        me.messages = $('#messages');
        me.startListening();
    },

    initConfig: function () {
        var me = this;
        var scale = $('#scale').val();
        var points = $('#number-of-points').val();
        me.drawing.reset();
        me.messages.text('');
        me.pursuitStarted = false;

        me.config = {
            VERTEX_COUNT: points,
            SCALE: scale,
            MIN_X: 1,
            MIN_Y: 1,
            MAX_X: ( me.drawing.dom.width / scale )- 1,
            MAX_Y: ( me.drawing.dom.height / scale ) - 1,
            RUNNER_COLOR: [
                {location: "red", direction: "blue"},
                {location: "yellow", direction: "green"}
            ]
        };

        $('#next-runners-btn').attr('disabled', true);
    },

    isValid: function () {
        var me = this;
        var dx = app.config.MAX_X - app.config.MIN_X + 1;
        var dy = app.config.MAX_Y - app.config.MIN_Y + 1;
        var all = dx * dy;
        return me.config.VERTEX_COUNT <= all;
    },

    start: function () {
        var me = this;
        me.initConfig();
        if (!me.isValid()) {
            me.appendLog(
                "Indicated number of points can not be drawn, at this scale",
                "warning"
            );
            return;
        }

        me.graph = new Graph(me.config.VERTEX_COUNT);
        me.graph.randomizeVertices();

        me.drawing.drawGraphVertices(me.graph);

        me.graph.triangulate(DelaunayTriangulation);
        me.graph.buildAdjTable();

        me.drawing.drawGraphEdges(me.graph);
    },

    addRunners: function () {
        var me = this;
        var vertex = me.graph.randomVertex();
        var adjVertex = me.graph.randomAdjacent(vertex.id);
        me.target = new Runner(vertex, adjVertex, runnerTypes.TARGET);

        while (true) {
            vertex = me.graph.randomVertex();
            if (!(vertex.id == me.target.location.id || vertex.id == me.target.direction.id)) {
                break;
            }
        }
        me.policeman = new Runner(vertex, null, runnerTypes.POLICEMAN);

        app.drawing.drawRunner(me.target);
        app.drawing.drawRunner(me.policeman);
    },

    /**
     * now we have 2 runners, target and policeman, target has direction - where it is going
     * policeman want to catch him
     */
    startPursuit: function () {
        var me = this;
        me.algorithm = new MinimumAngleDfsAlgorithm(me.graph, me.policeman.location.id, me.target.direction.id);
        me.dfs();
        me.pursuitStarted = true;
    },

    dfs: function () {
        var me = this;
        me.algorithm.source = me.policeman.location.id;
        me.algorithm.tail = me.target.direction.id;
        me.algorithm.start();
        me.policeman.direction = me.graph.vertices[me.algorithm.path[0]];
        me.drawing.setRunnersDirection(me.policeman);
    },

    /**
     * next event
     */
    nextEvent: function () {
        var me = this;
        var first = me.target;
        var second = me.policeman;
        var targetIsFirst = true;

        if ( me.policeman.distanceSQR() < me.target.distanceSQR() ){
            first = me.policeman;
            second = me.target;
            targetIsFirst = false;
        }

        var ratio = Math.sqrt( first.distanceSQR() / second.distanceSQR() );
        first.prev = first.location;
        first.location = first.direction;
        me.drawing.setRunnersLocation(first);

        var secondX = ratio * ( second.direction.x - second.location.x ) + second.location.x;
        var secondY = ratio * ( second.direction.y - second.location.y ) + second.location.y;

        second.location = new Point(secondX, secondY);
        me.drawing.setRunnersLocation(second);

        if (targetIsFirst) {
            var cur = me.target.location.id;
            var adj = me.target.prev;
            console.log(cur);
            console.log(adj.id);
            while (adj.id == me.target.location.id) {
                adj = me.graph.randomAdjacent(cur);
                console.log(adj.id);
            }
            me.target.direction = adj;
            me.drawing.setRunnersDirection(me.target);
        } else {
            me.dfs();
        }
    },

    startListening: function () {
        var me = this;

        $('#calculate-btn').click(function () {
            me.start();
            $('#add-runners-btn').attr('disabled', false);
        });

        $('#add-runners-btn').click(function () {
            me.addRunners();
            $('#next-runners-btn').attr('disabled', false);
            $(this).attr('disabled', true);
        });

        $('#next-runners-btn').click(function () {
            if (!me.pursuitStarted) {
                me.startPursuit();
            } else {
                me.nextEvent();
            }
        });
    },

    appendLog: function (data, level) {
        var me = this;
        $('<div/>', {
            class: 'alert alert-' + level,
            role: 'alert',
            text: data
        }).appendTo(me.messages);
    }
};