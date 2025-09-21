
// Expanded study spots with more locations
const studySpots = [
    {
        id: 1,
        name: "Hicks Library Study Hall",
        building: "Hicks Library",
        traffic: 0.2,
        studyScore: 9.2,
        quietTime: "in 25 minutes",
        currentOccupancy: 23,
        totalCapacity: 120,
        position: { x: 45, y: 35 }
    },
    {
        id: 2,
        name: "Engineering Commons",
        building: "Neil Armstrong Hall",
        traffic: 0.8,
        studyScore: 6.1,
        quietTime: "in 2 hours 15 minutes",
        currentOccupancy: 89,
        totalCapacity: 110,
        position: { x: 65, y: 25 }
    },
    {
        id: 3,
        name: "Student Union Quiet Zone",
        building: "Purdue Memorial Union",
        traffic: 0.4,
        studyScore: 7.8,
        quietTime: "in 45 minutes",
        currentOccupancy: 34,
        totalCapacity: 85,
        position: { x: 50, y: 60 }
    },
    {
        id: 4,
        name: "Math Library",
        building: "Mathematical Sciences Building",
        traffic: 0.1,
        studyScore: 9.7,
        quietTime: "available now",
        currentOccupancy: 8,
        totalCapacity: 75,
        position: { x: 35, y: 55 }
    },
    {
        id: 5,
        name: "Business Study Lounge",
        building: "Rawls Hall",
        traffic: 0.6,
        studyScore: 7.3,
        quietTime: "in 1 hour 30 minutes",
        currentOccupancy: 45,
        totalCapacity: 75,
        position: { x: 75, y: 45 }
    },
    {
        id: 6,
        name: "24/7 Study Room",
        building: "Electrical Engineering",
        traffic: 0.3,
        studyScore: 8.5,
        quietTime: "in 30 minutes",
        currentOccupancy: 18,
        totalCapacity: 60,
        position: { x: 60, y: 70 }
    },
    {
        id: 7,
        name: "Physics Study Area",
        building: "Physics Building",
        traffic: 0.5,
        studyScore: 7.9,
        quietTime: "in 1 hour",
        currentOccupancy: 28,
        totalCapacity: 50,
        position: { x: 40, y: 30 }
    },
    {
        id: 8,
        name: "Chemistry Library",
        building: "Brown Laboratory",
        traffic: 0.2,
        studyScore: 8.8,
        quietTime: "available now",
        currentOccupancy: 12,
        totalCapacity: 65,
        position: { x: 55, y: 40 }
    },
    {
        id: 9,
        name: "Life Sciences Study Room",
        building: "Life Sciences Building",
        traffic: 0.7,
        studyScore: 6.5,
        quietTime: "in 3 hours",
        currentOccupancy: 48,
        totalCapacity: 70,
        position: { x: 30, y: 75 }
    },
    {
        id: 10,
        name: "Computer Science Labs",
        building: "Lawson Hall",
        traffic: 0.9,
        studyScore: 5.8,
        quietTime: "in 4 hours",
        currentOccupancy: 95,
        totalCapacity: 100,
        position: { x: 70, y: 60 }
    },
    {
        id: 11,
        name: "Graduate Study Center",
        building: "Stewart Center",
        traffic: 0.3,
        studyScore: 8.7,
        quietTime: "in 20 minutes",
        currentOccupancy: 15,
        totalCapacity: 45,
        position: { x: 25, y: 45 }
    },
    {
        id: 12,
        name: "Agricultural Sciences Reading Room",
        building: "Agriculture Building",
        traffic: 0.1,
        studyScore: 9.1,
        quietTime: "available now",
        currentOccupancy: 5,
        totalCapacity: 40,
        position: { x: 80, y: 30 }
    },
    {
        id: 13,
        name: "Pharmacy Study Hall",
        building: "Pharmacy Building",
        traffic: 0.4,
        studyScore: 8.2,
        quietTime: "in 35 minutes",
        currentOccupancy: 22,
        totalCapacity: 55,
        position: { x: 45, y: 80 }
    },
    {
        id: 14,
        name: "Liberal Arts Quiet Study",
        building: "Liberal Arts Building",
        traffic: 0.2,
        studyScore: 9.0,
        quietTime: "in 15 minutes",
        currentOccupancy: 14,
        totalCapacity: 80,
        position: { x: 65, y: 85 }
    },
    {
        id: 15,
        name: "Residence Hall Study Lounge",
        building: "Cary Quadrangle",
        traffic: 0.6,
        studyScore: 7.1,
        quietTime: "in 2 hours",
        currentOccupancy: 35,
        totalCapacity: 60,
        position: { x: 20, y: 65 }
    }
];

// Map dragging functionality
let isDragging = false;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;
let maxX = 0;
let maxY = 0;

function initMapDragging() {
    const mapContainer = document.getElementById('mapContainer');
    const mapBackground = document.getElementById('mapBackground');
    
    // Calculate maximum drag distances
    maxX = mapBackground.offsetWidth - mapContainer.offsetWidth;
    maxY = mapBackground.offsetHeight - mapContainer.offsetHeight;
    
    mapContainer.addEventListener('mousedown', startDrag);
    mapContainer.addEventListener('touchstart', startDrag, { passive: false });
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    
    // Prevent image dragging
    mapBackground.addEventListener('dragstart', e => e.preventDefault());
}

