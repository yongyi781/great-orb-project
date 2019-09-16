window.alt1 = {
    /**
     * No info available about this property.
     */
    overlay: undefined,
    /**
     * Gets the left bound of all screens, usually 0, but can be negative with multiple screens.
     */
    screenX: undefined,
    /**
     * Gets the Top bound of all screens, usually 0, but can be negative with multiple screens.
     */
    screenY: undefined,
    /**
     * Gets the width of the union of all srceens.
     */
    screenWidth: undefined,
    /**
     * Gets the height of the union of all srceens.
     */
    screenHeight: undefined,
    /**
     * Gets a string represention of the current version of Alt1.
     */
    version: undefined,
    /**
     * Gets a integer that represents the current version. (major * 1000 * 1000 + minor * 1000 + build) 1.2.3 -> 1002003.
     */
    versionint: undefined,
    /**
     * Gets the maximum amount of bytes that can be transfered in a single function call. The wrapper library uses this to split up large image transfers.
     */
    maxtransfer: undefined,
    /**
     * Gets the name of the current skin.
     */
    skinName: undefined,
    /**
     * Gets what capture methods is currently being used
     */
    captureMethod: undefined,
    /**
     * Gets the adviced minimum time between screen captures
     */
    captureInterval: undefined,
    /**
     * Gets the X-coord of the runescape client area when rs is linked. Use rsLinked to determine if rs is linked.
     */
    rsX: undefined,
    /**
     * Gets the Y-coord of the runescape client area when rs is linked. Use rsLinked to determine if rs is linked.
     */
    rsY: undefined,
    /**
     * Gets the width of the runescape client area when rs is linked. Use rsLinked to determine if rs is linked.
     */
    rsWidth: undefined,
    /**
     * Gets the height of the runescape client area when rs is linked. Use rsLinked to determine if rs is linked.
     */
    rsHeight: undefined,
    /**
     * Gets the DPI scaling level of the rs window in windows 8.1 or 10, returns 0 when the rs window is not linked.
     */
    rsScaling: undefined,
    /**
     * Gets if the runescape window is currently detected by Alt1.
     */
    rsLinked: undefined,
    /**
     * Gets if the current page is handled as an installed app.
     */
    permissionInstalled: undefined,
    /**
     * Gets is the current page has gamestate permission.
     */
    permissionGameState: undefined,
    /**
     * Gets is the current page has overlay permission.
     */
    permissionOverlay: undefined,
    /**
     * Gets is the current page has pixel permission
     */
    permissionPixel: undefined,
    /**
     * Gets the position of the mouse is it is inside the runescape client, use a1lib.mousePosition() for an object with {x,y}. (x=r>>16, y=r&0xFFFF)
     * [Gamestate] permission required.
     */
    mousePosition: undefined,
    /**
     * Returns wether the runescape window is currently the active window.
     * [Gamestate] permission required.
     */
    rsActive: undefined,
    /**
     * Gets the time in milliseconds since the last click in the runescape window.
     * [Gamestate] permission required.
     */
    rsLastActive: undefined,
    /**
     * Gets the timestamp of the last world hop recorded by Alt1.
     * [Gamestate] permission required.
     */
    lastWorldHop: undefined,
    /**
     * Gets the current world that the player is logged in to. Returns -1 when the player is not logged in or in the lobby. Some times also returns -1 on world with weird proxy setups (aus)
     * [Gamestate] permission required.
     */
    currentWorld: undefined,
    /**
     * Gets the ping of the current connected game server.
     * [Gamestate] permission required.
     */
    rsPing: undefined,
    /**
     * Returns the detected fps of runescape
     * [Gamestate] permission required.
     */
    rsFps: undefined,
    /**
     * Gets information about how the app was opened, this includes the recognised text and regex matches if opened by pressing alt+1.
     * [Installed] permission required.
     */
    openInfo: undefined,
}

/**
 * This function simulates the user starting to drag the frame border. You can use this to add useable control area to the app.
 * @param {Boolean}	left
 * @param {Boolean}	top
 * @param {Boolean}	right
 * @param {Boolean}	bottom
 * @returns {System.Void}
 */
alt1.userResize = function (left, top, right, bottom) { }
/**
 * Tells Alt1 to fetch identification information from the given url. The file should contain a json encoded object with properties about the app.Most importantly it should have a configUrl property that links to itself and a appUrl property that links to the starting page of the app.There is a full appconfig in the example app.
 * @param {String}	url
 * @returns {System.Void}
 */
