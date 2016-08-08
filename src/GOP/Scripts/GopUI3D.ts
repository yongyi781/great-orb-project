class GopUI3D {
    static WaterZOffset = 0.02;

    playerColors = ["#08f", "#871450", "#148718", "#630D0D"];
    orbColor = "#dddd00";
    barrierColor = "#666666";
    rockColor = "#888888";
    orbSize = 0.65;
    orbOpacity = 0.75;
    useOrbLights = false;
    barrierHeight = 1.5;
    rockHeight = 0.4;
    waterHeight = 0.06;
    playerHeight = 1.5;
    tickLength = 500;   // in milliseconds
    allowConfigureTickLength = true;
    cameraRotateXSpeed = 0.8 * Math.PI;
    cameraRotateYSpeed = 0.5 * Math.PI;
    mouseRotateSensitivity = 0.006;
    zoomSpeed = 10;
    mouseWheelZoomFactor = 0.0002;
    timerRadius = 40;
    orbVisibilityRadius = 15;
    allowPlayerSwitching = true;
    autoTick = true;

    keybinds = {
        run: "r",
        repel: "q",
        attract: "z",
        rewind: "-",
        fastForward: "="
    };

    runRepelIndicator: HTMLDivElement;
    timerCanvas: HTMLCanvasElement;
    timerContext: CanvasRenderingContext2D;
    scoreIndicator: HTMLDivElement;

    contextMenu: HTMLDivElement;
    optionsMenu: OptionsMenu;
    infoBox: InfoBox;

    renderer = new THREE.WebGLRenderer({ antialias: Utils.getQueryAsBoolean("antialias") });
    camera = new FollowCamera(60, 1, 0.1, 20000);
    scene = new THREE.Scene();
    textureLoader = new THREE.TextureLoader();
    raycaster = new THREE.Raycaster();

    gridTexture: THREE.Texture;
    marbleTexture: THREE.Texture;
    waterTexture: THREE.Texture;
    skyboxTextures: THREE.Texture[];

    clickIndicatorImages: HTMLImageElement[];
    clickIndicator = new ClickIndicator();

    skybox: THREE.Mesh;
    ground: THREE.Mesh;
    playerObjects: PlayerObject[] = [];
    orbObjects: OrbObject[] = [];
    light = new THREE.DirectionalLight(0xffffcc, 0.9);
    altarLight = new THREE.PointLight(0xffffff, 1.5, 15, 2);
    ambientLight = new THREE.AmbientLight(0xccccff, 0.7);
    altarObjects = new THREE.Group();
    attractDots: AttractDot[] = [];

    tickProgress = 1;
    stats: Stats;

    upPressed = false;
    downPressed = false;
    leftPressed = false;
    rightPressed = false;
    zoomInPressed = false;
    zoomOutPressed = false;
    middleMouseClicked = false;

    game: Game;

    private clock = new THREE.Clock();
    private mouseVector: THREE.Vector2;
    private displayedAltar: Altar;
    private isInitialized = false;

    constructor(public container: HTMLDivElement,
        gameState: GameState,
        playerIndex: number) {
        this.game = new Game(gameState, playerIndex);
        this.infoBox = new InfoBox(this, true);
    }

    get gameState() {
        return this.game.gameState;
    }

    /** Gets the number of tiles to a side of the grid. */
    get size() {
        return this.gameState.board.numRows;
    }

    /** Gets the maximum absolute values of the x- and y-coordinates of the grid. */
    get radius() {
        return Math.floor(this.gameState.board.numRows / 2);
    }

    get orbHeight() {
        return this.orbSize + 0.15;
    }

    get playerIndex() {
        return this.game.playerIndex;
    }

    set playerIndex(value) {
        if (this.playerIndex !== value) {
            this.game.playerIndex = value;
            if (value < this.playerObjects.length) {
                this.camera.followTarget = this.playerObjects[value].mesh;
            }
        }
    }

    get width() {
        return this.renderer.domElement.width;
    }

    get height() {
        return this.renderer.domElement.height;
    }

    get useShadows() { return this.renderer.shadowMap.enabled; }
    set useShadows(value) {
        if (this.renderer.shadowMap.enabled !== value) {
            this.renderer.shadowMap.enabled = value;
            this.initAltarGraphics();
        }
    }

    get isPaused() { return this.game.isPaused; }
    
    get clickIndicatorDuration() { return 0.4; }

    init() {
        this.renderer.shadowMap.enabled = true;
        this.renderer.setPixelRatio(devicePixelRatio);
        this.renderer.domElement.tabIndex = 1;
        this.renderer.domElement.style.outline = "none";
        this.container.appendChild(this.renderer.domElement);

        this.camera.up.set(0, 0, 1);
        this.camera.position.set(0, -9, 14);

        this.light.position.set(-6, -12, 20);
        this.light.castShadow = true;
        const d = 21;
        this.light.shadow.radius = 0.5;
        (this.light.shadow.camera as THREE.OrthographicCamera).left = -d;
        (this.light.shadow.camera as THREE.OrthographicCamera).right = d;
        (this.light.shadow.camera as THREE.OrthographicCamera).top = d;
        (this.light.shadow.camera as THREE.OrthographicCamera).bottom = -d;
        (this.light.shadow.camera as THREE.OrthographicCamera).near = 5;
        (this.light.shadow.camera as THREE.OrthographicCamera).far = 50;

        this.light.shadow.mapSize.x = 2048;
        this.light.shadow.mapSize.y = 2048;

        this.altarLight.position.set(0, 0, 1.5);
        // Adding altar light is up to user options, so we won't add it here.
        // This is because point lights get very bad performance on some browsers.

        this.scene.add(this.ambientLight);
        this.scene.add(this.light);

        this.initTextures();
        this.initSkybox();
        this.initAltarGraphics();
        this.initPlayerGraphics();
        this.initOrbGraphics();
        this.initHud();
        this.initControls();

        // Init info box
        this.infoBox.init();

        // Init context menu
        this.contextMenu = document.createElement("div");
        this.contextMenu.hidden = true;
        this.contextMenu.style.position = "absolute";
        this.contextMenu.addEventListener("contextmenu", e => { e.preventDefault(); });
        this.contextMenu.addEventListener("mousedown", e => { e.preventDefault(); });
        this.container.appendChild(this.contextMenu);

        // Init esc menu
        this.optionsMenu = new OptionsMenu(this);
        this.optionsMenu.init();
        this.optionsMenu.initOptionsFromLocalStorage();

        this.onWindowResize();
        this.isInitialized = true;
        return this;
    }

    initTextures() {
        this.gridTexture = this.textureLoader.load("/images/textures/grid.png");
        this.gridTexture.wrapS = THREE.RepeatWrapping;
        this.gridTexture.wrapT = THREE.RepeatWrapping;
        this.gridTexture.repeat.set(this.size, this.size);
        this.gridTexture.anisotropy = this.renderer.getMaxAnisotropy();

        this.marbleTexture = this.textureLoader.load("/images/textures/marble.jpg");
        this.marbleTexture.anisotropy = this.renderer.getMaxAnisotropy();

        this.waterTexture = this.textureLoader.load("/images/textures/water2.jpg");
        this.waterTexture.anisotropy = this.renderer.getMaxAnisotropy();

        const skyboxImagePrefix = "/images/textures/skyboxes/sea2/sea_";
        const skyboxSuffixes = ["rt", "lf", "up", "dn", "ft", "bk"];
        this.skyboxTextures = skyboxSuffixes.map(suffix => this.textureLoader.load(skyboxImagePrefix + suffix + ".png"));

        const clickIndicatorPaths = ["/images/click-indicators/yellow-x.png", "/images/click-indicators/red-x.png"];
        this.clickIndicatorImages = clickIndicatorPaths.map(path => {
            let image = new Image();
            image.src = path;
            return image;
        });
    }

    initSkybox() {
        let materialArray = this.skyboxTextures.map(texture => new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
            fog: false
        }));

        this.skybox = new THREE.Mesh(
            new THREE.CubeGeometry(10000, 10000, 10000),
            new THREE.MeshFaceMaterial(materialArray));
        this.skybox.rotation.x = Math.PI / 2;
        this.scene.add(this.skybox);
    }

    initAltarGraphics() {
        this.displayedAltar = this.gameState.altar;

        const tileColors = [
            this.barrierColor,
            this.rockColor,
            this.getWaterColor(),
            0x999999
        ];

        const wallWidth = 0.08;

        let groundColor = AltarData[this.gameState.altar].groundColor;
        if (groundColor instanceof Array) {
            // Use ground pattern instead of ground color
            groundColor = "#ffffff";
        } else if (groundColor == null) {
            groundColor = "#545566";
        }

        if (this.altarObjects !== undefined) {
            this.scene.remove(this.altarObjects);
        }

        this.altarObjects = new THREE.Group();

        this.ground = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.size, this.size),
            new THREE.MeshPhongMaterial({
                color: groundColor as string,
                map: this.generateGroundTexture()
            })
        );
        this.ground.receiveShadow = true;
        this.ground.matrixAutoUpdate = false;
        this.altarObjects.add(this.ground);

        let geometries: THREE.Geometry[] = [];
        for (let i = 0; i <= tileColors.length; i++) {
            geometries.push(new THREE.Geometry());
        }

        let barrierGeom = new THREE.BoxGeometry(1, 1, this.barrierHeight);
        // Remove bottom face, since you never see it.
        barrierGeom.faces.splice(10, 2);
        let rockGeom = new THREE.BoxGeometry(1, 1, this.rockHeight);
        rockGeom.faces.splice(10, 2);
        let waterGeom = new THREE.PlaneGeometry(1, 1);
        // waterGeom.faces.splice(10, 2);
        let wallWGeom = new THREE.BoxGeometry(wallWidth, 1, this.barrierHeight);
        wallWGeom.faces.splice(10, 2);
        let wallSGeom = new THREE.BoxGeometry(1, wallWidth, this.barrierHeight);
        wallSGeom.faces.splice(10, 2);
        let wallSWGeom = new THREE.BoxGeometry(wallWidth, wallWidth, this.barrierHeight);
        wallSWGeom.faces.splice(10, 2);

        for (let y = -this.radius; y <= this.radius; y++) {
            for (let x = -this.radius; x <= this.radius; x++) {
                let tile = this.gameState.board.get(new Point(x, y));
                let mesh: THREE.Mesh;
                if (tile === Tile.Barrier) {
                    mesh = new THREE.Mesh(barrierGeom);
                    mesh.position.set(x, y, this.barrierHeight / 2);
                    geometries[0].mergeMesh(mesh);
                } else if (tile === Tile.Rock) {
                    mesh = new THREE.Mesh(rockGeom);
                    mesh.position.set(x, y, this.rockHeight / 2);
                    geometries[1].mergeMesh(mesh);
                } else if (tile === Tile.Water) {
                    mesh = new THREE.Mesh(waterGeom);
                    mesh.position.set(x, y, GopUI3D.WaterZOffset);
                    geometries[2].mergeMesh(mesh);
                }
                // Walls
                if (tile === Tile.WallW || tile === Tile.WallSW) {
                    mesh = new THREE.Mesh(wallWGeom);
                    mesh.position.set(x - 0.5, y, this.barrierHeight / 2);
                    geometries[3].mergeMesh(mesh);
                }
                if (tile === Tile.WallS || tile === Tile.WallSW) {
                    mesh = new THREE.Mesh(wallSGeom);
                    mesh.position.set(x, y - 0.5, this.barrierHeight / 2);
                    geometries[3].mergeMesh(mesh);
                }
                if (tile === Tile.Minipillar1 || tile === Tile.Minipillar2) {
                    mesh = new THREE.Mesh(wallSWGeom);
                    mesh.position.set(x - 0.5, y - 0.5, this.barrierHeight / 2);
                    geometries[3].mergeMesh(mesh);
                }
            }
        }

        for (let i = 0; i < geometries.length; i++) {
            if (geometries[i].vertices.length > 0) {
                geometries[i].mergeVertices();
                let mesh = new THREE.Mesh(geometries[i], new THREE.MeshLambertMaterial({ color: tileColors[i] }));
                mesh.matrixAutoUpdate = false;
                mesh.castShadow = true;
                if (i === 2) {
                    let alpha = this.getWaterAlpha();
                    mesh.material.transparent = alpha < 1;
                    mesh.material.opacity = alpha;
                    mesh.castShadow = false;
                    (mesh.material as THREE.MeshLambertMaterial).map = this.waterTexture;
                    mesh.material.needsUpdate = true;
                } else {
                    (mesh.material as THREE.MeshLambertMaterial).map = this.marbleTexture;
                    mesh.material.needsUpdate = true;
                }
                this.altarObjects.add(mesh);
            }
        }
        this.scene.add(this.altarObjects);
    }

    initPlayerGraphics() {
        // Remove current players
        for (let playerObj of this.playerObjects) {
            this.scene.remove(playerObj.mesh);
        }
        this.playerObjects = this.gameState.players.map((player, i) => new PlayerObject(player, this.playerHeight, this.playerColors[i]));
        for (let playerObj of this.playerObjects) {
            this.scene.add(playerObj.mesh);
        }

        if (this.game.playerIndex < this.playerObjects.length) {
            this.camera.followTarget = this.playerObjects[this.game.playerIndex].mesh;
        }
    }

    /** Initializes the orbs in the scene. */
    initOrbGraphics() {
        // Remove current orbs
        for (let orbObj of this.orbObjects) {
            this.scene.remove(orbObj.mesh);
            this.scene.remove(orbObj.light);
        }

        this.orbObjects = this.gameState.orbs.map(orb => new OrbObject(
            orb, this.orbSize, this.orbHeight, this.orbColor,
            this.orbOpacity));
        for (let orbObj of this.orbObjects) {
            this.scene.add(orbObj.mesh);
            // If there are too many orbs, then we can't have that many lights.
            if (this.useOrbLights && this.gameState.orbs.length <= 10) {
                this.scene.add(orbObj.light);
            }
        }
    }

    initControls() {
        this.stats = new Stats();
        this.stats.dom.style.position = "absolute";
        this.stats.dom.style.top = "0px";
        this.container.appendChild(this.stats.dom);

        this.renderer.domElement.addEventListener("mousedown", this.onMouseDown.bind(this));
        this.renderer.domElement.addEventListener("mouseup", this.onMouseUp.bind(this));
        this.renderer.domElement.addEventListener("mousemove", this.onMouseMove.bind(this));
        this.renderer.domElement.addEventListener("wheel", this.onWheel.bind(this));
        this.renderer.domElement.addEventListener("contextmenu", e => e.preventDefault());
        this.renderer.domElement.addEventListener("keydown", this.onKeyDown.bind(this));
        this.renderer.domElement.addEventListener("keyup", this.onKeyUp.bind(this));

        this.renderer.domElement.addEventListener("blur", e => {
            // Cancel all camera movements
            this.leftPressed = this.rightPressed = this.upPressed = this.downPressed = this.zoomInPressed = this.zoomOutPressed = this.middleMouseClicked = false;
        });

        $(window).resize(this.onWindowResize.bind(this));
    }

    initHud() {
        this.runRepelIndicator = document.createElement("div");
        this.runRepelIndicator.className = "run-repel-indicator";
        this.container.appendChild(this.runRepelIndicator);

        this.timerCanvas = document.createElement("canvas");
        this.timerCanvas.className = "timer";
        this.timerCanvas.width = 2 * this.timerRadius + 2;
        this.timerCanvas.height = 2 * this.timerRadius + 2;
        this.container.appendChild(this.timerCanvas);
        this.timerContext = this.timerCanvas.getContext("2d");

        this.scoreIndicator = document.createElement("div");
        this.scoreIndicator.className = "score-indicator";
        this.container.appendChild(this.scoreIndicator);

        this.container.appendChild(this.clickIndicator.domElement);
    }

    getWaterColor() {
        let color = AltarData[this.gameState.altar].waterColor;
        if (color == null) {
            return "#446688";
        }
        return color.substr(0, 7);
    }

    getWaterAlpha() {
        let color = AltarData[this.gameState.altar].waterColor;
        if (color == null || color.length < 9) {
            return 0.7;
        }
        return parseInt(color.substr(7, 2), 16) / 255;
    }

    mouseEventToRaycastVector(e: MouseEvent) {
        return new THREE.Vector2(
            2 * (e.offsetX / this.renderer.domElement.clientWidth) - 1,
            1 - 2 * (e.offsetY / this.renderer.domElement.clientHeight)
        );
    }

    clickableObjectsUnderLocation(v: THREE.Vector2) {
        this.raycaster.setFromCamera(v, this.camera);
        return this.raycaster.intersectObjects(this.orbObjects.map(obj => obj.mesh).concat(this.ground), true);
    }

    generateGroundTexture() {
        let groundColors = AltarData[this.gameState.altar].groundColor;
        let groundPattern = AltarData[this.gameState.altar].groundPattern;
        if (!groundPattern || !(groundColors instanceof Array)) {
            return this.gridTexture;
        }

        let canvas = document.createElement("canvas");
        let size = 2048;
        let scale = size / this.size;
        let roundedScale = Math.round(scale);
        canvas.width = size;
        canvas.height = size;
        let context = canvas.getContext("2d");
        context.fillStyle = groundColors[0];
        context.fillRect(0, 0, canvas.width, canvas.height);
        for (let y = -this.radius; y <= this.radius; y++) {
            for (let x = -this.radius; x <= this.radius; x++) {
                let nx = this.radius + x;
                let ny = this.radius - y;
                let color = groundColors[groundPattern[ny][nx]];
                if (color !== groundColors[0]) {
                    context.fillStyle = color;
                    context.fillRect(Math.round(scale * nx), Math.round(scale * ny), roundedScale, roundedScale);
                }
            }
        }
        // Draw gridlines
        context.lineWidth = 1;
        context.strokeStyle = "#222222";
        context.beginPath();
        for (let x = 1; x <= this.size; x++) {
            context.moveTo(Math.floor(x * scale) + 0.5, 0);
            context.lineTo(Math.floor(x * scale) + 0.5, canvas.height);
        }
        for (let y = 0; y < this.size; y++) {
            context.moveTo(0, Math.floor(y * scale) + 0.5);
            context.lineTo(canvas.width, Math.floor(y * scale) + 0.5);
        }
        context.stroke();

        let texture = new THREE.Texture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.anisotropy = this.renderer.getMaxAnisotropy();
        texture.needsUpdate = true;
        return texture;
    }

    setAltarAndSeed(altar: number, seed: number) {
        this.gameState.altar = altar;
        this.gameState.seed = seed;
    }

    /**
     * Starts the 3D GOP rendering. Note that this doesn't start the game itself.
     * The player must click to start the game.
     */
    startAnimation() {
        this.clock.start();
        this.updateDisplay();
        this.animate();
    }

    updateHud() {
        this.drawRunRepelIndicators();
        this.drawTimer();
        this.drawScore();
        this.infoBox.update();
    }

    drawRunRepelIndicators() {
        let runColor = this.game.player.run ? "#ddeedd" : "#ccbbbb";
        let runHtml = `<span style="color: ${runColor}">Run ${this.game.player.run ? "on" : "off"}</span>`;

        let repelColor = this.game.player.repel ? "#ddeedd" : "#ccbbbb";
        let repelHtml = `<span style="color: ${repelColor}">Repel ${this.game.player.repel ? "on" : "off"}</span>`;
        if (this.runRepelIndicator != null) {
            this.runRepelIndicator.innerHTML = `${runHtml}<br/>${repelHtml}`;
        }
    }

    drawTimer() {
        this.timerContext.clearRect(0, 0, this.timerCanvas.width, this.timerCanvas.height);

        let timerEnd = GameState.ticksPerAltar - 3;
        let radius = this.timerRadius;
        let timerX = this.timerCanvas.width / 2;
        let timerY = this.timerCanvas.height / 2;
        // Draw timer outline
        this.timerContext.lineWidth = 2;
        this.timerContext.strokeStyle = "rgba(255, 255, 0, 0.6)";
        this.timerContext.beginPath();
        this.timerContext.arc(timerX, timerY, radius, 0, 2 * Math.PI);
        this.timerContext.stroke();

        if (!this.game.isStarted || this.game.isFinished) {
            this.timerContext.fillStyle = !this.game.isStarted ? "rgba(0, 255, 255, 0.4)" : "rgba(0, 255, 0, 0.4)";
            this.timerContext.moveTo(timerX, timerY);
            this.timerContext.arc(timerX, timerY, radius, 0, 2 * Math.PI);
            this.timerContext.fill();
        } else if (this.gameState.currentTick < timerEnd) {
            // Draw timer inside
            this.timerContext.fillStyle = this.gameState.currentTick >= 0.75 * timerEnd ?
                "rgba(255, 0, 0, 0.4)" : "rgba(255, 255, 0, 0.4)";
            this.timerContext.beginPath();
            this.timerContext.moveTo(timerX, timerY);
            this.timerContext.arc(timerX, timerY, radius, -Math.PI / 2, -Math.PI / 2 - 2 * Math.PI * (1 - this.gameState.currentTick / (timerEnd)), true);
            this.timerContext.lineTo(timerX, timerY);
            this.timerContext.fill();
        }

        // Draw current tick
        this.timerContext.textAlign = "center";
        this.timerContext.textBaseline = "middle";

        this.timerContext.font = "20px Roboto";
        this.timerContext.fillStyle = "#ffff80";
        this.timerContext.fillText(this.gameState.currentTick.toString(), timerX, timerY);
    }

    drawScore() {
        this.scoreIndicator.innerHTML = `
<span style="font-size: 24px">${this.gameState.score}<br/>
<span style="color: #ccc; font-size: 16px">Estimated: ${this.gameState.getEstimatedScore()}</span>`;
    }

    restart(resetGameplayData = true) {
        this.game.restart(resetGameplayData);

        if (resetGameplayData) {
            // Reset tick progress
            this.tickProgress = 1;
        } else {
            // Give a whole tick for multiplayer situations
            this.tickProgress = 0;
        }

        if (this.displayedAltar !== this.gameState.altar) {
            this.initAltarGraphics();
        }

        if (this.isInitialized) {
            this.updateDisplay();
        }

        this.infoBox.resetSaveState(0);
    }

    restartFromCode(code: string) {
        return this.game.restartFromCode(code).always(() => {
            this.initAltarGraphics();
            this.initPlayerGraphics();
            this.initOrbGraphics();
        });
    }

    /**
     * Rewinds the game a set amount of ticks.
     */
    rewind(ticks = 7) {
        if (!this.game.isStarted) {
            return;
        }

        let tickToLoad = this.gameState.currentTick - ticks;
        this.restart(false);
        this.game.start();
        for (let i = 0; i < tickToLoad; i++) {
            this.game.tick();
        }
        this.updateDisplay();
    }

    fastForward(ticks = 7) {
        if (!this.game.isStarted) {
            this.game.start();
        }

        for (let i = 0; i < ticks; i++) {
            this.game.tick();
        }
        this.updateDisplay();
    }

    updateOrbsVisibility() {
        for (let orb of this.gameState.orbs) {
            if (orb.index < this.orbObjects.length) {
                this.orbObjects[orb.index].mesh.visible = Point.walkingDistance(orb.location, this.game.player.location) <= this.orbVisibilityRadius;
            }
        }
    }

    updateAttractDots() {
        // Every tick, remove old attract dots
        // and add a new attract dot for each player that's attracting or repelling.
        for (let attractDot of this.attractDots) {
            this.scene.remove(attractDot.mesh);
        }
        this.attractDots = [];
        for (let playerObj of this.playerObjects) {
            if (playerObj.player.isAttracting && playerObj.player.currentOrb !== null) {
                let orbObj = this.orbObjects[playerObj.player.currentOrb.index];
                let attractDot: AttractDot;
                let orbColor = new THREE.Color(this.orbColor);
                let {h, s, } = orbColor.getHSL();
                orbColor.setHSL(h, s, 0.75);
                if (playerObj.player.repel) {
                    attractDot = new AttractDot(orbObj.mesh, playerObj.mesh, orbColor.getHex());
                } else {
                    attractDot = new AttractDot(playerObj.mesh, orbObj.mesh, orbColor.getHex());
                }
                this.attractDots.push(attractDot);
                this.scene.add(attractDot.mesh);
            }
        }
    }

    updateDisplay() {
        if (this.game.isFinished) {
            this.tickProgress = 0;
        }
        this.updateOrbsVisibility();
        this.updateAttractDots();
        this.updateHud();
    }

    pause() {
        this.game.pause();
        this.optionsMenu.visible = true;
    }

    resume() {
        this.game.resume();
        this.optionsMenu.visible = false;
    }

    /**
     * Called when the game state should advance a tick.
     */
    tick() {
        this.game.tick();
        this.updateDisplay();
        this.infoBox.tick();
    }

    /**
     * Updates the scene.
     * @param elapsed The time elapsed since last update, in seconds.
     */
    update(elapsed: number) {
        if (this.game.isStarted && !this.game.isPaused && !this.game.isFinished) {
            this.tickProgress += elapsed * 1000 / this.tickLength;

            if (this.autoTick) {
                if (this.tickProgress >= 1) {
                    this.tickProgress %= 1;
                    this.tick();
                }
            }
        }

        for (let playerObj of this.playerObjects) {
            playerObj.update(this.tickProgress);
        }

        for (let orbObj of this.orbObjects) {
            orbObj.update(this.tickProgress);
        }

        this.camera.update(elapsed);

        // Update attract dots
        for (let attractDot of this.attractDots) {
            attractDot.update(this.tickProgress);
        }

        // Rotate skybox!
        this.skybox.rotation.y += Math.PI * elapsed / 150;

        // Rotate cameraRotateXSpeed
        let yFactor = this.upPressed ? 1 : this.downPressed ? -1 : 0;
        let xFactor = this.rightPressed ? 1 : this.leftPressed ? -1 : 0;
        if (xFactor !== 0 || yFactor !== 0) {
            this.camera.rotateAroundTarget(xFactor * this.cameraRotateXSpeed * elapsed, yFactor * this.cameraRotateYSpeed * elapsed);
        }

        if (this.zoomInPressed) {
            this.camera.zoomTowardTarget(-this.zoomSpeed * elapsed * 0.1);
        }
        if (this.zoomOutPressed) {
            this.camera.zoomTowardTarget(this.zoomSpeed * elapsed * 0.1);
        }

        // Update cursor
        if (this.mouseVector !== undefined) {
            this.raycaster.setFromCamera(this.mouseVector, this.camera);
            let intersections = this.raycaster.intersectObjects(this.orbObjects.map(obj => obj.mesh), true);
            this.renderer.domElement.style.cursor = intersections.length > 0 ? "pointer" : "default";
        }

        this.clickIndicator.update(elapsed);
    }

    /**
     * Renders the scene to the screen.
     * @param elapsed The time elapsed since last update, in seconds.
     */
    render(elapsed: number) {
        this.renderer.render(this.scene, this.camera);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        let elapsed = this.clock.getDelta();
        this.update(elapsed);
        this.render(elapsed);
        this.stats.update();
    }

    onSaveClicked() {
        let button = this.infoBox.saveButton;
        button.disabled = true;
        button.textContent = "Saving...";
        if (this.gameState.players.length === 1) {
            $.post("/api/solo", {
                numberOfOrbs: this.gameState.numberOfOrbs,
                seed: this.gameState.seed,
                altar: this.gameState.altar,
                score: this.gameState.score,
                code: this.game.gameplayData.toString()
            }, function (data) {
                button.textContent = "Saved";
                data.timestamp = new Date(data.timestamp);
            });
        } else {
            $.post("/api/multiplayer/solo", {
                numberOfPlayers: this.gameState.players.length,
                numberOfOrbs: this.gameState.numberOfOrbs,
                seed: this.gameState.seed,
                altar: this.gameState.altar,
                score: this.gameState.score,
                code: this.game.gameplayData.toString()
            }, function () {
                button.textContent = "Saved to Multiplayer";
            });
        }
    }

    onKeyDown(e: KeyboardEvent) {
        let handled = true;
        switch (e.key) {
            case this.keybinds.run:
                if (!this.game.isPaused) {
                    this.game.setMyRunAndRepel(!this.game.player.run, null);
                    this.drawRunRepelIndicators();
                }
                break;
            case this.keybinds.repel:
                if (!this.game.isPaused) {
                    this.game.setMyRunAndRepel(null, true);
                    this.drawRunRepelIndicators();
                }
                break;
            case this.keybinds.attract:
                if (!this.game.isPaused) {
                    this.game.setMyRunAndRepel(null, false);
                    this.drawRunRepelIndicators();
                }
                break;
            case "w": case "W": case "ArrowUp": case "Up":
                this.upPressed = true;
                break;
            case "s": case "S": case "ArrowDown": case "Down":
                this.downPressed = true;
                break;
            case "a": case "A": case "ArrowLeft": case "Left":
                this.leftPressed = true;
                break;
            case "d": case "D": case "ArrowRight": case "Right":
                this.rightPressed = true;
                break;
            case "PageUp":
                this.zoomInPressed = true;
                break;
            case "PageDown":
                this.zoomOutPressed = true;
                break;
            case "R":
                this.restart();
                break;
            case this.keybinds.rewind:
                this.rewind();
                break;
            case this.keybinds.fastForward:
                this.fastForward();
                break;
            case "Escape": case "Esc":
                // TODO: Account for puzzles
                if (this.isPaused) {
                    this.resume();
                } else {
                    this.pause();
                }
                break;
            case "1": case "2": case "3": case "4": case "5": case "6":
                if (this.allowPlayerSwitching && !e.ctrlKey && !e.shiftKey) {
                    let index = +e.key - 1;
                    if (index < this.gameState.players.length) {
                        this.playerIndex = index;
                        this.updateHud();
                        this.updateOrbsVisibility();
                    }
                } else {
                    handled = false;
                }
                break;
            default:
                handled = false;
                break;
        }
        if (handled) {
            e.preventDefault();
        }
    }

    onKeyUp(e: KeyboardEvent) {
        e.preventDefault();
        switch (e.key) {
            case "w": case "W": case "ArrowUp": case "Up":
                this.upPressed = false;
                break;
            case "s": case "S": case "ArrowDown": case "Down":
                this.downPressed = false;
                break;
            case "a": case "A": case "ArrowLeft": case "Left":
                this.leftPressed = false;
                break;
            case "d": case "D": case "ArrowRight": case "Right":
                this.rightPressed = false;
                break;
            case "PageUp":
                this.zoomInPressed = false;
                break;
            case "PageDown":
                this.zoomOutPressed = false;
                break;
            default:
                break;
        }
    }

    onMouseDown(e: MouseEvent) {
        $(e.currentTarget).focus();

        if (e.button === 0) {
            if (this.game.isPaused) {
                // If player actions are set while paused, the user will be confused!
                return;
            }

            e.preventDefault();

            this.contextMenu.hidden = true;

            this.mouseVector = this.mouseEventToRaycastVector(e);
            let intersections = this.clickableObjectsUnderLocation(this.mouseVector);
            if (intersections.length > 0) {
                let first = intersections[0];
                let clickedOrbIndex = Utils.findIndex(this.orbObjects, orbObj => orbObj.mesh === first.object || orbObj.circle === first.object);

                if (clickedOrbIndex !== -1) {
                    // Orb clicked
                    this.doClickAction(GameAction.attract(clickedOrbIndex, false, false, true), 1, e.clientX, e.clientY);
                } else {
                    // Ground clicked
                    let p = new Point(Math.round(first.point.x), Math.round(first.point.y));
                    if (p.equals(this.game.player.location) || (GopBoard.isInAltar(p) && GopBoard.isPlayerAdjacentToAltar(
                        this.game.player.location))) {
                        this.doClickAction(GameAction.idle(), GopBoard.isInAltar(p) ? 1 : 0, e.clientX, e.clientY);
                    } else if (GopBoard.isInAltar(p)) {
                        // Find closest square
                        this.doClickAction(GameAction.move(
                            this.gameState.board.nearestAltarPoint(this.game.player.location, PathMode.Player)), 1, e.clientX, e.clientY);
                    } else {
                        this.doClickAction(GameAction.move(p), 0, e.clientX, e.clientY);
                    }
                }
            }
        } else if (e.button === 1) {
            e.preventDefault();
            this.middleMouseClicked = true;
        } else if (e.button === 2) {
            this.showContextMenu(e);
        }
    }

    onMouseUp(e: MouseEvent) {
        if (e.button === 1) {
            this.middleMouseClicked = false;
        }
    }

    onMouseMove(e: MouseEvent) {
        this.mouseVector = this.mouseEventToRaycastVector(e);

        // Hide context menu if mouse is too far
        if (!this.contextMenu.hidden) {
            let menuMargin = 20;
            if (e.offsetX < this.contextMenu.offsetLeft - menuMargin || e.offsetX > this.contextMenu.offsetLeft + this.contextMenu.offsetWidth + menuMargin ||
                e.offsetY < this.contextMenu.offsetTop - menuMargin || e.offsetY > this.contextMenu.offsetTop + this.contextMenu.offsetHeight + menuMargin) {
                this.contextMenu.hidden = true;
            }
        }

        // Rotate camera
        if (this.middleMouseClicked) {
            this.camera.rotateAroundTarget(-this.mouseRotateSensitivity * e.movementX, this.mouseRotateSensitivity * e.movementY);
        }
    }

    onWheel(e: WheelEvent) {
        // Logarithmic
        e.preventDefault();

        let wheelFactor = e.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? -120 / 100 :
            e.deltaMode === WheelEvent.DOM_DELTA_LINE ? -40 : 1;
        this.camera.zoomTowardTarget(-this.mouseWheelZoomFactor * wheelFactor * e.deltaY);
    }

    onWindowResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / (window.innerHeight);
        this.camera.updateProjectionMatrix();
    }

    private doClickAction(action: GameAction, clickType: number, x: number, y: number) {
        this.clickIndicator.start(this.clickIndicatorImages[clickType], x, y, 4, this.clickIndicatorDuration / 4);
        this.game.setMyAction(action);
    }

    private showContextMenu(e: MouseEvent) {
        // Create context menu
        let $menuItems = $('<ul class="context-menu"/>');

        this.mouseVector = this.mouseEventToRaycastVector(e);
        let intersections = this.clickableObjectsUnderLocation(this.mouseVector);
        if (intersections.length === 0) {
            // Nothing!
            return;
        }

        let visitedOrbs: boolean[] = [];

        for (let inters of intersections) {
            let orbIndex = Utils.findIndex(this.orbObjects, orbObj => inters.object === orbObj.mesh || inters.object === orbObj.circle);
            if (orbIndex !== -1 && !visitedOrbs[orbIndex]) {
                visitedOrbs[orbIndex] = true;
                let $menuItem = $(`<li class="context-menu-item">Attract <span style="color: yellow">Orb ${GameAction.orbIndexToChar(orbIndex)}</span></li>`)
                    .mousedown(eInner => {
                        eInner.preventDefault();
                        if (eInner.button === 0) {
                            this.contextMenu.hidden = true;
                            this.doClickAction(GameAction.attract(orbIndex, false, false, true), 1, eInner.clientX, eInner.clientY);
                        }
                    });
                $menuItems.append($menuItem);
            } else if (inters.object === this.ground) {
                let p = new Point(Math.round(inters.point.x), Math.round(inters.point.y));
                let $menuItem = $(`<li class="context-menu-item">Walk to ${p}</li>`)
                    .mousedown(eInner => {
                        eInner.preventDefault();
                        if (eInner.button === 0) {
                            this.contextMenu.hidden = true;
                            this.doClickAction(GameAction.move(p), 0, eInner.clientX, eInner.clientY);
                        }
                    });
                $menuItems.append($menuItem);
            }
        }

        $(this.contextMenu)
            .empty()
            .append($menuItems);
        this.contextMenu.hidden = false;
        $(this.contextMenu)
            .css({
                left: Math.min(this.width - this.contextMenu.clientWidth, e.offsetX - 25),
                top: e.offsetY
            });
    }
}

