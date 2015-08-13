class GopCanvas {
    bgCanvas = document.createElement("canvas");
    bgContext = this.bgCanvas.getContext("2d");
    fgContext = this.fgCanvas.getContext("2d");
    gridSize: number;
    cellWidth: number;
    cellHeight: number;
    board = this.gameState.board;
    showHighlights = false;
    showSpawnLocations = false;
    tickProgress = 0;
    rotationAngle = 0;
    player: Player;

    numImagesLoaded = 0;
    numImagesTotal = 7; // Orb image + altar images
    orbImageSrc = "/Images/yellow-orb-32x32.png";
    orbImage: HTMLImageElement;
    alterOverlayImagePath = "/Images/altar-overlays/";
    altarImages: HTMLImageElement[] = [];

    constructor(public fgCanvas: HTMLCanvasElement,
        public gameState: GameState,
        public visibilityRadius: number,
        playerIndex: number,
        public orbSize = 2,
        public timerRadius = 2,
        public showTimer = true) {
        this.player = this.gameState.players[playerIndex];
        this.calculateDimensions();
        this.loadImages();
    }

    groundColor() {
        var c = AltarData[this.gameState.altar].groundColor;
        if (c === void 0)
            return GopCanvas.defaultGroundColor;
        if (c instanceof Array)
            return c[0];
        return <string>c;
    }

    tileColor(x, y) {
        var tile = this.board.get(new Point(x, y));
        switch (tile) {
            case Tile.Floor:
            case Tile.WallW:
            case Tile.WallS:
            case Tile.WallSW:
            case Tile.Minipillar1:
            case Tile.Minipillar2:
                var pattern = AltarData[this.gameState.altar].groundPattern;
                if (pattern !== void 0)
                    return AltarData[this.gameState.altar].groundColor[pattern[this.board.ymax - y][x + this.board.xmax]];
                return this.groundColor();
            case Tile.Barrier:
                return "black";
            case Tile.Rock:
                return "#333";
            case Tile.Water:
                return AltarData[this.gameState.altar].waterColor || GopCanvas.defaultWaterColor;
            default:
                return "#ff0000";
        }
    }

    calculateDimensions() {
        this.gridSize = 2 * this.visibilityRadius + 1;
        this.cellWidth = this.fgCanvas.width / this.gridSize;
        this.cellHeight = this.fgCanvas.height / this.gridSize;
        this.bgCanvas.width = this.board.numRows * this.cellWidth;
        this.bgCanvas.height = this.board.numColumns * this.cellHeight;
    }

    getDrawLocation(obj: GopObject) {
        return Point.lerp(obj.prevLocation, obj.location, this.tickProgress);
    }

    /**
     * Converts grid coordinates to screen coordinates in the background canvas.
     */
    toBgScreenCoords(x: number, y: number) {
        return new Point((x + Math.floor(this.board.numColumns / 2)) * this.cellWidth, (-y + Math.floor(this.board.numRows / 2)) * this.cellHeight);
    }

    /**
     * Converts grid coordinates to screen coordinates in the foreground canvas.
     * @param relative Whether the coordinates are relative to the player.
     */
    toScreenCoords(x: number, y: number, relative = false) {
        if (relative) {
            var center = this.getDrawLocation(this.player);
            return new Point((x - center.x + this.visibilityRadius) * this.cellWidth, (-y + center.y + this.visibilityRadius) * this.cellHeight);
        }
        return new Point((x + this.visibilityRadius) * this.cellWidth, (-y + this.visibilityRadius) * this.cellHeight);
    }

    /**
     * Converts screen coordinates to grid coordinates.
     */
    fromScreenCoords(x: number, y: number, truncate = true) {
        var center = this.getDrawLocation(this.player);
        var p = new Point(x / this.cellWidth - this.visibilityRadius - 0.5, -y / this.cellHeight + this.visibilityRadius + 0.5);
        var pRotated = new Point(
            p.x * Math.cos(this.rotationAngle) - p.y * Math.sin(this.rotationAngle),
            p.x * Math.sin(this.rotationAngle) + p.y * Math.cos(this.rotationAngle));
        var pTranslated = new Point(pRotated.x + center.x, pRotated.y + center.y);
        return truncate ? new Point(Math.floor(pTranslated.x + 0.5), Math.ceil(pTranslated.y - 0.5)) : new Point(pTranslated.x, pTranslated.y);
    }

    /**
     * Fills the square at the point (x, y) with the specified fill style.
     */
    bgFillSquare(context: CanvasRenderingContext2D, fillStyle: string, x: number, y: number, sizeDiff = 0) {
        var square = this.toBgScreenCoords(x, y);
        context.fillStyle = fillStyle;
        context.fillRect(square.x, square.y, this.cellWidth + sizeDiff, this.cellHeight + sizeDiff);
    }

    /**
    * Fills the square at the point (x, y) with the specified fill style.
    */
    fillSquare(context: CanvasRenderingContext2D, fillStyle: string, x: number, y: number, sizeDiff = 0) {
        var square = this.toScreenCoords(x, y);
        context.fillStyle = fillStyle;
        context.fillRect(square.x, square.y, this.cellWidth + sizeDiff, this.cellHeight + sizeDiff);
    }

    fillSquareWithImage(src: string, x: number, y: number, factor: number) {
        var square = this.toScreenCoords(x, y, true);
        this.fgContext.drawImage(this.orbImage, square.x - 0.5 * (factor - 1) * this.cellWidth, square.y - 0.5 * (factor - 1) * this.cellHeight, factor * this.cellWidth, factor * this.cellHeight);
    }

    /**
     * Draws walls at (x, y) according to the board grid state.
     */
    drawWalls(x: number, y: number) {
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
    }

    /**
     * Paints the barriers, walls, rocks, and water.
     */
    paintBackground() {
        this.bgContext.fillStyle = this.groundColor();
        this.bgContext.fillRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
        for (var y = -this.board.ymax; y <= this.board.ymax; y++)
            for (var x = -this.board.xmax; x <= this.board.xmax; x++)
                if (this.tileColor(x, y) !== this.groundColor())
                    this.bgFillSquare(this.bgContext, this.tileColor(x, y), x, y, 0);
        // Draw gridlines
        this.bgContext.lineWidth = 1;
        this.bgContext.strokeStyle = GopCanvas.gridlineColor;
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
            this.bgContext.drawImage(
                this.altarImages[this.gameState.altar - 1],
                drawLocation.x + margin,
                drawLocation.y + margin,
                this.cellWidth * 3 - 2 * margin,
                this.cellHeight * 3 - 2 * margin);
        }
    }

    drawTimer() {
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
    }

    /**
     * Paints the GOP canvas.
     */
    paint() {
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

        this.gameState.players.forEach((player, index) => {
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
            this.fillSquare(this.fgContext, player.isAttracting ? GopCanvas.playerAttractingColors[index] : GopCanvas.playerIdleColors[index], drawLocation.x - center.x, drawLocation.y - center.y, -1);
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
    }

    private loadImages() {
        this.orbImage = this.loadImage(this.orbImageSrc);
        for (var i = 0; i < GopCanvas.numAltars; ++i)
            this.altarImages[i] = this.loadImage(this.alterOverlayImagePath + AltarData[i + 1].name + ".png");
    }

    private loadImage(src: string) {
        var img = new Image();
        img.src = src;
        img.onload = () => {
            ++this.numImagesLoaded;
            if (this.numImagesLoaded === this.numImagesTotal)
                this.onAllImagesLoaded();
        };
        return img;
    }

    private onAllImagesLoaded() {
        this.paintBackground();
        this.paint();
    }

    static numAltars = 6;
    static defaultGroundColor = "#848899";
    static defaultWaterColor = "#002244";
    static highlightColor = "rgba(0, 255, 0, 0.05)";
    static playerIdleColors = ["#109090", "#871450", "#148718", "#630D0D"];
    static playerAttractingColors = ["#20c0c0", "#a74470", "#4BD650", "#CC3B3B"];
    static gridlineColor = "rgba(0, 0, 0, 0.25)";
}
