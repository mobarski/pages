class OrbitSimulation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        
        // Animation state
        this.isPaused = false;
        
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
        
        // Start animation
        this.animate();
    }

    resetOrbit() {
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
            this.plannedBurn = null;
        }
    }

    updatePhysics() {
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
    }

    drawCelestialBody() {
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 30, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFB900';
        this.ctx.fill();
    }

    simulateOrbit(startPos, startVel, steps) {
        let points = [];
        let pos = {...startPos};
        let vel = {...startVel};
        
        for (let i = 0; i < steps; i++) {
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
        this.orbitPoints = this.simulateOrbit(this.position, this.velocity, 1000);
        
        // Planned orbit if there's a burn planned
        if (this.plannedBurn) {
            const plannedVel = {
                x: this.velocity.x + this.plannedBurn.dvx,
                y: this.velocity.y + this.plannedBurn.dvy
            };
            this.plannedOrbitPoints = this.simulateOrbit(this.position, plannedVel, 1000);
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
        
        points.forEach(point => {
            const dx = point.x - this.centerX;
            const dy = point.y - this.centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < minDist) {
                minDist = dist;
                periapsis = point;
            }
            if (dist > maxDist) {
                maxDist = dist;
                apoapsis = point;
            }
        });
        
        return { periapsis, apoapsis };
    }

    drawOrbitalMarker(point, label, color) {
        if (!point) return;
        
        // Draw marker
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        
        // Draw label
        this.ctx.fillStyle = color;
        this.ctx.font = '12px Arial';
        this.ctx.fillText(label, point.x + 10, point.y + 10);
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

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
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
            this.drawOrbitalMarker(currentExtremes.periapsis, "Pe", '#FF4444');
            this.drawOrbitalMarker(currentExtremes.apoapsis, "Ap", '#4444FF');
        }
        
        // Draw planned orbital markers
        if (this.plannedOrbitPoints.length > 0) {
            const plannedExtremes = this.findOrbitalExtremes(this.plannedOrbitPoints);
            if (plannedExtremes) {
                this.drawOrbitalMarker(plannedExtremes.periapsis, "Pe", '#44FF44');
                this.drawOrbitalMarker(plannedExtremes.apoapsis, "Ap", '#44FF44');
            }
        }
        
        if (!this.isPaused) {
            this.updatePhysics();
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize simulation when page loads
let simulation;
window.onload = () => {
    const canvas = document.getElementById('orbitCanvas');
    simulation = new OrbitSimulation(canvas);
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
