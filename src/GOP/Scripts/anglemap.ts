enum Tool {
    Pointer,
    Barrier,
    Rock,
    Water,
    WallW,
    WallS,
    WallSW,
    LineOfSight,
    PathRunning,
    PathWalking,
    ClosestReachable,
    Spawn,
    ColorDist,
    None = -1
}

class Anglemap {
    constructor(private gameCanvas: HTMLCanvasElement) {
        $(this.gameCanvas).mousedown(e => {
            if (e.button !== 0) {
                return;
            }
            let offX = (e.offsetX || e.pageX - $(e.target).offset().left);
            let offY = (e.offsetY || e.pageY - $(e.target).offset().top);
            let p = this.fromScreenCoords(offX, offY);

            if (this.currentTool === Tool.Pointer || this.currentTool === Tool.ColorDist) {
                if (!isNaN(this.playerX) && !isNaN(this.playerY)) {
                    this.invalidatedSquares.push(new Point(this.playerX, this.playerY));
                }
                if (p.x === this.playerX && p.y === this.playerY) {
                    this.playerX = this.playerY = this.orbX = this.orbY = NaN;
                } else {
                    this.playerX = p.x;
                    this.playerY = p.y;
                    this.orbX = this.orbY = NaN;
                }
            } else if (this.currentTool >= Tool.Barrier && this.currentTool <= Tool.WallSW) {
                if (<number>this.gopBoard.get(p) === <number>this.currentTool) {
                    let defaultGridState = this.getDefaultGridState(p);
                    this.setTile(p, defaultGridState === this.currentTool ? Tile.Floor : defaultGridState);
                } else {
                    this.setTile(p, <number>this.currentTool);
                }
            } else if (this.currentTool >= Tool.LineOfSight && this.currentTool <= Tool.ClosestReachable) {
                // Set player and orb locations.
                if (!isNaN(this.playerX) && !isNaN(this.playerY)) {
                    this.invalidatedSquares.push(new Point(this.playerX, this.playerY));
                }
                if (p.x === this.playerX && p.y === this.playerY) {
                    this.playerX = this.playerY = NaN;
                } else {
                    if (isNaN(this.playerX) || isNaN(this.playerY)) {
                        this.playerX = p.x;
                        this.playerY = p.y;
                    } else {
                        if (p.x === this.orbX && p.y === this.orbY) {
                            this.orbX = this.orbY = NaN;
                        } else {
                            this.orbX = p.x;
                            this.orbY = p.y;
                        }
                    }
                }
            } else if (this.currentTool === Tool.Spawn) {
                let index = this.indexOf(AltarData[this.currentAltar].spawns, p.x, p.y);
                if (index === -1) {
                    AltarData[this.currentAltar].spawns.push(new Point(p.x, p.y));
                    AltarData[this.currentAltar].spawns.sort((p1, p2) => p1.compare(p2));
                } else {
                    AltarData[this.currentAltar].spawns.splice(index, 1);
                }
            }

            this.drawGrid();
        });
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.resetGrid();
    }

    stateColors: { [id: number]: string } = { 0: "#222222", 1: "black", 2: "#393939", 3: "#111833", 4: "#222222", 5: "#222222", 6: "#222222", 7: "#222222", 8: "#222222" };
    highlightColor = "rgba(255, 255, 0, 0.1)";
    playerColor = "#00FFFF";
    orbColor = "yellow";
    pathColor = "rgba(0, 255, 255, 0.5)";
    pathStopColor = "#000080";
    pathPostColor = "rgba(0, 255, 255, 0.1)";
    bestPositionColor = "#000080";
    secondBestPositionColor = "#333399";

    context = this.gameCanvas.getContext("2d");  // Canvas 2D this.context.
    playerX = NaN;
    playerY = NaN;       // Current player position.
    orbX = NaN;
    orbY = NaN;             // Current orb position.
    canvasWidth = this.gameCanvas.width;
    canvasHeight = this.gameCanvas.height;
    numColumns = 53;
    numRows = 53;
    centerX = Math.floor(this.numColumns / 2);
    centerY = Math.floor(this.numRows / 2);
    cellWidth = this.canvasWidth / this.numColumns;
    cellHeight = this.canvasHeight / this.numRows;
    currentAltar = Altar.None;
    currentTool = Tool.None;
    gopBoard = new GopBoard(53, 53);

    // The array that contains all squares that should be repainted.
    invalidatedSquares: Point[] = [];

    // Returns whether an array of points contains (x, y).
    contains(points: Point[], x: number, y: number) {
        return points.some(p => p.x === x && p.y === y);
    }

    // Returns the index of (x, y) in points.
    indexOf(points: Point[], x: number, y: number) {
        for (let i = 0; i < points.length; ++i) {
            if (points[i].x === x && points[i].y === y) {
                return i;
            }
        }
        return -1;
    }

