floor = Math.floor;
round = Math.round;
ceil = Math.ceil;
PI = Math.PI;
PI2 = 2 * Math.PI;
LOG10 = Math.log(10);
lvl90 = lvltoxp(90);
lvl99 = lvltoxp(99);
lvl120 = lvltoxp(120);
maxtotlvl = 2595;
maxqp = 378;
taskmaster = { "att": 75, "str": 76, "ran": 64, "mag": 83, "def": 70, "hpx": 35, "pra": 95, "sum": 95, "dun": 95, "agi": 90, "thi": 91, "sla": 93, "hun": 59, "smi": 95, "cra": 98, "fle": 85, "her": 94, "run": 91, "coo": 95, "con": 60, "fir": 92, "woo": 80, "far": 91, "fis": 96, "min": 81, "div": 86, "inv": 0 };

skillnames = ["tot", "att", "str", "ran", "mag", "def", "hpx", "pra", "sum", "dun", "agi", "thi", "sla", "hun", "smi", "cra", "fle", "her", "run", "coo", "con", "fir", "woo", "far", "fis", "min", "div", "inv"];
fullskillnames = ["Total", "Attack", "Strength", "Ranged", "Magic", "Defence", "Constitution", "Prayer", "Summoning", "Dungeoneering", "Agility", "Thieving", "Slayer", "Hunter", "Smithing", "Crafting", "Fletching", "Herblore", "Runecrafting", "Cooking", "Construction", "Firemaking", "Woodcutting", "Farming", "Fishing", "Mining", "Divination", "Invention"];
bossnames = ["ban", "arm", "zam", "sar", "qbd", "nex", "kkx", "kqx", "kbd", "tds", "pho", "cor", "dks", "jad", "kil", "bor", "gla", "skh", "mol", "clb", "clm", "clh", "cle", "cha", "vor", "ara"];
fullbossnames = ["Bandos", "Armadyl", "Zamorak", "Saradomin", "Queen Black Dragon", "Nex", "Kalphite King", "Kalphite Queen", "King Black Dragon", "Tormented Demon", "Phoenix", "Corpereal Beast", "Dagannoth Kings", "TzTok-Jad", "Fight Kiln", "Bork", "Glacor", "Skeletal Horror", "Giant Mole", "Easy Clue", "Medium Clue", "Hard Clue", "Elite Clue", "Chaos Elemental", "Vorago", "Araxxor"];
shortbossnames = ["Band", "Arma", "Zam", "Sara", "QBD", "Nex", "KK", "KQ", "KBD", "TDS", "Phoen", "Corp", "DKS", "Jad", "Kiln", "Bork", "Glacor", "Sk. H.", "Mole", "TT 1", "TT 2", "TT 3", "TT 4", "Chaos", "Vor", "Arax"];
medbossnames = ["Bandos", "Armadyl", "Zamorak", "Saradomin", "QBD", "Nex", "Kal King", "Kal Queen", "KBD", "TDS", "Phoenix", "Corp Beast", "Dagg kings", "TzTok-Jad", "Fight Kiln", "Bork", "Glacor", "Sk Horror", "Giant Mole", "Easy Clue", "Med Clue", "Hard Clue", "1337 Clue", "Chaos Ele", "Vorago", "Araxxor"];
minignames = ["dom", "cru", "cas", "baa", "bad", "bac", "bah", "mob", "cnq", "fog"];
fullminignames = ["Dominion tower", "The Crucible", "Castle Wars", "Barbarian Assault Attacker", "Barbarian Assault Defender", "Barbarian Assault Collecter", "Barbarian Assault Healer", "Mobilising Armies", "Conquest", "Fist of Guthix"];
medminignames = ["D Tower", "Crucible", "C Wars", "BA Att", "BA Def", "BA Col", "BA heal", "M Armies", "Conquest", "Fist of G"];
shortminignames = ["Dom", "Cruc", "CW", "BA a", "BA d", "BA c", "BA h", "Mob", "Conq", "FOG"];

monthnames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
fullmonthnames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
weekdaynames = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

trackables = ["totlv", "qpxam", "rptsc", "rptra"];//create array with all trackables
skillnames.forEach(function (c) { trackables.push(c + "xp"); trackables.push(c + "ra"); });
minignames.forEach(function (c) { trackables.push(c + "sc"); trackables.push(c + "ra"); });
bossnames.forEach(function (c) { trackables.push(c + "kc"); trackables.push(c + "ra"); });

mouseloc = { x: -1, y: -1, dx: 0, dy: 0, sx: -1, sy: -1 };
draghandler = false;

binchars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";

clogcount = 0;
window.onerror = reporterror;
reportederrors = [];
function reporterror(message, file, line, col, error) {
    var body;
    if (reportederrors.length < 2 && false) {//disable this feature for now
        reportederrors.push(error);
        body = "-AUTOMATED ERROR REPORT-\n";
        if (window.alt1) { body += "Alt1 version: " + alt1.version + "\n"; }
        body += getbrowser() + " - " + navigator.userAgent + "\n\n";
        body += message + "\n\n";
        body += error.stack;
        dlpagepost("/submitbug.php", { body: body });
        qw("Automated error report sent");
    }
    else {
        qw("Error not reported.")
    }
}

window.addEventListener("load", function () {
    var a = getframeelement();
    var b = document.documentElement || document.body;
    if ((document.body.getAttribute("data-noscroll") == "" || document.body.getAttribute("data-noscroll") == "true") || (a && (a.getAttribute("data-noscroll") == "" || a.getAttribute("data-noscroll") == "true"))) {
        document.addEventListener("scroll", function () { if (b.scrollLeft != 0) { b.scrollLeft = 0; } });
        b.addEventListener("scroll", function () { if (b.scrollLeft != 0) { b.scrollLeft = 0; } });
    }
});

storageallowed = true;
try { storageallowed = !!window.localStorage } catch (e) { storageallowed = false; }

if (storageallowed) {
    if (localStorage.timeoffset == undefined) { localStorage.timeoffset = "auto"; }
}

function dlpage(url, func, errorfunc) {
    var req;
    req = new XMLHttpRequest();
    if (func) {
        req.onload = function () { func(req.responseText); }
    }
    if (errorfunc) {
        req.onerror = function () { errorfunc(); };
    }
    req.open("GET", url, true);
    req.send();
}

function dlpagepost(url, data, func, errorfunc) {
    var req, post, a, b;
    if (window.XMLHttpRequest) { req = new XMLHttpRequest(); }
    if (func) { req.onload = function () { func(req.responseText); } }
    if (errorfunc) { req.onerror = errorfunc; }
    post = "";
    b = "";
    for (a in data) {
        var valstr;
        if (typeof data[a] == "object") { valstr = jsonEncode(data[a]); }
        else { valstr = data[a] + ""; }
        post += b + encodeURIComponent(a) + "=" + encodeURIComponent(valstr);
        b = "&";
    }
    req.open("POST", url, true);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.send(post);
}

function dlpagejson(url, obj, func, errorfunc) {
    var req = new XMLHttpRequest();
    req.onload = function () {
        var obj = jsonDecode(req.responseText);
        if (obj == null) {
            if (errorfunc) { errorfunc(); }
            return;
        }
        if (func) { func(obj); }
    }
    req.onerror = errorfunc;
    if (obj) {
        req.open("POST", url, true);
        req.setRequestHeader("Content-type", "application/json");
        req.send(jsonEncode(obj));
    } else {
        req.open("GET", url, true);
        req.send();
    }
}

function clog(a, b) {
    clogcount++;
    if (clogcount == 5000) { console.log("WARNING more than 5000 logs. clog has been disabled to prevent crash."); debugger; }
    if (clogcount > 5000) { return; }
    if (typeof b != "undefined") {
        console.log(a, b);
        return b;
    }
    console.log(a);
    return a;
}

//i'm lazy ok? no1 will ever use the name qw and it singlehand
//clog doesn't give me the right line number
qw = console.log.bind(console);
qe = console.trace.bind(console);

function clogarray(array) {
    var a, max, str, strl;
    max = Math.max.apply(null, array);
    strl = Math.ceil(max).toString().length;

    for (a = 0; a < array.length; a++) {
        str = "";
        b = 0;
        while (b < max) {
            b += max / 150;
            if (b > array[a]) { break; }
            str += "=";
        }
        clog(addzeros(a, 3, " ") + " - " + addzeros(Math.round(array[a]), strl, " "), str);
    }
}

function divfill(id, content) {
    var el = elid(id);
    if (el) { el.innerHTML = content; }
}

function promptbox(title, options, buttons, func) {
    if (typeof options == "number") { options = { width: options }; }//legacy function, allow options to define width only
    options = applyobject({
        width: 400,
        measurewidth: 0,
        measureheight: 0,
        btnwidth: 200,
        style: "default",
        parent: null,
        closefunction: null,
        title: title,
        fadein: true,
        stylesheets: []
    }, options);

    //====== script functions object ======
    var functions;
    if (typeof func == "object") { functions = func; }//define functions object
    else if (func != undefined) { functions.cancel = func; }
    //list of all inputs with ids
    functions.inputs = {};
    //closes the promptbox
    functions.close = function () {
        if (els.closefunc) { els.closefunc(); }
        else {
            var remove = function () { try { els.root.remove(); } catch (e) { } };
            if (options.fadein) { els.root.style.opacity = 0; els.root.style.pointerEvents = "none"; setTimeout(remove, 1000); }
            else { remove(); }
        }
    }
    //run when close button is clicked, can be prevented by returning false on the "close" function
    functions.exit = function () { if (functions.runfunc("cancel") !== false) { functions.close(); } }
    //[depricated] gets the element with id
    functions.getid = function (id) { return els.root.ownerDocument.getElementById("promptboxid_" + id); }
    //runs a list of functions seperated by spaces
    functions.runfunc = function (funcstr, sender) {
        var funcs = funcstr.split(" ");
        var r = null;
        for (var a = 0; a < funcs.length; a++) {
            r = functions.runsingle(funcs[a]);
        }
        return r;
    };
    //runs a single function
    functions.runsingle = function (str, sender) {
        var parts = str.split("-");
        if (!functions[parts[0]]) { return null; }
        var data = functions.data();
        data.args = parts.slice(1);
        data.sender = sender;
        functions[parts[0]](data, els);
    };
    //returns all input values in an array
    functions.data = function () {
        var d = [];
        var b = els.root.getElementsByClassName("input");
        for (var c in b) {
            if (typeof b[c] != "object") { continue; }
            if (b[c].type == "checkbox") { d.push(b[c].checked); }
            if (b[c].type == "color") { d.push(b[c].value); }
            if (b[c].type == "text") { d.push(b[c].value); }
            if (b[c].tagName == "SELECT") { d.push(b[c].value); }
        }
        return d;
    }

    //====== generate content box ======
    var framefunc;
    if (typeof options.style == "function") { framefunc = options.style; }
    else if (options.style == "nis") { framefunc = promptbox_nis; }
    else if (options.style == "popup") { framefunc = promptbox_popup; }
    else { framefunc = promptbox_default; }
    var els = framefunc(options);

    //======= insert content ======
    var rootel = promptboxbuttons(options, buttons, functions);
    els.contentbox.appendChild(rootel);
    els.root.classList.add("measuring");
    document.body.appendChild(els.root);
    options.measurewidth = els.root.clientWidth;
    options.measureheight = els.root.clientHeight;

    //functions on content
    if (els.closebutton) { els.closebutton.onclick = functions.runfunc.bind(null, "exit"); }
    els.root.onchange = functions.runfunc.bind(null, "change");


    //====== insert into page ======
    if (els.insertfunc) {
        els.insertfunc(els, options, functions);
        els.root.classList.remove("measuring");
    }
    else {
        els.root.style.marginTop = (-options.measureheight / 2) + "px";
        els.root.style.marginLeft = (-options.measurewidth / 2) + "px";
        top.document.body.appendChild(els.root);
        els.root.classList.remove("measuring");
        els.root.style.opacity = 0;
        if (options.fadein) {
            setTimeout(function () { els.root.style.opacity = 1; }, 1);
        }
    }

    var obj = { els: els, functions: functions, options: options };
    return obj;
}

