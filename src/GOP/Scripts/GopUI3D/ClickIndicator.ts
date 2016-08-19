class ClickIndicator {
    domElement = document.createElement("canvas");

    private isActive = false;
    private context: CanvasRenderingContext2D;
    private image: HTMLImageElement;
    private numTiles: number;
    private tileDuration: number;
    private progress = 0;
    private currentTile = 0;

    constructor() {
        this.domElement.style.position = "absolute";
        this.domElement.style.pointerEvents = "none";
        this.domElement.hidden = true;
        this.context = this.domElement.getContext("2d");
    }

    start(image: HTMLImageElement, x: number, y: number, numTiles: number, tileDuration: number) {
        this.image = image;
        this.numTiles = numTiles;
        this.tileDuration = tileDuration;

        this.domElement.width = image.width / numTiles;
        this.domElement.height = image.height;
        this.domElement.style.left = `${x - this.domElement.width / 2}px`;
        this.domElement.style.top = `${y - this.domElement.height / 2}px`;
        this.domElement.hidden = false;
        this.isActive = true;
        this.progress = 0;
        this.currentTile = 0;
        this.drawCurrentTile();
    }

    end() {
        this.isActive = false;
        this.domElement.hidden = true;
    }

    update(elapsed: number) {
        if (this.isActive) {
            this.progress += elapsed;
            let tile = Math.floor(this.progress / this.tileDuration);
            if (this.currentTile !== tile) {
                this.currentTile = tile;
                if (this.currentTile < this.numTiles) {
                    this.drawCurrentTile();
                } else {
                    this.end();
                }
            }
        }
    }

    private drawCurrentTile() {
        this.context.clearRect(0, 0, this.domElement.width, this.domElement.height);
        this.context.drawImage(this.image, -this.currentTile * this.domElement.width, 0);
    }
}