/**
 * A class to hold game logic, including starting, pausing, restarting, and setting player actions.
 */
class Game {
    gameState: GameState;
    gameplayData: GameplayData;
    playerIndex: number;

    isStarted = false;
    isPaused = false;

    constructor(gameState: GameState, playerIndex: number) {
        this.gameState = gameState;
        this.playerIndex = playerIndex;
        this.resetGameplayData();
    }

    get player() {
        if (this.playerIndex in this.gameState.players) {
            return this.gameState.players[this.playerIndex];
        }
        return null;
    }

    /**
     * Indicates whether the underlying game state is in a finished state.
     */
    get isFinished() {
        return this.gameState.isFinished;
    }

    get isCustom() {
        return this.gameState.presetSpawns.length > 0 ||
            this.gameState.board.reachDistance !== GopBoard.defaults.reachDistance ||
            GameState.ticksPerAltar !== GameState.defaults.ticksPerAltar;
    }

    resetGameplayData() {
        this.gameplayData = new GameplayData(new GameStartInfo(this.gameState.seed, this.gameState.altar,
            this.gameState.players.map(player => new PlayerStartInfo(player.location, player.run, player.repel))));
    }

    start() {
        this.isStarted = true;
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    restart(resetGameplayData = true) {
        this.isStarted = false;
        this.gameState.reset();

        if (resetGameplayData) {
            this.resetGameplayData();
        } else {
            // Load player information from start info.
            for (let player of this.gameState.players) {
                let startPlayer = this.gameplayData.startInfo.players[player.index];
                player.location = startPlayer.location;
                player.run = startPlayer.run;
                player.repel = startPlayer.repel;
            }
        }
    }

    /**
     * Restarts the game from a code. Returns a promise since the altar might be a custom altar.
     */
    restartFromCode(code: string) {
        this.gameplayData = GameplayData.parse(code);
        let startInfo = this.gameplayData.startInfo;
        this.gameState.altar = startInfo.altar;
        this.gameState.seed = startInfo.seed;
        this.gameState.players = startInfo.players.map((value, index) => {
            let player = new Player(this.gameState, value.location, index);
            player.run = value.run;
            player.repel = value.repel;
            return player;
        });

        return Utils.loadAltar(this.gameState.altar).fail(() => {
            this.gameState.altar = Altar.None;
        }).always(() => {
            this.restart(false);
            this.start();
        });
    }

    tick() {
        if (!this.isStarted || this.isFinished) {
            return;
        }

        for (let player of this.gameState.players) {
            let loadedActions = this.gameplayData.actions.getForPlayer(player.index);
            if (loadedActions.length > this.gameState.currentTick) {
                // Autoplay from game code
                player.action = loadedActions[this.gameState.currentTick];
            } else {
                // Insert current player's action
                this.gameplayData.actions.pushForPlayer(player.index, player.action.copy());
            }
        }

        // Step and record action
        this.gameState.step();

        for (let player of this.gameState.players) {
            player.action = player.action.copy(true);
        }
    }

    /**
     * Sets the player action for the next tick. Sets only the action type and target, not run and repel variables of the action.
     * @param action The action to set.
     */
    setMyAction(action: GameAction) {
        // Don't touch run and repel player settings.
        action.toggleRun = this.player.action.toggleRun;
        action.changeWand = this.player.action.changeWand;
        this.player.action = action;

        // Start game on first action
        if (!this.isStarted) {
            this.start();
        }

        // Erase gameplay data after current tick.
        this.gameplayData.actions.sliceForPlayer(this.playerIndex, this.gameState.currentTick);
    }

    setRunAndRepel(playerIndex: number, run?: boolean, repel?: boolean, eraseGameplayData = false) {
        let player = this.gameState.players[playerIndex];
        if (this.isStarted) {
            if (run != null) {
                player.action.toggleRun = player.run !== run;
            }
            if (repel != null) {
                player.action.changeWand = player.repel !== repel;
            }
            if (eraseGameplayData) {
                // Erase gameplay data after the current tick.
                this.gameplayData.actions.sliceForPlayer(playerIndex, this.gameState.currentTick);
            }
        } else {
            // Modify start info instead
            let startPlayer = this.gameplayData.startInfo.players[playerIndex];
            if (run != null) {
                player.run = startPlayer.run = run;
            } if (repel != null) {
                player.repel = startPlayer.repel = repel;
            }
        }
    }

    setMyRunAndRepel(run?: boolean, repel?: boolean) {
        this.setRunAndRepel(this.playerIndex, run, repel, true);
    }
}

class FollowCamera extends THREE.PerspectiveCamera {
    private oldTargetPosition = new THREE.Vector3();
    private easeTargetPosition = new THREE.Vector3();
    easeFactor = 0.05;
    maxZoom = 200;

