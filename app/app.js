/**
 * Created by gime on 3/4/2016.
 */

var app = {
    config: {},
    init: function() {
        var me = this;
        me.drawing = new Drawing();
        me.messages = $('#messages');
        me.startListening();
    },

    initConfig: function () {
        var me = this;
        var scale = $('#scale').val();
        var points = $('#number-of-points').val();

        me.drawing.reset();
        me.messages.text('');

        if (me.pursuitStarted) {
            me.pursuitStarted = false;
            clearInterval(me.runningThread);
        }

        me.config = {
            VERTEX_COUNT: points,
            SCALE: scale,
            MIN_X: 1,
            MIN_Y: 1,
            MAX_X: ( me.drawing.stage.width() / scale )- 1,
            MAX_Y: ( me.drawing.stage.height() / scale ) - 1

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
        me.graph.triangulate(DelaunayTriangulation);
        me.graph.buildAdjTable();

        me.drawing.drawGraphVertices(me.graph);
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

        while (true) {
            vertex = me.graph.randomVertex();
            if ( vertex.id == me.policeman.location.id ) {
                continue;
            }
            if (!(vertex.id == me.target.location.id || vertex.id == me.target.direction.id)) {
                break;
            }

        }

        me.secondPoliceman = new Runner(vertex, null, runnerTypes.POLICEMAN);
        app.drawing.reDrawRunners([me.target, me.policeman, me.secondPoliceman]);
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
        me.pursuitFinished = false;
    },

    dfs: function () {
        var me = this;
        me.algorithm.source = me.policeman.location.id;
        me.algorithm.tail = me.target.direction.id;
        me.algorithm.start([]);

        if (me.algorithm.path.length > 0) {
            me.policeman.direction = me.graph.vertices[me.algorithm.path[0]];

            me.algorithm.source = me.secondPoliceman.location.id;
            me.algorithm.tail = me.target.direction.id;
            me.algorithm.start([me.target.location.id]);

            if ( me.algorithm.path.length > 0 ) {
                me.secondPoliceman.direction = me.graph.vertices[me.algorithm.path[0]];
            } else {
                me.finishPursuit();
            }
        } else {
            me.finishPursuit();
        }



        app.drawing.reDrawRunners([me.target, me.policeman, me.secondPoliceman]);
    },

    /**
     * next event
     */
    nextEvent: function () {
        var me = this;

        var first = me.target;
        var second = me.policeman;
        var third = me.secondPoliceman;
        var targetIsFirst = false;
        var equal = false;

        if ( me.policeman.distanceSQR() <= me.secondPoliceman.distanceSQR() ) {
            if (me.policeman.distanceSQR() < me.target.distanceSQR()) {
                first = me.policeman;
                if (me.target.distanceSQR() < me.secondPoliceman.distanceSQR()) {
                    second = me.target;
                    third = me.secondPoliceman;
                } else {
                    second = me.secondPoliceman;
                    third = me.target;
                }
            } else {
                targetIsFirst = true;
                first = me.target;
                second = me.policeman;
                third = me.secondPoliceman;
            }
        } else if ( me.policeman.distanceSQR() > me.secondPoliceman.distanceSQR() ) {
            first = me.secondPoliceman;
            if (me.secondPoliceman.distanceSQR() < me.target.distanceSQR()) {
                if (me.target.distanceSQR() < me.policeman.distanceSQR()) {
                    second = me.target;
                    third = me.policeman;
                } else {
                    second = me.policeman;
                    third = me.target;
                }
            } else {
                targetIsFirst = true;
                first = me.target;
                second = me.secondPoliceman;
                third = me.policeman;
            }
        }

        var ratio2 = Math.sqrt( first.distanceSQR() / second.distanceSQR() );
        var ratio3 = Math.sqrt( first.distanceSQR() / third.distanceSQR() );

        first.prev = first.location;
        first.location = first.direction;

        var secondX = ratio2 * ( second.direction.x - second.location.x ) + second.location.x;
        var secondY = ratio2 * ( second.direction.y - second.location.y ) + second.location.y;

        var thirdX = ratio3 * ( third.direction.x - third.location.x ) + third.location.x;
        var thirdY = ratio3 * ( third.direction.y - third.location.y ) + third.location.y;

        second.prev = second.location;
        second.location = new Point(secondX, secondY);
        second.location.id = second.prev.id;

        third.prev = third.location;
        third.location = new Point(thirdX, thirdY);
        third.location.id = third.prev.id;

        if (targetIsFirst) {
            var cur = me.target.location.id;
            var prev = me.target.prev;
            var adj = {};
            while (true) {
                var adj = me.graph.randomAdjacent(cur);
                if (adj.id != prev.id) break;
            }
            me.target.direction = adj;
            if (me.target.direction.id == me.policeman.location.id ||
                me.target.direction.id == me.secondPoliceman.location.id) {
                me.finishPursuit();
            }
        } else {
            if (equal) {
              second.location = second.direction;
            }
            me.dfs();
        }
        app.drawing.reDrawRunners([me.target, me.policeman, me.secondPoliceman]);
    },

    finishPursuit: function () {
        var me = this;
        me.pursuitFinished = true;
        alert("caught");
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
                if ($('#automatic-pursuit').is(':checked') == true) {
                    $('#next-runners-btn').attr('disabled', true);
                    me.runningThread = setInterval(function () {
                        if (me.pursuitFinished) {
                            clearInterval(me.runningThread);
                        } else {
                            me.nextEvent();
                        }
                    }, 200);
                }
            } else {
                if (!me.pursuitFinished) {
                    me.nextEvent();
                }
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
