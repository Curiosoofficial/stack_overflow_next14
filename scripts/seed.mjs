// Füllt die Datenbank mit ein paar Demo-Fragen, damit die Live-Demo nicht leer ist.
//
// Aufruf:  npm run seed      (liest MONGODB_URI aus .env.local)
//
// Das Skript ist wiederholbar: Es löscht zuerst nur die alten Demo-Daten
// (User mit clerkId "seed_...") und legt sie neu an. Echte User bleiben unberührt.
// Die Demo-User haben kein Clerk-Konto, man kann sich also nicht mit ihnen einloggen.
//
// Mit --if-empty (läuft bei "npm run build", also auch auf Vercel):
// Nur wenn die Datenbank noch gar keine Fragen hat. Fehler brechen den Build
// nicht ab, sondern werden nur gemeldet.

import mongoose from "mongoose";

const ifEmpty = process.argv.includes("--if-empty");
const url = process.env.MONGODB_URI || process.env.MONGODB_URL;

if (!url) {
  if (ifEmpty) {
    console.log("Demo-Daten: keine Datenbank konfiguriert, übersprungen.");
    process.exit(0);
  }
  console.error("MONGODB_URI fehlt. Lege zuerst .env.local an (siehe .env.example).");
  process.exit(1);
}

const { ObjectId } = mongoose.Types;
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (days) => new Date(Date.now() - days * DAY);
const AVATAR = "/assets/icons/avatar.svg";

const code = (language, source) =>
  `<pre class="language-${language}"><code>${source
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")}</code></pre>`;

const demoUsers = [
  { key: "mara", name: "Mara Keller", username: "mara_dev", location: "Bern" },
  { key: "jonas", name: "Jonas Brunner", username: "jbrunner", location: "Basel" },
  { key: "sofia", name: "Sofia Rossi", username: "sofia_codes", location: "Lugano" },
  { key: "tim", name: "Tim Weber", username: "timweb", location: "St. Gallen" },
];

const demoQuestions = [
  {
    key: "params",
    author: "jonas",
    days: 12,
    views: 184,
    title: "Why is params a Promise in my Next.js page now?",
    tags: ["nextjs", "react"],
    content:
      "<p>After upgrading my app router project, TypeScript complains that <code>params.id</code> does not exist. The type says <code>params</code> is a <code>Promise</code>. What changed, and what is the cleanest way to read the id in a server component?</p>" +
      code("tsx", "export default async function Page({ params }) {\n  return <h1>{params.id}</h1>\n}"),
  },
  {
    key: "regex",
    author: "mara",
    days: 9,
    views: 97,
    title: "Search for \"c++\" crashes my MongoDB regex query",
    tags: ["mongodb", "javascript"],
    content:
      "<p>I build a case-insensitive search with <code>new RegExp(searchQuery, \"i\")</code>. It works for normal words, but searching for <code>c++</code> throws <em>Nothing to repeat</em> and the page crashes. How do I make user input safe inside a regular expression?</p>",
  },
  {
    key: "server-actions",
    author: "sofia",
    days: 7,
    views: 143,
    title: "Do I need to check auth inside a Server Action?",
    tags: ["nextjs", "security"],
    content:
      "<p>My page is only reachable for signed-in users, so I assumed the Server Actions on that page are protected as well. A colleague says anybody can call them directly. Is that true, and where should the check go?</p>",
  },
  {
    key: "dark-mode",
    author: "tim",
    days: 5,
    views: 61,
    title: "Tailwind dark mode flickers on first load",
    tags: ["css", "tailwind"],
    content:
      "<p>I toggle the <code>dark</code> class on <code>&lt;html&gt;</code> from <code>localStorage</code> in a <code>useEffect</code>. On a hard reload the page shows the light theme for a split second. How can I avoid the flash?</p>",
  },
  {
    key: "populate",
    author: "mara",
    days: 3,
    views: 38,
    title: "Mongoose populate returns null for some authors",
    tags: ["mongodb", "mongoose"],
    content:
      "<p>I populate <code>author</code> on my questions, but for a few documents the author is <code>null</code> and my component crashes on <code>author.name</code>. The user was deleted earlier. What is a good way to handle this?</p>",
  },
  {
    key: "keys",
    author: "jonas",
    days: 1,
    views: 12,
    title: "React warns about missing keys although I pass an id",
    tags: ["react", "javascript"],
    content:
      "<p>I render a list with <code>items.map(item =&gt; &lt;Row key={item._id} /&gt;)</code>. React still logs a key warning. The ids come from MongoDB. What am I missing?</p>",
  },
];

