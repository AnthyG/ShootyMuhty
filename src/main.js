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
    fpsi = cntr = 0,
    uDone = false,
    cnr = 4,
    csize = 50;

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
        draw: function() {
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

            if (Math.abs(this.velX) < 0.00001)
                this.velX = 0;
            if (Math.abs(this.velY) < 0.00001)
                this.velY = 0;

            this.velX *= this.friction;
            this.x += this.velX;
            this.velY *= this.friction;
            this.y += this.velY;

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
                this.y = 400;
                this.cy -= 1;
            }
            if (this.x > 400) {
                this.x = 0;
                this.cx += 1;
            }
            if (this.y > 400) {
                this.y = 0;
                this.cy += 1;
            }
            if (this.x < 0) {
                this.x = 400;
                this.cx -= 1;
            }

            ctx.save();

            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.strokeStyle = "20px solid black";
            ctx.beginPath();
            ctx.arc(
                (p.x + csize),
                (p.y + csize),
                10, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();

            ctx.restore();
        }
    };

    old_p = {};

    inited = false;

    update();
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

    // cvs.addEventListener('mousemove', function(evt) {
    //     lastX = evt.offsetX || (evt.pageX - cvs.offsetLeft);
    //     lastY = evt.offsetY || (evt.pageY - cvs.offsetTop);
    // }, false);
    lastX = cvs.offsetWidth / 2;
    lastY = cvs.offsetHeight / 2;
    var scaleFactor = 1.1;
    var zoom = function(clicks) {
        var pt = ctx.transformedPoint(lastX, lastY);
        ctx.translate(pt.x, pt.y);
        var factor = Math.pow(scaleFactor, clicks);
        ctx.scale(factor, factor);
        ctx.translate(-pt.x, -pt.y);
    }

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
        ctx.save();

        var sS = s.toString().slice(0, 1);

        var clr = colors[sS];
        // var clr = "#" + sS + sS + sS + sS + sS + sS;

        // var sS = s.toString().slice(2);
        // var clr = "#" + sS[1] + sS[2] + sS[3] + sS[4] + sS[5] + sS[6];

        ctx.fillStyle = clr;

        // log("Drawing land-tile", x, y, x * csize, y * csize, clr, s);

        ctx.fillRect(x, y, csize, csize);

        ctx.fillStyle = "white";
        ctx.font = "10px Arial";
        ctx.textAlign = "left";
        ctx.fillText(sS, x + 5, y + 15);
        // ctx.fillText(sS + ":" + (x - offset) + "|" + (y - offset), x * csize + 5, y * csize + 15);

        ctx.restore();
    })();
};

genChunk = function(cx, cy) {
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

function update() {
    ctx.fillStyle = "black";
    // ctx.fillRect(0, 0, cvs.width, cvs.height);
    var p1 = ctx.transformedPoint(0, 0);
    var p2 = ctx.transformedPoint(cvs.width, cvs.height);
    ctx.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    // ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

    if (fpsi >= fps) {
        fpsi = 0;
        cntr++;
        uDone = true;
    }

    // Update-stuff beneath here please

    if (uDone || !inited) {
        inited = true;
        if (JSON.stringify(old_p) !== JSON.stringify(p)) {
            // log("Player updated");

            genChunk(p.cx, p.cy);
            for (var cy = -p.camH; cy < p.camH + 1; cy++) {
                for (var cx = -p.camW; cx < p.camW + 1; cx++) {
                    genChunk(p.cx + cx, p.cy + cy);
                }
            }

            old_p = JSON.parse(JSON.stringify(p));
        }
    }

    for (var cy = -p.camH; cy < p.camH + 1; cy++) {
        if (typeof chunks[p.cy + cy] !== "undefined") {
            for (var cx = -p.camW; cx < p.camW + 1; cx++) {
                if (typeof chunks[p.cy + cy][p.cx + cx] !== "undefined") {
                    let arr = chunks[p.cy + cy][p.cx + cx];

                    // log("Drawing chunk", p.cy + cy, p.cx + cx, arr);

                    for (var y = 0; y < cnr * 2; y++) {
                        for (var x = 0; x < cnr * 2; x++) {
                            // x * csize, y * csize
                            drawLand((cx * cnr * 2 + x) * csize, (cy * cnr * 2 + y) * csize, arr[x][y]);
                        }
                    }
                }
            }
        }
    }

    p.draw();

    // Update stuff above here please

    ctx.fillStyle = "white";
    ctx.font = "10px Arial";
    ctx.textAlign = "left";
    ctx.fillText("fps: " + fpsi + "/" + fps, 5, 1 * 15);
    ctx.fillText("cntr: " + cntr, 5, 2 * 15);
    ctx.fillText("x | y: " + p.x + " | " + p.y, 5, 3 * 15);
    ctx.fillText("cx | cy: " + p.cx + " | " + p.cy, 5, 4 * 15);
    ctx.fillText("velX | velY: " + p.velX + " | " + p.velY, 5, 5 * 15);
    // ctx.fillText("cx | cy: " + (p.cx % cnr) + " | " + (p.cy % cnr), 5, 4 * 15);
    // ctx.fillText("cseed: " + cseed, 5, 5 * 15);

    fpsi++;
    uDone = false;

    requestAnimationFrame(update);
}