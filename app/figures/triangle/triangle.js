/**
 * Created by gime on 3/4/2016.
 */

function Triangle(A,B,C) {
    this.A = A;
    this.B = B;
    this.C = C;
    this.good = true;
}

Triangle.getNormalTriangleByInnerCircle = function (circle) {
    var lowerPoint = circle.lowerPoint();

    /**
     * inner circle radius of normal triangle = sqrt(3) * a / 6
     * r = sqrt(3) * a / 6
     * 6r = a * sqrt(3)
     * a = 6r / sqrt(3);
     * h = sqrt(3) / 2 * a;
     */
    var a = 6 * circle.radius / Math.sqrt(3);
    var h = Math.sqrt(3) / 2 * a;


    /**
     * now lets draw normal triangle with side a
     * vertex A = {x: lowerPoint.x - a / 2,  y: lowerPoint.y }
     * vertex B = {x: lowerPoint.x + a / 2,  y: lowerPoint.y }
     * vertex C = {x: lowerPoint.x,  y: lowerPoint.y + h }
     */
    var A = new Point(
        lowerPoint.x - a / 2,
        lowerPoint.y
    );

    var B = new Point(
        lowerPoint.x + a / 2,
        lowerPoint.y
    );

    var C = new Point(
        lowerPoint.x,
        lowerPoint.y + h
    );

    return new Triangle(A, B, C);
};


/**
 * calculates circumscribin circle of triangle
 * @returns {boolean}
 */
Triangle.prototype.circumscribingCircleContainsPoint = function (p) {

    var ab = sqr(this.A.x) + sqr(this.A.y);
    var cd = sqr(this.B.x) + sqr(this.B.y);
    var ef = sqr(this.C.x) + sqr(this.C.y);

    var ox =
        (ab * (this.C.y - this.B.y) + cd * (this.A.y - this.C.y) + ef * (this.B.y - this.A.y)) / 
        (this.A.x * (this.C.y - this.B.y) + this.B.x * (this.A.y - this.C.y) + this.C.x * (this.B.y - this.A.y)) / 2;
    var oy =
        (ab * (this.C.x - this.B.x) + cd * (this.A.x - this.C.x) + ef * (this.B.x - this.A.x)) / 
        (this.A.y * (this.C.x - this.B.x) + this.B.y * (this.A.x - this.C.x) + this.C.y * (this.B.x - this.A.x)) / 2;

    var sqrR = sqr(this.A.x - ox) + sqr(this.A.y - oy);
    var sqrDistance = sqr(p.x - ox) + sqr(p.y - oy);

    return sqrDistance <= sqrR;
};