function promptbox2(options, buttons) {
    options = applyobject({
        width: 400,
        measurewidth: 0,
        measureheight: 0,
        style: "default",
        onclose: null,
        onchange: null,
        title: "",
        fadein: true,
        stylesheets: [],
        parent: document.body,
        v2: true//flag for the promptboxcontainer functions
    }, options);


    //====== generate content box ======
    var framefunc;
    if (typeof options.style == "function") { framefunc = options.style; }
    else if (options.style == "nis") { framefunc = promptbox_nis; }
    else if (options.style == "popup") { framefunc = promptbox_popup; }
    else if (options.style == "fakepopup") { framefunc = promptbox_fakepopup; }
    else { framefunc = promptbox_default; }
    var box = framefunc(options);

    box.close = function () {
        if (box.closefunc) { box.closefunc(); }
        else {
            var remove = function () { try { box.root.remove(); } catch (e) { } };
            if (options.fadein) { box.root.style.opacity = 0; box.root.style.pointerEvents = "none"; setTimeout(remove, 1000); }
            else { remove(); }
        }
    }

    //======= insert content ======
    var els = promptboxbuttons2(buttons);
    els.frame = box;
    box.contentbox.appendChild(els.frag);
    box.root.classList.add("measuring");
    document.body.appendChild(box.root);
    options.measurewidth = box.root.clientWidth;
    options.measureheight = box.root.clientHeight;
    //====== functions =====
    var closeclicked = function () {
        if (!options.onclose || options.onclose() !== false) { box.close(); }
    }

    if (box.closebutton) { box.closebutton.onclick = closeclicked; }
    if (options.onchange) { box.root.onchange = options.onchange.b(); }

    //====== insert into page ======
    if (box.insertfunc) {
        box.insertfunc(box, options);
        box.root.classList.remove("measuring");
    }
    else {
        box.root.style.marginTop = (-options.measureheight / 2) + "px";
        box.root.style.marginLeft = (-options.measurewidth / 2) + "px";
        options.parent.appendChild(box.root);
        box.root.classList.remove("measuring");
        box.root.style.opacity = 0;
        if (options.fadein) {
            setTimeout(function () { box.root.style.opacity = 1; }, 1);
        }
    }

    return els;
}

function promptboxbuttons(options, buttons, functions) {
    var id;

    var frag = document.createDocumentFragment();
    for (b in buttons) {
        var but = buttons[b];
        if (but.id) { id = "promptboxid_" + but.id; }
        else { id = ""; }
        var width = but.width || options.btnwidth;

        if (but.type == "text") { frag.appendChild(elcreate("div", "promptboxtext", "width:" + (width - 10) + "px", { id: id }, but.title)); }
        if (but.type == "story") { frag.appendChild(elcreate("div", "promptboxstory", "width:" + (width - 10) + "px"), { id: id }, but.title); }
        if (but.type == "br") { frag.appendChild(elcreate("div", "promptboxbr", null, { id: id })); }
        if (but.type == "label") { frag.appendChild(elcreate("div", null, "display:none", { id: id, "data-label": but.value })); }
        if (but.type == "input") { frag.appendChild(elcreate("input", "sliminput promptboxinput input", "width:" + (width - 10) + "px", { id: id, type: "text", value: but.value || "" })); }
        if (but.type == "checkbox") {
            frag.appendChild(elcreate("label", "promptboxtext", "width:" + (width - 10) + "px", { id: id }, [
                elcreate("input", "input", null, applyobject({ type: "checkbox" }, but.value ? { checked: "" } : {})),
                "\xA0" + but.title
            ]));
        }
        if (but.type == "button") {
            var el = elcreate("input", "sliminput promptboxbutton", "width:" + (width - 10) + "px", { id: id, type: "button", value: but.title });
            el.onclick = functions.runfunc.bind(null, but.func);
            frag.appendChild(el);
        }
        if (but.type == "color") {
            var el = elcreate("input", "sliminput promptboxcolor input", "width:" + (width - 10) + "px", { id: id, type: "color" });
            el.value = but.value || "";//chrome doesnt update input correctly if done by attributes
            frag.appendChild(el);
        }
        if (but.type == "dropdown") {
            var el = elcreate("select", "sliminput promptboxdropdown input", "width:" + (width - 10) + "px", { id: id });
            for (var c in but.title) { el.appendChild(elcreate("option", null, null, applyobject({ value: but.title[c][0] }, (but.title[c][0] == but.value ? { selected: "" } : {})), but.title[c][1])); }
            frag.appendChild(el);
        }
    }
    return frag;
}

function csslength(l) {
    return typeof l == "number" ? l + "px" : l;
}

function promptboxbuttons2(buttons) {
    var frag = document.createDocumentFragment();
    var els = {};
    els.frag = frag;
    for (var a = 0; a < buttons.length; a++) {
        var button = buttons[a];
        var m = button.t.match(/^(\w+)(?:\/([\w-]+))?(?::([\w-]+))?$/);// "type/typearg:id"
        var type = m[1] || button.type, arg = m[2] || button.arg, id = m[3] || button.id;
        var el = null;
        var isinput = !!button.isinput || false;

        //css
        var style = button.style || "";
        if (button.flexwidth != null) { style += "width:" + (100 * button.flexwidth) + "%;"; }
        if (button.flexheight != null) { style += "height:" + (100 * button.flexheight) + "%;"; }
        if (button.height != null) { style += "height:" + csslength(button.height) + ";"; }
        if (button.width != null) { style += "width:" + csslength(button.width) + ";"; }

        //attributes
        var attr = {};
        if (style) { attr.style = style; }
        if (button.attr) { applyobject(attr, button.attr); }

        //===== input types ======
        if (type == "string" || type == "password") {
            if (type == "password") {
                el = eldiv("pb2-string pbs-password:input/password", attr);
            } else {
                el = eldiv("pb2-string:input/text", attr);
            }
            el.getValue = function () { return this.value; }.bind(el);
            el.setValue = function (v) { this.value = v; }.bind(el);
            isinput = true;
        }
        if (type == "number") {
            if (button.min != null) { attr.min = button.min; }
            if (button.max != null) { attr.max = button.max; }
            el = eldiv("pb2-number:input/text", attr);
            el.getValue = function () { return parseFloat(this.value); }.bind(el);
            el.setValue = function (v) { this.value = parseFloat(v); }.bind(el);
            isinput = true;
        }
        if (type == "int") {
            if (button.min != null) { attr.min = button.min; }
            if (button.max != null) { attr.max = button.max; }
            if (button.step != null) { attr.step = button.step; }
            el = eldiv("pb2-int:input/number", attr);
            el.getValue = function () { return parseInt(this.value); }.bind(el);
            el.setValue = function (v) { this.value = parseInt(v); }.bind(el);
            if (button.step == null) { el.addEventListener("change", function () { el.step = Math.max(1, Math.pow(10, Math.floor(Math.log10(Math.abs(el.value))) - 1)); }); }
            isinput = true;
        }
        if (type == "color") {
            el = eldiv("pb2-color:input/color", attr);
            el.getValue = function () {
                var m = this.value.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/);
                if (!m) { return [0, 0, 0] }
                else { return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]; }
            }.bind(el);
            el.setValue = function (v) {
                this.value = "#" + addzeros(v[0].toString(16), 2) + addzeros(v[1].toString(16), 2) + addzeros(v[2].toString(16), 2);
            }.bind(el);
            isinput = true;
        }
        if (type == "bool") {
            var sub = eldiv(":input/checkbox");
            el = eldiv("pb2-bool", attr, [eldiv(":label", [sub, button.text])]);
            el.getValue = function () { return this.checked; }.bind(sub);
            el.setValue = function (v) { this.checked = !!v; }.bind(sub);
            isinput = true;
        }
        if (type == "dropdown") {
            el = eldiv("pb2-dropdown:select", attr);
            if (button.options) { el.appendChild(elselect(button.options, button.v)); }
            el.getValue = function () { return this.value }.bind(el);
            el.setValue = function (v) { this.value = v; }.bind(el);
            isinput = true;
        }
        if (type == "radio") {
            var uuid = "";
            var groupid = button.group || arg;
            if (!els[groupid]) {
                uuid = getuuid();
                els[groupid] = {
                    els: {},
                    uuid: uuid,
                    getValue: function () { for (var a in this.els) { if (this.els[a].checked) { return this.els[a].value; } } return null; },
                    setValue: function (v) { for (var a in this.els) { if (this.els[a].value == v) { this.els[a].checked = true; } } },
                    onchange: null
                };
            }
            var groupobj = els[groupid];
            var sub = eldiv(":input/radio", { name: groupobj.uuid, value: button.v });
            el = eldiv("pb2-radio:label", attr, [sub, button.text]);
            els[groupid].els[id || getuuid()] = sub;
            sub.onchange = function (groupobj) { if (groupobj.onchange) { groupobj.onchange(groupobj.getValue()); } }.b(groupobj);
        }
        if (type == "slider") {
            var subs = {};
            el = eldiv("pb2-slide", [
                subs.label = eldiv("pb2-slide-title"),
                subs.bar = eldiv("pb2-slide-bar", [
                    subs.node = eldiv("pb2-slide-node")
                ])
            ]);
            el.drawValue = function () {
                var v = this.subs.value;
                var str = "";
                var rounded = +v.toFixed(10);
                if (typeof this.subs.text == "string") { str = this.subs.text.replace(/%s/g, rounded); }
                if (typeof this.subs.text == "function") { str = this.subs.text(rounded); }
                this.subs.label.innerText = str;
                var barvalue = this.subs.snaps ? this.subs.snaps.indexOf(v) : v;
                this.subs.node.style.left = (barvalue - this.subs.min) / (this.subs.max - this.subs.min) * 100 + "%";
            }.bind(el);

            subs.el = el;
            if (button.snaps) {
                subs.snaps = button.snaps;
                subs.min = 0;
                subs.max = button.snaps.length - 1;
                subs.step = 1;
                subs.value = button.value;
            }
            else {
                subs.snaps = null;
                subs.min = (button.min != null ? button.min : 0);
                subs.step = (button.step != null ? button.step : 1);
                subs.max = floorx(button.max != null ? button.max : 100, subs.step);
                subs.value = subs.min;
            }
            subs.text = button.text;
            subs.oninput = button.oninput;
            subs.onchange = button.onchange;
            (function (subs) {
                var wnd = null;
                var mousemoved = function (e) {
                    var rect = subs.bar.getBoundingClientRect();
                    var steps = Math.round((subs.max - subs.min) / subs.step);
                    var stepn = Math.round((e.clientX - rect.left) * steps / rect.width);
                    stepn = Math.max(0, Math.min(steps, stepn));
                    var v = subs.min + stepn * subs.step;
                    if (subs.snaps) { subs.value = subs.snaps[v]; }
                    else { subs.value = v; }
                    subs.el.drawValue();

                    if (subs.oninput) { subs.oninput(subs.value, subs); }
                }
                var mouseup = function (e) {
                    wnd.removeEventListener("mousemove", mousemoved);
                    wnd.removeEventListener("mouseup", mouseup);
                    if (subs.onchange) { subs.onchange(subs.value, subs); }
                }
                subs.bar.onmousedown = function (e) {
                    e.preventDefault();
                    wnd = subs.bar.ownerDocument.defaultView;
                    wnd.addEventListener("mousemove", mousemoved);
                    wnd.addEventListener("mouseup", mouseup);
                }
            })(subs);
            el.subs = subs;

            el.setValue = function (v) { this.subs.value = v; this.drawValue(); }.bind(el);
            el.getValue = function () { return this.subs.value }.bind(el);
            isinput = true;
        }

        //====== flat types ======
        if (type == "text") {
            el = eldiv("pb2-text", attr, [button.text]);
        }
        if (type == "br") {
            el = eldiv("pb2-br", attr);
        }
        if (type == "header") {
            el = eldiv("pb2-header", attr, [button.text]);
        }

        //====== structure types ======
        if (type == "h" || type == "v" || type == "subregion") {
            if (type == "h" || type == "v") {
                if (!button.sub && arg) { button.sub = buttons.splice(a + 1, arg.length); }
                if (arg) {
                    var total = 0;
                    for (var b = 0; b < arg.length; b++) { total += +arg[b]; }
                    for (var b = 0; b < arg.length; b++) { button.sub[b][type == "h" ? "flexwidth" : "flexheight"] = +arg[b] / total; }
                }
                el = eldiv("pb2-flex-" + type, attr);
            }

            if (type == "subregion") {
                if (!button.sub && arg) { button.sub = buttons.splice(a + 1, +arg); }
                el = eldiv("pb2-subregion", attr);
                el.setLocked = function (v) { toggleclass(this, "locked", !!v) }.bind(el);
                if (button.locked) { toggleclass(el, "locked", true); }
            }

            //fix recursive call
            var sub = promptboxbuttons2(button.sub);
            el.appendChild(sub.frag);
            for (var b in sub) {
                if (b == "frag") { continue; }
                els[b] = sub[b];
            }
        }
        //====== other types =====
        if (type == "button") {
            attr.value = attr.value || button.text;
            el = eldiv("pb2-button:input/button", attr);
        }
        if (type == "custom") {
            el = button.dom;
            for (var b in attr) { el.setAttribute(b, attr[b]); }
        }
        if (type == "div") {
            el = eldiv(arg || "", attr, button.sub);
        }

        //===== events =====
        if (button.onclick) { el.onclick = button.onclick.b(); }
        if (button.onchange) { el.onchange = button.onchange.b(); }

        //general properties
        if (!el) { debugger; }
        if (isinput && button.v !== undefined) { el.setValue(button.v); }
        if (id) { els[id] = el; }
        frag.appendChild(el);
    }
    return els;
}

