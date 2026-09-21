# Patch يدوي صغير لـ App.tsx

أضف السطر التالي مع باقي import/Admin Pages:

```tsx
import { AdminGovernancePage } from '@/pages/admin/AdminGovernancePage';
import { AdminRequestsPage } from '@/pages/admin/AdminRequestsPage';
```

وأضف داخل <Route path="/admin/*"> ... :

```tsx
<Route
  path="/admin/requests"
  element={
    <RequireAuth roles={['HEAD', 'VICE']}>
      <AdminRequestsPage />
    </RequireAuth>
  }
/>
<Route
  path="/admin/governance"
  element={
    <RequireAuth roles={['HEAD', 'VICE']}>
      <AdminGovernancePage />
    </RequireAuth>
  }
/>
```
