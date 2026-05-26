(function() {
    let currentUserEmail = null;

    document.addEventListener("DOMContentLoaded", function() {
        startClock();
        renderHeatmap();
        renderTrendLineChart();
        setupLiveConsole();
    });

    // 🚀 [버그 완벽 해결] 로그인 버튼 클릭 시 발생하는 함수. 끊어진 CSS 클래스와 100% 매칭
    window.doLogin = function() {
        const emailInput = document.getElementById("prof-email").value;
        const email = emailInput ? emailInput : "professor@hufs.ac.kr"; // 미입력 시 기본값 처리
        const name = email.split('@')[0];

        currentUserEmail = email;
        
        // 1. 대시보드 프로필에 교수님 이메일 즉시 적용
        document.getElementById("user-display-name").innerText = `${name} (${email})`;
        document.getElementById("mail-input").value = email;

        // 2. 로그인 창 영구 소멸 & 메인 대시보드 강제 출력
        document.getElementById("auth-stage").classList.add("hidden");
        document.getElementById("dash-stage").classList.remove("hidden");
        
        // 3. 차트 크기 깨짐 방지용 리사이징 트리거
        setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 50);
    };

    function startClock() {
        const target = document.getElementById("current-time");
        setInterval(() => {
            const d = new Date();
            const days = ["일", "월", "화", "수", "목", "금", "토"];
            target.innerText = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} (${days[d.getDay()]}) ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
        }, 1000);
    }

    // 사내 메신저 작동
    window.sendChat = function() {
        const input = document.getElementById("chat-input");
        const box = document.getElementById("chat-box");
        if(!input.value.trim()) return;
        
        const userName = currentUserEmail ? currentUserEmail.split('@')[0] : "사용자";
        box.innerHTML += `<div class="msg"><strong>${userName}:</strong> ${input.value}</div>`;
        input.value = ""; 
        box.scrollTop = box.scrollHeight;
    };

    // 결산 메일 발송 작동
    window.sendMail = function() {
        const target = document.getElementById("mail-input").value;
        alert(`🚀 [시스템 알림]\n${target} 주소로 일일 결산 분석 리포트가 발송되었습니다.`);
    };

    // 영수증 AI 분석 작동
    window.triggerAI = function() {
        const btn = document.getElementById("ai-btn");
        btn.innerText = "분석 진행 중...";
        setTimeout(() => {
            btn.innerText = "✅ 세법 적합 (Risk 0%)";
            btn.style.background = "#00f0ff";
            btn.style.color = "#0b0f19";
        }, 800);
    };

    // 실시간 서버 로그 가동
    function setupLiveConsole() {
        const consoleBox = document.getElementById("log-box");
        if(!consoleBox) return;
        const logs = [
            "[NET] Connected to HUFS backbone network.",
            "[DB] Cache replication synchronized.",
            "[SYS] CPU load factor stable.",
            "[AI] Invoice tagging model active.",
            "[SEC] SSL certificate verified."
        ];
        setInterval(() => {
            const timeStr = new Date().toLocaleTimeString();
            const randomLog = logs[Math.floor(Math.random() * logs.length)];
            consoleBox.innerHTML += `<div>[${timeStr}] ${randomLog}</div>`;
            consoleBox.scrollTop = consoleBox.scrollHeight;
        }, 2500);
    }

    function renderHeatmap() {
        const m = document.getElementById("heatmap-container");
        if(!m) return;
        const colors = ['#151a2d','#232b45','#ff3366','#232b45','#0b0f19','#00f0ff','#ff3366','#232b45','#151a2d','#0b0f19'];
        m.innerHTML = colors.map(c => `<div style="background:${c};"></div>`).join('');
    }

    function renderTrendLineChart() {
        const ctx = document.getElementById('trendChart');
        if(!ctx) return;
        new Chart(ctx, {
            type: 'line',
            data: { labels: ['1주', '2주', '3주', '4주', '5주'], datasets: [{ data: [75, 88, 92, 85, 98], borderColor: '#00f0ff', backgroundColor: 'rgba(0,240,255,0.1)', borderWidth: 2, fill: true, tension:0.3 }] },
            options: { plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: '#232b45' }, ticks:{color:'#8f9bb3', font:{size:9}} }, x: { grid: { display: false }, ticks:{color:'#8f9bb3', font:{size:9}} } } }
        });
    }
})();