alt1.identifyAppUrl = function (url) { }
/**
 * Opens the specified link in the default browser.
 * @param {String}	url
 * @returns {System.Boolean}
 */
alt1.openBrowser = function (url) { }
/**
 * Removes the tooltip.
 * [Installed] permission required.
 * @returns {System.Void}
 */
alt1.clearTooltip = function () { }
/**
 * Cleans up all tasks for this app on Alt1, it stops pixel event listeners and removes possible cursor tooltips.
 * [Installed] permission required.
 * @returns {System.Void}
 */
alt1.clearBinds = function () { }
/**
 * Add a status text to the Alt1 toolbar on the rs client.
 * [Overlay] permission required.
 * @param {String}	text
 * @returns {System.Void}
 */
alt1.setStatusText = function (text) { }
/**
 * Sets the status daemon of this app. The given server url is called periodicly with a POST request containing with the state string.The server should respond with a json object that contains the following properties:
string state - the state string to use for the next request.int nextRun - time in milliseconds until the next run.Alert[] alerts - an array containing alerts: {string title, string body}Status[] status - an array containing the status: {string status}
 * [Overlay] permission required.
 * @param {String}	serverUrl
 * @param {String}	state
 * @returns {System.Void}
 */
alt1.registerStatusDaemon = function (serverUrl, state) { }
/**
 * Returns the current state string of the status daemon of ths app.
 * [Overlay] permission required.
 * @returns {System.String}
 */
alt1.getStatusDaemonState = function () { }
/**
 * Shows a notification with the given title and message. The icon argument is reserved and ignored, you should pass an empty string.
 * [Overlay] permission required.
 * @param {String}	title
 * @param {String}	message
 * @param {String}	icon
 * @returns {System.Void}
 */
alt1.showNotification = function (title, message, icon) { }
/**
 * Closes the app
 * [Installed] permission required.
 * @returns {System.Void}
 */
alt1.closeApp = function () { }
/**
 * Sets a tooltip with specified text that chases the cursor. It can be removed by calling this function again with an empty string or using the clearTooltip function.
 * [Overlay] permission required.
 * @param {String}	tooltip
 * @returns {System.Boolean}
 */
alt1.setTooltip = function (tooltip) { }
/**
 * Changes the Runescape window in the task bar to show a progress bar. Type is the type of bar - 0: reset/normal, 1: in progress, 2: error (red bar), 3: unknown (animated bar), 4: paused (orange bar). Progress is the size of the bar. (0-100)
 * [Overlay] permission required.
 * @param {Int32}	type
 * @param {Double}	progress
 * @returns {System.Void}
 */
alt1.SetTaskbarProgress = function (type, progress) { }
/**
 * [Experimental] Adds a string to the title bar of the rs client. There can only be one per app and you can clear it by calling this function again with an empty string.
 * [Overlay] permission required.
 * @param {String}	text
 * @returns {System.Void}
 */
alt1.setTitleBarText = function (text) { }
/**
 * Overlays a rectangle on the screen. Color is a 8bpp rgba int which can be created using the mixcolor function in the library. Time is in milliseconds.
 * [Overlay] permission required.
 * @param {Int32}	color
 * @param {Int32}	x
 * @param {Int32}	y
 * @param {Int32}	w
 * @param {Int32}	h
 * @param {Int32}	time
 * @param {Int32}	lineWidth
 * @returns {System.Boolean}
 */
alt1.overLayRect = function (color, x, y, w, h, time, lineWidth) { }
/**
 * Overlays some text on the screen. Color is a 8bpp rgba int which can be created using the mixcolor function in the library. Time is in milliseconds.
 * [Overlay] permission required.
 * @param {String}	str
 * @param {Int32}	color
 * @param {Int32}	size
 * @param {Int32}	x
 * @param {Int32}	y
 * @param {Int32}	time
 * @returns {System.Boolean}
 */
alt1.overLayText = function (str, color, size, x, y, time) { }
/**
 * Overlays some text, with extra options. Centered centers the text horizontally and vertically. Fontname is the name of the font to use, the default sans-serif font is used if this font can not be found.
 * [Overlay] permission required.
 * @param {String}	str
 * @param {Int32}	color
 * @param {Int32}	size
 * @param {Int32}	x
 * @param {Int32}	y
 * @param {Int32}	time
 * @param {String}	fontname
 * @param {Boolean}	centered
 * @param {Boolean}	shadow
 * @returns {System.Boolean}
 */