    constructor(fov?: number, aspect?: number, near?: number, far?: number,
        public followTarget?: THREE.Object3D) {
        super(fov, aspect, near, far);
        this.updateTargetPosition();
    }

    updateTargetPosition() {
        if (this.followTarget !== undefined) {
            this.easeTargetPosition.copy(this.followTarget.position);
            this.oldTargetPosition.copy(this.followTarget.position);
        }
    }

    /**
     * Rotates the camera around the player by angles of theta and phi.
     * @param theta The horizontal angle.
     * @param phi The vertical angle.
     */
    rotateAroundTarget(theta: number, phi: number) {
        if (!this.followTarget) {
            return;
        }

        let diff = this.position.clone().sub(this.easeTargetPosition);
        let distance = diff.length();
        let distance2D = new THREE.Vector2(diff.x, diff.y).length();

        // Don't allow camera's vertical angle to go outside [0, 90] degrees.
        this.translateY(Math.max(-diff.z, Math.min(distance2D - 0.1 * distance, distance * phi)));
        this.translateX(theta * distance2D);

        this.lookAt(this.easeTargetPosition);
        // Preserve distance
        this.translateZ(distance - this.position.distanceTo(this.easeTargetPosition));
    }

    /**
     * Moves the camera toward the target.
     * @param factor The amount to zoom by, between 0 and 1.
     */
    zoomTowardTarget(factor: number) {
        if (this.followTarget == null) {
            return;
        }

        let dist = this.position.distanceTo(this.easeTargetPosition);
        this.translateZ(Math.min(this.maxZoom - dist, dist * factor));
    }

