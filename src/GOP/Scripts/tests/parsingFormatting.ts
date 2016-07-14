// GOP parsing and formatting tests

QUnit.test("Action parsing single player", assert => {
    let actions = GameActionList.parse("*AAA*B(3,0)").rawActions;
    assert.equal(actions.length, 1);
    assert.equal(actions[0].length, 5);
    assert.equal(actions[0][0].type, ActionType.Attract);
    assert.equal(actions[0][1].type, ActionType.Attract);
    assert.equal(actions[0][2].type, ActionType.Attract);
    assert.equal(actions[0][3].type, ActionType.Attract);
    assert.equal(actions[0][4].type, ActionType.Move);
});

QUnit.test("Action parsing multiplayer", assert => {
    let actions = GameActionList.parse("[*AAA*B(3,0);(-2,-4)[3]*AA]").rawActions;
    assert.equal(actions.length, 2);
    assert.equal(actions[0].length, 5);
    assert.equal(actions[1].length, 5);
    assert.equal(actions[0][0].type, ActionType.Attract);
    assert.equal(actions[0][1].type, ActionType.Attract);
    assert.equal(actions[0][2].type, ActionType.Attract);
    assert.equal(actions[0][3].type, ActionType.Attract);
    assert.equal(actions[0][4].type, ActionType.Move);

    assert.equal(actions[1][0].type, ActionType.Move);
    assert.equal(actions[1][1].type, ActionType.Move);
    assert.equal(actions[1][2].type, ActionType.Move);
    assert.equal(actions[1][3].type, ActionType.Attract);
    assert.equal(actions[1][4].type, ActionType.Attract);
});

QUnit.test("Action formatting single player", assert => {
    let actions = GameActionList.parse("*AAA*B(3,0)");
    let str = actions.toString();
    assert.equal(str, "*AAA*B(3,0)");
});

QUnit.test("Action formatting multiplayer", assert => {
    let actions = GameActionList.parse("[*AAA*B(3,0);(-2,-4)[3]*AA]");
    let str = actions.toString();
    assert.equal(str, "[*AAA*B(3,0);(-2,-4)[3]*AA]");
});

QUnit.test("Action formatting multiplayer with uneven length", assert => {
    let actions = GameActionList.parse("[*AAA*B(3,0)*CCC;(-2,-4)[3]*AA]");
    let str = actions.toString();
    assert.equal(str, "[*AAA*B(3,0)*CCC;(-2,-4)[3]*AA]");
});
