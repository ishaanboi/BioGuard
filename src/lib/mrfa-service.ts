import JSZip from 'jszip';
import { db, storage } from '@/firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const MRFA_EXPIRY_HOURS = 24;

export interface MRFABundle {
    id: string; // The short code / document ID
    folderId: string;
    folderName: string;
    storagePath: string;
    downloadUrl: string;
    expiresAt: Timestamp;
    createdAt: Timestamp;
}

/**
 * Generates a ZIP file from a list of documents and uploads it to Firebase Storage.
 * Then creates a Firestore record for the shareable link.
 */
export async function createMRFALink(folder: any, documents: any[]): Promise<string> {
    const zip = new JSZip();
    const folderName = folder.name || 'Medical Records';

    // 1. Fetch all files and add to ZIP
    // 1. Fetch all files and add to ZIP
    const filePromises = documents.map(async (doc) => {
        try {
            if (!doc.fileUrl) {
                console.warn(`Document ${doc.id} has no fileUrl.`);
                return;
            }

            // Download via local Proxy to bypass CORS
            const response = await fetch(`/api/proxy?url=${encodeURIComponent(doc.fileUrl)}`);
            if (!response.ok) throw new Error(`Proxy failed: ${response.statusText}`);
            const blob = await response.blob();

            // Use original name or fallback
            let fileName = doc.name || `file-${doc.id}`;

            // Try to extract the extension from the fileUrl if the name doesn't have one
            if (!fileName.includes('.')) {
                let ext = '';

                // 1. Try to get extension from the Content-Type header
                const contentType = response.headers.get('Content-Type');
                if (contentType) {
                    const mimeMap: Record<string, string> = {
                        'application/pdf': '.pdf',
                        'image/jpeg': '.jpg',
                        'image/png': '.png',
                        'text/plain': '.txt',
                        'application/msword': '.doc',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
                    };
                    ext = mimeMap[contentType] || '';
                }

                // 2. If no valid mime-type mapping, fallback to parsing URL
                if (!ext) {
                    try {
                        const urlPath = doc.fileUrl.split('?')[0];
                        const decodedPath = decodeURIComponent(urlPath);
                        const lastDotIndex = decodedPath.lastIndexOf('.');

                        if (lastDotIndex !== -1 && lastDotIndex > decodedPath.lastIndexOf('/')) {
                            ext = decodedPath.substring(lastDotIndex);
                        }
                    } catch (e) {
                        // Ignore parse error
                    }
                }

                // Append extension (defaulting to .pdf for medical records as a robust fallback)
                fileName += (ext || '.pdf');
            }

            zip.file(fileName, blob);
            console.log(`Added ${fileName} to zip.`);
        } catch (error) {
            console.error(`Failed to download file ${doc.name}:`, error);
            // Don't throw here, try to get as many as possible
        }
    });

    await Promise.all(filePromises);

    // Check if zip is empty
    if (Object.keys(zip.files).length === 0) {
        throw new Error("Failed to add any files to the bundle. Please check your connection or CORS settings.");
    }

    // 2. Generate ZIP Blob
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // 3. Upload to Firebase Storage (Transient path)
    // We use a random UUID for the zip filename in storage
    const storageUuid = crypto.randomUUID();
    const storagePath = `transient_bundles/${storageUuid}.zip`;
    const storageRef = ref(storage, storagePath);

    const metadata = {
        contentType: 'application/zip',
        customMetadata: {
            folderId: folder.id,
            generatedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + MRFA_EXPIRY_HOURS * 60 * 60 * 1000).toISOString()
        }
    };

    await uploadBytes(storageRef, zipBlob, metadata);
    const downloadUrl = await getDownloadURL(storageRef);

    // 4. Create Firestore Record (The Share Link)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + MRFA_EXPIRY_HOURS);

    const docRef = await addDoc(collection(db, 'mrfa_shares'), {
        folderId: folder.id,
        folderName: folder.name,
        storagePath: storagePath,
        downloadUrl: downloadUrl,
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(expiresAt),
        active: true
    });

    return docRef.id; // This is the "short code"
}