    // Converts grid coordinates to screen coordinates.
    toScreenCoords(x: number, y: number) {
        return new Point((x + this.centerX) * this.cellWidth, (-y + this.centerY) * this.cellHeight);
    }

    // Converts screen coordinates to grid coordinates.
    fromScreenCoords(x: number, y: number) {
        return new Point(Math.floor(x / this.cellWidth) - this.centerX, -Math.floor(y / this.cellHeight) + this.centerY);
    }

    // Returns where the orb will end up if the player taps the orb.
    // TODO: Finish
    tapOrb(px: number, py: number, ox: number, oy: number) {
        let mabs = Math.abs((py - oy) / (px - ox));
        let dx = px === ox ? 0 : px > ox ? 1 : -1;
        let dy = py === oy ? 0 : py > oy ? 1 : -1;
        if (mabs > 2) {
            dx = 0;
            dy *= 2;
        } else if (mabs > 1) {
            dy *= 2;
        } else if (mabs === 1) {
            dx *= 2;
            dy *= 2;
        } else if (mabs >= 0.5) {
            dx *= 2;
        } else {
            dx *= 2;
            dy = 0;
        }

        return new Point(dx, dy);
    }

    // Returns the default grid state at the point (x, y).
    getDefaultGridState(p: Point) {
        return AltarData[this.currentAltar].grid[this.centerY - p.y][p.x + this.centerX];
    }

    // Sets the grid at point p to the new tile.
    setTile(p: Point, tile: Tile) {
        if (this.gopBoard.get(p) !== tile) {
            if (!this.gopBoard.canMoveWest(p, PathMode.Sight)) {
                this.invalidatedSquares.push(new Point(p.x - 1, p.y));
            }
            if (!this.gopBoard.canMoveSouth(p, PathMode.Sight)) {
                this.invalidatedSquares.push(new Point(p.x, p.y - 1));
            }
            if (this.gopBoard.get(p) === Tile.WallSW) {
                this.invalidatedSquares.push(new Point(p.x - 1, p.y - 1));
            }
            this.gopBoard.set(p, tile);
            this.invalidatedSquares.push(p);
        }
    }

    // Fills the square at the point (x, y) with the specified fill style.
    fillSquare(fillStyle: string, x: number, y: number, invalidate: boolean) {
        let square = this.toScreenCoords(x, y);
        this.context.fillStyle = fillStyle;
        this.context.fillRect(square.x, square.y, this.cellWidth - 1, this.cellHeight - 1);
        if (invalidate) {
            this.invalidatedSquares.push(new Point(x, y));
        }
    }

    // Draws walls at point p, if any.
    drawWalls(p: Point) {
        let tile = this.gopBoard.get(p);
        if (tile < Tile.WallW) {
            return;
        }

        let s = this.toScreenCoords(p.x, p.y);
        this.context.lineWidth = 3;
        if (tile === Tile.WallS) {
            this.context.beginPath();
            this.context.moveTo(s.x, s.y + this.cellHeight);
            this.context.lineTo(s.x + this.cellWidth, s.y + this.cellHeight);
            this.context.stroke();
        } else if (tile === Tile.WallW) {
            this.context.beginPath();
            this.context.moveTo(s.x, s.y);
            this.context.lineTo(s.x, s.y + this.cellHeight);
            this.context.stroke();
        } else if (tile === Tile.WallSW) {
            this.context.beginPath();
            this.context.moveTo(s.x, s.y);
            this.context.lineTo(s.x, s.y + this.cellHeight);
            this.context.lineTo(s.x + this.cellWidth, s.y + this.cellHeight);
            this.context.stroke();
        } else if (tile >= Tile.Minipillar1) {
            this.context.fillStyle = "black";
            this.context.fillRect(s.x - 3, s.y + this.cellHeight - 3, 5, 5);
        }
    }

    // Draws the spawns.
    drawSpawns() {
        for (let i = 0; i < AltarData[this.currentAltar].spawns.length; i++) {
            let p = this.toScreenCoords(AltarData[this.currentAltar].spawns[i].x, AltarData[this.currentAltar].spawns[i].y);
            this.context.fillStyle = "yellow";
            this.context.fillRect(p.x + this.cellWidth / 2 - 1, p.y + this.cellWidth / 2 - 1, 2, 2);
            //this.invalidatedSquares.push(AltarData[this.currentAltar].spawns[i]);
        }
    }