alt1.overLayTextEx = function (str, color, size, x, y, time, fontname, centered, shadow) { }
/**
 * Overlays a line on the screen. Color is a 8bpp rgba int which can be created using the mixcolor function in the library. Time is in milliseconds.
 * [Overlay] permission required.
 * @param {Int32}	color
 * @param {Int32}	width
 * @param {Int32}	x1
 * @param {Int32}	y1
 * @param {Int32}	x2
 * @param {Int32}	y2
 * @param {Int32}	time
 * @returns {System.Boolean}
 */
alt1.overLayLine = function (color, width, x1, y1, x2, y2, time) { }
/**
 * [Internal, use alt1lib] Overlays an image on the screen. imgstr is a base64 encoded 8bpp bgra image buffer. imgwidth is the width of the image, this is required to decode the image.
 * [Overlay] permission required.
 * @param {Int32}	x
 * @param {Int32}	y
 * @param {String}	imgstr
 * @param {Int32}	imgwidth
 * @param {Int32}	time
 * @returns {System.Void}
 */
alt1.overLayImage = function (x, y, imgstr, imgwidth, time) { }
/**
 * Removes all overlay with given group name from screen. You can give overlays a group by calling the overlaySetGroup function before drawing
 * [Overlay] permission required.
 * @param {String}	group
 * @returns {System.Void}
 */
alt1.overLayClearGroup = function (group) { }
/**
 * Set the group name of all following draw overlay calls untill called again with a different name. Groups can be used remove overlays again.
 * [Overlay] permission required.
 * @param {String}	group
 * @returns {System.Void}
 */
alt1.overLaySetGroup = function (group) { }
/**
 * Stops all overlays in the current group from updating. You can use this to draw combined overlays without flickering. Call overLayContinueGroup when done to continue normal drawing, or overLayRefreshGroup to only redraw the overlay when specificly called. Frozen overlays have an extended timer, but still not unlimited.
 * [Overlay] permission required.
 * @param {String}	group
 * @returns {System.Void}
 */
alt1.overLayFreezeGroup = function (group) { }
/**
 * Continues automatic redrawing of this overlay group.
 * [Overlay] permission required.
 * @param {String}	group
 * @returns {System.Void}
 */
alt1.overLayContinueGroup = function (group) { }
/**
 * Does a single redraw of the current overlay group while leaving the group frozen.
 * [Overlay] permission required.
 * @param {String}	group
 * @returns {System.Void}
 */
alt1.overLayRefreshGroup = function (group) { }
/**
 * Sets the z-index for an overlay group. Group with higher z-index are drawn over lower ones. The default value is 0.
 * [Overlay] permission required.
 * @param {String}	groupname
 * @param {Int32}	zIndex
 * @returns {System.Void}
 */
alt1.overLaySetGroupZIndex = function (groupname, zIndex) { }
/**
 * [Internal, use alt1lib] Returns a string containing pixel data about the specified region inside the rs window. The string is base64 encoded 8bpp argb buffer of the requested image.
 * [Pixel] permission required.
 * @param {Int32}	x
 * @param {Int32}	y
 * @param {Int32}	w
 * @param {Int32}	h
 * @returns {System.String}
 */
alt1.getRegion = function (x, y, w, h) { }
/**
 * [Internal, use alt1lib] Returns a string containing pixel data about the specified regions inside the rs window. The string is base64 encoded 8bpp argb buffer of the requested images concatenated after eachother.
 * [Pixel] permission required.
 * @param {String}	rectsjson
 * @returns {System.String}
 */
alt1.getRegionMulty = function (rectsjson) { }
/**
 * [Internal, use alt1lib] Binds a region of the rs window in memory to apply functions to it without having to transfer it to the browser. Returns a non-zero integer on success or 0 on failure. This function returns a identifier to be used in subsequent 'bind-' calls. This id is currently always 1 on succes as only one bound image is allowed.
 * [Pixel] permission required.
 * @param {Int32}	x
 * @param {Int32}	y
 * @param {Int32}	w
 * @param {Int32}	h
 * @returns {System.Int32}
 */
alt1.bindRegion = function (x, y, w, h) { }
/**
 * [Internal, use alt1lib] Same as bindRegion, but uses screen coordinates and can see pixels outside of rs. This method is much slower per call.
 * [Pixel] permission required.
 * @param {Int32}	x
 * @param {Int32}	y
 * @param {Int32}	w
 * @param {Int32}	h
 * @returns {System.Int32}
 */
