/**
 * @typedef {Object} BookPurchaseLink
 * @property {string} label
 * @property {string} url
 *
 * @typedef {Object} SanjoBook
 * @property {string} id
 * @property {string} slug
 * @property {string} legacySlug
 * @property {string} canonicalPath
 * @property {string} legacyPath
 * @property {number} order
 * @property {string} title
 * @property {string} shortTitle
 * @property {string} [subtitle]
 * @property {string} author
 * @property {string} authorName
 * @property {string} authorPath
 * @property {string} [format]
 * @property {string} category
 * @property {string} primaryTopic
 * @property {string[]} secondaryTopics
 * @property {string} [seriesName]
 * @property {number} [seriesPosition]
 * @property {string} eyebrow
 * @property {string} [tagline]
 * @property {string} homepageSummary
 * @property {string[]} fullDescription
 * @property {string[]} themes
 * @property {string[]} readerBenefits
 * @property {string[]} audience
 * @property {string[]} keyTakeaways
 * @property {string[]} reflectionPrompts
 * @property {string[]} transformationPath
 * @property {string} coverImage
 * @property {string} coverAlt
 * @property {BookPurchaseLink[]} purchaseLinks
 * @property {string} seoTitle
 * @property {string} seoDescription
 * @property {string} socialTitle
 * @property {string} socialDescription
 * @property {string} structuredDataDescription
 * @property {string[]} relatedBookSlugs
 */

export const BOOKS_ROUTE = "/books/";
export const BOOK_AUTHOR = "Dr. Sanjo Cine Mathew";
export const BOOK_AUTHOR_PATH = "/about-sanjo-cine-mathew/";
export const INTENTIONAL_SERIES = "The Intentional Life Blueprint Series";
export const BOOK_AUTHOR_CREDENTIALS = [
  {
    id: "published-books",
    icon: "book",
    label: "Four published books",
    supportingLabel: "Published collection"
  },
  {
    id: "asia-book-of-records",
    icon: "leadership",
    label: "Asia Book of Records",
    supportingLabel: "Awardee"
  },
  {
    id: "psychologist-author",
    icon: "mind",
    label: "Counselling psychologist",
    supportingLabel: "And author"
  }
];
export const BOOK_TITLES = [
  "The WayMaker Woman",
  "The Resilience Response",
  "Untangle the Confusion",
  "Harness the Harmony"
];
export const BOOKS_PORTRAIT = {
  image: "https://placehold.co/400",
  alt: "Portrait of Dr. Sanjo Cine Mathew"
};
export const BOOKS_RECOGNITION = {
  eyebrow: "Award & Recognition",
  heading: "Recognised for an Award-Winning Literary Achievement.",
  description:
    "Dr. Sanjo Cine Mathew's published works have received recognition from the Asia Book of Records. Explore the certificates and the complete collection of four published books.",
  certificates: [
    {
      id: "certificate-01",
      image: "/assets/imgs/books/certificate-1.jpeg",
      alt: "Certificate image for Dr. Sanjo Cine Mathew's published works",
      label: "Certificate 01",
      title: "Asia Book of Records Recognition"
    },
    {
      id: "certificate-02",
      image: "/assets/imgs/books/certificate-2.jpeg",
      alt: "Certificate recognising Dr. Sanjo Cine Mathew's authorship and published books",
      label: "Certificate 02",
      title: "Literary Recognition Certificate"
    }
  ]
};

