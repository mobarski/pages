# Orbital Maneuvers Visualizer - Code Structure

## Files Overview

### orbit.js
Core simulation class handling orbital physics and visualization.

### controls.js
UI control functions and simulation initialization.

### index.html
Main HTML file with canvas and control interface.

## Detailed Structure

### OrbitSimulation Class (orbit.js)

#### Constructor & State Management
- `constructor(canvas)`: Initializes simulation state and canvas
- `resetOrbit()`: Resets to initial circular orbit
- `hasBurnPlanned()`: Checks for planned maneuvers

#### Physics & Orbital Mechanics
- `updatePhysics()`: Updates spacecraft position and velocity
- `simulateOrbit(startPos, startVel, maxSteps)`: Calculates complete orbit path
- `planManeuver(deltaV, burnType)`: Plans orbital maneuvers
- `executePlannedBurn()`: Executes planned maneuvers

#### Visualization
- `drawCelestialBody()`: Renders central body
- `drawSpacecraft()`: Renders spacecraft and vectors
- `drawOrbitPoints(points, style)`: Renders orbit paths
- `drawOrbitalMarker(point, label, color, frameCount)`: Renders Pe/Ap markers
- `updateDeltaVDisplay()`: Updates UI deltaV display
- `animate()`: Main animation loop

#### Orbit Analysis
- `updateOrbits()`: Updates current and planned orbits
- `findOrbitalExtremes(points)`: Finds periapsis and apoapsis

### Control Functions (controls.js)

#### Initialization
- `window.onload`: Creates OrbitSimulation instance

#### Maneuver Controls
- `planPrograde()`: Prograde burn planning
- `planRetrograde()`: Retrograde burn planning
- `planRadialIn()`: Radial inward burn planning
- `planRadialOut()`: Radial outward burn planning

#### Simulation Controls
- `executeBurnOrPause()`: Executes burns/toggles pause
- `resetBurn()`: Cancels planned maneuvers
- `pauseAtNextExtreme()`: Pauses at Pe/Ap
- `reset()`: Full simulation reset

### HTML Structure (index.html)
- Canvas element for orbital visualization
- Control panel with burn planning interface
- Delta-V display and simulation controls 