# Smai IELTS

เว็บติว IELTS ที่เน้นสองทักษะที่ฝึกคนเดียวยากที่สุด — **Speaking** และ **Writing** —
สานต่อจากแนวคิดของ SiMonTOEIC แต่เป็นแบรนด์ใหม่ที่ดูโตขึ้น

## จุดเด่น

- **Speaking** — ห้องสอบจำลอง 3 พาร์ตเต็มรูปแบบ จับเวลาเหมือนสอบจริง (Part 2 มี prep 1 นาที + พูด 2 นาที), อัดเสียงตัวเองฟังซ้ำ, transcript box ให้ AI เป็นกรรมการให้ band 4 เกณฑ์ + model answer
- **Writing** — Task 1 & Task 2 จับเวลา นับคำ, band descriptor checklist, model answer, และ AI ตรวจ essay รายเกณฑ์ + แก้ประโยค
- **Reading / Listening** — โครงไว้ต่อยอดเฟสถัดไป (ทักษะที่ฝึกคนเดียวได้)
- **ผู้ช่วย AI แบบเสียบได้** — ใส่ API key (OpenAI หรือ Anthropic) ในหน้า "ตั้งค่า AI"
  ถ้าไม่เชื่อมก็ใช้โหมดออฟไลน์ได้ทันที (timer, นับคำ, descriptor, model answer)

## รันในเครื่อง

```bash
npm install
npm run dev
```

## Build / Deploy

```bash
npm run build      # ออกที่ dist/
```

Deploy ขึ้น Vercel ได้เลย (มี `vercel.json` ตั้ง SPA rewrites ให้แล้ว) — import repo นี้แล้ว framework preset เลือก **Vite**

## เทคโนโลยี

Vite · React 18 · React Router · Tailwind CSS

## การเชื่อม AI

ค่า API key ถูกเก็บไว้ใน `localStorage` ของเบราว์เซอร์ผู้ใช้เท่านั้น และเรียก API ตรงจากฝั่ง client
เหมาะกับการใช้ส่วนตัว/เดโม — ถ้าจะเปิดสาธารณะจริงควรย้าย key ไปไว้หลังบ้าน (serverless proxy)
แก้ได้ที่ `src/lib/ai.js` (ฟังก์ชัน `gradeEssay`, `gradeSpeaking`)

## โครงสร้าง

```
src/
  data/        โจทย์ speaking, writing, band descriptors
  hooks/       useTimer, useRecorder
  lib/         ai.js (ตรวจ/ให้คะแนน), store.js (settings + progress)
  components/  Layout, BandPanel, BandDescriptors, SettingsModal, Logo
  pages/       Home, Speaking, Writing, ComingSoon
```
