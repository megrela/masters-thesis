/**
 * Created by gime on 3/4/2016.
 */

function Circle(center, radius) {
    this.center = center;
    this.radius = radius;
}

/**
 * lower point of circle: lower_point = { x: c.x,  y: c.y - r};
 */
Circle.prototype.lowerPoint = function () {
    return new Point(this.center.x, this.center.y - this.radius);
};


/**
 * finds if circle contains a point
 */
Circle.prototype.containsPoint = function (p) {
    return sqr(p.x - this.center.x) + sqr(p.y - this.center.y) < sqr(this.radius);
};