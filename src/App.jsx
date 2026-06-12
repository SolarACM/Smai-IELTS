import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Speaking from './pages/Speaking.jsx'
import Writing from './pages/Writing.jsx'
import Reading from './pages/Reading.jsx'
import Listening from './pages/Listening.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/speaking" element={<Speaking />} />
        <Route path="/writing" element={<Writing />} />
        <Route path="/reading" element={<Reading />} />
        <Route path="/listening" element={<Listening />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  )
}
