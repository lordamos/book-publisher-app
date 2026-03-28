# Book Publisher Pro - Integration Guide

## Overview

Book Publisher Pro integrates seamlessly with existing publishing workflows through APIs, webhooks, and cloud storage connectors. This guide covers integrating your three parallel pipelines (TypeScript, Artwork, Layout/Design) with the core Export → Publishing workflow.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Publishing Pipelines                       │
├──────────────────┬──────────────────┬──────────────────────┤
│  TypeScript      │  Artwork         │  Layout & Design     │
│  Creation        │  Creation        │  Creation            │
│  ↓               │  ↓               │  ↓                   │
│  Review          │  Review          │  Review              │
│  ↓               │  ↓               │  ↓                   │
│  Editing         │  Editing         │  Editing             │
│  ↓               │  ↓               │  ↓                   │
└──────────┬───────┴────────┬─────────┴──────────┬───────────┘
           │                │                    │
           └────────────────┼────────────────────┘
                            ↓
                    ┌──────────────────┐
                    │  Book Publisher  │
                    │      Pro         │
                    │  (Merge & Diff)  │
                    └────────┬─────────┘
                             ↓
                    ┌──────────────────┐
                    │  Export & Publish│
                    │  (PDF, EPUB, etc)│
                    └──────────────────┘
```

## Phase 1: Webhook System for Real-Time Events

### Webhook Events

Book Publisher Pro emits events at critical workflow stages:

```typescript
// Event Types
type WorkflowEvent = 
  | 'document.created'
  | 'document.updated'
  | 'document.review_started'
  | 'document.review_completed'
  | 'document.editing_started'
  | 'document.editing_completed'
  | 'document.ready_for_export'
  | 'export.started'
  | 'export.completed'
  | 'export.failed'
  | 'publish.started'
  | 'publish.completed'
  | 'publish.failed';

interface WebhookPayload {
  event: WorkflowEvent;
  timestamp: ISO8601;
  documentId: string;
  pipeline: 'typescript' | 'artwork' | 'layout_design';
  status: string;
  metadata: Record<string, any>;
  data: {
    title: string;
    version: string;
    author: string;
    lastModified: ISO8601;
    exportUrl?: string;
    publishUrl?: string;
  };
}
```

### Webhook Registration

```bash
# Register webhook endpoint
curl -X POST https://api.bookpublisher.pro/webhooks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhooks/publisher",
    "events": [
      "document.ready_for_export",
      "export.completed",
      "publish.completed"
    ],
    "active": true
  }'
```

### Webhook Verification

All webhooks include a signature header for security:

```typescript
// Verify webhook signature (Node.js)
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(signature)
  );
}

// Express middleware
app.post('/webhooks/publisher', (req, res) => {
  const signature = req.headers['x-publisher-signature'] as string;
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  handleWebhookEvent(req.body);
  res.json({ received: true });
});
```

## Phase 2: REST API for Workflow Integration

### Document Management API

```typescript
// Create document from pipeline
POST /api/documents
{
  "title": "Chapter 1: Introduction",
  "pipeline": "typescript",
  "content": "...",
  "metadata": {
    "author": "John Doe",
    "version": "1.0.0",
    "tags": ["typescript", "documentation"]
  }
}

// Response
{
  "id": "doc_123abc",
  "status": "created",
  "createdAt": "2026-03-28T12:00:00Z",
  "editUrl": "https://bookpublisher.pro/editor/doc_123abc"
}

// Get document status
GET /api/documents/{documentId}

// Update document status
PATCH /api/documents/{documentId}
{
  "status": "review_completed",
  "reviewNotes": "Ready for editing"
}

// List documents by pipeline
GET /api/documents?pipeline=typescript&status=ready_for_export
```

### Batch Operations API

```typescript
// Merge multiple documents
POST /api/batch/merge
{
  "documents": [
    { "id": "doc_typescript_1", "order": 1 },
    { "id": "doc_artwork_1", "order": 2 },
    { "id": "doc_layout_1", "order": 3 }
  ],
  "outputFormat": "pdf",
  "title": "Complete Publication"
}

// Response
{
  "batchId": "batch_456def",
  "status": "processing",
  "estimatedCompletion": "2026-03-28T12:30:00Z",
  "downloadUrl": "https://storage.bookpublisher.pro/batch_456def.pdf"
}