/** @type {SanjoBook[]} */
export const books = [
  {
    id: "waymaker-woman",
    slug: "the-waymaker-woman",
    legacySlug: "the-waymaker-woman",
    canonicalPath: "/books/dr-sanjo-cine-mathew/the-waymaker-woman-transformational-fiction/",
    legacyPath: "/books/the-waymaker-woman/",
    order: 1,
    title: "The WayMaker Woman",
    shortTitle: "The WayMaker Woman",
    author: BOOK_AUTHOR,
    authorName: BOOK_AUTHOR,
    authorPath: BOOK_AUTHOR_PATH,
    category: "Transformational Fiction",
    primaryTopic: "Transformational fiction",
    secondaryTopics: ["Intentional living", "Women's personal growth", "Identity", "Emotional resilience", "Courage", "Living by design rather than by default"],
    eyebrow: "Transformational Fiction",
    homepageSummary: "A transformational fiction journey about identity, responsibility, emotional growth, and the courage to move from a life lived by default to one lived intentionally.",
    fullDescription: [
      "The WayMaker Woman is a transformational fiction journey centered on Sophea, a woman who begins to question the invisible limitations, emotional patterns, and inherited expectations that have shaped her life.",
      "Through her inner struggles and decisive moments, the story explores identity, responsibility, resilience, emotional growth, and the courage required to move from a life lived by default to one lived intentionally.",
      "The book invites readers to reflect on the quiet choices that shape a life: the ways we respond to fear, the responsibilities we avoid or embrace, and the possibility of living by design rather than by default."
    ],
    themes: ["Identity", "Responsibility", "Resilience", "Emotional growth", "Intentional choice", "Courage", "Moving beyond invisible limitations", "Living by design rather than by default"],
    readerBenefits: ["Reflect on inherited beliefs and invisible limitations", "Recognize the cost of living on autopilot", "Explore courage, responsibility, and emotional growth through story"],
    audience: ["Readers drawn to reflective transformational fiction", "Women exploring identity, courage, and personal responsibility", "Anyone asking whether life is being lived by design or by default"],
    keyTakeaways: ["Sophea's journey shows how intentional choice can reshape identity.", "Invisible limitations can be questioned, named, and moved beyond.", "Responsibility can become a doorway to freedom rather than a burden."],
    reflectionPrompts: ["Are we living by design... or by default?"],
    transformationPath: ["Default", "Awareness", "Responsibility", "Courage", "Intentional living"],
    coverImage: "/assets/imgs/books/the-waymaker-women-sanjo-book.webp",
    coverAlt: "Cover of The WayMaker Woman by Dr. Sanjo Cine Mathew",
    purchaseLinks: [],
    seoTitle: "The WayMaker Woman by Dr. Sanjo Cine Mathew | Transformational Fiction",
    seoDescription: "Discover The WayMaker Woman by Dr. Sanjo Cine Mathew, a transformational fiction story about identity, responsibility, resilience, courage, and choosing to live intentionally.",
    socialTitle: "The WayMaker Woman by Dr. Sanjo Cine Mathew",
    socialDescription: "A transformational fiction journey about Sophea, identity, courage, responsibility, and living by design rather than by default.",
    structuredDataDescription: "The WayMaker Woman is a transformational fiction story by Dr. Sanjo Cine Mathew about identity, responsibility, resilience, courage, and intentional living.",
    relatedBookSlugs: ["the-resilience-response", "untangle-the-confusion", "harness-the-harmony"]
  },
  {
    id: "resilience-response",
    slug: "the-resilience-response",
    legacySlug: "the-resilience-response",
    canonicalPath: "/books/dr-sanjo-cine-mathew/the-resilience-response-intentional-living/",
    legacyPath: "/books/the-resilience-response/",
    order: 2,
    title: "The Resilience Response: The Blueprint for Intentional Living",
    shortTitle: "The Resilience Response",
    subtitle: "The Blueprint for Intentional Living",
    author: BOOK_AUTHOR,
    authorName: BOOK_AUTHOR,
    authorPath: BOOK_AUTHOR_PATH,
    format: "Kindle Edition",
    category: "Intentional Living",
    primaryTopic: "Intentional living",
    secondaryTopics: ["Emotional resilience", "Stress management", "Mental clarity", "Mindful living", "Psychology", "Personal growth"],
    seriesName: INTENTIONAL_SERIES,
    seriesPosition: 1,
    eyebrow: "Intentional Life Blueprint - Book 1",
    tagline: "Rise Above. Respond Intentionally. Live Powerfully.",
    homepageSummary: "A practical guide to building emotional strength, reframing stress, and moving from autopilot to intentional living.",
    fullDescription: [
      "The Resilience Response: The Blueprint for Intentional Living is a practical guide for people who want to rise above stress, respond with awareness, and live with greater emotional strength.",
      "Blending psychology, NLP, science, mindful living, and spiritual wisdom, the book helps readers understand resilience not as passive endurance, but as an intentional response to pressure, failure, uncertainty, and change.",
      "It speaks to students navigating academic pressure, professionals facing burnout, parents managing invisible struggles, and readers seeking meaning, mental clarity, and inner peace.",
      "The book encourages a shift from autopilot reactions to conscious, grounded responses so that resilience becomes a daily practice and intentional living becomes a way of life."
    ],
    themes: ["Intentional living", "Emotional resilience", "Stress management", "Mental clarity", "Mindful living", "Reframing failure", "Inner peace", "Psychology", "NLP", "Science", "Spiritual wisdom"],
    readerBenefits: ["Build emotional strength during pressure and change", "Reframe stress, failure, and uncertainty", "Move from autopilot reactions to intentional responses", "Develop practical habits for mental clarity and inner peace"],
    audience: ["Students navigating academic pressure", "Professionals facing burnout", "Parents managing invisible struggles", "Readers seeking meaning and inner peace"],
    keyTakeaways: ["Resilience is a response that can be practiced.", "Stress can be reframed with awareness, psychology, and intentional action.", "Intentional living begins when autopilot reactions are replaced by conscious choices."],
    reflectionPrompts: ["How can I respond intentionally instead of reacting automatically?", "What would change if resilience became a daily practice?"],
    transformationPath: ["Survival", "Response", "Resilience", "Intentional living"],
    coverImage: "/assets/imgs/books/resilience-response-sanjo-book.webp",
    coverAlt: "Cover of The Resilience Response: The Blueprint for Intentional Living by Dr. Sanjo Cine Mathew",
    purchaseLinks: [
      {
        label: "Buy on Amazon",
        url: "https://www.amazon.in/Resilience-Response-Blueprint-Intentional-Living-ebook/dp/B0FSF7NF6M/ref=tmm_kin_swatch_0"
      },
      {
        label: "Buy on Flipkart",
        url: "https://www.flipkart.com/resilience-response-blueprint-intentional-living/p/itmc9300863e51ed?pid=9789334282962"
      }
    ],
    seoTitle: "The Resilience Response by Dr. Sanjo Cine Mathew | Intentional Living",
    seoDescription: "Explore The Resilience Response by Dr. Sanjo Cine Mathew, a psychology-informed guide to emotional resilience, stress management, mindful choices, and intentional living.",
    socialTitle: "The Resilience Response by Dr. Sanjo Cine Mathew",
    socialDescription: "A practical guide to building emotional strength, reframing stress, and moving from autopilot to intentional living.",
    structuredDataDescription: "The Resilience Response by Dr. Sanjo Cine Mathew is a psychology-informed guide to emotional resilience, stress management, mindful choices, and intentional living.",
    relatedBookSlugs: ["the-waymaker-woman", "untangle-the-confusion", "harness-the-harmony"]
  },
  {
    id: "untangle-confusion",
    slug: "untangle-the-confusion",
    legacySlug: "untangle-the-confusion",
    canonicalPath: "/books/dr-sanjo-cine-mathew/untangle-the-confusion-intentional-thinking/",
    legacyPath: "/books/untangle-the-confusion/",
    order: 3,
    title: "Untangle the Confusion: The Blueprint for Intentional Thinking",
    shortTitle: "Untangle the Confusion",
    subtitle: "The Blueprint for Intentional Thinking",
    author: BOOK_AUTHOR,
    authorName: BOOK_AUTHOR,
    authorPath: BOOK_AUTHOR_PATH,
    category: "Intentional Thinking",
    primaryTopic: "Intentional thinking",
    secondaryTopics: ["Mental clarity", "Overthinking", "Emotional awareness", "Conscious choices", "Thought patterns", "Inner calm"],
    seriesName: INTENTIONAL_SERIES,
    seriesPosition: 2,
    eyebrow: "Intentional Life Blueprint - Book 2",
    homepageSummary: "A psychology-based guide to clearing mental noise, understanding thought patterns, and thinking with clarity, purpose, and calm.",
    fullDescription: [
      "Untangle the Confusion: The Blueprint for Intentional Thinking is a psychology-based guide for readers who want to clear mental noise and understand the thought patterns that shape their emotions, choices, and relationships.",
      "The book explores overthinking, emotional reactivity, mental fatigue, and unconscious mental loops, helping readers move toward awareness, discernment, inner calm, and conscious choices.",
      "It invites readers to slow down, observe the mind with compassion, and practice intentional thinking so clarity can replace confusion and purpose can guide action."
    ],
    themes: ["Intentional thinking", "Mental clarity", "Overthinking", "Emotional reactivity", "Mental fatigue", "Thought patterns", "Conscious choices", "Awareness", "Inner calm", "Discernment"],
    readerBenefits: ["Understand recurring thought patterns", "Reduce mental noise and emotional reactivity", "Practice clearer, calmer, and more purposeful thinking"],
    audience: ["Readers struggling with overthinking or mental fatigue", "People seeking mental clarity and discernment", "Anyone who wants to make conscious choices with greater calm"],
    keyTakeaways: ["Confusion often begins with unnoticed thought patterns.", "Awareness creates space between stimulus and response.", "Intentional thinking helps transform mental noise into clarity."],
    reflectionPrompts: ["Which thought patterns are shaping my choices without my awareness?", "What would clarity ask of me today?"],
    transformationPath: ["Mental noise", "Awareness", "Discernment", "Clarity", "Intentional thinking"],
    coverImage: "/assets/imgs/books/untangle-the-confusion-sanjo-book.webp",
    coverAlt: "Cover of Untangle the Confusion: The Blueprint for Intentional Thinking by Dr. Sanjo Cine Mathew",
    purchaseLinks: [],
    seoTitle: "Untangle the Confusion by Dr. Sanjo Cine Mathew | Intentional Thinking",
    seoDescription: "Explore Untangle the Confusion by Dr. Sanjo Cine Mathew, a psychology-based guide to mental clarity, overthinking, emotional awareness, and intentional thinking.",
    socialTitle: "Untangle the Confusion by Dr. Sanjo Cine Mathew",
    socialDescription: "A psychology-based guide to clearing mental noise, understanding thought patterns, and thinking with clarity, purpose, and calm.",
    structuredDataDescription: "Untangle the Confusion by Dr. Sanjo Cine Mathew is a psychology-based guide to mental clarity, overthinking, emotional awareness, and intentional thinking.",
    relatedBookSlugs: ["the-waymaker-woman", "the-resilience-response", "harness-the-harmony"]
  },
  {
    id: "harness-harmony",
    slug: "harness-the-harmony",
    legacySlug: "harness-the-harmony",
    canonicalPath: "/books/dr-sanjo-cine-mathew/harness-the-harmony-intentional-being/",
    legacyPath: "/books/harness-the-harmony/",
    order: 4,
    title: "Harness the Harmony: The Blueprint for Intentional Being",
    shortTitle: "Harness the Harmony",
    subtitle: "The Blueprint for Intentional Being",
    author: BOOK_AUTHOR,
    authorName: BOOK_AUTHOR,
    authorPath: BOOK_AUTHOR_PATH,
    category: "Intentional Being",
    primaryTopic: "Intentional being",
    secondaryTopics: ["Inner harmony", "Alignment", "Authenticity", "Emotional freedom", "Healthy boundaries", "Self-worth", "Presence"],
    seriesName: INTENTIONAL_SERIES,
    seriesPosition: 3,
    eyebrow: "Intentional Life Blueprint - Book 3",
    homepageSummary: "A guide to aligning thoughts, emotions, actions, and identity so you can live with presence, authenticity, and inner harmony.",
    fullDescription: [
      "Harness the Harmony: The Blueprint for Intentional Being is a guide to aligning thoughts, emotions, actions, and identity so life can be lived with presence, authenticity, and inner harmony.",
      "The book explores emotional freedom, self-worth, healthy boundaries, shadow integration, and the journey of returning to the true self.",
      "As the third book in The Intentional Life Blueprint Series, it completes a movement from resilience to clarity to harmony, from response to thinking to being, and from survival to consciousness to inner freedom."
    ],
    themes: ["Intentional being", "Alignment", "Presence", "Authenticity", "Emotional freedom", "Self-worth", "Healthy boundaries", "Shadow integration", "Inner harmony", "Returning to the true self"],
    readerBenefits: ["Align thoughts, emotions, actions, and identity", "Explore authenticity, self-worth, and healthy boundaries", "Move toward presence, emotional freedom, and inner harmony"],
    audience: ["Readers seeking authentic and aligned living", "People exploring emotional freedom and self-worth", "Anyone ready to move from survival toward inner freedom"],
    keyTakeaways: ["Harmony grows when inner life and outer action are aligned.", "Presence and authenticity require honest self-return.", "Intentional being completes the movement from resilience and clarity into inner freedom."],
    reflectionPrompts: ["Where am I out of alignment with my true self?", "What would it mean to live from presence rather than pressure?"],
    transformationPath: ["Resilience -> Clarity -> Harmony", "Response -> Thinking -> Being", "Survival -> Consciousness -> Inner Freedom"],
    coverImage: "/assets/imgs/books/harness-the-harmony-sanjo-book.webp",
    coverAlt: "Cover of Harness the Harmony: The Blueprint for Intentional Being by Dr. Sanjo Cine Mathew",
    purchaseLinks: [],
    seoTitle: "Harness the Harmony by Dr. Sanjo Cine Mathew | Intentional Being",
    seoDescription: "Explore Harness the Harmony by Dr. Sanjo Cine Mathew, a guide to alignment, authenticity, emotional freedom, inner harmony, healthy boundaries, and intentional being.",
    socialTitle: "Harness the Harmony by Dr. Sanjo Cine Mathew",
    socialDescription: "A guide to aligning thoughts, emotions, actions, and identity so you can live with presence, authenticity, and inner harmony.",
    structuredDataDescription: "Harness the Harmony by Dr. Sanjo Cine Mathew is a guide to alignment, authenticity, emotional freedom, inner harmony, healthy boundaries, and intentional being.",
    relatedBookSlugs: ["the-waymaker-woman", "the-resilience-response", "untangle-the-confusion"]
  }
];

export function bookRoute(book) {
  return book.canonicalPath;
}

export function legacyBookRoute(book) {
  return book.legacyPath;
}

export function getBookBySlug(slug) {
  return books.find((book) => book.slug === slug || book.legacySlug === slug) || null;
}
