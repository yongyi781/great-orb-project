interface PlayerInfo {
    connectionId: string;
    ipAddress: string;
    username: string;
    startRequested: boolean;
    action: string;
    run: boolean;
    repel: boolean;
    isWatching: boolean;
    startLocation: { x: number, y: number };
}

interface MultiplayerHubConnection extends SignalR.Hub.Connection {
    client: {
        updatePlayers(players: PlayerInfo[], arrayModified: boolean): void;
        removePlayer(index: number): void;
        setPlayerIndex(index: number): void;
        setGameParams(altar: number, seed: number): void;
        rewindTo(tick: number): void;
        fastForwardTo(tick: number): void;
        reject(players: PlayerInfo[]): void;
        setState(runningState: RunningState): void;
        notifyRejoin(): void;

        tick(players: PlayerInfo[], currentTick: number): void;
    };

    server: {
        addPlayer(): void;
        sendAction(action: string): void;
        sendRepel(repel: boolean): void;
        sendRun(run: boolean): void;
        sendSaveRequest(code: string, score: number): void;
        sendStartSignal(): void;
        sendStopSignal(stopClients: boolean): void;
        setGameParams(altar: number, seed: number): void;
        setPlayerLocation(x: number, y: number): void;
        setWatching(watching: boolean): void;
        rewind(ticks: number): void;
        fastForward(ticks: number): void;
    };
}

interface SignalR {
    multiplayerHub: MultiplayerHubConnection;
}

enum RunningState { NotStarted, Waiting, Countdown, Started, Ended }
enum SaveState { NotSaved, Waiting, Saved }

class MultiplayerGopUI extends GopUI3D {
    sidePanel: MultiplayerSidePanel;

    constructor(container: HTMLDivElement, gameState: GameState, playerIndex: number, public multiplayer: Multiplayer) {
        super(container, gameState, playerIndex);
        this.game = new MultiplayerGame(gameState, playerIndex, multiplayer);
        this.allowPlayerSwitching = false;
        this.sidePanel = new MultiplayerSidePanel(this);
        // Server sends the ticks.
        this.autoTick = false;
    }

    get hub() { return this.multiplayer.hub; }

    // Override   
    init() {
        super.init();
        this.sidePanel.init();

        return this;
    }

    // Override   
    setAltarAndSeed(altar: number, seed: number) {
        seed = Math.max(0, Math.min(2147483647, seed));
        // Does this altar exist? If not, load default altar.
        Utils.loadAltar(altar).fail(() => { altar = Altar.None; }).always(() => {
            this.hub.server.setGameParams(altar, seed);
        });
    }

    // Override   
    rewind(ticks = 7) {
        this.hub.server.rewind(ticks);
    }

    // Override   
    fastForward(ticks = 7) {
        this.hub.server.fastForward(ticks);
    }

    // These methods call the original rewind and fast forward methods.    
    clientRewind(ticks: number) {
        super.rewind(ticks);
    }

    clientFastForward(ticks: number) {
        super.fastForward(ticks);
    }

    updatePlayerInfo(players: PlayerInfo[]) {
        this.sidePanel.updatePlayerInfo(players);
    }
}

class MultiplayerSidePanel {
    element: HTMLDivElement;
    watchingCheckBox: HTMLInputElement;
    startButton: HTMLButtonElement;
    playerInfoDiv: HTMLDivElement;

    constructor(private parent: MultiplayerGopUI) {
        this.startButton = document.createElement("button");
        this.playerInfoDiv = document.createElement("div");
    }

    get hub() { return this.parent.hub };

    get runningState() { return this.parent.multiplayer.runningState; }
    set runningState(value) { this.parent.multiplayer.runningState = value; }

