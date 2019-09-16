//require /runeappslib.js
//require /a1lib.js


//==============================================================
//================ Helper extension methods ====================
//==============================================================

HTMLImageElement.prototype.toBuffer = function (x, y, w, h) {
    var a, b, c, d;
    if (!x) { x = 0; }
    if (!y) { y = 0; }
    if (!w) { w = this.width - x; }
    if (!h) { h = this.height - y; }
    a = document.createElement("canvas");
    a.width = w;
    a.height = h;
    a = a.getContext("2d");
    a.drawImage(this, -x, -y);
    return a.getImageData(0, 0, w, h);
}


//==============================================================
//==================== interfacetracker ========================
//==============================================================

function InterfaceTracker(bounds, mainimgsrc) {
    var a, b, c, d;
    var me = this;

    //vars
    this.pos = false;//last point on screen where interface origin was found (or false if never found)
    this.bounds = bounds;//bounds of interface relative to mainimg
    this.listening = false;
    this.confirmfind = null;//function to be called to confirm a find

    //load mainbuffer
    this.mainbuffer = false;
    ImageData.fromUrl(mainimgsrc, function (buf) { me.mainbuffer = buf });

    //events
    this.listeners = {
        found: [],//when find() succeeds
        detected: [],//when the interface is matched in any way
        trackmatch: [],//when the track function matches
        starttrack: [],//started periodic checking of the interface
        stoptrack: [],//stopped tracking
        message: [],//error/info messages
    };

    this.listen = this.addEventListener = function (name, callback) {
        this.listeners[name].push(callback);
    }

    this.unlisten = this.removeEventListener = function (name, callback) {
        var i;
        if (callback) {
            i = this.listeners[name].indexOf(callback);
            if (i == -1) { return; }
            this.listeners[name].splice(i, 1);
        }
        else { this.listeners[name] = []; }
    }
    this.dispatch = function (name, args) {
        var a, b;
        for (a = 0; a < this.listeners[name].length; a++) { this.listeners[name][a].apply(null, args); }
    }

    //find
    this.find = function (imgref) {
        var a, b, c, findpos, testbuf, found, refound;
        if (!imgref) { imgref = InterfaceTracker.getLastImg(); }
        if (!imgref) { this.message("Couldn't complete this action as no input image is available.", "noInput"); return; }
        found = false;

        //check if interface is even moved
        refound = this.refind(imgref);
        found = refound || found;

        if (!found) {
            findpos = a1lib.findsubimg(imgref, this.mainbuffer, [], 0, 0, imgref.width, imgref.height);
            if (findpos.length > 1) { console.log("Warning - more than one possible location found for interface"); }
            if (findpos.length == 0) { return false; }
            if (this.confirmfind && !this.confirmfind(imgref, findpos[0].x + bounds.x, findpos[0].y + bounds.y)) { return false; }
            this.pos = { x: findpos[0].x + bounds.x, y: findpos[0].y + bounds.y };
            found = true;
        }
        if (!refound) { this.dispatch("detected", [this.pos]); }
        this.dispatch("found", [this.pos]);
        return this.pos;
    }

    //check if interface is at last known pos
    this.refind = function (imgref) {
        if (this.pos) {
            var testbuf = imgref.toData(this.pos.x - this.bounds.x, this.pos.y - this.bounds.y, this.mainbuffer.width, this.mainbuffer.height);
            if (a1lib.simplecompare(testbuf, this.mainbuffer, 0, 0) !== false) {
                if (this.confirmfind && !this.confirmfind(imgref, this.pos.x, this.pos.y)) { return false; }
                this.dispatch("detected", [this.pos]);
                return this.pos;
            }
        }
        return false;
    }

    this.getFullInterface = function (imgref) {
        if (!this.pos) { console.log("Warning - tried to get buffer while interface was not yet found."); return false; }
        if (!imgref) { imgref = InterfaceTracker.getLastImg(); }
        if (!imgref) { this.message("Couldn't complete this action as no input image is available.", "noInput"); return false; }

        return imgref.toData(this.pos.x, this.pos.y, this.bounds.width, this.bounds.height);
    }

    //== periodic check for position ==
    this.trackTimer = false;
    this.track = function () {
        if (this.trackTimer) { return; }
        this.trackTimer = setTimeout(this.trackTick, a1lib.trackinterval);
        this.dispatch("starttrack");
    }
    this.trackTick = function () {
        var testbuf, t;
        if (!me.pos) { return; }

        testbuf = a1lib.getregion(me.pos.x - me.bounds.x, me.pos.y - me.bounds.y, me.mainbuffer.width, me.mainbuffer.height);
        if (!testbuf) { me.untrack(); message("Failed to get image from screen.", "getRegionFailed"); return; }

        if (a1lib.simplecompare(testbuf, me.mainbuffer, 0, 0) !== false) {
            me.dispatch("detected", [me.pos]);
            me.dispatch("trackmatch", [me.pos]);
        }
        me.trackTimer = setTimeout(me.trackTick, a1lib.trackinterval);
    }
    this.untrack = function () {
        if (!this.trackTimer) { return; }

        clearTimeout(this.trackTimer);
        this.trackTimer = false;
        this.dispatch("stoptrack");
    }

    this.message = function (str, code) {
        if (!code) { code = "other"; }
        this.dispatch("message", [str, code]);
        console.log(str);
    }
}

