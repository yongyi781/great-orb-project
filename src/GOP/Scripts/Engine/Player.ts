class Player implements GopObject {
    // For painting
    prevLocation = Point.NaN;
    action = GameAction.idle();
    run = true;
    repel = false;
    currentOrb: Orb = null;
    delayAttractFromMoving = false;
    delayAttractFromPrototick = false;
    hasMovedThisTick = false;
    // Compare with new move target to see if needs to recalculate move path when moving.
    lastMoveTarget = Point.NaN;
    lastAttractTarget = Point.NaN;
    // Path player will take in the event that he needs to move.
    movePath: Point[] = [];
    // For calculating move path.
    lastOrbClickLocation = Point.NaN;
    isAttracting = false;
    forceAttractOrb: Orb = null;
    holdLength = 0;
    previousAction = null;
    attractIneffective = false;

    constructor(public gs: GameState, public location: Point, public index: number) { }

    stopAttracting() {
        this.currentOrb = null;
        this.isAttracting = false;
        this.holdLength = 0;
        this.forceAttractOrb = null;
        this.attractIneffective = false;
    }

    freeze() {
        this.stopAttracting();
        this.lastOrbClickLocation = Point.NaN;
        this.lastMoveTarget = Point.NaN;
        this.movePath = [];
        this.prevLocation = Point.NaN;
        this.delayAttractFromMoving = false;
        this.delayAttractFromPrototick = false;
        this.hasMovedThisTick = false;
    }

    // Used in both moving and attracting.
    stepMove(isSecondAttract: boolean) {
        if (this.movePath.length > 0) {
            var next = this.movePath.shift();
            if (this.movePath.length > 0 && this.run)
                next = this.movePath.shift();
            if (next !== undefined) {
                this.location = next;
                this.hasMovedThisTick = true;
                if (!isSecondAttract)
                    this.delayAttractFromMoving = true;
            }
        }
    }

    step() {
        if (!this.action)
            this.action = GameAction.idle();

        if (this.action.toggleRun)
            this.run = !this.run;

        this.prevLocation = this.location;
        this.isAttracting = false;
        this.hasMovedThisTick = false;

        if (this.forceAttractOrb !== null) {
            // Override player's action.
            var toggleRun = this.action.toggleRun;
            var changeWand = this.action.changeWand;
            this.action = this.previousAction.copy();
            this.action.toggleRun = toggleRun;
            this.action.changeWand = changeWand;
        }

        if (this.action.type === ActionType.Move && this.location.equals(this.action.location)) {
            this.action = GameAction.idle(this.action.toggleRun, this.action.changeWand);
        }

        var attractTwice = false;
        switch (this.action.type) {
            case ActionType.Idle:
                this.stopAttracting();
                this.delayAttractFromMoving = false;
                this.delayAttractFromPrototick = false;
                this.lastMoveTarget = Point.NaN;
                this.lastAttractTarget = Point.NaN;
                break;
            case ActionType.Move:
                this.stopAttracting();
                this.lastAttractTarget = Point.NaN;
                this.delayAttractFromPrototick = false;
                if (!this.lastMoveTarget.equals(this.action.location)) {
                    // Calculate move path if the player clicked somewhere else.
                    this.movePath = this.gs.board.getPlayerPath(this.location, this.action.location, false);
                    this.lastMoveTarget = this.action.location;
                }
                if (this.movePath.length === 0) {
                    // Change to idle
                    this.lastMoveTarget = Point.NaN;
                    this.action = GameAction.idle(this.action.toggleRun, this.action.changeWand);
                    this.delayAttractFromMoving = false;
                } else {
                    this.stepMove(false);
                }
                break;
            case ActionType.Attract:
                this.lastMoveTarget = Point.NaN;
                if (!this.previousAction || this.previousAction.type !== ActionType.Attract || this.previousAction.orbIndex !== this.action.orbIndex) {
                    // Probably new attract, fix it.
                    this.action.isNewAttract = true;
                }

                var orb = this.gs.orbs[this.action.orbIndex];
                if (this.forceAttractOrb !== null ||
                    (!this.action.isNewAttract && !this.gs.board.canReach(this.location, orb.location, this.repel))) {
                    // "pre-attract" before wand changes state.
                    this.stepAttract(false);
                    attractTwice = true;
                }

                this.forceAttractOrb = null;
                break;
            default:
                console.log("Deobfuscated is a noob!");
                break;
        }

        if (this.action.changeWand)
            this.repel = !this.repel;
        if (this.action.type === ActionType.Attract)
            this.stepAttract(attractTwice);
        this.previousAction = this.action;
    }

    forceAttractNextTick(orb: Orb) {
        if (!this.delayAttractFromPrototick || this.currentOrb === orb)
            this.forceAttractOrb = orb;
    }

    stepAttract(isSecondAttract: boolean) {
        var board = this.gs.board;
        var orb = this.gs.orbs[this.action.orbIndex];
        var canReach = board.canReach(this.location, orb.location, this.repel);

        if (Point.isNaN(orb.location))
            return;

        if (this.forceAttractOrb !== null) {
            // Attract no matter what!
            this.attractSuccess(orb);
            return;
        }

        if (this.action.isNewAttract) {
            // Reset attract ineffectiveness and drag target.
            this.holdLength = 0;
            this.currentOrb = null;
            this.attractIneffective = false;
            this.lastOrbClickLocation = orb.location;
        }

        if (!canReach) {
            // Can't reach, start dragging.
            // Recalculate move path.
            if (Point.isNaN(this.lastOrbClickLocation))
                this.lastOrbClickLocation = orb.location;

            if (!this.lastOrbClickLocation.equals(this.lastAttractTarget)) {
                this.movePath = this.gs.board.getPlayerPath(this.location, this.lastOrbClickLocation, true);
                this.lastAttractTarget = this.lastOrbClickLocation;
            }
            if (this.movePath.length === 0) {
                // The move path is wrong, re-calculate...
                this.movePath = this.gs.board.getPlayerPath(this.location, orb.location, true);
            }

            if (!this.hasMovedThisTick)
                this.stepMove(isSecondAttract);

            if (board.canReach(this.location, orb.location, this.repel)) {
                // Pre-movement
                this.forceAttractNextTick(orb);
            }

            if (!isSecondAttract)
                this.delayAttractFromPrototick = false;
        } else if (this.delayAttractFromMoving || this.delayAttractFromPrototick) {
            if (this.delayAttractFromPrototick) {
                this.delayAttractFromPrototick = false;
            } else {
                // Force on next tick
                this.delayAttractFromPrototick = false;
                this.forceAttractNextTick(orb);
            }
        } else {
            this.attractSuccess(orb);
        }

        if (board.canReach(this.location, orb.location, this.repel) && this.currentOrb === orb) {
            // Attract even after moving, if it's the same orb.
            this.attractSuccess(orb);
        }

        if (this.action.isNewAttract) {
            // No longer new attract (unless the player clicked again).
            this.action = this.action.copy();
            this.action.isNewAttract = false;
        }

        if (!this.hasMovedThisTick)
            this.delayAttractFromMoving = false;
        else if (!isSecondAttract)
            this.delayAttractFromMoving = true;
    }

    attractSuccess(orb: Orb) {
        this.forceAttractOrb = null;
        var cancelAttract = false;
        var orbOffset = GopBoard.getOrbOffset(this.location.subtract(orb.location), !this.repel);
        if (this.repel) {
            if (Point.walkingDistance(this.location, orb.location) >= this.gs.board.reachDistance - 2)
                cancelAttract = true;
            else
                orbOffset = orbOffset.negate();
        }

        if (this.isAttractIneffective(orb))
            this.attractIneffective = true;

        if (!this.attractIneffective && !cancelAttract) {
            orb.wasTouchedThisTick = true;
            orb.controllingPlayer = this;
            orb.controlState = OrbControlState.Controlled;
            orb.target = orb.location.add(orbOffset);
        }

        this.currentOrb = orb;
        // Orb has moved, drag path is now invalid.
        this.lastOrbClickLocation = orb.location;
        if (this.action.isNewAttract) {
            this.holdLength = 1;
        }
        else if (!this.isAttracting) {
            this.holdLength++;
        }

        this.delayAttractFromPrototick = this.holdLength === 1;
        this.isAttracting = true;
    }

    isAttractIneffective(orb: Orb) {
        if (orb.controllingPlayer === this || orb.controllingPlayer === null || orb.controlState === OrbControlState.Free)
            return false;
        if (Point.isNaN(orb.target)) {
            // Orb is not moving.
            if (orb.controlState === OrbControlState.Wait2)
                return false;
            return this.index < orb.controllingPlayer.index;
        }
        return true;
    }
}
