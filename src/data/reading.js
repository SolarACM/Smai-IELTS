// IELTS Reading — Academic passages with mixed question types + answer key.
export const readingPassages = [
  {
    id: 'urban-bees',
    title: 'The Return of the Urban Bee',
    minutes: 18,
    text: `For most of the twentieth century, the honeybee was regarded as a creature of the countryside, inseparable from fields of clover and orchards in full bloom. In recent years, however, a quiet transformation has taken place: bees have moved to the city. Rooftop hives now sit above restaurants, offices and apartment blocks in London, Paris, New York and Tokyo, tended by a growing community of amateur beekeepers.

The reasons for this urban migration are partly practical. Cities, somewhat counter-intuitively, can offer bees a richer diet than the surrounding farmland. Modern agriculture often relies on vast areas planted with a single crop, which flowers for only a few weeks of the year. Urban gardens, parks and balconies, by contrast, contain an enormous variety of flowering plants that bloom in succession from early spring to late autumn. As a result, city bees frequently produce more honey, and of a more complex flavour, than their rural counterparts.

The trend has not been without controversy. Some ecologists warn that the enthusiasm for keeping honeybees risks crowding out wild pollinators such as bumblebees and solitary bees, which are far more numerous and, in many cases, more effective at pollination. If too many honeybee colonies compete for a limited supply of urban flowers, the argument runs, the wild species that were already struggling may suffer further. Advocates of urban beekeeping respond that the practice raises public awareness of pollinators in general, encouraging city dwellers to plant bee-friendly flowers and to think more carefully about the chemicals they use in their gardens.

What is beyond dispute is that bees have become a powerful symbol of the wider movement to bring nature back into urban life. Schools keep hives so that children can watch the insects at work; companies install them on their roofs as a visible sign of environmental commitment. Whether or not the honeybee itself ultimately benefits, its arrival in the city has changed the way many people think about the relationship between humans and the natural world.`,
    questions: [
      { id: 'q1', type: 'tfng', q: 'Throughout the twentieth century, honeybees were mainly associated with rural areas.', answer: 'True', why: 'ย่อหน้าแรก: "regarded as a creature of the countryside".' },
      { id: 'q2', type: 'tfng', q: 'City bees always produce less honey than rural bees.', answer: 'False', why: 'ตรงข้ามกับข้อความ: city bees "frequently produce more honey".' },
      { id: 'q3', type: 'tfng', q: 'Most amateur beekeepers in cities earn a living from selling honey.', answer: 'Not Given', why: 'บทความไม่ได้พูดถึงการหารายได้ของผู้เลี้ยง.' },
      { id: 'q4', type: 'mc', q: 'According to the passage, why can cities provide bees with a better diet?', options: ['Cities have warmer temperatures than farmland', 'Urban areas have a long succession of varied flowering plants', 'There are fewer predators in the city', 'City flowers contain more nectar per bloom'], answer: 1, why: 'Urban gardens "bloom in succession from early spring to late autumn".' },
      { id: 'q5', type: 'mc', q: 'What concern do some ecologists raise about urban beekeeping?', options: ['Honey quality is lower in cities', 'Honeybees may out-compete wild pollinators', 'Bees damage urban gardens', 'City bees spread disease to humans'], answer: 1, why: '"risks crowding out wild pollinators such as bumblebees and solitary bees".' },
      { id: 'q6', type: 'gap', q: 'Modern agriculture often relies on large areas planted with a single ______.', answer: ['crop'], why: '"vast areas planted with a single crop".' },
      { id: 'q7', type: 'gap', q: 'Supporters argue urban beekeeping raises public ______ of pollinators.', answer: ['awareness'], why: '"raises public awareness of pollinators in general".' },
      { id: 'q8', type: 'tfng', q: 'Some companies keep hives to demonstrate environmental commitment.', answer: 'True', why: '"companies install them on their roofs as a visible sign of environmental commitment".' },
    ],
  },
]
