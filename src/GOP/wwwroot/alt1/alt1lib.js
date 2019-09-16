/// <reference path="runeappslib.js">
/// <reference path="imagedetect.js">
/// <reference path="apps/alt1/alt1doc.js">

//This library provides a set of wrapper functions to be used with alt1
//
//This library is free to use by anyone who obtains the code etc etc as-is no guaranties etc etc (i'll figure out the copyright stuff some time)
//
//Please contact me if you plan to develop something for alt1, I'll be happy to help out
//in-game: Skillbert
//reddit: skillbert_ii
//or in the shoutbox on runeapps.org
//

//define library base object
let a1lib = {};

//latest release int
a1lib.newestversionint = 1005000;
a1lib.newestversion = "1.5.0";

//data names from hiscore api: hiscore.runescape.com/index_lite.ws?player=zezima
//levels can be calculated with a1lib.xptolvl(xp)
a1lib.hslitenames = ["totra", "totlv", "totxp", "attra", "-----", "attxp", "defra", "-----", "defxp", "strra", "-----", "strxp", "hpxra", "-----", "hpxxp", "ranra", "-----", "ranxp", "prara", "-----", "praxp", "magra", "-----", "magxp", "coora", "-----", "cooxp", "woora", "-----", "wooxp", "flera", "-----", "flexp", "fisra", "-----", "fisxp", "firra", "-----", "firxp", "crara", "-----", "craxp", "smira", "-----", "smixp", "minra", "-----", "minxp", "herra", "-----", "herxp", "agira", "-----", "agixp", "thira", "-----", "thixp", "slara", "-----", "slaxp", "farra", "-----", "farxp", "runra", "-----", "runxp", "hunra", "-----", "hunxp", "conra", "-----", "conxp", "sumra", "-----", "sumxp", "dunra", "-----", "dunxp", "divra", "-----", "divxp", "invra", "-----", "invxp", "-----", "-----", "-----", "-----", "domra", "domsc", "crura", "crusc", "casra", "cassc", "baara", "baasc", "badra", "badsc", "bacra", "bacsc", "bahra", "bahsc", "-----", "-----", "mobra", "mobsc", "cnqra", "cnqsc", "fogra", "fogsc", "-----", "-----", "-----", "-----", "-----", "-----", "-----", "-----", "-----", "-----", "-----", "-----", "-----", "-----", "-----", "-----"];

//max amount of bytes that can be sent by alt1 in one function
a1lib.maxtransfer = 4000000;//will be defined as alt1.maxtransfer in 0.0.1

//window tracking interval
a1lib.trackinterval = (window.alt1 && alt1.captureInterval) || 300;

//Open a link in the default browser
a1lib.openbrowser = function (url) {
    if (window.alt1) {
        alt1.openBrowser(url);
    }
    else {
        window.open(url, '_blank');
    }
}

//returns an object with a rectangle that spans all screens
a1lib.getdisplaybounds = function () {
    if (!window.alt1) { return false; }
    return new Rect(alt1.screenX, alt1.screenY, alt1.screenWidth, alt1.screenHeight);
}

//gets a players stats from the hiscores
a1lib.getstats = function (player, callback) {
    a1lib.dlpage("/data/getstats.php?player=" + a1lib.lowname(player), function (t) {
        var a, b, r;
        if (t.indexOf("Fatal error") != -1) { callback(false, player); return; }
        r = JSON.parse(t);
        callback(r, player);
    }, function () { callback(false, player); });
}

//gets an imagebuffer with pixel data about the requested region
a1lib.getregion = function (x, y, w, h) {
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);
    if (!window.alt1) { return null; }

    var r = new ImageData(w, h);
    r.x = x;
    r.y = y;

    if (w * h * 4 <= a1lib.maxtransfer) {
        var data = alt1.getRegion(x, y, w, h);
        if (!data) { return null; }
        a1lib.alt1imgdecode(data, r, x, y, w, h);
    }
    else {
        //split up the request to to exceed the single transfer limit (for now)
        var x1 = x;
        var ref = alt1.bindRegion(x, y, w, h);
        if (ref <= 0) { return null; }
        while (x1 < x + w) {
            var x2 = Math.min(x + w, Math.floor(x1 + (a1lib.maxtransfer / 4 / h)));
            var data = alt1.bindGetRegion(ref, x1 - x, 0, x2 - x1, h);
            if (!data) { return null; }
            a1lib.alt1imgdecode(data, r, x1, y, x2 - x1, h);
            x1 = x2;
        }
    }
    return r;
}