    /**
     * Updates the camera in the scene.
     * @param elapsed The amount of time elapsed since last update.
     */
    update(elapsed: number) {
        if (this.followTarget == null) {
            return;
        }

        // Ease in
        this.easeTargetPosition.lerp(this.followTarget.position, this.easeFactor);

        this.position.x += this.easeTargetPosition.x - this.oldTargetPosition.x;
        this.position.y += this.easeTargetPosition.y - this.oldTargetPosition.y;

        this.oldTargetPosition.copy(this.easeTargetPosition.clone());
        this.lookAt(this.easeTargetPosition);
    }
}

class PlayerObject {
    mesh: THREE.Mesh;

    constructor(
        public player: Player,
        height: number,
        color: number | string) {
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.6, height),
            new THREE.MeshPhongMaterial({ color }));
        this.mesh.position.set(player.location.x, player.location.y, height / 2);
        this.mesh.castShadow = true;
    }

    update(tickProgress: number) {
        let drawLocation = this.player.getDrawLocation(tickProgress);
        this.mesh.position.x = drawLocation.x;
        this.mesh.position.y = drawLocation.y;
    }
}

class OrbObject {
    mesh: THREE.Mesh;
    circle: THREE.Mesh;
    light: THREE.PointLight;

    constructor(
        public orb: Orb,
        radius: number,
        z: number,
        color: number | string,
        opacity: number) {
        this.mesh = new THREE.Mesh(
            new THREE.SphereBufferGeometry(radius, 32, 16),
            new THREE.MeshPhongMaterial({
                color,
                specular: 0x606060,
                shininess: 60,
                transparent: opacity < 1,
                opacity
            }));
        this.mesh.position.set(orb.location.x, orb.location.y, z);
        this.mesh.renderOrder = 1;

        this.circle = new THREE.Mesh(
            new THREE.CircleGeometry(Math.min(0.5, radius), 16),
            new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.35,
                depthWrite: false
            })
        );
        this.circle.position.z = -z + 2 * GopUI3D.WaterZOffset;
        this.mesh.add(this.circle);

        let c = new THREE.Color(color as string);
        let {h, s, l} = c.getHSL();
        c.setHSL(h, s, Math.max(0.5, l));
        this.light = new THREE.PointLight(c.getHex(), 1.2, 15, 2);
    }

    update(tickProgress: number) {
        let drawLocation = this.orb.getDrawLocation(tickProgress);
        this.mesh.position.x = drawLocation.x;
        this.mesh.position.y = drawLocation.y;
        if (this.light !== undefined) {
            this.light.position.copy(this.mesh.position);
        }
    }
}

