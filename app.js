document.addEventListener("DOMContentLoaded", () => {
    
    // --- REGISTRO DO SERVICE WORKER (PWA) ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
        .then(() => console.log("Service Worker Registrado!"))
        .catch(err => console.log("Erro no SW:", err));
    }

    // --- VARIÁVEIS E ESTADO ---
    let userData = JSON.parse(localStorage.getItem('sleepPro_user')) || null;
    let sleepSession = { active: false, startTime: null };
    let sleepInterval;

    // --- ELEMENTOS DA DOM ---
    const splashScreen = document.getElementById('splash-screen');
    const onboarding = document.getElementById('onboarding');
    const mainApp = document.getElementById('main-app');
    const onboardingForm = document.getElementById('onboarding-form');
    
    // --- INICIALIZAÇÃO ---
    setTimeout(() => {
        splashScreen.classList.add('hidden');
        if (userData) {
            initApp();
        } else {
            onboarding.classList.remove('hidden');
        }
    }, 2000);

    // --- CADASTRO INTELIGENTE ---
    onboardingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        userData = {
            nome: document.getElementById('ob-nome').value,
            idade: document.getElementById('ob-idade').value,
            posicao: document.getElementById('ob-posicao').value,
            horaDormir: document.getElementById('ob-hora-dormir').value,
            horaTreino: document.getElementById('ob-hora-treino').value,
            score: 85 // Score inicial fictício
        };
        localStorage.setItem('sleepPro_user', JSON.stringify(userData));
        onboarding.classList.add('hidden');
        initApp();
    });

    function initApp() {
        mainApp.classList.remove('hidden');
        document.getElementById('user-greeting').innerText = `Olá, ${userData.nome.split(' ')[0]}`;
        document.getElementById('fifa-score').innerText = userData.score;
        document.getElementById('display-treino-time').innerText = userData.horaTreino;
        
        // Gerar Avatar com base na inicial do nome
        document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${userData.nome}&background=39FF14&color=000&bold=true`;

        startSmartRoutines();
        initCharts();
        setupNotifications();
    }

    // --- NAVEGAÇÃO BOTTOM NAV ---
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            // Vibração Haptic se suportado
            if(navigator.vibrate) navigator.vibrate(50);

            // Troca de Aba
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            const targetId = item.getAttribute('data-target');
            tabContents.forEach(tc => {
                tc.classList.remove('active');
                if (tc.id === targetId) tc.classList.add('active');
            });
        });
    });

    // --- FUNCIONALIDADE: SONO ---
    const btnDormir = document.getElementById('btn-dormir');
    const btnAcordar = document.getElementById('btn-acordar');
    const sleepTimerDisplay = document.getElementById('sleep-timer');
    const sleepStatus = document.getElementById('sleep-status');

    btnDormir.addEventListener('click', () => {
        sleepSession.active = true;
        sleepSession.startTime = new Date();
        btnDormir.classList.add('hidden');
        btnAcordar.classList.remove('hidden');
        sleepStatus.innerText = "Dormindo...";
        sleepStatus.style.color = "var(--primary-color)";
        
        if(navigator.vibrate) navigator.vibrate([100, 50, 100]); // FeedBack

        sleepInterval = setInterval(updateSleepTimer, 1000);
    });

    btnAcordar.addEventListener('click', () => {
        clearInterval(sleepInterval);
        sleepSession.active = false;
        
        // Calcular horas dormidas
        const endTime = new Date();
        const diffMs = endTime - sleepSession.startTime;
        const diffHrs = (diffMs / (1000 * 60 * 60)).toFixed(1);

        document.getElementById('last-sleep-hours').innerText = `${diffHrs}h`;
        
        // Simular IA de Recuperação
        let recScore = 90;
        if(diffHrs < 7) {
            recScore = 65;
            document.getElementById('ai-recommendation').innerText = "Alerta: Sono insuficiente. Aumente a hidratação e faça alongamento leve.";
        } else {
            document.getElementById('ai-recommendation').innerText = "Excelente! Recuperação muscular otimizada para o treino.";
        }
        document.getElementById('recovery-score-display').innerText = `${recScore}%`;
        document.querySelector('.stat-box:nth-child(2) .fill').style.width = `${recScore}%`;

        btnAcordar.classList.add('hidden');
        btnDormir.classList.remove('hidden');
        sleepTimerDisplay.innerText = "00:00:00";
        sleepStatus.innerText = "Acordado";
        sleepStatus.style.color = "var(--text-muted)";
    });

    function updateSleepTimer() {
        const now = new Date();
        const diff = new Date(now - sleepSession.startTime);
        const h = String(diff.getUTCHours()).padStart(2, '0');
        const m = String(diff.getUTCMinutes()).padStart(2, '0');
        const s = String(diff.getUTCSeconds()).padStart(2, '0');
        sleepTimerDisplay.innerText = `${h}:${m}:${s}`;
    }

    // --- ROTINAS E COUNTDOWN ---
    function startSmartRoutines() {
        setInterval(() => {
            if(!userData) return;
            const now = new Date();
            const [tH, tM] = userData.horaTreino.split(':');
            let treinoTime = new Date();
            treinoTime.setHours(tH, tM, 0);

            if (now > treinoTime) {
                treinoTime.setDate(treinoTime.getDate() + 1); // Próximo dia
            }

            const diff = treinoTime - now;
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            document.getElementById('treino-countdown').innerText = `${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m`;
        }, 60000); // Atualiza a cada minuto
    }

    // --- GRÁFICOS (Chart.js) ---
    function initCharts() {
        // Cor global
        Chart.defaults.color = '#A0AABF';

        // Gráfico Qualidade do Sono
        new Chart(document.getElementById('sleepQualityChart'), {
            type: 'doughnut',
            data: {
                labels:['Profundo', 'Leve', 'REM', 'Acordado'],
                datasets: [{
                    data:[25, 50, 20, 5],
                    backgroundColor:['#39FF14', '#20B2AA', '#4169E1', '#FF3B30'],
                    borderWidth: 0
                }]
            },
            options: { cutout: '75%' }
        });

        // Gráfico Evolução Semanal
        new Chart(document.getElementById('weeklyChart'), {
            type: 'bar',
            data: {
                labels:['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Horas de Sono',
                    data:[7.5, 8, 6.5, 8.2, 9, 7, 8],
                    backgroundColor: '#39FF14',
                    borderRadius: 5
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true, max: 10 }
                }
            }
        });
    }

    // --- NOTIFICAÇÕES INTELIGENTES ---
    const btnNotify = document.getElementById('btn-notify');
    
    function setupNotifications() {
        btnNotify.addEventListener('click', () => {
            Notification.requestPermission().then(perm => {
                if(perm === 'granted') {
                    new Notification("Tudo Pronto!", {
                        body: "Você receberá alertas de sono e treino craque! ⚽",
                        icon: "assets/icons/icon-192x192.png"
                    });
                    btnNotify.innerText = "Notificações Ativas";
                    btnNotify.disabled = true;
                }
            });
        });

        // Simulação de check de rotina para enviar notificação local
        setInterval(() => {
            if (Notification.permission === 'granted' && userData) {
                const now = new Date();
                const [dH, dM] = userData.horaDormir.split(':');
                
                // Se faltam 30 minutos para dormir
                if (now.getHours() == dH && now.getMinutes() == (dM - 30)) {
                    new Notification("Hora de desacelerar 🧘‍♂️", {
                        body: "Faltam 30 minutos para o seu horário de dormir. Inicie a recuperação.",
                        icon: "assets/icons/icon-192x192.png"
                    });
                }
            }
        }, 60000); // Check a cada 1 min
    }

    // --- DEFINIÇÕES ---
    document.getElementById('btn-reset').addEventListener('click', () => {
        if(confirm("Deseja apagar todos os dados da sua rotina?")) {
            localStorage.removeItem('sleepPro_user');
            location.reload();
        }
    });

});
