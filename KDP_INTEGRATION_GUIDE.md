# Book Publisher Pro - Amazon KDP Integration Guide

## Overview

This guide covers integrating Book Publisher Pro with Amazon Kindle Direct Publishing (KDP) for automated book uploads, metadata management, and publishing workflows.

## Architecture

```
Book Publisher Pro
    ↓
[TypeScript + Artwork + Layout]
    ↓
[Merge & Export]
    ↓
[Format Conversion]
    ├─→ PDF (Print)
    ├─→ EPUB (Ebook)
    └─→ MOBI (Kindle)
    ↓
[KDP API]
    ├─→ Upload to KDP
    ├─→ Set Metadata
    ├─→ Configure Pricing
    └─→ Publish
    ↓
[Amazon KDP Dashboard]
```

## Step 1: KDP Account Setup

### Prerequisites

1. **Amazon KDP Account** - https://kdp.amazon.com
2. **KDP API Access** - Request from KDP support
3. **Book Details:**
   - ISBN (optional for KDP Select, required for expanded distribution)
   - Book title and subtitle
   - Description (4,000 character limit)
   - Author name
   - Category and keywords
   - Cover image (JPEG/PNG, 1000x1600px minimum)

### API Credentials

```bash
# Store these securely in environment variables
export KDP_CLIENT_ID="your_client_id"
export KDP_CLIENT_SECRET="your_client_secret"
export KDP_SELLER_ID="your_seller_id"
```

## Step 2: Export Formats for KDP

### PDF Format (Print Books)

```typescript
// Export configuration for KDP Print
POST /api/documents/{documentId}/export
{
  "format": "pdf",
  "options": {
    "pageSize": "letter",  // or "a4"
    "colorMode": "cmyk",   // For color books
    "bleed": 0.125,        // 1/8 inch bleed
    "margin": 0.5,         // 0.5 inch margins
    "compression": "high",
    "includeMetadata": true,
    "metadata": {
      "title": "My Book Title",
      "author": "Author Name",
      "subject": "Fiction",
      "keywords": "fiction, adventure, fantasy"
    }
  }
}

// Response
{
  "exportId": "export_kdp_pdf_001",
  "format": "pdf",
  "status": "completed",
  "downloadUrl": "https://storage.bookpublisher.pro/kdp_print.pdf",
  "fileSize": "25.4 MB",
  "pageCount": 320,
  "validationStatus": "passed",
  "validationDetails": {
    "colorSpace": "cmyk",
    "resolution": "300dpi",
    "fonts": "embedded",
    "bleed": "correct"
  }
}
```

### EPUB Format (Ebook)

```typescript
// Export configuration for KDP Ebook
POST /api/documents/{documentId}/export
{
  "format": "epub",
  "options": {
    "epubVersion": "3.0",
    "fontSize": "responsive",
    "fontFamily": "serif",
    "lineHeight": 1.5,
    "includeTableOfContents": true,
    "includeMetadata": true,
    "metadata": {
      "title": "My Book Title",
      "author": "Author Name",
      "publisher": "Your Publisher Name",
      "language": "en",
      "isbn": "978-1234567890",
      "description": "Book description...",
      "keywords": ["fiction", "adventure"]
    }
  }
}

// Response
{
  "exportId": "export_kdp_epub_001",
  "format": "epub",
  "status": "completed",
  "downloadUrl": "https://storage.bookpublisher.pro/kdp_ebook.epub",
  "fileSize": "2.3 MB",
  "validationStatus": "passed",
  "validationDetails": {
    "epubVersion": "3.0",
    "toc": "generated",
    "images": "optimized",
    "fonts": "embedded"
  }
}
```

### MOBI Format (Kindle Legacy)

```typescript
// Export configuration for MOBI (optional, for legacy Kindle devices)
POST /api/documents/{documentId}/export
{
  "format": "mobi",
  "options": {
    "fontSize": "responsive",
    "includeMetadata": true,
    "metadata": {
      "title": "My Book Title",
      "author": "Author Name",
      "asin": "B0XXXXXXXXX"  // Will be assigned by KDP
    }
  }
}
```

## Step 3: KDP Publishing API Integration

### Authentication