// Get batch status
GET /api/batch/{batchId}
```

### Export API

```typescript
// Trigger export
POST /api/documents/{documentId}/export
{
  "format": "pdf",
  "options": {
    "colorScheme": "light",
    "pageSize": "letter",
    "includeMetadata": true,
    "includeStatistics": true
  }
}

// Response
{
  "exportId": "export_789ghi",
  "status": "processing",
  "format": "pdf",
  "downloadUrl": "https://storage.bookpublisher.pro/export_789ghi.pdf",
  "expiresAt": "2026-03-29T12:00:00Z"
}

// Get export status
GET /api/exports/{exportId}
```

## Phase 3: Cloud Storage Integration

### S3/Cloud Storage Sync

```typescript
// Configure storage sync
POST /api/integrations/storage
{
  "provider": "s3",
  "bucket": "my-publishing-bucket",
  "accessKeyId": "AKIA...",
  "secretAccessKey": "...",
  "syncEvents": [
    "export.completed",
    "publish.completed"
  ],
  "pathTemplate": "/{pipeline}/{documentId}/{version}/{format}"
}

// Response
{
  "integrationId": "storage_001",
  "status": "connected",
  "lastSync": "2026-03-28T12:00:00Z"
}
```

### Automatic Export Sync

When documents complete export, they automatically sync to:
- `typescript/doc_123/v1.0/document.pdf`
- `artwork/doc_456/v1.0/design.pdf`
- `layout_design/doc_789/v1.0/layout.pdf`

## Phase 4: Zapier/Make Integration

### Zapier Setup

1. **Trigger:** Book Publisher Pro webhook event
2. **Action:** Update project management tool

```
Trigger: Document ready for export
  ↓
Action: Create Asana task
  - Task name: "Export {documentTitle}"
  - Assignee: Project manager
  - Due date: Tomorrow
  - Custom fields: Pipeline, Document ID
```

### Make (formerly Integromat) Workflow

```
Webhook: export.completed
  ↓
Send email notification
  ↓
Update Google Sheets
  ↓
Upload to cloud storage
  ↓
Post to Slack channel
```

## Phase 5: Custom Workflow Examples

### Example 1: TypeScript Pipeline → PDF Export → Email

```typescript
// Webhook handler
app.post('/webhooks/typescript-complete', async (req, res) => {
  const { documentId, title } = req.body.data;
  
  // Trigger PDF export
  const exportResponse = await fetch(
    `https://api.bookpublisher.pro/documents/${documentId}/export`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({ format: 'pdf' })
    }
  );
  
  const { downloadUrl } = await exportResponse.json();
  
  // Send email with PDF
  await sendEmail({
    to: 'team@example.com',
    subject: `${title} - Ready for Review`,
    attachmentUrl: downloadUrl
  });
  
  res.json({ processed: true });
});
```

### Example 2: Multi-Pipeline Merge → Publish

```typescript
// Merge all pipelines when ready
async function publishCompleteBook() {
  // Get latest documents from each pipeline
  const typescript = await getLatestDocument('typescript');
  const artwork = await getLatestDocument('artwork');
  const layout = await getLatestDocument('layout_design');
  
  // Merge documents
  const mergeResponse = await fetch(
    'https://api.bookpublisher.pro/batch/merge',
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({
        documents: [
          { id: typescript.id, order: 1 },
          { id: artwork.id, order: 2 },
          { id: layout.id, order: 3 }
        ],
        outputFormat: 'pdf',
        title: 'Complete Publication'
      })
    }
  );
  
  const { batchId, downloadUrl } = await mergeResponse.json();
  
  // Publish to distribution platforms
  await publishToKDP(downloadUrl);
  await publishToIngramSpark(downloadUrl);
  
  // Notify team
  await notifyTeam(`Publication complete: ${downloadUrl}`);
}
```

### Example 3: Automated Review Workflow

```typescript
// Trigger review notifications
app.post('/webhooks/document-ready-review', async (req, res) => {
  const { documentId, pipeline, title } = req.body.data;
  
  // Create review task in project management
  const task = await createAsanaTask({
    name: `Review: ${title} (${pipeline})`,
    assignee: getReviewerForPipeline(pipeline),
    dueDate: addDays(new Date(), 2),
    customFields: {
      'Document ID': documentId,
      'Pipeline': pipeline,
      'Edit URL': `https://bookpublisher.pro/editor/${documentId}`
    }
  });
  
  // Send Slack notification
  await slack.send({
    channel: '#publishing',
    text: `📋 New review needed: ${title}`,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*${title}*\nPipeline: ${pipeline}` }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Review Document' },
            url: `https://bookpublisher.pro/editor/${documentId}`
          }
        ]
      }
    ]
  });
  
  res.json({ taskCreated: task.id });
});
```

## API Authentication

### API Key Management

```bash
# Generate API key
curl -X POST https://api.bookpublisher.pro/auth/keys \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{"name": "Integration Key"}'