InterfaceTracker.lastimg = false;
InterfaceTracker.getLastImg = function () {
    var r;
    if (this.lastimg) {
        if (this.lastimg.time + 1000 * 5 > Date.now()) { return this.lastimg; }
        else { this.lastimg = false; }
    }

    r = false;
    if (window.alt1 && alt1.permissionPixel) {
        r = a1lib.bindfullrs();
        r.time = Date.now();
    }
    else if (PasteInput.lastref) {
        r = PasteInput.lastref;
        r.time = Date.now();
    }

    if (!r) { console.log("Warning - no input image availible for InterfaceTracker.getLastImg."); }
    return r;
}

//==============================================================
//======================= pasteinput ===========================
//==============================================================

PasteInput = new (function () {
    var me = this;
    this.listeners = [];
    this.started = false;
    this.dndStarted = false;
    this.pasting = false;
    this.lastimg = false;
    this.lastref = false;

    this.listen = function (func, errorfunc, dragndrop) {
        this.listeners.push({ cb: func, error: errorfunc });

        if (!this.started) { this.start(); }
        if (dragndrop && !this.dndStarted) { this.startDragNDrop(); }
    }

    this.pasted = function (img) {
        var a;
        this.pasting = false;
        this.lastimg = imgtocnv(img);
        this.lastref = new ImgRefCtx(this.lastimg);
        for (a in this.listeners) { this.listeners[a].cb(this.lastimg, this.lastref); }
    }

    this.error = function (mes, error) {
        var a;
        this.pasting = false;
        for (a in this.listeners) {
            if (this.listeners[a].error) { this.listeners[a].error(mes, error); }
        }
    }

    this.startDragNDrop = function () {
        var getitem = function (items) {
            var foundimage = "";
            for (var a = 0; a < items.length; a++) {
                var item = items[a];
                var m = item.type.match(/^image\/(\w+)$/)
                if (m) {
                    if (m[1] == "png") { return item; }
                    else { foundimage = m[1]; }
                }
            }
            if (foundimage) {
                me.error("The image you uploaded is not a .png image. Other image type have compression noise and can't be used for image detection.", "notpng");
            }
            return null;
        }

        window.addEventListener("dragover", function (e) {
            e.preventDefault();
        });
        window.addEventListener("drop", function (e) {
            var item = getitem(e.dataTransfer.items);
            e.preventDefault();
            if (!item) { return; }
            fromFile(item.getAsFile());
        });
    }

    this.start = function () {
        var a, b, c, d, e, catcher, pastehandler, errorhandler;

        if (this.started) { return }
        this.started = true;

        errorhandler = function (mes, error) {
            var a;
            this.pasting = false;
            for (a in this.listeners) {
                if (this.listeners[a].error) { this.listeners[a].error(mes, error); }
            }
        }

        //determine if we have a clipboard api
        //try{a=new Event("clipboard"); a="clipboardData" in a;}
        //catch(e){a=false;}
        if (navigator.userAgent.match(/Chrome/)) { a = true; }
        else { a = false; }
        //old method breaks after chrome 41, revert to good old user agent sniffing

        //nvm, internet explorer (edge) decided that it wants to be chrome, however fails at delivering
        if (navigator.userAgent.match(/Edge/)) { a = false; }
        //turns out this one is interesting, edge is a hybrid between the paste api's

        var apipasted = function (e) {
            for (var a = 0; a < e.clipboardData.items.length; a++) {//loop all data types
                if (e.clipboardData.items[a].type.indexOf("image") != -1) {
                    var file = e.clipboardData.items[a].getAsFile();
                    var img = new Image();
                    img.src = (window.URL || window.webkitURL).createObjectURL(file);
                    if (img.width > 0) { me.pasted(img); }
                    else { img.onload = function () { me.pasted(img); } }
                }
            }
        };

        if (a) { document.addEventListener("paste", apipasted); }
        else {
            catcher = document.createElement("div");
            catcher.setAttribute("contenteditable", "");
            catcher.className = "forcehidden";//retarded ie safety/bug, cant apply styles using js
            catcher.onpaste = function (e) {
                if (e.clipboardData && e.clipboardData.items) { apipasted(e); return; }
                setTimeout(function () {
                    var img, a, b;
                    b = catcher.children[0];
                    if (!b || b.tagName != "IMG") { return; }
                    img = new Image();
                    img.src = b.src;
                    if (a = img.src.match(/^data:([\w\/]+);/)) { img.type = a[1]; } else { img.type = "image/unknown"; }//unreliable, won't use
                    if (img.width > 0) { me.pasted(img); }
                    else { img.onload = function () { me.pasted(img) }; }
                    catcher.innerHTML = "";
                }, 1);
            };
            document.body.appendChild(catcher);
        }

        //detect if ctrl-v is pressed and focus catcher if needed
        document.addEventListener("keydown", function (e) {
            if (e.target.tagName == "INPUT") { return; }
            if (e.keyCode != "V".charCodeAt() || !e.ctrlKey) { return; }
            me.pasting = true;
            setTimeout(function () {
                if (me.pasting) { me.error("You pressed Ctrl+V, but no image was pasted by your browser, make sure your clipboard contains an image, and not a link to an image.\n This may also happen if your browser is (very) outdated.", "noimg"); }
            }, 1000);
            if (catcher) { catcher.focus(); }
        });
    }

    this.fileDialog = function () {
        var fileinput = eldiv(":input/file", { accept: "image/png" });
        fileinput.onchange = function () { if (fileinput.files[0]) { fromFile(fileinput.files[0]); } };
        fileinput.click();
        return fileinput;
    }

    var fromFile = function (file) {
        var reader = new FileReader();
        reader.onload = function () {//TODO check if it's actually png
            var bytearray = new Uint8Array(reader.result);
            ImageData.fixPngBuffer(bytearray);
            var blob = new Blob([bytearray], { type: "image/png" });
            img = new Image();
            img.onerror = me.error.bind(me, "The file you uploaded could not be opened as an image.", "invalidfile");
            var bloburl = URL.createObjectURL(blob);
            img.src = bloburl;
            if (img.width > 0) { me.pasted(img); URL.revokeObjectURL(bloburl); }
            else { img.onload = function () { me.pasted(img); URL.revokeObjectURL(bloburl); }; }
        };

        reader.readAsArrayBuffer(file);
    }
})();