alt1.bindScreenRegion = function (x, y, w, h) { }
/**
 * [Internal, use alt1lib] Returns a rubregion of the bound image as base64 encoded 8bpp abgr buffer.
 * [Pixel] permission required.
 * @param {Int32}	id
 * @param {Int32}	x
 * @param {Int32}	y
 * @param {Int32}	w
 * @param {Int32}	h
 * @returns {System.String}
 */
alt1.bindGetRegion = function (id, x, y, w, h) { }
/**
 * Tries to read a antialised string on the bound image, with the given font. The color of text will be detected and chosen from a set of preset colors. Valid font names are currently 'chat','chatmono' and 'xpcounter'. This function returns an empty string on failure.
 * [Pixel] permission required.
 * @param {Int32}	id
 * @param {String}	fontname
 * @param {Int32}	x
 * @param {Int32}	y
 * @returns {System.String}
 */
alt1.bindReadString = function (id, fontname, x, y) { }
/**
 * Same as bindReadString, however requires an extra color argument. The color is a 8bpp rgba color int that can be mixed with the a1lib.mixcolor function. The should be the base color, or brightest color in the to be detected text.
 * [Pixel] permission required.
 * @param {Int32}	id
 * @param {String}	fontname
 * @param {Int32}	color
 * @param {Int32}	x
 * @param {Int32}	y
 * @returns {System.String}
 */
alt1.bindReadColorString = function (id, fontname, color, x, y) { }
/**
 * Same as bindReadString, however allows extra arguments in an object. Possible arguments and default values:
 * bool allowgap=false - scan empty space for more text after reading text
 * string fontname=chatfont - the font to detect
 * int[] colors=[~20 standard colors] - array of color ints to detect
 * [Pixel] permission required.
 * @param {Int32}	id
 * @param {Int32}	x
 * @param {Int32}	y
 * @param {String}	args
 * @returns {System.String}
 */
alt1.bindReadStringEx = function (id, x, y, args) { }
/**
 * [Incomplete] Adds a font for ocr, this font can be used in the bindReadString functions. The jsonfont can be generated from an image using a generator, please contant me if you plan to use this.
 * [Pixel] permission required.
 * @param {String}	name
 * @param {String}	jsonFont
 * @returns {System.Boolean}
 */
alt1.addOCRFont = function (name, jsonFont) { }
/**
 * Reads rightlcick menu text, this function is very fragile and is different from the other readText functions. It requires an exact baseline y coord.
 * [Pixel] permission required.
 * @param {Int32}	id
 * @param {Int32}	x
 * @param {Int32}	y
 * @returns {System.String}
 */
alt1.bindReadRightClickString = function (id, x, y) { }
/**
 * Retrieves a single pixel from the bound image, this is not a recommended method as it is very slow
 * [Pixel] permission required.
 * @param {Int32}	id
 * @param {Int32}	x
 * @param {Int32}	y
 * @returns {System.Int32}
 */
alt1.bindGetPixel = function (id, x, y) { }
/**
 * [Internal, use alt1lib] Finds the given subimage in the bound image. This function is way quicker than possible in js. imgstr is a base64 encoded 8bpp bgra image buffer. imgwidth is the width of the image, this is required to decode the image. x,y,w,h defines the area in the bound image to be searched.
 * [Pixel] permission required.
 * @param {Int32}	id
 * @param {String}	imgstr
 * @param {Int32}	imgwidth
 * @param {Int32}	x
 * @param {Int32}	y
 * @param {Int32}	w
 * @param {Int32}	h
 * @returns {System.String}
 */
alt1.bindFindSubImg = function (id, imgstr, imgwidth, x, y, w, h) { }
/**
 * Simple info about how the API works.
 * @returns {System.String}
 */
alt1.help = function () { }
/**
 * This function returns information about a single property with the given name.
 * @param {String}	propname
 * @returns {System.String}
 */
alt1.helpProp = function (propname) { }
/**
 * Returns a html document with documentation about every function and property exposed.
 * @returns {System.String}
 */
alt1.helpFull = function () { }
/**
 * Returns a file that can be used to add the alt1 api to Visual Studio IntelliSense.
 * @returns {System.String}
 */
alt1.helpIntelliSense = function () { }
/**
 * Returns a types.d.ts file that represents the alt1 api and can be used to get working code completion in typescript.
 * @returns {System.String}
 */
alt1.helpTypescript = function () { }
/**
 * Returns a file that can be used to add the alt1 api to editors using the JSDoc format
 * @returns {System.String}
 */
alt1.helpJSDoc = function () { }
/**
 * No info available about this method.
 * @returns {System.Type}
 */
alt1.GetType = function () { }
