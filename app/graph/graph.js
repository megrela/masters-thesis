/**
 * Created by gime on 3/4/2016.
 */

function Graph(vertexCount) {
    var me = this;
    me.vertices = [];
    me.edges = [];
    me.vertexCount = vertexCount;
    me.table = [];
    me.randomHits = 0;
    initTable();
    function initTable() {
        for (var i=0; i<=app.config.MAX_X; i++) {
            me.table.push([]);
            for (var j=0; j<=app.config.MAX_Y; j++) {
                me.table[i].push(0);
            }
        }
    }
}

Graph.prototype.vertexExists = function (p) {
    //console.log( p.x +  " " , p.y );
    return this.table[p.x][p.y] !== 0;
};

Graph.prototype.addVertex = function (p) {
    p.id = this.vertices.length;
    this.vertices.push(p);
    this.table[p.x][p.y] = p.id;
};

Graph.prototype.randomizeVertices = function () {
    var cnt = this.vertexCount;
    while (cnt) {
        var p = Point.randomPoint();
        if (!this.vertexExists(p)) {
            this.addVertex(p);
            cnt--
        }
        this.randomHits++;
    }
    app.appendLog(""+this.vertexCount + " random points generated in " + this.randomHits + " tries", "info");
};

Graph.prototype.triangulate = function (algorithm) {
    this.edges = (new algorithm(this.vertices)).triangulate();
    app.appendLog(""+this.edges.length + " edges created after triangulation", "info");
};

Graph.prototype.buildAdjTable = function () {
    var me = this, i;
    me.adj = [];
    for (i=0; i<this.vertexCount; i++){
        me.adj.push([]);
    }
    for (i=0; i<this.edges.length; i++){
        var edge = this.edges[i];
        me.adj[edge.a.id].push(edge.b.id);
        me.adj[edge.b.id].push(edge.a.id);
    }
};

Graph.prototype.randomVertex = function () {
    var me = this;
    return me.vertices[ random(0, me.vertexCount - 1) ];
};

Graph.prototype.randomAdjacent = function (id) {
    var me = this;
    var index = random(0, me.adj[id].length - 1);
    var adjId = me.adj[id][index];
    return me.vertices[adjId];
};