function promptboxinsert(box, node, buttons, func, after) {
    if (func != undefined) { applyobject(box.functions, func); }
    var frag = promptboxbuttons(box, buttons);
    if (after) { node.parentNode.insertBefore(frag, node.nextSibling); }
    else { node.parentNode.insertBefore(frag, node); }
    box.style.marginTop = (-box.clientHeight / 2) + "px";//center root now that we know the height
}

function promptbox_default(options) {
    //important els
    var els = { root: null, title: null, closebutton: null, contentbox: null, insertfunc: null, closefunc: null };
    els.root = elcreate("div", options.v2 ? "contentbox pb2 pb2_default" : "contentbox promptbox promptbox_default", null, null, [
        elcreate("div", "contentboxhead", null, null, [
            elcreate("div", "carbonleft"),
            elcreate("div", "carbonmid contenttitle", null, null, [
                els.title = eldiv([options.title])
            ]),
            elcreate("div", "carbontoal"),
            elcreate("div", "almid"),
            elcreate("div", "alright", null, null, [
                els.closebutton = elcreate("div", "closeboxbutton", "display:block; margin-right:10px;")
            ])
        ]),
        els.contentbox = elcreate("div", "contentboxinner")
    ]);
    els.root.style.width = options.width + "px";

    return els;
}

function promptbox_popup(options) {
    options.fadein = false;

    var els = { root: null, title: null, closebutton: null, contentbox: null, insertfunc: null, closefunc: null, window: null };
    els.root = els.contentbox = elcreate("div", options.v2 ? "pb2 pb2_popup" : "promptbox promptbox_popup");
    els.root.style.width = options.width + "px";

    els.insertfunc = function (els, options) {
        var popid = "testpopup_" + Date.now();//"_blank";
        var wnd = window.open("", "promptbox" + popid, "width=" + options.measurewidth + ",height=" + options.measureheight);
        wnd.document.write("<!DOCTYPE html><head></head><body></body>");//required to get the doctype in there
        wnd.document.body.style.cssText = "margin:0px; padding:0px;";
        wnd.document.title = options.title;
        wnd.document.head.appendChild(elcreate("link", null, null, { href: absoluteUrl("/favicon.ico"), rel: "icon", type: "image/x-icon" }));
        options.stylesheets.push("/runeappslib.css");
        for (var a = 0; a < options.stylesheets.length; a++) {
            wnd.document.head.appendChild(elcreate("link", null, null, { href: absoluteUrl(options.stylesheets[a]), rel: "stylesheet", type: "text/css" }));
        }
        wnd.document.body.appendChild(els.root);
        if (window.alt1) { overrideselect(wnd); }
        if (!options.closefunction) { options.closefunction = wnd.close.bind(wnd); }
        window.addEventListener("beforeunload", wnd.close.bind(wnd));
        els.closefunc = wnd.close.bind(wnd);
        els.root.style.width = "100%";
        els.window = wnd;
    }

    return els;
}

function promptbox_nis(options) {
    var els = { root: null, title: null, closebutton: null, contentbox: null, insertfunc: null, closefunc: null };
    els.root = elcreate("div", options.v2 ? "pb2 pb2_nis nisborder" : "nisborder promptbox promptbox_nis", null, null, [
        elcreate("div", null, null, null, [
            els.closebutton = elcreate("div", "nisclosebutton", "position:absolute; top:4px; right:4px;"),
            els.title = eldiv({ style: "font-size:18px; padding-left:5px; margin-bottom:-3px;" }, [options.title]),
            elcreate("div", "nisseperator", "position:initial")
        ]),
        els.contentbox = elcreate("div", null, "margin-top:3px;")
    ]);
    els.root.style.width = options.width + "px";

    return els;
}

function promptbox_fakepopup(options) {
    var els = { root: null, title: null, closebutton: null, contentbox: null, insertfunc: null, closefunc: null };
    els.root = eldiv("pb2 pb2_fakepopup", [
        eldiv([
            els.closebutton = eldiv("pb2_fakepopup-exit"),
            els.title = eldiv("pb2_fakepopup-title", [options.title])
        ]),
        els.contentbox = eldiv({ style: "margin:5px 2px 2px;" })
    ]);
    els.root.style.width = options.width + "px";

    return els;
}

function floorx(a, b) { return Math.floor(a / b) * b; }

function roundx(a, b) { return Math.round(a / b) * b; }

function negmod(a, b) { return ((a % b) + b) % b; }//when we need negative modulos and js % fails -> -3%2=-1, yea sure

function clearlocalstorage(pre) {
    pre = pre || "";
    var a;
    for (a in localStorage) {
        if (a.slice(0, pre.length) == pre) { localStorage.removeItem(a); }
    }
}

function lvltoxp(lvl) {
    var a, b;
    if (isNaN(lvl) || lvl > 200) { return 0; }
    b = 0;
    for (a = 1; a < lvl; a += 1) { b += floor(a + 300 * Math.pow(2, a / 7)); }
    return floor(b / 4);
}

function xptolvl(xp, skill, capped) {
    var a = 0;
    while (xp > -1) { a += 1; xp -= floor(a + 300 * Math.pow(2, a / 7)) / 4; }
    return a;
}

var eliteskillxp = [0, 830, 1861, 2902, 3980, 5126, 6380, 7787, 9400, 11275, 13605, 16372, 19656, 23546, 28134, 33520, 39809, 47109, 55535, 65209, 77190, 90811, 106221, 123573, 143025, 164742, 188893, 215651, 245196, 277713, 316311, 358547, 404364, 454796, 509259, 568254, 632019, 700797, 774834, 854383, 946227, 1044569, 1149696, 1261903, 1381488, 1508756, 1644015, 1787581, 1939773, 2100917, 2283490, 2476369, 2679917, 2894505, 3120508, 3358307, 3608290, 3870846, 4146374, 4435275, 4758122, 5096111, 5449685, 5819299, 6205407, 6608473, 7028964, 7467354, 7924122, 8399751, 8925664, 9472665, 10041285, 10632061, 11245538, 11882262, 12542789, 13227679, 13937496, 14672812, 15478994, 16313404, 17176661, 18069395, 18992239, 19945833, 20930821, 21947856, 22997593, 24080695, 25259906, 26475754, 27728955, 29020233, 30350318, 31719944, 33129852, 34580790, 36073511, 37608773, 39270442, 40978509, 42733789, 44537107, 46389292, 48291180, 50243611, 52247435, 54303504, 56412678, 58575824, 60793812, 63067521, 65397835, 67785643, 70231841, 72737330, 75303019, 77929820, 80618654, 83370445, 86186124, 89066630, 92012904, 95025896, 98106559, 101255855, 104474750, 107764216, 111125230, 114558777, 118065845, 121647430, 125304532, 129038159, 132849323, 136739041, 140708338, 144758242, 148889790, 153104021, 157401983, 161784728, 166253312, 170808801, 175452262, 180184770, 185007406, 189921255, 194927409];
function smartxptolvl(xp, skill, capped) {
    var lvl = 1;
    if (skill == "tot") { qw("attempted to turn total xp into total level"); return -1; }
    if (xp < 0) { return -1; }
    //calc lvl
    if (skill == "inv") {//invention, use list for now
        for (lvl = 1; lvl < eliteskillxp.length; lvl++) {
            if (eliteskillxp[lvl] > xp) { break; }
        }
    }
    else {//normal
        lvl = xptolvl(xp);
    }

    //apply cap
    if (capped) {
        if (skill == "inv" || skill == "dun" || skill == "sla") { lvl = Math.min(120, lvl); }
        else { lvl = Math.min(99, lvl); }
    }
    return lvl;
}

function smartlvltoxp(lvl, skill) {
    var xp = 0;

    if (skill == "inv") {
        if (eliteskillxp.length > lvl - 1) { xp = eliteskillxp[lvl - 1]; }
        else { xp = 0; }
    }
    else {
        xp = lvltoxp(lvl);
    }
    return xp;
}

function addzeros(str, l, ch, after) {
    str += "";
    if (str.length == l) { return str; }
    if (str.length > l && !after) { return str.slice(-l); }
    if (str.length > l && after) { return str.slice(0, l); }
    if (str.length < l) { while (str.length < l) { str = (after ? str : "") + (ch == undefined ? "0" : ch) + (after ? "" : str); } return str; }
}

function addspaces(str, l) {
    str += "";
    if (str.length == l) { return str; }
    if (str.length > l) { return str.slice(0, l); }
    if (str.length < l) { while (str.length < l) { str = "0" + str; } return str; }
}

function escapehtml(str) {
    str += "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\\/g, "&#92;");
}

function escapequotes(str) {
    str += "";
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\\/g, "\\\\");
}

function applyobject(original, obj2) {
    if (obj2) { for (var a in obj2) { original[a] = obj2[a]; } }
    return original;
}

