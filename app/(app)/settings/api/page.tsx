export default function SettingsApiPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">API & Integrations</h1>
      <div className="rounded-card bg-white border border-neutral-200 p-6 shadow-sm space-y-4">
        <p className="text-neutral-600">
          InvoiceFlow exposes REST APIs for invoices, clients, templates, reports, and chat. All endpoints require an active session cookie.
        </p>
        <h2 className="font-semibold text-neutral-900">Data retrieval &amp; manipulation</h2>
        <ul className="text-sm text-neutral-600 list-disc list-inside space-y-1">
          <li><strong>Invoices:</strong> GET/POST /api/invoices, GET/PUT /api/invoices/[id], GET /api/invoices/[id]/export?format=csv</li>
          <li><strong>Clients:</strong> GET/POST /api/clients, GET/PUT/DELETE /api/clients/[id]</li>
          <li><strong>Templates:</strong> GET/POST /api/templates, GET/PUT/DELETE /api/templates/[id]</li>
          <li><strong>Reports (INR):</strong> GET /api/reports/revenue, /api/reports/outstanding, /api/reports/clients — add ?format=csv to download</li>
          <li><strong>Chat (RAG Q&amp;A):</strong> POST /api/chat with body {`{ "message": "question" }`}</li>
        </ul>
        <p className="text-sm text-neutral-500">
          Full API documentation is in <code className="bg-neutral-100 px-1 rounded">docs/API.md</code> in the project repository.
        </p>
      </div>
    </div>
  );
}