    // Highlight all reachable squares from current position.
    highlightReachable() {
        let playerLoc = new Point(this.playerX, this.playerY);
        if (Point.isNaN(playerLoc) || this.gopBoard.get(playerLoc) === Tile.Barrier) {
            return;
        }
        for (let x = Math.max(-this.centerX, this.playerX - 10); x <= Math.min(this.centerX, this.playerX + 10); x++) {
            for (let y = Math.max(-this.centerY, this.playerY - 10); y <= Math.min(this.centerY, this.playerY + 10); y++) {
                if (x === this.playerX && y === this.playerY) {
                    continue;
                }
                if (this.gopBoard.findObstacle(GopBoard.getLineOfSight(playerLoc, new Point(x, y))) === -1) {
                    this.fillSquare(this.highlightColor, x, y, true);
                }
            }
        }
    }

    // Helper function for drawing the line component of the line of sight.
    drawLineOfSightLine(p1: Point, p2: Point) {
        this.context.lineWidth = 1;
        this.context.beginPath();
        this.context.moveTo(p1.x, p1.y);
        this.context.lineTo(p2.x, p2.y);
        this.context.stroke();
    }

    /**
     * Gets the offset of the line to draw to illustrate the line-of-sight algorithm.
     */
    static getLosOffset(p1: Point, p2: Point) {
        if (p1.x === p2.x || p1.y === p2.y || Math.abs(p2.x - p1.x) === Math.abs(p2.y - p1.y)) {
            return new Point(0.5, 0.5); // Center
        }
        let m = (p2.y - p1.y) / (p2.x - p1.x);
        if (Math.abs(m) < 1) {
            return new Point(1, 0.5);   // Midpoint of right edge
        } else if (m > 0) {
            return new Point(0.5, 0);   // Midpoint of top edge
        } else {
            return new Point(0.5, 1);   // Midpoint of bottom edge
        }
    }

    // Draws the line of sight from (x1, y1) to (x2, y2).
    drawLineOfSight(p1: Point, p2: Point) {
        if (Point.isNaN(p1) || Point.isNaN(p2) || p1.equals(p2)) {
            return;
        }
        let color = "lime";
        let losSquares = GopBoard.getLineOfSight(p1, p2);
        let obstacleIndex = this.gopBoard.findObstacle(losSquares);
        for (let i = 1; i < losSquares.length; i++) {
            let p = losSquares[i];
            if (!p.equals(p1)) {
                if (i === obstacleIndex) {
                    color = "red";
                }
                this.fillSquare(color, p.x, p.y, true);
            }
        }
        let offset = Anglemap.getLosOffset(p1, p2);
        this.drawLineOfSightLine(new Point(p1.x + offset.x, p1.y - offset.y), new Point(p2.x + offset.x, p2.y - offset.y));
    }

    // Draws the path that a player will take to go from (x1, y1) to (x2, y2).
    drawPath(p1: Point, p2: Point) {
        if (Point.isNaN(p1) || Point.isNaN(p2) || p1.equals(p2)) {
            return;
        }
        let found = false;
        let shortestPath = this.gopBoard.getPlayerPath(p1, p2);
        let color = this.pathColor;
        for (let i = 0; i < shortestPath.length; i++) {
            let p = shortestPath[i];
            if (!found && (this.currentTool === Tool.PathWalking || i % 2 === 1) && this.gopBoard.canReach(p, p2)) {
                this.fillSquare(this.pathStopColor, p.x, p.y, true);
                found = true;
                color = this.pathPostColor;
            } else {
                this.fillSquare(color, p.x, p.y, true);
            }
        }
    }

    getBestAttractingPositions(x1: number, y1: number, x2: number, y2: number) {
        let p2 = new Point(x2, y2);
        let nodes = [{ x: x1, y: y1, dist: 0 }];
        let visited: { [id: string]: boolean } = {};
        visited[[x1, y1].toString()] = true;
        let minDist = Infinity;
        let best: typeof nodes = [];
        let secondBest: typeof nodes = [];

        while (nodes.length > 0) {
            let curr = nodes.shift();
            let currPoint = new Point(curr.x, curr.y);
            // Exclude spots that are right next to the orb, as attracting from those spaces is unproductive.
            // Also exclude spots from which attracting an orb does not do anything.
            if (this.gopBoard.canReach(currPoint, p2) && Point.walkingDistance(currPoint, p2) > 1 && this.gopBoard.willMoveOrb(currPoint, p2)) {
                if (minDist === Infinity) {
                    minDist = curr.dist;
                }
                if (curr.dist === minDist) {
                    best.push(curr);
                } else if (curr.dist <= minDist + (minDist % 2)) {
                    secondBest.push(curr);
                }
            } else if (curr.dist > minDist + (minDist % 2)) {
                break;
            }

            let offsets = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
            for (let i = 0; i < offsets.length; ++i) {
                let newX = curr.x + offsets[i][0];
                let newY = curr.y + offsets[i][1];
                if (newX >= -this.centerX && newX <= this.centerX && newY >= -this.centerY && newY <= this.centerY && !visited[[newX, newY].toString()] && this.gopBoard.canMove(new Point(curr.x, curr.y), offsets[i][0], offsets[i][1], PathMode.Player)) {
                    visited[[newX, newY].toString()] = true;
                    nodes.push({ x: newX, y: newY, dist: curr.dist + 1 });
                }
            }
        }

        return [best, secondBest];
    }