```typescript
import axios from 'axios';

class KDPClient {
  private accessToken: string;
  private clientId: string;
  private clientSecret: string;
  private sellerId: string;

  constructor() {
    this.clientId = process.env.KDP_CLIENT_ID;
    this.clientSecret = process.env.KDP_CLIENT_SECRET;
    this.sellerId = process.env.KDP_SELLER_ID;
  }

  async authenticate(): Promise<void> {
    const response = await axios.post(
      'https://api.amazon.com/auth/o2/token',
      {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: 'kdp::publishing'
      }
    );

    this.accessToken = response.data.access_token;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'X-Seller-ID': this.sellerId
    };
  }

  async uploadBook(bookData: KDPBookData): Promise<string> {
    const response = await axios.post(
      'https://kdp-api.amazon.com/v1/books',
      bookData,
      { headers: this.getHeaders() }
    );

    return response.data.asin;
  }

  async updateBookMetadata(asin: string, metadata: KDPMetadata): Promise<void> {
    await axios.patch(
      `https://kdp-api.amazon.com/v1/books/${asin}`,
      metadata,
      { headers: this.getHeaders() }
    );
  }

  async publishBook(asin: string): Promise<void> {
    await axios.post(
      `https://kdp-api.amazon.com/v1/books/${asin}/publish`,
      {},
      { headers: this.getHeaders() }
    );
  }
}
```

### Upload Book to KDP

```typescript
interface KDPBookData {
  title: string;
  subtitle?: string;
  description: string;
  author: string;
  publisher?: string;
  isbn?: string;
  language: string;
  category: string;
  keywords: string[];
  coverImageUrl: string;
  manuscriptUrl: string;  // PDF for print, EPUB for ebook
  publicationDate?: string;
}

async function uploadToKDP(
  documentId: string,
  bookMetadata: KDPBookData
): Promise<string> {
  const kdp = new KDPClient();
  await kdp.authenticate();

  // Export document to EPUB format
  const epubExport = await exportDocument(documentId, 'epub');
  const pdfExport = await exportDocument(documentId, 'pdf');

  // Upload ebook version
  const ebookData: KDPBookData = {
    ...bookMetadata,
    manuscriptUrl: epubExport.downloadUrl,
    format: 'epub'
  };

  const asin = await kdp.uploadBook(ebookData);

  // Upload print version
  const printData: KDPBookData = {
    ...bookMetadata,
    manuscriptUrl: pdfExport.downloadUrl,
    format: 'pdf',
    isbn: bookMetadata.isbn
  };

  await kdp.uploadBook(printData);

  return asin;
}
```

## Step 4: Metadata Management

### Book Metadata Structure

```typescript
interface KDPMetadata {
  // Basic Information
  title: string;
  subtitle?: string;
  author: string;
  publisher?: string;
  description: string;

  // Publishing Details
  isbn?: string;
  language: 'en' | 'es' | 'fr' | 'de' | 'it' | 'ja' | 'pt' | 'zh';
  publicationDate?: string;
  edition?: string;

  // Categorization
  category: string;
  subcategories?: string[];
  keywords: string[];
  bisacSubject?: string;

  // Pricing & Distribution
  pricing: {
    royaltyPercentage: 35 | 70;  // KDP Select options
    currency: 'USD' | 'GBP' | 'EUR';
    basePrice: number;
    regionalPrices?: Record<string, number>;
  };

  // Rights & Availability
  kdpSelect: boolean;
  exclusiveDistribution: boolean;
  expandedDistribution: boolean;
  audiobook?: boolean;

  // Cover & Design
  coverImageUrl: string;
  blurbText: string;
  authorBio?: string;
  authorPhoto?: string;
}

