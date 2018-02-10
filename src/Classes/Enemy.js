Enemy = Class(MovingObject, {
    initProps: ["x", "y", "velX", "velY", "speed", "accel", "friction", "cx", "cy", "angle", "collidableWith", "isColliding", "type"],
    initProps2: ["sprintSpeed", "sprintAccel", "maxAmmo", "ammo", "ammoReload", "ammoCurReload", "shooting", "shootCooldown", "shootCurCooldown", "bulletSpeed", "bulletAccel", "bulletFriction", "bulletTime", "bulletDmg", "bulletRadius", "bullets", "hp", "radius"],
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
        sprintSpeed,
        sprintAccel,
        maxAmmo, ammo,
        ammoReload, ammoCurReload,
        shooting,
        shootCooldown, shootCurCooldown,
        bulletSpeed,
        bulletAccel,
        bulletFriction,
        bulletTime,
        bulletDmg,
        bulletRadius,
        bullets,
        hp,
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
        // eval(superStr);

        for (var i = 0; i < this.initProps2.length; i++) {
            let p = this.initProps2[i];

            eval("this[p] = " + p);

            // console.log(p, this[p]);
        }

        this.keys = {
            up: false,
            right: false,
            down: false,
            left: false,
            sprinting: false
        };

        // this.print();
    },
    print: function() {
        console.log(JSON.parse(JSON.stringify(this)), this);
    },
    move: function() {
        if (this.keys.up)
            if (this.velY > -this.speed) // Up
                this.velY -= this.accel + (this.keys.sprinting ? this.sprintAccel : 0);
        if (this.keys.right)
            if (this.velX < this.speed) // Right
                this.velX += this.accel + (this.keys.sprinting ? this.sprintAccel : 0);
        if (this.keys.down)
            if (this.velY < this.speed) // Down
                this.velY += this.accel + (this.keys.sprinting ? this.sprintAccel : 0);
        if (this.keys.left)
            if (this.velX > -this.speed) // Left
                this.velX -= this.accel + (this.keys.sprinting ? this.sprintAccel : 0);

        if (Math.abs(this.velX) < 0.00001)
            this.velX = 0;
        if (Math.abs(this.velY) < 0.00001)
            this.velY = 0;

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

        ctx.enemies.fillStyle = "rgba(0, 255, 255, 0.5)";
        if (this.isColliding)
            ctx.enemies.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.enemies.strokeStyle = "black";
        ctx.enemies.beginPath();
        ctx.enemies.arc(
            cxx_d,
            cyy_d,
            this.radius * 2, 0, Math.PI * 2
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
    isCollidableWith: function(obj) {
        return (this.collidableWith.indexOf(obj.type) !== -1);
    },
    moveFace: function() {
        var angle = 0;

        // The following doesn't quite work for these (ignoring the fact that they aren't controlled by the player)
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
        ctx.enemies.beginPath();
        ctx.enemies.moveTo(cxx_d, cyy_d);
        ctx.enemies.lineTo(
            (cxx_d) + r * Math.cos(this.angle),
            (cyy_d) + r * Math.sin(this.angle)
        );
        ctx.enemies.stroke();
        ctx.enemies.closePath();

        ctx.enemies.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.enemies.beginPath();
        ctx.enemies.arc(
            (cxx_d) + r * Math.cos(this.angle),
            (cyy_d) + r * Math.sin(this.angle),
            this.radius, this.angle + Math.PI * 1.55, this.angle + Math.PI * 0.45
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
            this.radius - 1, this.angle + Math.PI * 1.65, this.angle + Math.PI * 0.35
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
                    this.x, // x
                    this.y, // y
                    this.velX, this.velY, // vel
                    this.bulletSpeed, // speed
                    this.bulletAccel, // accel
                    this.bulletFriction, // friction
                    this.cx, this.cy, // c
                    this.angle, // angle
                    ["player"], false, "bulletEnemy", // collidableWith, isColliding, type
                    bulletClr, // clr
                    this.bulletTime, // time
                    this.bulletDmg, // dmg
                    this.bulletRadius // radius
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
        // console.log(Math.sin(this.angle), Math.cos(this.angle));

        this.keys = {
            up: false,
            right: false,
            down: false,
            left: false,
            sprinting: false
        };

        if (Math.sin(this.angle) > 0) {
            this.keys.down = true;
        }
        if (Math.sin(this.angle) < 0) {
            this.keys.up = true;
        }
        if (Math.cos(this.angle) > 0) {
            this.keys.right = true;
        }
        if (Math.cos(this.angle) < 0) {
            this.keys.left = true;
        }

        // Old "cheaty" way..
        // this.velY += Math.sin(this.angle) * this.accel;
        // this.velX += Math.cos(this.angle) * this.accel;
    }
});