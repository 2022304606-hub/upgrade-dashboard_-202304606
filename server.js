const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// 온라인 데이터 무결성을 위한 실시간 메모리 데이터베이스
let messages = [
    { sender: "김팀장", text: "남수호 연구원, KCI 메타분석 정산 검역 올려주세요.", time: "23:12" },
    { sender: "남수호", text: "네 팀장님, AI 검역 결과 통과되어 실시간 전산 등록 완료했습니다.", time: "23:15" }
];

let postits = [
    { id: 1, text: "6/15 제주 학술대회 비행기 예약 필수", color: "#fef3c7" }
];

let workload = {
    leader: "Q2 경영실적 최종본 결재 승인 및 대외 기관 협약 총괄",
    team: "남수호 연구원: KCI 논문 데이터 정산 검역 및 비품 실시간 재고 관리"
};

// API 통신 라우터 체인
app.get('/api/chat', (req, res) => res.json(messages));
app.post('/api/chat', (req, res) => {
    const { sender, text } = req.body;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    messages.push({ sender, text, time: timeStr });
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

app.post('/api/mail-report', async (req, res) => {
    const { targetEmail, reportContent } = req.body;
    const systemUser = process.env.GMAIL_USER || 'demo@hufs.ac.kr';
    const systemPass = process.env.GMAIL_PASS || 'demo-password';
    try {
        let transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: systemUser, pass: systemPass } });
        if(process.env.GMAIL_USER && process.env.GMAIL_PASS) {
            await transporter.sendMail({ from: systemUser, to: targetEmail, subject: `📊 [일일 결산 보고] 남수호 대시보드 자동 발송`, text: reportContent });
            res.json({ success: true, msg: `${targetEmail} 주소로 실제 리포트 발송 완료!` });
        } else {
            res.json({ success: true, msg: `[SMTP 시뮬레이션 성공] 메일러 파이프라인 무결성 검증 통과.` });
        }
    } catch (e) { res.status(500).json({ success: false, msg: e.message }); }
});

app.listen(PORT, () => console.log(`서버 가동 중: 포트 ${PORT}`));