// Example metadata
const bookMetadata: KDPMetadata = {
  title: 'The Art of Publishing',
  subtitle: 'A Complete Guide to Modern Publishing',
  author: 'Jane Smith',
  publisher: 'Smith Publishing',
  description: 'Learn everything about modern publishing workflows...',
  isbn: '978-1234567890',
  language: 'en',
  publicationDate: '2026-04-01',
  category: 'Fiction > Science Fiction',
  subcategories: ['Science Fiction', 'Adventure'],
  keywords: ['publishing', 'fiction', 'science fiction'],
  pricing: {
    royaltyPercentage: 70,
    currency: 'USD',
    basePrice: 9.99,
    regionalPrices: {
      'GB': 7.99,
      'DE': 8.99
    }
  },
  kdpSelect: true,
  exclusiveDistribution: true,
  expandedDistribution: false,
  coverImageUrl: 'https://storage.bookpublisher.pro/cover.jpg',
  blurbText: 'A compelling story...',
  authorBio: 'Jane Smith is an author...'
};
```

## Step 5: Automated Publishing Workflow

### Complete Workflow Example

```typescript
interface PublishingJob {
  id: string;
  documentId: string;
  metadata: KDPMetadata;
  status: 'pending' | 'exporting' | 'uploading' | 'published' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

async function publishToKDP(job: PublishingJob): Promise<void> {
  try {
    // Step 1: Update job status
    updateJobStatus(job.id, 'exporting');

    // Step 2: Export document in multiple formats
    console.log('Exporting document...');
    const [epubExport, pdfExport, coverImage] = await Promise.all([
      exportDocument(job.documentId, 'epub', {
        includeMetadata: true,
        metadata: job.metadata
      }),
      exportDocument(job.documentId, 'pdf', {
        pageSize: 'letter',
        colorMode: 'cmyk',
        bleed: 0.125
      }),
      generateCoverImage(job.metadata)
    ]);

    // Step 3: Upload to KDP
    updateJobStatus(job.id, 'uploading');
    console.log('Uploading to KDP...');

    const kdp = new KDPClient();
    await kdp.authenticate();

    // Upload ebook
    const ebookAsin = await kdp.uploadBook({
      ...job.metadata,
      manuscriptUrl: epubExport.downloadUrl,
      coverImageUrl: coverImage.url,
      format: 'epub'
    });

    // Upload print version
    const printAsin = await kdp.uploadBook({
      ...job.metadata,
      manuscriptUrl: pdfExport.downloadUrl,
      coverImageUrl: coverImage.url,
      format: 'pdf',
      isbn: job.metadata.isbn
    });

    // Step 4: Configure pricing and distribution
    await kdp.updateBookMetadata(ebookAsin, {
      pricing: job.metadata.pricing,
      kdpSelect: job.metadata.kdpSelect,
      expandedDistribution: job.metadata.expandedDistribution
    });

    // Step 5: Publish
    console.log('Publishing...');
    await kdp.publishBook(ebookAsin);
    await kdp.publishBook(printAsin);

    // Step 6: Update job status
    updateJobStatus(job.id, 'published');

    // Step 7: Send notifications
    await notifyTeam({
      title: 'Book Published to KDP',
      message: `${job.metadata.title} is now available on Amazon KDP`,
      details: {
        ebookAsin,
        printAsin,
        kdpUrl: `https://www.amazon.com/dp/${ebookAsin}`
      }
    });

  } catch (error) {
    console.error('Publishing failed:', error);
    updateJobStatus(job.id, 'failed', error.message);
    await notifyTeam({
      title: 'KDP Publishing Failed',
      message: `Failed to publish ${job.metadata.title}: ${error.message}`
    });
  }
}
```

### Webhook Integration

```typescript
// Listen for export completion and trigger KDP publishing
app.post('/webhooks/export-completed', async (req, res) => {
  const { documentId, exportId } = req.body.data;

  // Get document metadata
  const document = await getDocument(documentId);
  const metadata = document.kdpMetadata;

  // Create publishing job
  const job = await createPublishingJob({
    documentId,
    metadata,
    status: 'pending'
  });

  // Trigger async publishing
  publishToKDP(job).catch(error => {
    console.error('Async publishing error:', error);
  });

  res.json({ jobId: job.id });
});
```

## Step 6: Monitoring & Updates

### Track Publishing Status

```typescript
async function getPublishingStatus(jobId: string): Promise<PublishingJob> {
  const job = await getJob(jobId);
  
  if (job.status === 'published') {
    const kdp = new KDPClient();
    await kdp.authenticate();
    
    // Get live status from KDP
    const ebookStatus = await kdp.getBookStatus(job.ebookAsin);
    const printStatus = await kdp.getBookStatus(job.printAsin);
    
    return {
      ...job,
      kdpStatus: {
        ebook: ebookStatus,
        print: printStatus
      }
    };
  }
  
  return job;
}

// Response example
{
  "id": "job_123",
  "documentId": "doc_456",
  "status": "published",
  "ebookAsin": "B0XXXXXXXXX",
  "printAsin": "B0YYYYYYYYY",
  "kdpStatus": {
    "ebook": {
      "status": "LIVE",
      "availableOn": ["US", "UK", "DE", "FR", "JP"],
      "price": 9.99,
      "royalty": 70,
      "salesRank": 45230
    },
    "print": {
      "status": "LIVE",
      "availableOn": ["US", "UK", "DE", "FR"],
      "price": 14.99,
      "royalty": 40
    }
  }
}
```

### Update Book After Publication

```typescript
async function updatePublishedBook(
  asin: string,
  updates: Partial<KDPMetadata>
): Promise<void> {
  const kdp = new KDPClient();
  await kdp.authenticate();

  // Update metadata
  await kdp.updateBookMetadata(asin, updates);

  // Log update
  await logUpdate({
    asin,
    updates,
    timestamp: new Date(),
    status: 'completed'
  });

  // Notify team
  await notifyTeam({
    title: 'Book Updated on KDP',
    message: `Updated metadata for ${updates.title || 'book'}`,
    details: { asin, updates }
  });
}
```

## Step 7: Error Handling & Retry Logic

```typescript
interface KDPError {
  code: string;
  message: string;
  retryable: boolean;
  retryAfter?: number;
}

const RETRYABLE_ERRORS = [
  'SERVICE_UNAVAILABLE',
  'TIMEOUT',
  'RATE_LIMIT_EXCEEDED',
  'TEMPORARY_ERROR'
];

async function publishWithRetry(
  job: PublishingJob,
  maxRetries: number = 3
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await publishToKDP(job);
      return;
    } catch (error) {
      const kdpError = error as KDPError;

      if (!RETRYABLE_ERRORS.includes(kdpError.code) || attempt === maxRetries) {
        throw error;
      }

      const delay = (kdpError.retryAfter || Math.pow(2, attempt)) * 1000;
      console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

## Best Practices

### 1. Cover Image Optimization

```typescript
// Ensure cover meets KDP requirements
const COVER_REQUIREMENTS = {
  minWidth: 1000,
  minHeight: 1600,
  ratio: 1000 / 1600,  // 0.625
  format: ['JPEG', 'PNG'],
  maxSize: 5 * 1024 * 1024,  // 5MB
  colorSpace: 'RGB'
};

async function validateCoverImage(imagePath: string): Promise<boolean> {
  const image = await sharp(imagePath);
  const metadata = await image.metadata();

  if (metadata.width < COVER_REQUIREMENTS.minWidth ||
      metadata.height < COVER_REQUIREMENTS.minHeight) {
    throw new Error('Cover image too small');
  }

  if (Math.abs(metadata.width / metadata.height - COVER_REQUIREMENTS.ratio) > 0.01) {
    throw new Error('Cover image aspect ratio incorrect');
  }

  return true;
}
```

### 2. ISBN Management

```typescript
// Use ISBN for expanded distribution
async function allocateISBN(): Promise<string> {
  // Option 1: Use KDP-provided ISBN (free but limited)
  // Option 2: Purchase ISBN from Bowker
  // Option 3: Use existing ISBN

  const isbn = await purchaseISBN({
    quantity: 1,
    type: 'ebook'  // or 'print'
  });

  return isbn;
}
```

### 3. Pricing Strategy

```typescript
interface PricingStrategy {
  basePrice: number;
  royaltyPercentage: 35 | 70;
  regionalPrices: Record<string, number>;
  kdpSelect: boolean;
}

// 70% royalty requires:
// - Price between $2.99 - $9.99 (or regional equivalent)
// - KDP Select enrollment
// - Exclusive distribution

const pricingStrategies = {
  kdpSelect: {
    basePrice: 9.99,
    royaltyPercentage: 70,
    kdpSelect: true,
    exclusiveDistribution: true
  },
  expandedDistribution: {
    basePrice: 12.99,
    royaltyPercentage: 35,
    kdpSelect: false,
    expandedDistribution: true
  }
};
```

### 4. Metadata Optimization

```typescript
// SEO-friendly metadata
const optimizedMetadata = {
  title: 'The Art of Publishing: A Complete Guide to Modern Publishing',
  keywords: [
    'publishing',
    'self-publishing',
    'book publishing',
    'indie publishing',
    'publishing guide'
  ],
  description: `Learn the complete process of publishing your book. 
    This comprehensive guide covers everything from writing to distribution, 
    including KDP, IngramSpark, and traditional publishing options.`,
  bisacSubject: 'BUSINESS & ECONOMICS / Publishing'
};
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Cover image rejected | Verify dimensions (1000x1600px), format (JPEG/PNG), and color space (RGB) |
| ISBN not recognized | Ensure ISBN is registered with Bowker, use correct format |
| Manuscript upload fails | Check file format (PDF/EPUB), size limits, encoding |
| Pricing not allowed | Verify price is within allowed range for royalty tier |
| KDP Select conflict | Ensure book isn't available on other platforms during exclusivity |

## Support & Resources

- **KDP Help:** https://kdp.amazon.com/help
- **KDP Community:** https://forums.kdp.amazon.com
- **ISBN Provider:** https://www.bowker.com
- **Book Publisher Pro Support:** support@bookpublisher.pro

## Next Steps

1. Set up KDP account and API credentials
2. Configure export formats (EPUB, PDF)
3. Prepare book metadata
4. Test publishing workflow
5. Set up automated publishing jobs
6. Monitor KDP dashboard for sales and rankings