class AttractDot {
    mesh: THREE.Mesh;

    constructor(
        public startObject: THREE.Object3D,
        public endObject: THREE.Object3D,
        color: number | string) {
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 8),
            new THREE.MeshLambertMaterial({
                color,
                transparent: true,
                opacity: 0.75
            })
        );
        this.mesh.position.copy(startObject.position);
        this.mesh.castShadow = true;
    }

    update(tickProgress: number) {
        this.mesh.position.copy(this.endObject.position.clone().lerp(
            this.startObject.position, Math.min(1, tickProgress)));
    }
}

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

interface Option {
    name: string;
    inputElement: HTMLInputElement;
    useLocalStorage: boolean;
    get: () => any;
    set: (value: any) => void;
}

/** A class to hold the Esc menu and its controls. */
class OptionsMenu {
    overlayContainer: HTMLDivElement;
    mainMenu: HTMLDivElement;
    header: HTMLHeadingElement;

    options: Option[] = [];
    scoredTicksElement: HTMLInputElement;
    shareLinkElement: HTMLInputElement;
    enabled = true;

    constructor(public parent: GopUI3D) { }

    get visible() { return !this.overlayContainer.hidden; }

    set visible(value) {
        if (this.enabled) {
            this.overlayContainer.hidden = !value;
            if (value) {
                this.update();
            }
        }
    }

