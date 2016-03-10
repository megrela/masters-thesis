/**
 * Created by gime on 3/4/2016.
 */

function Point(x, y) {
    this.x = x;
    this.y = y;
    this.id = -1;
}

Point.randomPoint = function () {
    return new Point(
        random(app.config.MIN_X, app.config.MAX_X),
        random(app.config.MIN_Y, app.config.MAX_Y)
    );
};

Point.prototype.scale = function () {
    return {
        x: this.x * app.config.SCALE,
        y: this.y * app.config.SCALE
    };
};

Point.prototype.isEqual = function (point2) {
    return (
        (Math.abs(this.x - point2.x) < EPS) &&
        (Math.abs(this.y - point2.y) < EPS)
    );
};