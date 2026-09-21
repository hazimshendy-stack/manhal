#!/usr/bin/env node
/**
 * fix.cjs v2 — يحل أخطاء useCollection + Type inference
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = __dirname;
const files = {};

/* ═══════════════════════════════════════════════════════════════
   الحل الجذري: أضف useCollection كـ alias في useRealtimeCollection
   ═══════════════════════════════════════════════════════════════ */

files[
  "src/lib/useRealtimeCollection.ts"
] = `import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  query,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Hook للاستماع الحقيقي (Real-time) لمجموعة Firestore
 * يستخدم onSnapshot ليتحدث فورًا عند أي تغيير
 */
export function useRealtimeCollection<T>(
  collectionName: string,
): { data: T[]; loading: boolean } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, collectionName));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map(
          (d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() }),
        ) as T[];
        setData(items);
        setLoading(false);
      },
      () => {
        setData([]);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [collectionName]);

  return { data, loading };
}

/**
 * Alias للتوافق الخلفي — استخدام useCollection يعمل بنفس الطريقة
 */
export const useCollection = useRealtimeCollection;
`;

/* ═══════════════════════════════════════════════════════════════
   إعادة كتابة الملفات التي بها أخطاء Type inference
   ═══════════════════════════════════════════════════════════════ */

files["src/pages/ApprovalsPage.tsx"] = `import { Link } from 'react-router-dom';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { canApproveStep, ROLE_LABEL } from '@/lib/permissions';
import { teams } from '@/data/teams';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import type { ApprovalStep, RequestRecord } from '@/types';

export function ApprovalsPage() {
  const { user } = useAuth();
  const { data: approvals, loading } = useRealtimeCollection<ApprovalStep>('approvals');
  const { data: requests } = useRealtimeCollection<RequestRecord>('requests');

  if (!user) return null;

  const myPending: ApprovalStep[] = approvals.filter(
    (a: ApprovalStep) => a.status === 'PENDING' && canApproveStep(user, a),
  );

  const done: ApprovalStep[] = approvals
    .filter((a: ApprovalStep) => a.status !== 'PENDING')
    .filter((a: ApprovalStep) => a.approverUid === user.uid)
    .sort((a: ApprovalStep, b: ApprovalStep) => {
      if (!a.actionDate || !b.actionDate) return 0;
      return a.actionDate < b.actionDate ? 1 : -1;
    })
    .slice(0, 15);

  const reqOf = (id: string): RequestRecord | undefined =>
    requests.find((r: RequestRecord) => r.id === id);

  const renderStep = (a: ApprovalStep) => {
    const req = reqOf(a.requestId);
    const teamName = a.requiredTeamId
      ? teams.find((t) => t.id === a.requiredTeamId)?.name
      : null;
    return (
      <Link key={a.id} to={'/requests/' + a.requestId} className="card">
        <div className="row row--between">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="card__title">{req?.title ?? a.requestId}</div>
            <div className="card__meta">
              {ROLE_LABEL[a.requiredRole]}
              {teamName ? ' — ' + teamName : ''}
              {' · مرحلة ' + a.order}
            </div>
          </div>
          <Badge variant="warning" dot>
            بانتظارك
          </Badge>
        </div>
      </Link>
    );
  };

  return (
    <div className="container">
      <PageHeader
        eyebrow="سير العمل"
        title="الموافقات"
        description="المراحل التي تنتظر قرارك."
      />

      <section className="section">
        <SectionHeader
          eyebrow="بانتظارك"
          title={'موافقاتك (' + myPending.length + ')'}
        />
        {loading ? (
          <SkeletonList count={3} />
        ) : myPending.length === 0 ? (
          <EmptyState
            icon="✅"
            title="لا شيء بانتظارك"
            message="جميع الموافقات المطلوبة منك تم إنجازها."
          />
        ) : (
          <div className="stack">{myPending.map(renderStep)}</div>
        )}
      </section>

      {done.length > 0 ? (
        <section className="section">
          <SectionHeader eyebrow="منتهية" title="قراراتك السابقة" />
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>الطلب</th>
                  <th>المرحلة</th>
                  <th>الحالة</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {done.map((a: ApprovalStep) => (
                  <tr key={a.id}>
                    <td data-label="الطلب">
                      <Link to={'/requests/' + a.requestId}>{a.requestId}</Link>
                    </td>
                    <td data-label="المرحلة">{a.order}</td>
                    <td data-label="الحالة">
                      {a.status === 'APPROVED' ? (
                        <Badge variant="success">موافق</Badge>
                      ) : a.status === 'REJECTED' ? (
                        <Badge variant="danger">مرفوض</Badge>
                      ) : (
                        <Badge variant="neutral">تم تخطيه</Badge>
                      )}
                    </td>
                    <td className="muted small" data-label="التاريخ">
                      {a.actionDate ? formatDate(a.actionDate) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
`;

