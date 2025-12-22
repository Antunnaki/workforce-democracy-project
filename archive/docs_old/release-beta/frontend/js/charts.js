/**
 * CHART.JS INTEGRATION
 * Interactive data visualization for civic and other data
 */

/**
 * Create voting pattern chart for representative
 */
function createVotingPatternChart(repId, votingRecord) {
    const canvas = document.getElementById(`chart-${repId}`);
    if (!canvas) return;
    
    // Ensure canvas has parent with fixed height
    const container = canvas.parentElement;
    if (container && !container.style.height) {
        container.style.height = '300px';
    }
    
    const labels = Object.keys(votingRecord).map(key => formatTopicName(key));
    const data = Object.values(votingRecord);
    
    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Support Percentage',
                data: data,
                backgroundColor: 'rgba(255, 107, 53, 0.2)',
                borderColor: 'rgba(255, 107, 53, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(255, 107, 53, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(255, 107, 53, 1)',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    pointLabels: {
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.r + '% support';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Create timeline chart for voting history
 */
function createVotingTimelineChart(elementId, votingHistory) {
    const canvas = document.getElementById(elementId);
    if (!canvas) return;
    
    const container = canvas.parentElement;
    if (container && !container.style.height) {
        container.style.height = '400px';
    }
    
    // Sort votes by date
    const sortedVotes = [...votingHistory].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
    );
    
    const labels = sortedVotes.map(vote => {
        const date = new Date(vote.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const data = sortedVotes.map(vote => ({
        x: vote.date,
        y: vote.vote === 'yes' ? 1 : 0,
        label: vote.billName
    }));
    
    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Voting Record',
                data: data.map(d => d.y),
                borderColor: 'rgba(78, 205, 196, 1)',
                backgroundColor: 'rgba(78, 205, 196, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: data.map(d => 
                    d.y === 1 ? 'rgba(82, 196, 26, 1)' : 'rgba(255, 77, 79, 1)'
                ),
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return value === 1 ? 'Yes' : 'No';
                        }
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return data[context[0].dataIndex].label;
                        },
                        label: function(context) {
                            return 'Voted: ' + (context.parsed.y === 1 ? 'Yes ✓' : 'No ✗');
                        }
                    }
                }
            }
        }
    });
}

/**
 * Create pie chart for bill type distribution
 */
function createBillTypeChart(elementId, billData) {
    const canvas = document.getElementById(elementId);
    if (!canvas) return;
    
    const container = canvas.parentElement;
    if (container && !container.style.height) {
        container.style.height = '300px';
    }
    
    const labels = Object.keys(billData);
    const data = Object.values(billData);
    const colors = [
        'rgba(255, 107, 53, 0.8)',
        'rgba(78, 205, 196, 0.8)',
        'rgba(69, 183, 209, 0.8)',
        'rgba(255, 193, 7, 0.8)',
        'rgba(156, 39, 176, 0.8)',
        'rgba(76, 175, 80, 0.8)'
    ];
    
    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Create bar chart for comparative data
 */
function createComparisonChart(elementId, categories, traditionalData, democraticData) {
    const canvas = document.getElementById(elementId);
    if (!canvas) return;
    
    const container = canvas.parentElement;
    if (container && !container.style.height) {
        container.style.height = '400px';
    }
    
    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [
                {
                    label: 'Traditional Workplace',
                    data: traditionalData,
                    backgroundColor: 'rgba(255, 77, 79, 0.7)',
                    borderColor: 'rgba(255, 77, 79, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Democratic Workplace',
                    data: democraticData,
                    backgroundColor: 'rgba(82, 196, 26, 0.7)',
                    borderColor: 'rgba(82, 196, 26, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 20,
                        font: {
                            size: 13,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y + '%';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Create learning progress chart
 */
function createLearningProgressChart(elementId, completionData) {
    const canvas = document.getElementById(elementId);
    if (!canvas) return;
    
    const container = canvas.parentElement;
    if (container && !container.style.height) {
        container.style.height = '250px';
    }
    
    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: completionData.labels,
            datasets: [{
                label: 'Resources Completed',
                data: completionData.values,
                fill: true,
                backgroundColor: 'rgba(69, 183, 209, 0.2)',
                borderColor: 'rgba(69, 183, 209, 1)',
                borderWidth: 3,
                pointBackgroundColor: 'rgba(69, 183, 209, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Completed: ' + context.parsed.y + ' resources';
                        }
                    }
                }
            }
        }
    });
}

/**
 * Initialize all charts on page
 */
function initializeCharts() {
    // This will be called after DOM content is loaded
    // and when representative data is displayed
    console.log('Chart.js integration ready');
}

// Auto-initialize when Chart.js is loaded
if (typeof Chart !== 'undefined') {
    initializeCharts();
} else {
    // Wait for Chart.js to load
    window.addEventListener('load', () => {
        if (typeof Chart !== 'undefined') {
            initializeCharts();
        }
    });
}

// Make functions globally available
window.createVotingPatternChart = createVotingPatternChart;
window.createVotingTimelineChart = createVotingTimelineChart;
window.createBillTypeChart = createBillTypeChart;
window.createComparisonChart = createComparisonChart;
window.createLearningProgressChart = createLearningProgressChart;