//makes alt1 bind an area of the rs client in memory without sending it to the js client
//returns an imgref object which can be used to get pixel data using the imgreftobuf function
//currently only one bind can exist per app and the ref in (v) will always be 1
a1lib.bindregion = function (x, y, w, h) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    var r, outrect;
    if (!window.alt1) { return false; }
    r = alt1.bindRegion(x, y, w, h);
    if (r <= 0) { return false; }
    outrect = new Rect(x, y, w, h);
    return new ImgRefBind(r, outrect);
}

//same as bindregion, but captures the screen instead of the rs client. it also uses screen coordinates instead
a1lib.bindscreenregion = function (x, y, w, h) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    var r, outrect;
    if (!window.alt1) { return false; }
    r = alt1.bindScreenRegion(x, y, w, h);
    if (r <= 0) { return false; }
    outrect = new Rect(x, y, w, h);
    return new ImgRefBind(r, outrect);
}

//similar to bindregion, but binds the full screen
a1lib.bindfullscreen = function () {
    var data;
    if (!window.alt1) { return false; }

    //== bind full screen ==
    return a1lib.bindregion(alt1.screenX, alt1.screenY, alt1.screenWidth, alt1.screenHeight);
}

//bind the full rs window if the rs window can be detected by alt1, otherwise return the full screen
a1lib.bindfullrs = function () {
    if (a1lib.aboveversion("1.1.0")) { return a1lib.bindregion(0, 0, alt1.rsWidth, alt1.rsHeight); }
    else { return a1lib.bindfullscreen(); }
}

//returns a subregion from a bound image
//used internally in imgreftobuf if imgref is a bound image
a1lib.bindgetregion = function (handle, x, y, w, h) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    var a, x1, x2, r;
    if (!window.alt1) { return false; }

    r = new ImageData(w, h);
    //TODO see if we can remove these
    r.x = x;
    r.y = y;

    x1 = x;
    while (true) {//split up the request to to exceed the single transfer limit (for now)
        x2 = Math.min(x + w, Math.floor(x1 + (a1lib.maxtransfer / 4 / h)));
        a = alt1.bindGetRegion(handle, x1, y, x2 - x1, h);
        if (!a) { debugger; return false; }
        a1lib.alt1imgdecode(a, r, x1, y, x2 - x1, h);
        x1 = x2;
        if (x1 == x + w) { break; };
    }
    return r;
}

//decodes a returned string from alt1 to an imagebuffer
a1lib.alt1imgdecode = function (str, r, x, y, w, h) {
    "use strict";
    var bin = atob(str);

    if (!r) {
        r = new ImageData(w, h);
        r.x = x;
        r.y = y;
    }
    var bytes = r.data;

    w |= 0;
    h |= 0;
    var offset = 4 * (x - r.x) + 4 * (y - r.y) * r.width;
    for (var a = 0; a < w; a++) {
        for (var b = 0; b < h; b++) {
            var i1 = (offset + (a * 4 | 0) + (b * r.width * 4 | 0)) | 0;
            var i2 = ((a * 4 | 0) + (b * 4 * w | 0)) | 0;
            bytes[i1 + 0 | 0] = bin.charCodeAt(i2 + 2 | 0);//fix weird red/blue swap in c#
            bytes[i1 + 1 | 0] = bin.charCodeAt(i2 + 1 | 0);
            bytes[i1 + 2 | 0] = bin.charCodeAt(i2 + 0 | 0);
            bytes[i1 + 3 | 0] = bin.charCodeAt(i2 + 3 | 0);
        }
    }
    return r;
}

//encodes an imagebuffer to a string
a1lib.alt1imgencode = function (buf, sx, sy, sw, sh) {
    if (sx == undefined) { sx = 0; sy = 0; sw = buf.width; sh = buf.height; }
    var raw = "";
    for (var y = sy; y < sy + sh; y++) {
        for (var x = sx; x < sx + sw; x++) {
            var i = 4 * x + 4 * buf.width * y;
            raw += String.fromCharCode(buf.data[i + 2]);
            raw += String.fromCharCode(buf.data[i + 1]);
            raw += String.fromCharCode(buf.data[i + 0]);
            raw += String.fromCharCode(buf.data[i + 3]);
        }
    }
    return btoa(raw);
}

