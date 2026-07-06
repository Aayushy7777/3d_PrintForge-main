# 🔐 GitHub Actions Secrets Configuration

This file guides you through setting up the required secrets for the CI/CD pipeline.

## How to Add Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret below

## Required Secrets

### Vercel Secrets (Frontend Deployment)

**VERCEL_TOKEN**
- Go to: https://vercel.com/account/tokens
- Create new token with all scopes
- Paste the token value

**VERCEL_ORG_ID**
- Go to: https://vercel.com/account/settings
- Copy "Personal Account ID" or organization ID

**VERCEL_PROJECT_ID**
- Go to: https://vercel.com/dashboard
- Select your PrintForge project
- Copy "Project ID" from project settings

### Railway Secrets (Backend Deployment)

**RAILWAY_TOKEN**
- Go to: https://railway.app/account/tokens
- Create new API token
- Paste the token value

**RAILWAY_PROJECT_ID**
- Go to: https://railway.app/dashboard
- Select your backend service
- Copy "Project ID"

### Docker Hub Secrets (Image Registry)

**DOCKER_USERNAME**
- Docker Hub username (create account at hub.docker.com if needed)

**DOCKER_PASSWORD**
- Docker Hub access token (not password)
- Go to: https://hub.docker.com/settings/security
- Create new access token

### Slack Webhooks (Notifications)

**SLACK_WEBHOOK**
- Go to: https://api.slack.com/messaging/webhooks
- Create new incoming webhook
- Paste the full webhook URL
- Format: `https://hooks.slack.com/services/YOUR/WEBHOOK/URL`

---

## Step-by-Step Setup

### 1. Vercel Setup

```bash
npm i -g vercel
vercel login
vercel --version
```

Get tokens from:
- Token: https://vercel.com/account/tokens
- Org ID: https://vercel.com/account/settings
- Project ID: Your dashboard → Project settings

Add to GitHub Secrets:
- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID

### 2. Railway Setup

Go to: https://railway.app/account/tokens
- Click "Create new token"
- Copy the token
- Add to GitHub as RAILWAY_TOKEN

Get Project ID:
- Dashboard → Select project → Copy Project ID
- Add to GitHub as RAILWAY_PROJECT_ID

### 3. Docker Hub Setup

Create/login account: https://hub.docker.com

Get credentials:
- Username: Your docker hub username
- Token: Settings → Security → New Access Token

Add to GitHub Secrets:
- DOCKER_USERNAME
- DOCKER_PASSWORD

### 4. Slack Setup

Create webhook:
1. Workspace → Apps → Browse Slack
2. Search "Incoming WebHooks"
3. Install → Add New Webhook
4. Select channel for notifications
5. Copy Webhook URL

Add to GitHub Secrets:
- SLACK_WEBHOOK

---

## Verification

After adding all secrets, test the deployment:

```bash
# Push to main branch
git add .
git commit -m "Test CI/CD pipeline"
git push origin main

# Watch progress:
# GitHub Actions → Deploy workflow
# Check Vercel dashboard
# Check Railway dashboard
# Check Docker Hub for image
# Check Slack for notifications
```

---

## Troubleshooting

### Secret not found error
- Make sure secret name matches exactly (case-sensitive)
- Refresh the workflow file
- Wait a minute for secrets to propagate

### Deploy fails with 401 Unauthorized
- Token might be expired
- Re-generate token and update secret
- Verify token has correct permissions

### Docker push fails
- Check Docker Hub credentials
- Verify token hasn't expired
- Ensure repository exists on Docker Hub

### Slack notifications not working
- Verify webhook URL is correct
- Test webhook with: `curl -X POST -H 'Content-type: application/json' --data '{"text":"test"}' YOUR_WEBHOOK_URL`

---

## Security Best Practices

✅ Never commit secrets to code
✅ Use repository secrets, not organization secrets
✅ Rotate tokens regularly (every 6 months)
✅ Limit token permissions to minimum needed
✅ Monitor secret usage in logs
✅ Use branch protection rules
✅ Require status checks before merging

---

## Testing Workflow

Test files are in `.github/workflows/`:

### ci.yml - Continuous Integration
- Runs on: Pull requests, push to main/develop
- Tests: Linting, type-check, build
- Time: ~5-10 minutes

### deploy.yml - Continuous Deployment  
- Runs on: Push to main only
- Deploys: Frontend + Backend
- Time: ~10-15 minutes
- Notifications: Slack on success/failure

---

## Support

If secrets fail:
1. Check GitHub Actions logs: Actions → Latest workflow → View logs
2. Verify each token has correct permissions
3. Ensure tokens haven't expired
4. Check that repository is connected to Vercel/Railway

---

**Next:** Commit this config and push to trigger your first automated deployment! 🚀
