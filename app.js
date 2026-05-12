document.addEventListener("DOMContentLoaded", () => {
    // Registro do Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log(err));
    }

    let userData = JSON.parse(localStorage.getItem('sleepPro_user')) || null;
    const btnNotify = document.getElementById('btn-notify');

    // --- Função de Notificação ---
    function setupNotifications() {
        if (!btnNotify) return;
        btnNotify.addEventListener('click', () => {
            Notification.requestPermission().then(perm => {
                if(perm === 'granted') {
                    navigator.serviceWorker.ready.then(reg => {
                        reg.showNotification("Notificações Ativas!", {
                            body: "Você receberá alertas de recuperação. ⚽",
                            icon: "./sleep-football-pro-192x192.png"
                        });
                    });
                    btnNotify.innerText = "Notificações Ativas";
                    btnNotify.disabled = true;
                }
            });
        });

        // Verificação de horário
        setInterval(() => {
            if (Notification.permission === 'granted' && userData) {
                const now = new Date();
                const [dH, dM] = userData.horaDormir.split(':');
                if (now.getHours() == dH && now.getMinutes() == dM - 30) {
                    navigator.serviceWorker.ready.then(reg => {
                        reg.showNotification("Hora de desacelerar 🧘‍♂️", {
                            body: "Faltam 30 minutos para dormir.",
                            icon: "./sleep-football-pro-192x192.png"
                        });
                    });
                }
            }
        }, 30000);
    }

    // Inicializar app (se userData existir)
    if (userData) {
        setupNotifications();
        // ... restante das suas funções de abas e gráficos
    }
});
