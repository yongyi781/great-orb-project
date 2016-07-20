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
    cameraRotateXSpeed = Math.PI;
    cameraRotateYSpeed = Math.PI / 2;
    mouseRotateSensitivity = 0.008;
    zoomSpeed = 10;
    mouseWheelZoomFactor = 0.0002;
    timerRadius = 40;

    runRepelIndicator: HTMLDivElement;
    timerCanvas: HTMLCanvasElement;
    timerContext: CanvasRenderingContext2D;
    scoreIndicator: HTMLDivElement;

    menu: HTMLDivElement;

    renderer = new THREE.WebGLRenderer();
    camera: THREE.PerspectiveCamera;
    scene = new THREE.Scene();
    textureLoader = new THREE.TextureLoader();
    raycaster = new THREE.Raycaster();

    ground: THREE.Mesh;
    playerObjects: PlayerObject[] = [];
    myPlayerObj: PlayerObject;
    orbObjects: OrbObject[] = [];
    light: THREE.DirectionalLight;
    altarObjects = new THREE.Group();
    attractDots: AttractDot[] = [];

    clock = new THREE.Clock();
    tickProgress = 0;
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

    grid: Tile[][];
    player: Player;
    orbLocations = [
        new Point(7, 2),
        new Point(5, -1),
        new Point(-5, 1)
    ];

    constructor(public container: HTMLDivElement,
        public gameState: GameState,
        public playerIndex: number,
        public visibilityRadius = 15,
        public showTimer = true) {
        this.radius = Math.floor(gameState.board.numRows / 2);
        this.player = gameState.players[playerIndex];
    }

    static getDrawLocation(obj: GopObject, tickProgress: number) {
        return Point.lerp(obj.prevLocation, obj.location, tickProgress);
    }

    init() {
        this.renderer.setClearColor(this.clearColor);
        this.renderer.shadowMap.enabled = true;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(60, 2, 0.1, 1000);
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
        this.scene.add(new THREE.AmbientLight(0xccccff, 1.2));

        this.initAltar();
        this.initPlayersAndOrbs();
        this.initHUD();
        this.initControls();

        // Init context menu
        this.menu = document.createElement("div");
        this.menu.hidden = true;
        this.menu.style.position = "absolute";
        this.menu.addEventListener("contextmenu", e => { e.preventDefault(); });
        this.container.appendChild(this.menu);

        this.onWindowResize();
        return this;
    }

    initAltar() {
        const tileColors = [
            this.getGroundColor(),
            0x222222,
            0x777777,
            AltarData[this.gameState.altar].waterColor,
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
        this.grid = AltarData[this.gameState.altar].grid;

        this.ground = new THREE.Mesh(
            new THREE.PlaneGeometry(groundSize, groundSize),
            new THREE.MeshPhongMaterial({
                color: <string>tileColors[Tile.Floor]
            })
        );

        this.textureLoader.load("/images/grid.png", (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(groundSize, groundSize);
            (<THREE.MeshPhongMaterial>this.ground.material).map = texture;
            this.ground.material.needsUpdate = true;
        });

        this.ground.receiveShadow = true;
        this.altarObjects.add(this.ground);

        let geometries: THREE.Geometry[] = [];
        for (let i = 0; i <= Tile.Minipillar1; i++) {
            geometries.push(new THREE.Geometry());
        }
        for (let y = -this.radius; y <= this.radius; y++) {
            for (let x = -this.radius; x <= this.radius; x++) {
                let tile = this.get(new Point(x, y));
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
                let mesh = new THREE.Mesh(geometries[i], new THREE.MeshPhongMaterial({ color: tileColors[i + 1] }));
                mesh.castShadow = true;
                if (i + 1 === Tile.Water) {
                    mesh.receiveShadow = true;
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
        this.playerObjects = this.gameState.players.map(player => new PlayerObject(player, this.playerHeight, 0x00ccff));
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

        this.myPlayerObj = this.playerObjects[this.player.index];
        this.camera.lookAt(this.myPlayerObj.mesh.position);
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
            this.gameState.reset(+$(e.currentTarget).val());
            this.initAltar();
            this.initPlayersAndOrbs();
        });

        this.renderer.domElement.addEventListener("mousedown", this.onMouseDown.bind(this));
        this.renderer.domElement.addEventListener("mouseup", this.onMouseUp.bind(this));
        this.renderer.domElement.addEventListener("mousemove", this.onMouseMove.bind(this));
        this.renderer.domElement.addEventListener("mousewheel", this.onMouseWheel.bind(this));
        this.renderer.domElement.addEventListener("contextmenu", e => e.preventDefault());
        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));

        window.addEventListener("blur", e => {
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

    get(p: Point) {
        return this.grid[this.radius - p.y][p.x + this.radius];
    }

    start() {
        requestAnimationFrame(this.animate.bind(this));
        this.clock.start();
        this.drawHUD();
    }

    setPlayerAction(action: GameAction) {
        // Don't touch run and repel
        action.toggleRun = this.player.action.toggleRun;
        action.changeWand = this.player.action.changeWand;
        this.player.action = action;

        // Look at orb?
        //if (action.type === ActionType.Attract) {
        //    this.myPlayerObj.mesh.lookAt(this.orbObjects[action.orbIndex].mesh.position);
        //}
    }

    setPlayerRunAndRepel(run?: boolean, repel?: boolean) {
        if (run !== undefined && run !== null) {
            this.player.action.toggleRun = this.player.run !== run;
        }
        if (repel !== undefined && repel !== null) {
            this.player.action.changeWand = this.player.repel !== repel;
        }
    }

    get width() {
        return this.renderer.domElement.width;
    }

    get height() {
        return this.renderer.domElement.height;
    }

    drawHUD() {
        this.drawRunRepelIndicators();
        this.drawTimer();
        this.drawScore();
    }

    drawRunRepelIndicators() {
        let runColor = this.player.run ? "#ddeedd" : "#ccbbbb";
        let runHtml = `<span style="color: ${runColor}">Run ${this.player.run ? "on" : "off"}</span>`;

        let repelColor = this.player.repel ? "#ddeedd" : "#ccbbbb";
        let repelHtml = `<span style="color: ${repelColor}">Repel ${this.player.repel ? "on" : "off"}</span>`;
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

        if (/*!this.isRunningthis.gameState.currentTick > 0*/ this.gameState.currentTick >= 199) {
            this.timerContext.fillStyle = "rgba(0, 255, 0, 0.4)";
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
                            if (eInner.button === 0) {
                                eInner.preventDefault();
                                this.menu.hidden = true;
                                this.setPlayerAction(GameAction.attract(orbObj.orb.index, false, false, true));
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
                        if (eInner.button === 0) {
                            eInner.preventDefault();
                            this.menu.hidden = true;
                            this.setPlayerAction(GameAction.move(p));
                        }
                    });
                $menuItems.append($menuItem);
            }
        }

        $(this.menu)
            .empty()
            .append($menuItems);
        this.menu.hidden = false;
        $(this.menu)
            .css({
                left: Math.min(this.width - this.menu.clientWidth, e.offsetX - 25),
                top: e.offsetY
            });
    }

    /**
     * Called when the game state should be advanced a tick.
     */
    tick() {
        this.gameState.step();

        for (let player of this.gameState.players) {
            player.action = player.action.copy(true);
        }

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

        // Draw HUD stuff
        this.drawHUD();
    }

    /**
     * Rotates the camera around the player by angles of theta and phi.
     * @param theta The horizontal angle.
     * @param phi The vertical angle.
     */
    rotateCamera(theta: number, phi: number) {
        let diff = this.camera.position.clone().sub(this.myPlayerObj.mesh.position);
        let cameraPlayerDistance = diff.length();
        let cameraPlayer2DDistance = new THREE.Vector2(diff.x, diff.y).length();

        // Don't allow camera's vertical angle to go outside [0, 90] degrees.
        this.camera.translateY(Math.max(-diff.z, Math.min(cameraPlayer2DDistance - 0.1 * cameraPlayerDistance, cameraPlayerDistance * phi)));
        this.camera.translateX(theta * cameraPlayer2DDistance);

        this.camera.lookAt(this.myPlayerObj.mesh.position);
        // Preserve distance
        this.camera.translateZ(cameraPlayerDistance - this.camera.position.distanceTo(this.myPlayerObj.mesh.position));
    }

    /**
     * Updates the scene.
     * @param elapsed The time elapsed since last update, in seconds.
     */
    update(elapsed: number) {
        this.tickProgress += elapsed / this.tickLength;
        if (this.tickProgress >= 1) {
            this.tickProgress %= 1;
            this.tick();
        }

        let oldPlayerDrawLocation = this.myPlayerObj.mesh.position.clone();

        for (let playerObj of this.playerObjects) {
            playerObj.update(this.tickProgress);
        }

        for (let orbObj of this.orbObjects) {
            orbObj.update(this.tickProgress);
        }

        let playerDeltaX = this.myPlayerObj.mesh.position.x - oldPlayerDrawLocation.x;
        let playerDeltaY = this.myPlayerObj.mesh.position.y - oldPlayerDrawLocation.y;
        this.camera.position.x += playerDeltaX;
        this.camera.position.y += playerDeltaY;

        // Update attract dots
        for (let attractDot of this.attractDots) {
            attractDot.update(this.tickProgress);
        }

        // Rotate camera
        let yFactor = this.upPressed ? 1 : this.downPressed ? -1 : 0;
        let xFactor = this.rightPressed ? 1 : this.leftPressed ? -1 : 0;
        this.rotateCamera(xFactor * this.cameraRotateXSpeed * elapsed, yFactor * this.cameraRotateYSpeed * elapsed);

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
        } else {
        }
    }

    /**
     * Renders the scene to the screen.
     * @param elapsed The time elapsed since last update, in seconds.
     */
    render(elapsed: number) {
        this.renderer.render(this.scene, this.camera);
    }

    animate(time: number) {
        requestAnimationFrame(this.animate.bind(this));

        let elapsed = this.clock.getDelta();
        this.update(elapsed);
        this.render(elapsed);
        this.stats.update();
    }

    onKeyDown(e: KeyboardEvent) {
        let preventDefault = true;
        switch (e.key) {
            case "w": case "ArrowUp":
                this.upPressed = true;
                break;
            case "s": case "ArrowDown":
                this.downPressed = true;
                break;
            case "a": case "ArrowLeft":
                this.leftPressed = true;
                break;
            case "d": case "ArrowRight":
                this.rightPressed = true;
                break;
            case "PageUp":
                this.zoomInPressed = true;
                break;
            case "PageDown":
                this.zoomOutPressed = true;
                break;
            case "r":
                this.setPlayerRunAndRepel(!this.player.run, null);
                break;
            case "q":
                this.setPlayerRunAndRepel(null, true);
                break;
            case "z":
                this.setPlayerRunAndRepel(null, false);
            default:
                preventDefault = false;
                break;
        }
        if (preventDefault) {
            e.preventDefault();
        }
    }

    onKeyUp(e: KeyboardEvent) {
        let preventDefault = true;
        switch (e.key) {
            case "w": case "ArrowUp":
                this.upPressed = false;
                break;
            case "s": case "ArrowDown":
                this.downPressed = false;
                break;
            case "a": case "ArrowLeft":
                this.leftPressed = false;
                break;
            case "d": case "ArrowRight":
                this.rightPressed = false;
                break;
            case "PageUp":
                this.zoomInPressed = false;
                break;
            case "PageDown":
                this.zoomOutPressed = false;
                break;
            default:
                preventDefault = false;
                break;
        }
        if (preventDefault) {
            e.preventDefault();
        }
    }

    onMouseDown(e: MouseEvent) {
        if (e.button === 0) {
            e.preventDefault();

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
                    $("#status").text("Deaded orb " + clickedOrbIndex);
                    this.setPlayerAction(GameAction.attract(clickedOrbIndex, false, false, true));
                } else {
                    // Ground clicked
                    let p = new Point(Math.round(first.point.x), Math.round(first.point.y));
                    $("#status").text("Dead squared " + p.toString());
                    if (p.equals(this.player.location) || (GopBoard.isInAltar(p) && GopBoard.isPlayerAdjacentToAltar(this.player.location))) {
                        this.setPlayerAction(GameAction.idle());
                    } else if (GopBoard.isInAltar(p)) {
                        // Find closest square
                        this.setPlayerAction(GameAction.move(this.gameState.board.nearestAltarPoint(this.player.location, PathMode.Player)));
                    } else {
                        this.setPlayerAction(GameAction.move(p));
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
        if (!this.menu.hidden) {
            let menuMargin = 20;
            if (e.offsetX < this.menu.offsetLeft - menuMargin || e.offsetX > this.menu.offsetLeft + this.menu.offsetWidth + menuMargin ||
                e.offsetY < this.menu.offsetTop - menuMargin || e.offsetY > this.menu.offsetTop + this.menu.offsetHeight + menuMargin) {

                this.menu.hidden = true;
            }
        }

        // Rotate camera
        if (this.middleMouseClicked && this.lastMousePosition !== undefined) {
            let delta = new Point(e.x, e.y).subtract(this.lastMousePosition);
            this.rotateCamera(-this.mouseRotateSensitivity * delta.x, this.mouseRotateSensitivity * delta.y);
        }

        this.lastMousePosition = new Point(e.x, e.y);
    }

    onMouseWheel(e: MouseWheelEvent) {
        // Logarithmic
        e.preventDefault();

        let dist = this.camera.position.distanceTo(this.myPlayerObj.mesh.position);
        this.camera.translateZ(-this.mouseWheelZoomFactor * dist * e.wheelDelta);
    }

    onWindowResize() {
        this.camera.aspect = $(window).width() / ($(window).height() - 80);
        this.renderer.setSize($(window).width(), $(window).height() - 80);
        this.camera.updateProjectionMatrix();
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