    // Draws the best positions from which to attract an orb.
    drawBestAttractingPositions(x1: number, y1: number, x2: number, y2: number) {
        if (x1 === x2 && y1 === y2 || isNaN(x1) || isNaN(x2) || isNaN(y1) || isNaN(y2)) {
            return;
        }
        let ret = this.getBestAttractingPositions(x1, y1, x2, y2);
        for (let i = 0; i < ret[0].length; ++i) {
            this.fillSquare(this.bestPositionColor, ret[0][i].x, ret[0][i].y, true);
        }
        for (let i = 0; i < ret[1].length; ++i) {
            this.fillSquare(this.secondBestPositionColor, ret[1][i].x, ret[1][i].y, true);
        }
    }

    colorToString(r: number, g: number, b: number) {
        return "rgb(" + Math.round(r) + "," + Math.round(g) + "," + Math.round(b) + ")";
    }

    drawDistanceColor(x: number, y: number, dist: number) {
        let runningDist = Math.floor((dist + 1) / 2);
        let maxDist = 8;
        let t = runningDist / maxDist;
        let closeColor = { r: 64, g: 255, b: 64 };
        let farColor = { r: 255, g: 64, b: 64 };
        let color = {
            r: (1 - t) * closeColor.r + t * farColor.r,
            g: (1 - t) * closeColor.g + t * farColor.g,
            b: (1 - t) * closeColor.b + t * farColor.b,
        };
        if (t <= 1) {
            this.fillSquare(this.colorToString(color.r, color.g, color.b), x, y, true);
        }
    }

    drawDistanceColorGradient(x: number, y: number) {
        let p = new Point(x, y);
        let nodes = [{ state: p, dist: 0 }];
        let visited: { [id: string]: boolean } = {};
        visited[p.toString()] = true;

        while (nodes.length > 0) {
            let curr = nodes.shift();
            this.drawDistanceColor(curr.state.x, curr.state.y, curr.dist);
            for (let i = 0; i < Point.gridOffsets.length; ++i) {
                let p2 = curr.state.add(Point.gridOffsets[i]);
                if (this.gopBoard.isInRange(p2) && !visited[p2.toString()] && this.gopBoard.canMove(curr.state, Point.gridOffsets[i].x, Point.gridOffsets[i].y, PathMode.Player)) {
                    visited[p2.toString()] = true;
                    nodes.push({ state: p2, dist: curr.dist + 1 });
                }
            }
        }
    }

    // Draws the grid with the new grid state.
    drawGrid() {
        let playerLoc = new Point(this.playerX, this.playerY);
        let orbLoc = new Point(this.orbX, this.orbY);

        while (this.invalidatedSquares.length > 0) {
            let p = this.invalidatedSquares.pop();
            this.fillSquare(this.stateColors[this.gopBoard.get(p)], p.x, p.y, false);
        }
        if (!isNaN(this.orbX) && !isNaN(this.orbY)) {
            this.fillSquare(this.orbColor, this.orbX, this.orbY, true);
        }
        if (!isNaN(this.playerX) && !isNaN(this.playerY)) {
            if (this.currentTool === Tool.LineOfSight) {
                this.drawLineOfSight(playerLoc, orbLoc);
            } else if (this.currentTool === Tool.PathRunning || this.currentTool === Tool.PathWalking) {
                this.drawPath(playerLoc, orbLoc);
            } else if (this.currentTool === Tool.ClosestReachable) {
                this.drawBestAttractingPositions(this.playerX, this.playerY, this.orbX, this.orbY);
            } else if (this.currentTool === Tool.ColorDist) {
                this.drawDistanceColorGradient(this.playerX, this.playerY);
            }
            this.fillSquare(this.playerColor, this.playerX, this.playerY, false);
        }
        this.drawSpawns();
        if (this.currentTool <= Tool.WallSW) {
            this.highlightReachable();
        }
        for (let x = -this.centerX; x <= this.centerX; x++) {
            for (let y = -this.centerY; y <= this.centerY; y++) {
                this.drawWalls(new Point(x, y));
            }
        }
    }

    // Loads the default grid state.
    resetGrid() {
        this.gopBoard.loadAltar(this.currentAltar);
        for (let y = -this.centerY; y <= this.centerY; y++) {
            for (let x = -this.centerX; x <= this.centerX; x++) {
                this.invalidatedSquares.push(new Point(x, y));
            }
        }
        this.drawGrid();
    }

    setAltar(altar: Altar) {
        Utils.loadAltar(altar).fail(() => { altar = Altar.None; }).done(() => {
            this.currentAltar = altar;
            this.resetGrid();
        });
    }
}
