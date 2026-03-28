# Best Practices: Cover Image Optimization & ISBN Allocation for KDP

## Part 1: Cover Image Optimization

### Why Cover Optimization Matters

Your book cover is the first impression readers see. On KDP:
- **Thumbnail size:** 116x174px (displayed in search results)
- **Full size:** 1000x1600px (product page)
- **Mobile:** Covers 60% of screen on mobile devices

Poor cover optimization results in:
- Rejection by KDP quality checks
- Low click-through rates
- Poor sales performance

### KDP Cover Requirements

| Requirement | Specification | Notes |
|-------------|---------------|-------|
| **Dimensions** | 1000 x 1600 pixels | Minimum; larger is better (up to 10,000 x 16,000) |
| **Aspect Ratio** | 1:1.6 (0.625) | Exact ratio required |
| **File Format** | JPEG or PNG | JPEG recommended for smaller file size |
| **File Size** | Max 5 MB | Smaller files load faster |
| **Color Space** | RGB (not CMYK) | CMYK will be rejected |
| **DPI** | 72 DPI minimum | Screen resolution, not print |
| **Margins** | No white margins | Content should extend to edges |
| **Text Legibility** | Readable at 116x174px | Test thumbnail appearance |

### Cover Optimization Workflow

#### Step 1: Validate Cover Specifications

```typescript
import sharp from 'sharp';
import path from 'path';

interface CoverValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata: {
    width: number;
    height: number;
    format: string;
    colorSpace: string;
    fileSize: number;
    dpi: number;
  };
}

async function validateCoverImage(imagePath: string): Promise<CoverValidation> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Get image metadata
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const stats = await import('fs').promises.stat(imagePath);

    // Validate dimensions
    if (!metadata.width || !metadata.height) {
      errors.push('Unable to read image dimensions');
      return { isValid: false, errors, warnings, metadata: {} as any };
    }

    const aspectRatio = metadata.width / metadata.height;
    const targetRatio = 1000 / 1600; // 0.625

    if (Math.abs(aspectRatio - targetRatio) > 0.01) {
      errors.push(
        `Aspect ratio incorrect: ${aspectRatio.toFixed(3)} (expected ${targetRatio.toFixed(3)})`
      );
    }

    // Validate dimensions are minimum size
    if (metadata.width < 1000 || metadata.height < 1600) {
      errors.push(
        `Dimensions too small: ${metadata.width}x${metadata.height} (minimum 1000x1600)`
      );
    }

    // Warn if dimensions are larger than recommended
    if (metadata.width > 10000 || metadata.height > 16000) {
      warnings.push(
        `Dimensions very large: ${metadata.width}x${metadata.height} (recommended max 10000x16000)`
      );
    }

    // Validate file format
    const validFormats = ['jpeg', 'png'];
    if (!validFormats.includes(metadata.format || '')) {
      errors.push(`Invalid format: ${metadata.format} (must be JPEG or PNG)`);
    }

    // Validate color space
    if (metadata.space && metadata.space !== 'srgb') {
      errors.push(
        `Invalid color space: ${metadata.space} (must be RGB/sRGB, not CMYK)`
      );
    }

    // Validate file size
    const fileSizeMB = stats.size / (1024 * 1024);
    if (fileSizeMB > 5) {
      errors.push(
        `File size too large: ${fileSizeMB.toFixed(2)} MB (maximum 5 MB)`
      );
    }

    // Warn if file size is large (but under limit)
    if (fileSizeMB > 2) {
      warnings.push(
        `File size large: ${fileSizeMB.toFixed(2)} MB (recommended under 2 MB for faster loading)`
      );
    }

    // Check for white margins (common issue)
    const thumbnail = await image.resize(100, 160).toBuffer();
    const { data } = await sharp(thumbnail).raw().toBuffer({ resolveWithObject: true });

    // Simple check: if top-left corner is mostly white, warn about margins
    const isWhiteCorner = checkIfWhite(data, 0, 0);
    if (isWhiteCorner) {
      warnings.push('Cover appears to have white margins - consider extending content to edges');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format || 'unknown',
        colorSpace: metadata.space || 'unknown',
        fileSize: stats.size,
        dpi: 72
      }
    };
  } catch (error) {
    errors.push(`Validation error: ${error.message}`);
    return { isValid: false, errors, warnings, metadata: {} as any };
  }
}

function checkIfWhite(data: Buffer, x: number, y: number): boolean {
  // Simple white detection: R, G, B all > 240
  const pixelIndex = (y * 100 + x) * 3;
  const r = data[pixelIndex];
  const g = data[pixelIndex + 1];
  const b = data[pixelIndex + 2];
  return r > 240 && g > 240 && b > 240;
}
```

