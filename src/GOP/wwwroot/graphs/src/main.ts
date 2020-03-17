interface Connection { s: Room; sDir: Dir; t: Room; tDir?: Dir; flip?: boolean; }

namespace Connection {
    export var regex = /^(\d+)([WNES])(\d+)([WNES]?)(['!]?)$/;

    export function parse(str: string, roomList: Room[] = []): Connection {
        let arr = str.toUpperCase().match(regex);
        if (arr === null) {
            throw `Cannot parse string ${str}.`;
        }
        let s = parseInt(arr[1]) - 1;
        if (!(s in roomList))
            vm.$set(roomList, s, new Room(s + 1, vm.godMode));
        let t = parseInt(arr[3]) - 1;
        if (!(t in roomList))
            vm.$set(roomList, t, new Room(t + 1, vm.godMode));
        return {
            s: roomList[s],
            sDir: Dir.parse(arr[2]),
            t: roomList[t],
            tDir: Dir.parse(arr[4]),
            flip: arr[5] !== ""
        };
    }

    export function parseMany(str: string, roomList: Room[]) {
        return str.split(/[,\s]+/).map(s => parse(s, roomList));
    }

    export function execute(list: Connection[]) {
        for (let c of list) {
            let r = c.s.connect({ dir: c.sDir, other: c.t, otherDir: c.tDir, flipOrientation: c.flip, allowMultipleInEdges: vm.allowMultipleInEdges });
            if (!r.success) {
                throw r.error;
            }
        }
    }
}

interface MyConnection { s: number; sDir: Dir; t: number; tDir?: Dir; flip?: boolean; }

let u = new URLSearchParams(location.search);

const defaults: Record<string, any> = {
    godMode: true,
    allowMultipleInEdges: false,
    graph: "custom",
    code: "",
    drawDistance: 3
}

const MyApp = Vue.extend({
    data() {
        return {
            godMode: u.get("godMode") !== "false",
            allowMultipleInEdges: u.get("allowMultipleInEdges") === "true",
            graph: u.get("graph") || "mobius",
            code: u.get("code") || defaults.code as string,
            rooms: [] as Room[],
            invalidCodeFeedback: "",
            drawDistance: u.get("drawDistance") || defaults.drawDistance
        };
    }
})

const vm = new MyApp({
    el: "#app",
    data: {
    },
    computed: {
        statusText: function () {
            let notVisited = this.rooms.filter(r => !r.visited).map(r => r.id);
            return notVisited.length === 0 ? "Congratulations! You found all the rooms!" : `${notVisited.length} rooms left to find: ${notVisited.join(", ")}`;
        }
    },
    watch: {
        godMode: function () {
            console.log(this);
        },
        graph: function () {
            setGraph();
        },
        code: function () {
            customCodeInput.setCustomValidity("");
            codeForm.classList.remove("was-validated");
        },
        drawDistance: function (value) {
            ui.setDrawDistance(value);
            ui.render();
            updateHistoryState();
        }
    }
});

const mainCanvas = document.querySelector("#mainCanvas") as HTMLCanvasElement;
const context = mainCanvas.getContext("2d") as CanvasRenderingContext2D;
const codeForm = document.querySelector("#codeForm") as HTMLFormElement;
const customCodeInput = document.querySelector("#customCode") as HTMLInputElement;
const codeSubmit = document.querySelector("#codeSubmit") as HTMLButtonElement;
const container = document.querySelector("#app") as HTMLDivElement;

mainCanvas.width = mainCanvas.height = Math.min(innerWidth - 20, innerHeight- 200);

const ui = new GraphUI(context, vm.drawDistance);

const moveMapping: Record<string, Dir> = { ArrowLeft: Dir.W, ArrowRight: Dir.E, ArrowUp: Dir.N, ArrowDown: Dir.S };
const turnMapping: Record<string, Permutation> = {
    ArrowLeft: rotateCounterclockwise,
    ArrowRight: rotateClockwise
};

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function reset2(numRooms: number, connections: MyConnection[]) {
    vm.rooms = [];
    for (let i = 1; i <= numRooms; i++) {
        vm.rooms.push(new Room(i, vm.godMode));
    }
    for (let c of connections) {
        let r = vm.rooms[c.s - 1].connect({ dir: c.sDir, other: vm.rooms[c.t - 1], otherDir: c.tDir, flipOrientation: c.flip, allowMultipleInEdges: vm.allowMultipleInEdges });
        if (!r.success) {
            throw r.error;
        }
    }
    ui.reset(new RoomView(vm.rooms[0]));
    ui.render();
}

function resetWithCode(str: string) {
    vm.rooms = [new Room(1, true)];
    let cList = Connection.parseMany(str, vm.rooms);
    Connection.execute(cList);
    ui.reset(new RoomView(vm.rooms[0]));
    if (vm.godMode) {
        vm.rooms.forEach(r => r.visited = true);
    }
    ui.render();
}

function resetToMobiusStrip(width = 10, height = 3) {
    let connections: MyConnection[] = [];
    for (let y = 0; y < height; y++) {
        for (let x = 1; x <= width; x++) {
            if (x < width)
                connections.push({ sDir: Dir.E, s: y * width + x, t: y * width + (x % width + 1) });
            if (y < height - 1)
                connections.push({ sDir: Dir.S, s: y * width + x, t: ((y + 1) % height) * width + x });
        }
    }
    // Connect right edge flipped to left edge
    for (let y = 0; y < height; y++) {
        connections.push({ sDir: Dir.E, s: (y + 1) * width, t: (height - y - 1) * width + 1, flip: true });
    }
    reset2(width * height, connections);
}

function resetToKleinBottle(width = 4, height = 4) {
    let connections: MyConnection[] = [];
    for (let y = 0; y < height; y++) {
        for (let x = 1; x <= width; x++) {
            if (x < width)
                connections.push({ sDir: Dir.E, s: y * width + x, t: y * width + (x % width + 1) });
            connections.push({ sDir: Dir.S, s: y * width + x, t: ((y + 1) % height) * width + x });
        }
    }
    // Connect right edge flipped to left edge
    for (let y = 0; y < height; y++) {
        connections.push({ sDir: Dir.E, s: (y + 1) * width, t: (height - y - 1) * width + 1, flip: true });
    }
    reset2(width * height, connections);
}

function resetToProjectivePlane(width = 4, height = 4) {
    let connections: MyConnection[] = [];
    for (let y = 0; y < height; y++) {
        for (let x = 1; x <= width; x++) {
            if (x < width)
                connections.push({ sDir: Dir.E, s: y * width + x, t: y * width + (x % width + 1) });
            if (y < height - 1)
                connections.push({ sDir: Dir.S, s: y * width + x, t: ((y + 1) % height) * width + x });
        }
    }
    // Connect right edge flipped to left edge
    for (let y = 0; y < height; y++) {
        connections.push({ sDir: Dir.E, s: (y + 1) * width, t: (height - y - 1) * width + 1, flip: true });
    }
    for (let x = 1; x <= width; x++) {
        connections.push({ sDir: Dir.N, s: x, t: (height - 1) * width + (width + 1 - x), flip: true });
    }
    reset2(width * height, connections);
}

function resetToWeirdGraph() {
    vm.rooms = [];
    for (let i = 1; i <= 12; i++) {
        vm.rooms.push(new Room(i, vm.godMode));
    }

    for (let r = 0; r < vm.rooms.length; r++) {
        let j = r + 1;
        for (let i = 0; i < 4; i++) {
            vm.rooms[r].connectByTransitionFunction({ dir: i, other: vm.rooms[j++], allowMultipleInEdges: vm.allowMultipleInEdges });
        }
    }
    ui.reset(new RoomView(vm.rooms[0]));
    ui.render();
}

function resetToMobiusStrip2(size = 4) {
    let connections: MyConnection[] = [];
    for (let i = 1; i <= size - 1; i++) {
        connections.push({ sDir: Dir.E, s: i, t: i + 1 });
        connections.push({ sDir: Dir.E, s: i + size, t: i + size + 1 });
    }
    for (let i = 1; i <= size; i++) {
        connections.push({ sDir: Dir.S, s: i, t: i + size });
    }
    connections.push({ sDir: Dir.E, s: size, t: 1, tDir: Dir.N });
    connections.push({ sDir: Dir.E, s: 2 * size, t: size + 1, tDir: Dir.S });
    reset2(2 * size, connections);
}

function resetRandom() {
    vm.rooms = [];
    for (let i = 1; i <= 50; i++) {
        let room = new Room(i, vm.godMode);
        if (i >= Room.colors.length)
            room.color = getRandomColor();
        vm.rooms.push(room);
    }

    for (let r = 0; r < vm.rooms.length; r++) {
        let j = r + 1;
        for (let i = 0; i < 4; i++) {
            let other = vm.rooms[Math.floor(Math.random() * vm.rooms.length)];
            while (other === vm.rooms[r]) {
                other = vm.rooms[Math.floor(Math.random() * vm.rooms.length)];
            }
            vm.rooms[r].connectByTransitionFunction({ dir: i, other, allowMultipleInEdges: vm.allowMultipleInEdges });
        }
    }
    ui.reset(new RoomView(vm.rooms[0]));
    ui.render();
}

function resetCustom() {
    try {
        resetWithCode(vm.code);
        customCodeInput.setCustomValidity("");
        vm.graph = "custom";
        return true;
    }
    catch (ex) {
        customCodeInput.setCustomValidity(ex);
        vm.invalidCodeFeedback = ex;
    }
    return false;
}

function setGraph() {
    if (vm.graph === "custom")
        resetCustom();
    else {
        let code = document.querySelector(`#graphSelect option[value='${vm.graph}']`)?.getAttribute("data-code");
        if (code != null) {
            resetWithCode(code);
        } else {
            switch (vm.graph) {
                case "B":
                    resetToWeirdGraph();
                    break;
                case "mobius":
                    resetToMobiusStrip();
                    break;
                case "klein":
                    resetToKleinBottle();
                    break;
                case "projective":
                    resetToProjectivePlane();
                    break;
                case "mobius2":
                    resetToMobiusStrip2();
                    break;
                case "random":
                    resetRandom();
                    break;
                case "custom":
                    resetCustom();
                    break;
            }
        }
    }
    updateHistoryState();
}

function updateHistoryState(replace = true) {
    let state: Record<string, any> = {
        godMode: vm.godMode,
        allowMultipleInEdges: vm.allowMultipleInEdges,
        graph: vm.graph,
        code: vm.code,
        drawDistance: vm.drawDistance
    };
    let params = new URLSearchParams(state);
    for (let key in state) {
        if (state[key] === defaults[key])
            params.delete(key);
    }
    if (state.graph !== "custom")
        params.delete("code");
    let url = "?" + params.toString();
    if (replace)
        history.replaceState(state, "", url);
    else
        history.pushState(state, "", url);
}

// Event listeners

document.querySelector("#codeForm")!.addEventListener("submit", () => {
    if (resetCustom()) {
        updateHistoryState(false);
    }
    codeForm.classList.add("was-validated");
});

addEventListener("popstate", e => {
    let state = e.state ?? defaults;
    vm.godMode = state.godMode;
    vm.allowMultipleInEdges = state.allowMultipleInEdges;
    vm.graph = state.graph;
    vm.code = state.code;
    setGraph();
});

if (vm.code != "") {
    vm.graph = "custom";
}

setGraph();
