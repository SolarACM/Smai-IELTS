import { Link } from 'react-router-dom'

export default function ComingSoon({ skill, blurb }) {
  return (
    <div className="container-app py-16">
      <div className="card mx-auto max-w-2xl p-10 text-center">
        <span className="chip bg-navy-50 text-navy-500">เร็ว ๆ นี้</span>
        <h1 className="mt-4 text-4xl">{skill}</h1>
        <p className="mt-3 leading-relaxed text-navy-500">{blurb}</p>
        <div className="mt-6 rounded-xl bg-parchment p-4 text-sm text-navy-500 ring-1 ring-navy-100">
          ทักษะนี้ฝึกคนเดียวได้อยู่แล้ว เราจึงเก็บไว้พัฒนาในเฟสถัดไป — รอบนี้เน้น
          <strong className="text-ink"> Speaking</strong> และ
          <strong className="text-ink"> Writing</strong> ซึ่งเป็นจุดที่ต้องมีคนช่วยซ้อม/ตรวจ
        </div>
        <div className="mt-7 flex justify-center gap-3">
          <Link to="/speaking" className="btn-primary">ไปฝึก Speaking</Link>
          <Link to="/writing" className="btn-ghost">ไปฝึก Writing</Link>
        </div>
      </div>
    </div>
  )
}