function startDrag(e) {
    // Only start dragging if not clicking on a pin
    if (e.target.closest('.building-pin')) return;
    
    isDragging = true;
    mapContainer.style.cursor = 'grabbing';
    
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    
    startX = clientX - currentX;
    startY = clientY - currentY;
    
    e.preventDefault();
}

function drag(e) {
    if (!isDragging) return;
    
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    
    currentX = Math.max(Math.min(clientX - startX, 0), -maxX);
    currentY = Math.max(Math.min(clientY - startY, 0), -maxY);
    
    mapBackground.style.transform = `translate(${currentX}px, ${currentY}px)`;
    
    e.preventDefault();
}

function endDrag() {
    isDragging = false;
    mapContainer.style.cursor = 'grab';
}

function resetMapPosition() {
    currentX = 0;
    currentY = 0;
    mapBackground.style.transform = `translate(0px, 0px)`;
}

function centerMapPosition() {
    currentX = -maxX / 2;
    currentY = -maxY / 2;
    mapBackground.style.transform = `translate(${currentX}px, ${currentY}px)`;
}

function getTrafficLevel(traffic) {
    if (traffic < 0.2) return { level: 'low', text: '🟢 Very Low Traffic', class: 'low' };
    if (traffic < 0.4) return { level: 'low', text: '🟢 Low Traffic', class: 'low' };
    if (traffic < 0.6) return { level: 'medium', text: '🟡 Moderate Traffic', class: 'medium' };
    if (traffic < 0.8) return { level: 'medium', text: '🟠 High Traffic', class: 'medium' };
    return { level: 'high', text: '🔴 Very High Traffic', class: 'high' };
}

function createMapPins() {
    const mapContainer = document.getElementById('mapPins');
    mapContainer.innerHTML = ''; // Clear existing pins
    
    studySpots.forEach(spot => {
        const trafficLevel = getTrafficLevel(spot.traffic);
        const pin = document.createElement('div');
        pin.className = `building-pin traffic-${trafficLevel.class}`;
        pin.style.left = `${spot.position.x}%`;
        pin.style.top = `${spot.position.y}%`;
        pin.innerHTML = `
            📍
            <div class="pin-tooltip">
                <div style="color: #4ecdc4; font-weight: bold; margin-bottom: 5px;">${spot.name}</div>
                <div style="color: white; margin-bottom: 3px;">${trafficLevel.text}</div>
                <div style="color: #4ecdc4;">Score: ${spot.studyScore}/10</div>
                <div style="color: rgba(255,255,255,0.8); font-size: 0.9rem;">
                    ${spot.currentOccupancy}/${spot.totalCapacity} occupied
                </div>
            </div>
        `;
        
        pin.addEventListener('click', () => {
            document.getElementById(`spot-${spot.id}`).scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
        
        mapContainer.appendChild(pin);
    });
}

function renderStudySpots() {
    const grid = document.getElementById('spotsGrid');
    
    // Sort by study score
    const sortedSpots = [...studySpots].sort((a, b) => b.studyScore - a.studyScore);
    
    grid.innerHTML = sortedSpots.map(spot => {
        const trafficLevel = getTrafficLevel(spot.traffic);
        
        return `
            <div class="spot-card" id="spot-${spot.id}">
                <div class="spot-header">
                    <div class="spot-info">
                        <div class="spot-name">${spot.name}</div>
                        <div class="spot-building">${spot.building}</div>
                    </div>
                </div>
                
                <div class="traffic-status ${trafficLevel.class}">
                    ${trafficLevel.text}
                </div>
                
                <div class="study-metrics">
                    <div class="metric">
                        <div class="metric-value">${spot.studyScore}/10</div>
                        <div class="metric-label">Study Score</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${spot.currentOccupancy}/${spot.totalCapacity}</div>
                        <div class="metric-label">Occupancy</div>
                    </div>
                </div>
                
                <div class="next-quiet">
                    ⏰ Next quiet period: ${spot.quietTime}
                </div>
                
                <button class="visit-btn" onclick="visitSpot('${spot.name}', ${spot.id})">
                    get directions
                </button>
            </div>
        `;
    }).join('');
}

function visitSpot(name, id) {
    alert(`🎯 Opening ${name} details...\n📍 Directions available\n📅 Study room booking enabled`);
}

// Simulate real-time updates every 2 minutes
function updateTrafficData() {
    studySpots.forEach(spot => {
        // Simulate traffic changes
        const change = (Math.random() - 0.5) * 0.1;
        spot.traffic = Math.max(0, Math.min(1, spot.traffic + change));
        spot.currentOccupancy = Math.floor(spot.traffic * spot.totalCapacity);
        spot.studyScore = Math.round((10 - spot.traffic * 5 + Math.random() * 2) * 10) / 10;
    });
    
    // Update displays
    createMapPins();
    renderStudySpots();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    initMapDragging();
    createMapPins();
    renderStudySpots();
    
    // Add control button listeners
    document.getElementById('resetMapBtn').addEventListener('click', resetMapPosition);
    document.getElementById('centerMapBtn').addEventListener('click', centerMapPosition);
});

// Update every 2 minutes (in production, sync with UniTime API)
setInterval(updateTrafficData, 120000);

console.log('💡 In production, connect to:', 
            '\n- UniTime API for real schedule data',
            '\n- Campus WiFi data for occupancy',
            '\n- Room booking system integration');
