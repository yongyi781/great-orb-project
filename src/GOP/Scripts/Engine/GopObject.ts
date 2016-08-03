class GopObject {
    prevLocation: Point;

    constructor(public location: Point) {
        this.location = location;
    }

    get isDead() { return Point.isNaN(this.location); }

    getDrawLocation(tickProgress: number) {
        return Point.lerp(this.prevLocation, this.location, tickProgress);
    }
}
