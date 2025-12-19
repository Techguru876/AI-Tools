# Azure Functions - TechBlog Content Generator

Timer-triggered function that automatically generates blog content every 4 hours.

## Prerequisites

1. **Azure CLI** installed
2. **Azure Functions Core Tools** v4
3. **Your blog running** (locally or deployed)

## Quick Setup

### 1. Install Azure Functions Core Tools

```powershell
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

### 2. Login to Azure

```powershell
az login
```

### 3. Create Azure Resources

```powershell
# Create resource group
az group create --name techblog-rg --location eastus

# Create storage account (required for Functions)
az storage account create `
  --name techblogfuncstorage `
  --resource-group techblog-rg `
  --location eastus `
  --sku Standard_LRS

# Create function app (Consumption plan = free tier)
az functionapp create `
  --name techblog-cron `
  --resource-group techblog-rg `
  --storage-account techblogfuncstorage `
  --runtime node `
  --runtime-version 20 `
  --functions-version 4 `
  --consumption-plan-location eastus
```

### 4. Configure App Settings

```powershell
az functionapp config appsettings set `
  --name techblog-cron `
  --resource-group techblog-rg `
  --settings `
    "BLOG_API_URL=https://YOUR-BLOG-DOMAIN.com" `
    "CRON_SECRET=S3cur!tyR0ck$"
```

### 5. Deploy

```powershell
cd azure-functions
npm install
npm run deploy
```

## Local Testing

```powershell
cd azure-functions
npm install
npm run build
npm start
```

Then trigger manually in another terminal:
```powershell
curl -X POST http://localhost:7071/admin/functions/ContentGenerator
```

## Schedule

The function runs on this schedule: `0 0 */4 * * *`

| Time (UTC) | Description |
|------------|-------------|
| 00:00 | Midnight |
| 04:00 | 4 AM |
| 08:00 | 8 AM |
| 12:00 | Noon |
| 16:00 | 4 PM |
| 20:00 | 8 PM |

## Monitoring

View logs in Azure Portal:
1. Go to Function App → Functions → ContentGenerator
2. Click "Monitor" tab
3. See execution history and logs

## Costs

**Consumption Plan (Free Tier includes):**
- 1 million executions/month
- 400,000 GB-seconds compute

At 6 executions/day = 180/month, you'll stay well within free tier.
