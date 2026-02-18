import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/settings');
        if (r.ok) setSettings(await r.json());
      } catch {}
    })();
  }, []);
  return (
    <Layout>
      <div className="p-4 space-y-3">
        <Card className="p-4">
          <div className="text-lg font-semibold">Admin Settings</div>
          <pre className="text-xs mt-2 bg-gray-50 p-2 rounded">{JSON.stringify(settings, null, 2)}</pre>
        </Card>
      </div>
    </Layout>
  );
}

