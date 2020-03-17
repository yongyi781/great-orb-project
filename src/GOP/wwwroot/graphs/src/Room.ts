enum Dir {
    Invalid = -1, W, N, E, S
}

const NUM_DIRS = 4;

namespace Dir {
    export function flip(dir: Dir) { return (dir + 2) % 4; }
    export function rotateClockwise(dir: Dir) { return (dir + 1) % 4; }
    export function rotateCounterclockwise(dir: Dir) { return (dir + 3) % 4; }

    export function toPoint(dir: Dir) {
        switch (dir) {
            case Dir.W:
                return pt(-1, 0);
            case Dir.N:
                return pt(0, -1);
            case Dir.E:
                return pt(1, 0);
            case Dir.S:
                return pt(0, 1);
            default:
                return pt(0, 0);
        }
    }

    export function fromPoint({ x, y }: Point) {
        if (y === 0) {
            if (x === 0)
                return Dir.Invalid;
            return x < 0 ? Dir.W : Dir.E;
        } else if (x === 0) {
            return y < 0 ? Dir.N : Dir.S;
        }
        return Dir.Invalid;
    }

    export function parse(str: string) {
        return Dir[<"W" | "N" | "E" | "S">str];
    }
}

class Point {
    constructor(public x: number, public y: number) { }

    static equals(left: Point, right: Point) { return left.x === right.x && left.y === right.y };
    static add({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point) { return pt(x1 + x2, y1 + y2); }
    static addDir(p: Point, dir: Dir) { return this.add(p, Dir.toPoint(dir)); }
    static scale({ x, y }: Point, f: number) { return pt(x * f, y * f); }
    static str({ x, y }: Point) { return `(${x}, ${y})`; }
}

function pt(x: number, y: number) { return new Point(x, y); }

class Permutation {
    /**
     * 0: where W goes, 1: where N goes, 2: where E goes, 3: where S goes.
     * Default is the identity.
     */
    constructor(public map = [Dir.W, Dir.N, Dir.E, Dir.S]) { }

    apply(dir: Dir) { return this.map[dir]; }

    compose(right: Permutation) {
        return new Permutation([this.map[right.map[0]], this.map[right.map[1]], this.map[right.map[2]], this.map[right.map[3]]]);
    }

    inverse() {
        let map = [];
        for (let i = 0; i < NUM_DIRS; i++) {
            map[this.map[i]] = i;
        }
        return new Permutation(map);
    }

    equals(other: Permutation) {
        return this.map.every((v, i) => other.map[i] === v);
    }

    toMatrix() {
        let { x: a, y: b } = Dir.toPoint(this.apply(Dir.E));
        let { x: c, y: d } = Dir.toPoint(this.apply(Dir.S));
        return { a, b, c, d };
    }
}

const identity = new Permutation();
const flipHorizontal = new Permutation([Dir.E, Dir.N, Dir.W, Dir.S]);
const flipVertical = new Permutation([Dir.W, Dir.S, Dir.E, Dir.N]);
const rotateClockwise = new Permutation([Dir.N, Dir.E, Dir.S, Dir.W]);
const rotateCounterclockwise = new Permutation([Dir.S, Dir.W, Dir.N, Dir.E]);
const rotate180 = new Permutation([Dir.E, Dir.S, Dir.W, Dir.N]);

class Room {
    static colors = [
        "black", "blue", "green", "red", "#7f00ff", "maroon", "turquoise", "black", "gray",
        "gold"
    ];

    constructor(public id: number, public visited = false) {
        this.color = id >= Room.colors.length ? "black" : Room.colors[id];
    }

    /** E, N, W, S in that order */
    neighbors: (Room | null)[] = [];
    transitionFunctions: Permutation[] = [new Permutation(), new Permutation(), new Permutation(), new Permutation()];

    color: string;

    to(dir: Dir) {
        return this.neighbors[dir];
    }

    degree() {
        return this.neighbors.filter(x => x != null).length;
    }

    getColor() {
        return this.color;
    }

    connect({ dir, other, otherDir = Dir.flip(dir), flipOrientation = false, allowMultipleInEdges = false }: { dir: Dir; other: Room; otherDir?: number; flipOrientation?: boolean; allowMultipleInEdges?: boolean; }) {
        // Compute the transition function
        let map = [];
        for (let d = 0; d < NUM_DIRS; d++) {
            map[d] = ((flipOrientation ? -1 : 1) * (d - dir) + Dir.flip(otherDir) + NUM_DIRS) % NUM_DIRS;
        }
        return this.connectByTransitionFunction({ dir, other, transitionFunction: new Permutation(map), allowMultipleInEdges });
    }

