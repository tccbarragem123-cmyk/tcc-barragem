var gateway = `ws://${window.location.hostname}/ws`;
var websocket;

const maxData = 20;
const blynkToken = 'lW3O82Io83KSfpshSTDVijMo0H0NMQCg'; // SEU TOKEN
const blynkBaseUrl = 'https://blynk.cloud/external/api/get?token=' + blynkToken;

// Variáveis globais para os gráficos
var TemperatureChart;
var DistanceChart;

// Init web socket when the page loads
window.addEventListener('load', onload);

function onload(event) {
    initTemperatureChart();
    initDistanceChart();
    
    // Chama a função para buscar dados imediatamente ao carregar
    getBlynkData();

    // E define um intervalo para buscar dados a cada 2 segundos (2000ms)
    setInterval(getBlynkData, 2000);
}

// REMOVIDAS: initWebSocket, onOpen, onClose, getReadings, onMessage (antiga)

// NOVA FUNÇÃO para buscar dados do Blynk
async function getBlynkData() {
    try {
        // 1. Busca todos os dados dos Virtual Pins em paralelo
        const [tempRes, distRes, vib1Res, vib2Res] = await Promise.all([
            fetch(blynkBaseUrl + '&v0'), // Temperatura
            fetch(blynkBaseUrl + '&v1'), // Distância/Nível
            fetch(blynkBaseUrl + '&v2'), // Vibração 1
            fetch(blynkBaseUrl + '&v3')  // Vibração 2
        ]);

        // 2. Extrai o texto de cada resposta
        const temperature = await tempRes.text();
        const distance = await distRes.text();
        const vibration1 = await vib1Res.text();
        const vibration2 = await vib2Res.text();

        // 3. Atualiza os elementos HTML (como o 'onMessage' fazia)
        document.getElementById('temperature').innerHTML = temperature;
        document.getElementById('distance').innerHTML = distance;
        document.getElementById('vibration1').innerHTML = vibration1;
        document.getElementById('vibration2').innerHTML = vibration2;

        // 4. Atualiza os gráficos
        const now = new Date();
        const timeLabel = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

        // Atualiza Gráfico de Temperatura
        if (temperature && !isNaN(temperature)) { // Checa se é um número válido
            TemperatureChart.data.datasets[0].data.push(parseFloat(temperature));
            TemperatureChart.data.labels.push(timeLabel);
            if (TemperatureChart.data.labels.length > maxData) {
                TemperatureChart.data.labels.shift();
                TemperatureChart.data.datasets[0].data.shift();
            }
            TemperatureChart.update();
        }

        // Atualiza Gráfico de Distância
        if (distance && !isNaN(distance)) {
            DistanceChart.data.datasets[0].data.push(parseFloat(distance));
            DistanceChart.data.labels.push(timeLabel);
            if (DistanceChart.data.labels.length > maxData) {
                DistanceChart.data.labels.shift();
                DistanceChart.data.datasets[0].data.shift();
            }
            DistanceChart.update();
        }

    } catch (error) {
        console.error("Erro ao buscar dados do Blynk:", error);
    }
}


function initTemperatureChart() {
    const ctx = document.getElementById('TemperatureChart').getContext('2d');

    TemperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label:'Temperatura',
                    data: [],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    fill: false
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 200
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Tempo'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperatura'
                    },
                    ticks: {
                        stepSize: 0.5
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.3
                }
            }
        }
    });
}

function initDistanceChart() {
    const ctx = document.getElementById('DistanceChart').getContext('2d');

    DistanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label:'Nível',
                    data: [],
                    borderColor: 'rgba(53, 73, 255, 1)',
                    backgroundColor: 'rgba(53, 73, 255, 0.2)',
                    borderWidth: 2,
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 200
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Tempo'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Nível'
                    },
                    ticks: {
                        stepSize: 0.5
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.3
                }
            }
        }
    });
}