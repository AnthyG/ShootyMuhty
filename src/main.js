moment = require("moment");

require("./essentialStuff.js");

require("./classes.js");

/** CREDIT FOR THE SCROLL-TRANSFORM-STUFF GOES TO
 *  https://stackoverflow.com/a/5526721/5712160
 * http://phrogz.net/tmp/canvas_zoom_to_cursor.html
 */
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
    keys = [],
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

enemies = [];
spawnEnemy = function() {
    enemies.push(new Enemy(
        p.x, // x
        p.y, // y
        0, 0, // vel
        4, // speed
        0.95, // accel
        0.95, // fric
        p.cx, p.cy, // c
        0, // angle
        3, // sprintAccel
        20, 20, // ammo
        30000, 0, // ammoReload
        false, // shooting
        4000, 0, // shootCooldown
        10, // bulletSpeed
        3, // bulletAccel
        1, // bulletFriction
        25000, // bulletTime
        1, // bulletDmg
        [], // bullets
        5 // hp
    ));
};
// interval = setInterval(spawnEnemy);

function init(seedR2) {
    var seedR2 = seedR2 || parseInt(generateUUID());
    seedR = seedR2;
    seed = Math.seed(seedR)();
    log("Seed", seedR2, seed);

    chunks = [];

    var camSize = 1;

    p = new Player(
        cvs.player.width / 2 - csize, // x
        cvs.player.height / 2 - csize, // y
        0, 0, // vel
        4, // speed
        1, // accel
        0.875, // fric
        0, 0, // c
        0, // angle
        3, // sprintAccel
        camSize, camSize, // cam
        20, 20, // ammo
        30000, 0, // ammoReload
        false, // shooting
        4000, 0, // shootCooldown
        10, // bulletSpeed
        3, // bulletAccel
        1, // bulletFriction
        25000, // bulletTime
        3, // bulletDmg
        [], // bullets
        10 // hp
    );

    old_p = {};

    inited = false;

    spawnEnemy();

    requestAnimationFrame(update);
}

iterateCvsLoads = function(cb, cvsLoads) {
    var cvsLoads = cvsLoads || ["ground", "walls", "items", "bullets", "player", "enemies"];

    for (var li = 0; li < cvsLoads.length; li++) {
        var l = cvsLoads[li];

        cb(l, li, cvsLoads);
    }
}

window.onload = function() {
    cvs = {},
        ctx = {};

    iterateCvsLoads(function(l) {
        cvs[l] = document.getElementById("cvs-" + l);
        ctx[l] = cvs[l].getContext("2d");

        ctx[l].imageSmoothingEnabled = false;

        trackTransforms(ctx[l]);
    });

    vrly = {};

    vrlyLoads = ["info", "events"];

    for (var li = 0; li < vrlyLoads.length; li++) {
        var l = vrlyLoads[li];

        vrly[l] = document.getElementById("vrly-" + l);
    }

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);

    vrly.events.addEventListener('mousemove', function(evt) {
        lastX = evt.offsetX || (evt.pageX - vrly.events.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - vrly.events.offsetTop);
        // lastTransformX = evt.offsetX || (evt.pageX - cvs.offsetLeft);
        // lastTransformY = evt.offsetY || (evt.pageY - cvs.offsetTop);
    }, false);

    vrly.events.addEventListener('mousedown', function(evt) {
        p.shooting = true;
    }, false);
    vrly.events.addEventListener('mouseup', function(evt) {
        p.shooting = false;
    }, false);
    vrly.events.addEventListener('click', function(evt) {
        p.shoot();
    }, false);

    lastTransformX = vrly.events.offsetWidth / 2;
    lastTransformY = vrly.events.offsetHeight / 2;

    var scaleFactor = 1.1;
    var zoom = function(clicks) {
        iterateCvsLoads(function(l) {
            var pt = ctx[l].transformedPoint(lastTransformX, lastTransformY);
            ctx[l].translate(pt.x, pt.y);
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

            ctx[l].scale(factor, factor);
            ctx[l].translate(-pt.x, -pt.y);
        });
    };

    var handleScroll = function(evt) {
        var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        if (delta) zoom(delta);
        return evt.preventDefault() && false;
    };
    vrly.events.addEventListener('DOMMouseScroll', handleScroll, false);
    vrly.events.addEventListener('mousewheel', handleScroll, false);

    init(2);
};