//==============================================================
//========================= imgref =============================
//==============================================================

function ImgRef(bounds) {
    this.t = "none";
    this.x = bounds.x;
    this.y = bounds.y;
    this.width = bounds.width;
    this.height = bounds.height;

    this.toData = function () { throw ("This imgref (" + this.t + ") does not support toData"); }
}


ImgRefCtx.prototype = Object.create(ImgRef.prototype);
ImgRefCtx.prototype.constructor = ImgRefCtx;
function ImgRefCtx(img, bounds) {
    if (!bounds) { bounds = new Rect(0, 0, img.width, img.height); }
    ImgRef.call(this, bounds);

    if (img instanceof CanvasRenderingContext2D) { this.ctx = img; }
    else { this.ctx = imgtoctx(img); }

    this.t = "ctx";

    this.toData = function (x, y, w, h) {
        if (x == undefined) { x = this.x; y = this.y; w = this.width; h = this.height; }
        return this.ctx.getImageData(x - this.x, y - this.y, w, h);
    }
}


ImgRefBind.prototype = Object.create(ImgRef.prototype);
ImgRefBind.prototype.constructor = ImgRefBind;
function ImgRefBind(handle, bounds) {
    ImgRef.call(this, bounds);
    this.t = "bind";
    this.handle = handle;

    this.toData = function (x, y, w, h) {
        if (x == undefined) { x = this.x; y = this.y; w = this.width; h = this.height; }
        return a1lib.bindgetregion(this.handle, x - this.x, y - this.y, w, h)
    }
}



ImgRefData.prototype = Object.create(ImgRef.prototype);
ImgRefData.prototype.constructor = ImgRefData;
function ImgRefData(buf, bounds) {
    if (!bounds) { bounds = new Rect(0, 0, buf.width, buf.height); }
    ImgRef.call(this, bounds);
    this.t = "data";
    this.buf = buf;

    this.toData = function (x, y, w, h) {
        if (x == undefined) { return this.buf; }
        var a, b, r, i1, i2;
        x -= this.x;
        y -= this.y;
        r = new ImageData(w, h);
        for (b = y; b < y + h; b++) {
            for (a = x; a < x + w; a++) {
                i1 = (a - x) * 4 + (b - y) * w * 4;
                i2 = a * 4 + b * 4 * this.buf.width;

                r.data[i1] = this.buf.data[i2];
                r.data[i1 + 1] = this.buf.data[i2 + 1];
                r.data[i1 + 2] = this.buf.data[i2 + 2];
                r.data[i1 + 3] = this.buf.data[i2 + 3];
            }
        }
        return r;
    }
}



//==============================================================
//======================== ImageData ===========================
//==============================================================
//upgrade the built-in imagedata class to do stuff we need

