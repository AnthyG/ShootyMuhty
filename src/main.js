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



interval = undefined;
fps = 1,
    fpsi = cntr = 0,
    uDone = false,
    cnr = 4,
    csize = 50;

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
        draw: function() {
            if (this.keys[38] || this.keys[87]) { // Up
                if (this.velY > -this.speed)
                    this.velY -= this.accel + (this.keys[16] ? this.sprint_accel : 0);

                // this.y -= this.speed;
                // if (this.y < 0) {
                //     this.y = 400;
                //     this.cy -= 1;
                // }

                // this.cy = (this.y % 400);
                // this.cy = Math.round((400 % this.y) / 400);
            }
            if (this.keys[39] || this.keys[68]) { // Right
                if (this.velX < this.speed)
                    this.velX += this.accel + (this.keys[16] ? this.sprint_accel : 0);

                // this.x += this.speed;
                // if (this.x > 400) {
                //     this.x = 0;
                //     this.cx += 1;
                // }

                // this.cx = (this.x % 400);
                // this.cx = Math.round((400 % this.x) / 400);
            }
            if (this.keys[40] || this.keys[83]) { // Down
                if (this.velY < this.speed)
                    this.velY += this.accel + (this.keys[16] ? this.sprint_accel : 0);

                // this.y += this.speed;
                // if (this.y > 400) {
                //     this.y = 0;
                //     this.cy += 1;
                // }

                // this.cy = (this.y % 400);
                // this.cy = Math.round((400 % this.y) / 400);
            }
            if (this.keys[37] || this.keys[65]) { // Left
                if (this.velX > -this.speed)
                    this.velX -= this.accel + (this.keys[16] ? this.sprint_accel : 0);

                // this.x -= this.speed;
                // if (this.x < 0) {
                //     this.x = 400;
                //     this.cx -= 1;
                // }

                // this.cx = (this.x % 400);
                // this.cx = Math.round((400 % this.x) / 400);
            }

            this.velX *= this.friction;
            this.x += this.velX;
            this.velY *= this.friction;
            this.y += this.velY;

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
                (p.x + csize), // (p.x + csize) % (cnr * 2 * csize) + csize,
                (p.y + csize), // (p.y + csize) % (cnr * 2 * csize) + csize,
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
    var offset = 1;

    var x = x + offset;
    var y = y + offset;

    return (function() {
        ctx.save();

        var sS = s.toString().slice(0, 1);
        var clr = "#" + sS + sS + sS + sS + sS + sS;
        // var sS = s.toString().slice(2);
        // var clr = "#" + sS[1] + sS[2] + sS[3] + sS[4] + sS[5] + sS[6];

        ctx.fillStyle = clr;

        // log("Drawing land-tile", x, y, x * csize, y * csize, clr, s);

        ctx.fillRect(x * csize, y * csize, csize, csize);

        ctx.fillStyle = "white";
        ctx.font = "10px Arial";
        ctx.textAlign = "left";
        ctx.fillText(sS + ":" + (x - offset) + "|" + (y - offset), x * csize + 5, y * csize + 15);

        ctx.restore();
    })();
};

function update() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    if (fpsi >= fps) {
        fpsi = 0;
        cntr++;
        uDone = true;
    }

    // Update-stuff beneath here please


    // cseed = Math.seed(p.cx + p.cy + seed)();
    // log("Cur seed", cseed);

    if (uDone || !inited) {
        inited = true;
        if (JSON.stringify(old_p) !== JSON.stringify(p)) {
            var s_x = Math.seed(p.cx * seed + seed)(),
                s_y = Math.seed(p.cy * seed + seed)();

            var s_ul = Math.seed(s_y * cnr - s_x)() * 10,
                s_ur = Math.seed(s_y * cnr + s_x)() * 10,
                s_ll = Math.seed(-s_y * cnr - s_x)() * 10,
                s_lr = Math.seed(-s_y * cnr + s_x)() * 10;

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



            old_p = JSON.parse(JSON.stringify(p));
        }
    }

    for (var x = 0; x < cnr * 2; x++) {
        let arr = ipoArrsV[x];
        for (var y = 0; y < cnr * 2; y++) {
            drawLand(x, y, arr[y]);
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

/*
a2d = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

a1d = [1, 2, 3, 4, 5, 6, 7, 8, 9];

a2d[1][2] === a1d[1 * 3 + 2];
*/