//fixes glitch where chromium doesnt change scrollbar when style is applied by adding a class
a1lib.resetscroll = function () {
    document.body.classList.add("scrollreset");
    setTimeout(function () { document.body.classList.remove("scrollreset"); }, 50);
}

//calculates the average color of an area in a imagedata object
//used in a1lib.tiledata
a1lib.coloravg = function (buf, x, y, w, h) {
    var a, c, r, g, b, i;

    r = 0;
    g = 0;
    b = 0;
    for (a = x; a < x + w; a++) {
        for (c = y; c < y + h; c++) {
            i = 4 * buf.width * c + 4 * a;
            r += buf.data[i];
            g += buf.data[i + 1]
            b += buf.data[i + 2];
        }
    }
    r /= w * h;
    g /= w * h;
    b /= w * h;
    return [r, g, b];
}

//calculates the total amount of difference between adjecent pixels
//used in a1lib.tiledata
a1lib.colordifsum = function (buf, x, y, w, h) {
    var a, b, c, s, i, row, column;

    row = 4 * buf.width;
    column = 4;
    s = 0;
    for (a = x; a < x + w; a++) {
        for (c = y; c < y + h; c++) {
            i = row * c + column * a;
            s += Math.abs(buf.data[i] - buf.data[i + column]);
            s += Math.abs(buf.data[i] - buf.data[i + row]);
            s += Math.abs(buf.data[i + 1] - buf.data[i + 1 + column]);
            s += Math.abs(buf.data[i + 1] - buf.data[i + 1 + row]);
            s += Math.abs(buf.data[i + 2] - buf.data[i + 2 + column]);
            s += Math.abs(buf.data[i + 2] - buf.data[i + 2 + row]);
        }
    }
    return s;
}

//calculates a pattern from a buffer to compare to other buffers
//currently experimental, did wonders on slide puzzle tiles
a1lib.tiledata = function (buf, rw, rh, x, y, w, h) {
    var a, b, c, d, e, xx, yy, basecol, r, cx, cy, i;

    basecol = rgbtohsl(a1lib.coloravg(buf, x, y, w, h));
    r = [basecol[0], basecol[1], basecol[2]];
    for (cx = 0; (cx + 1) * rw <= w; cx++) {
        xx = x + cx * rw;
        for (cy = 0; (cy + 1) * rh <= h; cy++) {
            yy = y + cy * rh;
            i = cx * 5 + cy * Math.floor(w / rw) * 5 + 3;
            b = rgbtohsl(a1lib.coloravg(buf, xx, yy, rw, rh));
            r[i + 0] = b[0];//hue
            if (r[i + 0] > 128) { r[i + 1] -= 256; }
            if (r[i + 0] < -128) { r[i + 1] += 256; }
            r[i + 1] = b[1];//sat
            r[i + 2] = basecol[2] - b[2];//lum
            r[i + 3] = Math.floor(a1lib.colordifsum(buf, xx + 1, yy + 1, rw - 2, rh - 2) / rw / rh);//min roughtness (border -1 px)
            r[i + 4] = Math.floor(a1lib.colordifsum(buf, xx, yy, rw, rh) / rw / rh);//max roughness (full square)
        }
    }
    return r;
}

//compares 2 tiledata objects and returns a match score
a1lib.comparetiledata = function (data1, data2) {//compares two tiledata sets
    var a, b, c, d, r;
    r = 0;
    c = Math.abs(data1[0] - data2[0]);
    r += Math.max(0, (c > 128 ? 255 - c : c) * 5 - 100);//basecol hue
    r += Math.max(0, Math.abs(data1[1] - data2[1]) * 5 - 100);//basecol sat

    for (a = 3; a < data1.length; a += 5) {
        b = 0;
        c = Math.abs(data1[a] - data2[a]);//hue
        b += (c > 128 ? 255 - c : c) * Math.max(data1[a], data2[a]) / 255;
        b += Math.abs(data1[a + 1] - data2[a + 1]);//sat

        b += Math.max(0, data1[a + 3] - data2[a + 4]) * 100;//more roughness
        b += Math.max(0, data2[a + 3] - data1[a + 4]) * 100;//less roughness

        r += b;
    }
    return r;
}

