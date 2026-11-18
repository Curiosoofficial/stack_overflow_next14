// Demo-Inhalte für die Live-Demo (eigene Texte, nicht von Stack Overflow kopiert).
// Wird von scripts/seed.mjs gelesen. Wer hier etwas ändert, erhöht SEED_VERSION:
// Beim nächsten Deployment werden die Demo-Daten dann automatisch neu angelegt.

export const SEED_VERSION = 2;

const escapeHtml = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const p = (text) => `<p>${text}</p>`;
const code = (language, source) =>
  `<pre class="language-${language}"><code>${escapeHtml(source)}</code></pre>`;

// key = Teil der clerkId ("seed_<key>") und Name der Avatar-Datei
export const users = [
  { key: "mara", name: "Mara Keller", username: "mara_dev", location: "Bern", role: "Full-stack developer, loves databases." },
  { key: "jonas", name: "Jonas Brunner", username: "jbrunner", location: "Basel", role: "Frontend developer working with Next.js." },
  { key: "sofia", name: "Sofia Rossi", username: "sofia_codes", location: "Lugano", role: "React developer and mentor." },
  { key: "tim", name: "Tim Weber", username: "timweb", location: "St. Gallen", role: "CSS enthusiast." },
  { key: "lea", name: "Lea Fischer", username: "leafischer", location: "Zürich", role: "Accessibility advocate." },
  { key: "noah", name: "Noah Meier", username: "noah_ts", location: "Luzern", role: "TypeScript all the way." },
  { key: "elif", name: "Elif Yilmaz", username: "elif_y", location: "Winterthur", role: "Backend developer, Node.js and testing." },
  { key: "david", name: "David Schmid", username: "dschmid", location: "Aarau", role: "DevOps and Git questions welcome." },
  { key: "chiara", name: "Chiara Bernasconi", username: "chiara_b", location: "Bellinzona", role: "UI developer with a design background." },
  { key: "samuel", name: "Samuel Osei", username: "sam_osei", location: "Genève", role: "Junior developer, learning in public." },
];

