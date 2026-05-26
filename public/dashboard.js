(function() {
    // 구글 API 호출 코드는 여기서 싹 다 삭제했습니다.
    window.doLogin = function() {
        const email = document.getElementById("prof-email").value;
        const pw = document.getElementById("prof-pw").value;
        
        if(!email || !pw) {
            alert("이메일과 비밀번호를 입력해주세요.");
            return;
        }

        // 로그인 성공 시 화면 전환
        document.getElementById("auth-stage").classList.add("hidden");
        document.getElementById("dash-stage").classList.remove("hidden");
        
        // 프로필 바인딩
        document.getElementById("user-display-name").innerText = email.split('@')[0];
        
        setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 100);
    };

    // ... (이하 대시보드 기능 함수들은 그대로 유지)
})();