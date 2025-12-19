# Azure Functions Setup for TechBlog

This guide sets up an Azure Timer Function to trigger content generation every 4 hours.

## Prerequisites

- Azure Account (free tier works)
- Azure CLI installed
- Node.js 18+

---

## Quick Setup (Azure CLI)

### 1. Create Resource Group

```bash
az group create --name techblog-rg --location eastus
```

### 2. Create Storage Account (for Functions runtime)

```bash
az storage account create \
  --name techblogfuncstorage \
  --resource-group techblog-rg \
  --location eastus \
  --sku Standard_LRS
```

### 3. Create Function App

```bash
az functionapp create \
  --name techblog-cron \
  --resource-group techblog-rg \
  --storage-account techblogfuncstorage \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --consumption-plan-location eastus
```

### 4. Configure App Settings

```bash
az functionapp config appsettings set \
  --name techblog-cron \
  --resource-group techblog-rg \
  --settings "BLOG_URL=https://yourdomain.com" \
             "CRON_SECRET=your-secret-key"
```

---

## Function Code

Create `azure-function/ContentGenerator/index.js`:

```javascript
const https = require('https');

module.exports = async function (context, myTimer) {
    const blogUrl = process.env.BLOG_URL;
    const cronSecret = process.env.CRON_SECRET;
    
    context.log('Content generation triggered at:', new Date().toISOString());
    
    try {
        const response = await fetch(`${blogUrl}/api/cron`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${cronSecret}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        context.log('Generation result:', result);
    } catch (error) {
        context.log.error('Failed to trigger generation:', error);
    }
};
```

Create `azure-function/ContentGenerator/function.json`:

```json
{
  "bindings": [
    {
      "name": "myTimer",
      "type": "timerTrigger",
      "direction": "in",
      "schedule": "0 0 */4 * * *"
    }
  ]
}
```

---

## Deploy

```bash
cd azure-function
func azure functionapp publish techblog-cron
```

---

## Alternative: Use Local Server

If running locally instead of Azure Functions, use Windows Task Scheduler:

1. Open Task Scheduler
2. Create Basic Task → "TechBlog Content Generator"
3. Trigger: Daily, repeat every 4 hours
4. Action: Start a program
   - Program: `powershell.exe`
   - Arguments: `-Command "curl -X POST http://localhost:3000/api/cron -H 'Authorization: Bearer YOUR_SECRET'"`

---

## Verify

Check Azure portal → Function App → Monitor to see execution logs.