// days = vor wie vielen Tagen gestellt; answers fehlen bei unbeantworteten Fragen bewusst
export const questions = [
  {
    key: "params",
    author: "jonas",
    days: 12,
    views: 184,
    tags: ["nextjs", "react"],
    upvotes: ["mara", "sofia", "tim", "lea", "noah"],
    title: "Why is params a Promise in my Next.js page now?",
    content:
      p("After upgrading my app router project, TypeScript complains that <code>params.id</code> does not exist. The type says <code>params</code> is a <code>Promise</code>. What changed, and what is the cleanest way to read the id in a server component?") +
      code("tsx", "export default async function Page({ params }) {\n  return <h1>{params.id}</h1>\n}"),
  },
  {
    key: "regex",
    author: "mara",
    days: 9,
    views: 97,
    tags: ["mongodb", "javascript"],
    upvotes: ["sofia", "david"],
    title: 'Search for "c++" crashes my MongoDB regex query',
    content: p('I build a case-insensitive search with <code>new RegExp(searchQuery, "i")</code>. It works for normal words, but searching for <code>c++</code> throws <em>Nothing to repeat</em> and the page crashes. How do I make user input safe inside a regular expression?'),
  },
  {
    key: "server-actions",
    author: "sofia",
    days: 7,
    views: 143,
    tags: ["nextjs", "security"],
    upvotes: ["jonas", "tim", "elif", "samuel"],
    title: "Do I need to check auth inside a Server Action?",
    content: p("My page is only reachable for signed-in users, so I assumed the Server Actions on that page are protected as well. A colleague says anybody can call them directly. Is that true, and where should the check go?"),
  },
  {
    key: "dark-mode",
    author: "tim",
    days: 5,
    views: 61,
    tags: ["css", "tailwind"],
    upvotes: ["chiara"],
    title: "Tailwind dark mode flickers on first load",
    content: p("I toggle the <code>dark</code> class on <code>&lt;html&gt;</code> from <code>localStorage</code> in a <code>useEffect</code>. On a hard reload the page shows the light theme for a split second. How can I avoid the flash?"),
  },
  {
    key: "populate",
    author: "mara",
    days: 3,
    views: 38,
    tags: ["mongodb", "mongoose"],
    upvotes: [],
    title: "Mongoose populate returns null for some authors",
    content: p("I populate <code>author</code> on my questions, but for a few documents the author is <code>null</code> and my component crashes on <code>author.name</code>. The user was deleted earlier. What is a good way to handle this?"),
  },
  {
    key: "keys",
    author: "jonas",
    days: 1,
    views: 12,
    tags: ["react", "javascript"],
    upvotes: [],
    title: "React warns about missing keys although I pass an id",
    content: p("I render a list with <code>items.map(item =&gt; &lt;Row key={item._id} /&gt;)</code>. React still logs a key warning. The ids come from MongoDB. What am I missing?"),
  },
  {
    key: "effect-twice",
    author: "lea",
    days: 20,
    views: 412,
    tags: ["react"],
    upvotes: ["mara", "jonas", "noah", "elif", "chiara", "samuel"],
    title: "Why does my useEffect run twice in development?",
    content:
      p("I fetch data in a <code>useEffect</code> with an empty dependency array, but in development the request shows up twice in the network tab. In production it only runs once. Is my component mounting twice?") +
      code("tsx", "useEffect(() => {\n  fetch('/api/items')\n    .then((res) => res.json())\n    .then(setItems)\n}, [])"),
  },
  {
    key: "button-props",
    author: "noah",
    days: 18,
    views: 233,
    tags: ["typescript", "react"],
    upvotes: ["sofia", "elif", "samuel"],
    title: "How do I type a component that passes all props to a button?",
    content: p("I want a <code>Button</code> component that accepts every normal button attribute plus a <code>variant</code> prop. Writing every attribute by hand is not an option. What is the right TypeScript type?"),
  },
  {
    key: "grid-cards",
    author: "chiara",
    days: 25,
    views: 156,
    tags: ["css"],
    upvotes: ["tim", "lea"],
    title: "Cards in a CSS grid row have different heights",
    content: p("My cards sit in a grid with three columns. Cards with longer text are taller, and the buttons at the bottom do not line up. How can I make all cards in a row the same height with the button at the bottom?"),
  },
  {
    key: "git-undo",
    author: "david",
    days: 30,
    views: 520,
    tags: ["git"],
    upvotes: ["mara", "jonas", "tim", "lea", "noah", "samuel", "chiara"],
    title: "Undo the last commit but keep my changes",
    content: p("I committed too early and want to change a few files before committing again. The commit is not pushed yet. How do I undo it without losing the changes?"),
  },
  {
    key: "stale-data",
    author: "samuel",
    days: 15,
    views: 289,
    tags: ["nextjs"],
    upvotes: ["jonas", "noah"],
    title: "Why does my Next.js page show old data after I change the database?",
    content: p("I load data in a Server Component. After updating a record, the page still shows the old value until I redeploy. What am I doing wrong?"),
  },
  {
    key: "esm-cjs",
    author: "elif",
    days: 22,
    views: 301,
    tags: ["nodejs", "javascript"],
    upvotes: ["david", "samuel"],
    title: "Cannot use import statement outside a module in Node.js",
    content: p("I run a small script with <code>node script.js</code> and get <em>SyntaxError: Cannot use import statement outside a module</em>. The same import works in my Next.js app. Why?"),
  },
  {
    key: "debounce",
    author: "mara",
    days: 11,
    views: 174,
    tags: ["react", "javascript"],
    upvotes: ["lea", "chiara", "noah"],
    title: "How do I debounce a search input in React?",
    content: p("Every keystroke in my search field triggers a request. I would like to wait until the user stops typing for 300 ms. What is the simplest way without a library?"),
  },
  {
    key: "zod-url",
    author: "tim",
    days: 8,
    views: 88,
    tags: ["zod", "typescript"],
    upvotes: ["elif"],
    title: "Zod: optional URL field fails for an empty input",
    content: p("My form has an optional website field. When the input is empty, React Hook Form sends an empty string and <code>z.url().optional()</code> reports <em>Invalid URL</em>. How do I allow an empty value?"),
  },
  {
    key: "mongo-index",
    author: "noah",
    days: 6,
    views: 54,
    tags: ["mongodb"],
    upvotes: ["mara"],
    title: "Does a case-insensitive regex search use my MongoDB index?",
    content: p("I search usernames with a case-insensitive regex. With 50,000 users it is getting slow, even though <code>username</code> has an index. Is the index used at all, and what are the alternatives?"),
  },
  {
    key: "docker-volume",
    author: "david",
    days: 4,
    views: 47,
    tags: ["docker", "nodejs"],
    upvotes: [],
    title: "node_modules disappears when I mount my project into a container",
    content: p("In docker-compose I mount the project folder into <code>/app</code> for live reloading. After that the container cannot find any packages, although <code>npm install</code> ran in the Dockerfile. What is going on?"),
  },
  {
    key: "div-button",
    author: "chiara",
    days: 14,
    views: 132,
    tags: ["accessibility", "html"],
    upvotes: ["lea", "sofia", "tim", "jonas"],
    title: "Is a div with onClick fine instead of a button?",
    content: p("Our design system uses <code>&lt;div onClick&gt;</code> for icon buttons because it is easier to style. A colleague says this breaks accessibility. What exactly is the problem?"),
  },
  {
    key: "null-equality",
    author: "samuel",
    days: 27,
    views: 365,
    tags: ["javascript"],
    upvotes: ["mara", "elif", "noah"],
    title: "Why is null == undefined true but null === undefined false?",
    content: p("I checked a value with <code>if (value == null)</code> and it also caught <code>undefined</code>. Is that a bug in my code or intended?"),
  },
  {
    key: "tailwind-dynamic",
    author: "lea",
    days: 10,
    views: 199,
    tags: ["tailwind", "css"],
    upvotes: ["chiara", "tim", "sofia"],
    title: "Tailwind classes built from variables are missing",
    content: p("I build class names like <code>bg-${color}-500</code> in my component. Some colors work, others have no style at all. Why?"),
  },
  {
    key: "vitest-fetch",
    author: "elif",
    days: 2,
    views: 23,
    tags: ["testing", "javascript"],
    upvotes: [],
    title: "How do I mock fetch in Vitest?",
    content: p("My function calls <code>fetch</code> and I want to test the error handling without a real network request. What is the cleanest way to do that in Vitest?"),
  },
  {
    key: "cors",
    author: "jonas",
    days: 16,
    views: 247,
    tags: ["api", "security"],
    upvotes: ["samuel", "david", "elif"],
    title: "CORS error when my frontend calls my own API",
    content: p("My React app on <code>localhost:5173</code> calls my Express API on <code>localhost:3000</code>. The browser blocks the request with a CORS error, but the same request works in Postman."),
  },
  {
    key: "unknown-catch",
    author: "sofia",
    days: 13,
    views: 141,
    tags: ["typescript"],
    upvotes: ["noah", "jonas"],
    title: "Why is the error in catch typed as unknown?",
    content: p("TypeScript does not let me read <code>error.message</code> in my catch block. Should I just type it as <code>any</code>?"),
  },
  {
    key: "image-host",
    author: "noah",
    days: 9,
    views: 118,
    tags: ["nextjs"],
    upvotes: ["jonas"],
    title: "next/image says the hostname is not configured",
    content: p("I show user avatars from an external service with <code>next/image</code> and get an error that the hostname is not configured under <code>images</code> in <code>next.config</code>. Do I really have to list every host?"),
  },
  {
    key: "lockfile",
    author: "tim",
    days: 19,
    views: 207,
    tags: ["git", "nodejs"],
    upvotes: ["david", "mara"],
    title: "Merge conflict in package-lock.json",
    content: p("After merging main into my branch I have hundreds of conflict markers in <code>package-lock.json</code>. Resolving them by hand seems impossible. What is the usual way?"),
  },
  {
    key: "rhf-editor",
    author: "samuel",
    days: 3,
    views: 31,
    tags: ["react", "forms"],
    upvotes: ["sofia"],
    title: "React Hook Form with a rich text editor",
    content: p("My rich text editor is not a normal input, so <code>register()</code> does not work. How do I connect it to React Hook Form so that validation still runs?"),
  },
  {
    key: "env-client",
    author: "chiara",
    days: 1,
    views: 9,
    tags: ["nextjs", "security"],
    upvotes: [],
    title: "Why is my API key undefined in a client component?",
    content: p('<code>process.env.API_KEY</code> works in my API route, but in a component with <code>"use client"</code> it is <code>undefined</code>. Did I configure something wrong?'),
  },
];