    connectByTransitionFunction({ dir, other, transitionFunction = identity, allowMultipleInEdges = false }: { dir: Dir; other: Room; transitionFunction?: Permutation; allowMultipleInEdges?: boolean; }) {
        let targetDir = Dir.flip(transitionFunction.apply(dir));
        if (other == null) {
            return { success: false, error: `Cannot connect ${this} to null.` };
        }
        let errorPrefix = `Can't connect ${this.id} to ${other.id}`;
        if (this.neighbors[dir] != null && !allowMultipleInEdges) {
            return { success: false, error: `${errorPrefix}; ${Dir[dir]} edge out of ${this} is already taken.` };
        }

        if (other.neighbors[targetDir] != null) {
            if (!allowMultipleInEdges)
                return { success: false, error: `${errorPrefix}; ${Dir[targetDir]} edge into ${other} is already taken.` };
            console.log(`Warning: ${Dir[targetDir]} edge into ${other} is already taken.`);
        } else {
            other.neighbors[targetDir] = this;
            other.transitionFunctions[targetDir] = transitionFunction.inverse();
        }

        this.neighbors[dir] = other;
        this.transitionFunctions[dir] = transitionFunction;
        return { success: true, error: "" };
    }

    toString() {
        return this.id.toString();
    }
}

/** Represents a room with a transformation. */
class RoomView {
    constructor(public room: Room, public transform = new Permutation()) { }

    to(dir: Dir) {
        let actual = this.transform.apply(dir);
        let newRoom = this.room.to(actual);
        if (newRoom == null)
            return null;

        let transition = this.room.transitionFunctions[actual];

        return new RoomView(newRoom, transition.compose(this.transform));
    }

    id() { return this.room.id; }
    getColor() { return this.room.getColor(); }
    visited() { return this.room.visited; }
    setVisited(value: boolean) { this.room.visited = value; }

    equals(other: RoomView | undefined) {
        return other != null && this.room === other.room && this.transform.equals(other.transform);
    }

    // drawEdge(ui: GraphUI, { x, y }: Point, dir: Dir) {
    //     let ctx = ui.context;

    //     let c = ui.toClientCoords({ x, y });
    //     let p0 = Point.add(c, Point.scale(Dir.toPoint(dir), ui.roomInnerSize / 2));
    //     let p1 = Point.add(p0, Point.scale(Dir.toPoint(dir), ui.edgeLength));
    //     ctx.strokeStyle = "black";
    //     ctx.lineWidth = 1;
    //     ctx.beginPath();
    //     ctx.moveTo(p0.x, p0.y);
    //     ctx.lineTo(p1.x, p1.y);
    //     ctx.stroke();
    // }

    drawWall(ui: GraphUI, { x, y }: Point, dir: Dir) {
        let ctx = ui.context;

        let c = ui.toClientCoords({ x, y });
        let p0 = Point.add(c, Point.scale(Dir.toPoint(dir), ui.roomInnerSize / 2));
        let p1 = Point.add(p0, Point.scale(Dir.toPoint(Dir.rotateClockwise(dir)), ui.roomInnerSize / 2));
        let p2 = Point.add(p0, Point.scale(Dir.toPoint(Dir.rotateCounterclockwise(dir)), ui.roomInnerSize / 2));
        ctx.strokeStyle = ui.wallColor;
        ctx.lineWidth = ui.wallWidth;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }

    draw(ui: GraphUI, { x, y }: Point, parentDir: Dir) {
        let c = ui.toClientCoords({ x, y });
        let ctx = ui.context;

        let text = this.visited() ? this.id().toString() : "?";
        let color = this.visited() ? this.getColor() : ui.unvisitedRoomTextColor;

        ctx.fillStyle = this.visited() ? ui.roomColor : ui.unvisitedRoomColor;
        ctx.strokeStyle = this.visited() ? ui.roomOutlineColor : ui.unvisitedRoomOutlineColor;

        ctx.save();
        // Rotate the room unless it's a question mark.
        if (this.visited()) {
            let mat = this.transform.inverse().toMatrix();
            ctx.translate(c.x, c.y);
            ctx.transform(mat.a, mat.b, mat.c, mat.d, 0, 0);
            ctx.translate(-c.x, -c.y);
        }
        ctx.lineWidth = 1;
        ctx.fillRect(c.x - ui.roomInnerSize / 2, c.y - ui.roomInnerSize / 2, ui.roomInnerSize, ui.roomInnerSize);
        ctx.strokeRect(c.x - ui.roomInnerSize / 2, c.y - ui.roomInnerSize / 2, ui.roomInnerSize, ui.roomInnerSize);
        ctx.fillStyle = color;
        ctx.fillText(text, c.x, c.y);
        ctx.restore();

        // Draw edges
        for (let d = 0; d < 4; d++) {
            if (this.to(d) == null) {
                this.drawWall(ui, { x, y }, d);
            }
        }

        // Draw player, transformed relative to this.
        if (ui.roomView.room === this.room) {
            ctx.save();
            let mat = this.transform.inverse().compose(ui.roomView.transform).toMatrix();
            ctx.translate(c.x, c.y);
            ctx.transform(mat.a, mat.b, mat.c, mat.d, 0, 0);
            ctx.translate(-c.x, -c.y);
            ctx.drawImage(ui.playerImage, c.x - ui.roomInnerSize / 4, c.y - ui.roomInnerSize / 4);
            ctx.restore();
        }
    }
}
