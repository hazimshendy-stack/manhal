import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { notifyUser, notifyUsers } from '@/lib/notifications';
   import { logAudit } from '@/lib/audit';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { FormField, TextInput, TextArea, Select } from '@/components/ui/FormField';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Badge } from '@/components/ui/Badge';
   import { toast } from '@/components/ui/Toast';
   import { relativeTime } from '@/lib/format';
   import type { AppUser, Notification } from '@/types';

   export function AdminNotificationsPage() {
     const { user: me } = useAuth();
     const { data: users } = useCollection<AppUser>('users');
     const { data: notifs, loading } = useCollection<Notification>('notifications');

     const [target, setTarget] = useState<string>('all');
     const [title, setTitle] = useState('');
     const [message, setMessage] = useState('');
     const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
     const [busy, setBusy] = useState(false);

     const send = async () => {
       if (!title.trim() || !message.trim()) {
         toast.error('العنوان والرسالة مطلوبان');
         return;
       }
       setBusy(true);
       try {
         if (target === 'all') {
           await notifyUsers(
             users,
             title.trim(),
             message.trim(),
             'system',
             undefined,
             priority,
             me?.displayName,
           );
         } else if (target === 'managers') {
           const managers = users.filter((u) =>
             ['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR'].includes(u.role),
           );
           await notifyUsers(
             managers,
             title.trim(),
             message.trim(),
             'system',
             undefined,
             priority,
             me?.displayName,
           );
         } else {
           const u = users.find((x) => x.uid === target);
           await notifyUser(
             target,
             title.trim(),
             message.trim(),
             'system',
             undefined,
             priority,
             me?.displayName,
           );
           if (!u) {
             toast.error('المستخدم غير موجود');
             return;
           }
         }
         await logAudit(me, 'SEND_NOTIFICATION', 'Notification', target, title);
         setTitle('');
         setMessage('');
         toast.success('تم الإرسال');
       } catch {
         toast.error('فشل الإرسال');
       } finally {
         setBusy(false);
       }
     };

     const sorted = [...notifs]
       .sort((a, b) => (a.date < b.date ? 1 : -1))
       .slice(0, 30);

     return (
       <div>
         <PageHeader
           eyebrow="إدارة"
           title="إرسال إشعار"
           description="إرسال إشعارات فورية للأعضاء والمدراء."
         />

         <SectionHeader eyebrow="إرسال" title="إشعار جديد" />
         <div className="card no-click" style={{ maxWidth: 720 }}>
           <FormField label="المستقبل" required>
             <Select
               value={target}
               onChange={setTarget}
               options={[
                 { value: 'all', label: 'الجميع' },
                 { value: 'managers', label: 'المدراء فقط (Head/Vice/HR)' },
                 ...users.map((u) => ({
                   value: u.uid,
                   label: u.displayName + ' (' + u.email + ')',
                 })),
               ]}
             />
           </FormField>

           <FormField label="العنوان" required>
             <TextInput value={title} onChange={setTitle} />
           </FormField>

           <FormField label="الرسالة" required>
             <TextArea value={message} onChange={setMessage} rows={4} />
           </FormField>

           <FormField label="الأولوية">
             <Select
               value={priority}
               onChange={(v) => setPriority(v as 'low' | 'normal' | 'high')}
               options={[
                 { value: 'low', label: 'منخفضة' },
                 { value: 'normal', label: 'عادية' },
                 { value: 'high', label: 'مرتفعة' },
               ]}
             />
           </FormField>

           <button
             type="button"
             className="btn btn--primary btn--block"
             onClick={send}
             disabled={busy}
           >
             {busy ? '...' : 'إرسال الإشعار'}
           </button>
         </div>

         <SectionHeader
           eyebrow="السجل"
           title={'آخر الإشعارات (' + notifs.length + ')'}
         />

         {loading ? (
           <SkeletonList count={6} />
         ) : sorted.length === 0 ? (
           <EmptyState
             icon="🔔"
             title="لا إشعارات"
             message="لم يتم إرسال أي إشعارات بعد."
           />
         ) : (
           <div className="stack">
             {sorted.map((n) => (
               <div key={n.id} className="card no-click">
                 <div className="row row--between">
                   <div style={{ flex: 1, minWidth: 0 }}>
                     <div className="card__title">{n.title}</div>
                     <div className="card__meta">{n.message}</div>
                   </div>
                   {!n.read ? (
                     <Badge variant="red">جديد</Badge>
                   ) : (
                     <Badge variant="success">مقروء</Badge>
                   )}
                 </div>
                 <div className="tiny muted mt-2">
                   {relativeTime(n.date)}
                 </div>
               </div>
             ))}
           </div>
         )}
       </div>
     );
   }
   