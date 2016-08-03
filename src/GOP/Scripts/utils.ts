namespace Utils {
    /**
     * Returns a random integer between minValue (inclusive) and maxValue (exclusive).
     */
    export function getRandomInt(minValue: number, maxValue: number) {
        return Math.floor(Math.random() * (maxValue - minValue)) + minValue;
    }

    /**
     * Parses a string to a boolean. 'true' and '1' map to true, everything else maps to false.
     */
    export function parseBoolean(str: string) {
        let lowerStr = str.toLowerCase();
        return lowerStr === "true" || lowerStr === "1";
    }

    /**
     * Parses a string to an array of points. For example, [[3,4],[0,-2]].
     */
    export function parsePointArray(str: string, defaultValue?: Point[]) {
        try {
            return toPointArray(JSON.parse(str));
        } catch (e) {
            return defaultValue;
        }
    }

    /**
     * Converts a normal array to an array of points. For example, [2, 3] becomes an array consisting of (2,3), and [[3,4],[4,4]] becomes an array of two points.
     * @param arr The array.
     */
    export function toPointArray(arr: any[]) {
        if (arr instanceof Array) {
            if (arr.length === 0) {
                return [];
            }
            if (typeof arr[0] === "number") {
                // Single point
                return [new Point(arr[0], arr[1])];
            }
            return arr.map(a => new Point(a[0], a[1]));
        }
    }

    /**
     * Converts a point array to JSON 2D array format.
     */
    export function pointArrayToJSON(arr: Point[]) {
        return JSON.stringify(arr.map(p => [p.x, p.y]));
    }

    /**
     * Gets query string parameter by name.
     * @param name The name of the parameter.
     * @param defaultValue The default value in case the parameter is not present.
     */
    export function getQueryAsString(name: string, defaultValue?: string) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        let regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? defaultValue : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    /**
     * Gets query string parameter by name, as a number.
     * @param name The name of the parameter.
     * @param defaultValue The default value in case the parameter is not present.
     */
    export function getQueryAsNumber(name: string, defaultValue?: number) {
        let queryString = getQueryAsString(name);
        return queryString === void 0 ? defaultValue : +queryString;
    }

    /**
     * Gets query string parameter by name, as an integer.
     * @param name The name of the parameter.
     * @param defaultValue The default value in case the parameter is not present.
     */
    export function getQueryAsInteger(name: string, defaultValue?: number) {
        let queryString = getQueryAsString(name);
        return queryString === void 0 ? defaultValue : parseInt(queryString, 10);
    }

    /**
     * Gets query string parameter by name, as a boolean.
     * @param name The name of the parameter.
     * @param defaultValue The default value in case the parameter is not present.
     */
    export function getQueryAsBoolean(name: string, defaultValue?: boolean) {
        let queryString = getQueryAsString(name);
        return queryString === void 0 ? defaultValue : parseBoolean(queryString);
    }

    /**
     * Gets query string parameter by name, as a list of points.
     * @param name The name of the parameter.
     * @param defaultValue The default value in case the parameter is not present.
     */
    export function getQueryAsPointArray(name: string, defaultValue?: Point[]) {
        let queryString = getQueryAsString(name);
        return queryString === void 0 ? defaultValue : parsePointArray(queryString, defaultValue);
    }

    /**
     * Binds the enter key for an input control to a button.
     * @param input The input control.
     * @param button The button to click.
     */
    export function bindEnterKeyToButton(input: HTMLInputElement, button: HTMLButtonElement) {
        input.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                button.click();
            }
        });
    }

    export function uploadToSite(formData: FormData, success: any, error: any) {
        $.ajax({
            url: "/Home/Upload",
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: success,
            error: error
        });
    }

    /**
     * Loads an altar (custom or not) and returns a promise for the load.
     * If the altar already exists, returns an empty resolved promise.
     * If it doesn't exist, it fetches it from the server and adds it to AltarData.
     * @param altar The altar ID.
     */
    export function loadAltar(altar: number) {
        if (altar in AltarData) {
            return $.Deferred<void>().resolve().promise();
        }

        let t0 = performance.now();
        return $.getJSON("/api/altars/" + altar).done(data => {
            let t1 = performance.now();
            console.debug(`Fetched altar ${altar} in ${t1 - t0} ms`);
            AltarData[altar] = {
                name: data.name,
                grid: JSON.parse(data.grid),
                spawns: parsePointArray(data.spawns),
                groundColor: JSON.parse(data.groundColor),
                waterColor: JSON.parse(data.waterColor),
                groundPattern: JSON.parse(data.groundPattern)
            };
        });
    }

    /**
     * Loads an altar range (custom or not) and returns a promise for the load.
     * @param altar The altar ID.
     */
    export function loadAltars(min: number, max: number) {
        let t0 = performance.now();
        return $.getJSON(`/api/altars?min=${min}&max=${max}`).done(data => {
            let t1 = performance.now();
            console.debug(`Fetched altars ${min} to ${max} in ${t1 - t0} ms`);
            for (let item of data) {
                AltarData[item.id] = {
                    name: item.name,
                    grid: JSON.parse(item.grid),
                    spawns: parsePointArray(item.spawns),
                    groundColor: JSON.parse(item.groundColor),
                    waterColor: JSON.parse(item.waterColor),
                    groundPattern: JSON.parse(item.groundPattern)
                };
            }
        });
    }

    /**
     * Loads all altar names.
     */
    export function loadAltarNames() {
        let t0 = performance.now();
        return $.getJSON("/api/altars/names").done(data => {
            let t1 = performance.now();
            console.debug(`Fetched all altar names in ${t1 - t0} ms`);
            for (let item of data) {
                if (AltarData[item.id] !== undefined) {
                    AltarData[item.id].name = item.name;
                } else {
                    AltarData[item.id] = { name: item.name };
                }
            }
        });
    }
}