//overwrite ImageData contructor until browsers fix their stuff
(function () {
    var constr;
    constr = function () {
        var width, height;
        var i = 0;

        if (arguments[0] instanceof Uint8ClampedArray) { var data = arguments[i++]; }
        width = arguments[i++];
        height = arguments[i++];

        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");
        var imageData = ctx.createImageData(width, height);
        if (data) { imageData.data.set(data); }
        return imageData;
    }
    constr.prototype = ImageData.prototype;
    ImageData = constr;
})();

ImageData.isPngBuffer = function (data) { return data[0] == 137 && data[1] == 80 && data[2] == 78 && data[3] == 71; }
ImageData.fixPngBuffer = function (data) {
    var i = 0;
    //check if it's actually png
    if (data[i++] != 137 || data[i++] != 80 || data[i++] != 78 || data[i++] != 71) { qw("non-png image received"); return; }
    i += 4;
    while (i < data.length) {
        var length = data[i++] * 0x1000000 + data[i++] * 0x10000 + data[i++] * 0x100 + data[i++];
        var ancillary = !!((data[i] >> 5) & 1);
        var chunkname = String.fromCharCode(data[i], data[i + 1], data[i + 2], data[i + 3]);
        if (ancillary) {
            data[i + 0] = "n".charCodeAt(0);
            data[i + 1] = "o".charCodeAt(0);
            data[i + 2] = "P".charCodeAt(0);
            data[i + 3] = "E".charCodeAt(0);

            //calculate new chunk checksum
            //http://www.libpng.org/pub/png/spec/1.2/PNG-CRCAppendix.html
            var end = i + 4 + length;
            var crc = 0xffffffff;

            //should be fast enough like this
            var bitcrc = function (bit) {
                for (var k = 0; k < 8; k++) {
                    if (bit & 1) { bit = 0xedb88320 ^ (bit >>> 1); }
                    else { bit = bit >>> 1; }
                }
                return bit;
            }
            for (var a = i; a < end; a++) {
                if (a >= i + 4) { data[a] = 0; }
                var bit = data[a];
                crc = bitcrc((crc ^ bit) & 0xff) ^ (crc >>> 8);
            }
            crc = crc ^ 0xffffffff;
            //new chunk checksum
            data[i + 4 + length + 0] = (crc >> 24) & 0xff;
            data[i + 4 + length + 1] = (crc >> 16) & 0xff;
            data[i + 4 + length + 2] = (crc >> 8) & 0xff;
            data[i + 4 + length + 3] = (crc >> 0) & 0xff;
            console.log("Cleared png chunk: " + chunkname);
        }
        if (chunkname == "IEND") { break; }
        i += 4;//type
        i += length;//data
        i += 4;//crc
    }
}

ImageData.fromUrl = function (url, callback, callbackarg) {
    var img;
    img = new Image();
    img.crossOrigin = "crossorigin";
    img.onload = function () {
        callback(img.toBuffer(), callbackarg);
    }
    img.src = url;
}

ImageData.fromBase64 = function (callback, data) {
    var img;
    img = new Image();
    img.onload = function () {
        callback(img.toBuffer());
    }
    img.src = "data:image/png;base64," + data;
}

//mostly a debug function to show arrays as image
ImageData.fromArray = function (array, w, h) {
    if (array.length != w * h) { throw "Invalid array size"; }
    var min = Math.min.apply(null, array);
    var max = Math.max.apply(null, array);
    var range = max - min;
    var buf = new ImageData(w, h);
    for (var i = 0; i < w * h; i++) {
        var ibuf = i * 4;
        buf.data[ibuf] = buf.data[ibuf + 1] = buf.data[ibuf + 2] = (array[i] - min) / range * 255;
        buf.data[ibuf + 3] = 255;
    }
    return buf;
}

ImageData.prototype.underSample = function (w, h, rect) {
    if (rect == null) { rect = new Rect(0, 0, this.width, this.height); }

    var cnv = document.createElement("canvas");
    cnv.width = w;
    cnv.height = h;
    var ctx = cnv.getContext("2d");
    ctx.drawImage(this.toImage(), rect.x, rect.y, rect.width, rect.height, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h);
}

