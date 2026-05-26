window.doLogin = function() {
    const email = document.getElementById("email").value;
    const pw = document.getElementById("pw").value;
    if(!email || !pw) return alert("입력하세요");
    document.getElementById("auth-stage").classList.add("hidden");
    document.getElementById("dash-stage").classList.remove("hidden");
    document.getElementById("user-display-name").innerText = email.split('@')[0];
};

window.sendChat = function() {
    const input = document.getElementById("chat-in");
    const box = document.getElementById("chat-box");
    box.innerHTML += `<div><strong>You:</strong> ${input.value}</div>`;
    input.value = "";
};

window.triggerAI = function() {
    const btn = document.getElementById("ai-btn");
    btn.innerText = "검사중...";
    setTimeout(() => btn.innerText = "✅ 적합 (Risk 0%)", 800);
};

window.sendMail = function() {
    alert("리포트 발송 완료!");
};

window.addTodo = function() {
    const list = document.getElementById("todo-list");
    const val = document.getElementById("todo-in").value;
    list.innerHTML += `<li>${val}</li>`;
};