function balloonbox(text, box, buttons, closefunction) {
    var a, b, c, d, str, side, el, w, h, top, left, bottom, right, perpoffset;
    if (box) {
        el = (typeof box.el == "string" ? elid(box.el) : box.el) || false;
        w = box.w || 300;
        h = box.h || false;
        top = box.top || 0;
        bottom = box.bottom || 0;
        left = box.left || 0;
        right = box.right || 0;
        side = box.side || 0;
        perpoffset = box.perpoffset || 0;
        arrowoffset = box.arrowoffset || 0;
        offset = box.offset || 0;
    }
    else {
        w = 300;
        el = false;
    }

    a = document.createElement("div");
    a.id = "balloonbox";
    a.style.width = w + "px";
    if (h) { a.style.height = h + "px"; }
    str = "";
    str += "<div onclick='this.parentNode.cancel();' style='float:right; cursor:pointer; width:15px; height:15px; background:url(\"/imgs/exit.png\"); margin-left:5px;'></div>";
    str += text;
    if (buttons) {
        a.fun = {};
        str += "<div style='float:right;'>";
        for (c in buttons) {//[0text,1fun[,type]]
            str += "<div onclick='this.parentNode.parentNode.fun[" + c + "]();' style='' class='balloonboxbutton" + (buttons[c][2] == "next" ? " balloonboxnext" : "") + "'>" + (buttons[c][0]) + "</div>";
            if (buttons[c][1]) { (function (d) { a.fun[d] = function () { if (buttons[d][1](a) != false) { a.parentNode.removeChild(a); } }; })(c) }
            else { a.fun[c] = function () { a.parentNode.removeChild(a); } };
            if (buttons[c][2] == "cancel" && !closefunction) { closefunction = buttons[c][1]; }
        }//function with name cancel is also used for canceling if cancelcallback is undefined
        str += "</div>";
    }
    a.cancel = function () { if (!closefunction || closefunction() !== false) { a.parentNode.removeChild(a); } };
    a.style.position = "absolute";
    a.innerHTML = str;
    if (el) { el.ownerDocument.body.appendChild(a); }
    else { document.body.appendChild(a); };
    if (!h) { h = a.clientHeight - 20; }
    if (el) {//check if argument is DOM node, otherwise allow pos object
        a.style.position = (el.style.position == "fixed" ? "fixed" : "absolute");
        c = el.getBoundingClientRect();
        b = { top: c.top, left: c.left, bottom: c.bottom, right: c.right, width: c.width, height: c.height };
        if (a.style.position != "fixed") {
            b.top += window.pageYOffset;
            b.left += window.pageXOffset;
        }
        if (side == 0) {//below
            a.appendChild(str2node("<div style='position:absolute; top:-18px; left:" + (10 + arrowoffset - offset) + "px; background:url(\"/imgs/ballooncorner.png\") no-repeat 0px 0px; width:35px; height:18px;'></div>"));
            a.style.top = b.top + b.height + 10 - perpoffset + "px";
            a.style.left = b.left + offset + "px";
        }
        if (side == 1) {//right
            a.appendChild(str2node("<div style='position:absolute; top:" + (10 + arrowoffset - offset) + "px; left:-18px; background:url(\"/imgs/ballooncorner.png\") no-repeat 0px 0px; width:18px; height:35px;'></div>"));
            a.style.top = b.top + offset + "px";
            a.style.left = b.left + b.width - perpoffset + 10 + "px";
        }
        if (side == 2) {//above
            a.appendChild(str2node("<div style='position:absolute; bottom:-18px; left:" + (10 + arrowoffset - offset) + "px; background:url(\"/imgs/ballooncorner.png\") no-repeat 0px -17px; width:35px; height:18px;'></div>"));
            a.style.top = b.top - h + perpoffset - 30 + "px";
            a.style.left = b.left + offset + "px";
        }
        if (side == 3) {//left
            a.appendChild(str2node("<div style='position:absolute; top:" + (10 + arrowoffset - offset) + "px; right:-18px; background:url(\"/imgs/ballooncorner.png\") no-repeat -17px 0px; width:18px; height:35px;'></div>"));
            a.style.top = b.top + offset + "px";
            a.style.left = b.left - w + perpoffset - 30 + "px";
        }
    }
    else {
        a.style.position = "absolute";
        if (left) { a.style.left = left + "px"; }
        if (top) { a.style.top = top + "px"; }
        if (bottom) { a.style.bottom = bottom + "px"; }
        if (right) { a.style.right = right + "px"; }
    }
    a.style.height = h + "px";
    a.scrollIntoViewIfNeeded && a.scrollIntoViewIfNeeded();//pffft not standard yet...
    return a;
}

function spacednr(nr) {
    var a, b, r, neg;
    nr = Math.floor(nr);
    if (nr < 0) { neg = true; nr = -nr; } else { neg = false; }
    nr = "" + nr;
    r = "";
    b = nr.length - 1;
    for (a = 0; nr[b - a]; a += 1) { if (a % 3 == 0 && a != 0) { r = "," + r; } r = nr.slice(b - a, b - a + 1) + r; }
    return (neg ? "-" : "") + r;
}

function listdate(time) {
    var d;
    if (storageallowed && localStorage.timeoffset != "auto") {
        d = new Date(time + localStorage.timeoffset * 1000 * 60 * 60);
        return d.getUTCDate() + " " + monthnames[d.getUTCMonth()] + " " + d.getUTCFullYear();
    }
    else {
        d = new Date(time);
        return d.getDate() + " " + monthnames[d.getMonth()] + " " + d.getFullYear();
    }
}

function listtime(time) {
    var d;
    if (storageallowed && localStorage.timeoffset != "auto") {
        d = new Date(time + localStorage.timeoffset * 1000 * 60 * 60);
        return d.getUTCHours() + ":" + addzeros(d.getUTCMinutes(), 2);
    }
    else {
        d = new Date(time);
        return d.getHours() + ":" + addzeros(d.getMinutes(), 2);
    }
}

function shoutboxtime(time) {
    var d, now, r;
    d = new Date(time);
    now = new Date();
    yday = new Date();
    yday.setDate(yday.getDate() - 1);
    if (now - d < 1000 * 60 * 60) {
        r = timegap(now - d) + " ago";
    }
    else {
        if (d.getDate() == now.getDate() && d.getMonth() == now.getMonth() && d.getFullYear() == now.getFullYear()) { r = "Today"; }
        else if (d.getDate() == yday.getDate() && d.getMonth() == yday.getMonth() && d.getFullYear() == yday.getFullYear()) { r = "Yesterday"; }
        else { r = d.getDate() + " " + monthnames[d.getMonth()]; }
        r += ", ";
        r += addzeros(d.getHours(), 2) + ":" + addzeros(d.getMinutes(), 2);
    }
    return r;
}

function timeago(time) {
    return timegap(Date.now() - time);
}

function timegap(milsec) {
    milsec /= 1000;
    milsec = Math.abs(milsec);
    if (milsec < 2) { return "one second" }
    if (milsec < 60) { return Math.floor(milsec) + " seconds"; }
    if (milsec < 2 * 60) { return "one minute"; }
    if (milsec < 60 * 60) { return Math.floor(milsec / 60) + " minutes"; }
    if (milsec < 2 * 60 * 60) { return "one hour" }
    if (milsec < 24 * 60 * 60) { return Math.floor(milsec / 60 / 60) + " hours"; }
    if (milsec < 2 * 24 * 60 * 60) { return "one day"; }
    if (milsec < 31 * 24 * 60 * 60) { return Math.floor(milsec / 24 / 60 / 60) + " days"; }
    if (milsec < 2 * 31 * 24 * 60 * 60) { return "one month"; }
    if (milsec < 365 * 24 * 60 * 60) { return Math.floor(milsec / 31 / 24 / 60 / 60) + " months"; }
    if (milsec < 2 * 365 * 24 * 60 * 60) { return "one year"; }
    return Math.floor(milsec / 365 / 24 / 60 / 60) + " years";
}

function lowname(name, validate, keeplook) {
    name = name.replace(/\+/g, " ");
    name = name.replace(/\%20/g, " ");
    name = name.replace(/[^\w \-]/g, "");
    if (!keeplook) { name = name.replace(/[ _\-]/g, "_").toLowerCase(); }
    if (validate) {
        name = name.replace(/^[ _\-]+/, "");//cut down whitespace at start
        name = name.replace(/[ _\-]+$/, "");//cut down whitespace at end
        name = name.replace(/[ _\-]{2,}/, function (a) { return "__________".slice(0, a.length); });//replace more than one whitespace with _'s
        if (name.length > 12 || name == "") { return ""; }
    }
    return name;
}

function elq(query) {
    return document.querySelector(query);
}

function elqa(query) {
    return document.querySelectorAll(query);
}

function elid(id, sub) {
    if (sub) { return id.ownerDocument.getElementById(sub); }
    else { return document.getElementById(id); }
}

function elcl(classname, opt) {
    if (opt != undefined) { return classname.getElementsByClassName(opt); }
    else { return document.getElementsByClassName(classname); }
}

function checkaccess(frame) {
    var e;
    try {
        e = frame.contentWindow || frame.window;
        if (e.denyaccess) { return false; }//allow frame to deny acces
        e.document;
        return e;
    } catch (e) {
        return false;
    }
}

function getframeelement() {
    var e;
    try { return frameElement || false; }
    catch (e) { return false; }
}

