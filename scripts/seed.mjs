// Füllt die Datenbank mit Demo-Fragen, damit die Live-Demo nicht leer ist.
// Die Inhalte stehen in scripts/seed-data.mjs.
//
// Aufruf:  npm run seed      (liest MONGODB_URI aus .env.local, legt immer neu an)
//
// Das Skript ist wiederholbar: Es löscht zuerst nur die alten Demo-Daten
// (User mit clerkId "seed_..." und alles, was an ihren Fragen hängt) und legt
// sie neu an. Fragen und Accounts von echten Usern bleiben unberührt.
// Die Demo-User haben kein Clerk-Konto, man kann sich nicht mit ihnen einloggen.
//
// Mit --auto (läuft bei "npm run build", also bei jedem Deployment auf Vercel):
// Nur wenn die Demo-Daten in der Datenbank älter sind als SEED_VERSION.
// Fehler bei der Verbindung brechen den Build nicht ab, sondern werden gemeldet.

import mongoose from "mongoose";
import { SEED_VERSION, answers, questions, users } from "./seed-data.mjs";

const auto = process.argv.includes("--auto");
const url = process.env.MONGODB_URI || process.env.MONGODB_URL;

const { ObjectId } = mongoose.Types;
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (days) => new Date(Date.now() - days * DAY);

