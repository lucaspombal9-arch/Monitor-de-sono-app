document.addEventListener("DOMContentLoaded", () => {
    
    // --- REGISTRO DO SERVICE WORKER ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
        .then(() => console.log("SW OK"))
        .catch(err => console.log("Erro SW:", err));
    }

    let userData = JSON.parse(localStorage.getItem('sleepPro_user')) || null;
    const btnNotify = document.getElementById('btn-notify');

    // --- FUNÇÃO DE NOTIFICAÇÕES (CORRIGIDA) ---
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

        // Loop de verificação a cada 30 segundos
        setInterval(() => {
            if (Notification.permission === 'granted' && userData) {
                const now = new Date();
                const[dH, dM] = userData.horaDormir.split(':');
                
                // Dispara se for o horário programado (30 min antes)
                if (now.getHours() == dH && now.getMinutes() == (dM - 30)) {
                    navigator.serviceWorker.ready.then(reg => {
                        reg.showNotification("Hora de desacelerar 🧘‍♂️", {
                            body: "Faltam 30 minutos para dormir. Melhore sua recuperação!",
                            icon: "./sleep-football-pro-192x192.png"
                        });
                    });
                }
            }
        }, 30000); 
    }

    // --- INICIALIZAÇÃO DO APP ---
    if(userData) {
        setupNotifications();
        // Aqui deve continuar o restante do seu código (carregamento de telas, etc)
        // Certifique-se de que o resto do código original não foi deletado!
    }
});
