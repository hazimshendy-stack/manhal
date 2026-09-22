#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   make-test-accounts.cjs
   ─────────────────────────────────────────────────────────────────────
   ينشئ 7 حسابات اختبار (واحد لكل دور) + يزرع الفرق واللجان
   يقرأ من .env : VITE_FIREBASE_API_KEY + VITE_FIREBASE_PROJECT_ID
   يكتب في .test-accounts.json
   ═══════════════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");
const https = require("https");
const ROOT = process.cwd();

/* ─── قراءة .env ─── */
function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) {
    console.error(" ❌ .env not found at " + envPath);
    console.error("    انسخ .env.example إلى .env واملأه بمفاتيح Firebase");
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, "utf8");
  const env = {};
  for (const line of content.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return env;
}

/* ─── HTTP helper ─── */
function httpRequest(method, url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        method,
        hostname: u.hostname,
        path: u.pathname + u.search,
        headers: {
          "Content-Type": "application/json",
          ...headers,
          ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        let chunks = "";
        res.on("data", (c) => {
          chunks += c;
        });
        res.on("end", () => {
          let parsed = null;
          try {
            parsed = chunks ? JSON.parse(chunks) : null;
          } catch {
            parsed = chunks;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

/* ─── تحويل قيمة لشكل Firestore REST ─── */
function toFirestoreValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "number")
    return Number.isInteger(v)
      ? { integerValue: String(v) }
      : { doubleValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (Array.isArray(v))
    return { arrayValue: { values: v.map(toFirestoreValue) } };
  if (typeof v === "object") {
    const fields = {};
    for (const [k, val] of Object.entries(v)) fields[k] = toFirestoreValue(val);
    return { mapValue: { fields } };
  }
  return { nullValue: null };
}

function toFirestoreDoc(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) fields[k] = toFirestoreValue(v);
  return { fields };
}

/* ─── الحسابات المطلوبة ─── */
const PASSWORD = "Test1234!";

const ACCOUNTS = [
  {
    key: "HEAD",
    email: "head@test.manhal",
    name: "Head Sub Branches",
    role: "HEAD",
    teamId: null,
    committees: [],
  },
  {
    key: "VICE",
    email: "vice@test.manhal",
    name: "Vice Head",
    role: "VICE",
    teamId: null,
    committees: [],
  },
  {
    key: "HEAD_HR_GLOBAL",
    email: "headhr@test.manhal",
    name: "Head HR Global",
    role: "HEAD_HR_GLOBAL",
    teamId: null,
    committees: [],
  },
  {
    key: "PRESIDENT",
    email: "teamhead@test.manhal",
    name: "Team Head",
    role: "PRESIDENT",
    teamId: "helpers",
    committees: ["gov-helpers"],
  },
  {
    key: "HEAD_HR_TEAM",
    email: "teamhr@test.manhal",
    name: "Team Head HR",
    role: "HEAD_HR_TEAM",
    teamId: "helpers",
    committees: ["gov-helpers"],
  },
  {
    key: "COMMITTEE_HR",
    email: "commhr@test.manhal",
    name: "Committee HR",
    role: "COMMITTEE_HR",
    teamId: "helpers",
    committees: ["gov-helpers"],
  },
  {
    key: "MEMBER",
    email: "member@test.manhal",
    name: "Test Member",
    role: "MEMBER",
    teamId: "helpers",
    committees: ["gov-helpers"],
  },
];

const TEAMS = [
  {
    id: "helpers",
    name: "Helpers",
    nameAr: "Helpers",
    description: "Logistics",
    color: "#C1272D",
  },
  {
    id: "heroes",
    name: "Heroes",
    nameAr: "Heroes",
    description: "Field work",
    color: "#FB923C",
  },
  {
    id: "coders",
    name: "Coders",
    nameAr: "Coders",
    description: "Development",
    color: "#60A5FA",
  },
  {
    id: "enviros",
    name: "Enviros",
    nameAr: "Enviros",
    description: "Environment",
    color: "#16A34A",
  },
  {
    id: "messages",
    name: "Messages",
    nameAr: "Messages",
    description: "Media",
    color: "#A78BFA",
  },
  {
    id: "masar",
    name: "Masar",
    nameAr: "Masar",
    description: "Mentorship",
    color: "#F472B6",
  },
  {
    id: "rstc",
    name: "RSTC",
    nameAr: "RSTC",
    description: "Training",
    color: "#22D3EE",
  },
];

const COMMITTEES = [
  {
    id: "gov-helpers",
    name: "Governance Helpers",
    nameAr: "Governance Helpers",
    description: "Governance",
    color: "#151A45",
    icon: "",
    teamId: "helpers",
  },
  {
    id: "events-heroes",
    name: "Events Heroes",
    nameAr: "Events Heroes",
    description: "Events",
    color: "#C1272D",
    icon: "",
    teamId: "heroes",
  },
  {
    id: "media-messages",
    name: "Media Messages",
    nameAr: "Media Messages",
    description: "Media",
    color: "#A78BFA",
    icon: "",
    teamId: "messages",
  },
];

/* ═══════════════════════════════════════════════════════════════════════ */
async function main() {
  console.log("");
  console.log(
    " ╔══════════════════════════════════════════════════════════════╗"
  );
  console.log(
    " ║   make-test-accounts.cjs                                     ║"
  );
  console.log(
    " ╚══════════════════════════════════════════════════════════════╝"
  );
  console.log("");

  const env = loadEnv();
  const apiKey = env.VITE_FIREBASE_API_KEY;
  const projectId = env.VITE_FIREBASE_PROJECT_ID;

  if (!apiKey || !projectId) {
    console.error(
      " ❌ missing VITE_FIREBASE_API_KEY or VITE_FIREBASE_PROJECT_ID in .env"
    );
    process.exit(1);
  }

  console.log(" 🔑 Firebase project: " + projectId);
  console.log("");

  /* ─── 1. امسح الحسابات القديمة إن وُجدت ─── */
  const credsPath = path.join(ROOT, ".test-accounts.json");
  if (fs.existsSync(credsPath)) {
    console.log(" ℹ️  .test-accounts.json موجود — سنستبدله");
    fs.unlinkSync(credsPath);
  }

  /* ─── 2. اكتب الفرق واللجان ─── */
  /* لكن محتاجين idToken من HEAD الأول، فيعمل حسابات الأول وبعدين seed */

  const saved = {};

  /* ─── 3. اعمل الحسابات واحد واحد ─── */
  for (const acc of ACCOUNTS) {
    process.stdout.write(
      "   → " + acc.key.padEnd(18) + " (" + acc.email + ")  "
    );

    /* signUp */
    const signUpRes = await httpRequest(
      "POST",
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
      { email: acc.email, password: PASSWORD, returnSecureToken: true }
    );

    if (signUpRes.status !== 200) {
      const code =
        signUpRes.body && signUpRes.body.error && signUpRes.body.error.message;
      if (String(code).includes("EMAIL_EXISTS")) {
        /* موجود — سجّل دخول */
        const signInRes = await httpRequest(
          "POST",
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
          { email: acc.email, password: PASSWORD, returnSecureToken: true }
        );
        if (signInRes.status !== 200) {
          console.log("❌ signIn failed: " + JSON.stringify(signInRes.body));
          continue;
        }
        saved[acc.key] = {
          email: acc.email,
          password: PASSWORD,
          uid: signInRes.body.localId,
          idToken: signInRes.body.idToken,
        };
        console.log("✓ existing");
      } else {
        console.log("❌ " + code);
        continue;
      }
    } else {
      saved[acc.key] = {
        email: acc.email,
        password: PASSWORD,
        uid: signUpRes.body.localId,
        idToken: signUpRes.body.idToken,
      };
      console.log("✓ created");
    }
  }

  if (!saved.HEAD) {
    console.error("");
    console.error(" ❌ HEAD account was not created — cannot continue");
    process.exit(1);
  }

  /* ─── 4. اكتب users/{uid} في Firestore ─── */
  console.log("");
  console.log(" 📝 Writing user docs to Firestore…");

  const headToken = saved.HEAD.idToken;

  for (const acc of ACCOUNTS) {
    const c = saved[acc.key];
    if (!c) continue;

    const memberId = "M-" + c.uid.slice(0, 8).toUpperCase();
    const userDoc = {
      uid: c.uid,
      email: acc.email,
      displayName: acc.name,
      role: acc.role,
      teamId: acc.teamId || null,
      committeeIds: acc.committees || [],
      memberId,
      createdAt: new Date().toISOString(),
      emailVerified: true,
      mustChangePassword: false,
      status: "active",
    };

    const res = await httpRequest(
      "PATCH",
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${c.uid}?currentDocument.exists=true`,
      toFirestoreDoc(userDoc),
      { Authorization: "Bearer " + headToken }
    ).catch((e) => ({ status: 500, body: e.message }));

    /* لو فشل لأن الملف مش موجود — أنشئه */
    if (
      res.status === 404 ||
      (res.body &&
        res.body.error &&
        String(res.body.error.message).includes("not found"))
    ) {
      const createRes = await httpRequest(
        "PATCH",
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${c.uid}`,
        toFirestoreDoc(userDoc),
        { Authorization: "Bearer " + headToken }
      );
      if (createRes.status >= 400) {
        console.log(
          "   ❌ " +
            acc.key +
            ": " +
            JSON.stringify(createRes.body).slice(0, 200)
        );
      } else {
        console.log("   ✓ " + acc.key);
      }
    } else if (res.status >= 400) {
      console.log(
        "   ❌ " + acc.key + ": " + JSON.stringify(res.body).slice(0, 200)
      );
    } else {
      console.log("   ✓ " + acc.key);
    }

    /* اكتب member doc أيضاً */
    const memberDoc = {
      id: memberId,
      name: acc.name,
      role: acc.role,
      teamIds: acc.teamId ? [acc.teamId] : [],
      committeeIds: acc.committees || [],
      joinedSeason: 7,
      hours: 0,
      points: 0,
      status: "active",
      email: acc.email,
      linkedUserId: c.uid,
    };
    await httpRequest(
      "PATCH",
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/members/${memberId}`,
      toFirestoreDoc(memberDoc),
      { Authorization: "Bearer " + headToken }
    );
  }

  /* ─── 5. اكتب الفرق ─── */
  console.log("");
  console.log(" 📝 Seeding teams + committees…");

  for (const t of TEAMS) {
    await httpRequest(
      "PATCH",
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/teams/${t.id}`,
      toFirestoreDoc(t),
      { Authorization: "Bearer " + headToken }
    );
  }
  console.log("   ✓ 7 teams");

  for (const cm of COMMITTEES) {
    await httpRequest(
      "PATCH",
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/committees/${cm.id}`,
      toFirestoreDoc(cm),
      { Authorization: "Bearer " + headToken }
    );
  }
  console.log("   ✓ 3 committees");

  /* ─── 6. احفظ credentials ─── */
  fs.writeFileSync(credsPath, JSON.stringify(saved, null, 2), "utf8");

  console.log("");
  console.log(
    " ╔══════════════════════════════════════════════════════════════╗"
  );
  console.log(
    " ║   ✅ DONE                                                    ║"
  );
  console.log(
    " ╚══════════════════════════════════════════════════════════════╝"
  );
  console.log("");
  console.log(" 📄 Credentials: .test-accounts.json");
  console.log(" 🔑 Password for all: " + PASSWORD);
  console.log("");
  console.log(
    " ═══════════════════════════════════════════════════════════════"
  );
  console.log("  الحسابات الجاهزة:");
  console.log(
    " ═══════════════════════════════════════════════════════════════"
  );
  for (const acc of ACCOUNTS) {
    const c = saved[acc.key];
    if (c) console.log("   ✓ " + acc.role.padEnd(18) + " " + acc.email);
  }
  console.log("");
  console.log(" ⏭️  الخطوة القادمة: node role-test.cjs");
  console.log("");
}

main().catch((e) => {
  console.error("");
  console.error(" ❌ crash:", e.message);
  console.error(e.stack);
  process.exit(1);
});
