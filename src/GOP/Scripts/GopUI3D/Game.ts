/** A class to hold game logic, including starting, pausing, restarting, and setting player actions. */
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
