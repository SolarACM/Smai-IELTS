// IELTS Listening — each section has a spoken script (read aloud by the browser
// using a native Google voice) plus questions and an answer key.
export const listeningSections = [
  {
    id: 'accommodation-enquiry',
    title: 'Section 1 — Accommodation Enquiry',
    context: 'A student phones a letting agency to ask about a room to rent. (conversation)',
    accentDefault: 'en-GB',
    script: `Good morning, Bright Stay Lettings, how can I help you?
Hi, I'm calling about the room you advertised near the university. Is it still available?
Yes, it is. It's a single room in a shared house on Maple Road. The rent is ninety-five pounds per week, and that includes water and internet, but not electricity.
That sounds good. How far is it from the campus?
It's about a fifteen-minute walk, or five minutes by bike. There's also a bus that stops right outside, the number 12.
Great. And when would it be available from?
It's free from the first of October. We'd need a deposit of two hundred pounds to hold it, and we ask for references from a previous landlord or your college.
Okay. Could I arrange to view it this week?
Of course. How about Thursday afternoon, say three o'clock?
Thursday at three is perfect. My name is Daniel Foster.
Lovely, I'll book that in for you, Daniel.`,
    questions: [
      { id: 'l1', type: 'gap', q: 'The room is located on ______ Road.', answer: ['Maple'], why: '"a shared house on Maple Road".' },
      { id: 'l2', type: 'gap', q: 'The weekly rent is ______ pounds.', answer: ['95', 'ninety-five', 'ninety five'], why: '"ninety-five pounds per week".' },
      { id: 'l3', type: 'mc', q: 'Which bill is NOT included in the rent?', options: ['Water', 'Internet', 'Electricity', 'Heating'], answer: 2, why: '"includes water and internet, but not electricity".' },
      { id: 'l4', type: 'mc', q: 'How far is the house from campus on foot?', options: ['About 5 minutes', 'About 15 minutes', 'About 30 minutes', 'About 1 hour'], answer: 1, why: '"about a fifteen-minute walk".' },
      { id: 'l5', type: 'gap', q: 'The room is available from the first of ______.', answer: ['October'], why: '"free from the first of October".' },
      { id: 'l6', type: 'gap', q: 'A deposit of ______ pounds is required.', answer: ['200', 'two hundred'], why: '"a deposit of two hundred pounds".' },
      { id: 'l7', type: 'mc', q: 'When will the student view the room?', options: ['Wednesday morning', 'Thursday afternoon', 'Friday evening', 'Saturday morning'], answer: 1, why: 'Thursday afternoon at 3 p.m.' },
    ],
  },
  {
    id: 'campus-tour-lecture',
    title: 'Section 2 — Library Induction',
    context: 'A short talk introducing new students to the university library. (monologue)',
    accentDefault: 'en-US',
    script: `Welcome, everyone, to the university library. My name is Sarah, and I'll be giving you a quick introduction this morning. The library is open from eight in the morning until midnight on weekdays, and from ten until six at weekends. During exam periods, we stay open twenty-four hours a day. On the ground floor you'll find the help desk, the cafe, and the group study rooms, which you can book online for up to two hours at a time. The first floor is our silent study area, so please remember to switch your phones to silent before you go up. Most importantly, every student can borrow up to ten books at once, and the standard loan period is three weeks. If no one else has requested the book, you can renew it online. Please don't return books late, as fines are charged at twenty pence per day.`,
    questions: [
      { id: 'm1', type: 'mc', q: 'What time does the library close on weekdays?', options: ['Ten p.m.', 'Midnight', 'Six p.m.', 'It is open 24 hours'], answer: 1, why: '"until midnight on weekdays".' },
      { id: 'm2', type: 'mc', q: 'When is the library open 24 hours?', options: ['At weekends', 'During exam periods', 'On public holidays', 'Every Friday'], answer: 1, why: '"During exam periods, we stay open twenty-four hours".' },
      { id: 'm3', type: 'gap', q: 'Group study rooms can be booked for up to ______ hours.', answer: ['2', 'two'], why: '"book online for up to two hours".' },
      { id: 'm4', type: 'gap', q: 'The ______ floor is the silent study area.', answer: ['first'], why: '"The first floor is our silent study area".' },
      { id: 'm5', type: 'gap', q: 'Students can borrow up to ______ books at once.', answer: ['10', 'ten'], why: '"borrow up to ten books at once".' },
      { id: 'm6', type: 'gap', q: 'The standard loan period is ______ weeks.', answer: ['3', 'three'], why: '"the standard loan period is three weeks".' },
      { id: 'm7', type: 'mc', q: 'How much is the late fine per day?', options: ['Ten pence', 'Twenty pence', 'Fifty pence', 'One pound'], answer: 1, why: '"fines are charged at twenty pence per day".' },
    ],
  },
]
