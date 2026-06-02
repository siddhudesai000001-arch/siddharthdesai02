// scripts/seed.js
// Auto-detects files in public/uploads/ and populates the database
// Run: node scripts/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ─── Folder Definitions ──────────────────────────────────────────────────────
const FOLDER_STRUCTURE = [
  // Documents
  { path: 'documents', name: 'documents', displayName: 'Documents', category: 'documents', parentPath: null },
  { path: 'documents/ssc', name: 'ssc', displayName: 'SSC', category: 'ssc', parentPath: 'documents' },
  { path: 'documents/ssc/marksheet', name: 'marksheet', displayName: 'Marksheet', category: 'ssc', parentPath: 'documents/ssc' },
  { path: 'documents/ssc/certificate', name: 'certificate', displayName: 'Certificate', category: 'ssc', parentPath: 'documents/ssc' },
  { path: 'documents/ssc/leaving_certificate', name: 'leaving_certificate', displayName: 'Leaving Certificate', category: 'ssc', parentPath: 'documents/ssc' },
  { path: 'documents/ssc/others', name: 'others', displayName: 'Others', category: 'ssc', parentPath: 'documents/ssc' },

  { path: 'documents/hsc', name: 'hsc', displayName: 'HSC', category: 'hsc', parentPath: 'documents' },
  { path: 'documents/hsc/marksheet', name: 'marksheet', displayName: 'Marksheet', category: 'hsc', parentPath: 'documents/hsc' },
  { path: 'documents/hsc/certificate', name: 'certificate', displayName: 'Certificate', category: 'hsc', parentPath: 'documents/hsc' },
  { path: 'documents/hsc/leaving_certificate', name: 'leaving_certificate', displayName: 'Leaving Certificate', category: 'hsc', parentPath: 'documents/hsc' },
  { path: 'documents/hsc/others', name: 'others', displayName: 'Others', category: 'hsc', parentPath: 'documents/hsc' },

  { path: 'documents/bsc_cs', name: 'bsc_cs', displayName: 'BSc CS', category: 'bsc_cs', parentPath: 'documents' },
  { path: 'documents/bsc_cs/sem1', name: 'sem1', displayName: 'Semester 1', category: 'bsc_cs', parentPath: 'documents/bsc_cs' },
  { path: 'documents/bsc_cs/sem2', name: 'sem2', displayName: 'Semester 2', category: 'bsc_cs', parentPath: 'documents/bsc_cs' },
  { path: 'documents/bsc_cs/sem3', name: 'sem3', displayName: 'Semester 3', category: 'bsc_cs', parentPath: 'documents/bsc_cs' },
  { path: 'documents/bsc_cs/sem4', name: 'sem4', displayName: 'Semester 4', category: 'bsc_cs', parentPath: 'documents/bsc_cs' },
  { path: 'documents/bsc_cs/sem5', name: 'sem5', displayName: 'Semester 5', category: 'bsc_cs', parentPath: 'documents/bsc_cs' },
  { path: 'documents/bsc_cs/sem6', name: 'sem6', displayName: 'Semester 6', category: 'bsc_cs', parentPath: 'documents/bsc_cs' },
  { path: 'documents/bsc_cs/others', name: 'others', displayName: 'Others', category: 'bsc_cs', parentPath: 'documents/bsc_cs' },

  { path: 'documents/mca', name: 'mca', displayName: 'MCA', category: 'mca', parentPath: 'documents' },
  { path: 'documents/mca/admission', name: 'admission', displayName: 'Admission Documents', category: 'mca', parentPath: 'documents/mca' },
  { path: 'documents/mca/semester', name: 'semester', displayName: 'Semester Documents', category: 'mca', parentPath: 'documents/mca' },
  { path: 'documents/mca/fee_receipts', name: 'fee_receipts', displayName: 'Fee Receipts', category: 'mca', parentPath: 'documents/mca' },
  { path: 'documents/mca/others', name: 'others', displayName: 'Others', category: 'mca', parentPath: 'documents/mca' },

  { path: 'documents/others', name: 'others', displayName: 'Others', category: 'others', parentPath: 'documents' },

  // Photos
  { path: 'photos', name: 'photos', displayName: 'Photos', category: 'photos', parentPath: null },
  { path: 'photos/passport_size', name: 'passport_size', displayName: 'Passport Size', category: 'photos', parentPath: 'photos' },
  { path: 'photos/others', name: 'others', displayName: 'Other Photos', category: 'photos', parentPath: 'photos' },
];

