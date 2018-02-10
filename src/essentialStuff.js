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
};

/**
 * requestAnim shim layer by Paul Irish
 * Finds the first API that works to optimize the animation loop,
 * otherwise defaults to ~~setTimeout~~ setInterval.
 */
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function( /* function */ callback, /* DOMElement */ element) {
            window.setInterval(callback, 1000 / 60);
        };
})();

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

/**
 * QuadTree object.
 * 
 * FROM:
 *  http://blog.sklambert.com/html5-canvas-game-2d-collision-detection/
 *  https://github.com/straker/galaxian-canvas-game/blob/master/part4/space_shooter_part_four.js
 * 
 * The quadrant indexes are numbered as below:
 *     |
 *  1  |  0
 * —-+—-
 *  2  |  3
 *     |
 */
QuadTree = function(boundBox, lvl) {
    var maxObjects = 10;
    this.bounds = boundBox || {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
    var objects = [];
    this.nodes = [];
    var level = lvl || 0;
    var maxLevels = 5;
    /*
     * Clears the quadTree and all nodes of objects
     */
    this.clear = function() {
        objects = [];
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].clear();
        }
        this.nodes = [];
    };
    /*
     * Get all objects in the quadTree
     */
    this.getAllObjects = function(returnedObjects) {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].getAllObjects(returnedObjects);
        }
        for (var i = 0, len = objects.length; i < len; i++) {
            returnedObjects.push(objects[i]);
        }
        return returnedObjects;
    };
    /*
     * Return all objects that the object could collide with
     */
    this.findObjects = function(returnedObjects, obj) {
        if (typeof obj === "undefined") {
            console.log("UNDEFINED OBJECT");
            return;
        }
        var index = this.getIndex(obj);
        if (index != -1 && this.nodes.length) {
            this.nodes[index].findObjects(returnedObjects, obj);
        }
        for (var i = 0, len = objects.length; i < len; i++) {
            returnedObjects.push(objects[i]);
        }
        return returnedObjects;
    };
    /*
     * Insert the object into the quadTree. If the tree
     * excedes the capacity, it will split and add all
     * objects to their corresponding nodes.
     */
    this.insert = function(obj) {
        if (typeof obj === "undefined") {
            return;
        }
        if (obj instanceof Array) {
            for (var i = 0, len = obj.length; i < len; i++) {
                this.insert(obj[i]);
            }
            return;
        }
        if (this.nodes.length) {
            var index = this.getIndex(obj);
            // Only add the object to a subnode if it can fit completely
            // within one
            if (index != -1) {
                this.nodes[index].insert(obj);
                return;
            }
        }
        objects.push(obj);
        // Prevent infinite splitting
        if (objects.length > maxObjects && level < maxLevels) {
            if (this.nodes[0] == null) {
                this.split();
            }
            var i = 0;
            while (i < objects.length) {
                var index = this.getIndex(objects[i]);
                if (index != -1) {
                    this.nodes[index].insert((objects.splice(i, 1))[0]);
                } else {
                    i++;
                }
            }
        }
    };
    /*
     * Determine which node the object belongs to. -1 means
     * object cannot completely fit within a node and is part
     * of the current node
     */
    this.getIndex = function(obj) {
        var index = -1;
        var verticalMidpoint = this.bounds.x + this.bounds.width / 2;
        var horizontalMidpoint = this.bounds.y + this.bounds.height / 2;
        // Object can fit completely within the top quadrant
        var topQuadrant = (obj.y < horizontalMidpoint && obj.y + obj.height < horizontalMidpoint);
        // Object can fit completely within the bottom quandrant
        var bottomQuadrant = (obj.y > horizontalMidpoint);
        // Object can fit completely within the left quadrants
        if (obj.x < verticalMidpoint &&
            obj.x + obj.width < verticalMidpoint) {
            if (topQuadrant) {
                index = 1;
            } else if (bottomQuadrant) {
                index = 2;
            }
        }
        // Object can fix completely within the right quandrants
        else if (obj.x > verticalMidpoint) {
            if (topQuadrant) {
                index = 0;
            } else if (bottomQuadrant) {
                index = 3;
            }
        }
        return index;
    };
    /*
     * Splits the node into 4 subnodes
     */
    this.split = function() {
        // Bitwise or [html5rocks]
        var subWidth = (this.bounds.width / 2) | 0;
        var subHeight = (this.bounds.height / 2) | 0;
        this.nodes[0] = new QuadTree({
            x: this.bounds.x + subWidth,
            y: this.bounds.y,
            width: subWidth,
            height: subHeight
        }, level + 1);
        this.nodes[1] = new QuadTree({
            x: this.bounds.x,
            y: this.bounds.y,
            width: subWidth,
            height: subHeight
        }, level + 1);
        this.nodes[2] = new QuadTree({
            x: this.bounds.x,
            y: this.bounds.y + subHeight,
            width: subWidth,
            height: subHeight
        }, level + 1);
        this.nodes[3] = new QuadTree({
            x: this.bounds.x + subWidth,
            y: this.bounds.y + subHeight,
            width: subWidth,
            height: subHeight
        }, level + 1);
    };
};

