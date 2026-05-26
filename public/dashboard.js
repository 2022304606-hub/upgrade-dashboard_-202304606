(function() {
    let closingMode = 'daily';
    let currentAuthEmail = null;

    const reportMap = {
        daily: `[일일 분석 리포트]\n- 완료 지수: 92% 돌파\n- 특이사항: Invoice-HFHSZV60 정산 검역 1건 성공.\n- 대외 기관: 한국전력 합동 점검 완수.`,
        weekly: `[주간 분석 리포트]\n- 주간 종합 행정 성과율: 88%\n- KCI 메타분석 프로젝트 90%선 안착 완료.`,
        monthly: `[월간 분석 리포트]\n- 5월 정기 행정 기안 총 28건 최종 승인.\n- 연구원 워크로드 최적화 세션 가동 완료.`
    };

    document.addEventListener("DOMContentLoaded", function() {
        const currentUrl = window.location.hostname;
        const domainLbl = document.getElementById("dynamic-domain-lbl");
        if(domainLbl) domainLbl.innerText = currentUrl || "railway.app";

        startClock();
        renderHeatmap();
        renderTrendLineChart();
        fetchChatStream();
        fetchPostIts();
        fetchWorkAssignments();
        window.switchClosingTab('daily');
    });

    // 🚀 [구글 로그인 단일 파일 탭 스위칭]: 인트라넷 1단계 -> 2단계 이동
    window.navigateToGooglePicker = function() {
        document.getElementById("auth-welcome-screen").style.display = "none";
        document.getElementById("auth-google-picker-screen").style.display = "flex";
    };

    // 🔒 2단계 -> 3단계 이동 및 마스터 전산 프로필 정보 바인딩
    window.completeAuthFlow = function(name, email) {
        currentAuthEmail = email;
        
        document.getElementById("user-display-name").innerHTML = `<strong>${name} 학부연구원 (${email})</strong>`;
        document.getElementById("header-avatar-icon").innerText = name.charAt(0);
        document.getElementById("input-target-email").value = email;

        document.getElementById("auth-google-picker-screen").style.display = "none";
        document.getElementById("main-dashboard-viewport").style.display = "flex";
        
        // Chart.js 렌더링 리사이징 동기화 트리거
        setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 100);
    };

    window.enterViaDemoMode = function() {
        window.completeAuthFlow("데모연구원", "demo-session@hufs.ac.kr");
    };

    function startClock() {
        const target = document.getElementById("current-time");
        setInterval(() => {
            const d = new Date();
            const days = ["일", "월", "화", "수", "목", "금", "토"];
            if(target) target.innerText = `${d.getFullYear()}.05.27 (${days[d.getDay()]}) ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
        }, 1000);
    }

    window.toggleAutomation = function(key) {
        fetch('/api/automation/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: key })
        }).then(res => res.json()).then(switches => console.log("자동화 엔진 변동 스왑완료"));
    };

    window.handleRoleChange = function() {
        const role = document.getElementById("select-role").value;
        const btn = document.getElementById("btn-save-work");
        if(role === 'leader') {
            document.getElementById("text-leader-work").readOnly = false;
            document.getElementById("text-team-work").readOnly = false;
            btn.style.display = "block";
        } else {
            document.getElementById("text-leader-work").readOnly = true;
            document.getElementById("text-team-work").readOnly = true;
            btn.style.display = "none";
        }
    };

    window.fetchWorkAssignments = function() {
        fetch('/api/work').then(res => res.json()).then(data => {
            document.getElementById("text-leader-work").value = data.leader;
            document.getElementById("text-team-work").value = data.team;
        });
    };

    window.saveWorkAssignment = function() {
        fetch('/api/work', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leader: document.getElementById("text-leader-work").value, team: document.getElementById("text-team-work").value })
        }).then(res => res.json()).then(data => { if(data.success) alert("💾 서버 스토리지 영속 저장 동기화 완료."); });
    };

    window.switchClosingTab = function(mode) {
        closingMode = mode;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        event.target.classList?.add('active');
        document.getElementById("closing-report-view").innerText = reportMap[mode];
        document.getElementById("text-mail-preview").value = reportMap[mode];
    };

    window.fetchChatStream = function() {
        fetch('/api/chat').then(res => res.json()).then(messages => {
            const box = document.getElementById("chat-stream-box");
            if(box) box.innerHTML = messages.map(m => `<div class="chat-msg-line"><strong>${m.sender}</strong>: ${m.text} <span style="color:#535b82; font-size:6px;">[${m.time}]</span></div>`).join('');
            box.scrollTop = box.scrollHeight;
        });
    };

    window.sendSnsMessage = function() {
        const input = document.getElementById("input-chat-msg");
        if(!input || input.value.trim() === "") return;
        fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender: currentAuthEmail ? "남수호(인증)" : "남수호(Guest)", text: input.value })
        }).then(() => { input.value = ""; fetchChatStream(); });
    };

    window.fetchPostIts = function() {
        fetch('/api/postit').then(res => res.json()).then(data => {
            document.getElementById("postit-matrix-box").innerHTML = data.map(p => `
                <div class="postit-item" style="background-color: ${p.color};"><span>${p.text}</span><span class="postit-del" onclick="window.deletePostIt(${p.id})">✕</span></div>
            `).join('');
        });
    };

    window.addPostIt = function() {
        const txt = document.getElementById("input-postit-txt");
        const col = document.getElementById("select-postit-color").value;
        if(!txt || txt.value.trim() === "") return;
        fetch('/api/postit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: txt.value, color: col })
        }).then(() => { txt.value = ""; fetchPostIts(); });
    };

    window.deletePostIt = function(id) { fetch(`/api/postit/${id}`, { method: 'DELETE' }).then(() => fetchPostIts()); };
    window.dispatchClosingEmail = function() {
        fetch('/api/mail-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetEmail: document.getElementById("input-target-email").value, reportContent: document.getElementById("text-mail-preview").value })
        }).then(res => res.json()).then(data => alert(`🚀 ${data.msg}`));
    };

    window.triggerInvoiceAnalysis = function() {
        const view = document.getElementById("invoice-result-view");
        view.innerHTML = `<div class="spinner-loading"><div class="circle-spin"></div></div>`;
        setTimeout(() => {
            view.innerHTML = `
                <div class="stat-box-grid">
                    <div class="stat-m-card"><span>총액</span><strong>₩22.00</strong></div>
                    <div class="stat-m-card"><span>건수</span><strong>1건</strong></div>
                    <div class="stat-m-card"><span>AI판정</span><strong style="color:#00f0ad">✅ 적합</strong></div>
                    <div class="stat-m-card"><span>리스크</span><strong>0%</strong></div>
                </div>
                <ul class="b-ins-list">
                    <li>📋 <strong>Image 26 요약 리포트:</strong> 정기 구독료 결제 명세서 파싱 완료. 세법 리스크 분석 스캔 결과 부합 통과 완료.</li>
                </ul>`;
        }, 600);
    };

    function renderHeatmap() {
        const m = document.getElementById("productivity-heatmap");
        if(!m) return;
        const colors = ['#1e2342','#2b325c','#3d4785','#2b325c','#121424','#ff4a85','#ff4a85','#3d4785','#1e2342','#121424'];
        m.innerHTML = colors.map(c => `<div class="heatmap-cell" style="background:${c}"></div>`).join('');
    }

    function renderTrendLineChart() {
        const ctx = document.getElementById('workTrendChart');
        if(!ctx) return;
        new Chart(ctx, {
            type: 'line',
            data: { labels: ['월', '화', '수', '목', '금'], datasets: [{ data: [75, 88, 92, 85, 95], borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.08)', borderWidth: 1.5, fill: true, tension:0.2 }] },
            options: { plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: '#141830' }, ticks:{font:{size:7}, color:'#5a6496'} }, x: { grid: { display: false }, ticks:{font:{size:7}, color:'#5a6496'} } } }
        });
    }
})();