function htmlentities(str) {
    str += "";
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function smallu(nr, gp) {
    var a, sign;
    if (isNaN(nr)) { return "-"; }
    nr = Math.round(nr);
    if (nr < 0) { sign = "-"; nr = -nr; } else { sign = ""; }
    if (nr >= 1000000000000000) { return sign + "quite a bit" }
    if (nr % 1) {
        if (nr < 100) { return sign + (nr + "00").slice(0, 4); }
        nr = Math.floor(nr);
    }
    nr += "";
    a = nr;
    if (nr.length <= 3) { return sign + nr + (gp ? "gp" : ""); }
    if (nr.length == 4) { return sign + nr.slice(0, 1) + "," + nr.slice(1, 4) + (gp ? "gp" : ""); }
    if (nr.length % 3 != 0) { nr = nr.slice(0, nr.length % 3) + "." + nr.slice(nr.length % 3, 3); }
    else { nr = nr.slice(0, 3); }
    if (a.length <= 6) { return sign + nr + "k" }
    if (a.length <= 9) { return sign + nr + "m" }
    if (a.length <= 12) { return sign + nr + "b" }
    if (a.length <= 15) { return sign + nr + "t" }
}

function startcaps(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function surfixnumber(nr) {
    if (nr % 10 == 1 && nr != 11) { return nr + "st"; }
    if (nr % 10 == 2 && nr != 12) { return nr + "nd"; }
    if (nr % 10 == 3 && nr != 13) { return nr + "rd"; }
    return nr + "th";
}

function nicetime(time) {
    if (time < 0) { return "--:--"; }
    return (time >= 1000 * 60 * 60 ? Math.floor(time / 1000 / 60 / 60) + ":" : "") + addzeros(Math.floor(time / 1000 / 60) % 60, 2) + ":" + addzeros(Math.floor(time / 1000) % 60, 2);
}

function rgb(r, g, b) {
    return (r << 16) + (g << 8) + b;
}

function coltohex(col, g, b) {
    if (g != undefined && b != undefined) { col = rgb(col, g, b); }//allow rgb input
    return "#" + addzeros(col.toString(16), 6);
}

function fillarray(l, val) {
    var a, r;
    r = new Array(l);
    for (a = 0; a < l; a += 1) { r[a] = val; }
    return r;
}

function str2node(str) {
    var a;
    a = document.createElement("div");
    a.innerHTML = str;
    return a.firstChild;
}

function newdraghandler2(mousedownevent, movefunc, endfunc, mindist) {
    var locked = mindist != undefined;
    var mouseloc;

    var clientdx = mousedownevent.clientX - mousedownevent.screenX;
    var clientdy = mousedownevent.clientY - mousedownevent.screenY;

    //TODO screenX approach breaks when zoomed or clientx is required
    var x = mousedownevent.screenX + clientdx;
    var y = mousedownevent.screenY + clientdy;
    var init = function () { mouseloc = { x: x, y: y, dx: 0, dy: 0, sx: x, sy: y, end: false }; }
    init(mousedownevent);

    var moved = function (e, end) {
        var x = e.screenX + clientdx;
        var y = e.screenY + clientdy;
        var dx = x - mouseloc.x;
        var dy = y - mouseloc.y;
        if (locked && Math.abs(dx) + Math.abs(dy) >= mindist) {
            locked = false;
        }
        if (!locked) {
            mouseloc.end = end;
            mouseloc.dx = dx;
            mouseloc.dy = dy;
            mouseloc.x = x;
            mouseloc.y = y;
            movefunc && movefunc(mouseloc, false);
            end && endfunc && endfunc(mouseloc, true);
        }
    }


    var mousemove = function (e) {
        if (e.touches) {
            e = e.touches[0];
        }
        moved(e, false);
    };
    var mouseup = function (e) {
        if (e.touches) {
            e = e.touches[0];
        }
        if (e) { moved(e, true); }
        for (var a in allframes) {
            var frame = allframes[a];
            frame.removeEventListener("mousemove", mousemove);
            frame.removeEventListener("mouseup", mouseup);
            frame.removeEventListener("touchmove", mousemove);
            frame.removeEventListener("touchend", mouseup);
        }
    }

    //damn this is a mess, other frames consume the event so add handlers to every frame
    //currently still break when hovering over frame which arent parents of the current one
    //EDIT: THIS IS MADNESS
    var allframes = [];
    var recurframe = function (frame) {
        if (allframes.indexOf(frame) != -1) {
            return;
        }
        try {
            var qq = frame.document;
        } catch (e) {
            return;
        }
        allframes.push(frame);
        for (var a = 0; a < frame.frames.length; a++) {
            recurframe(frame.frames[a]);
        }
    }
    recurframe(top);
    recurframe(window);
    for (var a in allframes) {
        var frame = allframes[a];
        frame.addEventListener("mousemove", mousemove);
        frame.addEventListener("mouseup", mouseup);
        frame.addEventListener("touchmove", mousemove);
        frame.addEventListener("touchend", mouseup);
    }
}

function sum(list) {
    var a, b;
    b = 0;
    for (a in list) { b += +list[a]; }
    return b;
}

function buffertoimage(buffer, size) {
    var a, b, ctx, w, h, ox, oy;
    if (size) {
        w = size.width;
        h = size.height;
        ox = -size.x;
        oy = -size.y;
    }
    if (!w) { w = buffer.width; }
    if (!h) { h = buffer.height; }
    if (!ox) { ox = 0; }
    if (!oy) { oy = 0; }
    a = document.createElement("canvas");
    a.width = w;
    a.height = h;
    ctx = a.getContext("2d");
    ctx.putImageData(buffer, ox, oy);
    return a;
}

function imagetobuffer(img, x, y, w, h) {
    var a, b, c, d;
    if (!x) { x = 0; }
    if (!y) { y = 0; }
    if (!w) { w = img.width - x; }
    if (!h) { h = img.height - y; }
    a = document.createElement("canvas");
    a.width = w;
    a.height = h;
    a = a.getContext("2d");
    a.drawImage(img, -x, -y);
    return a.getImageData(0, 0, w, h);
}

function numbertosigned(number) {
    if (number < 0) { return number.toString(); }
    else { return "+" + number; }
}

function toggleclass(el, classname, state) {
    if (typeof el == "string") { el = elid(el); }
    if (state == undefined) { state = !el.classList.contains(classname); }
    if (state) { el.classList.add(classname); }
    else { el.classList.remove(classname); }
    return state;
}

function loadyql(query, success, fail) {//i love you yahoo =D
    dlpage("https://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(query) + "&format=json", function (t) { var a = false; try { t = JSON.parse(t); a = true; } catch (e) { fail(); } if (a) { success(t); } }, fail);
}

function imgcompare(data1, data2, x, y, max) {
    var a, b, diff, pdiff, endx, endy;
    if (!x) { x = 0; }
    if (!y) { y = 0; }
    if (max == undefined) { max = false; }
    endx = Math.min(data1.width, data2.width + x);
    endy = Math.min(data1.height, data2.height + y);
    if (max) { max *= (endx - x) * (endy - y); }
    diff = 0;
    for (a = x; a < endx; a += 1) {
        for (b = y; b < endy; b += 1) {
            pdiff = 0;
            pdiff += Math.abs(data1.data[4 * a + 4 * b * data1.width] - data2.data[4 * (a - x) + 4 * (b - y) * data2.width]);
            pdiff += Math.abs(data1.data[4 * a + 4 * b * data1.width + 1] - data2.data[4 * (a - x) + 4 * (b - y) * data2.width + 1]);
            pdiff += Math.abs(data1.data[4 * a + 4 * b * data1.width + 2] - data2.data[4 * (a - x) + 4 * (b - y) * data2.width + 2]);
            pdiff *= data2.data[4 * (a - x) + 4 * (b - y) * data2.width + 3] / 255;
            diff += pdiff;
            if (max && diff > max) { return false; }
        }
    }
    if (max && diff > max) { return false; }
    if (max) { return true; }
    else { return diff / ((endx - x) * (endy - y)); }
}

function coldiff(r1, g1, b1, r2, g2, b2) {//compare color
    var r3, g3, b3;
    r3 = Math.abs(r1 - r2);
    g3 = Math.abs(g1 - g2);
    b3 = Math.abs(b1 - b2);
    return r3 + g3 + b3;
}

//========== advanced math ==========

function vmpr(v, m) {//vector-matrix product
    var a, b, c, r, vl;
    r = [];
    vl = v.length;
    for (a = 0; a < vl; a++) {
        r[a] = 0;
        for (b = 0; b * vl < m.length; b++) {
            r[a] += v[b] * m[a + b * vl];
        }
    }
    return r;
}

function mmpr(m1, m2) {
    var a, b, c, d, size, r;
    size = Math.sqrt(m1.length);
    r = [];
    for (b = 0; b < size; b++) {
        for (a = 0; a < size; a++) {
            r[a + size * b] = 0;
            for (c = 0; c < size; c++) {
                r[a + size * b] += m1[c + size * b] * m2[a + size * c];
            }
        }
    }
    return r;
}

function vsum(v1, v2) {
    var a, r;
    r = [];
    for (a in v1) {
        r[a] = v1[a] + v2[a];
    }
    return r;
}

function mvread(m, v) {
    var a;
    for (a in v) { m = m[v[a]]; }
    return m;
}

function imgtoctx(img) {
    var a, b, c;
    a = document.createElement("canvas");
    b = a.getContext("2d");
    a.width = img.width;
    a.height = img.height;
    b.drawImage(img, 0, 0);
    return b;
}

function imgtocnv(img) {//required to use cnv.toDataURL
    var a, b, c;
    a = document.createElement("canvas");
    b = a.getContext("2d");
    a.width = img.width;
    a.height = img.height;
    b.drawImage(img, 0, 0);
    return a;
}

function rgbtohsl(r, g, b) {
    var mx, mn, cr, h, s, l;

    if (typeof r == "object") { b = r[2]; g = r[1]; r = r[0]; }

    r /= 256;
    g /= 256;
    b /= 256;

    mx = Math.max(r, g, b);
    mn = Math.min(r, g, b);
    cr = mx - mn;

    s = cr;

    l = 0.5 * (mx + mn);
    if (cr == 0) { var h = 0; }
    else {
        if (mx == r) { h = (6 + (g - b) / cr) % 6; }
        if (mx == g) { h = (b - r) / cr + 2; }
        if (mx == b) { h = (r - g) / cr + 4; }
    }

    return [Math.round(h / 6 * 255), Math.round(s * 255), Math.round(l * 255)];
}

function startbarslide(e, bar, cb, cbdone) {
    var bar, barpos, callback, node, title;

    title = bar;
    while (title = title.previousSibling) {
        if (title.classList) {
            if (!title.classList.contains("slidetitle")) { title = false; }
            break;
        }
    }
    node = bar.children; if (node) { node = node[0]; }

    barpos = bar.getBoundingClientRect();
    callback = function (pos) {
        var val, a, b;
        val = (pos.x - barpos.left) / barpos.width;
        if (val > 1) { val = 1; }
        if (val < 0) { val = 0; }
        if (cb) { b = cb(val, bar, title); }
        if (b != undefined) { val = b; }
        if (node && b !== false) { node.style.left = val * 100 + "%"; }
    }
    newdraghandler2(e, callback, cbdone);
}

function getbrowser() {
    //copy paste browser detector - here be dragons
    var ua = navigator.userAgent;
    var tem;
    var M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\bOPR\/(\d+)/)
        if (tem != null) return 'Opera ' + tem[1];
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join(' ');
}

currentzoomedimg = false;
currentzoomedlist = [];
currentzoomedindex = false;
function zoomimg(origin, imglist, index) {
    var a, w, h, l, t, r, bounds, str, zoomouter, elimg, newouter, imgsrc, imgtitle, imgdescr;
    exitimgzoom();

    if (imglist && index == undefined) {
        a = origin.getAttribute("src");
        for (b in imglist) { if (a == imglist[b].src) { index = +b; break; } }
    }
    if (imglist) {
        imgtitle = imglist[index].title;
        imgdescr = imglist[index].descr;
    }

    if (origin instanceof HTMLElement) {
        w = origin.naturalWidth;
        h = origin.naturalHeight;
        currentzoomedimg = origin;
        imgsrc = origin.src;
    }
    else {
        w = imglist[index].width;
        h = imglist[index].height;
        imgsrc = imglist[index].src;
    }

    if (imglist) {
        currentzoomedlist = imglist;
        currentzoomedindex = index;
    }

    //calculate starting bounds
    bounds = origin.getBoundingClientRect && origin.getBoundingClientRect();
    if (!bounds) {
        if (origin == "right") { bounds = { left: -w / 2, top: window.innerHeight / 2 - h / 4, width: w / 2, height: h / 2 }; }
        else { bounds = { left: window.innerWidth, top: window.innerHeight / 2 - h / 4, width: w / 2, height: h / 2 }; }
    }
    //calculate zoomed size
    a = Math.min(window.innerWidth / w, window.innerHeight / h) * 0.8;
    if (a < 1) { w *= a; h *= a; }
    l = (window.innerWidth - w) / 2;
    t = (window.innerHeight - h) / 2;

    //create/find outer element
    if (r = elid("zoomedimgouter")) { newouter = false; }
    else {
        newouter = true;
        r = document.createElement("div");
        r.id = "zoomedimgouter";
        r.addEventListener("click", function () { exitimgzoom(); });
        document.body.appendChild(r);
        r.style.background = "rgba(0,0,0,0)";
    }

    //create other stuff
    if (newouter) {
        str = "";
        str += "<div id='zoomedimgtitle'></div>";
        str += "<div id='zoomedimgdescr'></div>";
        if (imglist) {
            str += "<div id='zoomedimgleft'></div>";
            str += "<div id='zoomedimgright'></div>";
        }
        r.innerHTML = str;
        if (imglist) {
            elid("zoomedimgright").addEventListener("click", function (e) { zoomimgshift(1); e.stopPropagation(); });
            elid("zoomedimgleft").addEventListener("click", function (e) { zoomimgshift(-1); e.stopPropagation(); });
        }
    }
    if (a = elid("zoomedimgright")) {
        a.style.left = (l + w - w / 4) + "px"; a.style.top = t + "px"; a.style.height = h + "px"; a.style.width = w / 4 + "px";
        a.style.display = "none";
    }
    if (a = elid("zoomedimgleft")) {
        a.style.left = l + "px"; a.style.top = t + "px"; a.style.height = h + "px"; a.style.width = w / 4 + "px";
        a.style.display = "none";
    }
    elid("zoomedimgtitle").innerHTML = imgtitle || "";
    elid("zoomedimgtitle").style.display = "none";
    elid("zoomedimgtitle").style.opacity = 0;
    elid("zoomedimgtitle").style.left = l + "px";
    elid("zoomedimgtitle").style.width = w + "px";
    elid("zoomedimgtitle").style.top = t + "px";

    elid("zoomedimgdescr").innerHTML = imgdescr || "";
    elid("zoomedimgdescr").style.display = "none";
    elid("zoomedimgdescr").style.opacity = 0;
    elid("zoomedimgdescr").style.left = l + "px";
    elid("zoomedimgdescr").style.width = w + "px";
    elid("zoomedimgdescr").style.top = (t + h) + "px";


    //create img element
    elimg = document.createElement("img");
    r.appendChild(elimg);
    elimg.outerHTML = "<img class='zoomedimg' id='zoomedimg' style='width:" + bounds.width + "px; height:" + bounds.height + "px; left:" + bounds.left + "px; top:" + bounds.top + "px;' src='" + imgsrc + "'/>";

    setTimeout(function () {
        elid("zoomedimgouter").style.background = "rgba(0,0,0,0.5)";
        var el = elid("zoomedimg");
        el.style.left = l + "px";
        el.style.top = t + "px";
        el.style.width = w + "px";
        el.style.height = h + "px";
    }, 20);
    setTimeout(function () {
        if (imgtitle) { elid("zoomedimgtitle").style.display = "block"; }
        if (imgdescr) { elid("zoomedimgdescr").style.display = "block"; }
        if (a = elid("zoomedimgleft")) { a.style.display = "block"; }
        if (a = elid("zoomedimgright")) { a.style.display = "block"; }
    }, 500);
    setTimeout(function () {
        elid("zoomedimgtitle").style.opacity = 1;
        elid("zoomedimgdescr").style.opacity = 1;
    }, 520);
}

function zoomimgshift(dif) {
    var a, b, el, i, newi;
    i = currentzoomedindex;
    if (i === false) { return; }

    newi = negmod(i + dif, currentzoomedlist.length);

    exitimgzoom((dif < 0 ? "left" : "right"));
    zoomimg((dif > 0 ? "left" : "right"), currentzoomedlist, newi);
}

function exitimgzoom(dir) {
    var a, b, outer, el, originalbounds, bounds;
    if (!elid("zoomedimg")) { return; }

    el = elid("zoomedimg");
    el.id = "zoomedoldimg";
    originalbounds = !dir && currentzoomedimg && currentzoomedimg.getBoundingClientRect && currentzoomedimg.getBoundingClientRect();

    //determine end positions
    bounds = el.getBoundingClientRect();
    if (originalbounds) {
        el.style.left = originalbounds.left + "px";
        el.style.top = originalbounds.top + "px";
        el.style.width = originalbounds.width + "px";
        el.style.height = originalbounds.height + "px";
    }
    else {
        el.style.height = bounds.height / 2 + "px";
        el.style.width = bounds.width / 2 + "px";
        el.style.top = (bounds.top + bounds.height / 4) + "px";
        if (dir == "left") {
            el.style.left = window.innerWidth + "px";
        }
        else {
            el.style.left = -bounds.width + "px";
        }
    }
    //hide interfaces
    if (a = elid("zoomedimgright")) { a.style.display = "none"; }
    if (a = elid("zoomedimgleft")) { a.style.display = "none"; }
    elid("zoomedimgtitle").style.display = "none";
    elid("zoomedimgtitle").style.opacity = 0;
    elid("zoomedimgdescr").style.display = "none";
    elid("zoomedimgdescr").style.opacity = 0;

    //image zoom ended if no dir given
    if (!dir) {
        elid("zoomedimgouter").style.background = "rgba(0,0,0,0)";
        setTimeout(function () { elid("zoomedimgouter").parentNode.removeChild(elid("zoomedimgouter")); }, 500);
    }
    else {
        setTimeout(function () { elid("zoomedoldimg").parentNode.removeChild(elid("zoomedoldimg")); }, 500);
    }
    currentzoomedimg = false;
}


overrideselected = false;
function overrideselect(frame) {
    if (!frame) { frame = window; }
    if (frame.overrideselected) { return; }

    overrideselected = function (e) {
        var func, names, values, subs;

        //remove old fake select if clicked outside of it
        if (frame.document.getElementById("selectoverlay") && !e.target.classList.contains("selectoverlayoption") && !e.target.classList.contains("selectoverlayinner")) { frame.document.getElementById("selectoverlay").removeme(); }

        //done if target is not select
        if (e.target.tagName != "SELECT") { return; }

        //build arrays
        subs = e.target.children;
        names = [];
        values = [];
        for (a = 0; a < subs.length; a++) {
            names[a] = subs[a].innerHTML;
            values[a] = subs[a].value;
        }

        func = function (val) {
            e.target.value = val;
            e.target.onchange && e.target.onchange();
            e.target.onclick && e.target.onclick();
        }

        var el = modalDropdown(func, names, values);
        frame.document.body.appendChild(el);
        e.preventDefault();
    }

    frame.document.addEventListener("mousedown", overrideselected);
}

function modalDropdown(func, names, values, selected) {
    var a, b, c, str, el;

    //remove old fake select
    if (elid("selectoverlay")) { elid("selectoverlay").removeme(); }

    el = document.createElement("div");
    el.id = "selectoverlay";
    el.removeme = function () { el.parentNode.removeChild(el); }
    el.select = function (elcl) {
        var val = elcl.getAttribute("data-value");
        el.removeme();
        func && func(val);
    }

    str = "<div class='selectoverlayinner'>";
    for (a = 0; a < names.length; a++) {
        str += "<div class='selectoverlayoption" + (values[a] == selected ? " isselected" : "") + "' data-value='" + values[a] + "' onclick='this.parentNode.parentNode.select(this);'>" + names[a] + "</div>";
    }
    str += "</div>"
    el.innerHTML = str;
    return el;
}
function showModalDropdown(func, names, values, selected) {
    var el = modalDropdown(func, names, values, selected);
    document.body.appendChild(el);
    return el;
}

function unoverrideselect() {
    document.removeEventListener("mousedown", overrideselected);
}

function simplecopy(str) {
    var outel;

    outel = document.createElement("textarea");
    outel.style.zIndex = 1000000;
    outel.style.position = "fixed";
    outel.style.left = "10px";
    outel.style.top = "10px";
    outel.innerHTML = str;
    outel.selectionStart = 0;
    outel.selectionEnd = 100000000;
    outel.onkeyup = function (e) { if (e.keyCode == 67) { outel.parentElement.removeChild(outel); } }
    document.body.appendChild(outel);
    outel.focus();
}

function postpage(path, params) {
    var form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", path);

    for (var key in params) {
        if (!params.hasOwnProperty(key)) { continue; }
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", params[key]);
        form.appendChild(hiddenField);
    }

    document.body.appendChild(form);
    form.submit();
}

function arglist() {
    var r;
    r = {};
    document.location.search.replace(/(?:\?|&)(\w+)(?:=([\w%\/-]*))?(?=$|&)/g, function (a, b, c) { r[b] = c || true; });
    return r;
}

function buildquery(args) {
    var a, b, r;
    r = "";
    for (a in args) {
        if (r == "") { r += "?"; }
        else { r += "&"; }
        r += encodeURIComponent(a);
        r += "=";
        r += encodeURIComponent(args[a]);
    }
    return r;
}

function makegraph(el, vals, times, opts) {
    var a, b, c, d, tmin, tmax, vmin, vmax, line, points, hscale, vscale, x, y, size, getx, gety, regions, rline, rdots, rhover, str, startx, starty;
    //fix default options
    if (!opts) { opts = {}; }
    opts = applyobject({ title: false, line: true, points: false, hscale: false, vscale: false, hover: false, combinedinput: false }, opts);

    //allow skipping time input
    if (opts.combinedinput) {
        var temp = vals;
        vals = []; times = [];
        for (var a = 0; a * 2 + 1 < temp.length; a++) { vals[a] = temp[a * 2 + 1]; times[a] = temp[a * 2]; }
    }
    if (!times) {
        times = []; for (a = 0; a < vals.length; a++) { times[a] = a; }
    }
    if (times.length != vals.length) { return; }

    //get size
    if (opts.size) {
        size = opts.size;
    }
    else {
        size = el.getBoundingClientRect();
        if (size.height == 0) { return; }//display:none
    }

    //get bounds
    vmin = Infinity;
    vmax = -Infinity;
    for (a = 0; a < vals.length; a++) {
        if (vals[a] > vmax) { vmax = vals[a]; }
        if (vals[a] < vmin) { vmin = vals[a]; }
    }
    if (vmax == vmin) { vmin--; vmax++; }
    tmin = times[0];
    tmax = times[times.length - 1];
    if (tmax == tmin) { tmin--; tmax++; }

    //define coord space
    if (opts.vscale) { startx = 20 } else { startx = 20; }
    if (opts.hscale) { starty = 40 } else { starty = 10; }
    getx = function (v) { return (v - tmin) / (tmax - tmin) * (size.width - startx) + 10; }
    gety = function (v) { return (1 - (v - vmin) / (vmax - vmin)) * (size.height - starty) + 5; }

    line = "M";
    points = "";
    regions = "";
    for (a = 0; a < vals.length; a++) {
        y = gety(vals[a]);
        x = getx(times[a]);
        line += x + ",";
        line += y + " ";
        points += "<circle id='graphpoint-" + times[a] + "' class='graphpoint' r='3' cx='" + x + "' cy='" + y + "'></circle>";
        if (a > 0) { c = (getx(times[a]) + getx(times[a - 1])) / 2; } else { c = 0; }
        if (a < vals.length - 1) { d = (getx(times[a + 1]) + getx(times[a])) / 2; } else { d = size.width; }
        regions += "<rect class='graphhoverregion' data-v='" + vals[a] + "' data-t='" + times[a] + "' y='0' x='" + c + "' height='" + size.height + "' width='" + (d - c) + "'></rect>";
    }

    a = new Date(floorx(tmin, 1000 * 60 * 60 * 24));
    a.setDate(1);
    hscale = "";
    b = -25;
    while (a < tmax) {
        x = getx(a);
        if (x > b + 50) {
            hscale += "<text class='graphhscaletitle' x='" + getx(a) + "' y='" + (size.height - 10) + "'>" + monthnames[a.getMonth()] + "</text>";
            b = x;
        }
        hscale += "<path class='graphhscaleline' d='M " + getx(a) + "," + (size.height - 28) + " v " + (b == x ? 5 : 3) + "'/>";
        a.setMonth(a.getMonth() + 1);
    }

    a = 0;
    c = 0;
    d = Math.min(30, size.height / 3);
    for (b = 0; b < 12; b++) {//figure out vertical scale size
        if (Math.abs(gety(0) - gety(1 * Math.pow(10, b))) > d) { a = 1 * Math.pow(10, b); break; }
        if (Math.abs(gety(0) - gety(2 * Math.pow(10, b))) > d) { a = 2 * Math.pow(10, b); break; }
        if (Math.abs(gety(0) - gety(5 * Math.pow(10, b))) > d) { a = 5 * Math.pow(10, b); break; }
    }
    if ((vmax - vmin) / a > 1000) { qw("wtf error shouldnt happen"); return; }

    vscale = "";
    for (b = floorx(vmin, a) + a; b <= vmax; b += a) {
        vscale += "<text class='graphvscaletitle' x='0' y='" + (gety(b) - 2) + "'>" + smallu(b) + "</text>";
        vscale += "<path class='graphvscaleline' d='M 0," + gety(b) + " H " + size.width + "'/>";
    }

    el.innerHTML = "";
    el.setAttribute("viewBox", "0 0 " + size.width + " " + size.height);
    el.setAttribute("preserveAspectRatio", "none");

    if (opts.line) {
        a = document.createElementNS("http://www.w3.org/2000/svg", "path");
        a.classList.add("graphpath");
        a.setAttribute("d", line);
        el.appendChild(a);
    }

    if (opts.points) {
        a = document.createElementNS("http://www.w3.org/2000/svg", "g");
        a.innerHTML = points;
        a.classList.add("graphpoints");
        el.appendChild(a);
    }

    if (opts.vscale) {
        a = document.createElementNS("http://www.w3.org/2000/svg", "g");
        a.innerHTML = vscale;
        a.classList.add("graphvscale");
        el.appendChild(a);
    }

    if (opts.hscale) {
        a = document.createElementNS("http://www.w3.org/2000/svg", "g");
        a.innerHTML = hscale;
        a.classList.add("graphhscale");
        el.appendChild(a);
    }

    if (opts.title) {
        a = document.createElementNS("http://www.w3.org/2000/svg", "text");
        a.innerHTML = htmlentities(opts.title);
        a.classList.add("graphtitle");
        a.setAttribute("x", size.width / 2);
        a.setAttribute("y", 20);
        el.appendChild(a);
    }

    if (opts.hover) {
        a = document.createElementNS("http://www.w3.org/2000/svg", "g");
        a.innerHTML = regions;
        a.classList.add("graphhover");
        a.onmouseover = function (e) { opts.hover(e) };
        el.appendChild(a);
    }
}

function pushonce(array, val) {
    if (array.indexOf(val) == -1) { array.push(val); }
}

function strcompare(first, second) {
    // Calculates the similarity between two strings  
    // discuss at: http://phpjs.org/functions/similar_text
    first += '';
    second += '';

    var pos1 = 0,
        pos2 = 0,
        max = 0,
        firstLength = first.length,
        secondLength = second.length,
        p, q, l, sum;

    max = 0;

    for (p = 0; p < firstLength; p++) {
        for (q = 0; q < secondLength; q++) {
            for (l = 0;
                (p + l < firstLength) && (q + l < secondLength) && (first.charAt(p + l) === second.charAt(q + l)); l++);
            if (l > max) {
                max = l;
                pos1 = p;
                pos2 = q;
            }
        }
    }

    sum = max;

    if (sum) {
        if (pos1 && pos2) {
            sum += this.strcompare(first.substr(0, pos2), second.substr(0, pos2));
        }

        if ((pos1 + max < firstLength) && (pos2 + max < secondLength)) {
            sum += this.strcompare(first.substr(pos1 + max, firstLength - pos1 - max), second.substr(pos2 + max, secondLength - pos2 - max));
        }
    }

    return sum;
}

function strcomparescore(foundstring, templatestr) {
    return (strcompare(foundstring.toLowerCase(), templatestr.toLowerCase()) - Math.abs(foundstring.length - templatestr.length) / 2) / foundstring.length;
}

function registerfancybutton(el) {
    if (typeof el == "string") { el = elid(el); }
    var backstr = el.style.background;
    var hover = function (e) {
        var str = ""
        if (e) { str += "radial-gradient(100px at " + e.offsetX + "px " + e.offsetY + "px, rgba(255,255,255,0.3), rgba(255,255,255,0.1)),"; }
        str += backstr;
        el.style.background = str;
    }
    el.addEventListener("mousemove", hover);
    el.addEventListener("mouseleave", function () { hover(false); });
}

function reportimagebug(image, reportname, donecb) {
    var a, b, imgdata, uploaded;

    uploaded = function (t) {
        var id;
        id = t.match(/imgid='(\w{3,5})'/);
        if (!id) { qw("Upload failed, error: " + r); return; }
        dlpagepost("/submitbug.php",
            { body: "-- automated image report --\n-- " + reportname + " --\n" + document.location.origin + "/i/" + id[1] },
            function (t) { if (donecb) { donecb(); } },
            function () { qw("error sending auto report"); });
    }

    imgdata = image.toDataURL("image/png");
    dlpagepost("/i/upload.php", { img: imgdata }, uploaded, qw("Failed to upload bug image"));
}

function getuuid() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};

function validatecloneold(obj, propstring) {
    var a, b, c, d, r, name, type, flags, val, props, types;
    //propstr format:
    //name:type[/flags],...
    //
    //type:
    //i=int
    //n=number
    //s=string
    //b=bool
    //o=obj
    //a=array
    //
    //flags:
    //o=optional

    types = {
        i: "number",
        n: "number",
        s: "string",
        b: "boolean",
        o: "object",
        a: "object"
    };

    props = [];
    propstring.replace(/(?:,\s*|^)(\w+):(\w+)(?:\/(\w+))?(?=$|,\s*)/g, function (qq, a, b, c) {
        props.push({ name: a, type: b, flags: c });
    });

    r = {};

    for (a = 0; a < props.length; a++) {
        name = props[a].name;
        type = props[a].type;
        flags = props[a].flags;

        //check value
        val = obj[name];
        if (val == undefined) {
            if (flags.indexOf("o") != -1) { continue; }
            else { throw "required property " + name + " not found"; }
        }

        if (typeof val != types[type]) {
            throw "property " + name + " is of wrong base type";
        }

        //types
        if (type == "i" || type == "n") { r[name] = (type == "i" ? Math.round(val) : val); }
        else if (type == "s") { r[name] = val; }
        else if (type == "b") { r[name] = val; }
        else if (type == "o") {
            if (Array.isArray(val)) { throw "object " + name + " is in fact an array"; }
            r[name] = val;
        }
        else if (type == "a") {
            if (!Array.isArray(val)) { throw "property " + name + " is an object instead of array"; }
            r[name] = val;
        }
    }

    return r;
}



function validateclone(obj, str) {
    var a, b, c;
    //flags
    //o optional
    //d defaults to empty value of currect type if not found
    //n defaults to null if not found
    //a is an array of this type
    //m is a mapped object with any number of properties of the given type

    //unfinished js object validater
    var types = {
        i: "number",
        n: "number",
        s: "string",
        b: "boolean",
        o: "object",
        a: "object",
        parsedobj: "object",
        parsedarray: "object"
    };
    var defaults = {
        i: function () { return 0; },
        n: function () { return 0; },
        s: function () { return ""; },
        b: function () { return false; },
        o: function () { return {}; },
        a: function () { return []; },
        parsedobj: function () { return {}; },
        parsedarray: function () { return []; }
    };

    var parsegroup = function (str, offset) {
        var a, b, substr, orcount;
        var props = {};
        orcount = 0;

        var i = offset;
        while (true) {
            substr = str.slice(i);

            //discard comma's
            if (a = substr.match(/^\s*,/)) {
                i = i + a[0].length;
                continue;
            }

            //property
            if (a = substr.match(/^\s*(\w+):/)) {
                b = parseprop(str, a[1], i + a[0].length);
                i = b.i;
                b.orgroup = orcount;
                props[a[1]] = b;
                continue;
            }

            //or operator, check values and possibly do second part
            if (a = substr.match(/^\s*\|/)) {
                orcount++;
                i += a[0].length;
                continue;
            }

            //opening brace, start subquery
            if (a = substr.match(/^\s*\(/)) {
                b = parsegroup(str, i + a[0].length);
                b.orgroup = orcount;
                b.flags = "";
                props["group" + i] = b;
                i = b.i;
                continue;
            }

            //closing (curly) brace/bracket or end of string, return
            if ((a = substr.match(/^\s*(\)|\]|\})/)) || (a = substr.match(/\s*$/))) {
                return { type: "propgroup", i: i + a[0].length, props: props, orcount: orcount };
            }

            throw "no tokens matched at index " + i + ", '" + substr.slice(0, 20) + "'";
        }
    }

    var parseprop = function (str, propname, offset) {
        var a, b, c, substr, type, flags, sub, i;
        substr = str.slice(offset);

        //primitive type
        if (a = substr.match(/^\s*(\w+)/)) {
            type = a[1];
            i = offset + a[0].length;
        }

        //object type
        if (a = substr.match(/^\s*\{/)) {
            sub = parsegroup(str, offset + a[0].length);
            type = "parsedobj";
            i = sub.i;
        }

        if (!type) { throw "property not recognised near: " + substr.slice(0, 10); }

        //flags
        if (a = str.slice(i).match(/^\s*\/(\w+)/)) {
            flags = a[1];
            i += a[0].length;
        }
        else { flags = ""; }

        return { i: i, name: propname, type: type, sub: sub, flags: flags };
    }

    var execute = function (obj, propdata) {
        var a, b, c, d, r, orgroup, valid, prop, error;
        if (propdata.type != "propgroup") { return executeprop(obj, propdata); }

        for (orgroup = 0; orgroup <= propdata.orcount; orgroup++) {
            r = {};
            valid = true;
            for (a in propdata.props) {
                prop = propdata.props[a];
                if (prop.orgroup != orgroup) { continue; }

                b = execute(obj, prop);
                if (typeof b != "object") {
                    if (prop.flags.indexOf("o") != -1) { continue; }//skip if optional [o]
                    else if (prop.flags.indexOf("d") != -1 && defaults[prop.type]) { b = { val: defaults[prop.type]() }; }//assign default value if default tag [d]
                    else if (prop.flags.indexOf("n") != -1) { b = { val: null }; }//assign null if nullable tag [n]
                    else { error = b; valid = false; break; }//cancel parsing otherwise
                }

                if (prop.type == "propgroup") { applyobject(r, b.val) }
                else { r[prop.name] = b.val; }
            }
            if (valid) { break; }
        }

        if (valid) { return { val: r }; }
        else { return error; }
    }

    var checktype = function (rawval, type) {
        if (rawval === null) { return false; }
        if (typeof rawval != types[type]) { return false; }
        if ((type == "o" || type == "parsedobj") && Array.isArray(rawval)) { return false; }
        if ((type == "a" || type == "parsedarray") && !Array.isArray(rawval)) { return false; }
        return true;
    }

    var executeprop = function (obj, prop) {
        var a, b, c, d, valid, rawval, val, type;

        type = prop.type;

        if (prop.flags.indexOf("a") != -1) {
            if (!obj.hasOwnProperty(prop.name)) { return "property '" + prop.name + "' is not an own property of the object."; }
            rawval = obj[prop.name];

            if (!checktype(rawval, "parsedarray")) { return "property '" + prop.name + "' is not an array"; }

            val = [];
            for (b = 0; b < rawval.length; b++) {
                if (rawval[b] === undefined) { throw "missing array index " + b + " in property: " + prop.name; }
                if (!checktype(rawval[b], prop.type)) { return "index " + b + " in array is of wrong type"; }
                a = executepropinner(type, rawval[b], prop);
                if (typeof a != "object") { throw "invalid array index " + b + ", error: " + a; }
                val[b] = a.val;
            }
            return { val: val };
        }
        else if (prop.flags.indexOf("m") != -1) {//mapped object
            if (!obj.hasOwnProperty(prop.name)) { return "property '" + prop.name + "' is not an own property of the object."; }
            rawval = obj[prop.name];

            if (!checktype(rawval, "parsedobj")) { return "property '" + prop.name + "' is not a mapped object"; }

            val = {};
            for (b in rawval) {
                if (!rawval.hasOwnProperty(b)) { continue; }
                if (b.match(/\W/)) { throw "invalid obj map property name in map: " + prop.name; }
                if (rawval[b] === undefined) { throw "missing obj map index " + b + " in property: " + prop.name; }
                if (!checktype(rawval[b], prop.type)) { return "property " + b + " in mapped object is of wrong type"; }
                a = executepropinner(type, rawval[b], prop);
                if (typeof a != "object") { throw "invalid array index " + b + ", error" + a; }
                val[b] = a.val;
            }
            return { val: val };
        }
        else {
            if (!obj.hasOwnProperty(prop.name)) { return "property '" + prop.name + "' is not an own property of the object."; }
            rawval = obj[prop.name];
            if (!checktype(rawval, prop.type)) { return "property '" + prop.name + "' is of the wrong type."; }

            return executepropinner(type, rawval, prop);
        }
    }

    var executepropinner = function (type, rawval, prop) {
        var a, b, val;

        //types
        if (type == "i") { val = Math.round(rawval); }
        else if (type == "n") { val = rawval; }
        else if (type == "s") { val = rawval; }
        else if (type == "b") { val = rawval; }
        else if (type == "o") { val = rawval; }
        else if (type == "a") { val = rawval; }
        else if (type == "parsedobj") {
            a = execute(rawval, prop.sub);
            if (typeof a != "object") { throw "Parse failed in subobject, error: " + a; }
            val = a.val;
        }

        return { val: val };
    }

    var props = parseprop(str, "root", 0);
    if (!props) { return false; }
    try { a = execute({ root: obj }, props); }
    catch (b) { qw("Failed to validate object, error: " + b); return false; }
    if (typeof a != "object") { qw("Failed to validate object, error: " + a); return false; }
    return a.val;
}

