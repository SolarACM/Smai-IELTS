// IELTS Writing content — Task 1 & Task 2 with model answers.
export const writingTasks = [
  {
    id: 't2-tech-jobs',
    task: 'Task 2',
    type: 'Academic / General',
    minWords: 250,
    time: 40,
    prompt:
      'Some people believe that technological progress will eventually replace most human jobs, while others argue that it will create new opportunities instead. Discuss both views and give your own opinion.',
    plan: [
      'Intro: paraphrase + state your position',
      'Body 1: view that technology displaces jobs (automation, examples)',
      'Body 2: view that technology creates jobs (new industries, reskilling)',
      'Conclusion: restate balanced opinion',
    ],
    model:
      'The relentless march of technology has reignited a long-standing debate over its impact on employment. While some fear that automation will render human labour obsolete, I would argue that, on balance, technological progress tends to reshape the job market rather than shrink it.\n\nThose who anticipate widespread job losses point to the speed at which machines now perform tasks once reserved for people. Manufacturing offers a clear illustration: assembly lines that formerly employed hundreds are now run by a handful of technicians overseeing robotic arms. As artificial intelligence grows more sophisticated, even white-collar roles such as data entry and basic accounting are increasingly vulnerable, which understandably fuels anxiety about mass unemployment.\n\nNevertheless, history suggests that innovation simultaneously generates entirely new fields of work. The rise of the internet, for instance, created professions — from app development to digital marketing — that simply did not exist a generation ago. Moreover, as routine tasks are automated, demand grows for uniquely human skills like creativity, critical thinking and emotional intelligence, provided that workers are given the chance to reskill. In this sense, technology acts less as a destroyer of jobs and more as a catalyst for transformation.\n\nIn conclusion, although it would be naive to deny that certain occupations will disappear, I believe the net effect of technological advancement is the creation of fresh opportunities. The decisive factor will be how effectively societies prepare their workforce for this shift through education and retraining.',
  },
  {
    id: 't2-online-learning',
    task: 'Task 2',
    type: 'Academic / General',
    minWords: 250,
    time: 40,
    prompt:
      'In many countries, online learning has become increasingly common. Do the advantages of studying online outweigh the disadvantages?',
    plan: [
      'Intro: paraphrase + thesis (advantages outweigh / do not)',
      'Body 1: key advantages (flexibility, access, cost)',
      'Body 2: key disadvantages (motivation, interaction) + why outweighed',
      'Conclusion',
    ],
    model:
      'Over the past decade, studying via the internet has shifted from a niche option to a mainstream mode of education. Although online learning is not without its drawbacks, I am convinced that its benefits decisively outweigh them.\n\nThe most compelling advantage is accessibility. Learners who are geographically isolated or financially constrained can now enrol in courses delivered by world-class institutions without relocating or paying for accommodation. Flexibility is equally significant: because lectures are often recorded, students can fit study around employment or family commitments, a freedom that traditional classrooms rarely afford. These factors democratise education in a way that was previously unimaginable.\n\nAdmittedly, the format does present challenges. The absence of face-to-face contact can dampen motivation, and some learners struggle without the structure of a physical timetable. Technical barriers, such as unreliable internet, may also disadvantage those in poorer regions. However, these problems are increasingly being mitigated through interactive platforms, live discussion sessions and improving digital infrastructure, which suggests they are obstacles to be managed rather than fundamental flaws.\n\nIn conclusion, while online study demands a degree of self-discipline and adequate technology, the unparalleled access and flexibility it offers make it overwhelmingly worthwhile. As tools continue to evolve, I expect its advantages to become even more pronounced.',
  },
  {
    id: 't1-line-graph',
    task: 'Task 1',
    type: 'Academic',
    minWords: 150,
    time: 20,
    prompt:
      'The chart below shows the percentage of households with internet access in three countries (A, B and C) between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    plan: [
      'Intro: paraphrase what the graph shows',
      'Overview: 2 biggest trends (all rose; which highest/lowest)',
      'Detail 1: figures + comparisons',
      'Detail 2: remaining figures',
    ],
    model:
      'The line graph illustrates how the proportion of households with internet access changed in three countries — A, B and C — over a twenty-year period from 2000 to 2020.\n\nOverall, all three countries experienced a substantial rise in connectivity across the period. Country A consistently led throughout, whereas Country C remained the lowest until a sharp acceleration towards the end narrowed the gap.\n\nIn 2000, Country A already stood at around 30%, well ahead of B at roughly 15% and C at a mere 5%. Over the following decade, A climbed steadily to about 70%, while B followed a similar trajectory to reach 55%, maintaining the gap between them.\n\nThe final ten years saw the most dramatic change for Country C, which surged from approximately 20% in 2010 to nearly 80% by 2020 — almost converging with Country A, which plateaued at around 90%. Country B, meanwhile, ended the period at roughly 75%, leaving all three nations far more closely matched than at the outset.',
  },
  {
    id: 't1-letter',
    task: 'Task 1',
    type: 'General Training (Letter)',
    minWords: 150,
    time: 20,
    prompt:
      'You recently took a course at a local college, but you were not satisfied with it. Write a letter to the college. In your letter: explain why you took the course, describe what went wrong, and say what you would like the college to do.',
    plan: [
      'Greeting + clear purpose',
      'Para 1: why you took the course',
      'Para 2: what went wrong (specific)',
      'Para 3: requested action + sign off',
    ],
    model:
      'Dear Sir or Madam,\n\nI am writing to express my dissatisfaction with the Digital Photography course I attended at your college, which concluded last month.\n\nI originally enrolled in the course hoping to develop practical skills for a freelance business I am setting up, as the prospectus promised hands-on sessions with professional equipment and individual feedback.\n\nRegrettably, the reality fell well short of these expectations. The promised cameras were rarely available, leaving most of us to rely on our own phones, and the tutor frequently arrived late, cutting our limited class time even shorter. As a result, we covered barely half of the advertised syllabus.\n\nUnder the circumstances, I would appreciate either a partial refund of the course fee or a place on a future course delivered as originally described. I look forward to your response and hope this matter can be resolved promptly.\n\nYours faithfully,\nA. Student',
  },
]