    init() {
        this.element = $("<div/>").addClass("multiplayer-panel")[0] as HTMLDivElement;

        let controlsDiv = document.createElement("div");
        controlsDiv.style.pointerEvents = "initial";

        let $watchingDiv = $('<div><label><input type="checkbox"/>Watching</label></div>');
        this.watchingCheckBox = $watchingDiv.find("input")[0] as HTMLInputElement;
        this.watchingCheckBox.defaultChecked = true;
        this.watchingCheckBox.addEventListener("change", e => {
            this.hub.server.setWatching(this.watchingCheckBox.checked);
            this.startButton.disabled = this.watchingCheckBox.checked;
        });
        controlsDiv.appendChild($watchingDiv[0]);

        this.startButton.className = "btn btn-primary";
        this.startButton.textContent = "Start";
        this.startButton.disabled = this.watchingCheckBox.checked;
        this.startButton.addEventListener("click", e => {
            switch (this.runningState) {
                case RunningState.NotStarted:
                    this.hub.server.sendStartSignal();
                    this.runningState = RunningState.Waiting;
                    break;
                case RunningState.Started:
                    this.hub.server.sendStopSignal(true);
                    break;
                case RunningState.Ended:
                    this.runningState = RunningState.NotStarted;
                    break;
                default:
                    break;
            }
        });
        controlsDiv.appendChild(this.startButton);

        this.element.appendChild(controlsDiv);
        this.element.appendChild(this.playerInfoDiv);

        this.parent.container.appendChild(this.element);
    }

    updatePlayerInfo(players: PlayerInfo[]) {
        let ol = document.createElement("ol");
        players.forEach((playerInfo, i) => {
            let li = document.createElement("li");
            li.textContent = playerInfo.username;
            li.style.color = this.parent.playerColors[i];
            if (playerInfo.isWatching) {
                li.textContent += " (watching)";
            } else if (!playerInfo.startRequested) {
                li.textContent += " (not started)";
            }
            if (i === this.parent.playerIndex) {
                li.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                li.style.fontWeight = "bold";
            }
            ol.appendChild(li);
        });
        if (this.playerInfoDiv != null) {
            $(this.playerInfoDiv).empty().append("Connected players:").append(ol);
        }
    }
}

class MultiplayerGame extends Game {
    constructor(gameState: GameState, playerIndex: number, private multiplayer: Multiplayer) {
        super(gameState, playerIndex);
    }

    get hub() { return this.multiplayer.hub; }
    
    get runningState() { return this.multiplayer.runningState; }

    setPlayerAction(action: GameAction) {
        // Don't touch run and repel player settings.
        action.toggleRun = this.player.action.toggleRun;
        action.changeWand = this.player.action.changeWand;

        if (this.runningState === RunningState.NotStarted) {
            if (action.type === ActionType.Move) {
                this.hub.server.setPlayerLocation(action.location.x, action.location.y);
            }
        } else {
            console.log("Sending action " + action);
            this.hub.server.sendAction(action.toString());
        }

        // Erase gameplay data after current tick.
        this.gameplayData.actions.sliceForPlayer(this.playerIndex, this.gameState.currentTick);
    }
}

class Multiplayer {
    gopui: MultiplayerGopUI;
    hub = $.connection.multiplayerHub;
    players: PlayerInfo[];

    private mRunningState = RunningState.NotStarted;
    private countdown = 5;

    constructor(container: HTMLDivElement) {
        let gs = new GameState(new GopBoard(53, 53), [new Point(2, 0), new Point(-2, 0)]);
        this.gopui = new MultiplayerGopUI(container, gs, 0, this);
    }

    get game() { return this.gopui.game as MultiplayerGame; }
    get currentPlayer() { return this.players[this.gopui.playerIndex]; }