function stringdownload(filename, text) {
    filedownload(filename, 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
}

function filedownload(filename, url) {
    var element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function fancycopy(copy, title) {
    var parser, outer, textarea;

    str = '\
	<div style="position:fixed; top:30px; left:10%; right:10%; z-index:100000;">\
		<div style="border-radius:7px; background:#CCC; color:#000; font-family:sans-serif; font-size:13px; display:flex; flex-direction:column; padding:5px;">\
			<div>Copy the text above and save it to a file.</div>\
			<textarea style="margin-top:5px; height:60px; resize:none; box-sizing:border-box; overflow-x:hidden;" readonly></textarea>\
			<div style="margin-top:5px; text-align:center; cursor:pointer;" class="sliminput" onclick="this.parentElement.parentElement.remove();">Close</div>\
		</div>\
	</div>';

    parser = new DOMParser();
    outer = parser.parseFromString(str, "text/html").getElementsByTagName("body")[0].children[0];
    outer.querySelector("div>div>div").innerHTML = title || "Press ctrl+V to copy the text below";
    textarea = outer.querySelector("textarea");
    textarea.innerHTML = escapehtml(copy);

    outer.onclick = textarea.onselectstart = function () { textarea.focus(); textarea.select(); event.preventDefault(); };

    document.body.appendChild(outer);
    textarea.focus();
    return outer;
}

function exportlocalstorage(pre) {
    var a, b;
    b = {};
    for (a in localStorage) {
        if (!pre || a.indexOf(pre) == 0) { b[a] = localStorage[a]; }
    }
    return JSON.stringify(b);
}

function importlocalstorage(str) {
    var a, b;
    if (typeof str == "string") { a = JSON.parse(str); }
    else { a = str; }
    for (b in a) {
        localStorage[a] = b;
    }
}

function pagepopup(pagename, w, h) {
    return window.open(location.origin + "/apps/alt1/help/" + pagename, null, "width=" + w + ",height=" + h);
}

function readstorage(key, fallback) {
    if (localStorage[key]) { return localStorage[key]; }
    return fallback;
}

function elcreate(tagname, classname, stylestr, attr, children) {
    var el = document.createElement(tagname);
    if (classname) {
        el.className = classname;
    }
    if (stylestr) {
        el.style.cssText = stylestr;
    }
    if (attr) {
        for (var a in attr) {
            if (attr[a] === false || attr[a] == null) { continue; }
            el.setAttribute(a, attr[a]);
        }
    }
    if (children != null && children != undefined) {
        if (!Array.isArray(children)) { children = [children]; }
        for (var a in children) {
            if (typeof children[a] != "object") { el.appendChild(document.createTextNode(children[a].toString())); }
            else { el.appendChild(children[a]); }
        }
    }
    return el;
}

function eldiv(strClass, objAttr, arrayChildren) {
    var classname, attr, children, tag, tagarg, el, childfrag;
    //reorder arguments
    var argi = 0;
    if (typeof arguments[argi] == "string") {
        var typedata = arguments[argi++].split(":");
        classname = typedata[0];
        var tagdata = typedata[1] ? typedata[1].split("/") : [];
        tag = tagdata[0];
        tagarg = tagdata[1];
    }
    if (typeof arguments[argi] == "object" && !Array.isArray(arguments[argi]) && !(arguments[argi] instanceof DocumentFragment)) { attr = arguments[argi++]; }
    if (typeof arguments[argi] == "object" && Array.isArray(arguments[argi])) { children = arguments[argi++]; }
    else if (typeof arguments[argi] == "object" && arguments[argi] instanceof DocumentFragment) { childfrag = arguments[argi++]; }
    attr = attr || {};
    if (classname) { attr["class"] = classname; }

    //start actual work
    tag = attr && attr.tag || tag || "div";
    if (tag == "input" && tagarg) { attr.type = tagarg; }
    if (tag == "frag") { el = document.createDocumentFragment(); }
    else {
        var el = (attr && attr.namespace ? document.createElementNS(attr.namespace, tag) : document.createElement(tag));
    }
    if (attr) {
        for (var a in attr) {
            if (attr[a] === false || attr[a] == null || a == "tag" || a == "namespace") { continue; }
            if (a.substr(0, 2) == "on") { el[a] = attr[a]; }
            else { el.setAttribute(a, attr[a]); }
        }
    }
    if (children != null && children != undefined) {
        if (!Array.isArray(children)) { children = [children]; }
        for (var a in children) {
            if (children[a] == null) { continue; }
            if (typeof children[a] != "object") { el.appendChild(document.createTextNode(children[a].toString())); }
            else { el.appendChild(children[a]); }
        }
    }
    else if (childfrag != null) {
        el.appendChild(childfrag);
    }
    return el;
}

function elfrag() {
    var el = document.createDocumentFragment();
    for (var a = 0; a < arguments.length; a++) {
        if (arguments[a] == null) { continue; }
        if (typeof arguments[a] != "object") { el.appendChild(document.createTextNode(arguments[a].toString())); }
        else { el.appendChild(arguments[a]); }
    }
    return el;
}

function elselect(obj, selected) {
    var frag = document.createDocumentFragment();
    var add = function (value, name) { frag.appendChild(eldiv({ tag: "option", value: value, selected: selected == value ? "" : null }, [name])); }
    if (Array.isArray(obj)) { for (var a = 0; a < obj.length; a++) { add(a, obj[a]); } }
    else { for (var a in obj) { add(a, obj[a]); } }
    return frag;
}

function bindAutoComplete(el, func) {
    if (typeof el == "string") { el = elid(el); }
    var scope = {};
    el.suggest = scope;
    scope.optel = null;
    scope.selectindex = -1;
    scope.suggests = null;
    scope.wordindex = 0;
    scope.words = [];
    scope.originalword = "";

    //options
    scope.autohide = true;
    scope.singleword = false;

    //allow array of words input
    if (Array.isArray(func)) {
        var wordarr = func;
        func = function (t, el) { return wordarr.filter(function (w) { return w.indexOf(t) != -1 }).map(function (w) { return { t: w } }); };
    }

    scope.obtainSuggests = function () {
        if (scope.singleword) {
            scope.words = [el.value];
            scope.wordindex = 0;
        }
        else {
            scope.words = el.value.split(" ");
            scope.wordindex = 0;
            for (var a = 0, l = 0; a < scope.words.length; a++) {
                scope.wordindex = a;
                l += scope.words[a].length;
                if (l > el.selectionStart) { break; }
            }
        }
        scope.originalword = scope.words[scope.wordindex];
        var r = func(scope.originalword, el);
        if (r) { scope.setSuggests(r); }
    }

    scope.setSuggests = function (suggests) {
        if (scope.optel) { scope.optel.remove(); scope.optel = null; }
        if (!suggests || suggests.length == 0) { scope.suggests = null; return; }
        if (suggests && suggests.length > 15) { suggests.length = 15; }
        scope.suggests = suggests;
        scope.selectindex = -1;
        scope.optel = scope.optel || elcreate("div", "insg-opts");
        scope.optel.innerHTML = "";
        for (var a = 0; a < suggests.length; a++) {
            var opt = eldiv("insg-opt", [suggests[a].t, (suggests[a].n ? eldiv("insg-opt-n", [suggests[a].n]) : null)]);
            opt.onclick = function (str) { scope.insertSuggestion(str); el.focus(); }.bind(null, suggests[a].t);
            scope.optel.appendChild(opt);
        }
        el.parentElement.appendChild(scope.optel);
    }

    scope.selectSuggestion = function (index) {
        if (!scope.optel) { return; }
        if (!scope.suggests) { return; }
        index = Math.max(-1, Math.min(scope.suggests.length - 1, index));
        scope.selectindex = index;
        var els = scope.optel.children;
        for (var a = 0; a < els.length; a++) {
            els[a].classList.remove("selected");
        }
        if (scope.selectindex != -1 && els[scope.selectindex]) {
            els[scope.selectindex].classList.add("selected");
            els[scope.selectindex].focus();
        }
        var suggestedword = (scope.selectindex == -1 ? scope.originalword : scope.suggests[scope.selectindex].t);
        scope.words[scope.wordindex] = suggestedword;
        var offset = 0;
        for (var a = 0; a < scope.wordindex; a++) { offset += scope.words[a].length + 1; }
        var selend = offset + suggestedword.length;
        var selstart = 0;
        if (scope.originalword.toLocaleLowerCase().replace(/ /g, "_") == suggestedword.slice(0, scope.originalword.length).toLowerCase().replace(/ /g, "_")) {
            selstart = offset + scope.originalword.length;
        }
        else {
            selstart = offset;
        }

        el.value = scope.words.join(" ");
        el.selectionStart = selstart;
        el.selectionEnd = selend;
    }

    scope.insertSuggestion = function (str) {
        if (!str) {
            if (scope.selectindex == -1) {
                scope.setSuggests(null);
                return;
            }
            str = scope.suggests[scope.selectindex].t;
        }
        scope.selectindex = -1;
        scope.words[scope.wordindex] = str;
        el.value = scope.words.join(" ");
        el.selectionStart = el.selectionEnd;
        scope.setSuggests(null);
    }

    el.addEventListener("input", scope.obtainSuggests);

    el.addEventListener("blur", function (e) {
        if (scope.autohide) { setTimeout(scope.setSuggests.bind(null, null), 500); }
    });

    el.addEventListener("keydown", function (e) {
        if (e.keyCode == 32 && e.ctrlKey) { scope.obtainSuggests(); e.preventDefault(); }
        if (e.keyCode == 40 && !scope.suggests) { scope.obtainSuggests(); }
        if (e.keyCode == 40 && scope.suggests) { scope.selectSuggestion(scope.selectindex + 1); e.preventDefault(); }
        if (e.keyCode == 38 && scope.suggests) { scope.selectSuggestion(scope.selectindex - 1); e.preventDefault(); }
        if (e.keyCode == 39 && scope.suggests && scope.suggests.length > 0) { scope.insertSuggestion(); scope.obtainSuggests(); }
        if (e.keyCode == 9 && scope.suggests && scope.suggests.length > 0) { scope.insertSuggestion(); e.preventDefault(); }
        if (e.keyCode == 13 && scope.suggests && scope.suggests.length > 0) { scope.insertSuggestion(); e.preventDefault(); }
        if (e.keyCode == 27) { scope.setSuggests(null); el.value = el.value.slice(0, el.selectionStart); }
    });
    return scope;
}

function elclear(el) {
    if (typeof el == "string") { el = elid(el); }
    while (el.firstChild) { el.removeChild(el.firstChild); }
}

function elput(el, content) {
    if (typeof el == "string") { el = elid(el); }
    elclear(el);
    el.appendChild(content);
}

function jsonDecode(str) {
    if (str == "") { return null; }
    try { return JSON.parse(str); }
    catch (e) { return null; }
}

function jsonEncode(obj, pretty) {
    return JSON.stringify(obj, pretty ? 2 : 0);
}

RsApi = (function () {
    hiscore = function (player, callback) {
        dlpage("/data/getstats.php?player=" + lowname(player), function (t) {
            var obj = jsonDecode(t);
            if (!obj) { callback(false, player); return; }
            callback(obj, player);
        }, function () { callback(false, player); });
    }

    return { hiscore: hiscore };
})();

Object.defineProperty(Function.prototype, "b", {
    value: function () {
        //sick of typing null and not being able to use .bind on variable argument functions in events
        var args = arguments, me = this;
        return function () {
            return me.apply(null, args);
        };
    }
});

Object.defineProperty(Array.prototype, "bind", {
    value: function () {
        //ok this is is kinda lazy
        var args = arguments, me = this;
        return function () {
            for (var a = 0; a < me.length; a++) {
                me[a].apply(this, args);
            }
        }
    }
});

function randomint(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
}

function propnameOf(obj, prop) {
    for (var a in obj) { if (obj[a] == prop) { return a; } }
    return null;
}

function absoluteUrl(href) {
    //http://stackoverflow.com/questions/14780350/convert-relative-path-to-absolute-using-javascript
    var link = document.createElement("a");
    link.href = href;
    return (link.protocol + "//" + link.host + link.pathname + link.search + link.hash);
}

function isBetween(n, min, max) {
    if (isNaN(n)) { return false; }
    if (n < min) { return false; }
    if (n > max) { return false; }
    return true;
}

function repeatStr(str, n) {
    var r = "";
    for (var a = 0; a < n; a++) { r += str; }
    return r;
}

function completePromises(proms) {
    return Promise.all(proms.map(function (p) { return p.catch(function (e) { return e; }) }));
}

function startGA() {
    if (!window._gaq && (document.location.host == "runeapps.org" || window.testGA)) {
        window._gaq = window._gaq || [];
        _gaq.push(['_setAccount', 'UA-29246134-1']);
        (function () {
            var ga = document.createElement('script');
            ga.type = 'text/javascript';
            ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'https://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(ga, s);
        })();
    }
}

if (window == top) { setTimeout(sendGA.b(), 1000); }
function sendGA(page) {
    if (document.location.host == "runeapps.org" || window.testGA) {
        startGA();
        if (!page) { _gaq.push(["_trackPageview"]); }
        else { _gaq.push(['_trackPageview', page]) }
    }
}

//depricated //TODO remove
function onPageReady(cb, waitstorage) {
    waitstorage = false;//TODO what the hell do i do with this
    var called = false;
    var changed = function () {
        if (called) { return; }
        if (document.readyState != "complete" && document.readyState != "interactive") { return; }
        if (waitstorage && !initStorage.ready) { return; }
        called = true;
        cb();
    }
    changed();
    window.addEventListener("DOMContentLoaded", changed);
    if (waitstorage) { initStorage(changed); }
}

initStorage.ready = false;
initStorage.loading = false;
function initStorage(cb) {
    if (document.location.protocol == "http:" || localStorage.protocol_imported_http) {
        initStorage.ready = true;
        cb();
        return;
    }
    if (initStorage.loading) { return; }
    initStorage.loading = true;
    var usewindow = true;

    var onmessage = function (e) {
        if (e.origin != origin) { return; }
        if (e.data.slice(0, tag.length) != tag) { return; }
        var json = e.data.slice(tag.length);
        var obj = jsonDecode(json);
        for (var a in obj) {
            if (localStorage[a] == null) { localStorage[a] = obj[a]; }
        }
        window.removeEventListener("message", onmessage);
        if (!usewindow) { document.remove(el); }
        else { el.close(); }
        localStorage["protocol_imported_" + protocol] = "true";
        qw("imported localstorage from " + protocol);
        initStorage.ready = true;
        cb();
    };

    var protocol = "http";
    var tag = "localstoragedump:";
    var origin = protocol + "://" + document.location.hostname;
    var url = origin + "/exportstorage.html";
    var el = null;
    if (!usewindow) {
        el = eldiv(":iframe", { style: "display:none;", src: url });
        onPageReady(function () { document.body.appendChild(el); });
    }
    else {
        el = window.open(url);
    }

    window.addEventListener("message", onmessage);

}