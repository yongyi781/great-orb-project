class GameAction {
    constructor(public type: ActionType,
        public location: Point,
        public orbIndex: number,
        public toggleRun = false,
        public changeWand = false,
        public isNewAttract = false) { }

    copy(discardSettings = false) {
        return new GameAction(this.type, this.location, this.orbIndex,
            !discardSettings && this.toggleRun,
            !discardSettings && this.changeWand,
            !discardSettings && this.isNewAttract);
    }

    toString() {
        let s = (this.toggleRun ? "{r}" : "") + (this.changeWand ? "{q}" : "") + (this.isNewAttract ? "*" : "");
        switch (this.type) {
            case ActionType.Idle:
                s += "-";
                break;
            case ActionType.Move:
                s += this.location.toString();
                break;
            case ActionType.Attract:
                s += GameAction.orbIndexToChar(this.orbIndex);
                break;
            default:
                throw new Error("Invalid action type.");
        }
        return s;
    }

    static idle(toggleRun = false, changeWand = false) {
        return new GameAction(ActionType.Idle, Point.NaN, -1, toggleRun, changeWand, false);
    }

    static move(location: Point, toggleRun = false, changeWand = false) {
        return new GameAction(ActionType.Move, location, -1, toggleRun, changeWand, false);
    }

    static attract(orbIndex: number, toggleRun = false, changeWand = false, isNewAttract = false) {
        return new GameAction(ActionType.Attract, Point.NaN, orbIndex, toggleRun, changeWand, isNewAttract);
    }

    static orbIndexToChar(index: number) {
        return index >= 26 ? String.fromCharCode(index + 71) : String.fromCharCode(index + 65);
    }

    static charToOrbIndex(c: string) {
        let charCode = c.charCodeAt(0);
        if (charCode >= 97 && charCode <= 122) {
            return charCode - 71;
        }
        if (charCode >= 65 && charCode <= 90) {
            return charCode - 65;
        }
        throw new Error("Invalid orb index char code.");
    }

    static parse(str: string) {
        let toggleRun = false, changeWand = false, newAttract = false;

        while (str[0] === "{" || str[0] === "*") {
            if (str[0] === "*") {
                newAttract = true;
                str = str.substr(1);
            } else {
                let j = str.indexOf("}");
                let c = str.substring(1, j);
                if (c === "r") {
                    toggleRun = true;
                } else if (c === "q") {
                    changeWand = true;
                } else {
                    console.warn("Unknown inter-tick action, expected {r} or {q}.");
                }
                str = str.substr(j + 1);
            }
        }

        if (str === null || str === undefined || str === "-") {
            return GameAction.idle(toggleRun, changeWand);
        }

        if (str.length === 1) {
            return GameAction.attract(GameAction.charToOrbIndex(str), toggleRun, changeWand, newAttract);
        }
        return GameAction.move(Point.parse(str), toggleRun, changeWand);
    }
}
