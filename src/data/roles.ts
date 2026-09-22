import type { Role } from '@/types';

export const roles: Role[] = [
  { id: 'HEAD', name: 'Head', nameEn: 'Head', level: 100 },
  { id: 'VICE', name: 'Vice Head', nameEn: 'Vice Head', level: 95 },
  { id: 'HEAD_HR', name: 'Head of HR', nameEn: 'Head of HR', level: 90 },
  { id: 'PRESIDENT', name: 'Team President', nameEn: 'Team President', level: 80 },
  { id: 'VICE_PRESIDENT', name: 'Vice President', nameEn: 'Vice President', level: 70 },
  { id: 'HR', name: 'HR', nameEn: 'HR', level: 60 },
  { id: 'MEMBER', name: 'Member', nameEn: 'Member', level: 50 },
  { id: 'VIEWER', name: 'Viewer', nameEn: 'Viewer', level: 10 },
];

export const roleLabels: Record<string, string> = {
  HEAD: 'Head', VICE: 'Vice Head', HEAD_HR: 'Head of HR', PRESIDENT: 'Team President', VICE_PRESIDENT: 'Vice President', HR: 'HR', MEMBER: 'Member', VIEWER: 'Viewer',
};