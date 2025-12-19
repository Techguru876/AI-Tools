/**
 * Azure Blob Storage Integration
 * 
 * Provides permanent storage for DALL-E generated images.
 * Images are stored in Azure Blob Storage with public read access.
 */

import { BlobServiceClient, ContainerClient } from '@azure/storage-blob'

// Lazy initialization of Azure client
let containerClient: ContainerClient | null = null

function getContainerClient(): ContainerClient | null {
    if (containerClient) return containerClient

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'blog-images'

    if (!connectionString) {
        console.warn('[AzureStorage] No connection string configured')
        return null
    }

    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
        containerClient = blobServiceClient.getContainerClient(containerName)
        return containerClient
    } catch (error) {
        console.error('[AzureStorage] Failed to initialize:', error)
        return null
    }
}

/**
 * Upload an image from URL to Azure Blob Storage
 * @param imageUrl - Source image URL (e.g., OpenAI DALL-E URL)
 * @param blobName - Name for the blob (e.g., "covers/my-article-slug.png")
 * @returns Permanent Azure Blob URL or null if upload fails
 */
export async function uploadImageFromUrl(
    imageUrl: string,
    blobName: string
): Promise<string | null> {
    const client = getContainerClient()
    if (!client) return null

    try {
        // Fetch the image
        const response = await fetch(imageUrl)
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`)
        }

        const imageBuffer = await response.arrayBuffer()
        const contentType = response.headers.get('content-type') || 'image/png'

        // Upload to Azure Blob
        const blockBlobClient = client.getBlockBlobClient(blobName)

        await blockBlobClient.uploadData(Buffer.from(imageBuffer), {
            blobHTTPHeaders: {
                blobContentType: contentType,
                blobCacheControl: 'public, max-age=31536000', // Cache for 1 year
            },
        })

        console.log(`[AzureStorage] Uploaded: ${blobName}`)
        return blockBlobClient.url
    } catch (error) {
        console.error('[AzureStorage] Upload failed:', error)
        return null
    }
}

/**
 * Upload a buffer directly to Azure Blob Storage
 */
export async function uploadImageBuffer(
    imageBuffer: Buffer,
    blobName: string,
    contentType: string = 'image/png'
): Promise<string | null> {
    const client = getContainerClient()
    if (!client) return null

    try {
        const blockBlobClient = client.getBlockBlobClient(blobName)

        await blockBlobClient.uploadData(imageBuffer, {
            blobHTTPHeaders: {
                blobContentType: contentType,
                blobCacheControl: 'public, max-age=31536000',
            },
        })

        console.log(`[AzureStorage] Uploaded buffer: ${blobName}`)
        return blockBlobClient.url
    } catch (error) {
        console.error('[AzureStorage] Upload buffer failed:', error)
        return null
    }
}

/**
 * Delete an image from Azure Blob Storage
 */
export async function deleteImage(blobName: string): Promise<boolean> {
    const client = getContainerClient()
    if (!client) return false

    try {
        const blockBlobClient = client.getBlockBlobClient(blobName)
        await blockBlobClient.deleteIfExists()
        console.log(`[AzureStorage] Deleted: ${blobName}`)
        return true
    } catch (error) {
        console.error('[AzureStorage] Delete failed:', error)
        return false
    }
}

/**
 * Check if Azure Storage is configured
 */
export function isAzureStorageConfigured(): boolean {
    return !!process.env.AZURE_STORAGE_CONNECTION_STRING
}
