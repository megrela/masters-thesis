/**
 * Created by gime on 3/4/2016.
 */


function DelaunayTriangulation(vertices) {
    var me = this;
    me.vertices = vertices;
    me.triangles = [];
    me.count = me.vertices.length;
}


/**
 * create super triangle which covers all the verticies;
 */
DelaunayTriangulation.prototype.superTriangle = function () {
    var minx = this.vertices[0].x;
    var maxx = this.vertices[0].x;
    var miny = this.vertices[0].y;
    var maxy = this.vertices[0].y;
    for (var i=1; i<this.vertices.length; i++) {
        if (this.vertices[i].x < minx) minx = this.vertices[i].x;
        if (this.vertices[i].x > maxx) maxx = this.vertices[i].x;
        if (this.vertices[i].y < miny) miny = this.vertices[i].y;
        if (this.vertices[i].y > maxy) maxy = this.vertices[i].y;
    }

    /**
     * make it fit
     */
    minx -= app.config.MAX_X;
    maxx += app.config.MAX_X;
    miny -= app.config.MAX_Y;
    maxy += app.config.MAX_Y;

    /**
     *  make it square: dx = dy
     */
    var dx = maxx - minx;
    var dy = maxy - miny;
    if (dx > dy) {
        dy = dx;
    } else {
        dx = dy;
    }
    maxx = minx + dx;
    maxy = miny + dy;

    /**
     * calculate circle containing the square
     * r = diagonal / 2;
     * diagonal = sqrt(2) * a;
     */
    var cx = 0.5 * (maxx - minx);
    var cy = 0.5 * (maxy - miny);
    var r = ( Math.sqrt(2) * dx ) / 2.;
    var circle = new Circle(new Point(cx, cy),r);

    return Triangle.getNormalTriangleByInnerCircle(circle);
};


/**
 * triangulate set
 */
DelaunayTriangulation.prototype.triangulate = function () {
    /**
     * create first super triangle which will cover all points
     * add it to existed triangles
     */

    this.triangles.push(this.superTriangle());

    for (var i=0; i<this.count; i++) {
        var v = this.vertices[i];
        var edges = [];
        var tri, j;

        for (j = 0; j < this.triangles.length; j++) {
            tri = this.triangles[j];
            if (tri.circumscribingCircleContainsPoint(v)) {
                tri.good = false;
                edges.push(new Edge(tri.A, tri.B));
                edges.push(new Edge(tri.A, tri.C));
                edges.push(new Edge(tri.B, tri.C));
            }
        }

        this.triangles = this.triangles.filter(function (tri) {
            return tri.good;
        });

        for (j = 0; j + 1 < edges.length; j++)
            for (var k=j+1; k<edges.length; k++ )
                if (edges[j].isEqual(edges[k])) {
                    edges[k].good = false;
                    edges[j].good = false;
                }

        edges = edges.filter(function (edge) {
            return edge.good;
        });

        for (j=0; j<edges.length; j++) {
            this.triangles.push(
                new Triangle(edges[j].a, edges[j].b, v)
            );
        }
    }

    return this.extractEdges();
};

DelaunayTriangulation.prototype.extractEdges = function () {
    var edges = [];
    for (var i=0; i<this.triangles.length; i++) {
        if (this.triangles[i].A.id > -1 &&
            this.triangles[i].B.id > -1 &&
            this.triangles[i].C.id > -1) {
            edges.push( new Edge(this.triangles[i].A, this.triangles[i].B));
            edges.push( new Edge(this.triangles[i].A, this.triangles[i].C));
            edges.push( new Edge(this.triangles[i].B, this.triangles[i].C));
        }
    }
    return edges;
};

