// Инициализация
document.addEventListener('DOMContentLoaded', function () {
    const startButton = document.getElementById('startButton');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const mainContent = document.getElementById('mainContent');
    const audio = document.getElementById('birthdayAudio');

    // Обработчик нажатия кнопки "Включить звук"
    startButton.addEventListener('click', () => {
        // Воспроизводим мелодию
        audio.play().catch((err) => console.error("Ошибка воспроизведения звука:", err));

        // Скрываем приветственный экран
        welcomeScreen.style.display = 'none';

        // Показываем основную страницу
        mainContent.classList.remove('hidden');

        // Запускаем анимацию свечи
        animate();

        // Инициализируем микрофон
        initMicrophone();
    });
});

// Код для свечи и анимации
const canvas = document.getElementById("birthdayCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

let candleHeight = 180;
let candleY = 270;
let minCandleHeight = 30;
let burningRate = 0.1;
let flameParticles = [];
let isBlownOut = false;
let intensity = 1.0;
let spread = 1.0;

// Пороги для "дуна" (громкость)
const BLOW_THRESHOLD = 0.4; // Порог для полного задувания
const WEAK_BLOW_THRESHOLD = 0.2; // Порог для слабого дуновения

// Цвета для свечи и огня
const candleColor = "rgb(200, 100, 100)";
const flameBaseColor = "rgba(255, 140, 0, 0.7)";
const flameFadeColor = "rgba(255, 80, 0, 0.5)";
const cakeColor = "rgb(250, 220, 180)";

// Функция для создания частиц пламени
function createFlameParticles(intensity = 1.0, spread = 1.0) {
    for (let i = 0; i < 15; i++) {
        let x = canvas.width / 2 + (Math.random() - 0.5) * 20 * spread;
        let y = candleY - 6;
        let size = (Math.random() * 5 + 5) * intensity;
        let color = Math.random() > 0.5 ? flameBaseColor : flameFadeColor;

        flameParticles.push({ x, y, size, color });
    }
}

// Функция для обновления и отображения частиц пламени
function updateFlameParticles() {
    for (let i = flameParticles.length - 1; i >= 0; i--) {
        let particle = flameParticles[i];
        particle.y -= Math.random() * 3;
        particle.x += (Math.random() - 0.5) * 2;
        particle.size -= 0.1;

        if (particle.size <= 0) {
            flameParticles.splice(i, 1);
        } else {
            ctx.beginPath();
            ctx.fillStyle = particle.color;
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Функция для рисования свечи и огня
function drawCandle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем торт
    ctx.fillStyle = cakeColor;
    ctx.fillRect(120, 450, 160, 100);
    ctx.fillStyle = "rgb(135, 206, 250)";
    ctx.fillRect(120, 440, 160, 10);

    // Рисуем свечу
    ctx.fillStyle = candleColor;
    ctx.fillRect(canvas.width / 2 - 10, candleY, 20, candleHeight);

    // Рисуем огонь, если свеча не задута
    if (!isBlownOut) {
        createFlameParticles(intensity, spread);
        updateFlameParticles();
    }
}

// Функция для анимации
function animate() {
    drawCandle();

    // Постепенное "сгорание" свечи
    if (candleHeight > minCandleHeight && !isBlownOut) {
        candleHeight -= burningRate;
        candleY += burningRate;
    }

    requestAnimationFrame(animate);
}

// Функция для инициализации микрофона и анализа громкости
async function initMicrophone() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        function checkBlow() {
            analyser.getByteFrequencyData(dataArray);
            const volume = dataArray.reduce((acc, val) => acc + val) / dataArray.length;

            // Проверка уровня звука для слабого и полного дуновения
            if (volume / 256 > BLOW_THRESHOLD) {
                isBlownOut = true;  // Полное затухание
            } else if (volume / 256 > WEAK_BLOW_THRESHOLD) {
                intensity = 0.5;  // Слабое дуновение: уменьшить интенсивность огня и расширить пламя
                spread = 1.5;
            } else {
                intensity = 1.0;  // Полное пламя
                spread = 1.0;
            }

            requestAnimationFrame(checkBlow);
        }

        checkBlow();
    } catch (err) {
        console.error("Ошибка доступа к микрофону: ", err);
    }
}
// Получаем доступ к аудиоэлементам
const birthdayAudio = document.getElementById('birthdayAudio');
const joySound = document.getElementById('joySound');

// Функция, которая будет вызвана после "потушения"
function onCandleBlownOut() {
    // Останавливаем первый звук
    birthdayAudio.pause();
    birthdayAudio.currentTime = 0; // Возвращаемся к началу трека
    
    // Запускаем второй звук
    joySound.play();
}

// Пример использования функции, когда свеча потушена
document.getElementById('someElementToTrigger').addEventListener('click', onCandleBlownOut);