const demoAnswers = [
  {
    question: "params",
    author: "sofia",
    days: 11,
    upvotes: ["mara", "jonas", "tim"],
    content:
      "<p>Since Next.js 15, <code>params</code> and <code>searchParams</code> are passed as Promises, and Next.js 16 removed the synchronous fallback. Make the page async and await them first:</p>" +
      code("tsx", "export default async function Page(props) {\n  const { id } = await props.params\n  return <h1>{id}</h1>\n}"),
  },
  {
    question: "regex",
    author: "tim",
    days: 8,
    upvotes: ["mara"],
    content:
      "<p>Characters like <code>+</code>, <code>(</code> or <code>*</code> have a meaning in regular expressions. Escape them before you build the RegExp, then the search treats them as plain text:</p>" +
      code("javascript", "const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')\nconst search = new RegExp(escapeRegExp(query), 'i')"),
  },
  {
    question: "server-actions",
    author: "jonas",
    days: 6,
    upvotes: ["sofia", "mara"],
    content:
      "<p>Yes, your colleague is right. A Server Action is a public HTTP endpoint. Protecting the page does not protect the action. Read the signed-in user on the server inside every action that changes data, and never trust an author id that comes from the browser.</p>",
  },
  {
    question: "dark-mode",
    author: "mara",
    days: 4,
    upvotes: [],
    content:
      "<p>The effect runs after the first paint, so the light theme is visible for a moment. A small inline script in the document head that sets the class before React hydrates avoids the flash. Libraries like next-themes do exactly that.</p>",
  },
];

async function findOrCreateTag(db, name, questionId, createdOn) {
  const tags = db.collection("tags");
  const existing = await tags.findOne({ name: { $regex: `^${name}$`, $options: "i" } });

  if (existing) {
    await tags.updateOne({ _id: existing._id }, { $addToSet: { questions: questionId } });
    return existing._id;
  }

  const _id = new ObjectId();
  await tags.insertOne({ _id, name, description: "", questions: [questionId], followers: [], createdOn });
  return _id;
}

async function removeOldDemoData(db) {
  const seedUsers = await db.collection("users").find({ clerkId: { $regex: "^seed_" } }).toArray();
  const userIds = seedUsers.map((user) => user._id);
  if (userIds.length === 0) return;

  const questionIds = (
    await db.collection("questions").find({ author: { $in: userIds } }).project({ _id: 1 }).toArray()
  ).map((question) => question._id);

  await db.collection("answers").deleteMany({ $or: [{ author: { $in: userIds } }, { question: { $in: questionIds } }] });
  await db.collection("interactions").deleteMany({ $or: [{ user: { $in: userIds } }, { question: { $in: questionIds } }] });
  await db.collection("questions").deleteMany({ _id: { $in: questionIds } });
  await db.collection("tags").updateMany({}, { $pull: { questions: { $in: questionIds } } });
  await db.collection("users").deleteMany({ _id: { $in: userIds } });
}