// ─── File Name → Display Name Converter ──────────────────────────────────────
function toDisplayName(filename) {
  const name = path.basename(filename, path.extname(filename));
  return name
    .replace(/_/g, ' ')
    .replace(/(\d{4})/g, ' ($1)')
    .replace(/\b(ssc|hsc|bsc|mca|sem)\b/gi, (m) => m.toUpperCase())
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
    .replace(/\s+/g, ' ');
}

// ─── Get MIME type ────────────────────────────────────────────────────────────
function getMimeType(ext) {
  const map = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}

// ─── Map upload path to folder path ──────────────────────────────────────────
function getVirtualPath(relativePath) {
  const parts = relativePath.split('/');
  return parts
    .map((p) =>
      p
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
    )
    .join(' > ');
}

// ─── Scan uploads directory ───────────────────────────────────────────────────
function scanUploads(baseDir) {
  const results = [];
  if (!fs.existsSync(baseDir)) return results;

  function walk(dir, relBase) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(relBase, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath, relPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).replace('.', '').toLowerCase();
        if (['pdf', 'jpg', 'jpeg', 'png', 'webp', 'doc', 'docx', 'txt'].includes(ext)) {
          const stats = fs.statSync(fullPath);
          results.push({
            filename: entry.name,
            relativePath: relPath.replace(/\\/g, '/'),
            size: stats.size,
            ext,
          });
        }
      }
    }
  }

  walk(baseDir, '');
  return results;
}

// ─── Main Seed Function ───────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Starting SidLocker seed...\n');

  // 1. Create/update user from environment
  const email = process.env.AUTH_EMAIL || 'admin@sidlocker.local';
  const username = process.env.AUTH_USERNAME || 'siddharth';
  const passwordHash = process.env.AUTH_PASSWORD_HASH || await bcrypt.hash('changeme', 12);

  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        displayName: 'Siddharth',
      },
    });
    console.log(`✅ Created user: ${email}`);
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { email, username, passwordHash },
    });
    console.log(`✅ Updated user credentials from .env`);
  }

  // 2. Create folder structure
  const folderMap = {};

  for (const f of FOLDER_STRUCTURE) {
    let folder = await prisma.folder.findUnique({ where: { path: f.path } });
    if (!folder) {
      folder = await prisma.folder.create({
        data: {
          name: f.name,
          displayName: f.displayName,
          path: f.path,
          category: f.category,
          parentId: f.parentPath ? folderMap[f.parentPath]?.id || null : null,
        },
      });
      console.log(`📁 Created folder: ${f.path}`);
    }
    folderMap[f.path] = folder;
  }

  // 3. Scan and seed files
  const uploadsDir = process.env.UPLOADS_PATH || path.join(process.cwd(), 'public', 'uploads');
  const files = scanUploads(uploadsDir);

  console.log(`\n📂 Found ${files.length} files in uploads directory`);

  for (const fileInfo of files) {
    const relStoragePath = fileInfo.relativePath;

    const existing = await prisma.file.findFirst({
      where: { path: relStoragePath },
    });
    if (existing) continue;

    // Determine folder from path
    const pathParts = relStoragePath.split('/');
    pathParts.pop(); // remove filename
    const folderRelPath = pathParts.join('/');

    // Map storage path to virtual folder path
    const folderLookup = folderRelPath.replace('documents/', '').replace('photos/', '');
    let folder = null;
    for (const [fp, fo] of Object.entries(folderMap)) {
      if (folderRelPath.endsWith(fp) || fp === folderRelPath) {
        folder = fo;
        break;
      }
    }

    const category = pathParts[0] === 'photos' ? 'photos' : pathParts[1] || 'others';
    const virtualPath = getVirtualPath(folderRelPath);

    await prisma.file.create({
      data: {
        filename: fileInfo.filename,
        displayName: toDisplayName(fileInfo.filename),
        originalName: fileInfo.filename,
        extension: fileInfo.ext,
        mimeType: getMimeType(fileInfo.ext),
        size: fileInfo.size,
        path: relStoragePath,
        virtualPath: virtualPath || 'Documents',
        category,
        folderId: folder?.id || null,
        userId: user.id,
      },
    });
    console.log(`  📄 Seeded: ${fileInfo.filename}`);
  }

  console.log('\n✅ Seed complete!');
  console.log(`   Users: 1`);
  console.log(`   Folders: ${Object.keys(folderMap).length}`);
  console.log(`   Files seeded: ${files.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
