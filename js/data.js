/* ==========================================================================
   MOCK CONTENT. Dummy sample content only (decided for v1 testing):
   3 subjects x 3 chapters x 3 topics. Chapter 1 is free, chapters 2 and 3 are Pro.
   In the real app this comes from content files loaded into the database.
   ========================================================================== */
(function () {
  'use strict';

  const SUBJECTS = [
    { id: 'maths', name: 'Maths', letter: 'M', chapters: [
      { name: 'Number', topics: ['Fractions', 'Decimals', 'Percentages'] },
      { name: 'Algebra', topics: ['Expressions', 'Linear equations', 'Algebraic fractions'] },
      { name: 'Geometry', topics: ['Angles', 'Triangles', 'Area and perimeter'] }
    ]},
    { id: 'english', name: 'English', letter: 'E', chapters: [
      { name: 'Poetry', topics: ['Imagery', 'Tone', 'Unseen poems'] },
      { name: 'Fiction', topics: ['Character', 'Setting', 'Theme'] },
      { name: 'Functional writing', topics: ['Letters', 'Reviews', 'Speeches'] }
    ]},
    { id: 'irish', name: 'Irish', letter: 'G', chapters: [
      { name: 'Gramadach', topics: ['An Aimsir Chaite', 'An Aimsir Láithreach', 'An Aimsir Fháistineach'] },
      { name: 'Litríocht', topics: ['Filíocht', 'Prós', 'Drámaíocht'] },
      { name: 'Scríbhneoireacht', topics: ['An Litir', 'An Scéal', 'An Aiste'] }
    ]}
  ];

  // Sample cards and questions per subject. Every topic in a subject reuses them for now.
  const SAMPLE = {
    maths: {
      cards: [
        ['What is 1/2 + 1/4?', '3/4'],
        ['What is 25% of 80?', '20'],
        ['Write 0.6 as a fraction in lowest terms', '3/5'],
        ['What is the lowest common denominator of 1/3 and 1/4?', '12'],
        ['What do the angles in a triangle add up to?', '180 degrees']
      ],
      quiz: [
        { type: 'mc', q: 'What is 3/4 as a decimal?', options: ['0.34', '0.75', '0.43', '7.5'], answer: 1, why: '3 divided by 4 is 0.75.' },
        { type: 'mc', q: 'Simplify 6/8.', options: ['3/4', '2/3', '6/8', '1/2'], answer: 0, why: 'Divide the top and bottom by 2.' },
        { type: 'typed', q: 'What is 10% of 250?', accept: ['25'], why: '10% is one tenth, and 250 divided by 10 is 25.' },
        { type: 'match', q: 'Match each fraction to its percentage.', pairs: [['1/2', '50%'], ['1/4', '25%'], ['1/5', '20%'], ['3/4', '75%']], why: 'Multiply the fraction by 100 to get the percentage.' }
      ],
      note: [
        ['What it is', 'A fraction shows part of a whole. The top number (numerator) is how many parts you have. The bottom number (denominator) is how many equal parts the whole is split into.'],
        ['Adding and subtracting', 'Make the denominators the same first, using the lowest common denominator. Then add or subtract the numerators and keep the denominator.'],
        ['Simplifying', 'Divide the numerator and the denominator by the same number until you cannot go any further.'],
        ['Exam tip', 'Always show your working. Marks are given for method, even if the final answer is wrong.']
      ]
    },
    english: {
      cards: [
        ['What is a simile?', 'A comparison using "like" or "as"'],
        ['What is a metaphor?', 'A comparison that says one thing is another'],
        ['What is tone?', 'The attitude or feeling in a piece of writing'],
        ['What is alliteration?', 'Repeating the same sound at the start of nearby words'],
        ['What is a stanza?', 'A group of lines in a poem, like a paragraph']
      ],
      quiz: [
        { type: 'mc', q: '"The classroom was a zoo." This is an example of:', options: ['Simile', 'Metaphor', 'Rhyme', 'Onomatopoeia'], answer: 1, why: 'It says the classroom is a zoo, without "like" or "as".' },
        { type: 'mc', q: 'Which word best describes a poem full of loss and memory?', options: ['Comic', 'Angry', 'Nostalgic', 'Neutral'], answer: 2, why: 'Nostalgic means longing for the past.' },
        { type: 'typed', q: 'What do we call a word that sounds like what it describes, such as "buzz"?', accept: ['onomatopoeia'], why: 'Onomatopoeia is a word that copies a sound.' },
        { type: 'match', q: 'Match each term to its meaning.', pairs: [['Simile', 'Uses like or as'], ['Imagery', 'Pictures in words'], ['Theme', 'The main idea'], ['Tone', 'The feeling']], why: 'These terms come up in every poetry question.' }
      ],
      note: [
        ['What it is', 'Imagery is language that creates a picture in the reader\'s mind. It often appeals to the senses: sight, sound, smell, taste and touch.'],
        ['How to write about it', 'Name the image, quote it briefly, then explain what it makes you see or feel and why the poet chose it.'],
        ['Useful phrases', '"The poet uses vivid imagery to...", "This image suggests...", "The reader can almost hear..."'],
        ['Exam tip', 'Use short quotes. Two or three words is often enough.']
      ]
    },
    irish: {
      cards: [
        ['Cad é "I went" san Aimsir Chaite?', 'Chuaigh mé'],
        ['Cad é "I ate" san Aimsir Chaite?', 'D\'ith mé'],
        ['Cad é "I saw" san Aimsir Chaite?', 'Chonaic mé'],
        ['Cad é "I said" san Aimsir Chaite?', 'Dúirt mé'],
        ['Cad é "I heard" san Aimsir Chaite?', 'Chuala mé']
      ],
      quiz: [
        { type: 'mc', q: 'Which is "we went"?', options: ['Chuamar', 'Téimid', 'Rachaimid', 'Chuaigh siad'], answer: 0, why: 'Chuamar is the past tense, first person plural.' },
        { type: 'mc', q: 'Which tense is "Rachaidh mé"?', options: ['An Aimsir Chaite', 'An Aimsir Láithreach', 'An Aimsir Fháistineach', 'An Modh Coinníollach'], answer: 2, why: 'Rachaidh mé means "I will go", so it is the future tense.' },
        { type: 'typed', q: 'Translate "I saw" into Irish.', accept: ['chonaic mé', 'chonaic me'], why: 'Chonaic is the irregular past tense of feic.' },
        { type: 'match', q: 'Match the Irish to the English.', pairs: [['Chuaigh mé', 'I went'], ['D\'ith mé', 'I ate'], ['Dúirt mé', 'I said'], ['Chuala mé', 'I heard']], why: 'These are irregular verbs in An Aimsir Chaite.' }
      ],
      note: [
        ['Cad é', 'An Aimsir Chaite is the past tense. Most regular verbs add a séimhiú (h) after the first letter: cuir becomes chuir.'],
        ['Verbs starting with a vowel', 'Put d\' in front: ól becomes d\'ól, ith becomes d\'ith.'],
        ['Irregular verbs', 'Learn these by heart: chuaigh, chonaic, dúirt, chuala, fuair, rinne, tháinig, rug, thug, bhí, d\'ith.'],
        ['Exam tip', 'Check your fadas. They change the meaning of a word.']
      ]
    }
  };

  // Past papers: links out to the SEC. Levels are PLACEHOLDERS (open: check which JC papers exist).
  const PAPER_LEVELS = ['Higher', 'Ordinary', 'Common'];
  const PAPER_YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019];
  const SEC_URL = 'https://www.examinations.ie/exammaterialarchive/';

  // Build a flat topic index: "maths-0-1" = Maths, chapter 1, topic 2.
  const TOPICS = {};
  SUBJECTS.forEach(s => s.chapters.forEach((c, ci) => {
    c.id = s.id + '-' + ci;
    c.index = ci;
    c.topics = c.topics.map((name, ti) => {
      const t = { id: s.id + '-' + ci + '-' + ti, name, subject: s, chapter: c, index: ti };
      TOPICS[t.id] = t;
      return t;
    });
  }));

  const content = (t) => SAMPLE[t.subject.id];

  window.EX_DATA = { SUBJECTS, TOPICS, content, PAPER_LEVELS, PAPER_YEARS, SEC_URL };
})();
