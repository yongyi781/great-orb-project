// GOP parsing and formatting tests

test("Action parsing single player", function () {
    var actions = GameActionList.parse("*AAA*B(3,0)").rawActions;
    equal(actions.length, 1);
    equal(actions[0].length, 5);
    equal(actions[0][0].type, ActionType.Attract);
    equal(actions[0][1].type, ActionType.Attract);
    equal(actions[0][2].type, ActionType.Attract);
    equal(actions[0][3].type, ActionType.Attract);
    equal(actions[0][4].type, ActionType.Move);
});

test("Action parsing multiplayer", function () {
    var actions = GameActionList.parse("[*AAA*B(3,0);(-2,-4)[3]*AA]").rawActions;
    equal(actions.length, 2);
    equal(actions[0].length, 5);
    equal(actions[1].length, 5);
    equal(actions[0][0].type, ActionType.Attract);
    equal(actions[0][1].type, ActionType.Attract);
    equal(actions[0][2].type, ActionType.Attract);
    equal(actions[0][3].type, ActionType.Attract);
    equal(actions[0][4].type, ActionType.Move);

    equal(actions[1][0].type, ActionType.Move);
    equal(actions[1][1].type, ActionType.Move);
    equal(actions[1][2].type, ActionType.Move);
    equal(actions[1][3].type, ActionType.Attract);
    equal(actions[1][4].type, ActionType.Attract);
});

test("Action formatting single player", function () {
    var actions = GameActionList.parse("*AAA*B(3,0)");
    var str = actions.toString();
    equal(str, "*AAA*B(3,0)");
});

test("Action formatting multiplayer", function () {
    var actions = GameActionList.parse("[*AAA*B(3,0);(-2,-4)[3]*AA]");
    var str = actions.toString();
    equal(str, "[*AAA*B(3,0);(-2,-4)[3]*AA]");
});

test("Action formatting multiplayer with uneven length", function () {
    var actions = GameActionList.parse("[*AAA*B(3,0)*CCC;(-2,-4)[3]*AA]");
    var str = actions.toString();
    equal(str, "[*AAA*B(3,0)*CCC;(-2,-4)[3]*AA]");
});
