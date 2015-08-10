var GameAction = (function () {
    function GameAction(type, location, orbIndex, toggleRun, changeWand, isNewAttract) {
        if (toggleRun === void 0) { toggleRun = false; }
        if (changeWand === void 0) { changeWand = false; }
        if (isNewAttract === void 0) { isNewAttract = false; }
        this.type = type;
        this.location = location;
        this.orbIndex = orbIndex;
        this.toggleRun = toggleRun;
        this.changeWand = changeWand;
        this.isNewAttract = isNewAttract;
    }
    GameAction.prototype.copy = function (discardSettings) {
        if (discardSettings === void 0) { discardSettings = false; }
        return new GameAction(this.type, this.location, this.orbIndex, !discardSettings && this.toggleRun, !discardSettings && this.changeWand, !discardSettings && this.isNewAttract);
    };
    GameAction.prototype.toString = function () {
        var s = (this.toggleRun ? "{r}" : "") + (this.changeWand ? "{q}" : "") + (this.isNewAttract ? "*" : "");
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
                break;
        }
        return s;
    };
    GameAction.idle = function (toggleRun, changeWand) {
        if (toggleRun === void 0) { toggleRun = false; }
        if (changeWand === void 0) { changeWand = false; }
        return new GameAction(ActionType.Idle, Point.NaN, -1, toggleRun, changeWand, false);
    };
    GameAction.move = function (location, toggleRun, changeWand) {
        if (toggleRun === void 0) { toggleRun = false; }
        if (changeWand === void 0) { changeWand = false; }
        return new GameAction(ActionType.Move, location, -1, toggleRun, changeWand, false);
    };
    GameAction.attract = function (orbIndex, toggleRun, changeWand, isNewAttract) {
        if (toggleRun === void 0) { toggleRun = false; }
        if (changeWand === void 0) { changeWand = false; }
        if (isNewAttract === void 0) { isNewAttract = false; }
        return new GameAction(ActionType.Attract, Point.NaN, orbIndex, toggleRun, changeWand, isNewAttract);
    };
    GameAction.orbIndexToChar = function (index) {
        return index >= 26 ? String.fromCharCode(index + 71) : String.fromCharCode(index + 65);
    };
    GameAction.charToOrbIndex = function (c) {
        var charCode = c.charCodeAt(0);
        if (charCode >= 97 && charCode <= 122)
            return charCode - 71;
        if (charCode >= 65 && charCode <= 90)
            return charCode - 65;
        throw new Error("Invalid orb index char code.");
    };
    GameAction.parse = function (str) {
        var toggleRun = false, changeWand = false, newAttract = false;
        while (str[0] === "{" || str[0] === "*") {
            if (str[0] === "*") {
                newAttract = true;
                str = str.substr(1);
            }
            else {
                var j = str.indexOf("}");
                var c = str.substring(1, j);
                if (c === "r")
                    toggleRun = true;
                else if (c === "q")
                    changeWand = true;
                else
                    console.warn("Unknown inter-tick action, expected {r} or {q}.");
                str = str.substr(j + 1);
            }
        }
        if (str === null || str === undefined || str === "-")
            return GameAction.idle(toggleRun, changeWand);
        if (str.length === 1)
            return GameAction.attract(GameAction.charToOrbIndex(str), toggleRun, changeWand, newAttract);
        return GameAction.move(Point.parse(str), toggleRun, changeWand);
    };
    return GameAction;
})();
