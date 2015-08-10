class GameState {
    players: Player[] = [];
    orbs: Orb[] = [];
    random = new MersenneTwister();
    scoredTicks: number[] = [];
    score = 0;
    currentTick = 0;
    presetSpawnStack: Point[];

    constructor(public board: GopBoard,
        public playerLocations: Point[],
        public presetSpawns: Point[] = [],
        public numberOfOrbs = 3,
        public seed = 5489,
        public altar = Altar.Air) {
        for (var i = 0; i < playerLocations.length; i++)
            this.players.push(new Player(this, playerLocations[i], i));
        this.reset(altar);
    }

    addPlayer(location: Point) {
        this.players.push(new Player(this, location, this.players.length));
    }

    reset(altar?: Altar) {
        if (altar !== void 0)
            this.altar = altar;
        this.board.loadAltar(this.altar);
        this.orbs = [];
        this.presetSpawnStack = this.presetSpawns.slice(0);
        for (var i = 0; i < this.numberOfOrbs; ++i)
            this.orbs.push(new Orb(this, i));
        this.players.forEach(player => player.freeze());

        // Limit to the range [0,2147483647]
        this.seed = (this.seed >>> 0) & 0x7fffffff;
        if (this.random)
            this.random.init_genrand(this.seed);
        this.scoredTicks = [];
        this.score = 0;
        this.currentTick = 0;

        this.orbs.forEach(orb => orb.spawn());
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

    static ticksPerAltar = 199;
}