// days = vor wie vielen Tagen beantwortet (immer nach der Frage)
export const answers = [
  {
    question: "params",
    author: "sofia",
    days: 11,
    upvotes: ["mara", "jonas", "tim"],
    content:
      p("Since Next.js 15, <code>params</code> and <code>searchParams</code> are passed as Promises, and Next.js 16 removed the synchronous fallback. Make the page async and await them first:") +
      code("tsx", "export default async function Page(props) {\n  const { id } = await props.params\n  return <h1>{id}</h1>\n}"),
  },
  {
    question: "regex",
    author: "tim",
    days: 8,
    upvotes: ["mara"],
    content:
      p("Characters like <code>+</code>, <code>(</code> or <code>*</code> have a meaning in regular expressions. Escape them before you build the RegExp, then the search treats them as plain text:") +
      code("javascript", "const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')\nconst search = new RegExp(escapeRegExp(query), 'i')"),
  },
  {
    question: "server-actions",
    author: "jonas",
    days: 6,
    upvotes: ["sofia", "mara", "lea"],
    content: p("Yes, your colleague is right. A Server Action is a public HTTP endpoint. Protecting the page does not protect the action. Read the signed-in user on the server inside every action that changes data, and never trust an author id that comes from the browser."),
  },
  {
    question: "dark-mode",
    author: "mara",
    days: 4,
    upvotes: [],
    content: p("The effect runs after the first paint, so the light theme is visible for a moment. A small inline script in the document head that sets the class before React hydrates avoids the flash. Libraries like next-themes do exactly that."),
  },
  {
    question: "populate",
    author: "david",
    days: 2,
    upvotes: ["mara"],
    content: p("When the referenced user no longer exists, populate sets the field to <code>null</code>. Guard against it in the component, for example <code>question.author?.name ?? 'Deleted user'</code>. In the long run, delete or reassign a user's content when the account is removed, so you never keep orphaned references."),
  },
  {
    question: "keys",
    author: "lea",
    days: 0.5,
    upvotes: ["jonas"],
    content: p("The key on <code>Row</code> is probably fine. The warning usually comes from somewhere else: a nested list without keys, or a Fragment <code>&lt;&gt;...&lt;/&gt;</code> that wraps several elements inside the map. Use <code>&lt;Fragment key={String(item._id)}&gt;</code> there. The React DevTools component stack in the warning shows you the exact place."),
  },
  {
    question: "effect-twice",
    author: "sofia",
    days: 19,
    upvotes: ["lea", "mara", "noah", "jonas"],
    content:
      p("Yes, on purpose. In development, React Strict Mode mounts, unmounts and mounts every component again to surface effects that do not clean up properly. Production builds skip this. Make the effect safe to run twice by returning a cleanup function:") +
      code("tsx", "useEffect(() => {\n  const controller = new AbortController()\n\n  fetch('/api/items', { signal: controller.signal })\n    .then((res) => res.json())\n    .then(setItems)\n    .catch(() => {})\n\n  return () => controller.abort()\n}, [])"),
  },
  {
    question: "effect-twice",
    author: "noah",
    days: 18,
    upvotes: ["sofia"],
    content: p("Also ask whether you need the effect at all. If the data can be loaded in a Server Component or with a data library like TanStack Query, the double request disappears and you get caching on top. Effects are meant for synchronising with things outside React."),
  },
  {
    question: "button-props",
    author: "elif",
    days: 17,
    upvotes: ["noah", "sofia"],
    content:
      p("Use the built-in props type for the element and extend it:") +
      code("tsx", "type ButtonProps = React.ComponentProps<'button'> & {\n  variant?: 'primary' | 'ghost'\n}\n\nexport function Button({ variant = 'primary', ...rest }: ButtonProps) {\n  return <button data-variant={variant} {...rest} />\n}") +
      p("<code>ComponentProps&lt;'button'&gt;</code> already contains <code>onClick</code>, <code>disabled</code>, <code>type</code> and all aria attributes."),
  },
  {
    question: "grid-cards",
    author: "tim",
    days: 24,
    upvotes: ["chiara", "lea"],
    content:
      p("Grid items stretch to the height of the row by default, so the cards themselves are already equal. The content inside is the problem. Make each card a flex column and push the button down:") +
      code("css", ".card {\n  display: flex;\n  flex-direction: column;\n}\n\n.card .button {\n  margin-top: auto;\n}"),
  },
  {
    question: "grid-cards",
    author: "mara",
    days: 22,
    upvotes: ["chiara"],
    content: p("If titles and text should also line up across the cards, look at <code>grid-template-rows: subgrid</code>. Each card spans several rows of the parent grid, so title, text and button share the same row tracks. All current browsers support it."),
  },
  {
    question: "git-undo",
    author: "samuel",
    days: 29,
    upvotes: ["david", "jonas", "tim", "lea"],
    content:
      p("<code>git reset --soft HEAD~1</code> moves the branch back by one commit and keeps your changes staged. Without <code>--soft</code> they stay in your working directory, but unstaged. Both are safe as long as the commit was not pushed:") +
      code("bash", "git reset --soft HEAD~1\n# change files, then commit again\ngit commit -m \"Better commit\""),
  },
  {
    question: "git-undo",
    author: "jonas",
    days: 28,
    upvotes: ["david", "mara"],
    content: p("If you only forgot a file or want to fix the message, you do not need to undo anything. Stage the change and run <code>git commit --amend</code>. Again: only for commits that nobody else has pulled yet, because it rewrites history."),
  },
  {
    question: "stale-data",
    author: "sofia",
    days: 14,
    upvotes: ["samuel", "noah", "jonas"],
    content: p("Most likely the page was prerendered at build time because it does not use any request-time API. It then stays static until the next build. If the data must always be fresh, mark the page as dynamic, for example with <code>await connection()</code> from <code>next/server</code>. If it can stay static, call <code>revalidatePath()</code> in the Server Action that changes the data."),
  },
  {
    question: "esm-cjs",
    author: "david",
    days: 21,
    upvotes: ["elif", "samuel"],
    content: p("Node treats <code>.js</code> files as CommonJS unless the nearest <code>package.json</code> contains <code>\"type\": \"module\"</code>. Either add that field, rename the file to <code>.mjs</code>, or use <code>require()</code>. Next.js compiles your code with its own bundler, which is why imports work there."),
  },
  {
    question: "debounce",
    author: "noah",
    days: 10,
    upvotes: ["mara", "lea"],
    content:
      p("Keep the input value in state and start a timer in an effect. The cleanup clears the timer whenever the value changes again, so only the last value triggers a request:") +
      code("tsx", "const [query, setQuery] = useState('')\n\nuseEffect(() => {\n  const timer = setTimeout(() => search(query), 300)\n  return () => clearTimeout(timer)\n}, [query])"),
  },
  {
    question: "debounce",
    author: "chiara",
    days: 9,
    upvotes: ["mara"],
    content: p("Another tool is <code>useDeferredValue</code>. It does not wait a fixed time, but React renders the expensive result list with lower priority, so typing stays smooth. For network requests the timer approach above is still the better choice."),
  },
  {
    question: "zod-url",
    author: "elif",
    days: 7,
    upvotes: ["tim"],
    content:
      p("<code>optional()</code> only accepts <code>undefined</code>, but an empty input is <code>''</code>. Allow both explicitly:") +
      code("ts", "const schema = z.object({\n  website: z.union([z.url(), z.literal('')]).optional(),\n})"),
  },
  {
    question: "div-button",
    author: "lea",
    days: 13,
    upvotes: ["chiara", "sofia", "tim"],
    content: p("A div cannot be focused with the keyboard and does not react to Enter or Space, and screen readers do not announce it as a button. A native <code>&lt;button type=\"button\"&gt;</code> gives you all of that for free. If the default styles get in your way, reset them with <code>background: none; border: 0;</code>."),
  },
  {
    question: "div-button",
    author: "tim",
    days: 12,
    upvotes: ["lea"],
    content: p("And give icon-only buttons an accessible name, for example <code>aria-label=\"Delete question\"</code>. Otherwise a screen reader only says \"button\" and nobody knows what it does."),
  },
  {
    question: "null-equality",
    author: "mara",
    days: 26,
    upvotes: ["samuel", "elif"],
    content: p("It is intended. Loose equality has a special rule: <code>null</code> and <code>undefined</code> are equal to each other and to nothing else. That makes <code>value == null</code> a short check for both. Strict equality never converts types, so <code>null === undefined</code> is false."),
  },
  {
    question: "null-equality",
    author: "jonas",
    days: 25,
    upvotes: ["samuel"],
    content: p("In modern code you often do not need the check at all. Optional chaining (<code>user?.name</code>) and nullish coalescing (<code>value ?? 'default'</code>) treat <code>null</code> and <code>undefined</code> the same way."),
  },
  {
    question: "tailwind-dynamic",
    author: "chiara",
    days: 9,
    upvotes: ["lea", "tim"],
    content:
      p("Tailwind scans your files for complete class names as plain text. It never runs your code, so a class that only exists after string concatenation is never generated. Map the values to full class names instead:") +
      code("tsx", "const colors = {\n  red: 'bg-red-500',\n  green: 'bg-green-500',\n}\n\n<span className={colors[color]} />"),
  },
  {
    question: "cors",
    author: "samuel",
    days: 15,
    upvotes: ["jonas", "elif"],
    content:
      p("Postman is not a browser, so CORS does not apply there. The browser only allows the request if the API answers with an <code>Access-Control-Allow-Origin</code> header for your frontend. In Express:") +
      code("javascript", "import cors from 'cors'\n\napp.use(cors({ origin: 'http://localhost:5173' }))"),
  },
  {
    question: "cors",
    author: "david",
    days: 14,
    upvotes: ["jonas"],
    content: p("In development you can avoid CORS completely with the proxy of your dev server (in Vite: <code>server.proxy</code>). The browser then only talks to localhost:5173, and Vite forwards the request to the API. Do not use <code>origin: '*'</code> together with cookies, browsers reject that combination."),
  },
  {
    question: "unknown-catch",
    author: "noah",
    days: 12,
    upvotes: ["sofia", "jonas"],
    content:
      p("In JavaScript anything can be thrown, not only Error objects, so <code>unknown</code> is the honest type. Narrow it before you use it instead of switching to <code>any</code>:") +
      code("ts", "try {\n  await save()\n} catch (error) {\n  const message = error instanceof Error ? error.message : 'Unknown error'\n  console.error(message)\n}"),
  },
  {
    question: "image-host",
    author: "jonas",
    days: 8,
    upvotes: ["noah"],
    content:
      p("Yes, and that is a security feature. The image optimizer downloads remote images on your server. An open list would turn it into a free proxy for anyone. Add exactly the hosts you need and avoid wildcards like <code>hostname: '*'</code>:") +
      code("javascript", "// next.config.mjs\nimages: {\n  remotePatterns: [{ protocol: 'https', hostname: 'img.clerk.com' }],\n}"),
  },
  {
    question: "lockfile",
    author: "david",
    days: 18,
    upvotes: ["tim", "mara"],
    content:
      p("Do not resolve it by hand. Take one side as a starting point and let npm rebuild the lock file from the merged <code>package.json</code>:") +
      code("bash", "git checkout --theirs package-lock.json   # version from main\nnpm install\ngit add package-lock.json"),
  },
  {
    question: "env-client",
    author: "sofia",
    days: 0.5,
    upvotes: ["chiara"],
    content: p("Next.js only sends environment variables to the browser if their name starts with <code>NEXT_PUBLIC_</code>. That is on purpose: everything in client code is visible to every visitor. So do not rename a secret key. Keep the call that needs the key on the server (Route Handler or Server Action) and call that from the client."),
  },
];