    get runningState() { return this.mRunningState; }
    set runningState(value) {
        if (this.mRunningState !== value) {
            this.mRunningState = value;
            let startButton = this.gopui.sidePanel.startButton;
            let watchingCheckBox = this.gopui.sidePanel.watchingCheckBox;
            let isWatching = this.currentPlayer.isWatching;
            switch (this.mRunningState) {
                case RunningState.NotStarted:
                    startButton.textContent = "Start";
                    startButton.disabled = isWatching;
                    watchingCheckBox.disabled = false;
                    break;
                case RunningState.Waiting:
                    startButton.textContent = "Waiting for others";
                    startButton.disabled = true;
                    watchingCheckBox.disabled = true;
                    break;
                case RunningState.Countdown:
                    startButton.textContent = "Starting in " + this.countdown;
                    startButton.disabled = true;
                    watchingCheckBox.disabled = true;
                    break;
                case RunningState.Started:
                    startButton.textContent = "Stop";
                    startButton.disabled = !isWatching;
                    watchingCheckBox.disabled = true;
                    break;
                case RunningState.Ended:
                    startButton.textContent = "Reset";
                    startButton.disabled = isWatching;
                    watchingCheckBox.disabled = false;
                    break;
            }
        }
    }

    init() {
        this.hub.client.updatePlayers = (players, arrayModified) => {
            this.players = players;
            console.dir(players);
            if (arrayModified) {
                this.gopui.gameState.players = players.map((player, index) => {
                    let p = new Point(player.startLocation.x, player.startLocation.y);
                    return new Player(this.gopui.gameState, p, index);
                });
                this.gopui.initPlayerGraphics();
            } else if (this.game.runningState === RunningState.NotStarted || this.game.runningState === RunningState.Waiting) {
                for (let player of this.gopui.gameState.players) {
                    let serverPlayer = players[player.index];
                    player.location = new Point(serverPlayer.startLocation.x, serverPlayer.startLocation.y);
                    player.prevLocation = Point.NaN;
                }
                this.gopui.initPlayerGraphics();
                this.gopui.updateDisplay();
            }

            this.gopui.updatePlayerInfo(players);
        };

        this.hub.client.removePlayer = index => {
            this.gopui.gameState.players.splice(index, 1);
            this.gopui.initPlayerGraphics();
        };

        this.hub.client.setPlayerIndex = index => {
            this.gopui.playerIndex = index;
            this.gopui.updatePlayerInfo(this.players);
        };

        this.hub.client.setGameParams = (altar, seed) => {
            Utils.loadAltar(altar).always(() => {
                this.gopui.gameState.altar = altar;
                this.gopui.gameState.seed = seed;
                this.gopui.restart();
            });
        };

        this.hub.client.setState = (runningState) => {
            this.runningState = runningState;
        };

        this.hub.client.rewindTo = tick => {
            this.gopui.clientRewind(this.gopui.gameState.currentTick - tick);
        };

        this.hub.client.fastForwardTo = tick => {
            this.gopui.clientFastForward(tick - this.gopui.gameState.currentTick);
        };

        this.hub.client.reject = players => {

        };

        //     hub.client.setGameParams = function (params) {
        //         multiViewModel.gameParamsUpdating = true;
        //         multiViewModel.altar(params.altar);
        //         multiViewModel.seed(params.seed);
        //         multiViewModel.gameParamsUpdating = false;
        //         gopui.restartGame();
        //     };

        //     hub.client.receiveMinusTicks = function () {
        //         let tickToLoad = gopui.gameState.currentTick - gopui.options.plusMinusTicksAdvance;
        //         gopui.restartGame(true, multiViewModel.playerIndex());

        //         for (let i = 0; i < tickToLoad; i++)
        //             gopui.tick();

        //         // Send current run/repel state
        //         hub.server.sendRun(gopui.player.run);
        //         hub.server.sendRepel(gopui.player.repel);
        //     }

        //     hub.client.receivePlusTicks = function () {
        //         for (let i = 0; i < gopui.options.plusMinusTicksAdvance; i++)
        //             gopui.tick();

        //         // Send current run/repel state
        //         hub.server.sendRun(gopui.player.run);
        //         hub.server.sendRepel(gopui.player.repel);
        //     }

        //     hub.client.rejectPlayer = function (players) {
        //         $("#multiplayerInterface, #game").hide();
        //         $("#sorry")
        //             .text("Sorry, " + players.map(function (p) { return p.username; }).join(players.length === 2 ? " and " : ", ") + (players.length === 1 ? " is" : " are") + " currently playing a game. You will be joined automatically when the game has ended.")
        //             .show();
        //     };

        this.hub.client.tick = (players, currentTick) => {
            console.log("Tick! tick: " + currentTick);
            console.log(players);
            this.gopui.tick();
        };

        $.connection.hub.logging = true;
        $.connection.hub.start().done(() => {
            this.gopui.init().start();
        }).fail(() => {
            alert("Failed to connect!");
        });
    }
}

