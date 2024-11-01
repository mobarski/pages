class OrbitPhysics {
    constructor(G = 100, centralMass = 1000, dt = 0.1) {
        this.G = G;
        this.centralMass = centralMass;
        this.dt = dt;
    }

    calculateForce(position) {
        const r = Math.sqrt(
            position.x * position.x + 
            position.y * position.y + 
            position.z * position.z
        );
        return this.G * this.centralMass / (r * r);
    }

    updateVelocity(position, velocity) {
        const r = Math.sqrt(
            position.x * position.x + 
            position.y * position.y + 
            position.z * position.z
        );
        const F = this.calculateForce(position);
        
        return {
            x: velocity.x + (-F * position.x / r * this.dt),
            y: velocity.y + (-F * position.y / r * this.dt),
            z: velocity.z + (-F * position.z / r * this.dt)
        };
    }

    updatePosition(position, velocity) {
        return {
            x: position.x + velocity.x * this.dt,
            y: position.y + velocity.y * this.dt,
            z: position.z + velocity.z * this.dt
        };
    }

    simulateOrbit(startPos, startVel, steps) {
        let points = [];
        let pos = {...startPos};
        let vel = {...startVel};
        
        const maxRadius = 2000;
        const minPoints = 500;
        
        for (let i = 0; i < steps; i++) {
            points.push({...pos});
            
            const r = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
            
            if (r > maxRadius && points.length > minPoints) {
                break;
            }
            
            vel = this.updateVelocity(pos, vel);
            pos = this.updatePosition(pos, vel);
        }
        
        return points;
    }
}

export { OrbitPhysics };
