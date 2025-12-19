/**
 * Test Azure Storage Connection
 */
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { BlobServiceClient } from '@azure/storage-blob'

async function main() {
    console.log('🧪 Testing Azure Blob Storage Connection\n')

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'blog-images'

    if (!connectionString) {
        console.error('❌ AZURE_STORAGE_CONNECTION_STRING not found')
        return
    }

    console.log(`   Container: ${containerName}`)
    console.log(`   Account: imageblog`)

    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
        const containerClient = blobServiceClient.getContainerClient(containerName)

        // Check if container exists
        const exists = await containerClient.exists()

        if (!exists) {
            console.log('\n📦 Container does not exist. Creating...')
            await containerClient.create({ access: 'blob' })
            console.log('   ✓ Container created with public blob access')
        } else {
            console.log('\n✓ Container exists')
        }

        // Test upload
        console.log('\n📤 Testing upload...')
        const testBlobName = 'test/connection-test.txt'
        const testContent = `Connection test at ${new Date().toISOString()}`

        const blockBlobClient = containerClient.getBlockBlobClient(testBlobName)
        await blockBlobClient.upload(testContent, testContent.length, {
            blobHTTPHeaders: { blobContentType: 'text/plain' }
        })

        console.log(`   ✓ Uploaded: ${testBlobName}`)
        console.log(`   URL: ${blockBlobClient.url}`)

        // Clean up test file
        await blockBlobClient.delete()
        console.log('   ✓ Cleaned up test file')

        console.log('\n═══════════════════════════════════════')
        console.log('✅ Azure Blob Storage is working!')
        console.log('═══════════════════════════════════════')

    } catch (error) {
        console.error('\n❌ Connection failed:', error)
    }
}

main()