// let hub = (<MultiplayerHubSignalR>$.connection).multiplayerHub,
//     connectionStarted = false,
//     gopui: GopUI,
//     lastTimestamp = 0,
//     startingPositions = [new Point(2, 0), new Point(-2, 0), new Point(0, -2), new Point(0, 2), new Point(0, 0), new Point(2, -2)];

// function init(gopControls: any) {
//     let isCustomConfig = false;

//     let options = {
//         hideRestart: true,
//         showSave: true,
//         useServer: true,
//         canvasMargin: 120,
//         numberOfOrbs: 3,
//         //showPlusMinusTicksButtons: false,
//         //ticksPerAltar: 5,
//         viewModelFunctions: {
//             minusTicksButtonEnabled: function () { return !multiViewModel.isWatching() && multiViewModel.startState() === StartState.STARTED; },
//             plusTicksButtonEnabled: function () { return !multiViewModel.isWatching() && multiViewModel.startState() === StartState.STARTED; }
//         }
//     };

//     let spawnParam = Utils.getQueryAsString("spawns");
//     if (spawnParam !== undefined) {
//         try {
//             options.presetSpawns = JSON.parse(spawnParam).map(function (a) { return new Point(a[0], a[1]); });
//             isCustomConfig = isCustomConfig || (options.presetSpawns.length > 0);
//         } catch (e) { }
//     }

//     let numOrbsParam = Utils.getQueryAsString("numorbs");
//     if (numOrbsParam !== undefined) {
//         options.numberOfOrbs = Math.max(0, Math.min(26, parseInt(numOrbsParam, 10)));
//     }

//     let ticksParam = Utils.getQueryAsString("ticks");
//     if (ticksParam !== undefined) {
//         options.ticksPerAltar = parseInt(ticksParam, 10);
//         isCustomConfig = isCustomConfig || options.ticksPerAltar !== GameState.TICKS_PER_ALTAR;
//     }

//     let maxReachParam = Utils.getQueryAsString("maxreachdist");
//     if (maxReachParam !== undefined) {
//         options.maxReachDistance = parseInt(maxReachParam, 10);
//         isCustomConfig = isCustomConfig || options.maxReachDistance !== 10;
//     }

//     let latencyParam = Utils.getQueryAsString("latency");
//     if (latencyParam !== undefined)
//         options.latency = parseInt(latencyParam, 10);

//     if (isCustomConfig) {
//         $("#gamesContainer").hide();
//         options.showSave = false;
//     }

//     if (gopControls !== undefined) {
//         options.gopControls = JSON.parse('@Html.Raw(Model.GopControls)');
//     }

//     gopui = new GopUI($("#game")[0], options);

//     gopui.viewModel.run.subscribe(function (value) {
//         if (!multiViewModel.gameParamsUpdating)
//             hub.server.sendRun(value);
//     });

//     gopui.viewModel.repel.subscribe(function (value) {
//         if (!multiViewModel.gameParamsUpdating)
//             hub.server.sendRepel(value);
//     });

