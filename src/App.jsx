import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Speaking from './pages/Speaking.jsx'
import Writing from './pages/Writing.jsx'
import ComingSoon from './pages/ComingSoon.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/speaking" element={<Speaking />} />
        <Route path="/writing" element={<Writing />} />
        <Route
          path="/reading"
          element={
            <ComingSoon
              skill="Reading"
              blurb="Academic & General passages พร้อมจับเวลา ทุกชนิดคำถาม (T/F/NG, matching headings, gap-fill) และเฉลยพร้อมเหตุผล"
            />
          }
        />
        <Route
          path="/listening"
          element={
            <ComingSoon
              skill="Listening"
              blurb="4 sections เสียงเจ้าของภาษา หลากสำเนียง พร้อม transcript, จับคำตอบ และสรุปจุดที่พลาด"
            />
          }
        />
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  )
}
