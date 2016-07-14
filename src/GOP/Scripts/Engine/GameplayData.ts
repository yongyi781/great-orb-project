class PlayerStartInfo {
    constructor(public location: Point, public run: boolean, public repel: boolean) { }

    toString() {
        return this.location.toString() + (this.run ? "r" : "") + (this.repel ? "q" : "");
    }

    /**
     * Parses a string to a player start info. Example: (2,0)r
     */
    static parse(str: string) {
        let location = Point.parse(str.substring(0, str.indexOf(")") + 1));
        let run = str.indexOf("r") !== -1;
        let repel = str.indexOf("q") !== -1;

        return new PlayerStartInfo(location, run, repel);
    }
}

class GameStartInfo {
    constructor(public seed: number,
        public altar: Altar,
        public players: PlayerStartInfo[]) { }

    toString() {
        let arr: any[] = [this.seed, this.altar];
        this.players.forEach(player => {
            arr.push(player.toString());
        });
        return "{" + arr.join(" ") + "}";
    }

    /**
     * Parses a game start info. Example: 24 3 (2,0)r.
     */
    static parse(str: string) {
        let arr = str.split(" ");
        let seed = +arr[0];
        let altar = +arr[1];
        let players: PlayerStartInfo[] = [];
        for (let i = 2; i < arr.length; i++) {
            players.push(PlayerStartInfo.parse(arr[i]));
        }
        return new GameStartInfo(seed, altar, players);
    }

    static default() { return new GameStartInfo(5489, Altar.Air, [new PlayerStartInfo(new Point(2, 0), true, false)]); }
}

/**
 * Keeps track of a list of game actions for multiple players.
 */
class GameActionList {
    constructor(public rawActions: GameAction[][]) { }

    /**
     * Gets the list of actions for a certain player.
     */
    getForPlayer(playerIndex: number) {
        return this.rawActions[playerIndex];
    }

    /**
     * Returns the number of players this action list is holding actions for.
     */
    numPlayers() {
        return this.rawActions.length;
    }

    /**
     * Pushes a new list of actions onto the list, one for each player.
     */
    push(actions: GameAction[]) {
        for (let i = 0; i < this.rawActions.length; i++) {
            this.rawActions[i].push(actions[i]);
        }
    }

    /**
     * Pushes a new action for a specific player.
     */
    pushForPlayer(playerIndex: number, action: GameAction) {
        this.rawActions[playerIndex].push(action);
    }

    sliceForPlayer(playerIndex: number, index: number) {
        this.rawActions[playerIndex] = this.rawActions[playerIndex].slice(0, index);
    }

    toString() {
        function formatActionStringWithCount(actionStr: string, count: number) {
            let str1 = new Array(count + 1).join(actionStr);
            let str2 = actionStr + "[" + count + "]";
            return str1.length < str2.length ? str1 : str2;
        }

        function formatActionsSinglePlayer(actions: GameAction[]) {
            let s = "";
            if (actions.length > 0) {
                let c = 1;
                let prev = actions[0].toString();
                for (let i = 1; i < actions.length; i++) {
                    if (!actions[i]) {
                        break;
                    }
                    let a = actions[i].toString();
                    if (a === prev && !actions[i].toggleRun && !actions[i].changeWand && !actions[i].isNewAttract) {
                        ++c;
                    } else {
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
            return "[" + this.rawActions.map(acts => formatActionsSinglePlayer(acts)).join(";") + "]";
        }

        if (this.rawActions.length > 0) {
            return formatActionsSinglePlayer(this.rawActions[0]);
        }
        return "";
    }

    /**
     * Parses an action string to a game action list. For example, [*AA*B;*C-[3]].
     */
    static parse(str: string) {
        function parseSinglePlayer(str2: string) {
            let actions: GameAction[] = [];
            let regex = /(\*|{r}|{q})*(-|[A-Za-z]|\(-?\d+,-?\d+\))(\[\d+\])?/g;
            let matches = str2.match(regex);
            if (matches === null) {
                return actions;
            }
            str2.match(regex).forEach(value => {
                let count = 1, actionStr = value;
                if (value[value.length - 1] === "]") {
                    // Repeat with count
                    let bracketStart = value.indexOf("["), bracketEnd = value.length - 1;
                    actionStr = value.substring(0, bracketStart);
                    count = parseInt(value.substring(bracketStart + 1, bracketEnd), 10);
                }
                let action = GameAction.parse(actionStr);
                actions.push(action);
                while (--count > 0) {
                    actions.push(action.copy(true));
                }
            });
            return actions;
        }

        if (str[0] === "[") {
            // Multiple players.
            let strs = str.substring(1, str.length - 1).split(";");
            let playerActions = strs.map(parseSinglePlayer);
            return new GameActionList(playerActions);
        }
        return new GameActionList([parseSinglePlayer(str)]);
    }
}

class GameplayData {
    constructor(public startInfo: GameStartInfo, public actions?: GameActionList) {
        if (this.actions === void 0) {
            let actionArr = [];
            for (let i = 0; i < startInfo.players.length; i++) {
                actionArr.push([]);
            }
            this.actions = new GameActionList(actionArr);
        }
    }

    /**
     * Pushes a list of new actions onto the list, one for each player.
     */
    pushActions(newActions: GameAction[]) {
        if (newActions.length !== this.actions.numPlayers()) {
            throw new Error("Action size mismatch.");
        }
        this.actions.push(newActions);
    }

    toString() {
        return this.startInfo.toString() + this.actions.toString();
    }

    static parse(str: string) {
        let startInfo: GameStartInfo;
        let actions: GameActionList;
        if (str[0] === "{") {
            // Start info
            let index = str.indexOf("}");
            let initialDataStr = str.substring(1, index);
            startInfo = GameStartInfo.parse(initialDataStr);
            str = str.substring(index + 1);
        } else {
            // No start info, use default.
            startInfo = GameStartInfo.default();
        }
        actions = GameActionList.parse(str);
        return new GameplayData(startInfo, actions);
    }

    static default() { return new GameplayData(GameStartInfo.default()); }
}
