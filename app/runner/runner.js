/**
 * Created by gime on 3/10/2016.
 */

var runnerTypes = {
    TARGET: 0,
    POLICEMAN: 1
};

function Runner(location, direction, type) {
    this.prev = {};
    this.location = location;
    this.direction = direction;
    this.type = type;
    this.prevId = -1;
}

Runner.prototype.distanceSQR = function () {
    var me = this;
    var dx = me.location.x - me.direction.x;
    var dy = me.location.y - me.direction.y;

    return dx*dx + dy*dy;
};
