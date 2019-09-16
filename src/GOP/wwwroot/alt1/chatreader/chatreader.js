/// <reference path="../alt1lib.js" />
/// <reference path="../imagelibs/chatbox.js" />

if (window.alt1 != null && alt1.versionint > 1001000) {
    alt1.identifyAppUrl("appconfig.json");
}

function $$(s) { return document.querySelector(s) };

function message(str) {
    $$("#result").innerHTML = str + "\n" + $$("#result").innerHTML;
}

// //captures the area around the last alt+1 press and displays it on a canvas
// function docapture() {
//     var size, rawcapture, image, ctx, cnv, capturex, capturey, color, pixelindex, red, green, blue;
//     cnv = elid("capturecnv");
//     ctx = cnv.getContext("2d");

//     //get the location for capture
//     size = cnv.getBoundingClientRect();
//     capturex = capturecenter.x - Math.round(size.width / 2);
//     capturey = capturecenter.y - Math.round(size.height / 2);

//     //do capture
//     rawcapture = a1lib.getregion(capturex, capturey, size.width, size.height);
//     //rawcapture is an imageBuffer object
//     //it has width, height and a Uint8Array called data, this array holds all pixel data in one dimension

//     if (!rawcapture) {//check if capture succeeded
//         message("Image capture failed");
//         return;
//     }

//     //calculate the index of the pixel underneath the mouse
//     //multiply the x-coord by 4 as every pixel has 4 components (red,green,blue,alpha)
//     pixelindex = (capturecenter.x - capturex) * 4;
//     //multiply the y-coord by 4*width
//     pixelindex += (capturecenter.y - capturey) * 4 * rawcapture.width;

//     red = rawcapture.data[pixelindex + 0]//index+0 is red
//     green = rawcapture.data[pixelindex + 1]//index+1 is green
//     blue = rawcapture.data[pixelindex + 2]//index+2 is blue
//     //index+3 is alpha, we rarely need that

//     //display the color in our output div
//     elid("coloroutput").style.background = "rgb(" + red + "," + green + "," + blue + ")";
//     elid("coloroutput").innerHTML = "rgb:<br>" + red + " - " + green + " - " + blue;

//     //to actually draw the buffer we sadly need to convert it to an image as it's not a real imageBuffer object (otherwise we could use the ctx.putImageData function)
//     //this function draw the buffer pixel by pixel and thus is quite slow on big images
//     image = rawcapture.toImage();

//     //reset the canvas and draw the image
//     cnv.width = image.width;
//     cnv.height = image.height;
//     ctx.drawImage(image, 0, 0);
// }

// function toggletooltip() {
//     var tooltips;
//     tooltips = ["Hi!", "Good morning", "whoosh", "Don't mind me"];
//     if (currenttooltip == "") {
//         currenttooltip = tooltips[Math.floor(Math.random() * tooltips.length)];
//         if (!alt1.setTooltip(currenttooltip)) {
//             currenttooltip = "";
//             message("No tooltip permission");
//         }
//     }
//     else {
//         currenttooltip = "";
//         alt1.clearTooltip();
//     }
// }

if (window.alt1 != null) {
    if (alt1.permissionInstalled) {
        console.log(JSON.parse(alt1.openInfo));
    }

    alt1.events.alt1pressed.push(e => {
        message("Alt+1 (" + e.x + ":" + e.y + ") - \"" + e.text + "\"");
    });

    //dump all events onto the console (right-click the settings spanner to view)
    for (let a in alt1.events) {
        console.log(a);
        alt1.events[a].push(e => { message(JSON.stringify(e)); });
    }

    let reader = new ChatBoxReader();

    $$("#captureButton").addEventListener("click", e => {
        message("Clicked");
    
        if (reader.pos == null) {
            reader.find();
        }

        /** @type Array */
        let obj = reader.read();
        let str = obj.map(x => x.text).join("\n");
        message(str);
        console.log(obj);
    });
}
else {
    message("Page loaded, alt1 not recognised.");
}
