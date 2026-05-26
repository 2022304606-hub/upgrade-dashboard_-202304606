(function() {
    let currentAuthEmail = null;

    document.addEventListener("DOMContentLoaded", function() {
        startClock();
        renderHeatmap();
        renderTrendLineChart();
        setupLiveConsole();
        initRealGoogleAuth(); // 진짜 구글 버튼 렌더링 호출
    });

    // 🚀 [해결책] 교수님 직접 입력 로그인 핸들러
    window.handleManualLogin = function() {
        const email = document.getElementById("prof-email-input").value;
        if(!email) {
            alert("시스템 접속을 위해 교수님의 이메일을 입력해주세요.");
            return;
        }
        const name = email.split('@')[0]; // 이메일 앞부분을 이름으로 사용
        executeFinalLogin(name, email);
    };

    // 🚀 [진짜 구글 API 연동] (GCP 클라이언트 ID 발급 시 401 오류 소멸됨)
    function initRealGoogleAuth() {
        if (window.google && google.accounts) {
            google.accounts.id.initialize({
                // 주의: 과제 제출 테스트용이므로 임시 ID 삽입. 나중에 GCP 등록 필요
                client_id: "123456789-hufs-test-client.apps.googleusercontent.com",
                callback: function(response) {
                    executeFinalLogin("Google User", "google-auth@hufs.ac.kr");
                }
            });
            google.accounts.id.renderButton(
                document.getElementById("real-google-auth-div"),
                { theme: "outline", size: "large", width: "100%" }
            );
        }
    }

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

    // 서버 로그 콘솔 시뮬레이터
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
        
        box.innerHTML += `<div class="msg"><strong>${currentAuthEmail ? "사용자" : "시스템"}:</strong> ${input.value}</div>`;
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