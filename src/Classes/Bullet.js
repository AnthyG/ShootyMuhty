Bullet = Class(MovingObject, {
    initProps: ["x", "y", "velX", "velY", "speed", "accel", "friction", "cx", "cy", "angle"],
    initProps2: ["uuid", "clr", "time"],
    initialize: function(x, y, velX, velY, speed, accel, friction, cx, cy, angle, uuid, clr, time) {
        var dis = this;

        var superStr = "dis.$super('initialize', ";
        for (var i = 0; i < this.initProps.length; i++) {
            let p = this.initProps[i];

            superStr += p + (i + 1 !== this.initProps.length ? ", " : "");
        }
        superStr += ")";
        // console.log("superStr", superStr);
        eval(superStr);

        for (var i = 0; i < this.initProps2.length; i++) {
            let p = this.initProps2[i];

            eval("dis[p] = " + p);
        }
    },
    print: function() {
        console.log(JSON.parse(JSON.stringify(this)), this);
    },
    move: function() {
        // this.print();

        // if (this.velY > -this.speed && this.velY < this.speed)
        this.velY += Math.sin(this.angle) * this.accel;
        // if (this.velX < this.speed && this.velX > -this.speed)
        this.velX += Math.cos(this.angle) * this.accel;

        this.velX *= this.friction;
        this.x += this.velX;
        this.velY *= this.friction;
        this.y += this.velY;

        if (this.y < 0) {
            this.y = cvs.bullets.height - csize * 2;
            this.cy -= 1;
        }
        if (this.x > cvs.bullets.width - csize * 2) {
            this.x = 0;
            this.cx += 1;
        }
        if (this.y > cvs.bullets.height - csize * 2) {
            this.y = 0;
            this.cy += 1;
        }
        if (this.x < 0) {
            this.x = cvs.bullets.width - csize * 2;
            this.cx -= 1;
        }
    },
    draw: function() {
        ctx.bullets.save();

        var hinX = cnr * csize - p.x - p.cx * cnr * 2 * csize,
            hinY = cnr * csize - p.y - p.cy * cnr * 2 * csize;

        ctx.bullets.translate(hinX, hinY);

        ctx.bullets.fillStyle = this.clr + "ee";
        ctx.bullets.strokeStyle = "rgba(0, 0, 0, 0.95)";
        ctx.bullets.beginPath();
        ctx.bullets.arc((this.cx * cnr * 2) * csize + this.x + csize, (this.cy * cnr * 2) * csize + this.y + csize,
            // ctx.arc((this.cx - dat.cx) * cnr * 2 * csize + (this.x - dat.x) + csize, (this.cy - dat.cy) * cnr * 2 * csize + (this.y - dat.y) + csize,
            5, 0, Math.PI * 2
        );
        ctx.bullets.stroke();
        ctx.bullets.fill();
        ctx.bullets.closePath();

        ctx.bullets.translate(-hinX, -hinY);

        ctx.bullets.restore();
    },
    tick: function(ms) {
        // log("tick 2 ", ms);

        this.time -= ms;
    }
});