# Response
{
  "keyId": "key_123",
  "secret": "sk_live_...",
  "created": "2026-03-28T12:00:00Z"
}

# Use in requests
curl -H "Authorization: Bearer sk_live_..." \
  https://api.bookpublisher.pro/documents
```

### Rate Limiting

- **Standard:** 1,000 requests/hour
- **Batch operations:** 100 concurrent jobs
- **Webhooks:** Retry up to 5 times with exponential backoff

## Error Handling

```typescript
interface APIError {
  code: string;
  message: string;
  details: Record<string, any>;
  retryable: boolean;
}

// Error codes
enum ErrorCode {
  INVALID_REQUEST = 'invalid_request',
  AUTHENTICATION_FAILED = 'auth_failed',
  RATE_LIMIT_EXCEEDED = 'rate_limit',
  DOCUMENT_NOT_FOUND = 'not_found',
  EXPORT_FAILED = 'export_failed',
  STORAGE_ERROR = 'storage_error'
}

// Retry logic
async function callAPIWithRetry(
  fn: () => Promise<any>,
  maxRetries: number = 3
): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (!error.retryable || i === maxRetries - 1) throw error;
      await delay(Math.pow(2, i) * 1000); // Exponential backoff
    }
  }
}
```

## Monitoring and Logging

### Integration Health Dashboard

```typescript
// Monitor webhook deliveries
GET /api/webhooks/deliveries?status=failed&limit=10

// Response
{
  "deliveries": [
    {
      "id": "del_123",
      "webhookId": "wh_456",
      "event": "export.completed",
      "status": "failed",
      "statusCode": 500,
      "retries": 3,
      "nextRetry": "2026-03-28T13:00:00Z",
      "error": "Connection timeout"
    }
  ]
}

// Webhook logs
GET /api/webhooks/{webhookId}/logs?limit=50
```

### Integration Metrics

```typescript
// Get integration statistics
GET /api/integrations/stats

{
  "webhooks": {
    "total": 5,
    "active": 4,
    "deliveryRate": 0.98,
    "averageLatency": 245
  },
  "exports": {
    "total": 1250,
    "successful": 1200,
    "failed": 50,
    "averageTime": 3200
  },
  "storage": {
    "provider": "s3",
    "totalSynced": 450,
    "lastSync": "2026-03-28T12:00:00Z"
  }
}
```

## Security Best Practices

1. **API Keys:** Store securely in environment variables, never commit to git
2. **Webhook Signatures:** Always verify signatures before processing
3. **HTTPS Only:** All API calls must use HTTPS
4. **Rate Limiting:** Implement client-side rate limiting
5. **Audit Logging:** Log all API calls and webhook deliveries
6. **Access Control:** Use role-based permissions for API keys
7. **Encryption:** Encrypt sensitive data in transit and at rest

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Webhook not received | Check endpoint URL, verify firewall allows inbound traffic |
| Export fails | Check document format, verify storage permissions |
| API rate limit | Implement exponential backoff, request higher limits |
| Signature verification fails | Verify webhook secret, check timestamp |
| Storage sync not working | Verify cloud credentials, check IAM permissions |

## Support

- **Documentation:** https://docs.bookpublisher.pro
- **API Reference:** https://api.bookpublisher.pro/docs
- **Status Page:** https://status.bookpublisher.pro
- **Support Email:** support@bookpublisher.pro
- **Slack Community:** https://slack.bookpublisher.pro

## Next Steps

1. Generate API keys for your integrations
2. Register webhook endpoints
3. Set up cloud storage sync
4. Create custom workflows for your pipelines
5. Monitor integration health dashboard
6. Iterate based on team feedback