//mixes the given color into a single int. This format is used by alt1
a1lib.mixcolor = function (r, g, b, a) {
    if (a == undefined) { a = 255; }
    return (b << 0) + (g << 8) + (r << 16) + (a << 24);
}

//finds the given needle ImageBuffer in the given haystack ImgRef this function uses the best optimized available
//code depending on the type of the haystack. It will use fast c# searching if the haystack is an ImgRefBind, js searching
//is used otherwise.
//the checklist argument is no longer used and should ignored or null/undefined
//The optional sx,sy,sw,sh arguments indicate a bounding rectangle in which to search the needle. The rectangle should be bigger than the needle
//A list of points where the needle is found is returned. This list is empty is the needle is not found.
a1lib.findsubimg = function (haystackImgref, needleBuffer, obsoleted, sx, sy, sw, sh) {
    var a, b, c, d, bigbuf, go, max, cx, cy, x, y, r;
    if (!haystackImgref) { console.log("Warning - no large image provided in a1lib.findsubimg."); return false; }
    if (!needleBuffer) { console.log("Warning - no small searchimg provided in a1lib.findsubimg."); return false; }

    max = a1lib.simplecomparemax;

    //optional args
    if (sx == undefined) { sx = 0; }
    if (sy == undefined) { sy = 0; }
    if (sw == undefined) { sw = haystackImgref.width; }
    if (sh == undefined) { sh = haystackImgref.height; }

    //check if we can do this in alt1
    if (haystackImgref.t == "bind" && window.alt1 && alt1.bindFindSubImg) {
        a = a1lib.alt1imgencode(needleBuffer);
        r = alt1.bindFindSubImg(haystackImgref.handle, a, needleBuffer.width, sx, sy, sw, sh);
        r = JSON.parse(r);
        if (!r) { return false; }
        for (a in r) {
            r[a].x += haystackImgref.x;
            r[a].y += haystackImgref.y;
        }
        return r;
    }

    if (haystackImgref instanceof ImageData) { bigbuf = haystackImgref; }
    else { bigbuf = haystackImgref.toData(); }

    r = [];

    return a1lib.findsubbuffer(bigbuf, needleBuffer, sx, sy, sw, sh);
}

//Uses js to find the given needle ImageBuffer in the given haystack ImageBuffer. It is better to use the alt1.bind- functions in
//combination with a1lib.findsubimg.
//the optional sx,sy,sw,sh arguments indicate a bounding rectangle in which to search.
//A list of points where the needle is found is returned. This list is empty is the needle is not found.
a1lib.findsubbuffer = function (haystack, needle, sx, sy, sw, sh) {
    "use strict";
    if (sx == null) { sx = 0; }
    if (sy == null) { sy = 0; }
    if (sw == null) { sw = haystack.width; }
    if (sh == null) { sh = haystack.height; }

    var r = [];
    var maxdif = 30;
    var maxresults = 50;
    var needlestride = needle.width * 4;
    var heystackstride = haystack.width * 4;

    //built list of non trans pixel to check
    var checkList = [];
    for (var x = 0; x < needle.width; x++) {
        for (var y = 0; y < needle.height; y++) {
            var i = x * 4 + y * needlestride;
            if (needle.data[i + 3] == 255) { checkList.push({ x: x, y: y }); }
            if (checkList.length == 10) { break; }
        }
        if (checkList.length == 10) { break; }
    }

    var cw = (sx + sw) - needle.width;
    var ch = (sy + sh) - needle.height;
    var checklength = checkList.length;
    for (var x = sx; x <= cw; x++) {
        for (var y = sy; y <= ch; y++) {
            var next = false;
            for (var a = 0; a < checklength; a++) {
                if (a > 3) {
                    var q = 1;
                }
                var i1 = (x + checkList[a].x) * 4 + (y + checkList[a].y) * heystackstride;
                var i2 = checkList[a].x * 4 + checkList[a].y * needlestride;
                if (a1lib.coldif(haystack.data[i1], haystack.data[i1 + 1], haystack.data[i1 + 2], haystack.data[i1 + 3], needle.data[i2], needle.data[i2 + 1], needle.data[i2 + 2], needle.data[i2 + 3]) > maxdif) {
                    next = true;
                    break;
                }
            }
            if (next) { continue; }
            if (a1lib.simplecompare(haystack, needle, x, y, maxdif) !== false) {
                r.push({ x: x, y: y });
                if (r.length > maxresults) { return r; }
            }
        }
    }
    return r;
}

