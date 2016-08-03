class GameState {
    static defaults = {
        ticksPerAltar: 199,
        numberOfOrbs: 3,
        seed: 5489,
        altar: Altar.Air,
        playerLocations: [new Point(0, -2)],
        respawnOrbs: true
    };
    
    static ticksPerAltar = GameState.defaults.ticksPerAltar;

    players: Player[] = [];
    orbs: Orb[] = [];
    random = new MersenneTwister();
    scoredTicks: number[] = [];
    score = 0;
    currentTick = 0;
    presetSpawnStack: Point[];

    constructor(public board: GopBoard,
        public playerLocations?: Point[],
        public presetSpawns: Point[] = [],
        public numberOfOrbs = GameState.defaults.numberOfOrbs,
        public seed = GameState.defaults.seed,
        public altar = GameState.defaults.altar,
        public respawnOrbs = GameState.defaults.respawnOrbs) {
        for (let i = 0; i < this.numberOfOrbs; ++i) {
            this.orbs[i] = new Orb(this, i);
        }

        if (playerLocations == null || playerLocations.length === 0) {
            playerLocations = GameState.defaults.playerLocations;
        }
        for (let i = 0; i < playerLocations.length; i++) {
            this.players.push(new Player(this, playerLocations[i], i));
        }
        this.reset(altar);
    }

    /** 
     * If respawnOrbs is set to true, then returns true iff the timer is over.
     * Otherwise, returns true iff there are no orbs left.
     */
    get isFinished() {
        return this.respawnOrbs ?
            this.currentTick >= GameState.ticksPerAltar :
            this.orbs.every(orb => orb.isDead);
    }

    addPlayer(location: Point) {
        this.players.push(new Player(this, location, this.players.length));
    }

    reset(altar?: Altar) {
        if (altar !== void 0) {
            this.altar = altar;
        }
        this.board.loadAltar(this.altar);
        this.presetSpawnStack = this.presetSpawns.slice(0);
        for (let player of this.players)
            player.freeze();
        for (let orb of this.orbs)
            orb.reset();

        // Limit to the range [0,2147483647]
        this.seed = (this.seed >>> 0) & 0x7fffffff;
        if (this.random) {
            this.random.init_genrand(this.seed);
        }
        this.scoredTicks = [];
        this.score = 0;
        this.currentTick = 0;

        this.orbs.forEach(orb => orb.spawn(true));
    }

    step() {
        this.currentTick++;
        // Step orbs
        this.orbs.forEach(orb => {
            orb.wasTouchedThisTick = false;
            orb.step();
        });
        // Step players
        this.players.forEach(player => player.step());
    }

    getEstimatedScore(offset = 3) {
        return this.currentTick === 0 ? 0 : Math.round(this.score * (GameState.ticksPerAltar - offset) / (Math.max(1, this.currentTick - offset)));
    }
}
