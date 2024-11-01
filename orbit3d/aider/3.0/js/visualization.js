class OrbitVisualization {
    constructor(scene) {
        this.scene = scene;
        this.setupVisuals();
    }

    setupVisuals() {
        // Create orbit lines
        this.orbitLine = this.createOrbitLine(0x00FFFF);
        this.plannedOrbitLine = this.createOrbitLine(0x00FF00);
        this.scene.add(this.orbitLine);
        this.scene.add(this.plannedOrbitLine);

        // Create markers
        const markerGeometry = new THREE.SphereGeometry(4, 16, 16);
        const periapsisMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000});
        const apoapsisMaterial = new THREE.MeshBasicMaterial({color: 0x00FF00});
        
        this.periapsisMarker = new THREE.Mesh(markerGeometry, periapsisMaterial);
        this.apoapsisMarker = new THREE.Mesh(markerGeometry, apoapsisMaterial);
        this.plannedPeriapsisMarker = new THREE.Mesh(markerGeometry, periapsisMaterial.clone());
        this.plannedApoapsisMarker = new THREE.Mesh(markerGeometry, apoapsisMaterial.clone());

        // Make planned markers transparent
        this.plannedPeriapsisMarker.material.transparent = true;
        this.plannedApoapsisMarker.material.transparent = true;
        this.plannedPeriapsisMarker.material.opacity = 0.6;
        this.plannedApoapsisMarker.material.opacity = 0.6;

        // Add markers to scene
        this.scene.add(this.periapsisMarker);
        this.scene.add(this.apoapsisMarker);
        this.scene.add(this.plannedPeriapsisMarker);
        this.scene.add(this.plannedApoapsisMarker);

        // Create velocity vectors
        this.velocityVector = this.createArrowHelper(0xFFFF00);
        this.plannedBurnVector = this.createArrowHelper(0xFF3300);
        
        this.scene.add(this.velocityVector);
        this.scene.add(this.plannedBurnVector);
    }

    createOrbitLine(color) {
        const material = new THREE.LineBasicMaterial({ color });
        const geometry = new THREE.BufferGeometry();
        return new THREE.Line(geometry, material);
    }

    createArrowHelper(color) {
        return new THREE.ArrowHelper(
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 0, 0),
            1,
            color,
            32,
            16
        );
    }

    updateOrbitLine(line, points) {
        const positions = new Float32Array(points.length * 3);
        points.forEach((point, i) => {
            positions[i * 3] = point.x;
            positions[i * 3 + 1] = point.y;
            positions[i * 3 + 2] = point.z;
        });
        line.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }

    updateVectors(position, velocity, plannedBurn) {
        // Update velocity vector
        const vel = Math.sqrt(
            velocity.x * velocity.x + 
            velocity.y * velocity.y + 
            velocity.z * velocity.z
        );
        
        this.velocityVector.position.copy(position);
        this.velocityVector.setDirection(new THREE.Vector3(
            velocity.x / vel,
            velocity.y / vel,
            velocity.z / vel
        ));
        this.velocityVector.setLength(vel * 5);

        // Update planned burn vector
        if (plannedBurn) {
            const burnMagnitude = Math.sqrt(
                plannedBurn.dvx * plannedBurn.dvx +
                plannedBurn.dvy * plannedBurn.dvy +
                plannedBurn.dvz * plannedBurn.dvz
            );
            
            this.plannedBurnVector.position.copy(position);
            this.plannedBurnVector.setDirection(new THREE.Vector3(
                plannedBurn.dvx / burnMagnitude,
                plannedBurn.dvy / burnMagnitude,
                plannedBurn.dvz / burnMagnitude
            ));
            this.plannedBurnVector.setLength(burnMagnitude * 20);
            this.plannedBurnVector.visible = true;
        } else {
            this.plannedBurnVector.visible = false;
        }
    }
}

export { OrbitVisualization };