detectCollision = function(qt) {
    var objects = [];

    qt.getAllObjects(objects);
    for (var x = 0, len = objects.length; x < len; x++) {
        qt.findObjects(obj = [], objects[x]);

        for (y = 0, length = obj.length; y < length; y++) {

            // DETECT COLLISION ALGORITHM
            if (objects[x].collidableWith.indexOf(obj[y].type) !== -1 &&
                (objects[x].x < obj[y].x + obj[y].width &&
                    objects[x].x + objects[x].width > obj[y].x &&
                    objects[x].y < obj[y].y + obj[y].height &&
                    objects[x].y + objects[x].height > obj[y].y)) {
                objects[x].isColliding = true;
                obj[y].isColliding = true;
            }
        }
    }
};

detectCircularCollision = function(qt, cb) {
    var objects = [];

    qt.getAllObjects(objects);

    var uuid = generateUUID();

    // log(uuid, "before", JSON.parse(JSON.stringify(objects)));

    for (var x = 0, len = objects.length; x < len; x++) {
        qt.findObjects(obj = [], objects[x]);

        for (y = 0, length = obj.length; y < length; y++) {

            false && log("test", x, y,
                JSON.parse(JSON.stringify(objects[x])), JSON.parse(JSON.stringify(obj[y])),
                objects[x].uuid !== obj[y].uuid,
                objects[x].collidableWith.indexOf(obj[y].type) !== -1,
                objects[x].cx === obj[y].cx,
                objects[x].cy === obj[y].cy,
                objects[x].x < obj[y].x + obj[y].radius * 2,
                objects[x].x + objects[x].radius * 2 > obj[y].x,
                objects[x].y < obj[y].y + obj[y].radius * 2,
                objects[x].y + objects[x].radius * 2 > obj[y].y
            );

            // DETECT COLLISION ALGORITHM
            if (objects[x].uuid !== obj[y].uuid &&
                objects[x].collidableWith.indexOf(obj[y].type) !== -1 &&
                objects[x].cx === obj[y].cx &&
                objects[x].cy === obj[y].cy &&
                (objects[x].x < obj[y].x + obj[y].radius * 4 &&
                    objects[x].x + objects[x].radius * 4 > obj[y].x &&
                    objects[x].y < obj[y].y + obj[y].radius * 4 &&
                    objects[x].y + objects[x].radius * 4 > obj[y].y)) {
                objects[x].isColliding = true;
                obj[y].isColliding = true;

                if (!objects[x].isCollidingArr.hasOwnProperty(obj[y].type))
                    objects[x].isCollidingArr[obj[y].type] = [];
                objects[x].isCollidingArr[obj[y].type].push(obj[y]);

                if (!obj[y].isCollidingArr.hasOwnProperty(objects[x].type))
                    obj[y].isCollidingArr[objects[x].type] = [];
                obj[y].isCollidingArr[objects[x].type].push(objects[x]);
            }
        }
    }

    // log(uuid, "after", JSON.parse(JSON.stringify(objects)));

    typeof cb === "function" && cb(qt);
};