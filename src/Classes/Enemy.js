Enemy = Class(MovingObject, {
    initProps: ["x", "y", "velX", "velY", "speed", "accel", "friction", "cx", "cy", "angle"],
    initProps2: ["sprintAccel", "maxAmmo", "ammo", "ammoReload", "ammoCurReload", "shooting", "shootCooldown", "shootCurCooldown", "bulletSpeed", "bulletAccel", "bulletFriction", "bulletTime", "bulletDmg", "bullets", "hp"],
    initialize: function(x, y, velX, velY, speed, accel, friction, cx, cy, angle, sprintAccel, camW, camH, maxAmmo, ammo, ammoReload, ammoCurReload, shooting, shootCooldown, shootCurCooldown, bulletSpeed, bulletAccel, bulletFriction, bulletTime, bulletDmg, bullets, hp) {
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
        // if (keys[38] || keys[87]) { // Up
        if (this.velY > -this.speed)
            this.velY -= this.accel + (keys[16] ? this.sprintAccel : 0);
        // }
        // if (keys[39] || keys[68]) { // Right
        if (this.velX < this.speed)
            this.velX += this.accel + (keys[16] ? this.sprintAccel : 0);
        // }
        // if (keys[40] || keys[83]) { // Down
        if (this.velY < this.speed)
            this.velY += this.accel + (keys[16] ? this.sprintAccel : 0);
        // }
        // if (keys[37] || keys[65]) { // Left
        if (this.velX > -this.speed)
            this.velX -= this.accel + (keys[16] ? this.sprintAccel : 0);
        // }

        // if (Math.abs(this.velX) < 0.00001)
        //     this.velX = 0;
        // if (Math.abs(this.velY) < 0.00001)
        //     this.velY = 0;

        this.velX *= this.friction;
        this.x += this.velX;
        this.velY *= this.friction;
        this.y += this.velY;

        this.x = Math.round(this.x);
        this.y = Math.round(this.y);

        if (this.y < 0) {
            this.y = cvs.enemies.height - csize * 2;
            this.cy -= 1;
        }
        if (this.x > cvs.enemies.width - csize * 2) {
            this.x = 0;
            this.cx += 1;
        }
        if (this.y > cvs.enemies.height - csize * 2) {
            this.y = 0;
            this.cy += 1;
        }
        if (this.x < 0) {
            this.x = cvs.enemies.width - csize * 2;
            this.cx -= 1;
        }
    },
    draw: function() {
        ctx.enemies.save();

        var hinX = ((1 - p.cx * 2) * cnr + 1) * csize - p.x,
            hinY = ((1 - p.cy * 2) * cnr + 1) * csize - p.y;

        var cxx_d = (this.cx * cnr * 2) * csize + this.x,
            cyy_d = (this.cy * cnr * 2) * csize + this.y;

        ctx.enemies.translate(hinX, hinY);

        ctx.enemies.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.enemies.strokeStyle = "20px solid black";
        ctx.enemies.beginPath();
        ctx.enemies.arc(
            cxx_d,
            cyy_d,
            10, 0, Math.PI * 2
        );
        ctx.enemies.stroke();
        ctx.enemies.fill();
        ctx.enemies.closePath();

        ctx.enemies.translate(-hinX, -hinY);

        ctx.enemies.restore();

        this.moveFace();

        if (this.shooting)
            this.shoot();

        if (this.ammo <= 0 && this.ammoCurReload === 0)
            this.ammoCurReload = this.ammoReload;
    },
    tick: function(ms) {
        // log("tick", ms);

        this.ammoCurReload -= ms;
        this.shootCurCooldown -= ms;

        if (this.ammoCurReload <= 0) {
            this.ammoCurReload = 0;

            if (this.ammo <= 0)
                this.ammo = this.maxAmmo;
        }
        if (this.shootCurCooldown <= 0) {
            this.shootCurCooldown = 0;
        }

        this.moveBullets(ms);
    },
    moveFace: function() {
        var angle = 0;

        // The following doesn't quite work for these (ignoring the fact that the aren't controlled by the player)
        var cxx_d = (this.cx * cnr * 2) * csize + this.x,
            cyy_d = (this.cy * cnr * 2) * csize + this.y;

        var angle = -Math.atan2(-((p.cy * cnr * 2 * csize + p.y) - (cyy_d)), ((p.cx * cnr * 2 * csize + p.x) - (cxx_d)));


        // log("angle", angle * (180 / Math.PI));

        this.angle = angle;

        this.drawFace();
    },
    drawFace: function() {
        ctx.enemies.save();

        var hinX = ((1 - p.cx * 2) * cnr + 1) * csize - p.x,
            hinY = ((1 - p.cy * 2) * cnr + 1) * csize - p.y;

        var cxx_d = (this.cx * cnr * 2) * csize + this.x,
            cyy_d = (this.cy * cnr * 2) * csize + this.y;

        ctx.enemies.translate(hinX, hinY);

        var r = 3.5;
        ctx.enemies.strokeStyle = "#000000";
        ctx.enemies.moveTo(cxx_d, cyy_d);
        ctx.enemies.lineTo(
            (cxx_d) + r * Math.cos(this.angle),
            (cyy_d) + r * Math.sin(this.angle)
        );
        ctx.enemies.stroke();

        ctx.enemies.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.enemies.beginPath();
        ctx.enemies.arc(
            (cxx_d) + r * Math.cos(this.angle),
            (cyy_d) + r * Math.sin(this.angle),
            5, this.angle + Math.PI * 1.55, this.angle + Math.PI * 0.45
        );
        ctx.enemies.fill();
        ctx.enemies.closePath();

        ctx.enemies.fillStyle = "#000000ef";
        try {
            ctx.enemies.fillStyle = colors[chunks[this.cy][this.cx][parseInt((this.x % (cnr * 2 * csize)) / csize)][parseInt((this.y % (cnr * 2 * csize)) / csize)].toString().slice(0, 1)] + "ef";
        } catch (err) {}
        // ctx.fillStyle = "rgba(255, 255, 255, 0.9)";

        ctx.enemies.beginPath();
        ctx.enemies.arc(
            (cxx_d) + r * Math.cos(this.angle),
            (cyy_d) + r * Math.sin(this.angle),
            4, this.angle + Math.PI * 1.65, this.angle + Math.PI * 0.35
        );
        ctx.enemies.fill();
        ctx.enemies.closePath();

        ctx.enemies.translate(-hinX, -hinY);

        ctx.enemies.restore();
    },
    shoot: function() {
        if (this.shootCurCooldown !== 0 ||
            this.ammoCurReload !== 0)
            return false;

        if (this.ammo > 0) {
            var bulletClr = "#000000";
            try {
                bulletClr = colors[chunks[this.cy][this.cx][parseInt((this.x % (cnr * 2 * csize)) / csize)][parseInt((this.y % (cnr * 2 * csize)) / csize)].toString().slice(0, 1)];
            } catch (err) {}

            var bi = this.bullets.push(
                new Bullet(
                    this.x, this.y, this.velX, this.velY,
                    this.bulletSpeed, this.bulletAccel, this.bulletFriction,
                    this.cx, this.cy, this.angle,
                    generateUUID(), bulletClr, this.bulletTime
                )
            ) - 1;

            // log("Shot!", bi, JSON.parse(JSON.stringify(this.bullets[bi])));

            this.ammo--;
            this.shootCurCooldown = this.shootCooldown;
        } else {
            this.ammoCurReload = this.ammoReload;
        }
    },
    moveBullets: function(ms) {
        for (var i = 0; i < this.bullets.length; i++) {
            var b = this.bullets[i];

            // log(i, b);

            b.move();

            b.draw();

            b.tick(ms);

            // b.print();

            if (b.time <= 0)
                this.bullets.splice(i, 1);
        }
    },
    ai: function() {
        this.velY += Math.sin(this.angle) * this.accel;
        this.velX += Math.cos(this.angle) * this.accel;
    }
});