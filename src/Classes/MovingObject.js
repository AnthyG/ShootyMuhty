MovingObject = Class({
    initProps: ["x", "y", "velX", "velY", "speed", "accel", "friction", "cx", "cy", "angle"],
    initialize: function(x, y, velX, velY, speed, accel, friction, cx, cy, angle) {
        var dis = this;
        for (var i = 0; i < this.initProps.length; i++) {
            let p = this.initProps[i];

            eval("dis[p] = " + p);
        }
    },
    print: function() {
        console.log(JSON.parse(JSON.stringify(this)), this);
    }
});