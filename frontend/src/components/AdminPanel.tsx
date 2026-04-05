diff --git a/frontend/src/pages/AdminPage.tsx b/frontend/src/pages/AdminPage.tsx
new file mode 100644
index 0000000000000000000000000000000000000000..c16c0a0ee2699256d02e832b617f6d3d77625e0f
--- /dev/null
+++ b/frontend/src/pages/AdminPage.tsx
@@ -0,0 +1,10 @@
+import React from 'react';
+import AdminPanel from '../components/AdminPanel';
+
+export default function AdminPage() {
+  return (
+    <div className="relative min-h-[calc(100vh-120px)]">
+      <AdminPanel />
+    </div>
+  );
+}
