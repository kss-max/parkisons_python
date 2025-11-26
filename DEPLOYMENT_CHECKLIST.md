# 🚀 Deployment Checklist - FastAPI ML Server

Complete checklist for deploying the Parkinson's ML prediction server to Railway or Render.

---

## ✅ Pre-Deployment Checklist

### 1. Repository Structure ✓
- [x] `ml-server/app.py` exists as main FastAPI application
- [x] `ml-server/requirements.txt` with Python 3.11 compatible packages
- [x] `ml-server/runtime.txt` specifies `python-3.11.9`
- [x] `Procfile` in root with: `web: cd ml-server && uvicorn app:app --host 0.0.0.0 --port $PORT`
- [x] `railway.json` configured (for Railway deployment)
- [x] Models in `ml-server/models/` directory

### 2. Model Files ✓
- [x] `model_bestmri.h5` (18.9 MB) - Tracked with Git LFS
- [x] `voice_model.joblib` - Standard Git tracking
- [x] `.gitattributes` configured: `*.h5 filter=lfs diff=lfs merge=lfs -text`

**Git LFS Status:**
```bash
# Verify LFS tracking
git lfs ls-files
# Should show: model_bestmri.h5
```

### 3. Code Quality ✓
- [x] Lazy model loading implemented (models load on first request)
- [x] Proper logging configured
- [x] Error handling with clear messages
- [x] Health check endpoints (`/` and `/health`)
- [x] CORS middleware enabled
- [x] Inference time tracking

### 4. Dependencies ✓
All packages have prebuilt wheels for Python 3.11:
- [x] FastAPI 0.110.0
- [x] Uvicorn 0.29.0
- [x] TensorFlow 2.16.1 (Python 3.11 compatible)
- [x] NumPy 1.26.4
- [x] Pandas 2.2.2
- [x] scikit-learn 1.5.0
- [x] OpenCV 4.10.0.84 (headless)

---

## 🎯 Deployment Steps

### Option A: Railway Deployment

#### Step 1: Push to GitHub
```bash
cd "c:\MACHINE LEARNING\python_server"
git add -A
git commit -m "Production-ready: lazy loading, Python 3.11, improved error handling"
git push origin main
```

#### Step 2: Railway Setup
1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select repository: `kss-max/parkisons_python`
4. Railway will auto-detect:
   - ✅ `runtime.txt` → Python 3.11.9
   - ✅ `Procfile` → Start command
   - ✅ `requirements.txt` → Dependencies

#### Step 3: Configure Environment (Optional)
Railway automatically uses `$PORT` variable. No manual config needed.

**Optional Environment Variables:**
```
LOG_LEVEL=info
WORKERS=1
```

#### Step 4: Deploy & Monitor
- Click **"Deploy"**
- Wait for build (~3-5 minutes for TensorFlow compilation)
- Monitor logs for:
  - ✅ `MRI model loaded successfully`
  - ✅ `Voice model loaded successfully`
  - ✅ `Application startup complete`

#### Step 5: Test Deployed API
```bash
# Get your Railway URL from dashboard
curl https://your-app.railway.app/health

# Test endpoints
curl -X POST https://your-app.railway.app/predict/voice \
  -H "Content-Type: application/json" \
  -d '{"features": [119.992, 157.302, ...]}'
```

---

### Option B: Render Deployment

#### Step 1: Push to GitHub
Same as Railway Step 1 above.

#### Step 2: Render Setup
1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository: `kss-max/parkisons_python`

#### Step 3: Configure Service
Fill in the form:
- **Name:** `parkinsons-ml-server`
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Root Directory:** Leave empty (Procfile handles `cd ml-server`)
- **Runtime:** Python 3
- **Build Command:** `pip install -r ml-server/requirements.txt`
- **Start Command:** `cd ml-server && uvicorn app:app --host 0.0.0.0 --port $PORT`

#### Step 4: Advanced Settings
- **Python Version:** Select `3.11.9`
- **Instance Type:** Choose based on traffic
  - Free tier: Good for testing
  - Starter ($7/mo): Better for production

#### Step 5: Environment Variables (Optional)
Add if needed:
```
LOG_LEVEL=info
```

#### Step 6: Deploy & Test
- Click **"Create Web Service"**
- Monitor build logs
- Test with your Render URL

---

## 🔍 Post-Deployment Verification

### 1. Health Check
```bash
# Replace with your actual URL
curl https://your-app.railway.app/
curl https://your-app.railway.app/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "models": {
    "mri": "available",
    "voice": "available"
  }
}
```

### 2. MRI Endpoint Test
```bash
curl -X POST https://your-app.railway.app/predict/mri \
  -F "file=@path/to/test_mri.png"
```

**Expected:**
- ✅ Status 200
- ✅ Response contains `prediction` and `confidence`
- ✅ First request ~5-10s (TensorFlow compilation)
- ✅ Subsequent requests <1s

### 3. Voice Endpoint Test
```bash
curl -X POST https://your-app.railway.app/predict/voice \
  -H "Content-Type: application/json" \
  -d '{
    "features": [
      119.992, 157.302, 74.997, 0.00784, 0.00007,
      0.00370, 0.00554, 0.01109, 0.04374, 0.426,
      0.02182, 0.03130, 0.02971, 0.06545, 0.02211,
      21.033, 0.414783, 0.815285, -4.813031, 0.266482,
      2.301442, 0.284654
    ]
  }'
```