//really shitty way to stretch an image
ImageData.prototype.underSampleSine = function (ncols, nrows, rect, nchannels) {
    if (rect == null) { rect = new Rect(0, 0, this.width, this.height); }
    if (nchannels == null) { nchannels = 4; }

    var colsize = rect.width / ncols;
    var rowsize = rect.height / nrows;
    var boxsize = colsize * rowsize;

    var r = new ImageData(ncols, nrows);
    var coldata = r.data;

    for (var x = 0; x < rect.width; x++) {
        for (var y = 0; y < rect.height; y++) {
            var col = (x - 0.5 * colsize) / colsize;
            var row = (y - 0.5 * rowsize) / rowsize;

            var vx = (1 + Math.cos(((col + 1) % 1) * Math.PI)) / 2;
            var vy = (1 + Math.cos(((row + 1) % 1) * Math.PI)) / 2;
            var vxi = 1 - vx, vyi = 1 - vy;

            var col0 = Math.floor(col), row0 = Math.floor(row);
            var col1 = col0 + 1, row1 = row0 + 1;
            var i = 4 * (x + rect.x) + 4 * this.width * (y + rect.y);
            for (var ch = 0; ch < nchannels; ch++) {
                if (col0 >= 0 && row0 >= 0) { coldata[4 * col0 + 4 * ncols * row0 + ch] += vx * vy * this.data[i + ch] / boxsize; }
                if (col0 >= 0 && row1 < nrows) { coldata[4 * col0 + 4 * ncols * row1 + ch] += vx * vyi * this.data[i + ch] / boxsize; }
                if (col1 < ncols && row0 >= 0) { coldata[4 * col1 + 4 * ncols * row0 + ch] += vxi * vy * this.data[i + ch] / boxsize; }
                if (col1 < ncols && row1 < nrows) { coldata[4 * col1 + 4 * ncols * row1 + ch] += vxi * vyi * this.data[i + ch] / boxsize; }
            }
        }
    }
    return r;
}

ImageData.prototype.putImageData = function (buf, cx, cy) {
    for (var dx = 0; dx < buf.width; dx++) {
        for (var dy = 0; dy < buf.height; dy++) {
            var i1 = (dx + cx) * 4 + (dy + cy) * 4 * this.width;
            var i2 = dx * 4 + dy * 4 * buf.width;
            this.data[i1] = buf.data[i2];
            this.data[i1 + 1] = buf.data[i2 + 1];
            this.data[i1 + 2] = buf.data[i2 + 2];
            this.data[i1 + 3] = buf.data[i2 + 3];
        }
    }
}

ImageData.prototype.getDiffMap = function (rect) {
    var a, b, c, d, hor, ver, stride, bpp, alpha;
    if (!rect) { rect = new Rect(0, 0, this.width, this.height); }

    r = new ImageData(rect.width, rect.height);

    stride = this.width * 4;
    for (a = rect.x; a < rect.x + rect.width; a++) {
        for (b = rect.y; b < rect.y + rect.height; b++) {
            i1 = a * 4 + b * stride;
            i2 = (a - rect.x) * 4 + (b - rect.y) * stride;

            alpha = this.data[i1 + 3];

            if (i1 % (stride) < stride) {//right
                hor = Math.abs(this.data[i1] - this.data[i1 + 4]) + Math.abs(this.data[i1 + 1] - this.data[i1 + 5]) + Math.abs(this.data[i1 + 2] - this.data[i1 + 6]);
                alpha = Math.min(alpha, this.data[i1 + 4 + 3]);
            }
            else { hor = 0; }

            if (Math.floor(i1 / stride < this.height)) {//down
                ver = Math.abs(this.data[i1] - this.data[i1 + stride]) + Math.abs(this.data[i1 + 1] - this.data[i1 + stride + 1]) + Math.abs(this.data[i1 + 2] - this.data[i1 + stride + 2]);
                alpha = Math.min(alpha, this.data[i1 + stride + 3]);
            }
            else { ver = 0; }

            r.data[i2] = hor / 3;
            r.data[i2 + 1] = ver / 3;
            r.data[i2 + 2] = 0;
            r.data[i2 + 3] = alpha;
        }
    }

    return r;
}

ImageData.prototype.pixelOffset = function (x, y) {
    return x * 4 + y * this.width * 4;
}

ImageData.prototype.blur = function (radius) {
    var x, y, stride, r, g, b, n, xr, yr, i;

    stride = this.width * 4;
    for (x = 0; x < this.width; x++) {
        for (y = 0; y < this.height; y++) {

            r = g = b = 0;
            n = 0;
            for (xr = Math.max(x - radius, 0); xr < Math.min(x + radius + 1, this.width); xr++) {
                for (yr = Math.max(y - radius, 0); yr < Math.min(y + radius + 1, this.height); yr++) {
                    i = 4 * xr + stride * yr;
                    n++;
                    r += this.data[i];
                    g += this.data[i + 1];
                    b += this.data[i + 2];
                }
            }
            i = 4 * x + stride * y;
            this.data[i] = r / n;
            this.data[i + 1] = g / n;
            this.data[i + 2] = b / n;
        }
    }
    return this;
}

//creates a hash of a portion of the buffer used to check for changes
ImageData.prototype.getPixelHash = function (rect) {
    if (!rect) { rect = new Rect(0, 0, this.width, this.height); }
    var hash = 0;
    for (var x = rect.x; x < rect.x + rect.width; x++) {
        for (var y = rect.y; y < rect.y + rect.height; y++) {
            var i = x * 4 + y * 4 * this.width;

            hash = (((hash << 5) - hash) + this.data[i]) | 0;
            hash = (((hash << 5) - hash) + this.data[i + 1]) | 0;
            hash = (((hash << 5) - hash) + this.data[i + 2]) | 0;
            hash = (((hash << 5) - hash) + this.data[i + 3]) | 0;
        }
    }
    return hash;
}

