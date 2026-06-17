/**
 * @typedef {Object} BookPurchaseLink
 * @property {string} label
 * @property {string} url
 *
 * @typedef {Object} SanjoBook
 * @property {string} id
 * @property {string} slug
 * @property {number} order
 * @property {string} title
 * @property {string} shortTitle
 * @property {string} [subtitle]
 * @property {string} author
 * @property {string} [format]
 * @property {string} category
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
 * @property {string} socialDescription
 * @property {string[]} relatedBookSlugs
 */

export const BOOKS_ROUTE = "/books/";
export const BOOK_AUTHOR = "Dr. Sanjo Cine Mathew";
export const INTENTIONAL_SERIES = "The Intentional Life Blueprint Series";

/** @type {SanjoBook[]} */
export const books = [
  {
    id: "waymaker-woman",
    slug: "the-waymaker-woman",
    order: 1,
    title: "The WayMaker Woman",
    shortTitle: "The WayMaker Woman",
    author: BOOK_AUTHOR,
    category: "Transformational Fiction",
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
    seoTitle: "The WayMaker Woman | Dr. Sanjo Cine Mathew",
    seoDescription: "Explore The WayMaker Woman by Dr. Sanjo Cine Mathew, a transformational fiction journey about identity, responsibility, emotional growth, and intentional choice.",
    socialDescription: "A transformational fiction journey about Sophea, identity, courage, responsibility, and living by design rather than by default.",
    relatedBookSlugs: ["the-resilience-response", "untangle-the-confusion", "harness-the-harmony"]
  },
  {
    id: "resilience-response",
    slug: "the-resilience-response",
    order: 2,
    title: "The Resilience Response: The Blueprint for Intentional Living",
    shortTitle: "The Resilience Response",
    subtitle: "The Blueprint for Intentional Living",
    author: BOOK_AUTHOR,
    format: "Kindle Edition",
    category: "Intentional Living",
    seriesName: INTENTIONAL_SERIES,
    seriesPosition: 1,
    eyebrow: "Intentional Life Blueprint · Book 1",
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
    seoTitle: "The Resilience Response | Intentional Living Book by Dr. Sanjo Cine Mathew",
    seoDescription: "Explore The Resilience Response by Dr. Sanjo Cine Mathew, a practical guide to emotional resilience, stress reframing, mental clarity, and intentional living.",
    socialDescription: "A practical guide to building emotional strength, reframing stress, and moving from autopilot to intentional living.",
    relatedBookSlugs: ["the-waymaker-woman", "untangle-the-confusion", "harness-the-harmony"]
  },
  {
    id: "untangle-confusion",
    slug: "untangle-the-confusion",
    order: 3,
    title: "Untangle the Confusion: The Blueprint for Intentional Thinking",
    shortTitle: "Untangle the Confusion",
    subtitle: "The Blueprint for Intentional Thinking",
    author: BOOK_AUTHOR,
    category: "Intentional Thinking",
    seriesName: INTENTIONAL_SERIES,
    seriesPosition: 2,
    eyebrow: "Intentional Life Blueprint · Book 2",
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
    seoTitle: "Untangle the Confusion | Intentional Thinking Book by Dr. Sanjo Cine Mathew",
    seoDescription: "Explore Untangle the Confusion by Dr. Sanjo Cine Mathew, a psychology-based guide to mental clarity, thought patterns, awareness, and intentional thinking.",
    socialDescription: "A psychology-based guide to clearing mental noise, understanding thought patterns, and thinking with clarity, purpose, and calm.",
    relatedBookSlugs: ["the-waymaker-woman", "the-resilience-response", "harness-the-harmony"]
  },
  {
    id: "harness-harmony",
    slug: "harness-the-harmony",
    order: 4,
    title: "Harness the Harmony: The Blueprint for Intentional Being",
    shortTitle: "Harness the Harmony",
    subtitle: "The Blueprint for Intentional Being",
    author: BOOK_AUTHOR,
    category: "Intentional Being",
    seriesName: INTENTIONAL_SERIES,
    seriesPosition: 3,
    eyebrow: "Intentional Life Blueprint · Book 3",
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
    transformationPath: ["Resilience → Clarity → Harmony", "Response → Thinking → Being", "Survival → Consciousness → Inner Freedom"],
    coverImage: "/assets/imgs/books/harness-the-harmony-sanjo-book.webp",
    coverAlt: "Cover of Harness the Harmony: The Blueprint for Intentional Being by Dr. Sanjo Cine Mathew",
    purchaseLinks: [],
    seoTitle: "Harness the Harmony | Intentional Being Book by Dr. Sanjo Cine Mathew",
    seoDescription: "Explore Harness the Harmony by Dr. Sanjo Cine Mathew, a guide to alignment, presence, authenticity, emotional freedom, and intentional being.",
    socialDescription: "A guide to aligning thoughts, emotions, actions, and identity so you can live with presence, authenticity, and inner harmony.",
    relatedBookSlugs: ["the-waymaker-woman", "the-resilience-response", "untangle-the-confusion"]
  }
];

export function bookRoute(book) {
  return `${BOOKS_ROUTE}${book.slug}/`;
}

export function getBookBySlug(slug) {
  return books.find((book) => book.slug === slug) || null;
}
