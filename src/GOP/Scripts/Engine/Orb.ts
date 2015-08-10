class Orb implements GopObject {
    location = Point.NaN;
    prevLocation = Point.NaN;
    target = Point.NaN;
    deadTime = 0;
    controllingPlayer = null;
    controlState = OrbControlState.Free;
    wasTouchedThisTick = false;

    constructor(public gs: GameState, public index: number) { }

    spawn() {
        var spawns = AltarData[this.gs.altar].spawns;
        this.prevLocation = Point.NaN;
        if (this.gs.presetSpawnStack && this.gs.presetSpawnStack.length > 0) {
            this.location = this.gs.presetSpawnStack.shift();
        }
        else if (this.gs.random)
            this.location = spawns[this.gs.random.nextInt(spawns.length)];
        else
            this.location = Point.NaN;
        this.target = Point.NaN;
        this.deadTime = 0;
    }

    step() {
        function clamp(x, min, max) {
            return x < min ? min : x > max ? max : x;
        }

        this.prevLocation = this.location;
        if (this.target.equals(this.location))
            this.target = Point.NaN;
        if (GopBoard.isAdjacentToAltar(this.location)) {
            // Orb hit altar, don't move
            this.target = Point.NaN;
            if (++this.deadTime >= 1) {
                // There will be no zero-deading for you!
                this.gs.players.forEach(function (player) {
                    if (player.action &&
                        player.action.type === ActionType.Attract &&
                        player.action.orbIndex === this.index) {
                        player.action = GameAction.idle(player.action.toggleRun);
                        player.stopAttracting();
                    }
                }, this);
            }
            if (this.deadTime >= 2) {
                // Respawn and increment score
                this.spawn();
                this.gs.score++;
                this.gs.scoredTicks.push(this.gs.currentTick);
            }
        } else if (!Point.isNaN(this.target) && !this.location.equals(this.target)) {
            // Orb is moving
            var orbOffset = this.target.subtract(this.location);
            var offset = new Point(clamp(orbOffset.x, -1, 1), clamp(orbOffset.y, -1, 1));
            if (!this.gs.board.canMove(this.location, offset.x, offset.y, PathMode.Orb))
                if (this.gs.board.canMove(this.location, offset.x, 0, PathMode.Orb))
                    offset = new Point(offset.x, 0);
                else if (this.gs.board.canMove(this.location, 0, offset.y, PathMode.Orb))
                    offset = new Point(0, offset.y);
                else
                    offset = Point.zero;
            if (offset.equals(Point.zero))
                this.target = Point.NaN;
            else
                this.location = this.location.add(offset);
        }
        if (!this.wasTouchedThisTick && this.controlState !== OrbControlState.Free) {
            this.controlState = (this.controlState + 1) % 4;
        }
    }
}
