moment = require("moment");

log = function(...text) {
    console.log(moment().format("HH:mm:ss"), text);
};

Math.seed = function(s) {
    return function() {
        s = Math.sin(s) * 10000;
        return s - Math.floor(s);
    };
};

interpolationArray = function(startnum, endnum, spaces) {
    var spaces = spaces - 1,
        arr = [],
        temp = spaces;
    var diff = (startnum > endnum) ? startnum - endnum : endnum - startnum;
    while (arr.length != spaces) {
        var add = (diff) / temp;
        // var add = Math.round((diff) / temp);
        if (startnum > endnum) {
            arr.push(startnum - add);
            startnum -= add;
        } else {
            arr.push(startnum + add);
            startnum += add;
        }
        temp--;
        diff = diff - add;
    }
    return arr;
}

generateUUID = (typeof(window.crypto) != 'undefined' &&
        typeof(window.crypto.getRandomValues) != 'undefined') ?
    function() {
        // If we have a cryptographically secure PRNG, use that
        // https://stackoverflow.com/questions/6906916/collisions-when-generating-uuids-in-javascript
        var buf = new Uint16Array(8);
        window.crypto.getRandomValues(buf);
        var S4 = function(num) {
            var ret = num.toString(16);
            while (ret.length < 4) {
                ret = "0" + ret;
            }
            return ret;
        };
        return (S4(buf[0]) + S4(buf[1]) + "-" + S4(buf[2]) + "-" + S4(buf[3]) + "-" + S4(buf[4]) + "-" + S4(buf[5]) + S4(buf[6]) + S4(buf[7]));
    }

:

function() {
    // Otherwise, just use Math.random
    // https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Adds ctx.getTransform() - returns an SVGMatrix
// Adds ctx.transformedPoint(x,y) - returns an SVGPoint
function trackTransforms(ctx) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    var xform = svg.createSVGMatrix();
    ctx.getTransform = function() { return xform; };

    var savedTransforms = [];
    var save = ctx.save;
    ctx.save = function() {
        savedTransforms.push(xform.translate(0, 0));
        return save.call(ctx);
    };
    var restore = ctx.restore;
    ctx.restore = function() {
        xform = savedTransforms.pop();
        return restore.call(ctx);
    };

    var scale = ctx.scale;
    ctx.scale = function(sx, sy) {
        xform = xform.scaleNonUniform(sx, sy);
        return scale.call(ctx, sx, sy);
    };
    var rotate = ctx.rotate;
    ctx.rotate = function(radians) {
        xform = xform.rotate(radians * 180 / Math.PI);
        return rotate.call(ctx, radians);
    };
    var translate = ctx.translate;
    ctx.translate = function(dx, dy) {
        xform = xform.translate(dx, dy);
        return translate.call(ctx, dx, dy);
    };
    var transform = ctx.transform;
    ctx.transform = function(a, b, c, d, e, f) {
        var m2 = svg.createSVGMatrix();
        m2.a = a;
        m2.b = b;
        m2.c = c;
        m2.d = d;
        m2.e = e;
        m2.f = f;
        xform = xform.multiply(m2);
        return transform.call(ctx, a, b, c, d, e, f);
    };
    var setTransform = ctx.setTransform;
    ctx.setTransform = function(a, b, c, d, e, f) {
        xform.a = a;
        xform.b = b;
        xform.c = c;
        xform.d = d;
        xform.e = e;
        xform.f = f;
        return setTransform.call(ctx, a, b, c, d, e, f);
    };
    var pt = svg.createSVGPoint();
    ctx.transformedPoint = function(x, y) {
        pt.x = x;
        pt.y = y;
        return pt.matrixTransform(xform.inverse());
    }
}



interval = undefined;
fps = 1,
    timestamp_s = undefined,
    timestamp_f = timestamp_lf = 0,
    fpsis = [],
    fpsi = 0,
    cntr = 1,
    uDone = false,
    cnr = 4,
    csize = 50,
    lastX = 0, lastY = 0;

colors = {
    0: "#3BAFDA",
    1: "#4FC1E9",
    2: "#F6BB42",
    3: "#FFCE54",
    4: "#AA8E69",
    5: "#A0D468",
    6: "#8CC152",
    7: "#2ABA66",
    8: "#AAB2BD",
    9: "#E6E9ED"
};

