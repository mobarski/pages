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
    if (simulation.hasBurnPlanned()) {
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

function pauseAtNextExtreme() {
    simulation.pauseAtExtreme = true;
    simulation.skipFirstExtreme = true;
    // Clear the skip flag after a short delay
    setTimeout(() => {
        simulation.skipFirstExtreme = false;
    }, 100);
    document.getElementById('pauseAtExtremeBtn').disabled = true;
}

function reset() {
    simulation.resetOrbit();
    simulation.plannedBurn = null;
    simulation.isPaused = false;
    document.getElementById('executePauseBtn').textContent = 'Pause';
    document.getElementById('resetBurnBtn').disabled = true;
} 