//     gopui.viewModel.setCurrentAction = function (action, user) {
//         let copy = action.copy();
//         copy.toggleRun = false;
//         copy.changeWand = false;
//         gopui.viewModel.currentAction = copy;
//         hub.server.sendAction(copy.toString());
//     };

//     gopui.paint = function (timestamp) {
//         if (multiViewModel.startState() === StartState.STARTED) {
//             gopui.gopCanvas.tickProgress = Math.min((timestamp - gopui.lastTick) / gopui.options.tickInterval, 1);
//         } else {
//             gopui.gopCanvas.tickProgress = 0;
//             gopui.lastTick = 0;
//         }

//         gopui.gopCanvas.paint();
//         if (multiViewModel.startState() !== StartState.ENDED && gopui.gameState.currentTick >= GameState.TICKS_PER_ALTAR) {
//             multiViewModel.startState(StartState.ENDED);
//             hub.server.sendStopSignal(false);
//         }
//         gopui.animationHandle = requestAnimationFrame(gopui.paint);
//         lastTimestamp = timestamp;
//         gopui.updatePointer();
//     };

//     gopui.onclick = function (p) {
//         if (multiViewModel.startState() === StartState.STOPPED) {
//             hub.server.setPlayerLocation(p.x, p.y);
//             return false;
//         }
//         return true;
//     };

//     gopui.onMinusTicksClicked = function () {
//         if (connectionStarted)
//             hub.server.sendMinusTicks();
//     };

//     gopui.onPlusTicksClicked = function () {
//         if (connectionStarted)
//             hub.server.sendPlusTicks();
//     };

//     $("#gop-saveGameButton").click(function () {
//         if (connectionStarted) {
//             let initialData = gopui.viewModel.initialData();
//             let actions = gopui.viewModel.actions();

//             let filteredInitialData = initialData;
//             filteredInitialData.players = initialData.players.filter(function (p, i) {
//                 return !multiViewModel.players()[i] || !multiViewModel.players()[i].isWatching;
//             });

//             let filteredActions = actions.filter(function (p, i) {
//                 return !multiViewModel.players()[i] || !multiViewModel.players()[i].isWatching;
//             });

//             let code = Utils.formatGameCode({ initialData: filteredInitialData, actions: filteredActions });
//             hub.server.sendSaveRequest(code, gopui.gameState.score);
//         }
//     });

//     $(gamesContainer).on("click", "[data-code]", function () {
//         window.open("Solo?code=" + $(this).data("code"));
//     });

//     hub.client.setPlayerIndex = function (index) {
//         multiViewModel.playerIndex(index);
//         gopui.player = gopui.gameState.players[index];
//         gopui.gopCanvas.player = gopui.gameState.players[index];
//     };

//     hub.client.setGameParams = function (params) {
//         multiViewModel.gameParamsUpdating = true;
//         multiViewModel.altar(params.altar);
//         multiViewModel.seed(params.seed);
//         multiViewModel.gameParamsUpdating = false;
//         gopui.restartGame();
//     };

//     hub.client.receiveMinusTicks = function () {
//         let tickToLoad = gopui.gameState.currentTick - gopui.options.plusMinusTicksAdvance;
//         gopui.restartGame(true, multiViewModel.playerIndex());

//         for (let i = 0; i < tickToLoad; i++)
//             gopui.tick();

//         // Send current run/repel state
//         hub.server.sendRun(gopui.player.run);
//         hub.server.sendRepel(gopui.player.repel);
//     }

//     hub.client.receivePlusTicks = function () {
//         for (let i = 0; i < gopui.options.plusMinusTicksAdvance; i++)
//             gopui.tick();

//         // Send current run/repel state
//         hub.server.sendRun(gopui.player.run);
//         hub.server.sendRepel(gopui.player.repel);
//     }

