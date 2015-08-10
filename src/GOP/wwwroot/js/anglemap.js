/// <reference path="../typings/tsd.d.ts" />
var Tool;
(function (Tool) {
    Tool[Tool["Pointer"] = 0] = "Pointer";
    Tool[Tool["Barrier"] = 1] = "Barrier";
    Tool[Tool["Rock"] = 2] = "Rock";
    Tool[Tool["Water"] = 3] = "Water";
    Tool[Tool["WallW"] = 4] = "WallW";
    Tool[Tool["WallS"] = 5] = "WallS";
    Tool[Tool["WallSW"] = 6] = "WallSW";
    Tool[Tool["LineOfSight"] = 7] = "LineOfSight";
    Tool[Tool["PathRunning"] = 8] = "PathRunning";
    Tool[Tool["PathWalking"] = 9] = "PathWalking";
    Tool[Tool["ClosestReachable"] = 10] = "ClosestReachable";
    Tool[Tool["Spawn"] = 11] = "Spawn";
    Tool[Tool["ColorDist"] = 12] = "ColorDist";
})(Tool || (Tool = {}));
var Anglemap = (function () {
    function Anglemap(gameCanvas) {
        var _this = this;
        this.gameCanvas = gameCanvas;
        this.stateColors = { 0: "#222222", 1: "black", 2: "#393939", 3: "#111833", 4: "#222222", 5: "#222222", 6: "#222222" };
        this.highlightColor = "rgba(255, 255, 0, 0.1)";
        this.playerColor = "#00FFFF";
        this.orbColor = "yellow";
        this.pathColor = "rgba(0, 255, 255, 0.5)";
        this.pathStopColor = "#000080";
        this.pathPostColor = "rgba(0, 255, 255, 0.1)";
        this.bestPositionColor = "#000080";
        this.secondBestPositionColor = "#333399";
        this.context = this.gameCanvas.getContext("2d"); // Canvas 2D this.context.
        this.playerX = NaN;
        this.playerY = NaN; // Current player position.
        this.orbX = NaN;
        this.orbY = NaN; // Current orb position.
        this.canvasWidth = this.gameCanvas.width;
        this.canvasHeight = this.gameCanvas.height;
        this.numColumns = 53;
        this.numRows = 53;
        this.centerX = Math.floor(this.numColumns / 2);
        this.centerY = Math.floor(this.numRows / 2);
        this.cellWidth = this.canvasWidth / this.numColumns;
        this.cellHeight = this.canvasHeight / this.numRows;
        this.currentAltar = Altar.None;
        this.currentTool = Tool.Pointer;
        this.gopBoard = new GopBoard(53, 53);
        // The array that contains all squares that should be repainted.
        this.invalidatedSquares = [];
        $(this.gameCanvas).mousedown(function (e) {
            if (e.button !== 0)
                return;
            var offX = (e.offsetX || e.pageX - $(e.target).offset().left);
            var offY = (e.offsetY || e.pageY - $(e.target).offset().top);
            var p = _this.fromScreenCoords(offX, offY);
            if (_this.currentTool === Tool.Pointer || _this.currentTool === Tool.ColorDist) {
                if (!isNaN(_this.playerX) && !isNaN(_this.playerY))
                    _this.invalidatedSquares.push(new Point(_this.playerX, _this.playerY));
                if (p.x === _this.playerX && p.y === _this.playerY) {
                    _this.playerX = _this.playerY = _this.orbX = _this.orbY = NaN;
                }
                else {
                    _this.playerX = p.x;
                    _this.playerY = p.y;
                    _this.orbX = _this.orbY = NaN;
                }
            }
            else if (_this.currentTool >= Tool.Barrier && _this.currentTool <= Tool.WallSW) {
                if (_this.gopBoard.get(p) === _this.currentTool) {
                    var defaultGridState = _this.getDefaultGridState(p);
                    _this.setTile(p, defaultGridState === _this.currentTool ? Tile.Floor : defaultGridState);
                }
                else {
                    _this.setTile(p, _this.currentTool);
                }
            }
            else if (_this.currentTool >= Tool.LineOfSight && _this.currentTool <= Tool.ClosestReachable) {
                // Set player and orb locations.
                if (!isNaN(_this.playerX) && !isNaN(_this.playerY))
                    _this.invalidatedSquares.push(new Point(_this.playerX, _this.playerY));
                if (p.x === _this.playerX && p.y === _this.playerY) {
                    _this.playerX = _this.playerY = NaN;
                }
                else {
                    if (isNaN(_this.playerX) || isNaN(_this.playerY)) {
                        _this.playerX = p.x;
                        _this.playerY = p.y;
                    }
                    else {
                        if (p.x === _this.orbX && p.y === _this.orbY) {
                            _this.orbX = _this.orbY = NaN;
                        }
                        else {
                            _this.orbX = p.x;
                            _this.orbY = p.y;
                        }
                    }
                }
            }
            else if (_this.currentTool === Tool.Spawn) {
                var index = _this.indexOf(AltarData[_this.currentAltar].spawns, p.x, p.y);
                if (index === -1) {
                    AltarData[_this.currentAltar].spawns.push(new Point(p.x, p.y));
                    AltarData[_this.currentAltar].spawns.sort(function (p1, p2) { return p1.compare(p2); });
                }
                else {
                    AltarData[_this.currentAltar].spawns.splice(index, 1);
                }
            }
            _this.drawGrid();
        });
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.resetGrid();
    }
    // Returns whether an array of points contains (x, y).
    Anglemap.prototype.contains = function (points, x, y) {
        return points.some(function (p) { return p.x === x && p.y === y; });
    };
    // Returns the index of (x, y) in points.
    Anglemap.prototype.indexOf = function (points, x, y) {
        for (var i = 0; i < points.length; ++i)
            if (points[i].x === x && points[i].y === y)
                return i;
        return -1;
    };
    // Converts grid coordinates to screen coordinates.
    Anglemap.prototype.toScreenCoords = function (x, y) {
        return new Point((x + this.centerX) * this.cellWidth, (-y + this.centerY) * this.cellHeight);
    };
    // Converts screen coordinates to grid coordinates.
    Anglemap.prototype.fromScreenCoords = function (x, y) {
        return new Point(Math.floor(x / this.cellWidth) - this.centerX, -Math.floor(y / this.cellHeight) + this.centerY);
    };
    // Returns where the orb will end up if the player taps the orb.
    // TODO: Finish
    Anglemap.prototype.tapOrb = function (px, py, ox, oy) {
        var mabs = Math.abs((py - oy) / (px - ox));
        var dx = px === ox ? 0 : px > ox ? 1 : -1;
        var dy = py === oy ? 0 : py > oy ? 1 : -1;
        if (mabs > 2) {
            dx = 0;
            dy *= 2;
        }
        else if (mabs > 1) {
            dy *= 2;
        }
        else if (mabs === 1) {
            dx *= 2;
            dy *= 2;
        }
        else if (mabs >= 0.5) {
            dx *= 2;
        }
        else {
            dx *= 2;
            dy = 0;
        }
        return new Point(dx, dy);
    };
    // Returns the default grid state at the point (x, y).
    Anglemap.prototype.getDefaultGridState = function (p) {
        return AltarData[this.currentAltar].grid[this.centerY - p.y][p.x + this.centerX];
    };
    // Sets the grid at point p to the new tile.
    Anglemap.prototype.setTile = function (p, tile) {
        if (this.gopBoard.get(p) != tile) {
            if (!this.gopBoard.canMoveWest(p, PathMode.Sight))
                this.invalidatedSquares.push(new Point(p.x - 1, p.y));
            if (!this.gopBoard.canMoveSouth(p, PathMode.Sight))
                this.invalidatedSquares.push(new Point(p.x, p.y - 1));
            if (this.gopBoard.get(p) === Tile.WallSW)
                this.invalidatedSquares.push(new Point(p.x - 1, p.y - 1));
            this.gopBoard.set(p, tile);
            this.invalidatedSquares.push(p);
        }
    };
    // Fills the square at the point (x, y) with the specified fill style.
    Anglemap.prototype.fillSquare = function (fillStyle, x, y, invalidate) {
        var square = this.toScreenCoords(x, y);
        this.context.fillStyle = fillStyle;
        this.context.fillRect(square.x, square.y, this.cellWidth - 1, this.cellHeight - 1);
        if (invalidate)
            this.invalidatedSquares.push(new Point(x, y));
    };
    // Draws walls at point p, if any.
    Anglemap.prototype.drawWalls = function (p) {
        var s = this.toScreenCoords(p.x, p.y);
        this.context.lineWidth = 3;
        if (this.gopBoard.get(p) === Tile.WallS) {
            this.context.beginPath();
            this.context.moveTo(s.x, s.y + this.cellHeight);
            this.context.lineTo(s.x + this.cellWidth, s.y + this.cellHeight);
            this.context.stroke();
        }
        else if (this.gopBoard.get(p) === Tile.WallW) {
            this.context.beginPath();
            this.context.moveTo(s.x, s.y);
            this.context.lineTo(s.x, s.y + this.cellHeight);
            this.context.stroke();
        }
        else if (this.gopBoard.get(p) === Tile.WallSW) {
            this.context.beginPath();
            this.context.moveTo(s.x, s.y);
            this.context.lineTo(s.x, s.y + this.cellHeight);
            this.context.lineTo(s.x + this.cellWidth, s.y + this.cellHeight);
            this.context.stroke();
        }
    };
    // Draws the spawns.
    Anglemap.prototype.drawSpawns = function () {
        for (var i = 0; i < AltarData[this.currentAltar].spawns.length; i++) {
            var p = this.toScreenCoords(AltarData[this.currentAltar].spawns[i].x, AltarData[this.currentAltar].spawns[i].y);
            this.context.fillStyle = "Yellow";
            this.context.fillRect(p.x + this.cellWidth / 2 - 1, p.y + this.cellWidth / 2 - 1, 2, 2);
            this.invalidatedSquares.push(AltarData[this.currentAltar].spawns[i]);
        }
    };
    // Highlight all reachable squares from current position.
    Anglemap.prototype.highlightReachable = function () {
        var playerLoc = new Point(this.playerX, this.playerY);
        if (Point.isNaN(playerLoc) || this.gopBoard.get(playerLoc) === Tile.Barrier)
            return;
        for (var x = Math.max(-this.centerX, this.playerX - 10); x <= Math.min(this.centerX, this.playerX + 10); x++) {
            for (var y = Math.max(-this.centerY, this.playerY - 10); y <= Math.min(this.centerY, this.playerY + 10); y++) {
                if (x === this.playerX && y === this.playerY)
                    continue;
                if (this.gopBoard.findObstacle(GopBoard.getLineOfSight(playerLoc, new Point(x, y))) === -1)
                    this.fillSquare(this.highlightColor, x, y, true);
            }
        }
    };
    // Helper function for drawing the line component of the line of sight.
    Anglemap.prototype.drawLineOfSightLine = function (p1, p2) {
        this.context.lineWidth = 1;
        this.context.beginPath();
        this.context.moveTo(p1.x, p1.y);
        this.context.lineTo(p2.x, p2.y);
        this.context.stroke();
    };
    /**
     * Gets the offset of the line to draw to illustrate the line-of-sight algorithm.
     */
    Anglemap.getLosOffset = function (p1, p2) {
        if (p1.x === p2.x || p1.y === p2.y || Math.abs(p2.x - p1.x) === Math.abs(p2.y - p1.y))
            return new Point(0.5, 0.5); // Center
        var m = (p2.y - p1.y) / (p2.x - p1.x);
        if (Math.abs(m) < 1)
            return new Point(1, 0.5); // Midpoint of right edge
        else if (m > 0)
            return new Point(0.5, 0); // Midpoint of top edge
        else
            return new Point(0.5, 1); // Midpoint of bottom edge
    };
    // Draws the line of sight from (x1, y1) to (x2, y2).
    Anglemap.prototype.drawLineOfSight = function (p1, p2) {
        if (Point.isNaN(p1) || Point.isNaN(p2) || p1.equals(p2))
            return;
        var color = "lime";
        var losSquares = GopBoard.getLineOfSight(p1, p2);
        var obstacleIndex = this.gopBoard.findObstacle(losSquares);
        for (var i = 1; i < losSquares.length; i++) {
            var p = losSquares[i];
            if (!p.equals(p1)) {
                if (i === obstacleIndex)
                    color = "red";
                this.fillSquare(color, p.x, p.y, true);
            }
        }
        var offset = Anglemap.getLosOffset(p1, p2);
        this.drawLineOfSightLine(new Point(p1.x + offset.x, p1.y - offset.y), new Point(p2.x + offset.x, p2.y - offset.y));
    };
    // Draws the path that a player will take to go from (x1, y1) to (x2, y2).
    Anglemap.prototype.drawPath = function (p1, p2) {
        if (Point.isNaN(p1) || Point.isNaN(p2) || p1.equals(p2))
            return;
        var found = false;
        var shortestPath = this.gopBoard.getPlayerPath(p1, p2);
        var color = this.pathColor;
        for (var i = 0; i < shortestPath.length; i++) {
            var p = shortestPath[i];
            if (!found && (this.currentTool === Tool.PathWalking || i % 2 === 1) && this.gopBoard.canReach(p, p2)) {
                this.fillSquare(this.pathStopColor, p.x, p.y, true);
                found = true;
                color = this.pathPostColor;
            }
            else {
                this.fillSquare(color, p.x, p.y, true);
            }
        }
    };
    Anglemap.prototype.getBestAttractingPositions = function (x1, y1, x2, y2) {
        var p2 = new Point(x2, y2);
        var nodes = [{ x: x1, y: y1, dist: 0 }];
        var visited = {};
        visited[[x1, y1].toString()] = true;
        var minDist = Infinity;
        var best = [];
        var secondBest = [];
        while (nodes.length > 0) {
            var curr = nodes.shift();
            var currPoint = new Point(curr.x, curr.y);
            // Exclude spots that are right next to the orb, as attracting from those spaces is unproductive.
            // Also exclude spots from which attracting an orb does not do anything.
            if (this.gopBoard.canReach(currPoint, p2) && Point.walkingDistance(currPoint, p2) > 1 && this.gopBoard.willMoveOrb(currPoint, p2)) {
                if (minDist === Infinity)
                    minDist = curr.dist;
                if (curr.dist === minDist)
                    best.push(curr);
                else if (curr.dist <= minDist + (minDist % 2))
                    secondBest.push(curr);
            }
            else if (curr.dist > minDist + (minDist % 2))
                break;
            var offsets = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
            for (var i = 0; i < offsets.length; ++i) {
                var newX = curr.x + offsets[i][0];
                var newY = curr.y + offsets[i][1];
                if (newX >= -this.centerX && newX <= this.centerX && newY >= -this.centerY && newY <= this.centerY && !visited[[newX, newY].toString()] && this.gopBoard.canMove(new Point(curr.x, curr.y), offsets[i][0], offsets[i][1], PathMode.Player)) {
                    visited[[newX, newY].toString()] = true;
                    nodes.push({ x: newX, y: newY, dist: curr.dist + 1 });
                }
            }
        }
        return [best, secondBest];
    };
    // Draws the best positions from which to attract an orb.
    Anglemap.prototype.drawBestAttractingPositions = function (x1, y1, x2, y2) {
        if (x1 === x2 && y1 === y2 || isNaN(x1) || isNaN(x2) || isNaN(y1) || isNaN(y2))
            return;
        var ret = this.getBestAttractingPositions(x1, y1, x2, y2);
        for (var i = 0; i < ret[0].length; ++i)
            this.fillSquare(this.bestPositionColor, ret[0][i].x, ret[0][i].y, true);
        for (var i = 0; i < ret[1].length; ++i)
            this.fillSquare(this.secondBestPositionColor, ret[1][i].x, ret[1][i].y, true);
    };
    Anglemap.prototype.colorToString = function (r, g, b) {
        return "rgb(" + Math.round(r) + "," + Math.round(g) + "," + Math.round(b) + ")";
    };
    Anglemap.prototype.drawDistanceColor = function (x, y, dist) {
        var runningDist = Math.floor((dist + 1) / 2);
        var maxDist = 8;
        var t = runningDist / maxDist;
        var closeColor = { r: 64, g: 255, b: 64 };
        var farColor = { r: 255, g: 64, b: 64 };
        var color = {
            r: (1 - t) * closeColor.r + t * farColor.r,
            g: (1 - t) * closeColor.g + t * farColor.g,
            b: (1 - t) * closeColor.b + t * farColor.b,
        };
        if (t <= 1)
            this.fillSquare(this.colorToString(color.r, color.g, color.b), x, y, true);
    };
    Anglemap.prototype.drawDistanceColorGradient = function (x, y) {
        var p = new Point(x, y);
        var nodes = [{ state: p, dist: 0 }];
        var visited = {};
        visited[p.toString()] = true;
        while (nodes.length > 0) {
            var curr = nodes.shift();
            this.drawDistanceColor(curr.state.x, curr.state.y, curr.dist);
            for (var i = 0; i < Point.gridOffsets.length; ++i) {
                var p2 = curr.state.add(Point.gridOffsets[i]);
                if (this.gopBoard.isInRange(p2) && !visited[p2.toString()] && this.gopBoard.canMove(curr.state, Point.gridOffsets[i].x, Point.gridOffsets[i].y, PathMode.Player)) {
                    visited[p2.toString()] = true;
                    nodes.push({ state: p2, dist: curr.dist + 1 });
                }
            }
        }
    };
    // Draws the grid with the new grid state.
    Anglemap.prototype.drawGrid = function () {
        var playerLoc = new Point(this.playerX, this.playerY);
        var orbLoc = new Point(this.orbX, this.orbY);
        while (this.invalidatedSquares.length > 0) {
            var p = this.invalidatedSquares.pop();
            this.fillSquare(this.stateColors[this.gopBoard.get(p)], p.x, p.y, false);
        }
        if (!isNaN(this.orbX) && !isNaN(this.orbY))
            this.fillSquare(this.orbColor, this.orbX, this.orbY, true);
        if (!isNaN(this.playerX) && !isNaN(this.playerY)) {
            if (this.currentTool === Tool.LineOfSight)
                this.drawLineOfSight(playerLoc, orbLoc);
            else if (this.currentTool === Tool.PathRunning || this.currentTool === Tool.PathWalking)
                this.drawPath(playerLoc, orbLoc);
            else if (this.currentTool === Tool.ClosestReachable)
                this.drawBestAttractingPositions(this.playerX, this.playerY, this.orbX, this.orbY);
            else if (this.currentTool === Tool.ColorDist)
                this.drawDistanceColorGradient(this.playerX, this.playerY);
            this.fillSquare(this.playerColor, this.playerX, this.playerY, false);
        }
        this.drawSpawns();
        if (this.currentTool <= Tool.WallSW)
            this.highlightReachable();
        for (var x = -this.centerX; x <= this.centerX; x++)
            for (var y = -this.centerY; y <= this.centerY; y++)
                this.drawWalls(new Point(x, y));
    };
    // Loads the default grid state.
    Anglemap.prototype.resetGrid = function () {
        for (var y = -this.centerY; y <= this.centerY; y++) {
            for (var x = -this.centerX; x <= this.centerX; x++) {
                var p = new Point(x, y);
                this.gopBoard.set(p, this.getDefaultGridState(p));
                this.invalidatedSquares.push(p);
            }
        }
        this.drawGrid();
    };
    Anglemap.prototype.setAltar = function (altar) {
        this.currentAltar = altar;
        this.resetGrid();
    };
    return Anglemap;
})();
