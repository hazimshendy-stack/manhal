import type { Role } from '@/types';

 export const roles: Role[] = [
   { id: 'HEAD',           name: 'رئيس الفروع',         nameEn: 'Head',                 level: 100 },
   { id: 'VICE',           name: 'نائب رئيس الفروع',     nameEn: 'Vice',                 level: 95  },
   { id: 'HEAD_HR',        name: 'رئيس الموارد البشرية', nameEn: 'Head of HR',           level: 90  },
   { id: 'PRESIDENT',      name: 'رئيس فريق',            nameEn: 'Team President',       level: 80  },
   { id: 'VICE_PRESIDENT', name: 'نائب رئيس فريق',       nameEn: 'Team Vice President',  level: 70  },
   { id: 'HR',             name: 'موارد بشرية',          nameEn: 'HR',                   level: 60  },
   { id: 'MEMBER',         name: 'عضو',                  nameEn: 'Member',               level: 50  },
   { id: 'VIEWER',         name: 'زائر',                 nameEn: 'Viewer',               level: 10  },
 ];

 export const roleLabels: Record<string, string> = {
   HEAD: 'رئيس الفروع',
   VICE: 'نائب رئيس الفروع',
   HEAD_HR: 'رئيس الموارد البشرية',
   PRESIDENT: 'رئيس فريق',
   VICE_PRESIDENT: 'نائب رئيس فريق',
   HR: 'موارد بشرية',
   MEMBER: 'عضو',
   VIEWER: 'زائر',
 };
 