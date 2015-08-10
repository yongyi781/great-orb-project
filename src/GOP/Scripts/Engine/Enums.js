var ActionType;
(function (ActionType) {
    ActionType[ActionType["Idle"] = 0] = "Idle";
    ActionType[ActionType["Move"] = 1] = "Move";
    ActionType[ActionType["Attract"] = 2] = "Attract";
})(ActionType || (ActionType = {}));
var PathMode;
(function (PathMode) {
    PathMode[PathMode["Sight"] = 0] = "Sight";
    PathMode[PathMode["Orb"] = 1] = "Orb";
    PathMode[PathMode["Player"] = 2] = "Player";
})(PathMode || (PathMode = {}));
var OrbControlState;
(function (OrbControlState) {
    OrbControlState[OrbControlState["Free"] = 0] = "Free";
    OrbControlState[OrbControlState["Controlled"] = 1] = "Controlled";
    OrbControlState[OrbControlState["Wait1"] = 2] = "Wait1";
    OrbControlState[OrbControlState["Wait2"] = 3] = "Wait2";
})(OrbControlState || (OrbControlState = {}));
var Altar;
(function (Altar) {
    Altar[Altar["None"] = 0] = "None";
    Altar[Altar["Air"] = 1] = "Air";
    Altar[Altar["Mind"] = 2] = "Mind";
    Altar[Altar["Water"] = 3] = "Water";
    Altar[Altar["Earth"] = 4] = "Earth";
    Altar[Altar["Fire"] = 5] = "Fire";
    Altar[Altar["Body"] = 6] = "Body";
})(Altar || (Altar = {}));
var Tile;
(function (Tile) {
    Tile[Tile["Floor"] = 0] = "Floor";
    Tile[Tile["Barrier"] = 1] = "Barrier";
    Tile[Tile["Rock"] = 2] = "Rock";
    Tile[Tile["Water"] = 3] = "Water";
    Tile[Tile["WallW"] = 4] = "WallW";
    Tile[Tile["WallS"] = 5] = "WallS";
    Tile[Tile["WallSW"] = 6] = "WallSW";
    Tile[Tile["Minipillar1"] = 7] = "Minipillar1";
    Tile[Tile["Minipillar2"] = 8] = "Minipillar2";
})(Tile || (Tile = {}));