async function main() {
  await mongoose.connect(url, { dbName: "devFlow", serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;

  if (ifEmpty && (await db.collection("questions").countDocuments({}, { limit: 1 })) > 0) {
    console.log("Demo-Daten: Datenbank enthält schon Fragen, übersprungen.");
    return;
  }

  await removeOldDemoData(db);

  const userIds = {};
  await db.collection("users").insertMany(
    demoUsers.map((user, index) => {
      const _id = new ObjectId();
      userIds[user.key] = _id;
      return {
        _id,
        clerkId: `seed_${user.key}`,
        name: user.name,
        username: user.username,
        email: `${user.key}@demo.example.com`,
        picture: AVATAR,
        bio: "Demo account with sample data for the live demo.",
        location: user.location,
        reputation: 0,
        saved: [],
        joinedAt: daysAgo(30 - index),
      };
    })
  );

  const questionIds = {};
  for (const question of demoQuestions) {
    const _id = new ObjectId();
    questionIds[question.key] = _id;
    const createdAt = daysAgo(question.days);

    const tagIds = [];
    for (const tag of question.tags) {
      tagIds.push(await findOrCreateTag(db, tag, _id, createdAt));
    }

    await db.collection("questions").insertOne({
      _id,
      title: question.title,
      content: question.content,
      tags: tagIds,
      views: question.views,
      upvotes: [],
      downvotes: [],
      author: userIds[question.author],
      answers: [],
      createdAt,
    });

    await db.collection("interactions").insertOne({
      user: userIds[question.author],
      action: "ask_question",
      question: _id,
      tags: tagIds,
      createdAt,
    });
  }

  for (const answer of demoAnswers) {
    const _id = new ObjectId();
    const questionId = questionIds[answer.question];
    const question = await db.collection("questions").findOne({ _id: questionId });

    await db.collection("answers").insertOne({
      _id,
      author: userIds[answer.author],
      question: questionId,
      content: answer.content,
      upvotes: answer.upvotes.map((key) => userIds[key]),
      downvotes: [],
      createdAt: daysAgo(answer.days),
    });

    await db.collection("questions").updateOne({ _id: questionId }, { $push: { answers: _id } });

    await db.collection("interactions").insertOne({
      user: userIds[answer.author],
      action: "answer",
      question: questionId,
      answer: _id,
      tags: question.tags,
      createdAt: daysAgo(answer.days),
    });
  }

  // Ein paar Stimmen auf Fragen, damit "Top Questions" und Reputation etwas zeigen
  const questionVotes = { params: ["mara", "sofia", "tim"], "server-actions": ["jonas", "tim"], regex: ["sofia"] };
  for (const [questionKey, voters] of Object.entries(questionVotes)) {
    await db
      .collection("questions")
      .updateOne({ _id: questionIds[questionKey] }, { $set: { upvotes: voters.map((key) => userIds[key]) } });
  }

  // Reputation grob wie in der App berechnen (Frage +5, Antwort +10, erhaltene Stimme +10)
  for (const user of demoUsers) {
    const asked = demoQuestions.filter((q) => q.author === user.key).length;
    const answered = demoAnswers.filter((a) => a.author === user.key);
    const votesOnAnswers = answered.reduce((sum, a) => sum + a.upvotes.length, 0);
    const votesOnQuestions = demoQuestions
      .filter((q) => q.author === user.key)
      .reduce((sum, q) => sum + (questionVotes[q.key]?.length ?? 0), 0);

    await db.collection("users").updateOne(
      { _id: userIds[user.key] },
      { $set: { reputation: asked * 5 + answered.length * 10 + (votesOnAnswers + votesOnQuestions) * 10 } }
    );
  }

  console.log(
    `Demo-Daten angelegt: ${demoUsers.length} User, ${demoQuestions.length} Fragen, ${demoAnswers.length} Antworten.`
  );
}

main()
  .catch((error) => {
    if (ifEmpty) {
      // Beim Build nur warnen: Die App soll trotzdem deployt werden
      console.warn("Demo-Daten konnten nicht angelegt werden:", error.message);
      return;
    }
    console.error("Seed fehlgeschlagen:", error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
