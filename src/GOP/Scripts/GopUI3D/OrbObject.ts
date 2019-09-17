class OrbObject {
    mesh: THREE.Mesh;
    circle: THREE.Mesh;
    light: THREE.PointLight;

    constructor(
        public orb: Orb,
        radius: number,
        z: number,
        color: number | string,
        opacity: number) {
        this.mesh = new THREE.Mesh(
            new THREE.SphereBufferGeometry(radius, 32, 16),
            new THREE.MeshPhongMaterial({
                color,
                specular: 0x606060,
                shininess: 60,
                transparent: opacity < 1,
                opacity
            }));
        this.mesh.position.set(orb.location.x, orb.location.y, z);
        this.mesh.renderOrder = 1;

        this.circle = new THREE.Mesh(
            new THREE.CircleGeometry(Math.min(0.5, radius), 16),
            new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.35,
                depthWrite: false
            })
        );
        this.circle.position.z = -z + 2 * GopUI3D.waterZOffset;
        this.mesh.add(this.circle);

        let c = new THREE.Color(color as string);
        let hsl = { h: 0, s: 0, l: 0 };
        c.getHSL(hsl);
        c.setHSL(hsl.h, hsl.s, Math.max(0.5, hsl.l));
        this.light = new THREE.PointLight(c.getHex(), 1.2, 15, 2);
    }

    update(tickProgress: number) {
        let drawLocation = this.orb.getDrawLocation(tickProgress);
        this.mesh.position.x = drawLocation.x;
        this.mesh.position.y = drawLocation.y;
        if (this.light !== undefined) {
            this.light.position.copy(this.mesh.position);
        }
    }
}
