class GopBoard {
    grid: Tile[][] = [];
    xmax = Math.floor(this.numRows / 2);
    ymax = Math.floor(this.numColumns / 2);

    constructor(public numRows: number, public numColumns: number, public reachDistance = 10) {
        this.clear();
    }

    isInRange(p: Point) {
        return p.x <= this.xmax && p.x >= -this.xmax && p.y <= this.ymax && p.y >= -this.ymax;
    }

    get(p: Point) {
        return this.isInRange(p) ? this.grid[p.y + this.ymax][p.x + this.xmax] : Tile.Barrier;
    }

    set(p: Point, value: Tile) {
        if (this.isInRange(p))
            this.grid[p.y + this.ymax][p.x + this.xmax] = value;
        else
            console.log("Attempted to set GopBoard coordinate that is out of bounds: " + p);
    }

    clear() {
        this.grid = [];
        for (var y = 0; y < this.numRows; y++) {
            this.grid[y] = [];
            for (var x = 0; x < this.numColumns; x++)
                this.grid[y][x] = Tile.Floor;
        }
    }

    /**
     * Loads an altar by index into the GOP board.
     */
    loadAltar(altar: Altar) {
        this.clear();
        for (var y = 0; y < this.numRows; ++y)
            for (var x = 0; x < this.numColumns; ++x)
                this.grid[y][x] = AltarData[altar].grid[this.numRows - y - 1][x];
    }

    isPassable(p: Point, mode: PathMode) {
        return !(this.get(p) === Tile.Barrier ||
            (mode >= PathMode.Orb && this.get(p) === Tile.Rock) ||
            (mode === PathMode.Player && this.get(p) === Tile.Water));
    }

    // Returns whether an object at (x, y) can move west. Return false if (x, y) is an impassable square itself.
    canMoveWest(p: Point, mode: PathMode) {
        var p2 = new Point(p.x - 1, p.y);
        return this.isInRange(p) &&
            this.isInRange(p2) &&
            this.get(p) !== Tile.WallW &&
            this.get(p) !== Tile.WallSW &&
            this.isPassable(p, mode) &&
            this.isPassable(p2, mode);
    }

    // Returns whether an object at (x, y) can move east.
    canMoveEast(p: Point, mode: PathMode) {
        return this.canMoveWest(new Point(p.x + 1, p.y), mode);
    }

    // Returns whether an object at (x, y) can move south.
    canMoveSouth(p: Point, mode: PathMode) {
        var p2 = new Point(p.x, p.y - 1);
        return this.isInRange(p) &&
            this.isInRange(p2) &&
            this.get(p) !== Tile.WallS &&
            this.get(p) !== Tile.WallSW &&
            this.isPassable(p, mode) &&
            this.isPassable(p2, mode);
    }

    // Returns whether an object at (x, y) can move north.
    canMoveNorth(p: Point, mode: PathMode) {
        return this.canMoveSouth(new Point(p.x, p.y + 1), mode);
    }

    // Returns whether an object can move in the direction specified by dx and dy
    // (which are each either +1 or -1).
    canMove(p: Point, dx: number, dy: number, mode: PathMode) {
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1)
            return false;
        var ddx = dx === 1 ? 1 : 0;
        var ddy = dy === 1 ? 1 : 0;

        // If it starts on a barrier, pretend that it's not for the moment.
        var old = this.get(p);
        if (!this.isPassable(p, mode))
            this.set(p, Tile.Floor);