    private get game() { return this.parent.game; }

    private get gameState() { return this.parent.game.gameState; }

    private get gameplayData() { return this.parent.game.gameplayData; }

    init() {
        this.overlayContainer = document.createElement("div");
        this.overlayContainer.hidden = true;
        this.overlayContainer.classList.add("overlay-container");
        this.parent.container.appendChild(this.overlayContainer);

        this.mainMenu = document.createElement("div");
        this.mainMenu.classList.add("main-menu");
        this.mainMenu.tabIndex = 1;
        this.mainMenu.addEventListener("contextmenu", e => {
            if (e.target === this.mainMenu) {
                e.preventDefault();
            }
        });
        this.mainMenu.addEventListener("keydown", this.onKeyDown.bind(this));
        this.overlayContainer.appendChild(this.mainMenu);

        this.header = document.createElement("h3");
        this.header.textContent = "Options";
        this.mainMenu.appendChild(this.header);

        let altarOption = this.addOption("altar", "Altar",
            () => this.gameState.altar, undefined, { inputStyleWidth: "100px" }, false);

        let seedOption = this.addOption("seed", "Seed",
            () => this.gameState.seed, undefined, undefined, false);

        let $restart = $('<button class="btn btn-warning">Restart</button>')
            .click(e => {
                let altar = +altarOption.inputElement.value;
                let seed = +seedOption.inputElement.value;

                Utils.loadAltar(altar).fail(() => {
                    altar = Altar.None;
                }).always(() => {
                    this.parent.setAltarAndSeed(altar, seed);
                    this.parent.restart();
                });
            });
        this.mainMenu.appendChild($restart[0]);

        this.addSeparator();

        this.addOption("fov", "Field of view:",
            () => this.parent.camera.fov,
            (value: number) => {
                this.parent.camera.fov = value;
                this.parent.camera.updateProjectionMatrix();
            },
            { min: 0, max: 360, step: 1, fullLabelWidth: true });

        this.addOption("orbSize", "Orb size:",
            () => this.parent.orbSize,
            (value: number) => {
                this.parent.orbSize = value;
                this.parent.initOrbGraphics();
            },
            { min: 0, max: 53, step: 0.05, fullLabelWidth: true });

        this.addOption("orbColor", "Orb color:",
            () => this.parent.orbColor,
            (value: string) => {
                this.parent.orbColor = value;
                this.parent.initOrbGraphics();
            },
            { fullLabelWidth: true });

        this.addOption("orbOpacity", "Orb opacity:",
            () => this.parent.orbOpacity,
            (value: number) => {
                this.parent.orbOpacity = value;
                this.parent.initOrbGraphics();
            },
            { min: 0, max: 1, step: 0.05, fullLabelWidth: true });

        this.addOption("useShadows", "Shadows&nbsp;",
            () => this.parent.useShadows,
            (value: boolean) => { this.parent.useShadows = value; });

        this.addOption("useOrbLights", "Orb lights&nbsp;",
            () => this.parent.useOrbLights,
            (value: boolean) => {
                this.parent.useOrbLights = value;
                this.parent.initOrbGraphics();
            });

        this.addOption("useAltarLight", "Altar light&nbsp;",
            () => this.parent.scene.children.indexOf(this.parent.altarLight) !== -1,
            (value: boolean) => {
                if (value) {
                    this.parent.scene.add(this.parent.altarLight);
                } else {
                    this.parent.scene.remove(this.parent.altarLight);
                }
            });

        if (this.parent.allowConfigureTickLength) {
            this.addSeparator();
            this.addOption("tickLength", "Tick length (ms):",
                () => this.parent.tickLength,
                (value: number) => {
                    this.parent.tickLength = value;
                });
        }

        this.addSeparator();

        this.addOption("runKey", "Run key:",
            () => this.parent.keybinds.run,
            (value: string) => {
                this.parent.keybinds.run = value;
            }, { inputStyleWidth: "100px" });

        this.addOption("repelKey", "Repel key:",
            () => this.parent.keybinds.repel,
            (value: string) => {
                this.parent.keybinds.repel = value;
            }, { inputStyleWidth: "100px" });

        this.addOption("attractKey", "Attract key:",
            () => this.parent.keybinds.attract,
            (value: string) => {
                this.parent.keybinds.attract = value;
            }, { inputStyleWidth: "100px" });

        this.addOption("rewindKey", "Rewind key:",
            () => this.parent.keybinds.rewind,
            (value: string) => {
                this.parent.keybinds.rewind = value;
            }, { inputStyleWidth: "100px" });

        this.addOption("fastForwardKey", "Fast forward key:",
            () => this.parent.keybinds.fastForward,
            (value: string) => {
                this.parent.keybinds.fastForward = value;
            }, { inputStyleWidth: "100px" });

        this.addSeparator();

        this.scoredTicksElement = $('<input class="for-copying" readonly/>')[0] as HTMLInputElement;
        let $scoredTicks = $("<label>Scored ticks: </label>").width("100%")
            .append(this.scoredTicksElement);
        this.mainMenu.appendChild($scoredTicks[0]);

        this.shareLinkElement = $('<input class="for-copying" readonly/>')[0] as HTMLInputElement;
        let $shareLink = $("<label>Share link: </label>").width("100%")
            .append(this.shareLinkElement);
        this.mainMenu.appendChild($shareLink[0]);

        let $soloGamesLink = $('<a href="/Solo/History" target="_blank">View solo history</a>');
        this.mainMenu.appendChild($soloGamesLink[0]);

        $(".for-copying").click(e => {
            $(e.currentTarget).select();
        });

        let restartButton = $restart[0] as HTMLButtonElement;
        Utils.bindEnterKeyToButton(altarOption.inputElement, restartButton);
        Utils.bindEnterKeyToButton(seedOption.inputElement, restartButton);
    }

