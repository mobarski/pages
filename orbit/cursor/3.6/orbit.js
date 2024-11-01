class OrbitSimulation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        this.centralBodyRadius = 30; // Match the radius used in drawCelestialBody
        
        // Animation state
        this.isPaused = false;
        this.pauseAtExtreme = false;
        
        // Physics constants
        this.G = 100; // Gravitational constant (scaled for visualization)
        this.centralMass = 1000; // Mass of central body
        this.dt = 0.1; // Time step
        
        // Orbit prediction
        this.orbitPoints = [];
        this.plannedOrbitPoints = [];
        
        // Initial conditions
        this.resetOrbit();
        
        // Planned maneuver
        this.plannedBurn = null;
        
        // Delta-V tracking
        this.totalDeltaV = 0;
        
        // Start animation
        this.animate();
    }

    resetOrbit() {
        // Reset deltaV counter
        this.totalDeltaV = 0;
        
        // Position vector (x, y) - starting from right side
        this.position = {x: this.centerX + 200, y: this.centerY};
        
        // For circular orbit, velocity magnitude = sqrt(GM/r)
        const r = 200; // radius
        const v = Math.sqrt(this.G * this.centralMass / r);
        
        // Velocity vector perpendicular to position (for circular orbit)
        this.velocity = {x: 0, y: v};
    }

    hasBurnPlanned() {
        return this.plannedBurn !== null;
    }

    planManeuver(deltaV, burnType) {
        // Calculate velocity direction for burn
        const vel = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        const velDir = {
            x: this.velocity.x / vel,
            y: this.velocity.y / vel
        };
        
        // Calculate radial direction (90 degrees clockwise from velocity)
        const radialDir = {
            x: -velDir.y,
            y: velDir.x
        };
        
        let burnVector = {x: 0, y: 0};
        
        // Set burn direction based on type
        switch(burnType) {
            case 'retrograde':
                burnVector = {x: -velDir.x, y: -velDir.y};
                break;
            case 'radialIn':
                burnVector = {x: radialDir.x, y: radialDir.y};
                break;
            case 'radialOut':
                burnVector = {x: -radialDir.x, y: -radialDir.y};
                break;
            default: // prograde
                burnVector = {x: velDir.x, y: velDir.y};
        }
        
        // Add to existing burn if one exists
        if (this.plannedBurn) {
            this.plannedBurn.dvx += burnVector.x * deltaV;
            this.plannedBurn.dvy += burnVector.y * deltaV;
        } else {
            // Create new burn
            this.plannedBurn = {
                dvx: burnVector.x * deltaV,
                dvy: burnVector.y * deltaV
            };
        }
    }

    executePlannedBurn() {
        if (this.plannedBurn) {
            this.velocity.x += this.plannedBurn.dvx;
            this.velocity.y += this.plannedBurn.dvy;
            // Add the magnitude of the burn to total deltaV
            const burnMagnitude = Math.sqrt(
                this.plannedBurn.dvx * this.plannedBurn.dvx + 
                this.plannedBurn.dvy * this.plannedBurn.dvy
            );
            this.totalDeltaV += burnMagnitude;
            this.plannedBurn = null;
        }
    }

    updatePhysics() {
        // Store previous distance for Pe/Ap detection
        const prevDx = this.position.x - this.centerX;
        const prevDy = this.position.y - this.centerY;
        const prevR = Math.sqrt(prevDx * prevDx + prevDy * prevDy);

        // Calculate distance to central body
        const dx = this.position.x - this.centerX;
        const dy = this.position.y - this.centerY;
        const r = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate gravitational force
        const F = this.G * this.centralMass / (r * r);
        const ax = -F * dx / r;
        const ay = -F * dy / r;
        
        // Update velocity using acceleration
        this.velocity.x += ax * this.dt;
        this.velocity.y += ay * this.dt;
        
        // Update position using velocity
        this.position.x += this.velocity.x * this.dt;
        this.position.y += this.velocity.y * this.dt;

        // Check for Pe/Ap passage if pause at extreme is requested
        if (this.pauseAtExtreme) {
            // Calculate current distance from center
            const dx = this.position.x - this.centerX;
            const dy = this.position.y - this.centerY;
            const currentR = Math.sqrt(dx * dx + dy * dy);
            
            // Store previous distance if not initialized
            if (this.prevR === undefined) {
                this.prevR = currentR;
                return;
            }
            
            // Calculate velocity direction for radial velocity
            const velMag = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
            const radialVel = (dx * this.velocity.x + dy * this.velocity.y) / Math.sqrt(dx * dx + dy * dy);
            
            // Detect Pe/Ap passage by checking if radial velocity changes sign
            if (Math.abs(radialVel) < velMag * 0.1 && this.skipFirstExtreme !== true) {
                this.isPaused = true;
                this.pauseAtExtreme = false;
                document.getElementById('pauseAtExtremeBtn').disabled = false;
                document.getElementById('executePauseBtn').textContent = 'Resume';
            }
            
            this.prevR = currentR;
        }
    }

    drawCelestialBody() {
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 30, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFB900';
        this.ctx.fill();
    }

    simulateOrbit(startPos, startVel, maxSteps = 2000) {
        let points = [];
        let pos = {...startPos};
        let vel = {...startVel};
        
        // Store initial radius to detect orbit completion
        const initialDx = startPos.x - this.centerX;
        const initialDy = startPos.y - this.centerY;
        const initialR = Math.sqrt(initialDx * initialDx + initialDy * initialDy);
        
        for (let i = 0; i < maxSteps; i++) {
            // After collecting some points, check if we've completed an orbit
            if (i > 50) { // Avoid checking too early
                const dx = pos.x - this.centerX;
                const dy = pos.y - this.centerY;
                const r = Math.sqrt(dx * dx + dy * dy);
                
                // Calculate velocity magnitude for proportional tolerance
                const velMag = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
                const tolerance = velMag * 0.1; // Tolerance proportional to velocity
                
                // Calculate angles
                const angleToStart = Math.atan2(startPos.y - this.centerY, startPos.x - this.centerX);
                const currentAngle = Math.atan2(dy, dx);
                const prevAngle = Math.atan2(points[points.length-1].y - this.centerY, 
                                           points[points.length-1].x - this.centerX);
                
                // Check if we're close to initial radius and have just crossed the initial angle
                if (Math.abs(r - initialR) < tolerance) {
                    // Detect if we've crossed the initial angle by checking angle change
                    const angleDiff = ((currentAngle - angleToStart + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
                    const prevAngleDiff = ((prevAngle - angleToStart + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
                    
                    if (Math.abs(angleDiff) < 0.1 && Math.sign(angleDiff) !== Math.sign(prevAngleDiff)) {
                        break; // Orbit complete
                    }
                }
            }
            points.push({...pos});
            
            // Calculate acceleration
            const dx = pos.x - this.centerX;
            const dy = pos.y - this.centerY;
            const r = Math.sqrt(dx * dx + dy * dy);
            const F = this.G * this.centralMass / (r * r);
            const ax = -F * dx / r;
            const ay = -F * dy / r;
            
            // Update velocity and position
            vel.x += ax * this.dt;
            vel.y += ay * this.dt;
            pos.x += vel.x * this.dt;
            pos.y += vel.y * this.dt;
        }
        
        return points;
    }

    updateOrbits() {
        // Current orbit
        this.orbitPoints = this.simulateOrbit(this.position, this.velocity);
        
        // Planned orbit if there's a burn planned
        if (this.plannedBurn) {
            const plannedVel = {
                x: this.velocity.x + this.plannedBurn.dvx,
                y: this.velocity.y + this.plannedBurn.dvy
            };
            this.plannedOrbitPoints = this.simulateOrbit(this.position, plannedVel);
        } else {
            this.plannedOrbitPoints = [];
        }
    }

    drawOrbitPoints(points, style) {
        if (points.length < 2) return;
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = style.color;
        this.ctx.lineWidth = style.width;
        this.ctx.setLineDash(style.dash || []);
        
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    findOrbitalExtremes(points) {
        if (points.length < 2) return null;
        
        let periapsis = null;
        let apoapsis = null;
        let minDist = Infinity;
        let maxDist = 0;
        let peFrame = -1;
        let apFrame = -1;
        
        points.forEach((point, index) => {
            const dx = point.x - this.centerX;
            const dy = point.y - this.centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < minDist) {
                minDist = dist;
                periapsis = point;
                peFrame = index;
            }
            if (dist > maxDist) {
                maxDist = dist;
                apoapsis = point;
                apFrame = index;
            }
        });
        
        return { periapsis, apoapsis, peFrame, apFrame };
    }

    drawOrbitalMarker(point, label, color, frameCount) {
        if (!point) return;
        
        // Draw marker
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        
        // Calculate height above surface
        const dx = point.x - this.centerX;
        const dy = point.y - this.centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const height = (dist - this.centralBodyRadius).toFixed(0);
        
        // Draw label with height only
        this.ctx.fillStyle = color;
        this.ctx.font = '12px Arial';
        const displayText = `${label} h:${height}`;
        this.ctx.fillText(displayText, point.x + 10, point.y + 10);
    }

    drawSpacecraft() {
        // Draw spacecraft at current position
        this.ctx.beginPath();
        this.ctx.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fill();

        // Draw velocity vector
        this.ctx.beginPath();
        this.ctx.moveTo(this.position.x, this.position.y);
        this.ctx.lineTo(
            this.position.x + this.velocity.x * 5,
            this.position.y + this.velocity.y * 5
        );
        this.ctx.strokeStyle = '#FFFF00';
        this.ctx.stroke();

        // Draw planned burn if exists
        if (this.plannedBurn) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.position.x, this.position.y);
            this.ctx.lineTo(
                this.position.x + this.plannedBurn.dvx * 20,
                this.position.y + this.plannedBurn.dvy * 20
            );
            this.ctx.strokeStyle = '#00FF00';
            this.ctx.setLineDash([5, 5]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }

    updateDeltaVDisplay() {
        document.getElementById('totalDeltaV').textContent = this.totalDeltaV.toFixed(1);
        
        const plannedDvElement = document.getElementById('plannedDeltaV');
        if (this.plannedBurn) {
            const plannedMagnitude = Math.sqrt(
                this.plannedBurn.dvx * this.plannedBurn.dvx + 
                this.plannedBurn.dvy * this.plannedBurn.dvy
            );
            plannedDvElement.textContent = `(+${plannedMagnitude.toFixed(1)})`;
            plannedDvElement.style.display = 'inline';
        } else {
            plannedDvElement.style.display = 'none';
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateDeltaVDisplay();
        // Update and draw orbits
        this.updateOrbits();
        this.drawOrbitPoints(this.orbitPoints, {color: '#444444', width: 1});
        if (this.plannedOrbitPoints.length > 0) {
            this.drawOrbitPoints(this.plannedOrbitPoints, {color: '#00FF00', width: 2, dash: [5, 5]});
        }
        
        this.drawCelestialBody();
        this.drawSpacecraft();
        
        // Draw orbital markers
        const currentExtremes = this.findOrbitalExtremes(this.orbitPoints);
        if (currentExtremes) {
            this.drawOrbitalMarker(currentExtremes.periapsis, "Pe", '#FF4444', currentExtremes.peFrame);
            this.drawOrbitalMarker(currentExtremes.apoapsis, "Ap", '#4444FF', currentExtremes.apFrame);
        }
        
        // Draw planned orbital markers
        if (this.plannedOrbitPoints.length > 0) {
            const plannedExtremes = this.findOrbitalExtremes(this.plannedOrbitPoints);
            if (plannedExtremes) {
                this.drawOrbitalMarker(plannedExtremes.periapsis, "Pe", '#44FF44', plannedExtremes.peFrame);
                this.drawOrbitalMarker(plannedExtremes.apoapsis, "Ap", '#44FF44', plannedExtremes.apFrame);
            }
        }
        
        if (!this.isPaused) {
            this.updatePhysics();
        }
        
        requestAnimationFrame(() => this.animate());
    }
}