a1lib.simplecomparemax = 30;
a1lib.simplecompare = function (bigbuf, checkbuf, x, y, max) {
    var cx, cy, go, dif, d, step;
    if (x < 0 || y < 0) { return false; }
    if (x + checkbuf.width > bigbuf.width || y + checkbuf.height > bigbuf.height) { return false; }

    if (!max && max !== 0) { max = a1lib.simplecomparemax; }
    if (max < 0 || max == null) { max = 255 * 4; }
    go = true;

    dif = 0;
    for (step = 8; step >= 1; step /= 2) {
        for (cx = 0; cx < checkbuf.width; cx += step) {
            for (cy = 0; cy < checkbuf.height; cy += step) {
                d = a1lib.coldifat(bigbuf, x + cx, y + cy, checkbuf, cx, cy);
                if (step == 1) { dif += d; }
                if (d > max) {
                    return false;
                }
            }
        }
    }
    return dif / checkbuf.width / checkbuf.height;
}

a1lib.coldif = function (r1, g1, b1, a1, r2, g2, b2, a2) {
    return (Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2)) * a2 / 255;//only applies alpha for 2nd buffer!
}

a1lib.coldifat = function (buf1, x1, y1, buf2, x2, y2) {
    var i1, i2;
    i1 = x1 * 4 + y1 * buf1.width * 4;
    i2 = x2 * 4 + y2 * buf2.width * 4;
    return a1lib.coldif(buf1.data[i1], buf1.data[i1 + 1], buf1.data[i1 + 2], buf1.data[i1 + 3], buf2.data[i2], buf2.data[i2 + 1], buf2.data[i2 + 2], buf2.data[i2 + 3]);
}









//== copied from runeappslib.js ==

//calculates the amount of xp required for a lvl
a1lib.lvltoxp = function (lvl) {
    var a, b;
    if (isNaN(lvl) || lvl > 200) { return 0; }
    b = 0;
    for (a = 1; a < lvl; a += 1) { b += Math.floor(a + 300 * Math.pow(2, a / 7)); }
    return Math.floor(b / 4);
}

//calculates a lvl from xp
a1lib.xptolvl = function (xp) {
    var a = 0;
    while (xp > -1) { a += 1; xp -= Math.floor(a + 300 * Math.pow(2, a / 7)) / 4; }
    return a;
}

//strips just about anything from a string and leaves [a-z0-9_]
//validate and keeplook are optional arguments
a1lib.lowname = function (name, validate, keeplook) {
    name = name.replace(/\+/g, " ");
    name = name.replace(/\%20/g, " ");
    name = name.replace(/[^\w \-]/g, "");
    if (!keeplook) { name = name.replace(/[ _\-]/g, "_").toLowerCase(); }
    if (validate) {
        name = name.replace(/^[ _\-]+/, "");//cut down whitespace at start
        name = name.replace(/[ _\-]+$/, "");//cut down whitespace at end
        name = name.replace(/[ _\-]{2,}/, function (a) { return "__________".slice(0, a.length); });//replace more than one whitespace with _'s (old names can contain more than one whitespace ~2005)
        if (name.length > 12 || name == "") { return ""; }
    }
    return name;
}

