class OrbitControls {
    constructor(simulation) {
        this.simulation = simulation;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('resetBurnBtn').disabled = true;
    }

    planManeuver(deltaV, burnType) {
        const vel = Math.sqrt(
            this.simulation.velocity.x * this.simulation.velocity.x + 
            this.simulation.velocity.y * this.simulation.velocity.y + 
            this.simulation.velocity.z * this.simulation.velocity.z
        );
        
        const velDir = {
            x: this.simulation.velocity.x / vel,
            y: this.simulation.velocity.y / vel,
            z: this.simulation.velocity.z / vel
        };
        
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
                burnVector = {x: 0, y: 1, z: 0};
                break;
            case 'antiNormal':
                burnVector = {x: 0, y: -1, z: 0};
                break;
            default: // prograde
                burnVector = velDir;
        }
        
        if (!this.simulation.plannedBurn) {
            this.simulation.plannedBurn = {dvx: 0, dvy: 0, dvz: 0};
        }
        
        this.simulation.plannedBurn.dvx += burnVector.x * deltaV;
        this.simulation.plannedBurn.dvy += burnVector.y * deltaV;
        this.simulation.plannedBurn.dvz += burnVector.z * deltaV;
    }
}

// UI Control functions
function planPrograde() {
    const deltaV = Number(document.getElementById('deltaV').value);
    simulation.isPaused = true;
    simulation.controls.planManeuver(deltaV, 'prograde');
    document.getElementById('executePauseBtn').textContent = 'Execute Burn';
    document.getElementById('resetBurnBtn').disabled = false;
}

function planRetrograde() {
    const deltaV = Number(document.getElementById('deltaV').value);
    simulation.isPaused = true;
    simulation.controls.planManeuver(deltaV, 'retrograde');
    document.getElementById('executePauseBtn').textContent = 'Execute Burn';
    document.getElementById('resetBurnBtn').disabled = false;
}

function planRadialIn() {
    const deltaV = Number(document.getElementById('deltaV').value);
    simulation.isPaused = true;
    simulation.controls.planManeuver(deltaV, 'radialIn');
    document.getElementById('executePauseBtn').textContent = 'Execute Burn';
    document.getElementById('resetBurnBtn').disabled = false;
}

function planRadialOut() {
    const deltaV = Number(document.getElementById('deltaV').value);
    simulation.isPaused = true;
    simulation.controls.planManeuver(deltaV, 'radialOut');
    document.getElementById('executePauseBtn').textContent = 'Execute Burn';
    document.getElementById('resetBurnBtn').disabled = false;
}

function planNormal() {
    const deltaV = Number(document.getElementById('deltaV').value);
    simulation.isPaused = true;
    simulation.controls.planManeuver(deltaV, 'normal');
    document.getElementById('executePauseBtn').textContent = 'Execute Burn';
    document.getElementById('resetBurnBtn').disabled = false;
}

function planAntiNormal() {
    const deltaV = Number(document.getElementById('deltaV').value);
    simulation.isPaused = true;
    simulation.controls.planManeuver(deltaV, 'antiNormal');
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

export { OrbitControls, planPrograde, planRetrograde, planRadialIn, planRadialOut, 
         planNormal, planAntiNormal, executeBurnOrPause, resetBurn, reset };
