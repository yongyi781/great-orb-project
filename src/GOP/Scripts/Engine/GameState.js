var GameState = (function () {
    function GameState(board, playerLocations, presetSpawns, numberOfOrbs, seed, altar) {
        if (presetSpawns === void 0) { presetSpawns = []; }
        if (numberOfOrbs === void 0) { numberOfOrbs = 3; }
        if (seed === void 0) { seed = 5489; }
        if (altar === void 0) { altar = Altar.Air; }
        this.board = board;
        this.playerLocations = playerLocations;
        this.presetSpawns = presetSpawns;
        this.numberOfOrbs = numberOfOrbs;
        this.seed = seed;
        this.altar = altar;
        this.players = [];
        this.orbs = [];
        this.random = new MersenneTwister();
        this.scoredTicks = [];
        this.score = 0;
        this.currentTick = 0;
        for (var i = 0; i < playerLocations.length; i++)
            this.players.push(new Player(this, playerLocations[i], i));
        this.reset(altar);
    }
    GameState.prototype.addPlayer = function (location) {
        this.players.push(new Player(this, location, this.players.length));
    };
    GameState.prototype.reset = function (altar) {
        if (altar !== void 0)
            this.altar = altar;
        this.board.loadAltar(this.altar);
        this.orbs = [];
        this.presetSpawnStack = this.presetSpawns.slice(0);
        for (var i = 0; i < this.numberOfOrbs; ++i)
            this.orbs.push(new Orb(this, i));
        this.players.forEach(function (player) { return player.freeze(); });
        // Limit to the range [0,2147483647]
        this.seed = (this.seed >>> 0) & 0x7fffffff;
        if (this.random)
            this.random.init_genrand(this.seed);
        this.scoredTicks = [];
        this.score = 0;
        this.currentTick = 0;
        this.orbs.forEach(function (orb) { return orb.spawn(); });
    };
    GameState.prototype.step = function () {
        this.currentTick++;
        // Step orbs
        this.orbs.forEach(function (orb) {
            orb.wasTouchedThisTick = false;
            orb.step();
        });
        // Step players
        this.players.forEach(function (player) { return player.step(); });
    };
    GameState.ticksPerAltar = 199;
    return GameState;
})();