//     hub.client.rejectPlayer = function (players) {
//         $("#multiplayerInterface, #game").hide();
//         $("#sorry")
//             .text("Sorry, " + players.map(function (p) { return p.username; }).join(players.length === 2 ? " and " : ", ") + (players.length === 1 ? " is" : " are") + " currently playing a game. You will be joined automatically when the game has ended.")
//             .show();
//     };

//     hub.client.removePlayer = function (index) {
//         multiViewModel.players.splice(index, 1);
//         gopui.gameState.players.splice(index, 1);
//     };

//     hub.client.updatePlayers = function (players, playerArrayModified) {
//         if (playerArrayModified) {
//             gopui.gameState.players = players.map(function (player, index) {
//                 return new Player(gopui.gameState, startingPositions[index], index);
//             });
//         }
//         multiViewModel.players(players);
//         let currentPlayer = players[multiViewModel.playerIndex()];
//         if (currentPlayer && (!currentPlayer.started && !currentPlayer.isWatching))
//             multiViewModel.startState(StartState.STOPPED);
//     };

//     // Called to update what is shown in the save button.
//     hub.client.notifySaved = function (data) {
//         gopui.viewModel.saved(true);
//         gameListViewModel.games.unshift(data);
//     };

//     // Only called before game is started
//     hub.client.setPlayerStartLocation = function (index, x, y) {
//         gopui.gameState.players[index].location = new Point(x, y);
//     };

//     hub.client.start = function () {
//         gopui.restartGame();
//     };

//     hub.client.stop = function () {
//         multiViewModel.startState(StartState.STOPPED);
//         gopui.restartGame();
//     };

//     hub.client.gameEnded = function () {
//         multiViewModel.startState(StartState.ENDED);
//     };

//     hub.client.notifyRejoin = function () {
//         hub.server.addPlayer();
//         $("#multiplayerInterface, #game").show();
//         $("#sorry").hide();
//     };

//     hub.client.countdown = function (t) {
//         multiViewModel.startState(StartState.STARTED + t - 1);
//     };

//     hub.client.tick = function (players) {
//         multiViewModel.startState(StartState.STARTED);
//         multiViewModel.players(players);
//         gopui.viewModel.currentTick(gopui.gameState.currentTick);
//         let actions = gopui.viewModel.actions();

//         gopui.gameState.players.forEach(function (player, i) {
//             if (actions[i] === undefined)
//                 actions[i] = [];
//             if (players[i] === undefined) {
//                 // Player got removed
//                 return;
//             }

//             if (players[i].action !== null) {
//                 player.action = GameAction.parse(players[i].action);
//                 // Remove actions past this point.
//                 actions[i] = actions[i].slice(0, gopui.gameState.currentTick);
//             }

//             if (actions[i].length <= gopui.gameState.currentTick) {
//                 // Update client run and repel state if not replaying from code
//                 player.action.toggleRun = player.run != players[i].run;
//                 player.action.changeWand = player.repel != players[i].repel;
//             }
//         });

//         gopui.viewModel.actions.valueHasMutated();

//         multiViewModel.gameParamsUpdating = true;
//         gopui.tick();
//         multiViewModel.gameParamsUpdating = false;

//         // TODO

//         if (actions[gopui.player.index].length > gopui.gameState.currentTick) {
//             // Send it to hub if playing from code and is current player
//             hub.server.sendRun(gopui.player.run);
//             hub.server.sendRepel(gopui.player.repel);
//         }

//         gopui.lastTick = lastTimestamp;
//         gopui.gopCanvas.tickProgress = 0;
//     };

//     $.ajaxSetup({ cache: false });

//     $(function () {
//         ko.applyBindings(multiViewModel, $("#multiplayerInterface")[0]);
//         ko.applyBindings(gameListViewModel, $("#gamesContainer")[0]);

//         $.connection.hub.start().done(() => { connectionStarted = true; });

//         $.getJSON("MultiplayerHandler.ashx", function (data) {
//             gameListViewModel.games(data);
//         });
//     });
// }