#### Step 2: Optimize Cover Image

```typescript
interface CoverOptimizationOptions {
  targetWidth?: number;
  targetHeight?: number;
  quality?: number;
  removeMargins?: boolean;
  convertToRGB?: boolean;
  compressLevel?: number;
}

async function optimizeCoverImage(
  inputPath: string,
  outputPath: string,
  options: CoverOptimizationOptions = {}
): Promise<void> {
  const {
    targetWidth = 1000,
    targetHeight = 1600,
    quality = 85,
    removeMargins = true,
    convertToRGB = true,
    compressLevel = 9
  } = options;

  let pipeline = sharp(inputPath);

  // Step 1: Ensure RGB color space
  if (convertToRGB) {
    pipeline = pipeline.toColorspace('srgb');
  }

  // Step 2: Remove white margins if detected
  if (removeMargins) {
    pipeline = pipeline.trim({
      background: '#FFFFFF',
      threshold: 10
    });
  }

  // Step 3: Resize to target dimensions with proper aspect ratio
  pipeline = pipeline.resize(targetWidth, targetHeight, {
    fit: 'cover',
    position: 'center',
    withoutEnlargement: false
  });

  // Step 4: Optimize based on format
  const format = path.extname(outputPath).toLowerCase();

  if (format === '.jpg' || format === '.jpeg') {
    pipeline = pipeline.jpeg({
      quality,
      progressive: true,
      mozjpeg: true
    });
  } else if (format === '.png') {
    pipeline = pipeline.png({
      compressionLevel: compressLevel,
      adaptiveFiltering: true
    });
  }

  // Step 5: Write optimized image
  await pipeline.toFile(outputPath);

  console.log(`Cover optimized: ${inputPath} → ${outputPath}`);
}
```

#### Step 3: Test Cover at Thumbnail Size

```typescript
async function generateCoverThumbnail(
  coverPath: string,
  outputPath: string
): Promise<void> {
  // Generate thumbnail at KDP search result size (116x174px)
  await sharp(coverPath)
    .resize(116, 174, {
      fit: 'cover',
      position: 'center'
    })
    .toFile(outputPath);

  console.log(`Thumbnail generated: ${outputPath}`);
  console.log('Review this thumbnail to ensure text is readable and design is clear');
}

// Usage
async function testCoverDesign(coverPath: string): Promise<void> {
  const thumbnailPath = './cover_thumbnail.jpg';
  await generateCoverThumbnail(coverPath, thumbnailPath);

  console.log(`
    ✓ Thumbnail generated at ${thumbnailPath}
    
    Next steps:
    1. Open the thumbnail in your browser
    2. Verify text is readable at small size
    3. Check that important design elements are visible
    4. Ensure colors are vibrant and not washed out
    5. If issues found, adjust cover design and re-test
  `);
}
```

#### Step 4: Complete Cover Optimization Pipeline

