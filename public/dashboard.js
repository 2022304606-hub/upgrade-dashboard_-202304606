(function() {
    let currentAuthEmail = null;

    document.addEventListener("DOMContentLoaded", function() {
        startClock();
        renderHeatmap();
        renderTrendLineChart();
        initializeGoogleSignIn(); // 구글 로그인 버튼 렌더링
    });

    // 🚀 [핵심] 진짜 구글 API 세팅
    function initializeGoogleSignIn() {
        if (window.google && google.accounts) {
            google.accounts.id.initialize({
                // 주의: 과제 제출용이므로 임의의 client_id로 세팅. 실제 동작은 GCP 등록 필요
                client_id: "123456789-dummy-client.apps.googleusercontent.com",
                callback: handleGoogleResponse
            });
            google.accounts.id.renderButton(
                document.getElementById("google-button-div"),
                { theme: "outline", size: "large", width: "300" }
            );
        }
    }

    function handleGoogleResponse(response) {
        // 실제 GCP 연동이 없으므로, 버튼 클릭 이벤트 발생 시 데모 로그인으로 우회 연결 처리
        window.enterViaDemoMode();
    }

    // 🔒 인증 완료 후 대시보드 화면 100% 렌더링
    window.completeAuthFlow = function(name, email) {
        currentAuthEmail = email;
        
        // 데이터 대시보드 계정 연동 바인딩
        document.getElementById("user-display-name").innerText = `${name} (${email})`;
        document.getElementById("input-target-email").value = email;

        // 로그인 레이어 영구 파기 후 5열 전산 대시보드 100% 활성화
        document.getElementById("auth-welcome-screen").classList.add("hidden-stage");
        document.getElementById("main-dashboard-viewport").classList.remove("hidden-stage");
        
        // Chart.js 프레임 리사이징 동기화 리셋 트리거
        setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 50);
    };

    window.enterViaDemoMode = function() {
        window.completeAuthFlow("남수호", "2022304606@hufs.ac.kr");
    };

    function startClock() {
        const target = document.getElementById("current-time");
        setInterval(() => {
            const d = new Date();
            const days = ["일", "월", "화", "수", "목", "금", "토"];
            if(target) target.innerText = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} (${days[d.getDay()]}) ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
        }, 1000);
    }

    window.sendSnsMessage = function() {
        const input = document.getElementById("input-chat-msg");
        const box = document.getElementById("chat-stream-box");
        if(!input || input.value.trim() === "") return;
        
        box.innerHTML += `<div class="chat-msg-line"><strong style="color:#00f0ad;">${currentAuthEmail ? "남수호" : "연구원"}:</strong> ${input.value}</div>`;
        input.value = ""; 
        box.scrollTop = box.scrollHeight;
    };

    window.dispatchClosingEmail = function() {
        alert(`🚀 ${document.getElementById("input-target-email").value} 주소로 일일 결산 보고서가 자동 발송되었습니다.`);
    };

    window.triggerInvoiceAnalysis = function() {
        const btn = document.getElementById("ai-scan-btn");
        btn.innerText = "분석 중...";
        setTimeout(() => {
            btn.innerText = "✅ 검역 완료 (₩22.00 적합)";
            btn.style.background = "#00f0ad";
            btn.style.color = "#160e15";
        }, 800);
    };

    function renderHeatmap() {
        const m = document.getElementById("productivity-heatmap");
        if(!m) return;
        const colors = ['#211522','#3d263d','#ff4a85','#3d263d','#160e15','#ffb800','#ff4a85','#3d263d','#211522','#160e15'];
        m.innerHTML = colors.map(c => `<div class="heatmap-cell" style="background:${c}"></div>`).join('');
    }

    function renderTrendLineChart() {
        const ctx = document.getElementById('workTrendChart');
        if(!ctx) return;
        new Chart(ctx, {
            type: 'line',
            data: { labels: ['1주', '2주', '3주', '4주', '5주'], datasets: [{ label: '완료도', data: [75, 88, 92, 85, 98], borderColor: '#ffb800', backgroundColor: 'rgba(255,184,0,0.1)', borderWidth: 1.5, fill: true, tension:0.2 }] },
            options: { plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: '#3d263d' }, ticks:{font:{size:7}, color:'#a893a4'} }, x: { grid: { display: false }, ticks:{font:{size:7}, color:'#a893a4'} } } }
        });
    }
})();