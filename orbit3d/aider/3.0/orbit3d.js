class OrbitSimulation {
    constructor(container) {
        // Three.js setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(this.renderer.domElement);

        // Camera position
        this.camera.position.set(500, 200, 500);
        this.camera.lookAt(0, 0, 0);

        // Add orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);

        // Add grid helper
        const gridHelper = new THREE.GridHelper(1000, 20);
        this.scene.add(gridHelper);

        // Physics constants
        this.G = 100;
        this.centralMass = 1000;
        this.dt = 0.1;

        // Create central body (sun)
        const sunGeometry = new THREE.SphereGeometry(30, 32, 32);
        const sunMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFB900,
            emissive: 0xFFB900,
            emissiveIntensity: 0.5
        });
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.scene.add(this.sun);

        // Create spacecraft
        const craftGeometry = new THREE.SphereGeometry(5, 16, 16);
        const craftMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
        this.spacecraft = new THREE.Mesh(craftGeometry, craftMaterial);
        this.scene.add(this.spacecraft);

        // Orbit visualization
        this.orbitLine = this.createOrbitLine(0x00FFFF); // Cyan color
        this.plannedOrbitLine = this.createOrbitLine(0x00FF00);
        this.scene.add(this.orbitLine);
        this.scene.add(this.plannedOrbitLine);

        // Create periapsis/apoapsis markers
        const markerGeometry = new THREE.SphereGeometry(4, 16, 16);
        const periapsisMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000}); // Red
        const apoapsisMaterial = new THREE.MeshBasicMaterial({color: 0x00FF00}); // Green
        this.periapsisMarker = new THREE.Mesh(markerGeometry, periapsisMaterial);
        this.apoapsisMarker = new THREE.Mesh(markerGeometry, apoapsisMaterial);
        this.scene.add(this.periapsisMarker);
        this.scene.add(this.apoapsisMarker);

        // Create markers for planned orbit
        this.plannedPeriapsisMarker = new THREE.Mesh(markerGeometry, periapsisMaterial.clone());
        this.plannedApoapsisMarker = new THREE.Mesh(markerGeometry, apoapsisMaterial.clone());

        // Create velocity vectors
        const arrowHelper = new THREE.ArrowHelper(
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 0, 0),
            1, // Length will be set dynamically
            0xFFFF00,
            32,  // head length (quadrupled)
            16   // head width (quadrupled)
        );
        this.velocityVector = arrowHelper;
        this.scene.add(this.velocityVector);

        // Create planned burn vector
        const plannedArrowHelper = new THREE.ArrowHelper(
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 0, 0),
            1, // Length will be set dynamically
            0xFF3300,  // Changed to orange-red for better visibility
            32,  // head length (quadrupled)
            16   // head width (quadrupled)
        );
        this.plannedBurnVector = plannedArrowHelper;
        this.scene.add(this.plannedBurnVector);
        
        // Make planned markers slightly transparent
        this.plannedPeriapsisMarker.material.transparent = true;
        this.plannedApoapsisMarker.material.transparent = true;
        this.plannedPeriapsisMarker.material.opacity = 0.6;
        this.plannedApoapsisMarker.material.opacity = 0.6;
        
        this.scene.add(this.plannedPeriapsisMarker);
        this.scene.add(this.plannedApoapsisMarker);

        // Initial conditions
        this.resetOrbit();
        
        // Animation state
        this.isPaused = false;
        this.plannedBurn = null;

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);

        // Start animation
        this.animate();
    }

    createOrbitLine(color) {
        const material = new THREE.LineBasicMaterial({ color });
        const geometry = new THREE.BufferGeometry();
        const line = new THREE.Line(geometry, material);
        return line;
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

    resetOrbit() {
        // Initial position (200 units from center on x-axis)
        this.position = { x: 200, y: 0, z: 0 };
        
        // Calculate velocity for circular orbit
        const r = 200;
        const v = Math.sqrt(this.G * this.centralMass / r);
        
        // Initial velocity (perpendicular to position in x-z plane)
        this.velocity = { x: 0, y: 0, z: v };
        
        // Update spacecraft position
        this.spacecraft.position.set(this.position.x, this.position.y, this.position.z);
    }

    updatePhysics() {
        if (this.isPaused) return;

        // Calculate distance to central body
        const r = Math.sqrt(
            this.position.x * this.position.x + 
            this.position.y * this.position.y + 
            this.position.z * this.position.z
        );
        
        // Calculate gravitational force
        const F = this.G * this.centralMass / (r * r);
        
        // Update velocity
        this.velocity.x += -F * this.position.x / r * this.dt;
        this.velocity.y += -F * this.position.y / r * this.dt;
        this.velocity.z += -F * this.position.z / r * this.dt;
        
        // Update position
        this.position.x += this.velocity.x * this.dt;
        this.position.y += this.velocity.y * this.dt;
        this.position.z += this.velocity.z * this.dt;
        
        // Update spacecraft position
        this.spacecraft.position.set(this.position.x, this.position.y, this.position.z);
    }

    simulateOrbit(startPos, startVel, steps) {
        let points = [];
        let pos = {...startPos};
        let vel = {...startVel};
        
        const maxRadius = 2000; // Maximum allowed distance from center
        const minPoints = 500;  // Minimum number of points to ensure a complete orbit
        
        for (let i = 0; i < steps; i++) {
            points.push({...pos});
            
            const r = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
            
            // Stop if orbit goes too far out (but ensure we have enough points)
            if (r > maxRadius && points.length > minPoints) {
                break;
            }
            
            const F = this.G * this.centralMass / (r * r);
            
            vel.x += -F * pos.x / r * this.dt;
            vel.y += -F * pos.y / r * this.dt;
            vel.z += -F * pos.z / r * this.dt;
            
            pos.x += vel.x * this.dt;
            pos.y += vel.y * this.dt;
            pos.z += vel.z * this.dt;
        }
        
        return points;
    }

    updateOrbits() {
        const currentOrbitPoints = this.simulateOrbit(this.position, this.velocity, 2000);
        this.updateOrbitLine(this.orbitLine, currentOrbitPoints);
        
        // Find periapsis and apoapsis
        let minR = Infinity;
        let maxR = 0;
        let periapsisPoint = null;
        let apoapsisPoint = null;
        
        currentOrbitPoints.forEach(point => {
            const r = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
            if (r < minR) {
                minR = r;
                periapsisPoint = point;
            }
            if (r > maxR) {
                maxR = r;
                apoapsisPoint = point;
            }
        });
        
        // Update markers and labels
        if (periapsisPoint) {
            this.periapsisMarker.position.set(periapsisPoint.x, periapsisPoint.y, periapsisPoint.z);
            // Update velocity vector
            const vel = Math.sqrt(
                this.velocity.x * this.velocity.x + 
                this.velocity.y * this.velocity.y + 
                this.velocity.z * this.velocity.z
            );
            this.velocityVector.position.copy(this.spacecraft.position);
            this.velocityVector.setDirection(new THREE.Vector3(
                this.velocity.x / vel,
                this.velocity.y / vel,
                this.velocity.z / vel
            ));
            // Set length proportional to velocity (scaled by 5 for visibility)
            this.velocityVector.setLength(vel * 5);
        }
        if (apoapsisPoint) {
            this.apoapsisMarker.position.set(apoapsisPoint.x, apoapsisPoint.y, apoapsisPoint.z);
            // Update planned burn vector if exists
            if (this.plannedBurn) {
                // Show the burn vector (velocity change) instead of final velocity
                const burnMagnitude = Math.sqrt(
                    this.plannedBurn.dvx * this.plannedBurn.dvx +
                    this.plannedBurn.dvy * this.plannedBurn.dvy +
                    this.plannedBurn.dvz * this.plannedBurn.dvz
                );
                this.plannedBurnVector.position.copy(this.spacecraft.position);
                this.plannedBurnVector.setDirection(new THREE.Vector3(
                    this.plannedBurn.dvx / burnMagnitude,
                    this.plannedBurn.dvy / burnMagnitude,
                    this.plannedBurn.dvz / burnMagnitude
                ));
                // Set length proportional to burn magnitude (scaled by 20 for visibility)
                this.plannedBurnVector.setLength(burnMagnitude * 20);
                this.plannedBurnVector.visible = true;
            } else {
                this.plannedBurnVector.visible = false;
            }
        }
        
        if (this.plannedBurn) {
            const plannedVel = {
                x: this.velocity.x + this.plannedBurn.dvx,
                y: this.velocity.y + this.plannedBurn.dvy,
                z: this.velocity.z + this.plannedBurn.dvz
            };
            const plannedOrbitPoints = this.simulateOrbit(this.position, plannedVel, 2000);
            this.updateOrbitLine(this.plannedOrbitLine, plannedOrbitPoints);

            // Find periapsis and apoapsis for planned orbit
            let minR = Infinity;
            let maxR = 0;
            let plannedPeriapsisPoint = null;
            let plannedApoapsisPoint = null;
            
            plannedOrbitPoints.forEach(point => {
                const r = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
                if (r < minR) {
                    minR = r;
                    plannedPeriapsisPoint = point;
                }
                if (r > maxR) {
                    maxR = r;
                    plannedApoapsisPoint = point;
                }
            });

            // Update planned markers and labels
            if (plannedPeriapsisPoint) {
                this.plannedPeriapsisMarker.visible = true;
                this.plannedPeriapsisMarker.position.set(plannedPeriapsisPoint.x, plannedPeriapsisPoint.y, plannedPeriapsisPoint.z);
            }
            if (plannedApoapsisPoint) {
                this.plannedApoapsisMarker.visible = true;
                this.plannedApoapsisMarker.position.set(plannedApoapsisPoint.x, plannedApoapsisPoint.y, plannedApoapsisPoint.z);
            }
        } else {
            this.updateOrbitLine(this.plannedOrbitLine, []);
            // Hide planned markers when no burn is planned
            this.plannedPeriapsisMarker.visible = false;
            this.plannedApoapsisMarker.visible = false;
        }
    }

    planManeuver(deltaV, burnType) {
        const vel = Math.sqrt(
            this.velocity.x * this.velocity.x + 
            this.velocity.y * this.velocity.y + 
            this.velocity.z * this.velocity.z
        );
        
        const velDir = {
            x: this.velocity.x / vel,
            y: this.velocity.y / vel,
            z: this.velocity.z / vel
        };
        
        // Calculate radial direction (cross product with up vector)
        const radialDir = {
            x: -velDir.z,
            y: 0,
            z: velDir.x
        };
        
        let burnVector = {x: 0, y: 0, z: 0};
        
        switch(burnType) {
            case 'retrograde':
                burnVector = {x: -velDir.x, y: -velDir.y, z: -velDir.z};
                break;
            case 'radialIn':
                burnVector = radialDir;
                break;
            case 'radialOut':
                burnVector = {x: -radialDir.x, y: -radialDir.y, z: -radialDir.z};
                break;
            case 'normal':
                burnVector = {x: 0, y: 1, z: 0}; // Up vector for normal direction
                break;
            case 'antiNormal':
                burnVector = {x: 0, y: -1, z: 0}; // Down vector for anti-normal
                break;
            default: // prograde
                burnVector = velDir;
        }
        
        // Initialize plannedBurn if it doesn't exist
        if (!this.plannedBurn) {
            this.plannedBurn = {dvx: 0, dvy: 0, dvz: 0};
        }
        
        // Add the new burn to existing planned burns
        this.plannedBurn.dvx += burnVector.x * deltaV;
        this.plannedBurn.dvy += burnVector.y * deltaV;
        this.plannedBurn.dvz += burnVector.z * deltaV;
    }

    executePlannedBurn() {
        if (this.plannedBurn) {
            this.velocity.x += this.plannedBurn.dvx;
            this.velocity.y += this.plannedBurn.dvy;
            this.velocity.z += this.plannedBurn.dvz;
            this.plannedBurn = null;
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.updatePhysics();
        this.updateOrbits();
        
        // Update orbit controls
        this.controls.update();
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize simulation when page loads
let simulation;
window.onload = () => {
    const container = document.getElementById('orbitCanvas');
    simulation = new OrbitSimulation(container);
    document.getElementById('resetBurnBtn').disabled = true;
};

// Control functions
function planPrograde() {
    const deltaV = Number(document.getElementById('deltaV').value);
    simulation.isPaused = true;
    simulation.planManeuver(deltaV, 'prograde');
    document.getElementById('executePauseBtn').textContent = 'Execute Burn';
    document.getElementById('resetBurnBtn').disabled = false;
}

function planRetrograde() {
    const deltaV = Number(document.getElementById('deltaV').value);
    simulation.isPaused = true;
    simulation.planManeuver(deltaV, 'retrograde');
    document.getElementById('executePauseBtn').textContent = 'Execute Burn';
    document.getElementById('resetBurnBtn').disabled = false;
}

function planRadialIn() {
    const deltaV = Number(document.getElementById('deltaV').value);
    simulation.isPaused = true;
    simulation.planManeuver(deltaV, 'radialIn');
    document.getElementById('executePauseBtn').textContent = 'Execute Burn';
    document.getElementById('resetBurnBtn').disabled = false;
}

function planRadialOut() {
    const deltaV = Number(document.getElementById('deltaV').value);
    simulation.isPaused = true;
    simulation.planManeuver(deltaV, 'radialOut');
    document.getElementById('executePauseBtn').textContent = 'Execute Burn';
    document.getElementById('resetBurnBtn').disabled = false;
}

function planNormal() {
    const deltaV = Number(document.getElementById('deltaV').value);
    simulation.isPaused = true;
    simulation.planManeuver(deltaV, 'normal');
    document.getElementById('executePauseBtn').textContent = 'Execute Burn';
    document.getElementById('resetBurnBtn').disabled = false;
}

function planAntiNormal() {
    const deltaV = Number(document.getElementById('deltaV').value);
    simulation.isPaused = true;
    simulation.planManeuver(deltaV, 'antiNormal');
    document.getElementById('executePauseBtn').textContent = 'Execute Burn';
    document.getElementById('resetBurnBtn').disabled = false;
}

function executeBurnOrPause() {
    if (simulation.plannedBurn) {
        simulation.executePlannedBurn();
        simulation.isPaused = false;
        document.getElementById('executePauseBtn').textContent = 'Pause';
        document.getElementById('resetBurnBtn').disabled = true;
    } else {
        simulation.isPaused = !simulation.isPaused;
        document.getElementById('executePauseBtn').textContent = 
            simulation.isPaused ? 'Resume' : 'Pause';
    }
}

function resetBurn() {
    simulation.plannedBurn = null;
    document.getElementById('executePauseBtn').textContent = 
        simulation.isPaused ? 'Resume' : 'Pause';
    document.getElementById('resetBurnBtn').disabled = true;
}

function reset() {
    simulation.resetOrbit();
    simulation.plannedBurn = null;
    simulation.isPaused = false;
    document.getElementById('executePauseBtn').textContent = 'Pause';
    document.getElementById('resetBurnBtn').disabled = true;
}