    initOptionsFromLocalStorage() {
        for (let option of this.options) {
            let value = option.get();
            let localStorageValue = localStorage.getItem(option.name);
            if (localStorageValue === null) {
                continue;
            }

            if (typeof value === "boolean") {
                option.set(localStorageValue === "true");
            } else if (typeof value === "number") {
                option.set(+localStorageValue);
            } else {
                option.set(localStorageValue);
            }
        }
    }

    addOption(name: string, label: string,
        get: () => number | string | boolean, set?: (value: number | string | boolean) => void,
        settings: { min?: number, max?: number, step?: number, fullLabelWidth?: boolean, inputStyleWidth?: string } = {},
        useLocalStorage = true) {
        let value = get();
        let inputElement: HTMLInputElement;
        if (typeof value === "number") {
            inputElement = this.addNumericInput(label, settings.min, settings.max, settings.step, settings.fullLabelWidth);
        } else if (typeof value === "boolean") {
            inputElement = this.addBooleanInput(label, settings.fullLabelWidth);
        } else {
            inputElement = this.addTextInput(label, settings.fullLabelWidth);
        }
        if (settings.inputStyleWidth !== undefined) {
            inputElement.style.width = settings.inputStyleWidth;
        }
        if (set !== undefined) {
            inputElement.addEventListener("change", e => {
                let newValue = (e.currentTarget as HTMLInputElement).value;
                if (typeof value === "boolean") {
                    let checked = (e.currentTarget as HTMLInputElement).checked;
                    set(checked);
                    newValue = checked.toString();
                } else if (typeof value === "number") {
                    set(+newValue);
                } else {
                    set(newValue);
                }
                if (useLocalStorage) {
                    localStorage.setItem(name, newValue);
                }
            });
        }
        let option = { name, inputElement, useLocalStorage, get, set };
        this.options.push(option);
        return option;
    }

