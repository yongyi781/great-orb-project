class PlayerObject {
    mesh: THREE.Mesh;

    constructor(
        public player: Player,
        height: number,
        color: number | string) {
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.6, height),
            new THREE.MeshPhongMaterial({ color }));
        this.mesh.position.set(player.location.x, player.location.y, height / 2);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }

    update(tickProgress: number) {
        let drawLocation = this.player.getDrawLocation(tickProgress);
        this.mesh.position.x = drawLocation.x;
        this.mesh.position.y = drawLocation.y;
    }
}
