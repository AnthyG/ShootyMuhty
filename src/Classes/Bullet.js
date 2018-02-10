Bullet = Class(MovingObject, {
    initProps: ["x", "y", "velX", "velY", "speed", "accel", "friction", "cx", "cy", "angle", "collidableWith", "isColliding", "type"],
    initProps2: ["clr", "time", "dmg"],
    initialize: function(
        x, y,
        velX, velY,
        speed,
        accel,
        friction,
        cx, cy,
        angle,
        collidableWith, isColliding,
        type,
        clr,
        time,
        dmg,
        radius
    ) {
        var dis = this;

        this.uuid = generateUUID();

        var superStr = "this.$super('initialize', ";
        for (var i = 0; i < this.initProps.length; i++) {
            let p = this.initProps[i];

            superStr += p + (i + 1 !== this.initProps.length ? ", " : "");
        }
        superStr += ")";
        // console.log("superStr", superStr);
        eval(superStr);

        for (var i = 0; i < this.initProps2.length; i++) {
            let p = this.initProps2[i];

            eval("this[p] = " + p);

            // console.log(p, this[p]);
        }
    },
    print: function() {
        console.log(JSON.parse(JSON.stringify(this)), this);
    },
    move: function() {
        // this.print();
        // this.isColliding && console.log("isColliding", JSON.parse(JSON.stringify(this)), this.isColliding);

        // if (Math.sin(this.angle) > 0) {
        //     if (this.velY > -this.speed) // Up
        //         this.velY -= this.accel;
        // }
        // if (Math.sin(this.angle) < 0) {
        //     if (this.velX < this.speed) // Right
        //         this.velX += this.accel;
        // }
        // if (Math.cos(this.angle) > 0) {
        //     if (this.velY < this.speed) // Down
        //         this.velY += this.accel;
        // }
        // if (Math.cos(this.angle) < 0) {
        //     if (this.velX > -this.speed) // Left
        //         this.velX -= this.accel;
        // }

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
        if (this.isColliding)
            ctx.bullets.strokeStyle = "rgba(255, 255, 0, 0.8)";
        ctx.bullets.beginPath();
        ctx.bullets.arc((this.cx * cnr * 2) * csize + this.x + csize, (this.cy * cnr * 2) * csize + this.y + csize,
            // ctx.arc((this.cx - dat.cx) * cnr * 2 * csize + (this.x - dat.x) + csize, (this.cy - dat.cy) * cnr * 2 * csize + (this.y - dat.y) + csize,
            this.radius, 0, Math.PI * 2
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
    },
    isCollidableWith: function(obj) {
        return (this.collidableWith.indexOf(obj.type) !== -1);
    }
});