ImageData.prototype.createTemplate = function (rect) {
    var dif, a, b, c, d, i1, i2, i3, r, alpha, points, r1, r2, g1, g2, b1, b2, xx, yy;

    if (!rect) { rect = new Rect(0, 0, this.width, this.height); }

    r = new ImageData(rect.width * 2, rect.height);

    points = [[0, 0], [0, 1], [1, 0], [-1, 0], [0, -1]];
    dif = 0;
    for (a = 0; a < rect.width; a++) {
        cr = cg = cb = 0;
        for (b = 0; b < rect.width; b++) {
            i1 = (a + rect.x) * 4 + (b + rect.y) * 4 * this.width;
            i2 = a * 4 + b * 4 * r.width;

            r1 = 255; r2 = 0;
            g1 = 255; g2 = 0;
            b1 = 255; b2 = 0;
            for (c in points) {
                xx = a + points[c][0];
                if (xx < 0) { continue; }
                if (xx >= rect.width) { continue; }
                yy = b + points[c][1];
                if (yy < 0) { continue; }
                if (yy >= rect.height) { continue; }

                i3 = (xx + rect.x) * 4 + (yy + rect.y) * 4 * this.width;
                if (this.data[i3 + 3] != 255) { continue; }

                //min color values
                r1 = Math.min(r1, this.data[i3]);
                g1 = Math.min(g1, this.data[i3 + 1]);
                b1 = Math.min(b1, this.data[i3 + 2]);
                //max color values
                r2 = Math.max(r2, this.data[i3]);
                g2 = Math.max(g2, this.data[i3 + 1]);
                b2 = Math.max(b2, this.data[i3 + 2]);
            }
            alpha = this.data[i1 + 3];

            r.data[i2] = r1;
            r.data[i2 + 1] = g1;
            r.data[i2 + 2] = b1;
            r.data[i2 + 3] = alpha;

            i2 += rect.width * 4;
            r.data[i2] = r2;
            r.data[i2 + 1] = g2;
            r.data[i2 + 2] = b2;
            r.data[i2 + 3] = alpha;
        }
    }
    return r;
}

ImageData.prototype.matchTemplate = function (template, cx, cy) {
    var a, b, c, d, x, y, dif, alpha, r, i1, i2, i3, i4, dr1, dr2, dg1, dg2, db1, db2, dr, dg, db, sdif;
    if (!cx && cx !== 0) { cx = 0; cy = 0; }

    //r=new ImageData(template.width/2,template.height);

    dif = 0;
    for (x = 0; x < template.width / 2; x++) {
        for (y = 0; y < template.height; y++) {
            i1 = (cx + x) * 4 + (cy + y) * 4 * this.width;//index this buffer
            i2 = x * 4 + y * 4 * template.width;//index template lower pixel
            i3 = i2 + template.width / 2 * 4;//index template higher pixel
            //i4=x*4+y*4*r.width;//index debug output

            alpha = template.data[i2 + 3];

            dr1 = template.data[i2] - this.data[i1];
            dr2 = this.data[i1] - template.data[i3];
            dr = Math.max(0, dr1, dr2);

            dg1 = template.data[i2 + 1] - this.data[i1 + 1];
            dg2 = this.data[i1 + 1] - template.data[i3 + 1];
            dg = Math.max(0, dg1, dg2);

            db1 = template.data[i2 + 2] - this.data[i1 + 2];
            db2 = this.data[i1 + 2] - template.data[i3 + 2];
            db = Math.max(0, db1, db2);

            sdif = 2 * Math.min(dr, dg, db);
            d = dr + dg + db - sdif;
            d = d * d;
            d *= alpha / 255;

            //r.data[i4]=dr-sdif/3;
            //r.data[i4+1]=dg-sdif/3;
            //r.data[i4+2]=db-sdif/3;
            //r.data[i4+3]=alpha;

            dif += d;
        }
    }

    return dif / template.width * 2 / template.height;
}

ImageData.prototype.clone = function (rect) {
    var x, y, r;
    return this.toImage(rect).getContext("2d").getImageData(0, 0, rect.width, rect.height);
}

ImageData.prototype.show = function () {
    var a, b, c;
    var imgs = document.getElementsByClassName("debugimage");
    for (var i = 0; imgs.length - 1 > 10; i++) { imgs[i].remove(); }
    a = buffertoimage(this);
    a.classList.add("debugimage")
    a.style.position = "absolute";
    a.style.zIndex = 1000;
    a.style.left = "5px";
    a.style.top = "5px";
    a.style.background = "purple";
    a.style.cursor = "pointer";
    a.style.imageRendering = "pixelated";
    a.style.outline = "1px solid #0f0";
    a.style.width = (this.width == 1 ? 100 : this.width) + "px";
    a.style.height = (this.height == 1 ? 100 : this.height) + "px";
    a.onclick = function () { a.remove(); }
    document.body.appendChild(a);
    return a;
}
ImageData.prototype.showAt = function (x, y, zoom) {
    if (zoom == undefined) { zoom = 1; }
    var i = this.show();
    i.style.left = x / zoom + "px";
    i.style.top = y / zoom + "px";
    i.style.zoom = zoom;
    return i;
}