        var result = true;
        if (dy === 0)
            result = this.canMoveWest(new Point(p.x + ddx, p.y), mode);
        else if (dx === 0)
            result = this.canMoveSouth(new Point(p.x, p.y + ddy), mode);
        else if (mode === PathMode.Sight) {
            if ((!this.canMoveWest(new Point(p.x + ddx, p.y + ddy), mode) && !this.canMoveWest(new Point(p.x + ddx, p.y + ddy - 1), mode)) ||
                (!this.canMoveSouth(new Point(p.x + ddx, p.y + ddy), mode) && !this.canMoveSouth(new Point(p.x + ddx - 1, p.y + ddy), mode)))
                result = false;
            else if (dx === dy)
                result = !((!this.canMoveWest(new Point(p.x + ddx, p.y + ddy), mode) && !this.canMoveSouth(new Point(p.x + ddx, p.y + ddy), mode)) ||
                    (!this.canMoveWest(new Point(p.x + ddx, p.y + ddy - 1), mode) && !this.canMoveSouth(new Point(p.x + ddx - 1, p.y + ddy), mode)));
            else
                result = !((!this.canMoveWest(new Point(p.x + ddx, p.y + ddy), mode) && !this.canMoveSouth(new Point(p.x + ddx - 1, p.y + ddy), mode)) ||
                    (!this.canMoveWest(new Point(p.x + ddx, p.y + ddy - 1), mode) && !this.canMoveSouth(new Point(p.x + ddx, p.y + ddy), mode)));
        }
        else {
            if ((dx === -dy && this.get(new Point(p.x + ddx, p.y + ddy)) === Tile.Minipillar1) || (dx === dy && this.get(new Point(p.x + ddx, p.y + ddy)) === Tile.Minipillar2))
                result = false;
            else
                result = this.canMoveWest(new Point(p.x + ddx, p.y + ddy), mode) && this.canMoveWest(new Point(p.x + ddx, p.y + ddy - 1), mode) && this.canMoveSouth(new Point(p.x + ddx, p.y + ddy), mode) && this.canMoveSouth(new Point(p.x + ddx - 1, p.y + ddy), mode);
        }

