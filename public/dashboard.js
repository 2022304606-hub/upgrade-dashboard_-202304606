(function() {
    let currentAuthEmail = null;

    document.addEventListener("DOMContentLoaded", function() {
        startClock();
        renderHeatmap();
        renderTrendLineChart();
        setupLiveConsole();
    });

    // 🚀 구글 로그인 팝업 호출 (에러 없는 완벽 팝업 구현)
    window.openGooglePopup = function() {
        const w = 440, h = 620;
        const left = (screen.width/2)-(w/2), top = (screen.height/2)-(h/2);
        window.open('google-login.html', 'GoogleLogin', `width=${w},height=${h},top=${top},left=${left}`);
    };

    // 팝업으로부터 이메일 데이터 수신
    window.addEventListener("message", function(event) {
        if (event.data && event.data.type === "GOOGLE_AUTH_SUCCESS") {
            executeFinalLogin(event.data.name, event.data.email);
        }
    }, false);

    window.enterViaDemoMode = function() {
        executeFinalLogin("데모연구원", "2022304606@hufs.ac.kr");
    };

    function executeFinalLogin(name, email) {
        currentAuthEmail = email;
        document.getElementById("user-display-name").innerText = `${name} (${email})`;
        document.getElementById("input-target-email").value = email;

        // 화면 전환 처리
        document.getElementById("auth-welcome-screen").classList.add("hidden-stage");
        document.getElementById("main-dashboard-viewport").classList.remove("hidden-stage");
        
        setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 100);
    }

    function startClock() {
        const target = document.getElementById("current-time");
        setInterval(() => {
            const d = new Date();
            const days = ["일", "월", "화", "수", "목", "금", "토"];
            target.innerText = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} (${days[d.getDay()]}) ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
        }, 1000);
    }

    // 서버 로그 콘솔 시뮬레이터 (실시간 작동감 부여)
    function setupLiveConsole() {
        const consoleBox = document.getElementById("live-system-console");
        if(!consoleBox) return;
        const logs = [
            "[NET] Connected to HUFS proxy backbone network.",
            "[DB] Cache replication synchronized successfully.",
            "[SYS] CPU load factor stable at 12%.",
            "[AI] Invoice tagging model checked.",
            "[SEC] SSL certificate validation: Verified."
        ];
        setInterval(() => {
            const timeStr = new Date().toLocaleTimeString();
            const randomLog = logs[Math.floor(Math.random() * logs.length)];
            consoleBox.innerHTML += `<div>[${timeStr}] ${randomLog}</div>`;
            consoleBox.scrollTop = consoleBox.scrollHeight;
        }, 3000);
    }

    window.sendSnsMessage = function() {
        const input = document.getElementById("input-chat-msg");
        const box = document.getElementById("chat-stream-box");
        if(!input.value.trim()) return;
        
        box.innerHTML += `<div class="msg"><strong>${currentAuthEmail ? "남수호" : "사용자"}:</strong> ${input.value}</div>`;
        input.value = ""; 
        box.scrollTop = box.scrollHeight;
    };

    window.dispatchEmail = function() {
        const target = document.getElementById("input-target-email").value;
        alert(`🚀 ${target} 주소로 결산 리포트가 발송되었습니다.`);
    };

    window.triggerAI = function() {
        const btn = document.getElementById("ai-btn");
        btn.innerText = "분석 중...";
        setTimeout(() => {
            btn.innerText = "✅ 적합 (Risk 0%)";
            btn.style.background = "#00f0ff";
            btn.style.color = "#0b0f19";
        }, 800);
    };

    function renderHeatmap() {
        const m = document.getElementById("productivity-heatmap");
        if(!m) return;
        const colors = ['#151a2d','#232b45','#ff3366','#232b45','#0b0f19','#00f0ff','#ff3366','#232b45','#151a2d','#0b0f19'];
        m.innerHTML = colors.map(c => `<div style="background:${c}; border-radius:2px;"></div>`).join('');
    }

    function renderTrendLineChart() {
        const ctx = document.getElementById('workTrendChart');
        if(!ctx) return;
        new Chart(ctx, {
            type: 'line',
            data: { labels: ['1주', '2주', '3주', '4주', '5주'], datasets: [{ data: [75, 88, 92, 85, 98], borderColor: '#00f0ff', backgroundColor: 'rgba(0,240,255,0.1)', borderWidth: 2, fill: true, tension:0.3 }] },
            options: { plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: '#232b45' }, ticks:{color:'#8f9bb3', font:{size:9}} }, x: { grid: { display: false }, ticks:{color:'#8f9bb3', font:{size:9}} } } }
        });
    }
})();