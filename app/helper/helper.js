/**
 * Created by gime on 3/4/2016.
 */

function random(min, max) {
    return Math.floor(Math.random() * (max - min ) + min);
}

function sqr(x) {
    return x*x;
}

function delay(time) {
    var d1 = new Date();
    var d2 = new Date();
    while (d2.valueOf() < d1.valueOf() + time) {
        d2 = new Date();
    }
}

var EPS = 0.00000001;
