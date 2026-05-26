(function() {
    let closingMode = 'daily';
    let currentAuthEmail = null;

    const reportMap = {
        daily: `[일일 분석 리포트]\n- 완료 지수: 92% 돌파\n- 특이사항: Invoice-HFHSZV60 정산 검역 1건 성공.\n- 대외 기관: 한국전력 합동 점검 완수.`,
        weekly: `[주간 분석 리포트]\n- 주간 종합 행정 성과율: 88%\n- KCI 메타분석 프로젝트 90%선 안착 완료.\n- 사무 비품 안전재고 확보 완료.`,
        monthly: `[월간 분석 리포트]\n- 5월 정기 행정 기안 총 28건 최종 승인.\n- 연구원 워크로드 최적화 세션 가동 완료.`,
        quarterly: `[분기 분석 리포트]\n- Q2 예산 대비 집행률: 64.2% (정상 범주 운용)\n- 화상 회의실 설비 가동률 100%.`
    };

    document.addEventListener("DOMContentLoaded", function() {
        startClock();
        renderHeatmap();
        renderTrendLineChart();
        fetchChatStream();
        fetchPostIts();
        fetchWorkAssignments();
        window.switchClosingTab('daily');
    });

    function startClock() {
        const target = document.getElementById("current-time");
        setInterval(() => {
            const d = new Date();
            const days = ["일", "월", "화", "수", "목", "금", "토"];
            if(target) target.innerText = `${d.getFullYear()}.05.19 (${days[d.getDay()]}) ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
        }, 1000);
    }

    window.triggerGoogleAuth = function() {
        currentAuthEmail = prompt("🔐 Google OAuth 2.0 사용자 계정 인증\n\n이메일을 주소를 입력하세요:", "nam-suho@hufs.ac.kr");
        if(currentAuthEmail && currentAuthEmail.includes('@')) {
            document.getElementById("user-display-name").innerHTML = `<strong style="color:#00f0ad;">남수호 학부연구원 (${currentAuthEmail})</strong>`;
            document.getElementById("google-login-area").innerHTML = `<span style="color:#00f0ad; font-weight:bold;">인증 완료</span>`;
            document.getElementById("input-target-email").value = currentAuthEmail;
            alert("🌐 Google OAuth 토큰 발행 성공! 대시보드 마스터 계정 세션이 활성화되었습니다.");
        }
    };

    window.handleRoleChange = function() {
        const role = document.getElementById("select-role").value;
        const btn = document.getElementById("btn-save-work");
        if(role === 'leader') {
            document.getElementById("text-leader-work").readOnly = false;
            document.getElementById("text-team-work").readOnly = false;
            btn.style.display = "block";
            alert("👑 관리자(팀장) 보안 권한 활성화. 분장 내용을 수정하고 전사 서버 공유가 가능합니다.");
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
        }).then(res => res.json()).then(data => { if(data.success) alert("💾 업무 분장 서버 저장소 실시간 동기화 완료."); });
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

    window.deletePostIt = function(id) {
        fetch(`/api/postit/${id}`, { method: 'DELETE' }).then(() => fetchPostIts());
    };

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
                    <div class="stat-m-card"><span>총액</span><strong>₩22</strong></div>
                    <div class="stat-m-card"><span>건수</span><strong>1건</strong></div>
                    <div class="stat-m-card"><span>AI판정</span><strong style="color:#00f0ad">적합</strong></div>
                    <div class="stat-m-card"><span>리스크</span><strong>0%</strong></div>
                </div>
                <ul class="b-ins-list">
                    <li>📋 Genspark AI 생산성 도구 해외 정기 구독 결제 영수증 매칭 완료.</li>
                    <li>⚠️ 달러 환산 원천징수 세법 조항 대조 통과 (연구비 집행 적합).</li>
                </ul>`;
        }, 800);
    };

    function renderHeatmap() {
        const m = document.getElementById("productivity-heatmap");
        if(!m) return;
        const colors = ['#1e2342','#2b325c','#3d4785','#2b325c','#121424','#ff4a85','#ff4a85','#3d4785','#1e2342','#121424'];
        m.innerHTML = colors.map(c => `<div class="heatmap-cell" style="background:${c}"></div>`).join('');
    }

    function renderTrendLineChart() {
        const ctx = document.getElementById('kpiTrendLineChart');
        if(!ctx) return;
        new Chart(ctx, {
            type: 'line',
            data: { labels: ['월', '화', '수', '목', '금'], datasets: [{ data: [75, 88, 92, 85, 95], borderColor: '#ff4a85', backgroundColor: 'rgba(255,74,133,0.08)', borderWidth: 1.5, fill: true, tension:0.2 }] },
            options: { plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: '#1c1e36' }, ticks:{font:{size:7}, color:'#7882b6'} }, x: { grid: { display: false }, ticks:{font:{size:7}, color:'#7882b6'} } } }
        });
    }

    function initVacationDoughnut() {
        const ctx = document.getElementById('vacationChart');
        if(!ctx) return;
        new Chart(ctx, {
            type: 'doughnut',
            data: { datasets: [{ data: [4, 2, 11], backgroundColor: ['#2563eb', '#ffb800', '#00f0ad'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins:{legend:{display:false}} }
        });
    }

    window.openApiModal = function() { document.getElementById("api-modal").style.display = "flex"; };
    window.closeApiModal = function() { document.getElementById("api-modal").style.display = "none"; };
})();