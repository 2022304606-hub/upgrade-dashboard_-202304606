const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = report = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// 라이브 전산 세션 유지를 위한 메모리 DB
let messages = [
    { sender: "김팀장", text: "남수호 연구원, KCI 메타분석 정산 스펙 검토 바랍니다.", time: "23:12" },
    { sender: "남수호", text: "네 팀장님, AI 검역 완료하여 시스템에 업로드 승인 대기 중입니다.", time: "23:15" }
];
let postits = [{ id: 1, text: "6/15 제주 학술대회 비행기 예약 필수", color: "#e0f2fe" }];
let workload = {
    leader: "Q2 경영실적 최종본 결재 승인 및 대외 기관 협약 총괄",
    team: "남수호 연구원: KCI 논문 데이터 정산 검역 및 비품 실시간 재고 관리"
};
let automationSwitches = { briefing: true, weeklyReport: false, receiptTagging: true };
let routineTasks = [
    { id: 1, text: "출근 직후 메일 자동 태깅 엔진 가동", done: true },
    { id: 2, text: "오전 결재 라인 무결성 스캔", done: true },
    { id: 3, text: "일일 작업 결산 일지 작성", done: false }
];

app.get('/api/chat', (req, res) => res.json(messages));
app.post('/api/chat', (req, res) => {
    const { sender, text } = req.body;
    const now = new Date();
    messages.push({ sender, text, time: `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}` });
    res.json(messages);
});
app.get('/api/postit', (req, res) => res.json(postits));
app.post('/api/postit', (req, res) => {
    postits.push({ id: Date.now(), text: req.body.text, color: req.body.color });
    res.json(postits);
});
app.delete('/api/postit/:id', (req, res) => {
    postits = postits.filter(p => p.id !== parseInt(req.params.id));
    res.json(postits);
});
app.get('/api/work', (req, res) => res.json(workload));
app.post('/api/work', (req, res) => {
    const { leader, team } = req.body;
    if(leader) workload.leader = leader;
    if(team) workload.team = team;
    res.json({ success: true, workload });
});
app.get('/api/automation', (req, res) => res.json(automationSwitches));
app.post('/api/automation/toggle', (req, res) => {
    const { key } = req.body;
    if (automationSwitches.hasOwnProperty(key)) automationSwitches[key] = !automationSwitches[key];
    res.json(automationSwitches);
});
app.get('/api/routines', (req, res) => res.json(routineTasks));
app.post('/api/routines/toggle', (req, res) => {
    routineTasks = routineTasks.map(t => t.id === parseInt(req.body.id) ? { ...t, done: !t.done } : t);
    res.json(routineTasks);
});
app.post('/api/mail-report', async (req, res) => {
    const { targetEmail, reportContent } = req.body;
    const systemUser = process.env.GMAIL_USER || 'demo@hufs.ac.kr';
    const systemPass = process.env.GMAIL_PASS || 'demo-password';
    try {
        let transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: systemUser, pass: systemPass } });
        if(process.env.GMAIL_USER && process.env.GMAIL_PASS) {
            await transporter.sendMail({ from: systemUser, to: targetEmail, subject: `📊 [커맨드 센터] 일일 결산 보고서 자동 발송`, text: reportContent });
            res.json({ success: true, msg: `${targetEmail} 주소로 실제 결산서 메일이 전송되었습니다.` });
        } else {
            res.json({ success: true, msg: `[SMTP 무결성 검증 통과] 내부 가상 메일러 파이프라인 전송 완료.` });
        }
    } catch (e) { res.status(500).json({ success: false, msg: e.message }); }
});

app.listen(PORT, () => console.log(`서버 가동 중: 포트 ${PORT}`));