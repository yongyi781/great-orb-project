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
    export function parsePointArray(str: string) {
        try {
            return toPointArray(JSON.parse(str));
        } catch (e) {
            // Return undefined.
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
    export function getQueryAsPointArray(name: string, defaultValue?: string) {
        let queryString = getQueryAsString(name);
        return queryString === void 0 ? defaultValue : parsePointArray(queryString);
    }

    /**
     * Binds the enter key for an input control to a button.
     * @param input The input control.
     * @param button The button to click.
     */
    export function bindEnterKeyToButton(input: JQuery, button: JQuery) {
        input.keydown(e => {
            if (e.keyCode === 13) {
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
     * Loads a custom altar and returns a promise containing the AltarData entry.
     * @param altar The altar ID.
     */
    export function loadCustomAltar(altar: number) {
        return $.getJSON("/api/altars/" + altar).then(data => {
            return {
                name: data.name,
                grid: JSON.parse(data.grid),
                spawns: parsePointArray(data.spawns),
                groundColor: JSON.parse(data.groundColor),
                waterColor: JSON.parse(data.waterColor),
                groundPattern: JSON.parse(data.groundPattern)
            };
        });
    }
}
