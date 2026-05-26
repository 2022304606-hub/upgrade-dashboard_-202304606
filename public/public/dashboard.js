(function () {

    // =========================================================================
    // ✅ [설정] 여기에 Google Cloud Console에서 발급받은 Client ID를 입력하세요.
    //    발급 방법: https://console.cloud.google.com → API 및 서비스 → 사용자 인증 정보
    //    → OAuth 2.0 클라이언트 ID 만들기 → 승인된 자바스크립트 원본에 현재 도메인 추가
    //
    //    Client ID가 없을 경우: GSI 렌더링은 실패하지만, 아래 fallback 버튼이 표시됩니다.
    // =========================================================================
    const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

    let currentUserEmail = null;

    // =========================================================================
    // DOM 준비 완료 시 실행
    // =========================================================================
    document.addEventListener("DOMContentLoaded", function () {
        initializeGoogleLogin(); // ✅ GSI 초기화 (로그인 버튼 렌더링)
        startClock();
        renderHeatmap();
        renderTrendLineChart();
        setupLiveConsole();
    });


    // =========================================================================
    // ✅ [핵심 추가] Google Identity Services 초기화 및 버튼 렌더링
    // =========================================================================
    function initializeGoogleLogin() {

        // GSI 라이브러리 로드 여부 확인 (async 로드이므로 폴링으로 대기)
        let retryCount = 0;
        const MAX_RETRY = 20; // 최대 10초 대기 (500ms × 20)

        const waitForGSI = setInterval(function () {
            retryCount++;

            if (typeof google !== "undefined" && google.accounts) {
                // ── GSI 라이브러리 로드 성공 ──
                clearInterval(waitForGSI);

                try {
                    // Step 1: google.accounts.id 초기화
                    google.accounts.id.initialize({
                        client_id: GOOGLE_CLIENT_ID,
                        callback: handleCredentialResponse, // 로그인 성공 시 호출될 콜백
                        auto_select: false,                 // 자동 로그인 방지 (명시적 선택 유도)
                        cancel_on_tap_outside: true,        // 바깥 클릭 시 One Tap 닫기
                        ux_mode: "popup",                   // 팝업 방식 (redirect 방식 대신)
                    });

                    // Step 2: #google-button-div 안에 공식 구글 로그인 버튼 렌더링
                    google.accounts.id.renderButton(
                        document.getElementById("google-button-div"),
                        {
                            theme: "filled_blue",  // 버튼 테마: filled_blue | outline | filled_black
                            size: "large",         // 버튼 크기: large | medium | small
                            type: "standard",      // 버튼 타입: standard(텍스트+아이콘) | icon
                            shape: "rectangular",  // 버튼 모양: rectangular | pill | circle | square
                            locale: "ko",          // 버튼 언어: 한국어
                            width: 300,            // 버튼 너비(px)
                        }
                    );

                    // (선택) One Tap 팝업도 함께 표시
                    // google.accounts.id.prompt();

                    console.log("[GSI] Google 로그인 버튼 렌더링 완료.");

                } catch (err) {
                    // Client ID가 잘못되었거나 도메인 불일치 시 → fallback 버튼 표시
                    console.warn("[GSI] 초기화 실패 (Client ID 확인 필요):", err.message);
                    showFallbackButton();
                }

            } else if (retryCount >= MAX_RETRY) {
                // ── GSI 라이브러리 로드 타임아웃 → fallback 버튼 표시 ──
                clearInterval(waitForGSI);
                console.warn("[GSI] 라이브러리 로드 타임아웃. 네트워크 환경을 확인하거나 Client ID를 점검하세요.");
                showFallbackButton();
            }
        }, 500);
    }

    // =========================================================================
    // ✅ [핵심 추가] 구글 로그인 성공 시 자동 호출되는 콜백 함수
    //    response.credential : JWT(JSON Web Token) 형식의 ID Token
    // =========================================================================
    function handleCredentialResponse(response) {
        try {
            // JWT payload 부분(Base64)을 디코딩해 사용자 정보 추출
            // JWT 구조: header.payload.signature  →  payload만 필요
            const base64Payload = response.credential.split(".")[1];

            // Base64URL → Base64 변환 후 디코딩
            const decodedPayload = JSON.parse(
                atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"))
            );

            // 이메일, 이름, 프로필 사진 등 추출
            const email = decodedPayload.email || "unknown@google.com";
            const name  = decodedPayload.name  || email.split("@")[0];

            console.log("[GSI] 로그인 성공:", email);

            // 화면 전환 실행
            activateDashboard(email, name);

        } catch (err) {
            console.error("[GSI] 토큰 디코딩 실패:", err);
            alert("로그인 처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
        }
    }

    // =========================================================================
    // ✅ [핵심 추가] 로그인 후 화면 전환 + 사용자 정보 업데이트 (단일 책임 함수)
    //    지시사항 3번, 4번 구현부
    // =========================================================================
    function activateDashboard(email, name) {
        currentUserEmail = email;

        // [지시사항 3] #user-display-name 즉시 업데이트
        document.getElementById("user-display-name").innerText = `${name} (${email})`;
        document.getElementById("mail-input").value = email;

        // [지시사항 4] 로그인 화면 숨기기 + 대시보드 표시
        //   - auth-stage  → display: none  (기존 CSS .hidden 클래스 활용)
        //   - dash-stage  → display: flex  (기존 CSS .hidden 클래스 제거)
        document.getElementById("auth-stage").classList.add("hidden");
        document.getElementById("dash-stage").classList.remove("hidden");

        // 차트 크기 깨짐 방지: 숨겨진 상태에서 렌더링된 canvas 재계산 트리거
        setTimeout(function () {
            window.dispatchEvent(new Event("resize"));
        }, 50);
    }

    // =========================================================================
    // ✅ [추가] GSI 로드/초기화 실패 시 표시되는 fallback 버튼 핸들러
    //    실제 배포 전 테스트 & Client ID 발급 전 임시 접속용
    // =========================================================================
    function showFallbackButton() {
        document.getElementById("google-button-div").style.display = "none";
        document.getElementById("fallback-login-btn").style.display = "block";
    }

    window.doFallbackLogin = function () {
        // Client ID 없이도 UI 테스트가 가능하도록 임시 이메일로 로그인 처리
        const fallbackEmail = "professor@hufs.ac.kr";
        const fallbackName  = "professor";
        console.warn("[Fallback] GSI 미사용 임시 로그인 처리:", fallbackEmail);
        activateDashboard(fallbackEmail, fallbackName);
    };


    // =========================================================================
    // 기존 함수들 (수정 없음)
    // =========================================================================

    function startClock() {
        const target = document.getElementById("current-time");
        setInterval(function () {
            const d = new Date();
            const days = ["일", "월", "화", "수", "목", "금", "토"];
            target.innerText =
                `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ` +
                `(${days[d.getDay()]}) ` +
                `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
        }, 1000);
    }

    window.sendChat = function () {
        const input = document.getElementById("chat-input");
        const box   = document.getElementById("chat-box");
        if (!input.value.trim()) return;
        const userName = currentUserEmail ? currentUserEmail.split("@")[0] : "사용자";
        box.innerHTML += `<div class="msg"><strong>${userName}:</strong> ${input.value}</div>`;
        input.value = "";
        box.scrollTop = box.scrollHeight;
    };

    window.sendMail = function () {
        const target = document.getElementById("mail-input").value;
        alert(`🚀 [시스템 알림]\n${target} 주소로 일일 결산 분석 리포트가 발송되었습니다.`);
    };

    window.triggerAI = function () {
        const btn = document.getElementById("ai-btn");
        btn.innerText = "분석 진행 중...";
        setTimeout(function () {
            btn.innerText = "✅ 세법 적합 (Risk 0%)";
            btn.style.background = "#00f0ff";
            btn.style.color = "#0b0f19";
        }, 800);
    };

    function setupLiveConsole() {
        const consoleBox = document.getElementById("log-box");
        if (!consoleBox) return;
        const logs = [
            "[NET] Connected to HUFS backbone network.",
            "[DB] Cache replication synchronized.",
            "[SYS] CPU load factor stable.",
            "[AI] Invoice tagging model active.",
            "[SEC] SSL certificate verified.",
        ];
        setInterval(function () {
            const timeStr   = new Date().toLocaleTimeString();
            const randomLog = logs[Math.floor(Math.random() * logs.length)];
            consoleBox.innerHTML += `<div>[${timeStr}] ${randomLog}</div>`;
            consoleBox.scrollTop = consoleBox.scrollHeight;
        }, 2500);
    }

    function renderHeatmap() {
        const m = document.getElementById("heatmap-container");
        if (!m) return;
        const colors = ["#151a2d","#232b45","#ff3366","#232b45","#0b0f19","#00f0ff","#ff3366","#232b45","#151a2d","#0b0f19"];
        m.innerHTML = colors.map(function (c) { return `<div style="background:${c};"></div>`; }).join("");
    }

    function renderTrendLineChart() {
        const ctx = document.getElementById("trendChart");
        if (!ctx) return;
        new Chart(ctx, {
            type: "line",
            data: {
                labels: ["1주", "2주", "3주", "4주", "5주"],
                datasets: [{
                    data: [75, 88, 92, 85, 98],
                    borderColor: "#00f0ff",
                    backgroundColor: "rgba(0,240,255,0.1)",
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                }],
            },
            options: {
                plugins: { legend: { display: false } },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: "#232b45" }, ticks: { color: "#8f9bb3", font: { size: 9 } } },
                    x: { grid: { display: false },  ticks: { color: "#8f9bb3", font: { size: 9 } } },
                },
            },
        });
    }

})();
