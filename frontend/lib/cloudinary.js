import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import cloudinary from 'cloudinary';

const cloud = cloudinary.v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloud.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
}

export async function uploadLegalDocument(buffer, originalFilename, folder = 'kanoonsaathi_vault') {
  // 1. Calculate SHA-256 cryptographic seal
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  const sha256Seal = `SHA256: ${hash.slice(0, 6)}...${hash.slice(-5)}`;
  const fullHash = `SHA256: ${hash}`;

  // 2. Try Cloudinary upload if cloud name is valid
  try {
    const base64Data = `data:application/pdf;base64,${buffer.toString('base64')}`;
    const result = await cloud.uploader.upload(base64Data, {
      folder,
      resource_type: 'auto',
      public_id: `doc_${Date.now()}_${path.parse(originalFilename).name.replace(/[^a-zA-Z0-9_-]/g, '_')}`
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      hash: sha256Seal,
      fullHash,
      storageType: 'cloudinary',
      size: formatBytes(buffer.length)
    };
  } catch (err) {
    console.warn('Cloudinary upload skipped or failed, storing in verified local vault:', err.message);

    // 3. Robust local storage fallback
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const safeFilename = `doc_${Date.now()}_${originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const targetPath = path.join(uploadsDir, safeFilename);
    fs.writeFileSync(targetPath, buffer);

    return {
      success: true,
      url: `/uploads/${safeFilename}`,
      publicId: safeFilename,
      hash: sha256Seal,
      fullHash,
      storageType: 'local_vault',
      size: formatBytes(buffer.length)
    };
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
