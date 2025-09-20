
// Mock UniTime data
const studySpots = [
    {
        id: 1,
        name: "Library Study Hall",
        building: "Hicks Library",
        traffic: 0.2,
        studyScore: 9.2,
        quietTime: "in 25 minutes",
        currentOccupancy: 23,
        totalCapacity: 120,
        position: { x: 30, y: 40 }
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
        position: { x: 70, y: 30 }
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
        position: { x: 25, y: 70 }
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
        position: { x: 80, y: 50 }
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
        position: { x: 60, y: 25 }
    }
];

function getTrafficLevel(traffic) {
    if (traffic < 0.3) return { level: 'low', text: '🟢 Low Traffic', class: 'low' };
    if (traffic < 0.7) return { level: 'medium', text: '🟡 Moderate Traffic', class: 'medium' };
    return { level: 'high', text: '🔴 High Traffic', class: 'high' };
}

function renderCampusMap() {
    const mapContainer = document.getElementById('campusMap');
    
    studySpots.forEach(spot => {
        const trafficLevel = getTrafficLevel(spot.traffic);
        const marker = document.createElement('div');
        marker.className = `building-marker traffic-${trafficLevel.class}`;
        marker.style.left = `${spot.position.x}%`;
        marker.style.top = `${spot.position.y}%`;
        marker.innerHTML = `
            📍
            <div class="building-tooltip">
                ${spot.name}<br>
                ${trafficLevel.text}<br>
                Score: ${spot.studyScore}/10
            </div>
        `;
        
        marker.addEventListener('click', () => {
            document.getElementById(`spot-${spot.id}`).scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
        
        mapContainer.appendChild(marker);
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
                    get directions & reserve
                </button>
            </div>
        `;
    }).join('');
}

function visitSpot(name, id) {
    alert(`🎯 Opening ${name} details...\n📍 Directions loading\n📅 Study room booking available\n⏰ Real-time updates enabled`);
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
    document.getElementById('campusMap').innerHTML = '';
    renderCampusMap();
    renderStudySpots();
}

// Initialize
renderCampusMap();
renderStudySpots();

// Update every 2 minutes (in production, sync with UniTime API)
setInterval(updateTrafficData, 120000);

console.log('💡 In production, connect to:', 
            '\n- UniTime API for real schedule data',
            '\n- Campus WiFi data for occupancy',
            '\n- Room booking system integration');
