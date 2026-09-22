import { cx } from '@/lib/format';

   interface Tab {
     id: string;
     label: string;
     count?: number;
   }

   interface TabsProps {
     tabs: Tab[];
     active: string;
     onChange: (id: string) => void;
   }

   export function Tabs({ tabs, active, onChange }: TabsProps) {
     return (
       <div className="chips" style={{ marginBottom: 'var(--space-4)' }}>
         {tabs.map((t) => (
           <button
             key={t.id}
             type="button"
             className={cx('chip', active === t.id && 'is-active')}
             onClick={() => onChange(t.id)}
           >
             {t.label}
             {t.count !== undefined && t.count > 0 ? ' (' + t.count + ')' : ''}
           </button>
         ))}
       </div>
     );
   }
   