/** Prüft die Demo-Daten auf Tippfehler, bevor etwas in die Datenbank geschrieben wird. */
function validateData() {
  const errors = [];
  const userKeys = new Set(users.map((user) => user.key));
  const questionsByKey = new Map(questions.map((question) => [question.key, question]));

  for (const question of questions) {
    if (!userKeys.has(question.author)) errors.push(`Frage ${question.key}: unbekannter Autor ${question.author}`);
    if (question.tags.length < 1 || question.tags.length > 3) errors.push(`Frage ${question.key}: 1 bis 3 Tags`);
    if (question.content.length < 100) errors.push(`Frage ${question.key}: Text kürzer als 100 Zeichen`);
    for (const voter of question.upvotes) {
      if (!userKeys.has(voter)) errors.push(`Frage ${question.key}: unbekannter Voter ${voter}`);
      if (voter === question.author) errors.push(`Frage ${question.key}: Autor stimmt für sich selbst`);
    }
  }

  for (const answer of answers) {
    const question = questionsByKey.get(answer.question);
    if (!question) errors.push(`Antwort von ${answer.author}: unbekannte Frage ${answer.question}`);
    if (!userKeys.has(answer.author)) errors.push(`Antwort auf ${answer.question}: unbekannter Autor ${answer.author}`);
    if (question && answer.days >= question.days) errors.push(`Antwort auf ${answer.question}: älter als die Frage`);
    if (answer.content.length < 100) errors.push(`Antwort auf ${answer.question}: Text kürzer als 100 Zeichen`);
    for (const voter of answer.upvotes) {
      if (!userKeys.has(voter)) errors.push(`Antwort auf ${answer.question}: unbekannter Voter ${voter}`);
      if (voter === answer.author) errors.push(`Antwort auf ${answer.question}: Autor stimmt für sich selbst`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Demo-Daten fehlerhaft:\n- ${errors.join("\n- ")}`);
  }
}

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

  await db
    .collection("answers")
    .deleteMany({ $or: [{ author: { $in: userIds } }, { question: { $in: questionIds } }] });
  await db
    .collection("interactions")
    .deleteMany({ $or: [{ user: { $in: userIds } }, { question: { $in: questionIds } }] });
  await db.collection("questions").deleteMany({ _id: { $in: questionIds } });
  await db.collection("tags").updateMany({}, { $pull: { questions: { $in: questionIds } } });
  // Stimmen und gespeicherte Fragen der Demo-User aus echten Inhalten entfernen
  await db.collection("questions").updateMany({}, { $pull: { upvotes: { $in: userIds }, downvotes: { $in: userIds } } });
  await db.collection("answers").updateMany({}, { $pull: { upvotes: { $in: userIds }, downvotes: { $in: userIds } } });
  await db.collection("users").updateMany({}, { $pull: { saved: { $in: questionIds } } });
  await db.collection("users").deleteMany({ _id: { $in: userIds } });
}

async function insertDemoData(db) {
  const userIds = Object.fromEntries(users.map((user) => [user.key, new ObjectId()]));
  const reputation = Object.fromEntries(users.map((user) => [user.key, 0]));

  await db.collection("users").insertMany(
    users.map((user, index) => ({
      _id: userIds[user.key],
      clerkId: `seed_${user.key}`,
      name: user.name,
      username: user.username,
      email: `${user.key}@demo.example.com`,
      picture: `/assets/avatars/${user.key}.svg`,
      bio: `Demo account · ${user.role}`,
      location: user.location,
      reputation: 0,
      saved: [],
      joinedAt: daysAgo(40 - index),
    }))
  );

  const questionIds = {};
  const questionTags = {};

  for (const question of questions) {
    const _id = new ObjectId();
    questionIds[question.key] = _id;
    const createdAt = daysAgo(question.days);

    const tagIds = [];
    for (const tag of question.tags) {
      tagIds.push(await findOrCreateTag(db, tag, _id, createdAt));
    }
    questionTags[question.key] = tagIds;

    await db.collection("questions").insertOne({
      _id,
      title: question.title,
      content: question.content,
      tags: tagIds,
      views: question.views,
      upvotes: question.upvotes.map((key) => userIds[key]),
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

    // Reputation wie in der App: Frage stellen +5, erhaltene Stimme +10
    reputation[question.author] += 5 + question.upvotes.length * 10;
  }

  for (const answer of answers) {
    const _id = new ObjectId();
    const questionId = questionIds[answer.question];
    const createdAt = daysAgo(answer.days);

    await db.collection("answers").insertOne({
      _id,
      author: userIds[answer.author],
      question: questionId,
      content: answer.content,
      upvotes: answer.upvotes.map((key) => userIds[key]),
      downvotes: [],
      createdAt,
    });

    await db.collection("questions").updateOne({ _id: questionId }, { $push: { answers: _id } });

    await db.collection("interactions").insertOne({
      user: userIds[answer.author],
      action: "answer",
      question: questionId,
      answer: _id,
      tags: questionTags[answer.question],
      createdAt,
    });

    // Antworten +10, erhaltene Stimme +10
    reputation[answer.author] += 10 + answer.upvotes.length * 10;
  }

  for (const user of users) {
    await db.collection("users").updateOne({ _id: userIds[user.key] }, { $set: { reputation: reputation[user.key] } });
  }
}

async function main() {
  validateData();

  if (!url) {
    if (auto) {
      console.log("Demo-Daten: keine Datenbank konfiguriert, übersprungen.");
      return;
    }
    console.error("MONGODB_URI fehlt. Lege zuerst .env.local an (siehe .env.example).");
    process.exitCode = 1;
    return;
  }

  await mongoose.connect(url, { dbName: "devFlow", serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  const meta = db.collection("seedmeta");

  if (auto) {
    const current = await meta.findOne({ _id: "demo" });
    if (current?.version === SEED_VERSION) {
      console.log(`Demo-Daten sind aktuell (Version ${SEED_VERSION}), übersprungen.`);
      return;
    }
  }

  await removeOldDemoData(db);
  await insertDemoData(db);
  await meta.updateOne(
    { _id: "demo" },
    { $set: { version: SEED_VERSION, seededAt: new Date() } },
    { upsert: true }
  );

  console.log(
    `Demo-Daten angelegt (Version ${SEED_VERSION}): ${users.length} User, ${questions.length} Fragen, ${answers.length} Antworten.`
  );
}

main()
  .catch((error) => {
    // Fehlerhafte Demo-Daten sollen auffallen, Verbindungsprobleme beim Build nicht
    if (auto && !String(error.message).startsWith("Demo-Daten fehlerhaft")) {
      console.warn("Demo-Daten konnten nicht angelegt werden:", error.message);
      return;
    }
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
