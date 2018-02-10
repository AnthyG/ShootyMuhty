MovingObject = Class({
    initProps: ["x", "y", "velX", "velY", "speed", "accel", "friction", "cx", "cy", "angle", "collidableWith", "isColliding", "type"],
    initialize: function(
        x, y,
        velX, velY,
        speed,
        accel,
        friction,
        cx, cy,
        angle,
        collidableWith, isColliding,
        type
    ) {
        var dis = this;

        this.uuid = generateUUID();

        for (var i = 0; i < this.initProps.length; i++) {
            let p = this.initProps[i];

            eval("this[p] = " + p);

            // console.log(p, this[p]);
        }
    },
    print: function() {
        console.log(JSON.parse(JSON.stringify(this)), this);
    },
    move: function() {
        // if (Math.abs(this.velY) < this.speed)
        // if (this.velY > -this.speed && this.velY < this.speed)
        this.velY += Math.sin(this.angle) * this.accel;
        // if (Math.abs(this.velX) < this.speed)
        // if (this.velX < this.speed && this.velX > -this.speed)
        this.velX += Math.cos(this.angle) * this.accel;

        this.velX *= this.friction;
        this.x += this.velX;
        this.velY *= this.friction;
        this.y += this.velY;

        if (this.y < 0) {
            this.y = cvs.height - csize * 2;
            this.cy -= 1;
        }
        if (this.x > cvs.width - csize * 2) {
            this.x = 0;
            this.cx += 1;
        }
        if (this.y > cvs.height - csize * 2) {
            this.y = 0;
            this.cy += 1;
        }
        if (this.x < 0) {
            this.x = cvs.width - csize * 2;
            this.cx -= 1;
        }
    },
    draw: function() {
        var hinX = cnr * csize - p.x - p.cx * cnr * 2 * csize,
            hinY = cnr * csize - p.y - p.cy * cnr * 2 * csize;
    },
    tick: function(ms) {

    },
    isCollidableWith: function(obj) {
        return (this.collidableWith.indexOf(obj.type) !== -1);
    }
});