ImageData.prototype.toImage = function (rect) {
    var a, ctx;
    if (!rect) { rect = new Rect(0, 0, this.width, this.height); }

    a = document.createElement("canvas");
    a.width = rect.width;
    a.height = rect.height;
    ctx = a.getContext("2d");
    ctx.putImageData(this, -rect.x, -rect.y);
    return a;
}

ImageData.prototype.brighten = function (d) {
    var x, y, i;
    for (x = 0; x < this.width; x++) {
        for (y = 0; y < this.height; y++) {
            i = x * 4 + y * 4 * this.width;

            this.data[i] += d;
            this.data[i + 1] += d;
            this.data[i + 2] += d;
        }
    }
}

ImageData.prototype.multiply = function (img, sx, sy) {
    var x, y, i1, i2, r;
    r = new ImageData(img.width, img.height);
    if (!sx && sx !== 0) { sx = 0; sy = 0; }
    for (x = 0; x < img.width; x++) {
        for (y = 0; y < img.height; y++) {
            i1 = 4 * (sx + x) + this.width * 4 * (sy + y);
            i2 = 4 * x + img.width * 4 * y;
            r.data[i2 + 0] = this.data[i1 + 0] * img.data[i2 + 0] / 255;
            r.data[i2 + 1] = this.data[i1 + 1] * img.data[i2 + 1] / 255;
            r.data[i2 + 2] = this.data[i1 + 2] * img.data[i2 + 2] / 255;
            r.data[i2 + 3] = img.data[i2 + 3];
        }
    }
    return r;
}

ImageData.prototype.diffSum = function (img, sx, sy) {
    var x, y, i1, i2, r, d;
    r = 0;
    if (!sx && sx !== 0) { sx = 0; sy = 0; }
    for (x = 0; x < img.width; x++) {
        for (y = 0; y < img.height; y++) {
            i1 = 4 * (sx + x) + this.width * 4 * (sy + y);
            i2 = 4 * x + img.width * 4 * y;
            d = 0;
            d += Math.abs(this.data[i1 + 0] - img.data[i2 + 0]);
            d += Math.abs(this.data[i1 + 1] - img.data[i2 + 1]);
            d += Math.abs(this.data[i1 + 2] - img.data[i2 + 2]);
            r += d * this.data[i1 + 3] * img.data[i2 + 3] / 255 / 255;
        }
    }
    return r / img.width / img.height;
}

ImageData.prototype.getPixel = function (x, y) {
    var i = x * 4 + y * 4 * this.width;
    return [this.data[i], this.data[i + 1], this.data[i + 2], this.data[i + 3]];
}

ImageData.prototype.getSubSample = function (x, y) {
    //damn this thing is ugly
    var fx = Math.floor(x);
    var fy = Math.floor(y);
    var p00 = this.getPixel(fx, fy);
    var p01 = this.getPixel(fx, fy + 1);
    var p10 = this.getPixel(fx + 1, fy);
    var p11 = this.getPixel(fx + 1, fy + 1);

    var wx0 = x - fx;
    var wy0 = y - fy;
    var wx1 = 1 - wx0;
    var wy1 = 1 - wy0;
    return [
        wx0 * wy0 * p00[0] + wx0 * wy1 * p01[0] + wx1 * wy0 * p10[0] + wx1 * wy1 * p11[0],
        wx0 * wy0 * p00[1] + wx0 * wy1 * p01[1] + wx1 * wy0 * p10[1] + wx1 * wy1 * p11[1],
        wx0 * wy0 * p00[2] + wx0 * wy1 * p01[2] + wx1 * wy0 * p10[2] + wx1 * wy1 * p11[2],
        wx0 * wy0 * p00[3] + wx0 * wy1 * p01[3] + wx1 * wy0 * p10[3] + wx1 * wy1 * p11[3],
    ];
}

ImageData.prototype.getPixelInt = function (x, y) {
    var i = x * 4 + y * 4 * this.width;
    return (this.data[i + 3] << 24) + (this.data[i + 0] << 16) + (this.data[i + 1] << 8) + (this.data[i + 2] << 0);
}

ImageData.prototype.containsPixel = function (x, y) {
    return x > 0 && x < this.width && y > 0 && y < this.height;
}

ImageData.prototype.setPixel = function (x, y, r, g, b, a) {
    var i = x * 4 + y * 4 * this.width;
    this.data[i] = r;
    this.data[i + 1] = g;
    this.data[i + 2] = b;
    this.data[i + 3] = a == undefined ? 255 : a;
}

