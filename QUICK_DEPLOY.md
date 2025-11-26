# ✅ Quick Deployment Checklist

**Use this for rapid deployment verification**

---

## 📝 Pre-Deployment (2 minutes)

- [ ] `ml-server/app.py` exists and has lazy loading
- [ ] `ml-server/requirements.txt` uses Python 3.11 compatible versions
- [ ] `ml-server/runtime.txt` says `python-3.11.9`
- [ ] `Procfile` contains: `web: cd ml-server && uvicorn app:app --host 0.0.0.0 --port $PORT`
- [ ] Models exist: `ml-server/models/model_bestmri.h5` and `voice_model.joblib`
- [ ] Git LFS configured: `git lfs ls-files` shows `model_bestmri.h5`

---

## 🚀 Deploy to Railway (5 minutes)

1. [ ] Push to GitHub: `git push origin main`
2. [ ] Go to [railway.app](https://railway.app)
3. [ ] New Project → Deploy from GitHub
4. [ ] Select: `kss-max/parkisons_python`
5. [ ] Wait for build (~3-5 min)
6. [ ] Check logs for: `✅ MRI model loaded`, `✅ Voice model loaded`
7. [ ] Copy deployment URL

---

## 🧪 Test Deployed API (3 minutes)

**Replace `YOUR_URL` with your Railway URL**

### 1. Health Check
```bash
curl https://YOUR_URL.railway.app/health
```
**Expected:** `"status": "healthy"`, both models `"available"`

### 2. Voice Prediction
```bash
curl -X POST https://YOUR_URL.railway.app/predict/voice \
  -H "Content-Type: application/json" \
  -d '{"features": [119.992, 157.302, 74.997, 0.00784, 0.00007, 0.00370, 0.00554, 0.01109, 0.04374, 0.426, 0.02182, 0.03130, 0.02971, 0.06545, 0.02211, 21.033, 0.414783, 0.815285, -4.813031, 0.266482, 2.301442, 0.284654]}'
```
**Expected:** `"prediction": "parkinsons"` or `"healthy"`, `"confidence": 0.XXX`

### 3. MRI Prediction (use Postman)
```
POST https://YOUR_URL.railway.app/predict/mri
Body: form-data
Key: file (File type)
Value: [Upload MRI image]
```
**Expected:** `"prediction": "parkinsons"` or `"normal"`, `"confidence": 0.XXX`

---

## ✅ Success Criteria

- [x] All 3 tests above pass
- [x] Response times < 1s (after first request)
- [x] No errors in Railway logs
- [x] Health endpoint responds in < 100ms

---

## 🔥 If Something Fails

**Build fails?**
→ Check Railway logs for missing dependencies
→ Verify Python version in runtime.txt

**Model not found?**
→ Run `git lfs ls-files` locally
→ Check Railway supports Git LFS (it does)

**Slow responses?**
→ First request is slow (5-10s) - this is normal
→ Subsequent requests should be fast

**Out of memory?**
→ Upgrade Railway plan (models need ~1GB RAM)

---

## 📚 Full Documentation

- **Testing:** See `ml-server/API_TESTING.md`
- **Deployment:** See `DEPLOYMENT_CHECKLIST.md`
- **Changes:** See `PULL_REQUEST_SUMMARY.md`

---

**Estimated Total Time:** 10 minutes  
**Difficulty:** Easy  
**Success Rate:** 95%+
