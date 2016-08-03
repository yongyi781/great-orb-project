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
    isRunning: boolean;

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
        let c = AltarData[this.gameState.altar].groundColor;
        if (c == null) {
            return GopCanvas.defaultGroundColor;
        }
        if (c instanceof Array) {
            return c[0];
        }
        return <string>c;
    }

    tileColor(x: number, y: number) {
        let tile = this.board.get(new Point(x, y));
        switch (tile) {
            case Tile.Floor:
            case Tile.WallW:
            case Tile.WallS:
            case Tile.WallSW:
            case Tile.Minipillar1:
            case Tile.Minipillar2:
                let pattern = AltarData[this.gameState.altar].groundPattern;
                if (pattern !== undefined && pattern !== null) {
                    return AltarData[this.gameState.altar].groundColor[pattern[this.board.ymax - y][x + this.board.xmax]];
                }
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
        return obj.getDrawLocation(this.tickProgress);
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
            let center = this.getDrawLocation(this.player);
            return new Point((x - center.x + this.visibilityRadius) * this.cellWidth, (-y + center.y + this.visibilityRadius) * this.cellHeight);
        }
        return new Point((x + this.visibilityRadius) * this.cellWidth, (-y + this.visibilityRadius) * this.cellHeight);
    }

    /**
     * Converts screen coordinates to grid coordinates.
     */
    fromScreenCoords(x: number, y: number, truncate = true) {
        let center = this.getDrawLocation(this.player);
        let p = new Point(x / this.cellWidth - this.visibilityRadius - 0.5, -y / this.cellHeight + this.visibilityRadius + 0.5);
        let pRotated = new Point(
            p.x * Math.cos(this.rotationAngle) - p.y * Math.sin(this.rotationAngle),
            p.x * Math.sin(this.rotationAngle) + p.y * Math.cos(this.rotationAngle));
        let pTranslated = new Point(pRotated.x + center.x, pRotated.y + center.y);
        return truncate ? new Point(Math.floor(pTranslated.x + 0.5), Math.ceil(pTranslated.y - 0.5)) : new Point(pTranslated.x, pTranslated.y);
    }

    /**
     * Fills the square at the point (x, y) with the specified fill style.
     */
    bgFillSquare(context: CanvasRenderingContext2D, fillStyle: string, x: number, y: number, sizeDiff = 0) {
        let square = this.toBgScreenCoords(x, y);
        context.fillStyle = fillStyle;
        context.fillRect(square.x, square.y, this.cellWidth + sizeDiff, this.cellHeight + sizeDiff);
    }

    /**
     * Fills the square at the point (x, y) with the specified fill style.
     */
    fillSquare(context: CanvasRenderingContext2D, fillStyle: string, x: number, y: number, sizeDiff = 0) {
        let square = this.toScreenCoords(x, y);
        context.fillStyle = fillStyle;
        context.fillRect(square.x, square.y, this.cellWidth + sizeDiff, this.cellHeight + sizeDiff);
    }

    fillSquareWithImage(src: string, x: number, y: number, factor: number) {
        let square = this.toScreenCoords(x, y, true);
        this.fgContext.drawImage(this.orbImage, square.x - 0.5 * (factor - 1) * this.cellWidth, square.y - 0.5 * (factor - 1) * this.cellHeight, factor * this.cellWidth, factor * this.cellHeight);
    }

    /**
     * Draws walls at (x, y) according to the board grid state.
     */
    drawWalls(p: Point) {
        let tile = this.board.get(p);
        if (tile < Tile.WallW) {
            return;
        }

        let s = this.toBgScreenCoords(p.x, p.y);
        if (tile === Tile.WallS) {
            this.bgContext.beginPath();
            this.bgContext.moveTo(s.x, s.y + this.cellHeight);
            this.bgContext.lineTo(s.x + this.cellWidth, s.y + this.cellHeight);
            this.bgContext.stroke();
        } else if (tile === Tile.WallW) {
            this.bgContext.beginPath();
            this.bgContext.moveTo(s.x, s.y);
            this.bgContext.lineTo(s.x, s.y + this.cellHeight);
            this.bgContext.stroke();
        } else if (tile === Tile.WallSW) {
            this.bgContext.beginPath();
            this.bgContext.moveTo(s.x, s.y);
            this.bgContext.lineTo(s.x, s.y + this.cellHeight);
            this.bgContext.lineTo(s.x + this.cellWidth, s.y + this.cellHeight);
            this.bgContext.stroke();
        } else if (tile >= Tile.Minipillar1) {
            this.bgContext.fillStyle = "black";
            this.bgContext.fillRect(s.x - 3, s.y + this.cellHeight - 3, 5, 5);
        }
    }

    /**
     * Paints the barriers, walls, rocks, and water.
     */
    paintBackground() {
        this.bgContext.fillStyle = this.groundColor();
        this.bgContext.fillRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
        for (let y = -this.board.ymax; y <= this.board.ymax; y++) {
            for (let x = -this.board.xmax; x <= this.board.xmax; x++) {
                let color = this.tileColor(x, y);
                if (color !== this.groundColor()) {
                    this.bgFillSquare(this.bgContext, color, x, y, 0);
                }
            }
        }
        // Draw gridlines
        this.bgContext.lineWidth = 1;
        this.bgContext.strokeStyle = GopCanvas.gridlineColor;
        this.bgContext.beginPath();
        for (let x = 1; x <= this.board.numColumns; ++x) {
            this.bgContext.moveTo(x * this.cellWidth - 0.5, 0);
            this.bgContext.lineTo(x * this.cellWidth - 0.5, this.bgCanvas.height);
        }
        for (let y = 0; y < this.board.numRows; ++y) {
            this.bgContext.moveTo(0, y * this.cellHeight - 0.5);
            this.bgContext.lineTo(this.bgCanvas.width, y * this.cellHeight - 0.5);
        }
        this.bgContext.stroke();
        this.bgContext.strokeStyle = "black";
        this.bgContext.lineWidth = 3;
        for (let x = -this.board.xmax; x <= this.board.xmax; ++x) {
            for (let y = -this.board.ymax; y <= this.board.ymax; ++y) {
                this.drawWalls(new Point(x, y));
            }
        }
        // Draw altar images!
        if (this.gameState.altar > 0 && this.gameState.altar <= this.altarImages.length) {
            let drawLocation = this.toBgScreenCoords(-1, 1);
            let margin = this.cellWidth / 3;
            this.bgContext.drawImage(
                this.altarImages[this.gameState.altar - 1],
                drawLocation.x + margin,
                drawLocation.y + margin,
                this.cellWidth * 3 - 2 * margin,
                this.cellHeight * 3 - 2 * margin);
        }
    }

    drawHUD() {
        this.drawRunRepelIndicators();
        this.drawTimerAndScore();
    }

    drawRunRepelIndicators() {
        let x = this.fgCanvas.width - 20;
        let y = 30;

        this.fgContext.textAlign = "right";
        this.fgContext.font = "24px Roboto";

        this.fgContext.fillStyle = this.player.run ? "#ddeedd" : "#ccbbbb";
        let runText = `Run ${this.player.run ? "on" : "off"}`;
        this.fgContext.fillText(runText, x, y);

        this.fgContext.fillStyle = this.player.repel ? "#ddeedd" : "#ccbbbb";
        let repelText = `Repel ${this.player.repel ? "on" : "off"}`;
        this.fgContext.fillText(repelText, x, y + 30);
    }

    drawTimerAndScore() {
        let timerEnd = GameState.ticksPerAltar - 3;
        let radius = this.timerRadius * this.cellWidth;
        let timerX = this.fgCanvas.width - radius - 30;
        let timerY = this.fgCanvas.height - radius - 75;
        // Draw timer outline
        this.fgContext.lineWidth = 2;
        this.fgContext.strokeStyle = "rgba(255, 255, 0, 0.1)";
        this.fgContext.beginPath();
        this.fgContext.arc(timerX, timerY, radius, 0, 2 * Math.PI);
        this.fgContext.stroke();

        if (!this.isRunning && this.gameState.currentTick > 0) {
            this.fgContext.fillStyle = "rgba(0, 255, 0, 0.1)";
            this.fgContext.moveTo(timerX, timerY);
            this.fgContext.arc(timerX, timerY, radius, 0, 2 * Math.PI);
            this.fgContext.fill();
        } else if (this.gameState.currentTick < timerEnd) {
            // Draw timer inside
            this.fgContext.fillStyle = this.gameState.currentTick >= 0.75 * timerEnd ?
                "rgba(255, 0, 0, 0.1)" : "rgba(255, 255, 0, 0.1)";
            this.fgContext.beginPath();
            this.fgContext.moveTo(timerX, timerY);
            this.fgContext.arc(timerX, timerY, radius, -Math.PI / 2, -Math.PI / 2 - 2 * Math.PI * (1 - this.gameState.currentTick / (timerEnd)), true);
            this.fgContext.lineTo(timerX, timerY);
            this.fgContext.fill();
        }

        // Draw current tick
        this.fgContext.textAlign = "center";
        this.fgContext.textBaseline = "middle";

        this.fgContext.font = "20px Roboto";
        this.fgContext.fillStyle = "#ffff80";
        this.fgContext.fillText(this.gameState.currentTick.toString(), timerX, timerY);

        // Draw score
        this.fgContext.font = "24px Roboto";
        this.fgContext.fillStyle = "#eeeeee";
        this.fgContext.fillText(this.gameState.score.toString(), timerX, timerY + radius + 24);
        this.fgContext.font = "16px Roboto";
        this.fgContext.fillStyle = "#ccccdd";
        this.fgContext.fillText(`Estimated: ${this.gameState.getEstimatedScore().toString()}`, timerX, timerY + radius + 48);
    }

    /**
     * Paints the GOP canvas.
     */
    paint() {
        let center = this.player == null ? Point.zero : this.getDrawLocation(this.player);

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
            let drawLocation = this.getDrawLocation(player);
            if (player.isAttracting && player.currentOrb !== null) {
                // Draw attracting pulses
                let orbDrawLocation = this.getDrawLocation(player.currentOrb);
                let p = player.repel ? Point.lerp(drawLocation, orbDrawLocation, this.tickProgress) : Point.lerp(orbDrawLocation, drawLocation, this.tickProgress);
                let screenCoords = this.toScreenCoords(p.x + 0.5, p.y - 0.5, true);
                this.fgContext.beginPath();
                this.fgContext.arc(Math.floor(screenCoords.x), Math.floor(screenCoords.y), this.cellWidth / 8, 0, 2 * Math.PI);
                this.fgContext.fillStyle = "rgba(255, 255, 0, 0.5)";
                this.fgContext.fill();
            }
            this.fillSquare(this.fgContext, player.isAttracting ? GopCanvas.playerAttractingColors[index] : GopCanvas.playerIdleColors[index], drawLocation.x - center.x, drawLocation.y - center.y, -1);
        }, this);

        for (let i = 0; i < this.gameState.orbs.length; ++i) {
            if (!Point.isNaN(this.gameState.orbs[i].location)) {
                let p = this.getDrawLocation(this.gameState.orbs[i]);
                // Rotate orbs back
                this.fgContext.save();
                let pScreen = this.toScreenCoords(p.x + 0.5, p.y - 0.5, true);
                this.fgContext.translate(pScreen.x, pScreen.y);
                this.fgContext.rotate(-this.rotationAngle);
                this.fgContext.translate(-pScreen.x, -pScreen.y);
                this.fillSquareWithImage(this.orbImageSrc, p.x, p.y, this.orbSize);
                this.fgContext.restore();
            }
        }
        this.fgContext.restore();

        if (this.showTimer) {
            this.drawHUD();
        }
    }

    private loadImages() {
        const altarNames = ["air", "mind", "water", "earth", "fire", "body"];
        this.orbImage = this.loadImage(this.orbImageSrc);
        for (let i = 0; i < GopCanvas.numAltars; ++i) {
            this.altarImages[i] = this.loadImage(this.alterOverlayImagePath + altarNames[i] + ".png");
        }
    }

    private loadImage(src: string) {
        let img = new Image();
        img.src = src;
        img.onload = () => {
            ++this.numImagesLoaded;
            if (this.numImagesLoaded === this.numImagesTotal) {
                this.onAllImagesLoaded();
            }
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
