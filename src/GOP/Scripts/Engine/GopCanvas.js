var GopCanvas = (function () {
    function GopCanvas(fgCanvas, gameState, visibilityRadius, playerIndex, orbSize, timerRadius, showTimer) {
        if (orbSize === void 0) { orbSize = 2; }
        if (timerRadius === void 0) { timerRadius = 2; }
        if (showTimer === void 0) { showTimer = true; }
        this.fgCanvas = fgCanvas;
        this.gameState = gameState;
        this.visibilityRadius = visibilityRadius;
        this.orbSize = orbSize;
        this.timerRadius = timerRadius;
        this.showTimer = showTimer;
        this.bgCanvas = document.createElement("canvas");
        this.bgContext = this.bgCanvas.getContext("2d");
        this.fgContext = this.fgCanvas.getContext("2d");
        this.board = this.gameState.board;
        this.showHighlights = false;
        this.showSpawnLocations = false;
        this.tickProgress = 0;
        this.rotationAngle = 0;
        // Element 7 takes care of all indices >= 7
        this.numAltars = 6;
        this.altarGroundColors = ["#555555", "#404833", "#665D5D", "#454f36", "#281400", "#272010", "#514745", "#848899"];
        this.waterColors = { 1: "#363025", 3: "#002244", 5: "#666622", 7: "#002244" };
        this.highlightColor = "rgba(0, 255, 0, 0.05)";
        this.playerIdleColors = ["#109090", "#871450", "#148718", "#630D0D"];
        this.playerAttractingColors = ["#20c0c0", "#a74470", "#4BD650", "#CC3B3B"];
        this.gridlineColor = "rgba(0, 0, 0, 0.25)";
        this.numImagesLoaded = 0;
        this.numImagesTotal = 7; // Orb image + altar images
        this.orbImageSrc = "/Images/yellow-orb-32x32.png";
        this.alterOverlayImagePath = "/Images/altar-overlays/";
        this.altarImages = [];
        // Mind altar floor color map
        this.mindAltarColors = {
            0: this.altarGroundColors[Altar.Mind],
            1: "#4C4C46",
            2: "#3F3A3A"
        };
        this.player = this.gameState.players[playerIndex];
        this.calculateDimensions();
        this.loadImages();
    }
    GopCanvas.prototype.floorColor = function () {
        return this.altarGroundColors[Math.min(this.numAltars + 1, this.gameState.altar)];
    };
    GopCanvas.prototype.tileColor = function (x, y) {
        var tile = this.board.get(new Point(x, y));
        switch (tile) {
            case Tile.Floor:
            case Tile.WallW:
            case Tile.WallS:
            case Tile.WallSW:
            case Tile.Minipillar1:
            case Tile.Minipillar2:
                if (this.gameState.altar === Altar.Mind || this.gameState.altar === 64) {
                    return this.mindAltarColors[MindFloorTiles[this.board.ymax - y][x + this.board.xmax]];
                }
                return this.floorColor();
            case Tile.Barrier:
                return "black";
            case Tile.Rock:
                return "#333";
            case Tile.Water:
                return this.waterColors[Math.min(this.numAltars + 1, this.gameState.altar)];
            default:
                return "#ff0000";
        }
    };
    GopCanvas.prototype.calculateDimensions = function () {
        this.gridSize = 2 * this.visibilityRadius + 1;
        this.cellWidth = this.fgCanvas.width / this.gridSize;
        this.cellHeight = this.fgCanvas.height / this.gridSize;
        this.bgCanvas.width = this.board.numRows * this.cellWidth;
        this.bgCanvas.height = this.board.numColumns * this.cellHeight;
    };
    GopCanvas.prototype.getDrawLocation = function (obj) {
        return Point.lerp(obj.prevLocation, obj.location, this.tickProgress);
    };
    /**
     * Converts grid coordinates to screen coordinates in the background canvas.
     */
    GopCanvas.prototype.toBgScreenCoords = function (x, y) {
        return new Point((x + Math.floor(this.board.numColumns / 2)) * this.cellWidth, (-y + Math.floor(this.board.numRows / 2)) * this.cellHeight);
    };
    /**
     * Converts grid coordinates to screen coordinates in the foreground canvas.
     * @param relative Whether the coordinates are relative to the player.
     */
    GopCanvas.prototype.toScreenCoords = function (x, y, relative) {
        if (relative === void 0) { relative = false; }
        if (relative) {
            var center = this.getDrawLocation(this.player);
            return new Point((x - center.x + this.visibilityRadius) * this.cellWidth, (-y + center.y + this.visibilityRadius) * this.cellHeight);
        }
        return new Point((x + this.visibilityRadius) * this.cellWidth, (-y + this.visibilityRadius) * this.cellHeight);
    };
    /**
     * Converts screen coordinates to grid coordinates.
     */
    GopCanvas.prototype.fromScreenCoords = function (x, y, truncate) {
        if (truncate === void 0) { truncate = true; }
        var center = this.getDrawLocation(this.player);
        var p = new Point(x / this.cellWidth - this.visibilityRadius - 0.5, -y / this.cellHeight + this.visibilityRadius + 0.5);
        var pRotated = new Point(p.x * Math.cos(this.rotationAngle) - p.y * Math.sin(this.rotationAngle), p.x * Math.sin(this.rotationAngle) + p.y * Math.cos(this.rotationAngle));
        var pTranslated = new Point(pRotated.x + center.x, pRotated.y + center.y);
        return truncate ? new Point(Math.floor(pTranslated.x + 0.5), Math.ceil(pTranslated.y - 0.5)) : new Point(pTranslated.x, pTranslated.y);
    };
    /**
     * Fills the square at the point (x, y) with the specified fill style.
     */
    GopCanvas.prototype.bgFillSquare = function (context, fillStyle, x, y, sizeDiff) {
        if (sizeDiff === void 0) { sizeDiff = 0; }
        var square = this.toBgScreenCoords(x, y);
        context.fillStyle = fillStyle;
        context.fillRect(square.x, square.y, this.cellWidth + sizeDiff, this.cellHeight + sizeDiff);
    };
    /**
    * Fills the square at the point (x, y) with the specified fill style.
    */
    GopCanvas.prototype.fillSquare = function (context, fillStyle, x, y, sizeDiff) {
        if (sizeDiff === void 0) { sizeDiff = 0; }
        var square = this.toScreenCoords(x, y);
        context.fillStyle = fillStyle;
        context.fillRect(square.x, square.y, this.cellWidth + sizeDiff, this.cellHeight + sizeDiff);
    };
    GopCanvas.prototype.fillSquareWithImage = function (src, x, y, factor) {
        var square = this.toScreenCoords(x, y, true);
        this.fgContext.drawImage(this.orbImage, square.x - 0.5 * (factor - 1) * this.cellWidth, square.y - 0.5 * (factor - 1) * this.cellHeight, factor * this.cellWidth, factor * this.cellHeight);
    };
    /**
     * Draws walls at (x, y) according to the board grid state.
     */
    GopCanvas.prototype.drawWalls = function (x, y) {
        var p = new Point(x, y);
        if (this.board.get(p) < Tile.WallW)
            return;
        var s = this.toBgScreenCoords(x, y);
        this.bgContext.beginPath();
        if (this.board.get(p) === Tile.WallS) {
            this.bgContext.moveTo(s.x, s.y + this.cellHeight);
            this.bgContext.lineTo(s.x + this.cellWidth, s.y + this.cellHeight);
        }
        else if (this.board.get(p) === Tile.WallW) {
            this.bgContext.moveTo(s.x, s.y);
            this.bgContext.lineTo(s.x, s.y + this.cellHeight);
        }
        else if (this.board.get(p) === Tile.WallSW) {
            this.bgContext.moveTo(s.x, s.y);
            this.bgContext.lineTo(s.x, s.y + this.cellHeight);
            this.bgContext.lineTo(s.x + this.cellWidth, s.y + this.cellHeight);
        }
        else if (this.board.get(p) >= Tile.Minipillar1) {
            this.bgContext.fillStyle = "black";
            this.bgContext.fillRect(s.x - 3, s.y + this.cellHeight - 3, 5, 5);
        }
        this.bgContext.stroke();
    };
    /**
     * Paints the barriers, walls, rocks, and water.
     */
    GopCanvas.prototype.paintBackground = function () {
        this.bgContext.fillStyle = this.floorColor();
        this.bgContext.fillRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
        for (var y = -this.board.ymax; y <= this.board.ymax; y++)
            for (var x = -this.board.xmax; x <= this.board.xmax; x++)
                if (this.tileColor(x, y) !== this.floorColor())
                    this.bgFillSquare(this.bgContext, this.tileColor(x, y), x, y, 0);
        // Draw gridlines
        this.bgContext.lineWidth = 1;
        this.bgContext.strokeStyle = this.gridlineColor;
        this.bgContext.beginPath();
        for (var x = 1; x <= this.board.numColumns; ++x) {
            this.bgContext.moveTo(x * this.cellWidth - 0.5, 0);
            this.bgContext.lineTo(x * this.cellWidth - 0.5, this.bgCanvas.height);
        }
        for (var y = 0; y < this.board.numRows; ++y) {
            this.bgContext.moveTo(0, y * this.cellHeight - 0.5);
            this.bgContext.lineTo(this.bgCanvas.width, y * this.cellHeight - 0.5);
        }
        this.bgContext.stroke();
        this.bgContext.strokeStyle = "black";
        this.bgContext.lineWidth = 3;
        for (var x = -this.board.xmax; x <= this.board.xmax; ++x)
            for (var y = -this.board.ymax; y <= this.board.ymax; ++y)
                this.drawWalls(x, y);
        // Draw altar images!
        if (this.gameState.altar > 0 && this.gameState.altar <= this.altarImages.length) {
            var drawLocation = this.toBgScreenCoords(-1, 1);
            var margin = this.cellWidth / 3;
            this.bgContext.drawImage(this.altarImages[this.gameState.altar - 1], drawLocation.x + margin, drawLocation.y + margin, this.cellWidth * 3 - 2 * margin, this.cellHeight * 3 - 2 * margin);
        }
    };
    GopCanvas.prototype.drawTimer = function () {
        if (this.gameState.currentTick < GameState.ticksPerAltar - 3) {
            var radius = this.timerRadius * this.cellWidth;
            var cx = this.fgCanvas.width - radius - 10;
            var cy = radius + 10;
            this.fgContext.fillStyle = "rgba(255, 255, 0, 0.2)";
            this.fgContext.beginPath();
            this.fgContext.moveTo(cx, cy);
            this.fgContext.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 - 2 * Math.PI * (1 - this.gameState.currentTick / (GameState.ticksPerAltar - 3)), true);
            this.fgContext.lineTo(cx, cy);
            this.fgContext.fill();
        }
    };
    /**
     * Paints the GOP canvas.
     */
    GopCanvas.prototype.paint = function () {
        var center = this.player === undefined ? Point.zero : this.getDrawLocation(this.player);
        if (this.rotationAngle !== 0) {
            // Rotate by rotationAngle
            this.fgContext.save();
            this.fgContext.translate(this.fgCanvas.width / 2, this.fgCanvas.height / 2);
            this.fgContext.rotate(this.rotationAngle);
            this.fgContext.translate(-this.fgCanvas.width / 2, -this.fgCanvas.height / 2);
        }
        this.fgContext.clearRect(0, 0, this.fgCanvas.width, this.fgCanvas.height);
        this.fgContext.save();
        this.fgContext.translate((-center.x - (26 - this.visibilityRadius)) * this.cellWidth, (center.y - (26 - this.visibilityRadius)) * this.cellHeight);
        this.fgContext.drawImage(this.bgCanvas, 0, 0);
        this.fgContext.restore();
        this.gameState.players.forEach(function (player, index) {
            var drawLocation = this.getDrawLocation(player);
            if (player.isAttracting && player.currentOrb !== null) {
                // Draw attracting pulses
                var orbDrawLocation = this.getDrawLocation(player.currentOrb);
                var p = player.repel ? Point.lerp(drawLocation, orbDrawLocation, this.tickProgress) : Point.lerp(orbDrawLocation, drawLocation, this.tickProgress);
                var screenCoords = this.toScreenCoords(p.x + 0.5, p.y - 0.5, true);
                this.fgContext.beginPath();
                this.fgContext.arc(Math.floor(screenCoords.x), Math.floor(screenCoords.y), this.cellWidth / 8, 0, 2 * Math.PI);
                this.fgContext.fillStyle = "rgba(255, 255, 0, 0.5)";
                this.fgContext.fill();
            }
            this.fillSquare(this.fgContext, player.isAttracting ? this.playerAttractingColors[index] : this.playerIdleColors[index], drawLocation.x - center.x, drawLocation.y - center.y, -1);
        }, this);
        for (var i = 0; i < this.gameState.orbs.length; ++i) {
            if (!Point.isNaN(this.gameState.orbs[i].location)) {
                var p = this.getDrawLocation(this.gameState.orbs[i]);
                // Rotate orbs back
                this.fgContext.save();
                var pScreen = this.toScreenCoords(p.x + 0.5, p.y - 0.5, true);
                this.fgContext.translate(pScreen.x, pScreen.y);
                this.fgContext.rotate(-this.rotationAngle);
                this.fgContext.translate(-pScreen.x, -pScreen.y);
                this.fillSquareWithImage(this.orbImageSrc, p.x, p.y, this.orbSize);
                this.fgContext.restore();
            }
        }
        this.fgContext.restore();
        if (this.showTimer)
            this.drawTimer();
    };
    GopCanvas.prototype.loadImages = function () {
        this.orbImage = this.loadImage(this.orbImageSrc);
        for (var i = 0; i < this.numAltars; ++i)
            this.altarImages[i] = this.loadImage(this.alterOverlayImagePath + AltarData[i + 1].name + ".png");
    };
    GopCanvas.prototype.loadImage = function (src) {
        var _this = this;
        var img = new Image();
        img.src = src;
        img.onload = function () {
            ++_this.numImagesLoaded;
            if (_this.numImagesLoaded === _this.numImagesTotal)
                _this.onAllImagesLoaded();
        };
        return img;
    };
    GopCanvas.prototype.onAllImagesLoaded = function () {
        this.paintBackground();
        this.paint();
    };
    return GopCanvas;
})();