function init(seedR2) {
    var seedR2 = seedR2 || parseInt(generateUUID());
    seedR = seedR2;
    seed = Math.seed(seedR)();
    log("Seed", seedR2, seed);

    chunks = [];

    p = {
        x: (cvs.width - csize * 2) / 2,
        y: (cvs.height - csize * 2) / 2,

        velX: 0,
        velY: 0,
        speed: 4,

        accel: 1,
        sprint_accel: 3,
        friction: 0.875,

        keys: [],

        cx: 0,
        cy: 0,
        camW: 2,
        camH: 2,

        faceDir: 0,

        maxAmmo: 20,
        ammo: 20,
        ammoReload: 30000,
        ammoCurReload: 0,

        shooting: false,
        shootCooldown: 4000,
        shootCurCooldown: 0,

        bulletSpeed: 10,
        bulletAccel: 3,
        bulletFriction: 1,
        bulletTime: 25000,

        bullets: [],

        move: function() {
            if (this.keys[38] || this.keys[87]) { // Up
                if (this.velY > -this.speed)
                    this.velY -= this.accel + (this.keys[16] ? this.sprint_accel : 0);
            }
            if (this.keys[39] || this.keys[68]) { // Right
                if (this.velX < this.speed)
                    this.velX += this.accel + (this.keys[16] ? this.sprint_accel : 0);
            }
            if (this.keys[40] || this.keys[83]) { // Down
                if (this.velY < this.speed)
                    this.velY += this.accel + (this.keys[16] ? this.sprint_accel : 0);
            }
            if (this.keys[37] || this.keys[65]) { // Left
                if (this.velX > -this.speed)
                    this.velX -= this.accel + (this.keys[16] ? this.sprint_accel : 0);
            }

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
            ctx.save();

            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.strokeStyle = "20px solid black";
            ctx.beginPath();
            ctx.arc(
                ((cvs.width - csize * 2) / 2) + csize,
                ((cvs.height - csize * 2) / 2) + csize,
                10, 0, Math.PI * 2
            );
            ctx.stroke();
            ctx.fill();
            ctx.closePath();

            ctx.restore();

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
            var angle = -Math.atan2(-(lastY - (((cvs.height - csize * 2) / 2) + csize)), (lastX - (((cvs.width - csize * 2) / 2) + csize)));

            // log("faceDir", angle * (180 / Math.PI));

            this.faceDir = angle;

            this.drawFace();
        },
        drawFace: function() {
            ctx.save();

            var r = 3.5;
            ctx.strokeStyle = "#000000";
            ctx.moveTo(((cvs.width - csize * 2) / 2) + csize, ((cvs.height - csize * 2) / 2) + csize);
            ctx.lineTo(
                (((cvs.width - csize * 2) / 2) + csize) + r * Math.cos(this.faceDir),
                (((cvs.height - csize * 2) / 2) + csize) + r * Math.sin(this.faceDir)
            );
            ctx.stroke();

            ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
            ctx.beginPath();
            ctx.arc(
                (((cvs.width - csize * 2) / 2) + csize) + r * Math.cos(this.faceDir),
                (((cvs.height - csize * 2) / 2) + csize) + r * Math.sin(this.faceDir),
                5, this.faceDir + Math.PI * 1.55, this.faceDir + Math.PI * 0.45
            );
            ctx.fill();
            ctx.closePath();

            ctx.fillStyle = colors[chunks[this.cy][this.cx][parseInt((this.x % (cnr * 2 * csize)) / csize)][parseInt((this.y % (cnr * 2 * csize)) / csize)].toString().slice(0, 1)] + "ef";
            // ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.beginPath();
            ctx.arc(
                (((cvs.width - csize * 2) / 2) + csize) + r * Math.cos(this.faceDir),
                (((cvs.height - csize * 2) / 2) + csize) + r * Math.sin(this.faceDir),
                4, this.faceDir + Math.PI * 1.65, this.faceDir + Math.PI * 0.35
            );
            ctx.fill();
            ctx.closePath();

            ctx.restore();
        },
        Bullet: function(dat_) {
            // log("Dat 1", JSON.parse(JSON.stringify(dat_)));
            return (function(dat) {
                return {
                    uuid: generateUUID(),

                    x: dat.x,
                    y: dat.y,
                    cx: dat.cx,
                    cy: dat.cy,

                    clr: colors[chunks[dat.cy][dat.cx][parseInt((dat.x % (cnr * 2 * csize)) / csize)][parseInt((dat.y % (cnr * 2 * csize)) / csize)].toString().slice(0, 1)],

                    velX: dat.velX,
                    velY: dat.velY,

                    speed: dat.bulletSpeed,

                    accel: dat.bulletAccel,
                    friction: dat.bulletFriction,

                    angle: dat.faceDir,

                    time: dat.bulletTime,

                    print: function() {
                        log("Bullet", this, JSON.parse(JSON.stringify(this)));
                    },

                    move: function() {
                        // this.print();

                        if (this.velY > -this.speed && this.velY < this.speed)
                            this.velY += Math.sin(this.angle) * this.accel;
                        if (this.velX < this.speed && this.velX > -this.speed)
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
                        ctx.save();

                        var hinX = cnr * csize - p.x - p.cx * cnr * 2 * csize,
                            hinY = cnr * csize - p.y - p.cy * cnr * 2 * csize;

                        ctx.translate(hinX, hinY);

                        ctx.fillStyle = this.clr + "ee";
                        ctx.strokeStyle = "rgba(0, 0, 0, 0.95)";
                        ctx.beginPath();
                        ctx.arc((this.cx * cnr * 2) * csize + this.x + csize, (this.cy * cnr * 2) * csize + this.y + csize,
                            // ctx.arc((this.cx - dat.cx) * cnr * 2 * csize + (this.x - dat.x) + csize, (this.cy - dat.cy) * cnr * 2 * csize + (this.y - dat.y) + csize,
                            5, 0, Math.PI * 2
                        );
                        ctx.stroke();
                        ctx.fill();
                        ctx.closePath();

                        ctx.translate(-hinX, -hinY);

                        ctx.restore();
                    },
                    tick: function(ms) {
                        // log("tick 2 ", ms);

                        this.time -= ms;
                    }
                };
            })(dat_);
        },
        shoot: function() {
            if (this.shootCurCooldown !== 0 ||
                this.ammoCurReload !== 0)
                return false;

            if (this.ammo > 0) {
                var bi = this.bullets.push(this.Bullet(JSON.parse(JSON.stringify(this)))) - 1;

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
    };

    old_p = {};

    inited = false;

    requestAnimationFrame(update);
}

window.onload = function() {
    cvs = document.getElementById("cvs");
    ctx = cvs.getContext("2d");

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);

    /** CREDIT FOR THE SCROLL-TRANSFORM-STUFF GOES TO
     *  https://stackoverflow.com/a/5526721/5712160
     * http://phrogz.net/tmp/canvas_zoom_to_cursor.html
     */
    trackTransforms(ctx);

    cvs.addEventListener('mousemove', function(evt) {
        lastX = evt.offsetX || (evt.pageX - cvs.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - cvs.offsetTop);
        // lastTransformX = evt.offsetX || (evt.pageX - cvs.offsetLeft);
        // lastTransformY = evt.offsetY || (evt.pageY - cvs.offsetTop);
    }, false);

    cvs.addEventListener('mousedown', function(evt) {
        p.shooting = true;
    }, false);
    cvs.addEventListener('mouseup', function(evt) {
        p.shooting = false;
    }, false);
    cvs.addEventListener('click', function(evt) {
        p.shoot();
    }, false);

    lastTransformX = cvs.offsetWidth / 2;
    lastTransformY = cvs.offsetHeight / 2;

    var scaleFactor = 1.5;
    var zoom = function(clicks) {
        var pt = ctx.transformedPoint(lastTransformX, lastTransformY);
        ctx.translate(pt.x, pt.y);
        var factor = Math.pow(scaleFactor, clicks);

        // log("zoom-factor", clicks, factor, factor > 1, factor < 1);
        // if (factor > 1) {
        //     p.camW > 2 && (p.camW -= p.camW);
        //     p.camH > 2 && (p.camH -= p.camH);
        //     if (p.camW === 0)
        //         p.camW = 1;
        //     if (p.camH === 0)
        //         p.camH = 1;
        // } else if (factor < 1) {
        //     p.camW += p.camW;
        //     p.camH += p.camH;
        // }

        ctx.scale(factor, factor);
        ctx.translate(-pt.x, -pt.y);
    };

    var handleScroll = function(evt) {
        var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        if (delta) zoom(delta);
        return evt.preventDefault() && false;
    };
    cvs.addEventListener('DOMMouseScroll', handleScroll, false);
    cvs.addEventListener('mousewheel', handleScroll, false);

    init(2);
};

function keyDownHandler(event) {
    var keyPressed = event.keyCode;

    // log("Key down", keyPressed);

    p.keys[keyPressed] = true;
}

function keyUpHandler(event) {
    var keyPressed = event.keyCode;

    // log("Key up", keyPressed);

    p.keys[keyPressed] = false;
}

drawLand = function(x, y, s) {
    var offset = 1 * csize;

    var x = x + offset;
    var y = y + offset;

    return (function() {
        var sS = s.toString().slice(0, 1);

        var clr = colors[sS];
        // var clr = "#" + sS + sS + sS + sS + sS + sS;

        // var sS = s.toString().slice(2);
        // var clr = "#" + sS[1] + sS[2] + sS[3] + sS[4] + sS[5] + sS[6];

        ctx.fillStyle = clr;

        // log("Drawing land-tile", x, y, x * csize, y * csize, clr, s);

        ctx.fillRect(x, y, csize, csize);

        // ctx.fillStyle = "white";
        // ctx.font = "10px Arial";
        // ctx.textAlign = "left";
        // ctx.fillText(sS, x + 5, y + 15);
        // ctx.fillText(sS + ":" + (x - offset) + "|" + (y - offset), x * csize + 5, y * csize + 15);
    })();
};

genChunk = function(cx, cy) {
    if (typeof chunks[cy] !== "undefined")
        if (typeof chunks[cy][cx] !== "undefined")
            return true;

    var s_x = Math.seed(cx * seed + seed)(),
        s_y = Math.seed(cy * seed + seed)();

    var s_ul = Math.seed(s_y * cnr - s_x)() * 10,
        s_ur = Math.seed(s_y * cnr + s_x)() * 10,
        s_ll = Math.seed(-s_y * cnr - s_x)() * 10,
        s_lr = Math.seed(-s_y * cnr + s_x)() * 10;

    var cnr21 = cnr * 2 - 1;
    if (typeof chunks[cy - 1] !== "undefined") { // Above
        if (typeof chunks[cy - 1][cx - 1] !== "undefined") { // Above to the left
            s_ul = chunks[cy - 1][cx - 1][cnr21][cnr21];
        }
        if (typeof chunks[cy - 1][cx] !== "undefined") { // Directly above
            s_ul = chunks[cy - 1][cx][0][cnr21];
            s_ur = chunks[cy - 1][cx][cnr21][cnr21];
        }
        if (typeof chunks[cy - 1][cx + 1] !== "undefined") { // Above to the right
            s_ur = chunks[cy - 1][cx + 1][0][cnr21];
        }
    }
    if (typeof chunks[cy] !== "undefined") { // Same line
        if (typeof chunks[cy][cx - 1] !== "undefined") { // Same line to the left
            s_ul = chunks[cy][cx - 1][cnr21][0];
            s_ll = chunks[cy][cx - 1][cnr21][cnr21];
        }
        if (typeof chunks[cy][cx + 1] !== "undefined") { // Same line to the right
            s_ur = chunks[cy][cx + 1][0][0];
            s_lr = chunks[cy][cx + 1][0][cnr21];
        }
    }
    if (typeof chunks[cy + 1] !== "undefined") { // Beneath
        if (typeof chunks[cy + 1][cx - 1] !== "undefined") { // Beneath to the left
            s_ll = chunks[cy + 1][cx - 1][cnr21][0];
        }
        if (typeof chunks[cy + 1][cx] !== "undefined") { // Directly beneath
            s_ll = chunks[cy + 1][cx][0][0];
            s_lr = chunks[cy + 1][cx][cnr21][0];
        }
        if (typeof chunks[cy + 1][cx + 1] !== "undefined") { // Beneath to the right
            s_lr = chunks[cy + 1][cx + 1][0][0];
        }
    }

    // log("sCorners", s_ul, s_ur, s_ll, s_lr);

    ipoArrsH = [
        interpolationArray(s_ul, s_ur, cnr * 2),
        interpolationArray(s_ll, s_lr, cnr * 2)
    ];
    ipoArrsH[0].unshift(s_ul);
    ipoArrsH[0][cnr * 2 - 1] = s_ur;
    ipoArrsH[1].unshift(s_ll);
    ipoArrsH[1][cnr * 2 - 1] = s_lr;

    // log("ipoH", ipoArrsH);

    ipoArrsV = [];
    for (var x = 0; x < cnr * 2; x++) {
        var x1 = ipoArrsH[0][x],
            x2 = ipoArrsH[1][x];

        // log("g-ipoV", x, x1, x2);

        ipoArrsV[x] = interpolationArray(x1, x2, cnr * 2);
        ipoArrsV[x].unshift(x1);
        ipoArrsV[x][cnr * 2 - 1] = x2;
    }

    // log("ipoV", ipoArrsV);

    if (typeof chunks[cy] === "undefined")
        chunks[cy] = [];
    if (typeof chunks[cy][cx] === "undefined")
        chunks[cy][cx] = ipoArrsV;
}

function update(timestamp) {
    if (!timestamp_s) timestamp_s = timestamp;
    timestamp_f = timestamp - timestamp_s;
    if (!timestamp_lf) timestamp_lf = timestamp_f;
    timestamp_diff = timestamp_f - timestamp_lf;

    ctx.fillStyle = "black";
    // ctx.fillRect(0, 0, cvs.width, cvs.height);
    var p1 = ctx.transformedPoint(0, 0);
    var p2 = ctx.transformedPoint(cvs.width, cvs.height);
    ctx.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    // ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

    if (timestamp_diff >= 500) {
        uDone = true;
    }
    if (timestamp_diff >= 1000) {
        fpsi = 0;
        cntr++;

        // log(timestamp_f, timestamp_lf, timestamp_diff);
        timestamp_lf = timestamp_f;
    }

    // Update-stuff beneath here please

    if (uDone || !inited) {
        inited = true;
        if (old_p.cx !== p.cx || old_p.cy !== p.cy || old_p.camW !== p.camW || old_p.camH !== p.camH) {
            log("Player updated");

            genChunk(p.cx, p.cy);
            for (var cy = -p.camH; cy < p.camH + 1; cy++) {
                for (var cx = -p.camW; cx < p.camW + 1; cx++) {
                    genChunk(p.cx + cx, p.cy + cy);
                }
            }

            old_p = JSON.parse(JSON.stringify(p));
        }
    }

    p.move();

    var hinX = cnr * csize - p.x,
        hinY = cnr * csize - p.y;

    ctx.translate(hinX, hinY);

    for (var cy = -p.camH; cy < p.camH + 1; cy++) {
        if (typeof chunks[p.cy + cy] !== "undefined") {
            for (var cx = -p.camW; cx < p.camW + 1; cx++) {
                if (typeof chunks[p.cy + cy][p.cx + cx] !== "undefined") {
                    let arr = chunks[p.cy + cy][p.cx + cx];

                    // log("Drawing chunk", p.cy + cy, p.cx + cx, arr);

                    for (var y = 0; y < cnr * 2; y++) {
                        for (var x = 0; x < cnr * 2; x++) {
                            // drawLand((cx * cnr * 2 + x) * csize - (Math.round(p.x) - cnr * csize), (cy * cnr * 2 + y) * csize - (Math.round(p.y) - cnr * csize), arr[x][y]);

                            drawLand((cx * cnr * 2 + x) * csize, (cy * cnr * 2 + y) * csize, arr[x][y]);
                        }
                    }
                }
            }
        }
    }

    ctx.translate(-hinX, -hinY);

    p.tick(timestamp_diff);

    p.draw();

    // Update stuff above here please

    while (fpsis.length > 0 && fpsis[0] <= timestamp - 1000) {
        fpsis.shift();
    }
    fpsis.push(timestamp);
    fpsi = fpsis.length;
    uDone = false;

    ctx.save();
    ctx.textAlign = "left";
    var infoTexts = [
        "fps: " + fpsi + "/" + fps,
        // "timestamp: " + timestamp,
        // "timestamps: " + timestamp_s + " | " + timestamp + " | " + timestamp_f,
        "cntr: " + cntr,
        "x | y: " + p.x + " | " + p.y,
        "cx | cy: " + p.cx + " | " + p.cy,
        // "velX | velY: " + p.velX + " | " + p.velY,
        // "lastX | lastY: " + lastX + " | " + lastY,
        // "rad: " + p.faceDir,
        "seed: " + seed,
        "ammo: " + p.ammo,
        "ammoCurReload: " + p.ammoCurReload,
        "shootCurCooldown: " + p.shootCurCooldown
    ];
    for (var i = 0; i < infoTexts.length; i++) {
        var t = infoTexts[i];

        ctx.strokeStyle = "5px solid black";
        ctx.font = "10px Arial";
        ctx.strokeText(t, 5, i * 15 + 15);
        ctx.fillStyle = "white";
        ctx.font = "10px Arial";
        ctx.fillText(t, 5, i * 15 + 15);
    }
    ctx.restore();

    requestAnimationFrame(update);
}