ImageData.prototype.comparePixel = function (x, y, r, g, b) {
    var i = x * 4 + y * 4 * this.width;
    var d = 0;
    d += Math.abs(this.data[i] - r);
    d += Math.abs(this.data[i + 1] - g);
    d += Math.abs(this.data[i + 2] - b);
    return d;
}

ImageData.prototype.toJSON = function () {
    var str = this.toImage().toDataURL("image/png");
    return str.slice(str.indexOf(",") + 1);
}

//==============================================================
//==================== ImageTemplateSet ========================
//==============================================================

function ImageTemplateSet(buffs) {
    var a, b, me;
    me = this;

    this.buffers = [];
    if (buffs) {
        for (a = 0; a < buffs.length; a++) {
            if (typeof buffs[a] == "string") {
                this.buffers[a] = false;
                ImageData.fromUrl(buffs[a], function (buf, i) { me.buffers[i] = buf; }, a);
            }
            else {
                this.buffers[a] = buffs[a];
            }
        }
    }
    else { this.buffers = []; }
}

ImageTemplateSet.prototype.findBest = function (buf, x, y) {
    var a, b, c, d, best, bestscore, score;

    best = false;
    bestscore = Infinity;
    for (a = 0; a < this.buffers.length; a++) {
        score = buf.matchTemplate(this.buffers[a], x, y);
        if (score < bestscore) { best = a; bestscore = score; }
    }

    return best;
}

//==============================================================
//======================== ImageSet ============================
//==============================================================

function ImageSet(buffs, slices) {
    var a, b, me;
    me = this;

    this.buffers = [];
    if (buffs) {
        if (slices) {
            //create from a single base64 string and slice that
            ImageData.fromUrl(buffs, function (buf) {
                for (var a = 0; a < slices.length; a++) {
                    me.buffers[a] = buf.clone(new Rect(slices[a], 0, (a == slices.length - 1 ? buf.width : slices[a + 1]) - slices[a], buf.height));
                }
            })
        }
        else {
            //create from array of existing buffers or from base64 strings
            for (a = 0; a < buffs.length; a++) {
                if (typeof buffs[a] == "string") {
                    this.buffers[a] = false;
                    ImageData.fromUrl(buffs[a], function (buf, i) { me.buffers[i] = buf; }, a);
                }
                else {
                    this.buffers[a] = buffs[a];
                }
            }
        }
    }
    else { this.buffers = []; }
}

ImageSet.prototype.findBest = function (buf, x, y) {
    var a, b, c, d, best, bestscore, score;

    best = false;
    bestscore = Infinity;
    for (a = 0; a < this.buffers.length; a++) {
        score = a1lib.simplecompare(buf, this.buffers[a], x, y, -1);
        if (score < bestscore) { best = a; bestscore = score; }
    }

    return best;
}

//==============================================================
//===================== support classes ========================
//==============================================================
//TODO shit this sucks can we remove it again?
//more of a shorthand to get {x,y,width,height} than a class
function Rect(x, y, w, h) {
    if (typeof x == "object") {
        this.x = x.x;
        this.y = x.y;
        this.width = (x.width != undefined ? x.width : x.w) || 0;
        this.height = (x.height != undefined ? x.height : x.h) || 0;
    }
    else {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
}

Rect.prototype.intersect = function (r2) {
    var x = Math.min(this.x, r2.x);
    var y = Math.min(this.y, r2.y);
    this.width = Math.max(this.x + this.width, r2.x + r2.width) - x;
    this.height = Math.max(this.y + this.height, r2.y + r2.height) - y;
    this.x = x;
    this.y = y;
    return this;
}

Rect.prototype.intersectPoint = function (x, y) {
    this.intersect(new Rect(x, y, 0, 0));
}

Rect.prototype.inflate = function (w, h) {
    this.x -= w;
    this.y -= h;
    this.width += 2 * w;
    this.height += 2 * h;
}

Rect.prototype.contain = function (r2) {
    if (this.x < r2.x) { this.width -= r2.x - this.x; this.x = r2.x; }
    if (this.y < r2.y) { this.height -= r2.y - this.y; this.y = r2.y; }
    this.width = Math.min(this.x + this.width, r2.x + r2.width) - this.x;
    this.height = Math.min(this.y + this.height, r2.y + r2.height) - this.y;
}

Rect.prototype.overlaps = function (r2) {
    return this.x < r2.x + r2.width && this.x + this.width > r2.x && this.y < r2.y + r2.height && this.y + this.height > r2.y;
}

Rect.prototype.contains = function (r2) {
    return this.x <= r2.x && this.x + this.width >= r2.x + r2.width && this.y <= r2.y && this.y + this.height >= r2.y + r2.height;
}

Rect.prototype.containsPoint = function (x, y) {
    return this.x <= x && this.x + this.width > x && this.y <= y && this.y + this.height > y;
}
