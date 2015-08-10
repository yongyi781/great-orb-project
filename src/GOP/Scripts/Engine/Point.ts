class Point {
    /**
     * Constructs a 2D point.
     * @param {Number} x The x-coordinate.
     * @param {Number} y The y-coordinate.
     */
    constructor(public x: number, public y: number) { }

    add(other: Point) { return new Point(this.x + other.x, this.y + other.y); }
    subtract(other: Point) { return new Point(this.x - other.x, this.y - other.y); }
    multiply(scalar: number) { return new Point(scalar * this.x, scalar * this.y); }
    negate() { return new Point(-this.x, -this.y); }
    equals(other: Point) { return this.x === other.x && this.y === other.y; }
    clone() { return new Point(this.x, this.y); }
    compare(other: Point) { return this.y === other.y ? (this.x === other.x ? 0 : this.x < other.x ? -1 : 1) : this.y < other.y ? -1 : 1; }
    toString() { return "(" + this.x + "," + this.y + ")"; }

    /**
     * Returns whether a point represents NaN.
     * @param {Point} point the point.
     * @returns {Boolean}
     */
    static isNaN(point: Point) { return point === void 0 || isNaN(point.x) || isNaN(point.y) }
    
    /**
      * Returns the squared distance from this point to another.
      * @param {Point} left A point.
      * @param {Point} right A point.
      * @returns {Number}
      */
    static distanceSquared(left: Point, right: Point) {
        var dx = left.x - right.x;
        var dy = left.y - right.y;
        return dx * dx + dy * dy;
    }

    static walkingDistance(left: Point, right: Point) {
        return Math.max(Math.abs(left.x - right.x), Math.abs(left.y - right.y));
    }

    static lerp(left: Point, right: Point, t: number) {
        if (Point.isNaN(left)) return right;
        if (Point.isNaN(right)) return left;
        return new Point((1 - t) * left.x + t * right.x, (1 - t) * left.y + t * right.y);
    }

    static parse(str: string) {
        if (str[0] === "(" || str[0] === "[")
            str = str.substring(1, str.length - 1);
        var arr = str.split(",", 2);
        return new Point(parseInt(arr[0], 10), parseInt(arr[1], 10));
    }

    static zero = new Point(0, 0);
    static NaN = new Point(NaN, NaN);
    static gridOffsets = [
        new Point(-1, 0), new Point(1, 0), new Point(0, -1), new Point(0, 1),
        new Point(-1, -1), new Point(-1, 1), new Point(1, -1), new Point(1, 1)
    ];
}
