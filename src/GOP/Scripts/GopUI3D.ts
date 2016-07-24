class GopUI3D {
    radius: number;
    clearColor = 0x1E90FF;
    barrierHeight = 1;
    rockHeight = 0.4;
    waterHeight = 0.06;
    playerHeight = 1.5;
    orbRadius = 0.6;
    orbZ = this.orbRadius + 0.15;
    tickLength = 0.5;   // in seconds
    cameraRotateXSpeed = 0.8 * Math.PI;
    cameraRotateYSpeed = 0.5 * Math.PI;
    mouseRotateSensitivity = 0.008;
    zoomSpeed = 10;
    mouseWheelZoomFactor = 0.0002;
    timerRadius = 40;
    orbVisibilityRadius = 15;
    playerColors = ["#08f", "#871450", "#148718", "#630D0D"];

    runRepelIndicator: HTMLDivElement;
    timerCanvas: HTMLCanvasElement;
    timerContext: CanvasRenderingContext2D;
    scoreIndicator: HTMLDivElement;

    contextMenu: HTMLDivElement;
    escMenu: EscMenu;

    renderer = new THREE.WebGLRenderer();
    camera: FollowCamera;
    scene = new THREE.Scene();
    textureLoader = new THREE.TextureLoader();
    raycaster = new THREE.Raycaster();

    gridTexture: THREE.Texture;
    barrierTexture: THREE.Texture;

    ground: THREE.Mesh;
    playerObjects: PlayerObject[] = [];
    myPlayerObj: PlayerObject;
    orbObjects: OrbObject[] = [];
    light: THREE.DirectionalLight;
    altarObjects = new THREE.Group();
    attractDots: AttractDot[] = [];

    clock = new THREE.Clock();
    tickProgress = 1;
    lastMousePosition: Point;
    mouseVector: THREE.Vector2;
    stats: Stats;

    upPressed = false;
    downPressed = false;
    leftPressed = false;
    rightPressed = false;
    zoomInPressed = false;
    zoomOutPressed = false;
    middleMouseClicked = false;

    game: Game;

    constructor(public container: HTMLDivElement,
        public gameState: GameState,
        public playerIndex: number,
        public visibilityRadius = 15,
        public showTimer = true) {
        this.game = new Game(gameState, playerIndex);
        this.radius = Math.floor(gameState.board.numRows / 2);
    }

    static getDrawLocation(obj: GopObject, tickProgress: number) {
        return Point.lerp(obj.prevLocation, obj.location, tickProgress);
    }

    init() {
        this.renderer.setClearColor(this.clearColor);
        this.renderer.shadowMap.enabled = true;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.domElement.tabIndex = 1;
        this.renderer.domElement.style.outline = "none";
        this.container.appendChild(this.renderer.domElement);

        this.camera = new FollowCamera(60, 2, 0.1, 1000);
        this.camera.up.set(0, 0, 1);
        this.camera.position.set(0, -9, 14);

        //this.scene.fog = new THREE.FogExp2(0x7799e0, 0.01);

        this.light = new THREE.DirectionalLight(0xffff99, .3);
        this.light.position.set(-6, -12, 20);
        this.light.castShadow = true;
        let d = 20;
        (<THREE.OrthographicCamera>this.light.shadow.camera).left = -d;
        (<THREE.OrthographicCamera>this.light.shadow.camera).right = d;
        (<THREE.OrthographicCamera>this.light.shadow.camera).top = d;
        (<THREE.OrthographicCamera>this.light.shadow.camera).bottom = -d;
        (<THREE.OrthographicCamera>this.light.shadow.camera).near = 2;
        (<THREE.OrthographicCamera>this.light.shadow.camera).far = 50;

        this.light.shadow.mapSize.x = 1024;
        this.light.shadow.mapSize.y = 1024;
        this.light.shadow.bias = 0.0003;

        this.scene.add(this.light);
        this.scene.add(new THREE.AmbientLight(0xddeeff));

        this.initTextures();
        this.initAltar();
        this.initPlayersAndOrbs();
        this.initHUD();
        this.initControls();

        // Init context menu
        this.contextMenu = document.createElement("div");
        this.contextMenu.hidden = true;
        this.contextMenu.style.position = "absolute";
        this.contextMenu.addEventListener("contextmenu", e => { e.preventDefault(); });
        this.contextMenu.addEventListener("mousedown", e => { e.preventDefault(); });
        this.container.appendChild(this.contextMenu);

        // Init esc menu
        this.escMenu = new EscMenu(this.container);

        this.onWindowResize();
        return this;
    }

    initTextures() {
        const groundSize = 2 * this.radius + 1;
        this.gridTexture = this.textureLoader.load("/textures/grid.png");
        this.gridTexture.wrapS = THREE.RepeatWrapping;
        this.gridTexture.wrapT = THREE.RepeatWrapping;
        this.gridTexture.repeat.set(groundSize, groundSize);

        this.barrierTexture = this.textureLoader.load("/textures/wilo.png");
        this.barrierTexture.mapping = THREE.SphericalReflectionMapping;
        //wiloTexture.wrapS = THREE.RepeatWrapping;
        //wiloTexture.wrapT = THREE.RepeatWrapping;
        //wiloTexture.repeat.set(groundSize, groundSize);
    }

    initAltar() {
        const tileColors = [
            this.getGroundColor(),
            0x222222,
            0x777777,
            AltarData[this.gameState.altar].waterColor || 0x002244,
            0x888888,
            0x888888,
            0x888888,
            0x222222,
            0x222222
        ];
        const groundSize = 2 * this.radius + 1;
        const wallWidth = 0.08;

        let groundColor = AltarData[this.gameState.altar].groundColor;
        if (groundColor instanceof Array) {
            groundColor = groundColor[0];
        }

        if (this.altarObjects !== undefined) {
            this.scene.remove(this.altarObjects);
        }

        this.altarObjects = new THREE.Group();

        this.ground = new THREE.Mesh(
            new THREE.PlaneGeometry(groundSize, groundSize),
            new THREE.MeshPhongMaterial({
                color: <string>tileColors[Tile.Floor],
                map: this.gridTexture
            })
        );

        this.ground.receiveShadow = true;
        this.altarObjects.add(this.ground);

        let geometries: THREE.Geometry[] = [];
        for (let i = 0; i <= Tile.Minipillar1; i++) {
            geometries.push(new THREE.Geometry());
        }
        for (let y = -this.radius; y <= this.radius; y++) {
            for (let x = -this.radius; x <= this.radius; x++) {
                let tile = this.gameState.board.get(new Point(x, y));
                if (tile === Tile.Barrier) {
                    let mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, this.barrierHeight));
                    mesh.position.set(x, y, this.barrierHeight / 2);
                    geometries[0].mergeMesh(mesh);
                } else if (tile === Tile.Rock) {
                    let mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, this.rockHeight));
                    mesh.position.set(x, y, this.rockHeight / 2);
                    geometries[1].mergeMesh(mesh);
                } else if (tile === Tile.Water) {
                    let mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, this.waterHeight));
                    mesh.position.set(x, y, this.waterHeight / 2);
                    geometries[2].mergeMesh(mesh);
                }
                // Walls
                if (tile === Tile.WallW || tile === Tile.WallSW) {
                    let mesh = new THREE.Mesh(new THREE.BoxGeometry(wallWidth, 1, this.barrierHeight));
                    mesh.position.set(x - 0.5, y, this.barrierHeight / 2);
                    geometries[3].mergeMesh(mesh);
                }
                if (tile === Tile.WallS || tile === Tile.WallSW) {
                    let mesh = new THREE.Mesh(new THREE.BoxGeometry(1, wallWidth, this.barrierHeight));
                    mesh.position.set(x, y - 0.5, this.barrierHeight / 2);
                    geometries[3].mergeMesh(mesh);
                }
                if (tile === Tile.Minipillar1 || tile === Tile.Minipillar2) {
                    let mesh = new THREE.Mesh(new THREE.BoxGeometry(wallWidth, wallWidth, this.barrierHeight));
                    mesh.position.set(x - 0.5, y - 0.5, this.barrierHeight / 2);
                    geometries[3].mergeMesh(mesh);
                }
            }
        }

        for (let i = 0; i < geometries.length; i++) {
            if (geometries[i].vertices.length > 0) {
                let tile: Tile = i + 1;
                let mesh = new THREE.Mesh(geometries[i], new THREE.MeshPhongMaterial({ color: tileColors[tile] }));
                mesh.castShadow = true;
                if (tile === Tile.Water) {
                    mesh.receiveShadow = true;
                } else if (tile === Tile.Barrier) {
                    (<THREE.MeshPhongMaterial>mesh.material).map = this.barrierTexture;
                    mesh.material.needsUpdate = true;
                }
                this.altarObjects.add(mesh);
            }
        }
        this.scene.add(this.altarObjects);
    }

    initPlayersAndOrbs() {
        // Remove current players
        for (let playerObj of this.playerObjects) {
            this.scene.remove(playerObj.mesh);
        }
        this.playerObjects = this.gameState.players.map((player, i) => new PlayerObject(player, this.playerHeight, this.playerColors[i]));
        for (let playerObj of this.playerObjects) {
            this.scene.add(playerObj.mesh);
        }

        // Remove current orbs
        for (let orbObj of this.orbObjects) {
            this.scene.remove(orbObj.mesh);
        }
        this.orbObjects = this.gameState.orbs.map(orb => new OrbObject(orb, this.orbRadius, this.orbZ, 0xcccc00));
        for (let orbObj of this.orbObjects) {
            this.scene.add(orbObj.mesh);
        }

        this.myPlayerObj = this.playerObjects[this.game.playerIndex];
        this.camera.followTarget = this.myPlayerObj.mesh;
    }

    initControls() {
        this.stats = new Stats();
        this.stats.dom.style.position = "absolute";
        this.stats.dom.style.top = "0px";
        this.container.appendChild(this.stats.dom);

        $("#fieldOfView").change(e => {
            this.camera.fov = +$(e.currentTarget).val();
            this.camera.updateProjectionMatrix();
        });

        $("#altar").change(e => {
            let altar = +$(e.currentTarget).val();
            if (!(altar in AltarData)) {
                Utils.loadCustomAltar(altar).done(data => {
                    AltarData[altar] = data;
                    this.restart(+$(e.currentTarget).val());
                    this.initAltar();
                }).fail(() => {
                    this.restart(0);
                    this.initAltar();
                });
            } else {
                this.restart(+$(e.currentTarget).val());
                this.initAltar();
            }
        });

        this.renderer.domElement.addEventListener("mousedown", this.onMouseDown.bind(this));
        this.renderer.domElement.addEventListener("mouseup", this.onMouseUp.bind(this));
        this.renderer.domElement.addEventListener("mousemove", this.onMouseMove.bind(this));
        this.renderer.domElement.addEventListener("mousewheel", this.onMouseWheel.bind(this));
        this.renderer.domElement.addEventListener("contextmenu", e => e.preventDefault());
        this.renderer.domElement.addEventListener("keydown", this.onKeyDown.bind(this));
        this.renderer.domElement.addEventListener("keyup", this.onKeyUp.bind(this));

        this.renderer.domElement.addEventListener("blur", e => {
            // Cancel all camera movements
            this.leftPressed = this.rightPressed = this.upPressed = this.downPressed = this.zoomInPressed = this.zoomOutPressed = this.middleMouseClicked = false;
        });

        $(window).resize(this.onWindowResize.bind(this));
    }

    initHUD() {
        this.runRepelIndicator = <HTMLDivElement>$("<div/>").css({
            position: "absolute",
            fontSize: 20,
            right: 0,
            top: 0,
            padding: 10,
            width: 140,
            pointerEvents: "none",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            color: "white",
            textAlign: "center"
        })[0];
        this.container.appendChild(this.runRepelIndicator);

        this.timerCanvas = <HTMLCanvasElement>$("<canvas/>").css({
            position: "absolute",
            right: 40,
            pointerEvents: "none"
        })[0];
        this.timerCanvas.width = 2 * this.timerRadius + 2;
        this.timerCanvas.height = 2 * this.timerRadius + 2;
        this.container.appendChild(this.timerCanvas);
        this.timerContext = this.timerCanvas.getContext("2d");

        this.scoreIndicator = <HTMLDivElement>$("<div/>").css({
            position: "absolute",
            font: "24px Roboto",
            right: 0,
            bottom: 0,
            paddingTop: 20,
            width: 160,
            height: 120,
            pointerEvents: "none",
            color: "white",
            textAlign: "center"
        })[0];
        this.container.appendChild(this.scoreIndicator);

        this.timerCanvas.style.bottom = this.scoreIndicator.clientHeight + "px";
    }

    getGroundColor() {
        let groundColor = AltarData[this.gameState.altar].groundColor;
        if (groundColor === null) {
            return "#848899";
        }
        if (groundColor instanceof Array) {
            return groundColor[0];
        }
        return <string>groundColor;
    }

    mouseEventToRaycastVector(e: MouseEvent) {
        return new THREE.Vector2(
            2 * (e.offsetX / this.renderer.domElement.clientWidth) - 1,
            1 - 2 * (e.offsetY / this.renderer.domElement.clientHeight)
        );
    }

    clickableObjectsUnderLocation(v: THREE.Vector2) {
        this.raycaster.setFromCamera(v, this.camera);
        return this.raycaster.intersectObjects(this.orbObjects.map(obj => obj.mesh).concat(this.ground));
    }

    /**
     * Starts the 3D GOP rendering. Note that this doesn't start the game itself.
     * The player must click to start the game.
     */
    start() {
        this.clock.start();
        this.updateHud();
        this.animate();
    }

    get width() {
        return this.renderer.domElement.width;
    }

    get height() {
        return this.renderer.domElement.height;
    }

    updateHud() {
        this.drawRunRepelIndicators();
        this.drawTimer();
        this.drawScore();
    }

    drawRunRepelIndicators() {
        let runColor = this.game.player.run ? "#ddeedd" : "#ccbbbb";
        let runHtml = `<span style="color: ${runColor}">Run ${this.game.player.run ? "on" : "off"}</span>`;

        let repelColor = this.game.player.repel ? "#ddeedd" : "#ccbbbb";
        let repelHtml = `<span style="color: ${repelColor}">Repel ${this.game.player.repel ? "on" : "off"}</span>`;
        this.runRepelIndicator.innerHTML = `${runHtml}<br/>${repelHtml}`;
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

    showContextMenu(e: MouseEvent) {
        // Create context menu
        let $menuItems = $('<ul class="context-menu"/>');

        this.mouseVector = this.mouseEventToRaycastVector(e);
        let intersections = this.clickableObjectsUnderLocation(this.mouseVector);
        if (intersections.length === 0) {
            // Nothing!
            return;
        }

        for (let intersection of intersections) {
            let isOrb = false;
            for (let orbObj of this.orbObjects) {
                if (intersection.object === orbObj.mesh) {
                    isOrb = true;
                    let $menuItem = $(`<li class="context-menu-item">Attract <span style="color: yellow">Orb ${GameAction.orbIndexToChar(orbObj.orb.index)}</span></li>`)
                        .mousedown(eInner => {
                            eInner.preventDefault();
                            if (eInner.button === 0) {
                                this.contextMenu.hidden = true;
                                this.game.setPlayerAction(GameAction.attract(orbObj.orb.index, false, false, true));
                            }
                        });
                    $menuItems.append($menuItem);
                    break;
                }
            }
            if (!isOrb && intersection.object === this.ground) {
                let p = new Point(Math.round(intersection.point.x), Math.round(intersection.point.y));
                let $menuItem = $(`<li class="context-menu-item">Walk to ${p}</li>`)
                    .mousedown(eInner => {
                        eInner.preventDefault();
                        if (eInner.button === 0) {
                            this.contextMenu.hidden = true;
                            this.game.setPlayerAction(GameAction.move(p));
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

    restart(altar?: Altar, resetGameplayData = true) {
        this.game.restart(altar, resetGameplayData);

        if (resetGameplayData) {
            // Reset tick progress
            this.tickProgress = 1;
        } else {
            // Give a whole tick for multiplayer situations
            this.tickProgress = 0;
        }

        for (let attractDot of this.attractDots) {
            this.scene.remove(attractDot.mesh);
        }

        this.updateHud();
    }

    setGameplayDataFromCode(code: string) {
        this.game.restartFromCode(code);
        this.initAltar();
        this.initPlayersAndOrbs();
    }

    /**
     * Rewinds the game a set amount of ticks.
     */
    rewind(ticks = 7) {
        if (this.game.isStarted) {
            this.game.isFinished = false;
            let tickToLoad = this.gameState.currentTick - ticks;
            this.restart(undefined, false);
            this.game.isStarted = true;
            for (let i = 0; i < tickToLoad; i++) {
                this.tick(false);
            }
            this.updateHud();
        }
    }

    fastForward(ticks = 7) {
        for (let i = 0; i < ticks; i++) {
            this.tick(false);
        }
        this.updateHud();
    }

    updateOrbsVisibility() {
        for (let orb of this.gameState.orbs) {
            this.orbObjects[orb.index].mesh.visible =
                Point.walkingDistance(orb.location, this.game.player.location) <= this.orbVisibilityRadius;
        }
    }

    /**
     * Called when the game state should advance a tick.
     */
    tick(updateHud = true) {
        this.game.tick();

        this.updateOrbsVisibility();

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
                if (playerObj.player.repel) {
                    attractDot = new AttractDot(orbObj.mesh, playerObj.mesh);
                } else {
                    attractDot = new AttractDot(playerObj.mesh, orbObj.mesh);
                }
                this.attractDots.push(attractDot);
                this.scene.add(attractDot.mesh);
            }
        }

        if (updateHud) {
            this.updateHud();
        }

        if (this.gameState.currentTick >= GameState.ticksPerAltar) {
            this.game.isFinished = true;
            this.updateHud();
        }
    }

    /**
     * Updates the scene.
     * @param elapsed The time elapsed since last update, in seconds.
     */
    update(elapsed: number) {
        if (this.game.isStarted && !this.game.isPaused && !this.game.isFinished) {
            this.tickProgress += elapsed / this.tickLength;
            if (this.tickProgress >= 1) {
                this.tickProgress %= 1;
                this.tick();
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

        // Rotate cameraRotateXSpeed
        let yFactor = this.upPressed ? 1 : this.downPressed ? -1 : 0;
        let xFactor = this.rightPressed ? 1 : this.leftPressed ? -1 : 0;
        if (xFactor !== 0 || yFactor !== 0) {
            this.camera.rotateAroundTarget(xFactor * this.cameraRotateXSpeed * elapsed, yFactor * this.cameraRotateYSpeed * elapsed);
        }

        if (this.zoomInPressed) {
            this.camera.translateZ(-this.zoomSpeed * elapsed);
        }
        if (this.zoomOutPressed) {
            this.camera.translateZ(this.zoomSpeed * elapsed);
        }

        // Update cursor
        if (this.mouseVector !== undefined) {
            this.raycaster.setFromCamera(this.mouseVector, this.camera);
            let intersections = this.raycaster.intersectObjects(this.orbObjects.map(obj => obj.mesh));
            this.renderer.domElement.style.cursor = intersections.length > 0 ? "pointer" : "default";
        }
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

    onKeyDown(e: KeyboardEvent) {
        if (e.key[0] !== "F") {
            // Let F keys through for now
            e.preventDefault();
        }
        switch (e.key) {
            case "w":
                this.upPressed = true;
                break;
            case "s":
                this.downPressed = true;
                break;
            case "a":
                this.leftPressed = true;
                break;
            case "d":
                this.rightPressed = true;
                break;
            case "PageUp":
                this.zoomInPressed = true;
                break;
            case "PageDown":
                this.zoomOutPressed = true;
                break;
            case "r":
                this.game.setPlayerRunAndRepel(!this.game.player.run, null);
                this.updateHud();
                break;
            case "q":
                this.game.setPlayerRunAndRepel(null, true);
                this.updateHud();
                break;
            case "z":
                this.game.setPlayerRunAndRepel(null, false);
                this.updateHud();
                break;
            case "R":
                this.restart();
                break;
            case "ArrowLeft":
            case "Left":    // "Left" and "Right" are for Microsoft Edge compatibility >.<...
                this.rewind();
                break;
            case "ArrowRight":
            case "Right":
                this.fastForward();
                break;
            case "Escape":
                // TODO: Account for puzzles
                if (this.game.isPaused) {
                    this.game.resume();
                } else {
                    this.game.pause();
                }
                this.escMenu.visible = this.game.isPaused;
                break;
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
                let index = +e.key - 1;
                if (index < this.gameState.players.length) {
                    this.game.playerIndex = index;
                    this.camera.followTarget = this.playerObjects[index].mesh;
                    this.updateHud();
                    this.updateOrbsVisibility();
                }
                break;
            default:
                break;
        }
    }

    onKeyUp(e: KeyboardEvent) {
        e.preventDefault();
        switch (e.key) {
            case "w":
                this.upPressed = false;
                break;
            case "s":
                this.downPressed = false;
                break;
            case "a":
                this.leftPressed = false;
                break;
            case "d":
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
            e.preventDefault();

            this.contextMenu.hidden = true;

            this.mouseVector = this.mouseEventToRaycastVector(e);
            let intersections = this.clickableObjectsUnderLocation(this.mouseVector);
            if (intersections.length > 0) {
                let first = intersections[0];
                let clickedOrbIndex = -1;
                for (let i = 0; i < 3; i++) {
                    if (this.orbObjects[i].mesh === first.object) {
                        clickedOrbIndex = i;
                        break;
                    }
                }
                if (clickedOrbIndex !== -1) {
                    // Orb clicked
                    this.game.setPlayerAction(GameAction.attract(clickedOrbIndex, false, false, true));
                } else {
                    // Ground clicked
                    let p = new Point(Math.round(first.point.x), Math.round(first.point.y));
                    if (p.equals(this.game.player.location) || (GopBoard.isInAltar(p) && GopBoard.isPlayerAdjacentToAltar(
                        this.game.player.location))) {
                        this.game.setPlayerAction(GameAction.idle());
                    } else if (GopBoard.isInAltar(p)) {
                        // Find closest square
                        this.game.setPlayerAction(GameAction.move(
                            this.gameState.board.nearestAltarPoint(this.game.player.location, PathMode.Player)));
                    } else {
                        this.game.setPlayerAction(GameAction.move(p));
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
        if (this.middleMouseClicked && this.lastMousePosition !== undefined) {
            let delta = new Point(e.x, e.y).subtract(this.lastMousePosition);
            this.camera.rotateAroundTarget(-this.mouseRotateSensitivity * delta.x, this.mouseRotateSensitivity * delta.y);
        }

        this.lastMousePosition = new Point(e.x, e.y);
    }

    onMouseWheel(e: MouseWheelEvent) {
        // Logarithmic
        e.preventDefault();

        this.camera.zoomTowardTarget(-this.mouseWheelZoomFactor * e.wheelDelta);
    }

    onWindowResize() {
        this.camera.aspect = $(window).width() / ($(window).height() - 40);
        this.renderer.setSize($(window).width(), $(window).height() - 40);
        this.camera.updateProjectionMatrix();
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
    isFinished = false;

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

    restart(altar?: Altar, resetGameplayData = true) {
        this.isStarted = false;
        this.isFinished = false;
        this.gameState.reset(altar);

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
        this.restart(undefined, false);
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
    setPlayerAction(action: GameAction) {
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

    setPlayerRunAndRepel(run?: boolean, repel?: boolean) {
        if (this.isStarted) {
            if (run !== undefined && run !== null) {
                this.player.action.toggleRun = this.player.run !== run;
            }
            if (repel !== undefined && repel !== null) {
                this.player.action.changeWand = this.player.repel !== repel;
            }
            // Erase gameplay data after the current tick.
            this.gameplayData.actions.sliceForPlayer(this.player.index, this.gameState.currentTick);
        } else {
            // Modify start info instead
            let startPlayer = this.gameplayData.startInfo.players[this.player.index];
            this.player.run = startPlayer.run = run;
            this.player.repel = startPlayer.repel = repel;
        }
    }
}

class FollowCamera extends THREE.PerspectiveCamera {
    private oldTargetPosition = new THREE.Vector3();
    private easeTargetPosition = new THREE.Vector3();
    easeFactor = 0.085;

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
        if (this.followTarget === undefined) {
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
        if (this.followTarget === undefined) {
            return;
        }

        let dist = this.position.distanceTo(this.easeTargetPosition);
        this.translateZ(dist * factor);
    }

    /**
     * Updates the camera in the scene.
     * @param elapsed The amount of time elapsed since last update.
     */
    update(elapsed: number) {
        if (this.followTarget === undefined) {
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
            new THREE.BoxGeometry(0.8, 0.8, height),
            new THREE.MeshPhongMaterial({ color }));
        this.mesh.position.set(player.location.x, player.location.y, height / 2);
        this.mesh.castShadow = true;
    }

    update(tickProgress: number) {
        let drawLocation = GopUI3D.getDrawLocation(this.player, tickProgress);
        this.mesh.position.x = drawLocation.x;
        this.mesh.position.y = drawLocation.y;
    }
}

class OrbObject {
    mesh: THREE.Mesh;

    constructor(
        public orb: Orb,
        radius: number,
        z: number,
        color: number | string) {
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 32, 16),
            new THREE.MeshPhongMaterial({
                color,
                shininess: 70
            }));
        this.mesh.position.set(orb.location.x, orb.location.y, z);
        this.mesh.castShadow = true;
    }

    update(tickProgress: number) {
        let drawLocation = GopUI3D.getDrawLocation(this.orb, tickProgress);
        this.mesh.position.x = drawLocation.x;
        this.mesh.position.y = drawLocation.y;
    }
}

class AttractDot {
    mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshPhongMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.5
        })
    );

    constructor(
        public startObject: THREE.Object3D,
        public endObject: THREE.Object3D) {
        this.mesh.position.copy(startObject.position);
        this.mesh.castShadow = true;
    }

    update(tickProgress: number) {
        this.mesh.position.copy(this.endObject.position.clone().lerp(this.startObject.position, tickProgress));
    }
}

/**
 * A class to hold the Esc menu and its controls.
 */
class EscMenu {
    overlayContainer: HTMLDivElement;
    menu: HTMLDivElement;
    enabled = true;

    constructor(public container: HTMLDivElement) {
        this.overlayContainer = document.createElement("div");
        this.overlayContainer.hidden = true;
        this.overlayContainer.style.position = "absolute";
        this.overlayContainer.style.left = "0";
        this.overlayContainer.style.top = "0";
        this.overlayContainer.style.width = "100%";
        this.overlayContainer.style.height = "100%";
        this.overlayContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        this.overlayContainer.style.pointerEvents = "none";
        container.appendChild(this.overlayContainer);

        this.menu = document.createElement("div");
        this.menu.textContent = "Hello world!";
        this.overlayContainer.appendChild(this.menu);
    }

    get visible() { return !this.overlayContainer.hidden; }

    set visible(value) {
        if (this.enabled) {
            this.overlayContainer.hidden = !value;
        }
    }
}