files[
  "src/pages/AchievementsPage.tsx"
] = `import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { AchievementCard } from '@/components/achievement/AchievementCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Loading';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Stat, StatRow } from '@/components/ui/Stat';
import type { Achievement } from '@/types';

export function AchievementsPage() {
  const { data, loading } = useRealtimeCollection<Achievement>('achievements');

  const branchCount = data.filter((a: Achievement) => a.level === 'branch').length;
  const nationalCount = data.filter((a: Achievement) => a.level === 'national').length;
  const internationalCount = data.filter((a: Achievement) => a.level === 'international').length;

  const sorted: Achievement[] = [...data].sort((a: Achievement, b: Achievement) =>
    a.date < b.date ? 1 : -1,
  );

  return (
    <div className="container">
      <PageHeader
        eyebrow="الإنجازات"
        title="تكريمات المنظمة"
        description="كل ما حققته المنظمة على مستوى الفرع، الدولة، والعالم."
      />

      <section className="section--tight">
        <StatRow>
          <Stat value={branchCount} label="مستوى الفرع" />
          <Stat value={nationalCount} label="مستوى وطني" />
          <Stat value={internationalCount} label="مستوى دولي" />
        </StatRow>
      </section>

      <section className="section">
        <SectionHeader eyebrow="القائمة" title="كل الإنجازات" />
        {loading ? (
          <div className="stack">
            <SkeletonCard count={4} />
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon="🏆"
            title="لا إنجازات بعد"
            message="لم يتم تسجيل أي إنجازات حتى الآن."
          />
        ) : (
          <div className="stack">
            {sorted.map((a: Achievement) => (
              <AchievementCard key={a.id} achievement={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
`;

/* ═══════════════════════════════════════════════════════════════
   WRITE + GIT
   ═══════════════════════════════════════════════════════════════ */

function run(cmd) {
  try {
    execSync(cmd, { stdio: "inherit", cwd: ROOT, shell: true });
    return true;
  } catch {
    return false;
  }
}

console.log("");
console.log("  ═══════════════════════════════════════════════════");
console.log("  fix.cjs v2 — إصلاح useCollection + Type errors");
console.log("  ═══════════════════════════════════════════════════");
console.log("");

let written = 0;
for (const [rel, content] of Object.entries(files)) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, "utf8");
  console.log("  ✓ " + rel);
  written += 1;
}

console.log("");
console.log("  Files written: " + written);
console.log("");

if (!fs.existsSync(path.join(ROOT, ".git"))) {
  console.log("  ⚠️  لا يوجد .git — شغّل git init يدويًا");
  process.exit(0);
}

console.log("  📦 Git add...");
run("git add .");

console.log("  💾 Git commit...");
const committed = run(
  'git commit -m "fix: useCollection alias + explicit types"'
);

if (!committed) {
  console.log("  ℹ️  لا تغييرات جديدة للـ commit");
}

console.log("  🚀 Git push...");
const pushed = run("git push origin main --force");

console.log("");
if (pushed) {
  console.log("  ═══════════════════════════════════════════════════");
  console.log("  ✅ تم! GitHub Actions سيبدأ البناء الآن");
  console.log("  ═══════════════════════════════════════════════════");
  console.log("");
  console.log("  راقب: https://github.com/hazimshendy-stack/ngg/actions");
} else {
  console.log("  ❌ فشل الـ push. جرّب:");
  console.log("    git push origin main --force");
}
console.log("");
