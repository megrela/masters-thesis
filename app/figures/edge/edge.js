/**
 * Created by Giorgi Megreli on 3/5/2016.
 */

function Edge(a, b) {
    this.a = a;
    this.b = b;
    this.good = true;
}

Edge.prototype.isEqual = function (edge2) {
    return (
        (this.a.isEqual(edge2.a) && this.b.isEqual(edge2.b))
        ||
        (this.a.isEqual(edge2.b) && this.b.isEqual(edge2.a))
    );
};