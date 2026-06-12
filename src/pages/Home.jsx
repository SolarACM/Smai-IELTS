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
    tag: 'เร็ว ๆ นี้',
    title: 'Reading',
    desc: 'ฝึกเองได้เต็มที่ — passages พร้อมจับเวลาและเฉลยละเอียด',
    pain: 'ฝึกคนเดียวได้',
    active: false,
  },
  {
    to: '/listening',
    tag: 'เร็ว ๆ นี้',
    title: 'Listening',
    desc: 'ฝึกเองได้เต็มที่ — 4 sections หลายสำเนียง พร้อม transcript',
    pain: 'ฝึกคนเดียวได้',
    active: false,
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
              IELTS Academic & General · เน้น Speaking + Writing
            </span>
            <h1 className="mt-5 font-display text-4xl leading-[1.1] sm:text-5xl md:text-6xl">
              ไต่สู่ Band
              <br />
              ที่คุณตั้งเป้า
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-navy-100">
              สองทักษะที่ฝึกคนเดียวยากที่สุดในข้อสอบ IELTS คือ <strong className="text-white">การพูด</strong> และ
              <strong className="text-white"> การเขียน</strong> — Smai IELTS จำลองห้องสอบ จับเวลาเหมือนจริง
              และมีผู้ช่วย AI ทำหน้าที่กรรมการคุมสอบและตรวจให้คะแนนแทนติวเตอร์
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
              after="AI ถามทีละพาร์ต จับเวลา และให้ band 4 เกณฑ์"
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
            className={
              'card group relative p-6 transition hover:shadow-lift ' +
              (s.active ? '' : 'opacity-80')
            }
          >
            <div className="flex items-center justify-between">
              <span
                className={
                  'chip ' +
                  (s.active ? 'bg-ember-50 text-ember-700' : 'bg-navy-50 text-navy-500')
                }
              >
                {s.tag}
              </span>
              <span className="font-display text-sm text-navy-400">{s.pain}</span>
            </div>
            <h3 className="mt-4 text-2xl">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-500">{s.desc}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-ember-600 group-hover:translate-x-1">
              {s.active ? 'เข้าฝึก →' : 'ดูตัวอย่าง →'}
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
            ['2', 'ทำเหมือนสอบ', 'พูดอัดเสียง หรือพิมพ์ essay ภายใต้เวลาที่กำหนด ไม่มีตัวช่วย'],
            ['3', 'รับผลทันที', 'AI ให้ band รายเกณฑ์ + จุดที่ต้องแก้ หรือเทียบกับ model answer เอง'],
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
            <h3 className="text-xl">เปิดพลัง AI ได้ที่ปุ่ม “ตั้งค่า AI”</h3>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-navy-500">
              ใส่ API key ของ OpenAI หรือ Anthropic เพื่อให้ AI ตรวจและให้คะแนน band อัตโนมัติ
              ถ้ายังไม่เชื่อม ก็ใช้โหมดออฟไลน์ได้ทันที (timer, นับคำ, band descriptor, model answer)
            </p>
          </div>
          <span className="chip shrink-0 bg-ember-50 text-ember-700">ไม่มี AI ก็ใช้ได้</span>
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
