module Utils {
    /**
     * Returns a random integer between minValue (inclusive) and maxValue (exclusive).
     */
    export function getRandomInt(minValue, maxValue) {
        return Math.floor(Math.random() * (maxValue - minValue)) + minValue;
    }

    /**
     * Parses a string to a boolean. 'true' and '1' map to true, everything else maps to false.
     */
    export function parseBoolean(str: string) {
        var lowerStr = str.toLowerCase();
        return lowerStr === "true" || lowerStr === "1";
    }

    /**
     * Parses a string to an array of points. For example, [[3,4],[0,-2]].
     */
    export function parsePointArray(str: string) {
        var arr: any[];
        try {
            return toPointArray(JSON.parse(str));
        } catch (e) {
            // Return undefined.
        }
    }

    /**
     * Converts a normal array to an array of points. For example, [2, 3] becomes an array consisting of (2,3), and [[3,4],[4,4]] becomes an array of two points.
     */
    export function toPointArray(arr: any[]) {
        if (arr instanceof Array) {
            if (arr.length === 0)
                return [];
            if (typeof arr[0] === "number")   // Single point
                return [new Point(arr[0], arr[1])];
            return arr.map(a => new Point(a[0], a[1]));
        }
    }

    /**
     * Gets query string parameter by name.
     */
    export function getQueryAsString(name: string, defaultValue?: string) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? defaultValue : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    /**
     * Gets query string parameter by name, as a number.
     */
    export function getQueryAsNumber(name: string, defaultValue?: number) {
        var queryString = getQueryAsString(name);
        return queryString === void 0 ? defaultValue : parseInt(queryString, 10);
    }

    /**
     * Gets query string parameter by name, as a number.
     */
    export function getQueryAsBoolean(name: string, defaultValue?: boolean) {
        var queryString = getQueryAsString(name);
        return queryString === void 0 ? defaultValue : parseBoolean(queryString);
    }

    /**
     * Gets query string parameter by name, as a list of points.
     */
    export function getQueryAsPointArray(name: string, defaultValue?: string) {
        var queryString = getQueryAsString(name);
        return queryString === void 0 ? defaultValue : parsePointArray(queryString);
    }

    /**
     * Binds the enter key for an input control to a button.
     */
    export function bindEnterKeyToButton(input: JQuery, button: JQuery) {
        input.keydown(e => {
            if (e.keyCode === 13)
                button.click();
        });
    }

    export function uploadToSite(formData: FormData, success: any, error: any) {
        var a: JQueryAjaxSettings;
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
}
