import { Link } from 'react-router-dom'

const skills = [
  {
    to: '/speaking',
    tag: 'จุดเด่น',
    title: 'Speaking',
    desc: 'ห้องสอบจำลอง 3 พาร์ตเต็มรูปแบบ จับเวลาเหมือนจริง อัดเสียงตัวเอง ฟังซ้ำ และให้ AI ทำหน้าที่กรรมการถาม-ตอบ + ให้ band',
    pain: 'แก้ปัญหา “ต้องมีคนซ้อมพูดด้วย”',
    active: true,
  },
  {
    to: '/writing',
    tag: 'จุดเด่น',
    title: 'Writing',
    desc: 'Task 1 + Task 2 จับเวลา นับคำ พร้อม band descriptor checklist, model answer และ AI ตรวจ essay ให้คะแนนรายเกณฑ์ + แก้ประโยค',
    pain: 'แก้ปัญหา “ต้องมีคนตรวจ essay”',
    active: true,
  },
  {
    to: '/reading',
    tag: 'พร้อมใช้',
    title: 'Reading',
    desc: 'Passage แนวข้อสอบ พร้อมจับเวลา คำถาม True/False/Not Given, multiple choice และเติมคำ เฉลยพร้อมเหตุผลทุกข้อ',
    pain: 'ฝึกเองได้',
    active: true,
  },
  {
    to: '/listening',
    tag: 'พร้อมใช้',
    title: 'Listening',
    desc: 'เสียงเจ้าของภาษา เลือกสำเนียง US/UK ปรับความเร็วได้ ฟังแล้วตอบคำถาม พร้อมสคริปต์และเฉลย',
    pain: 'ฝึกเองได้',
    active: true,
  },
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-parchment">
        <div className="topo absolute inset-0 opacity-60" />
        <div className="container-app relative grid gap-10 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
          <div>
            <span className="chip bg-white/10 text-parchment ring-1 ring-white/15">
              IELTS Academic & General · ครบ 4 ทักษะ
            </span>
            <h1 className="mt-5 font-display text-4xl leading-[1.1] sm:text-5xl md:text-6xl">
              ไต่สู่ Band
              <br />
              ที่คุณตั้งเป้า
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-navy-100">
              สองทักษะที่ฝึกคนเดียวยากที่สุดในข้อสอบ IELTS คือ <strong className="text-white">การพูด</strong> และ
              <strong className="text-white"> การเขียน</strong> — Smai IELTS จำลองห้องสอบ จับเวลาเหมือนจริง
              และมีติวเตอร์ AI ในตัวคอยถาม-ตอบและตรวจให้คะแนน ครบทั้ง Reading และ Listening ด้วย
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/speaking" className="btn-primary">เริ่มซ้อม Speaking →</Link>
              <Link to="/writing" className="btn-ghost">ตรวจ Writing</Link>
            </div>
          </div>

          <div className="grid content-center gap-4">
            <PainCard
              icon="🎙"
              title="Speaking"
              before="ต้องจ้างติวเตอร์มาถามคำถาม ทำ mock test"
              after="ติวเตอร์ AI ถามทีละพาร์ต จับเวลา และให้ band 4 เกณฑ์"
            />
            <PainCard
              icon="✍️"
              title="Writing"
              before="ต้องหาคนเก่งมาตรวจ essay ให้คะแนน"
              after="AI ตรวจรายเกณฑ์ แก้ประโยค พร้อม model answer"
            />
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="container-app -mt-12 grid gap-5 md:grid-cols-2">
        {skills.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="card group relative p-6 transition hover:shadow-lift"
          >
            <div className="flex items-center justify-between">
              <span className={'chip ' + (s.tag === 'จุดเด่น' ? 'bg-ember-50 text-ember-700' : 'bg-navy-50 text-navy-500')}>
                {s.tag}
              </span>
              <span className="font-display text-sm text-navy-400">{s.pain}</span>
            </div>
            <h3 className="mt-4 text-2xl">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-500">{s.desc}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-ember-600 group-hover:translate-x-1">
              เข้าฝึก →
            </span>
          </Link>
        ))}
      </section>

      {/* How it works */}
      <section className="container-app mt-20">
        <h2 className="text-center text-3xl">ใช้งานยังไง</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ['1', 'เลือกโจทย์จริง', 'โจทย์แนวข้อสอบ IELTS พร้อมตัวจับเวลาตามเวลาสอบจริง'],
            ['2', 'ทำเหมือนสอบ', 'พูดอัดเสียง พิมพ์ essay หรือฟังเสียง native ภายใต้เวลาที่กำหนด'],
            ['3', 'รับผลทันที', 'ติวเตอร์ AI ให้ band รายเกณฑ์ หรือเฉลยพร้อมเหตุผลทุกข้อ'],
          ].map(([n, t, d]) => (
            <div key={n} className="card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ink font-display text-lg font-bold text-ember-400">
                {n}
              </span>
              <h3 className="mt-4 text-xl">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI note */}
      <section className="container-app mt-20">
        <div className="card flex flex-col items-start gap-4 bg-navy-50/50 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl">ติวเตอร์ AI พร้อมใช้ในตัว</h3>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-navy-500">
              ไม่ต้องตั้งค่าอะไร แค่กด “ให้ AI ตรวจ” ระบบจะให้คะแนน band รายเกณฑ์พร้อม feedback
              (ถ้าใครอยากใช้ API key ของตัวเองก็ทำได้ที่ปุ่มตั้งค่า)
            </p>
          </div>
          <span className="chip shrink-0 bg-ember-50 text-ember-700">ครบ 4 ทักษะ</span>
        </div>
      </section>
    </div>
  )
}

function PainCard({ icon, title, before, after }) {
  return (
    <div className="rounded-xl2 bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur">
      <div className="flex items-center gap-2 text-white">
        <span className="text-xl">{icon}</span>
        <span className="font-display text-lg font-semibold">{title}</span>
      </div>
      <p className="mt-3 text-sm text-rose-200 line-through decoration-rose-300/50">{before}</p>
      <p className="mt-1.5 text-sm font-medium text-emerald-200">→ {after}</p>
    </div>
  )
}
