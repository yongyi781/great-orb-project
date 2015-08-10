var Orb = (function () {
    function Orb(gs, index) {
        this.gs = gs;
        this.index = index;
        this.location = Point.NaN;
        this.prevLocation = Point.NaN;
        this.target = Point.NaN;
        this.deadTime = 0;
        this.controllingPlayer = null;
        this.controlState = OrbControlState.Free;
        this.wasTouchedThisTick = false;
    }
    Orb.prototype.spawn = function () {
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
    };
    Orb.prototype.step = function () {
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
        }
        else if (!Point.isNaN(this.target) && !this.location.equals(this.target)) {
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
    };
    return Orb;
})();
