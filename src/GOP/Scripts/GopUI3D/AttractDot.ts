class AttractDot {
    mesh: THREE.Mesh;

    constructor(
        public startObject: THREE.Object3D,
        public endObject: THREE.Object3D,
        color: number | string) {
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 8),
            new THREE.MeshLambertMaterial({
                color,
                transparent: true,
                opacity: 0.75
            })
        );
        this.mesh.position.copy(startObject.position);
        this.mesh.castShadow = true;
    }

    update(tickProgress: number) {
        this.mesh.position.copy(this.endObject.position.clone().lerp(
            this.startObject.position, Math.min(1, tickProgress)));
    }
}
