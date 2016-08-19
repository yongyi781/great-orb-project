class FollowCamera extends THREE.PerspectiveCamera {
    private oldTargetPosition = new THREE.Vector3();
    private easeTargetPosition = new THREE.Vector3();
    easeFactor = 0.05;
    maxZoom = 200;

    constructor(fov?: number, aspect?: number, near?: number, far?: number,
        public followTarget?: THREE.Object3D) {
        super(fov, aspect, near, far);
        this.updateTargetPosition();
    }

    updateTargetPosition() {
        if (this.followTarget !== undefined) {
            this.easeTargetPosition.copy(this.followTarget.position);
            this.oldTargetPosition.copy(this.followTarget.position);
        }
    }

    /**
     * Rotates the camera around the player by angles of theta and phi.
     * @param theta The horizontal angle.
     * @param phi The vertical angle.
     */
    rotateAroundTarget(theta: number, phi: number) {
        if (!this.followTarget) {
            return;
        }

        let diff = this.position.clone().sub(this.easeTargetPosition);
        let distance = diff.length();
        let distance2D = new THREE.Vector2(diff.x, diff.y).length();

        // Don't allow camera's vertical angle to go outside [0, 90] degrees.
        this.translateY(Math.max(-diff.z, Math.min(distance2D - 0.1 * distance, distance * phi)));
        this.translateX(theta * distance2D);

        this.lookAt(this.easeTargetPosition);
        // Preserve distance
        this.translateZ(distance - this.position.distanceTo(this.easeTargetPosition));
    }

    /**
     * Moves the camera toward the target.
     * @param factor The amount to zoom by, between 0 and 1.
     */
    zoomTowardTarget(factor: number) {
        if (this.followTarget == null) {
            return;
        }

        let dist = this.position.distanceTo(this.easeTargetPosition);
        this.translateZ(Math.min(this.maxZoom - dist, dist * factor));
    }

    /**
     * Updates the camera in the scene.
     * @param elapsed The amount of time elapsed since last update.
     */
    update(elapsed: number) {
        if (this.followTarget == null) {
            return;
        }

        // Ease in
        this.easeTargetPosition.lerp(this.followTarget.position, this.easeFactor);

        this.position.x += this.easeTargetPosition.x - this.oldTargetPosition.x;
        this.position.y += this.easeTargetPosition.y - this.oldTargetPosition.y;

        this.oldTargetPosition.copy(this.easeTargetPosition.clone());
        this.lookAt(this.easeTargetPosition);
    }
}