**Expected:**
- ✅ Status 200
- ✅ Response contains `prediction`, `confidence`, `probability`
- ✅ Response time <100ms

### 4. Load Testing (Optional)
```python
import requests
import time

url = "https://your-app.railway.app/predict/voice"
payload = {"features": [119.992, 157.302, ...]}  # 22 values

# Warm up
requests.post(url, json=payload)

# Test 10 requests
times = []
for _ in range(10):
    start = time.time()
    r = requests.post(url, json=payload)
    times.append(time.time() - start)
    assert r.status_code == 200

print(f"Avg response time: {sum(times)/len(times):.3f}s")
print(f"Min: {min(times):.3f}s, Max: {max(times):.3f}s")
```

---

## ⚠️ Known Issues & Solutions

### Issue 1: Build Timeout (Railway/Render)
**Symptom:** Build fails after 10-15 minutes
**Cause:** TensorFlow takes long to install
**Solution:**
- ✅ Already using Python 3.11 with prebuilt wheels
- ✅ Railway/Render should complete in ~3-5 minutes
- If still slow, check logs for package compilation warnings

### Issue 2: Model File Not Found
**Symptom:** `FileNotFoundError: MRI model not found`
**Cause:** Git LFS not configured on deployment platform
**Solution:**
```bash
# Verify LFS locally
git lfs ls-files

# On Railway/Render, LFS should work automatically
# If not, check their documentation for Git LFS support
```

### Issue 3: Out of Memory
**Symptom:** 137 exit code or "Killed" in logs
**Cause:** TensorFlow model + runtime exceeds memory limit
**Solution:**
- Railway: Increase memory in plan settings
- Render: Upgrade from Free to Starter plan (512 MB → 2 GB)

### Issue 4: Slow First Request
**Symptom:** First prediction takes 5-10 seconds
**Cause:** Normal TensorFlow behavior (graph compilation)
**Solution:**
- ✅ This is expected and documented
- Subsequent requests will be <1s
- Consider adding warmup if critical (load models on startup)

---

## 🔐 Security Recommendations

### For Production Deployment:

1. **Restrict CORS Origins**
   - Update `app.py`: Change `allow_origins=["*"]` to specific domains
   ```python
   allow_origins=["https://your-frontend.com", "https://www.your-app.com"]
   ```

2. **Add Rate Limiting**
   ```bash
   pip install slowapi
   ```
   Add to `app.py`:
   ```python
   from slowapi import Limiter
   limiter = Limiter(key_func=get_remote_address)
   app.state.limiter = limiter
   ```

3. **API Key Authentication (Optional)**
   - Add API key middleware for production
   - Use environment variables for keys

4. **HTTPS Only**
   - Railway/Render provide HTTPS by default ✓

---

## 📊 Monitoring & Logs

### Railway Logs
```bash
# View logs in Railway dashboard
# Or install Railway CLI
railway logs
```

### Render Logs
- Access via Render dashboard
- Check "Logs" tab for real-time monitoring

### Key Log Messages to Monitor:
- ✅ `MRI model loaded successfully in X.XXs`
- ✅ `Voice model loaded successfully in X.XXs`
- ✅ `Application startup complete`
- ⚠️ `Failed to load model` → Check file paths
- ⚠️ `OOM` or `137` → Memory issue

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ `/health` returns `"status": "healthy"`
- ✅ Both models show `"available"`
- ✅ MRI predictions work with test images
- ✅ Voice predictions work with test JSON
- ✅ Response times are acceptable (<1s after warmup)
- ✅ No errors in logs for 24 hours

---

## 📚 Next Steps After Deployment

1. **Frontend Integration**
   - Update frontend API URL to deployment URL
   - Test all endpoints from frontend

2. **Documentation**
   - Share API documentation with team
   - Update README with deployment URL

3. **Monitoring**
   - Set up uptime monitoring (e.g., UptimeRobot)
   - Configure alerts for downtime

4. **Performance**
   - Monitor response times
   - Consider caching for repeated requests
   - Add database for prediction history (optional)

---

## 🆘 Troubleshooting Resources

**Railway:**
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

**Render:**
- Docs: https://render.com/docs
- Support: https://render.com/support

**Git LFS:**
- Guide: https://git-lfs.github.com
- Troubleshooting: https://github.com/git-lfs/git-lfs/wiki

---

## 📋 Quick Reference

**Repository:** https://github.com/kss-max/parkisons_python

**Start Commands:**
- **Local:** `cd ml-server && uvicorn app:app --host 0.0.0.0 --port 8000 --reload`
- **Production:** `cd ml-server && uvicorn app:app --host 0.0.0.0 --port $PORT`

**Critical Files:**
- `ml-server/app.py` - Main application
- `ml-server/requirements.txt` - Dependencies
- `ml-server/runtime.txt` - Python version
- `Procfile` - Start command
- `.gitattributes` - Git LFS config

---

**Last Updated:** November 2025
**Status:** ✅ Production Ready