//simple ajax wrapper
a1lib.dlpage = function (url, func, errorfunc) {
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
//== end copied from runeappslib.js ==

//depricated no longer needed if window.open is used to create new windows
a1lib.tablink = function (parent, id) {
    var me, fn;
    me = this;
    this.loaded = parent ? false : true;
    this.parent = parent;
    this.load = null;
    this.exit = null;
    if (!id) { this.id = Math.floor(Math.random() * 100000); }
    else { this.id = id; }
    this.call = function (name, str) {
        localStorage[(this.parent ? "popup_call_" : "popup_callback_") + this.id] = Date.now() + "-" + name + ":" + (str == undefined ? '""' : JSON.stringify(str));
    }

    if (parent) { localStorage.popup_id = this.id; }
    else { delete localStorage.popup_id; }

    fn = function (e) {
        var match, arg;
        if (e.key == (me.parent ? "popup_callback_" : "popup_call_") + me.id) {
            if (!e.newValue) { return; }
            match = e.newValue.match(/^\d+-(\w+):([\s\S]*)$/);
            if (!match) { return; }
            arg = JSON.parse(match[2]);
            clog(match[1], arg);
            if (match[1] == "close" && !me.parent) { window.close(); }
            if (match[1] == "load") { me.loaded = true; clog("loaded"); }
            if (match[1] == "exit") { me.loaded = false; clog("exited"); window.removeEventListener("storage", fn); }
            if (match[1] == "eval") { eval(arg); return; }
            if (me[match[1]]) { me[match[1]](arg); }
        }
    }
    window.addEventListener("storage", fn);
}

//depricated
a1lib.requireparentlink = function () {
    var el;
    if (!a1lib.parentlink) {
        el = document.createElement("div");
        el.setAttribute("style", "position:absolute; top:0px; left:0px; right:0px; bottom:0px; background:rgba(255,255,255,0.9); font-size:30px; text-align:center; padding:30px 10px; z-index:1000000;");
        el.innerHTML = "Failed to connect to parent window";
        document.body.appendChild(el);
    }

}

//depricated
a1lib.identifyUrl = function (url) {
    if (!window.alt1) { return; }
    alt1.identifyAppUrl(url);
}

//checks if alt1 is running and at least the given version. versionstr should be a string with the version eg: 1.3.2
a1lib.aboveversion = function (versionstr) {
    var a, b, versionint;
    if (!window.alt1) { return false; }
    if (!(a = versionstr.match(/^(\d+)\.(\d+)\.(\d+)$/))) { return false; }
    versionint = a[1] * 1000 * 1000 + a[2] * 1000 + a[3] * 1;
    return alt1.versionint >= versionint;
}

//converts a mouse position int returned from alt1.mousePosition to an object with x and y
a1lib.mousePosition = function () {
    var pos = alt1.mousePosition;
    if (pos == -1) { return { x: -1, y: -1 }; }
    return { x: pos >>> 16, y: pos & 0xFFFF };
}

a1lib.addResizeElement = function (el, left, top, right, bot) {
    if (!window.alt1 || !alt1.userResize) { return; }
    el.addEventListener("mousedown", function (e) {
        alt1.userResize(left, top, right, bot);
        e.preventDefault();
    });
}

//depricated
a1lib.doSomethingCool = function (delay, chance) {
    delay = delay || 0;
    chance = chance || 1;
    if (window.alt1 && alt1.permissionInstalled && alt1.doSomethingCool) {
        if (Math.random() < chance) {
            setTimeout(alt1.doSomethingCool, delay);
        }
    }
}

a1lib.skinName = window.alt1 ? alt1.skinName : "default";






//====  run after function init ====

if (window.alt1) {
    //initialize events object, cant be done from c# (for now)
    if (!alt1.events) { alt1.events = {}; }
    if (!alt1.events.alt1pressed) { alt1.events.alt1pressed = []; }
    if (!alt1.events.menudetected) { alt1.events.menudetected = []; }
    if (!alt1.events.interfacefound) { alt1.events.interfacefound = []; }
    if (!alt1.events.interfacesearching) { alt1.events.interfacesearching = []; }
    if (!alt1.events.interfacenotfound) { alt1.events.interfacenotfound = []; }
    if (!alt1.events.interfaceread) { alt1.events.interfaceread = []; }
    if (!alt1.events.xprise) { alt1.events.xprise = []; }
    if (!alt1.events.xpcounter) { alt1.events.xpcounter = []; }
    if (!alt1.events.rslinked) { alt1.events.rslinked = []; }
    if (!alt1.events.rsunlinked) { alt1.events.rsunlinked = []; }
    if (!alt1.events.posreset) { alt1.events.posreset = []; }
    if (!alt1.events.permissionchanged) { alt1.events.permissionchanged = []; }
    if (!alt1.events.daemonrun) { alt1.events.daemonrun = []; }
    if (!alt1.events.userevent) { alt1.events.userevent = []; }
    if (!alt1.events.rsfocus) { alt1.events.rsfocus = []; }
    if (!alt1.events.rsblur) { alt1.events.rsblur = []; }
}