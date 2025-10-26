// ------------------------------------------------------------------
//      CONFIGURAÇÃO DO BROKER MQTT (HiveMQ Cloud)
// ------------------------------------------------------------------

// Criados no painel "Access Management" do HiveMQ
const MQTT_USUARIO = "ESP32.ESTACAO1"; 
const MQTT_SENHA = "xzg65SXmGJsew5W";

// 2. INFORMAÇÕES DO SEU CLUSTER 
const brokerUrl = 'wss://2ff4346515a146d09e462c89f66a79ac7.s1.eu.hivemq.cloud:8884/mqtt';
const topic = 'esp-barragem/dados'; // O mesmo tópico do seu ESP32

// 3. OPÇÕES DE CONEXÃO
const options = {
  clientId: 'meu-site-github-' + Math.random().toString(16).substr(2, 8),
  username: MQTT_USUARIO,
  password: MQTT_SENHA
};

// ------------------------------------------------------------------
//               FIM DA CONFIGURAÇÃO
// ------------------------------------------------------------------

// Variáveis globais que vamos usar
const maxData = 20;
var TemperatureChart;
var DistanceChart;


//  Conexão MQTT 

console.log("Conectando ao broker MQTT...");
const client = mqtt.connect(brokerUrl, options);


// Eventos do Cliente MQTT 

// Chamado quando a conexão é bem-sucedida
client.on('connect', () => {
    console.log('Conectado com sucesso ao broker MQTT!');
    
    // Se inscreve no tópico para receber os dados
    client.subscribe(topic, (err) => {
        if (err) {
            console.error('Erro ao se inscrever no tópico:', err);
        } else {
            console.log('Inscrito com sucesso no tópico:', topic);
        }
    });
});

// Chamado sempre que uma nova mensagem chega no tópico
client.on('message', (receivedTopic, message) => {
    // message é um Buffer, convertemos para string
    const payloadString = message.toString();
    console.log('Mensagem recebida:', payloadString);

    try {
        // 1. Converte o texto JSON em um objeto
        const myObj = JSON.parse(payloadString);

        // 2. Atualiza os cards com os valores
        document.getElementById('temperature').innerHTML = myObj.temperature;
        document.getElementById('distance').innerHTML = myObj.distance;
        document.getElementById('vibration1').innerHTML = myObj.vibration1;
        document.getElementById('vibration2').innerHTML = myObj.vibration2;

        // 3. Prepara a hora para os gráficos
        const now = new Date();
        const timeLabel = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

        // 4. Atualiza o Gráfico de Temperatura
        if (myObj.temperature != "Erro" && !isNaN(myObj.temperature)) {
            TemperatureChart.data.datasets[0].data.push(parseFloat(myObj.temperature));
            TemperatureChart.data.labels.push(timeLabel);
            // Limita o número de pontos no gráfico
            if (TemperatureChart.data.labels.length > maxData) {
                TemperatureChart.data.labels.shift();
                TemperatureChart.data.datasets[0].data.shift();
            }
            TemperatureChart.update();
        }

        // 5. Atualiza o Gráfico de Distância/Nível
        if (myObj.distance && !isNaN(myObj.distance)) {
            DistanceChart.data.datasets[0].data.push(parseFloat(myObj.distance));
            DistanceChart.data.labels.push(timeLabel);
            // Limita o número de pontos no gráfico
            if (DistanceChart.data.labels.length > maxData) {
                DistanceChart.data.labels.shift();
                DistanceChart.data.datasets[0].data.shift();
            }
            DistanceChart.update();
        }

    } catch (e) {
        console.error('Erro ao processar o JSON recebido:', e, "Payload:", payloadString);
    }
});

// Chamado em caso de erro
client.on('error', (err) => {
    console.error('Erro de conexão MQTT:', err);
});


// Funções de Inicialização (Carregamento da Página)

// Esta função é chamada quando a página termina de carregar
window.addEventListener('load', onload);

function onload(event) {
    // O cliente MQTT se conecta sozinho assim que o script é carregado.
    // Ou seja, essa função só liga os gráficos
    initTemperatureChart();
    initDistanceChart();
}


// Funções dos Gráficos

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

// ------------------------------------------------------------------
// O CÓDIGO DO FORMULÁRIO DE EMAIL FOI REMOVIDO
// ------------------------------------------------------------------
// O código original 'document.addEventListener('DOMContentLoaded', ...)'
// para o formulário de email não funcionará no GitHub Pages, pois ele
// tentava enviar dados para o IP local do ESP32.
// ------------------------------------------------------------------


// document.addEventListener('DOMContentLoaded', function() {
    
//     //Pega os elementos do formulário e da mensagem de status
//     const emailForm = document.getElementById('email-form');
//     const emailInput = document.getElementById('input-email');
//     const statusMessage = document.getElementById('status-message');

//     //Adiciona um 'escutador' para o evento de 'submit' do formulário
//     emailForm.addEventListener('submit', function(event) {
        
//         //Impede o recarregamento da página
//         event.preventDefault(); 

//         //Pega o valor do e-mail e codifica para ser usado na URL
//         const email = emailInput.value;
//         const url = `/?email=${encodeURIComponent(email)}`;

//         //Mostra uma mensagem de "enviando..."
//         statusMessage.textContent = 'Enviando...';
//         statusMessage.style.color = 'gray';

//         //Usa a API fetch para enviar os dados em segundo plano
//         fetch(url)
//             .then(response => response.text()) // Pega a resposta do ESP32 como texto
//             .then(data => {
//                 // Exibe a mensagem de sucesso do ESP32
//                 statusMessage.textContent = data;
//                 statusMessage.style.color = 'darkred'; // Cor de sucesso
//                 statusMessage.style.padding = '10px';
//                 statusMessage.style.fontWeight = 'bold';
//                 emailInput.value = ''; // Limpa o campo de e-mail

//                 // Opcional: faz a mensagem desaparecer após 5 segundos
//                 setTimeout(() => {
//                     statusMessage.textContent = '';
//                 }, 5000);
//             })
//             .catch(error => {
//                 // Exibe uma mensagem em caso de erro de conexão
//                 console.error('Erro ao enviar e-mail:', error);
//                 statusMessage.textContent = 'Erro de conexão. Tente novamente.';
//                 statusMessage.style.color = 'red';
//                 statusMessage.style.padding = '10px';
//                 statusMessage.style.fontWeight = 'bold'
//             });
//     });
// });