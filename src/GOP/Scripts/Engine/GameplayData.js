var PlayerStartInfo = (function () {
    function PlayerStartInfo(location, run, repel) {
        this.location = location;
        this.run = run;
        this.repel = repel;
    }
    PlayerStartInfo.prototype.toString = function () {
        return this.location.toString() + (this.run ? "r" : "") + (this.repel ? "q" : "");
    };
    /**
     * Parses a string to a player start info. Example: (2,0)r
     */
    PlayerStartInfo.parse = function (str) {
        var location = Point.parse(str.substring(0, str.indexOf(")") + 1));
        var run = str.indexOf("r") != -1;
        var repel = str.indexOf("q") != -1;
        return new PlayerStartInfo(location, run, repel);
    };
    return PlayerStartInfo;
})();
var GameStartInfo = (function () {
    function GameStartInfo(seed, altar, players) {
        this.seed = seed;
        this.altar = altar;
        this.players = players;
    }
    GameStartInfo.prototype.toString = function () {
        var arr = [this.seed, this.altar];
        this.players.forEach(function (player) {
            arr.push(player.toString());
        });
        return "{" + arr.join(" ") + "}";
    };
    /**
     * Parses a game start info. Example: 24 3 (2,0)r.
     */
    GameStartInfo.parse = function (str) {
        var arr = str.split(" ");
        var seed = parseInt(arr[0]);
        var altar = parseInt(arr[1]);
        var players = [];
        for (var i = 2; i < arr.length; i++) {
            players.push(PlayerStartInfo.parse(arr[i]));
        }
        return new GameStartInfo(seed, altar, players);
    };
    GameStartInfo.default = function () { return new GameStartInfo(5489, Altar.Air, [new PlayerStartInfo(new Point(2, 0), true, false)]); };
    return GameStartInfo;
})();
/**
 * Keeps track of a list of game actions for multiple players.
 */
var GameActionList = (function () {
    function GameActionList(rawActions) {
        this.rawActions = rawActions;
    }
    /**
     * Gets the list of actions for a certain player.
     */
    GameActionList.prototype.getForPlayer = function (playerIndex) {
        return this.rawActions[playerIndex];
    };
    /**
     * Returns the number of players this action list is holding actions for.
     */
    GameActionList.prototype.numPlayers = function () {
        return this.rawActions.length;
    };
    /**
     * Pushes a new list of actions onto the list, one for each player.
     */
    GameActionList.prototype.push = function (actions) {
        for (var i = 0; i < this.rawActions.length; i++) {
            this.rawActions[i].push(actions[i]);
        }
    };
    /**
     * Pushes a new action for a specific player.
     */
    GameActionList.prototype.pushForPlayer = function (playerIndex, action) {
        this.rawActions[playerIndex].push(action);
    };
    GameActionList.prototype.sliceForPlayer = function (playerIndex, index) {
        this.rawActions[playerIndex] = this.rawActions[playerIndex].slice(0, index);
    };
    GameActionList.prototype.toString = function () {
        function formatActionStringWithCount(actionStr, count) {
            var str1 = new Array(count + 1).join(actionStr);
            var str2 = actionStr + "[" + count + "]";
            return str1.length < str2.length ? str1 : str2;
        }
        function formatActionsSinglePlayer(actions) {
            var s = "";
            if (actions.length > 0) {
                var c = 1;
                var prev = actions[0].toString();
                for (var i = 1; i < actions.length; i++) {
                    if (!actions[i])
                        break;
                    var a = actions[i].toString();
                    if (a === prev && !actions[i].toggleRun && !actions[i].changeWand && !actions[i].isNewAttract) {
                        ++c;
                    }
                    else {
                        s += formatActionStringWithCount(prev, c);
                        c = 1;
                    }
                    prev = a;
                }
                s += formatActionStringWithCount(prev, c);
            }
            return s;
        }
        if (this.rawActions.length > 1) {
            return "[" + this.rawActions.map(function (acts) { return formatActionsSinglePlayer(acts); }).join(";") + "]";
        }
        if (this.rawActions.length > 0)
            return formatActionsSinglePlayer(this.rawActions[0]);
        return "";
    };
    /**
     * Parses an action string to a game action list. For example, [*AA*B;*C-[3]].
     */
    GameActionList.parse = function (str) {
        function parseSinglePlayer(str) {
            var actions = [];
            var regex = /(\*|{r}|{q})*(-|[A-Za-z]|\(-?\d+,-?\d+\))(\[\d+\])?/g;
            var matches = str.match(regex);
            if (matches === null)
                return actions;
            str.match(regex).forEach(function (value) {
                var count = 1, actionStr = value;
                if (value[value.length - 1] === ']') {
                    // Repeat with count
                    var bracketStart = value.indexOf('['), bracketEnd = value.length - 1;
                    actionStr = value.substring(0, bracketStart);
                    count = parseInt(value.substring(bracketStart + 1, bracketEnd), 10);
                }
                var action = GameAction.parse(actionStr);
                actions.push(action);
                while (--count > 0)
                    actions.push(action.copy(true));
            });
            return actions;
        }
        if (str[0] === "[") {
            // Multiple players.
            var strs = str.substring(1, str.length - 1).split(";");
            var playerActions = strs.map(function (str) { return parseSinglePlayer(str); });
            return new GameActionList(playerActions);
        }
        return new GameActionList([parseSinglePlayer(str)]);
    };
    return GameActionList;
})();
var GameplayData = (function () {
    function GameplayData(startInfo, actions) {
        this.startInfo = startInfo;
        this.actions = actions;
        if (this.actions === void 0) {
            var actionArr = [];
            for (var i = 0; i < startInfo.players.length; i++)
                actionArr.push([]);
            this.actions = new GameActionList(actionArr);
        }
    }
    /**
     * Pushes a list of new actions onto the list, one for each player.
     */
    GameplayData.prototype.pushActions = function (newActions) {
        if (newActions.length !== this.actions.numPlayers())
            throw new Error("Action size mismatch.");
        this.actions.push(newActions);
    };
    GameplayData.prototype.toString = function () {
        return this.startInfo.toString() + this.actions.toString();
    };
    GameplayData.parse = function (str) {
        var startInfo;
        var actions;
        if (str[0] === "{") {
            // Start info
            var index = str.indexOf("}");
            var initialDataStr = str.substring(1, index);
            startInfo = GameStartInfo.parse(initialDataStr);
            str = str.substring(index + 1);
        }
        else {
            // No start info, use default.
            startInfo = GameStartInfo.default();
        }
        actions = GameActionList.parse(str);
        return new GameplayData(startInfo, actions);
    };
    GameplayData.default = function () { return new GameplayData(GameStartInfo.default()); };
    return GameplayData;
})();
