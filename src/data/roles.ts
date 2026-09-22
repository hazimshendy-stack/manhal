// [auto-fix] v7 — rebuilt role hierarchy.
import type { Role } from '@/types';

export const roles: Role[] = [
  { id: 'HEAD',           name: 'Head of Sub-Branches',      nameEn: 'Head of Sub-Branches',      level: 100 },
  { id: 'VICE',           name: 'Vice Head of Sub-Branches', nameEn: 'Vice Head of Sub-Branches', level: 95  },
  { id: 'HEAD_HR_GLOBAL', name: 'Head of HRs',               nameEn: 'Head of HRs',               level: 90  },
  { id: 'PRESIDENT',      name: 'Head of Team',              nameEn: 'Head of Team',              level: 80  },
  { id: 'VICE_PRESIDENT', name: 'Vice Head of Team',         nameEn: 'Vice Head of Team',         level: 70  },
  { id: 'HR',             name: 'HR of Team',                nameEn: 'HR of Team',                level: 60  },
  { id: 'COMMITTEE_HR',   name: 'HR of Committee',           nameEn: 'HR of Committee',           level: 55  },
  { id: 'MEMBER',         name: 'Member',                    nameEn: 'Member',                    level: 50  },
  { id: 'VIEWER',         name: 'Viewer',                    nameEn: 'Viewer',                    level: 10  },
];

export const roleLabels: Record<string, string> = {
  HEAD: 'Head of Sub-Branches',
  VICE: 'Vice Head of Sub-Branches',
  HEAD_HR_GLOBAL: 'Head of HRs',
  PRESIDENT: 'Head of Team',
  VICE_PRESIDENT: 'Vice Head of Team',
  HR: 'HR of Team',
  COMMITTEE_HR: 'HR of Committee',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
};
