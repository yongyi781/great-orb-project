var Point = (function () {
    /**
     * Constructs a 2D point.
     * @param {Number} x The x-coordinate.
     * @param {Number} y The y-coordinate.
     */
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.add = function (other) { return new Point(this.x + other.x, this.y + other.y); };
    Point.prototype.subtract = function (other) { return new Point(this.x - other.x, this.y - other.y); };
    Point.prototype.multiply = function (scalar) { return new Point(scalar * this.x, scalar * this.y); };
    Point.prototype.negate = function () { return new Point(-this.x, -this.y); };
    Point.prototype.equals = function (other) { return this.x === other.x && this.y === other.y; };
    Point.prototype.clone = function () { return new Point(this.x, this.y); };
    Point.prototype.compare = function (other) { return this.y === other.y ? (this.x === other.x ? 0 : this.x < other.x ? -1 : 1) : this.y < other.y ? -1 : 1; };
    Point.prototype.toString = function () { return "(" + this.x + "," + this.y + ")"; };
    /**
     * Returns whether a point represents NaN.
     * @param {Point} point the point.
     * @returns {Boolean}
     */
    Point.isNaN = function (point) { return point === void 0 || isNaN(point.x) || isNaN(point.y); };
    /**
      * Returns the squared distance from this point to another.
      * @param {Point} left A point.
      * @param {Point} right A point.
      * @returns {Number}
      */
    Point.distanceSquared = function (left, right) {
        var dx = left.x - right.x;
        var dy = left.y - right.y;
        return dx * dx + dy * dy;
    };
    Point.walkingDistance = function (left, right) {
        return Math.max(Math.abs(left.x - right.x), Math.abs(left.y - right.y));
    };
    Point.lerp = function (left, right, t) {
        if (Point.isNaN(left))
            return right;
        if (Point.isNaN(right))
            return left;
        return new Point((1 - t) * left.x + t * right.x, (1 - t) * left.y + t * right.y);
    };
    Point.parse = function (str) {
        if (str[0] === "(" || str[0] === "[")
            str = str.substring(1, str.length - 1);
        var arr = str.split(",", 2);
        return new Point(parseInt(arr[0], 10), parseInt(arr[1], 10));
    };
    Point.zero = new Point(0, 0);
    Point.NaN = new Point(NaN, NaN);
    Point.gridOffsets = [
        new Point(-1, 0), new Point(1, 0), new Point(0, -1), new Point(0, 1),
        new Point(-1, -1), new Point(-1, 1), new Point(1, -1), new Point(1, 1)
    ];
    return Point;
})();