```typescript
async function processAndValidateCover(
  inputPath: string,
  outputPath: string
): Promise<CoverValidation> {
  console.log('Starting cover optimization...\n');

  // Step 1: Validate original
  console.log('1. Validating original cover...');
  const originalValidation = await validateCoverImage(inputPath);

  if (!originalValidation.isValid) {
    console.error('❌ Original cover validation failed:');
    originalValidation.errors.forEach(err => console.error(`  - ${err}`));
    throw new Error('Cover validation failed');
  }

  console.log('✓ Original cover valid');
  if (originalValidation.warnings.length > 0) {
    console.warn('⚠️  Warnings:');
    originalValidation.warnings.forEach(warn => console.warn(`  - ${warn}`));
  }

  // Step 2: Optimize cover
  console.log('\n2. Optimizing cover...');
  await optimizeCoverImage(inputPath, outputPath, {
    targetWidth: 1000,
    targetHeight: 1600,
    quality: 85,
    removeMargins: true,
    convertToRGB: true
  });
  console.log('✓ Cover optimized');

  // Step 3: Validate optimized
  console.log('\n3. Validating optimized cover...');
  const optimizedValidation = await validateCoverImage(outputPath);

  if (!optimizedValidation.isValid) {
    console.error('❌ Optimized cover validation failed:');
    optimizedValidation.errors.forEach(err => console.error(`  - ${err}`));
    throw new Error('Optimized cover validation failed');
  }

  console.log('✓ Optimized cover valid');

  // Step 4: Generate and display thumbnail
  console.log('\n4. Generating thumbnail preview...');
  const thumbnailPath = outputPath.replace(/\.[^.]+$/, '_thumbnail.jpg');
  await generateCoverThumbnail(outputPath, thumbnailPath);
  console.log(`✓ Thumbnail generated: ${thumbnailPath}`);

  // Step 5: Display results
  console.log('\n📊 Cover Optimization Results:');
  console.log(`  Original: ${originalValidation.metadata.width}x${originalValidation.metadata.height} (${(originalValidation.metadata.fileSize / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`  Optimized: ${optimizedValidation.metadata.width}x${optimizedValidation.metadata.height} (${(optimizedValidation.metadata.fileSize / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`  Compression: ${((1 - optimizedValidation.metadata.fileSize / originalValidation.metadata.fileSize) * 100).toFixed(1)}%`);

  return optimizedValidation;
}
```

### Cover Design Best Practices

#### Typography on Covers

```typescript
interface CoverTypography {
  title: {
    fontSize: number;
    fontWeight: 'bold' | 'semibold';
    color: string;
    position: 'top' | 'center' | 'bottom';
  };
  author: {
    fontSize: number;
    fontWeight: 'normal' | 'semibold';
    color: string;
    position: 'bottom';
  };
}

// Best practices
const coverTypographyGuidelines: CoverTypography = {
  title: {
    fontSize: 72,  // Large and readable at thumbnail
    fontWeight: 'bold',
    color: '#FFFFFF',  // High contrast
    position: 'center'  // Visible at all sizes
  },
  author: {
    fontSize: 36,
    fontWeight: 'normal',
    color: '#FFFFFF',
    position: 'bottom'
  }
};

// Testing text readability
async function testTextReadability(
  coverPath: string,
  title: string,
  author: string
): Promise<void> {
  // Generate multiple size previews
  const sizes = [
    { width: 116, height: 174, label: 'Thumbnail (Search)' },
    { width: 300, height: 480, label: 'Small (Mobile)' },
    { width: 600, height: 960, label: 'Medium (Tablet)' },
    { width: 1000, height: 1600, label: 'Full (Desktop)' }
  ];

  for (const size of sizes) {
    const preview = await sharp(coverPath)
      .resize(size.width, size.height, { fit: 'cover' })
      .toBuffer();

    // Save preview
    const previewPath = `./cover_preview_${size.label.replace(/\s+/g, '_')}.jpg`;
    await sharp(preview).toFile(previewPath);

    console.log(`✓ Generated ${size.label}: ${previewPath}`);
  }

  console.log('\nReview all previews to ensure:');
  console.log('  ✓ Title is readable at thumbnail size');
  console.log('  ✓ Author name is visible');
  console.log('  ✓ Key design elements are clear');
  console.log('  ✓ Colors are vibrant at all sizes');
}
```

---

## Part 2: ISBN Allocation Strategies

### Understanding ISBN for KDP

| Aspect | Details |
|--------|---------|
| **What is ISBN?** | International Standard Book Number - unique identifier for books |
| **Format** | 13 digits (ISBN-13), e.g., 978-1-234-56789-0 |
| **KDP ISBN** | Free ISBN provided by KDP (limited distribution) |
| **Bowker ISBN** | Purchased ISBN (expanded distribution, better control) |
| **Cost** | $125 for single ISBN; $295 for 10; $575 for 100 |

### ISBN Strategy Decision Tree

```
Do you want expanded distribution?
├─ NO (KDP Select only)
│  └─ Use KDP-provided ISBN (free)
│     - Only available on Amazon
│     - No cost
│     - Limited control
│
└─ YES (Multiple retailers)
   ├─ Budget available?
   │  ├─ NO
   │  │  └─ Use KDP ISBN for now
   │  │     - Plan to upgrade later
   │  │     - Track ISBN for migration
   │  │
   │  └─ YES
   │     ├─ Single book or series?
   │     │  ├─ Single book
   │     │  │  └─ Buy 1 ISBN from Bowker ($125)
   │     │  │     - Full control
   │     │  │     - Expanded distribution
   │     │  │
   │     │  └─ Series (3+ books)
   │     │     └─ Buy 10 ISBNs from Bowker ($295)
   │     │        - Better value per ISBN
   │     │        - Reserve for future books
   │     │        - Consistent publisher prefix
   │     │
   │     └─ Format considerations
   │        ├─ Ebook only
   │        │  └─ 1 ISBN per format (EPUB, MOBI)
   │        │
   │        ├─ Print only
   │        │  └─ 1 ISBN for print edition
   │        │
   │        └─ Both ebook and print
   │           └─ 2 ISBNs (separate for each format)
```

### ISBN Allocation Implementation

#### Strategy 1: KDP-Provided ISBN (Free)

```typescript
interface KDPISBNAllocation {
  strategy: 'kdp-provided';
  cost: 0;
  distribution: 'amazon-only';
  kdpSelect: boolean;
  advantages: string[];
  limitations: string[];
}

const kdpISBNStrategy: KDPISBNAllocation = {
  strategy: 'kdp-provided',
  cost: 0,
  distribution: 'amazon-only',
  kdpSelect: true,
  advantages: [
    'Free',
    'Instant availability',
    'No additional setup',
    'Perfect for KDP Select enrollment'
  ],
  limitations: [
    'Amazon-only distribution',
    'Limited control over metadata',
    'Cannot migrate to other retailers',
    'ISBNs are owned by Amazon'
  ]
};

async function allocateKDPISBN(bookTitle: string): Promise<string> {
  // KDP automatically assigns ISBN during publishing
  // No action needed from user
  console.log(`
    ✓ KDP ISBN Allocation Strategy Selected
    
    During KDP publishing:
    1. Leave ISBN field empty
    2. Select "Use KDP ISBN"
    3. KDP assigns ISBN automatically
    4. ISBN appears in book details after publication
    
    Timeline: Instant (during publishing)
    Cost: $0
  `);

  return 'ISBN will be assigned by KDP';
}
```

#### Strategy 2: Single Bowker ISBN ($125)

```typescript
interface BowkerISBNAllocation {
  strategy: 'bowker-single';
  cost: 125;
  quantity: 1;
  distribution: 'expanded';
  useCase: 'single-book';
  advantages: string[];
  timeline: string;
}

const bowkerSingleISBN: BowkerISBNAllocation = {
  strategy: 'bowker-single',
  cost: 125,
  quantity: 1,
  distribution: 'expanded',
  useCase: 'single-book',
  advantages: [
    'Full control over book metadata',
    'Expanded distribution (IngramSpark, bookstores, etc.)',
    'Professional appearance',
    'Can use with multiple retailers',
    'ISBN owned by you (publisher)'
  ],
  timeline: '3-5 business days'
};

async function allocateBowkerSingleISBN(
  bookTitle: string,
  authorName: string
): Promise<string> {
  console.log(`
    📚 Bowker Single ISBN Allocation
    
    Steps:
    1. Visit https://www.bowker.com/products/isbn
    2. Purchase 1 ISBN ($125)
    3. Provide publisher name and address
    4. Receive ISBN via email (3-5 business days)
    
    ISBN Format: 978-X-XXX-XXXXX-X
    
    Usage:
    - Use for ebook edition
    - Use for print edition (if applicable)
    - Register with Bowker's ISBN database
    - Use in KDP publishing form
    
    Cost: $125
    Timeline: 3-5 business days
    
    Best for: Single book, expanded distribution
  `);

  return 'ISBN pending from Bowker';
}
```

#### Strategy 3: Bulk Bowker ISBNs ($295 for 10)

```typescript
interface BulkISBNAllocation {
  strategy: 'bowker-bulk';
  cost: 295;
  quantity: 10;
  costPerISBN: 29.50;
  distribution: 'expanded';
  useCase: 'series-or-multiple-books';
  advantages: string[];
}

const bowkerBulkISBN: BulkISBNAllocation = {
  strategy: 'bowker-bulk',
  cost: 295,
  quantity: 10,
  costPerISBN: 29.50,
  distribution: 'expanded',
  useCase: 'series-or-multiple-books',
  advantages: [
    'Better value: $29.50 per ISBN vs $125',
    'Reserve ISBNs for future books',
    'Consistent publisher prefix',
    'Scalable for series',
    'Full control over all ISBNs'
  ]
};

async function allocateBowkerBulkISBNs(
  seriesName: string,
  plannedBooks: number
): Promise<string[]> {
  console.log(`
    📚 Bowker Bulk ISBN Allocation
    
    Series: ${seriesName}
    Planned Books: ${plannedBooks}
    ISBNs to Purchase: 10
    
    Steps:
    1. Visit https://www.bowker.com/products/isbn
    2. Purchase 10 ISBNs ($295)
    3. Receive ISBNs via email (3-5 business days)
    4. Store ISBNs in spreadsheet
    5. Allocate one ISBN per book/format
    
    ISBN Allocation Plan:
  `);

  const isbns: string[] = [];
  for (let i = 0; i < Math.min(plannedBooks, 10); i++) {
    const isbn = `978-X-XXX-XXXXX-${i}`;  // Placeholder
    isbns.push(isbn);
    console.log(`  Book ${i + 1}: ${isbn}`);
  }

  console.log(`
    Cost: $295 for 10 ISBNs ($29.50 each)
    Timeline: 3-5 business days
    Remaining ISBNs: ${10 - plannedBooks}
    
    Best for: Book series, multiple formats, future books
  `);

  return isbns;
}
```

#### Strategy 4: ISBN per Format (Ebook + Print)

```typescript
interface ISBNPerFormatStrategy {
  ebook: {
    isbn: string;
    format: 'EPUB' | 'MOBI';
    retailer: string;
  };
  print: {
    isbn: string;
    format: 'PDF';
    retailer: string;
  };
}

async function allocateISBNPerFormat(
  bookTitle: string,
  authorName: string
): Promise<ISBNPerFormatStrategy> {
  console.log(`
    📚 ISBN Per Format Strategy
    
    Book: ${bookTitle}
    Author: ${authorName}
    
    Allocation:
    ├─ Ebook (EPUB)
    │  ├─ ISBN: 978-X-XXX-XXXXX-1
    │  ├─ Retailer: Amazon KDP, Apple Books, Google Play
    │  └─ Cost: $125 (Bowker)
    │
    └─ Print (PDF)
       ├─ ISBN: 978-X-XXX-XXXXX-2
       ├─ Retailer: KDP Print, IngramSpark, Blurb
       └─ Cost: $125 (Bowker)
    
    Total Cost: $250 for both formats
    
    Benefits:
    ✓ Each format has unique ISBN
    ✓ Better tracking of sales by format
    ✓ Professional setup
    ✓ Supports expanded distribution
    
    Timeline: 3-5 business days
  `);

  return {
    ebook: {
      isbn: 'ISBN-EBOOK-PENDING',
      format: 'EPUB',
      retailer: 'Amazon, Apple, Google'
    },
    print: {
      isbn: 'ISBN-PRINT-PENDING',
      format: 'PDF',
      retailer: 'KDP Print, IngramSpark'
    }
  };
}
```

### ISBN Management System

```typescript
interface ISBNRecord {
  isbn: string;
  bookTitle: string;
  author: string;
  format: 'ebook' | 'print' | 'both';
  retailer: string;
  status: 'allocated' | 'in-use' | 'archived';
  dateAllocated: Date;
  datePublished?: Date;
  kdpASIN?: string;
  notes?: string;
}

class ISBNManager {
  private isbns: ISBNRecord[] = [];

  // Allocate ISBN from inventory
  allocateISBN(
    isbn: string,
    bookTitle: string,
    author: string,
    format: 'ebook' | 'print' | 'both',
    retailer: string
  ): ISBNRecord {
    const record: ISBNRecord = {
      isbn,
      bookTitle,
      author,
      format,
      retailer,
      status: 'allocated',
      dateAllocated: new Date()
    };

    this.isbns.push(record);
    console.log(`✓ ISBN allocated: ${isbn} for "${bookTitle}"`);

    return record;
  }

  // Mark ISBN as published
  markAsPublished(isbn: string, kdpASIN: string): void {
    const record = this.isbns.find(r => r.isbn === isbn);
    if (record) {
      record.status = 'in-use';
      record.datePublished = new Date();
      record.kdpASIN = kdpASIN;
      console.log(`✓ ISBN ${isbn} marked as published (ASIN: ${kdpASIN})`);
    }
  }

  // Get available ISBNs
  getAvailableISBNs(): ISBNRecord[] {
    return this.isbns.filter(r => r.status === 'allocated');
  }

  // Get ISBN history
  getISBNHistory(isbn: string): ISBNRecord | undefined {
    return this.isbns.find(r => r.isbn === isbn);
  }

  // Export ISBN inventory
  exportInventory(): string {
    const headers = ['ISBN', 'Book Title', 'Author', 'Format', 'Status', 'Date Allocated', 'Date Published'];
    const rows = this.isbns.map(r => [
      r.isbn,
      r.bookTitle,
      r.author,
      r.format,
      r.status,
      r.dateAllocated.toISOString().split('T')[0],
      r.datePublished?.toISOString().split('T')[0] || 'N/A'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    return csv;
  }
}

// Usage
const isbnManager = new ISBNManager();

// Allocate ISBNs from Bowker purchase
const bowkerISBNs = [
  '978-1-234-56789-0',
  '978-1-234-56789-1',
  '978-1-234-56789-2'
];

bowkerISBNs.forEach((isbn, index) => {
  isbnManager.allocateISBN(
    isbn,
    `Book ${index + 1}`,
    'Author Name',
    'both',
    'KDP + IngramSpark'
  );
});

// Mark as published
isbnManager.markAsPublished('978-1-234-56789-0', 'B0XXXXXXXXX');

// Export inventory
const inventory = isbnManager.exportInventory();
console.log(inventory);
```

### Decision Matrix: Which Strategy to Choose?

| Scenario | Strategy | Cost | Timeline | Distribution |
|----------|----------|------|----------|--------------|
| Single book, KDP Select only | KDP ISBN | $0 | Instant | Amazon only |
| Single book, expanded distribution | Bowker Single | $125 | 3-5 days | All retailers |
| Book series (3+ books) | Bowker Bulk | $295 | 3-5 days | All retailers |
| Ebook + Print formats | Bowker Bulk (2 ISBNs) | $250 | 3-5 days | All retailers |
| Testing/self-publishing | KDP ISBN | $0 | Instant | Amazon only |
| Professional publishing | Bowker Bulk | $295+ | 3-5 days | All retailers |

### Implementation Checklist

- [ ] Decide on ISBN strategy based on distribution goals
- [ ] Purchase ISBNs if using Bowker
- [ ] Set up ISBN management system
- [ ] Document ISBN allocation for each book
- [ ] Verify ISBN format (13 digits, correct prefix)
- [ ] Register ISBN with Bowker's ISBN database
- [ ] Use ISBN in KDP publishing form
- [ ] Verify ISBN appears in book metadata
- [ ] Track sales by ISBN
- [ ] Archive old ISBNs when book goes out of print

## Summary

**Cover Optimization:**
- Validate dimensions (1000x1600px), format (JPEG/PNG), and color space (RGB)
- Optimize file size (under 2MB recommended)
- Test readability at thumbnail size (116x174px)
- Ensure text is legible and design is clear

**ISBN Allocation:**
- KDP ISBN: Free, Amazon-only, perfect for KDP Select
- Bowker Single: $125, full control, expanded distribution
- Bowker Bulk: $295 for 10, best value for series
- One ISBN per format (ebook + print = 2 ISBNs)
- Use ISBN management system to track allocation
