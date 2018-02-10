Player = Class(MovingObject, {
    initProps: ["x", "y", "velX", "velY", "speed", "accel", "friction", "cx", "cy", "angle", "collidableWith", "isColliding", "type"],
    initProps2: ["sprintSpeed", "sprintAccel", "camW", "camH", "maxAmmo", "ammo", "ammoReload", "ammoCurReload", "shooting", "shootCooldown", "shootCurCooldown", "bulletSpeed", "bulletAccel", "bulletFriction", "bulletTime", "bulletDmg", "bulletRadius", "bullets", "hp", "radius"],
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
        camW, camH,
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
        eval(superStr);
        for (var i = 0; i < this.initProps.length; i++) {
            let p = this.initProps[i];

            // console.log(p, this[p]);
        }

        for (var i = 0; i < this.initProps2.length; i++) {
            let p = this.initProps2[i];

            eval("this[p] = " + p);

            // console.log(p, this[p]);
        }

        // this.print();
    },
    print: function() {
        console.log(JSON.parse(JSON.stringify(this)), this);
    },
    move: function() {
        // this.isColliding && console.log("isColliding", this.isColliding);

        if (keys[38] || keys[87]) { // Up
            if (this.velY > -(keys[16] ? this.sprintSpeed : this.speed))
                this.velY -= this.accel + (keys[16] ? this.sprintAccel : 0);
        }
        if (keys[39] || keys[68]) { // Right
            if (this.velX < (keys[16] ? this.sprintSpeed : this.speed))
                this.velX += this.accel + (keys[16] ? this.sprintAccel : 0);
        }
        if (keys[40] || keys[83]) { // Down
            if (this.velY < (keys[16] ? this.sprintSpeed : this.speed))
                this.velY += this.accel + (keys[16] ? this.sprintAccel : 0);
        }
        if (keys[37] || keys[65]) { // Left
            if (this.velX > -(keys[16] ? this.sprintSpeed : this.speed))
                this.velX -= this.accel + (keys[16] ? this.sprintAccel : 0);
        }

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

        // if (this.y < 0) {
        //     this.y = cnr * 2 * csize * this.camH;
        //     this.cy -= this.camH;
        // }
        // if (this.x > cnr * 2 * csize * this.camW) {
        //     this.x = 0;
        //     this.cx += this.camW;
        // }
        // if (this.y > cnr * 2 * csize * this.camH) {
        //     this.y = 0;
        //     this.cy += this.camH;
        // }
        // if (this.x < 0) {
        //     this.x = cnr * 2 * csize * this.camW;
        //     this.cx -= this.camW;
        // }

        if (this.y < 0) {
            this.y = cvs.player.height - csize * 2;
            this.cy -= 1;
        }
        if (this.x > cvs.player.width - csize * 2) {
            this.x = 0;
            this.cx += 1;
        }
        if (this.y > cvs.player.height - csize * 2) {
            this.y = 0;
            this.cy += 1;
        }
        if (this.x < 0) {
            this.x = cvs.player.width - csize * 2;
            this.cx -= 1;
        }
    },
    draw: function() {
        ctx.player.save();

        ctx.player.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.player.strokeStyle = "black";
        if (this.isColliding)
            ctx.player.strokeStyle = "pink";
        ctx.player.beginPath();
        ctx.player.arc(
            ((cvs.player.width - csize * 2) / 2) + csize,
            ((cvs.player.height - csize * 2) / 2) + csize,
            this.radius * 2, 0, Math.PI * 2
        );
        ctx.player.stroke();
        ctx.player.fill();
        ctx.player.closePath();

        ctx.player.restore();

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
        var angle = -Math.atan2(-(lastY - (((cvs.player.height - csize * 2) / 2) + csize)), (lastX - (((cvs.player.width - csize * 2) / 2) + csize)));

        // log("angle", angle * (180 / Math.PI));

        this.angle = angle;

        this.drawFace();
    },
    drawFace: function() {
        ctx.player.save();

        var r = 3.5;
        ctx.player.strokeStyle = "#000000";
        ctx.player.beginPath();
        ctx.player.moveTo(((cvs.player.width - csize * 2) / 2) + csize, ((cvs.player.height - csize * 2) / 2) + csize);
        ctx.player.lineTo(
            (((cvs.player.width - csize * 2) / 2) + csize) + r * Math.cos(this.angle),
            (((cvs.player.height - csize * 2) / 2) + csize) + r * Math.sin(this.angle)
        );
        ctx.player.stroke();
        ctx.player.closePath();

        ctx.player.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.player.beginPath();
        ctx.player.arc(
            (((cvs.player.width - csize * 2) / 2) + csize) + r * Math.cos(this.angle),
            (((cvs.player.height - csize * 2) / 2) + csize) + r * Math.sin(this.angle),
            this.radius, this.angle + Math.PI * 1.55, this.angle + Math.PI * 0.45
        );
        ctx.player.fill();
        ctx.player.closePath();

        ctx.player.fillStyle = "#000000ef";
        try {
            ctx.player.fillStyle = colors[chunks[this.cy][this.cx][parseInt((this.x % (cnr * 2 * csize)) / csize)][parseInt((this.y % (cnr * 2 * csize)) / csize)].toString().slice(0, 1)] + "ef";
        } catch (err) {}
        // ctx.fillStyle = "rgba(255, 255, 255, 0.9)";

        ctx.player.beginPath();
        ctx.player.arc(
            (((cvs.player.width - csize * 2) / 2) + csize) + r * Math.cos(this.angle),
            (((cvs.player.height - csize * 2) / 2) + csize) + r * Math.sin(this.angle),
            this.radius - 1, this.angle + Math.PI * 1.65, this.angle + Math.PI * 0.35
        );
        ctx.player.fill();
        ctx.player.closePath();

        ctx.player.restore();
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
                    ["enemy"], false, "bulletPlayer", // collidableWith, isColliding, type
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
    }
});