    addSeparator() {
        this.mainMenu.appendChild(document.createElement("hr"));
    }

    update() {
        for (let option of this.options) {
            let value = option.get();
            if (typeof value === "boolean") {
                option.inputElement.checked = value;
            } else {
                option.inputElement.value = value;
            }
        }

        this.updateScoredTicks();
        this.updateShareLink();
    }

    private addTextInput(label: string, fullWidth = false) {
        let $input = $('<input type="text"/>')
            .addClass("form-control");
        let $label = $("<label/>").text(label).append($input);
        if (fullWidth) {
            $label.width("100%");
        }
        this.mainMenu.appendChild($label[0]);
        return $input[0] as HTMLInputElement;
    }

    private addNumericInput(label: string, min = 0, max = 2147483647, step = 1, fullWidth = false) {
        let $input = $('<input type="number"/>')
            .attr({ min, max, step })
            .addClass("form-control");
        let $label = $("<label/>").text(label).append($input);
        if (fullWidth) {
            $label.width("100%");
        }
        this.mainMenu.appendChild($label[0]);
        return $input[0] as HTMLInputElement;
    }

    private addBooleanInput(label: string, fullWidth = false) {
        let $input = $('<input type="checkbox"/>');
        let $label = $("<label/>").append($input).append(label);
        if (fullWidth) {
            $label.width("100%");
        }
        this.mainMenu.appendChild($label[0]);
        return $input[0] as HTMLInputElement;
    }

    private updateScoredTicks() {
        this.scoredTicksElement.value = this.gameState.scoredTicks.join(" ");
    }

    private updateShareLink() {
        let args: string[] = [];
        // Don't need altar, seed, or start positions since those are part of the game code.
        if (this.gameState.numberOfOrbs !== GameState.defaults.numberOfOrbs) {
            args.push("numorbs=" + this.gameState.numberOfOrbs);
        }
        if (this.gameState.board.reachDistance !== GopBoard.defaults.reachDistance) {
            args.push("reach=" + this.gameState.board.reachDistance);
        }
        if (GameState.ticksPerAltar !== GameState.defaults.ticksPerAltar) {
            args.push("ticks=" + GameState.ticksPerAltar);
        }
        if (this.gameState.presetSpawns.length > 0) {
            args.push("spawns=" + Utils.pointArrayToJSON(this.gameState.presetSpawns));
        }
        if (this.gameState.respawnOrbs !== GameState.defaults.respawnOrbs) {
            args.push("respawn=" + this.gameState.respawnOrbs);
        }
        args.push("code=" + this.gameplayData.toString().replace(/ /g, "+"));

        this.shareLinkElement.value = `${location.protocol}//${location.host}/Solo?${args.join("&")}`;
    }

    onKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape" || e.key === "Esc") {
            this.overlayContainer.hidden = true;
            this.parent.resume();
            this.parent.renderer.domElement.focus();
        }
    }
}

/** A box showing at the top of the screen with altar, seed, and a save button. */
class InfoBox {
    element: HTMLDivElement;
    altarSeedElement: HTMLDivElement;
    gameFinishedElement: HTMLDivElement;
    finalScoreSpan: HTMLSpanElement;
    saveButton: HTMLButtonElement;
    saveTimeoutHandle: number;

    constructor(private gopui: GopUI3D, public allowSave = false) { }

    init() {
        this.element = $("<div/>").addClass("info-box")[0] as HTMLDivElement;
        this.gopui.container.appendChild(this.element);

        this.altarSeedElement = $("<div/>")[0] as HTMLDivElement;
        this.element.appendChild(this.altarSeedElement);

        this.gameFinishedElement = $("<div/>")[0] as HTMLDivElement;
        this.gameFinishedElement.hidden = true;
        this.element.appendChild(this.gameFinishedElement);

        this.finalScoreSpan = $("<span>Final score 0:</span>")[0] as HTMLSpanElement;
        this.finalScoreSpan.style.color = "#00ff00";
        this.gameFinishedElement.appendChild(this.finalScoreSpan);

        // Allow save only if not custom game
        if (this.allowSave && !this.game.isCustom) {
            this.saveButton = $("<button>Save</button>").addClass("btn btn-primary")[0] as HTMLButtonElement;
            this.saveButton.style.pointerEvents = "initial";
            this.saveButton.addEventListener("click", this.onSaveClicked.bind(this));
            this.gameFinishedElement.appendChild(document.createElement("br"));
            this.gameFinishedElement.appendChild(this.saveButton);
        }

        this.update();
    }

    private get game() { return this.gopui.game; }

    private get gameState() { return this.gopui.game.gameState; }

    update() {
        this.altarSeedElement.textContent = `${AltarData[this.gameState.altar].name} altar, seed ${this.gameState.seed}`;

        this.gameFinishedElement.hidden = !this.game.isFinished;
        if (this.game.isFinished) {
            this.finalScoreSpan.textContent = `Final score: ${this.gameState.score} `;
        }
    }

    /**
     * Resets the save state, with an optional delay.
     * @param delay The amount of milliseconds to delay resetting the save state by.
     */
    resetSaveState(delay: number) {
        if (this.saveButton != null && this.saveButton.disabled && this.saveTimeoutHandle == null) {
            this.saveTimeoutHandle = setTimeout(() => {
                this.saveTimeoutHandle = null;
                this.saveButton.disabled = false;
                this.saveButton.textContent = "Save";
            }, delay);
        }
    }

    tick() {
        this.resetSaveState(60000);
    }

    onSaveClicked(e: MouseEvent) {
        this.gopui.onSaveClicked();
    }
}
