/**
 * Upload RAG Data to Azure Blob Storage
 * 
 * This script reads the local rag-training.json file and uploads it to Azure Blob Storage.
 * Run: npx tsx scripts/upload-rag-to-azure.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { BlobServiceClient } from '@azure/storage-blob'

// Load environment variables
dotenv.config({ path: '.env.local' })

const CONTAINER_NAME = 'rag-data'
const BLOB_NAME = 'rag-training.json'
const LOCAL_PATH = path.join(process.cwd(), 'data', 'rag-training.json')

async function main() {
    console.log('📦 Uploading RAG data to Azure Blob Storage...\n')

    // Check for connection string
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
    if (!connectionString) {
        console.error('❌ AZURE_STORAGE_CONNECTION_STRING not found in environment')
        process.exit(1)
    }

    // Check for local file
    if (!fs.existsSync(LOCAL_PATH)) {
        console.error(`❌ Local RAG file not found: ${LOCAL_PATH}`)
        process.exit(1)
    }

    // Read local file
    console.log(`📖 Reading: ${LOCAL_PATH}`)
    const data = fs.readFileSync(LOCAL_PATH, 'utf-8')
    const articles = JSON.parse(data)
    console.log(`   Found ${articles.length} articles\n`)

    // Connect to Azure Blob
    console.log('☁️  Connecting to Azure Blob Storage...')
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME)

    // Create container if it doesn't exist
    console.log(`   Creating container: ${CONTAINER_NAME}`)
    await containerClient.createIfNotExists({ access: 'blob' })

    // Upload the file
    console.log(`   Uploading to: ${BLOB_NAME}`)
    const blockBlobClient = containerClient.getBlockBlobClient(BLOB_NAME)
    await blockBlobClient.upload(data, Buffer.byteLength(data), {
        blobHTTPHeaders: { blobContentType: 'application/json' }
    })

    console.log('\n✅ Upload complete!')
    console.log(`   URL: ${blockBlobClient.url}`)
    console.log(`   Size: ${(Buffer.byteLength(data) / 1024).toFixed(2)} KB`)
    console.log(`   Articles: ${articles.length}`)

    // Verify by downloading
    console.log('\n🔍 Verifying upload...')
    const response = await blockBlobClient.download(0)
    const downloadedLength = response.contentLength || 0
    console.log(`   Downloaded size: ${(downloadedLength / 1024).toFixed(2)} KB`)
    console.log('   ✅ Verification passed!')
}

main().catch(error => {
    console.error('❌ Upload failed:', error)
    process.exit(1)
})