function keyDownHandler(event) {
    var keyPressed = event.keyCode;

    // log("Key down", keyPressed);

    keys[keyPressed] = true;
}

function keyUpHandler(event) {
    var keyPressed = event.keyCode;

    // log("Key up", keyPressed);

    keys[keyPressed] = false;
}

drawLand = function(x, y, s) {
    var offset = 1 * csize;

    var x = x + offset;
    var y = y + offset;

    // log(x, y, s);

    return (function() {
        var sS = s.toString().slice(0, 1);

        var clr = colors[sS];
        // var clr = "#" + sS + sS + sS + sS + sS + sS;

        // var sS = s.toString().slice(2);
        // var clr = "#" + sS[1] + sS[2] + sS[3] + sS[4] + sS[5] + sS[6];

        ctx.ground.fillStyle = clr;

        // log("Drawing land-tile", x, y, x * csize, y * csize, clr, s);

        ctx.ground.fillRect(x, y, csize, csize);

        // ctx.ground.fillStyle = "white";
        // ctx.ground.font = "8px Arial";
        // ctx.ground.textAlign = "left";
        // // ctx.ground.fillText(sS, x + 5, y + 15);
        // ctx.ground.fillText(sS + ":" + (x) + "|" + (y), x + 5, y + 25);
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

    iterateCvsLoads(function(l) {
        // ctx[l].fillStyle = (l !== "ground" ? "transparent" : "black");
        // ctx.fillRect(0, 0, cvs.width, cvs.height);
        var p1 = ctx[l].transformedPoint(0, 0);
        var p2 = ctx[l].transformedPoint(cvs[l].width, cvs[l].height);

        if (l !== "") {
            // ctx[l].fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
            ctx[l].clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        }
    });

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

    for (var ei = 0; ei < enemies.length; ei++) {
        var e = enemies[ei];

        e.ai();
        e.move();
    }

    ctx.ground.save();

    var hinX = cnr * csize + csize - p.x,
        hinY = cnr * csize + csize - p.y;

    ctx.ground.translate(hinX, hinY);

    for (var cy = -p.camH; cy < p.camH + 1; cy++) {
        if (typeof chunks[p.cy + cy] !== "undefined") {
            for (var cx = -p.camW; cx < p.camW + 1; cx++) {
                if (typeof chunks[p.cy + cy][p.cx + cx] !== "undefined") {
                    let arr = chunks[p.cy + cy][p.cx + cx];

                    // log("Drawing chunk", p.cy + cy, p.cx + cx, arr);

                    for (var y = 0; y < cnr * 2; y++) {
                        for (var x = 0; x < cnr * 2; x++) {
                            drawLand((cx * cnr * 2 + x - 1) * csize, (cy * cnr * 2 + y - 1) * csize, arr[x][y]);
                        }
                    }

                    // ctx.ground.fillStyle = "white";
                    // ctx.ground.font = "12px Arial";
                    // ctx.ground.textAlign = "left";
                    // ctx.ground.fillText((p.cx + cx) + " | " + (p.cy + cy), cx * cnr * 2 * csize + 5, cy * cnr * 2 * csize + 15);

                    // ctx.ground.strokeStyle = "red";
                    // ctx.ground.strokeRect(cx * cnr * 2 * csize, cy * cnr * 2 * csize, cnr * 2 * csize, cnr * 2 * csize);
                }
            }
        }
    }

    ctx.ground.translate(-hinX, -hinY);

    ctx.ground.restore();

    p.tick(timestamp_diff);

    p.draw();

    for (var ei = 0; ei < enemies.length; ei++) {
        var e = enemies[ei];

        e.draw();
    }

    // Update stuff above here please

    while (fpsis.length > 0 && fpsis[0] <= timestamp - 1000) {
        fpsis.shift();
    }
    fpsis.push(timestamp);
    fpsi = fpsis.length;
    uDone = false;

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
    vrly.info.innerHTML = "";
    for (var i = 0; i < infoTexts.length; i++) {
        var t = infoTexts[i];

        vrly.info.innerHTML += t + "<br />";
    }

    requestAnimationFrame(update);
}