        this.set(p, old);
        return result;
    }

    /**
     * Returns whether the player can reach the orb from the specified locations, with repel either on or off.
     */
    canReach(player: Point, orb: Point, repel?: boolean) {
        return !player.equals(orb) &&   // Player on top of orb returns false.
            Point.walkingDistance(player, orb) <= (repel ? this.reachDistance - 2 : this.reachDistance) &&    // Too far away returns false.
            this.findObstacle(GopBoard.getLineOfSight(player, orb)) === -1;  // Now check line of sight.
    }

    getPlayerPath(p1: Point, p2: Point, clickOrb?: boolean) {
        if (p1.equals(p2)) {
            if (clickOrb) {
                for (var i = 0; i < 4; ++i) {
                    var p = p1.add(Point.gridOffsets[i]);
                    if (this.isInRange(p) && this.canMove(p1, Point.gridOffsets[i].x, Point.gridOffsets[i].y, PathMode.Player)) {
                        return [p];
                    }
                }
            }
            else {
                return [];
            }
        }

        var q = [p1];
        var parents = [];
        for (var y = -this.ymax; y <= this.ymax; ++y)
            parents[y] = [];
        parents[p1.y][p1.x] = Point.zero;
        var minDist = Infinity;
        var best = Point.NaN;

        while (q.length > 0) {
            var curr = q.shift();
            var dist = Point.distanceSquared(curr, p2);
            var diff = p2.subtract(curr);
            if ((clickOrb ? dist : Point.walkingDistance(curr, p2)) <= 1 && this.canMove(curr, diff.x, diff.y, PathMode.Player)) {
                parents[p2.y][p2.x] = curr;
                best = p2;
                break;
            }
            if (minDist > dist) {
                minDist = dist;
                best = curr;
            }
            for (var i = 0; i < Point.gridOffsets.length; ++i) {
                var p = curr.add(Point.gridOffsets[i]);
                if (this.isInRange(p) && Point.isNaN(parents[p.y][p.x]) && this.canMove(curr, Point.gridOffsets[i].x, Point.gridOffsets[i].y, PathMode.Player)) {
                    parents[p.y][p.x] = curr;
                    q.push(p);
                }
            }
        }

        var path = [];
        for (var p = best; !p.equals(p1); p = parents[p.y][p.x])
            path.push(p);
        if (clickOrb && path.length > 0 && p2.equals(path[0])) {
            // Don't include the orb location itself
            path.shift();
        }
        return path.reverse();
    }

    nearestPoint(src: Point, dests: Point[], mode: PathMode) {
        function pointEquals(pointToCompare: Point) {
            return (p: Point) => p.equals(pointToCompare);
        }

        var nodes = [{ state: src, dist: 0 }];
        var visited = {};
        visited[src.toString()] = true;

        while (nodes.length > 0) {
            var curr = nodes.shift();
            for (var i = 0; i < Point.gridOffsets.length; ++i) {
                var p2 = curr.state.add(Point.gridOffsets[i]);
                if (this.isInRange(p2) && !visited[p2.toString()] && this.canMove(curr.state, Point.gridOffsets[i].x, Point.gridOffsets[i].y, mode)) {
                    if (dests.some(pointEquals(p2)))
                        return p2;
                    visited[p2.toString()] = true;
                    nodes.push({ state: p2, dist: curr.dist + 1 });
                }
            }
        }

        return Point.NaN;
    }

    nearestAltarPoint(p: Point, mode: PathMode) {
        var altarPoints = [];
        for (var y = -2; y <= 2; y++)
            for (var x = -2; x <= 2; x++)
                if (!(Math.abs(x) === 2 && Math.abs(y) === 2))
                    altarPoints.push(new Point(x, y));

        return this.nearestPoint(p, altarPoints, mode);
    }

    distanceToAltar(p: Point, mode: PathMode) {
        var nodes = [{ state: p, dist: 0 }];
        var visited = {};
        visited[p.toString()] = true;

        while (nodes.length > 0) {
            var curr = nodes.shift();
            if (curr.state.x >= -2 && curr.state.x <= 2 && curr.state.y >= -2 && curr.state.y <= 2)
                return curr.dist;

            var offsets = Point.gridOffsets;
            for (var i = 0; i < offsets.length; ++i) {
                var newPoint = curr.state.add(offsets[i]);
                if (this.isInRange(newPoint) && !visited[newPoint.toString()] && this.canMove(curr.state, offsets[i].x, offsets[i].y, mode)) {
                    visited[newPoint.toString()] = true;
                    nodes.push({ state: newPoint, dist: curr.dist + 1 });
                }
            }
        }

        return Infinity;
    }

    willMoveOrb(pPlayer: Point, pOrb: Point) {
        var mabs = Math.abs((pOrb.y - pPlayer.y) / (pOrb.x - pPlayer.x));
        var dx = Math.abs(pOrb.x - pPlayer.x) <= 1 ? 0 : pOrb.x > pPlayer.x ? -1 : 1;
        var dy = Math.abs(pOrb.y - pPlayer.y) <= 1 ? 0 : pOrb.y > pPlayer.y ? -1 : 1;
        return !((mabs > 2 && !this.canMove(pOrb, 0, dy, PathMode.Orb)) ||
            (mabs < 0.5 && !this.canMove(pOrb, dx, 0, PathMode.Orb)) ||
            (!this.canMove(pOrb, dx, 0, PathMode.Orb) && !this.canMove(pOrb, 0, dy, PathMode.Orb)));
    }

    // Returns a string representation of the grid.
    toString() {
        var s = "";
        for (var y = this.numRows - 1; y >= 0; y--) {
            for (var x = 0; x < this.numColumns; x++)
                s += this.grid[y][x];
            if (y !== 0)
                s += "\n";
        }
        return s;
    }

    /**
     * Returns -1 if there are no obstacles in the line of sight, otherwise the index of the
     * first obstacle to the line of sight.
     */
    findObstacle(losSquares: Point[]) {
        if (losSquares.length === 0)
            return -1;
        if (this.get(losSquares[0]) === Tile.Barrier)
            return 0;
        for (var i = 1; i < losSquares.length; i++) {
            var p = losSquares[i];
            var pPrev = losSquares[i - 1];
            if ((i !== losSquares.length - 1 || this.isPassable(p, PathMode.Orb)) && !this.canMove(pPrev, p.x - pPrev.x, p.y - pPrev.y, PathMode.Sight))
                return i;
        }
        return -1;
    }

    /**
      * Returns whether the point (representing an orb) is in the altar.
      */
    static isAdjacentToAltar(p: Point) {
        return Math.abs(p.x) <= 2 && Math.abs(p.y) <= 2;
    }

    /**
     * Returns whether the point (representing a player) is next to the altar. The diagonal points are excluded.
     */
    static isPlayerAdjacentToAltar(p: Point) {
        return Math.abs(p.x) <= 2 && Math.abs(p.y) <= 2 && !(Math.abs(p.x) === 2 && Math.abs(p.y) === 2);
    }

    /**
     * Returns whether the point is inside the altar.
     */
    static isInAltar(p: Point) {
        return Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1;
    }
    
    /**
     * Returns the offset location the orb target is when the player clicks it from that location.
     */
    static getOrbOffset(diff: Point, toPlayer = false) {
        // Returns the sign of x.
        function sign(x) {
            return x === 0 ? 0 : x > 0 ? 1 : -1;
        }

        // Returns the value that is smaller in absolute value.
        function absmin(x, y) {
            return Math.abs(x) < Math.abs(y) ? x : y;
        }

        var m = Math.abs(diff.y / diff.x);
        var dx = sign(diff.x);
        var dy = sign(diff.y);
        var result;
        if (m > 2)
            result = new Point(0, 2 * dy);
        else if (m > 1)
            result = new Point(dx, 2 * dy);
        else if (m === 1)
            result = new Point(2 * dx, 2 * dy);
        else if (m >= 0.5)
            result = new Point(2 * dx, dy);
        else
            result = new Point(2 * dx, 0);
        return toPlayer ? new Point(absmin(result.x, diff.x - dx), absmin(result.y, diff.y - dy)) : result;
    }

    /**
     * Returns an array of the squares that are in line of sight from p1 to p2.
     */
    static getLineOfSight(p1: Point, p2: Point): Point[] {
        var distX = p2.x - p1.x, distY = p2.y - p1.y;
        var result = [];
        if (distX === 0 && distY === 0)
            return result;
        else if (p1.x > p2.x)
            return GopBoard.getLineOfSight(p2, p1).reverse();
        else if (p1.y > p2.y)
            return GopBoard.getLineOfSight(new Point(p1.x, -p1.y), new Point(p2.x, -p2.y)).map(
                p => new Point(p.x, -p.y));
        else if (distX === 0)
            for (var y = p1.y; y <= p2.y; y++)
                result.push(new Point(p1.x, y));
        else if (distY === 0)
            for (var x = p1.x; x <= p2.x; x++)
                result.push(new Point(x, p1.y));
        else if (distX === distY)
            for (var x = p1.x, y = p1.y; x <= p2.x, y <= p2.y; x++ , y++)
                result.push(new Point(x, y));
        else if (Math.abs(distY) > Math.abs(distX)) {
            if (distX * distY > 0)
                return GopBoard.getLineOfSight(new Point(p1.y, p1.x), new Point(p2.y, p2.x)).map(
                    p => new Point(p.y, p.x));
            return GopBoard.getLineOfSight(new Point(-p1.y, -p1.x), new Point(-p2.y, -p2.x)).map(
                p => new Point(-p.y, -p.x));
        }
        else    // Now we can handle the first octant
        {
            result.push(p1);
            var x = p1.x + 1;
            var y = p1.y;
            var error = distX / 2;
            while (x <= p2.x) {
                result.push(new Point(x, y));
                if (error === 0) {
                    x += 1;
                    error += distY;
                }
                else {
                    error += distY;
                    x += 1;
                    if (error > distX) {
                        y += 1;
                        result.push(new Point(x - 1, y));
                        error -= distX;
                    }
                    else if (error === distX) {
                        y += 1;
                        // These are just edge cases.
                        if (distX === 6 && (distY === 1 || distY === 5) ||
                            distX === 10 && (distY === 1 || distY === 3 || distY === 7 || distY === 9))
                            result.push(new Point(x, y - 1));
                        else
                            result.push(new Point(x - 1, y));
                        error = 0;
                    }
                }
            }
        }
        return result;
    }
}
