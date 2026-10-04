# Render Deployment Guide for UniPilot (عربي/English)

## 🎯 Prerequisites قبل البدء

✅ **حساب Render** - https://render.com
✅ **مستودع GitHub** - https://github.com/Nibrasdaboul/UniPilot_V3.0.0.1
✅ **PostgreSQL Database** - يتم إنشاؤها تلقائياً من Render Blueprint
✅ **متغيرات البيئة** - ستضبطها في Dashboard

---

## 📋 الخطوة 1: إعدادات متغيرات البيئة (Environment Variables)

### المتطلبات الإجبارية (REQUIRED):

```env
# 🔐 Security
NODE_ENV=production
JWT_SECRET=your-32-character-secret-key-minimum-32-chars-required-for-security
PORT=3001

# 📊 Database
DATABASE_URL=postgresql://user:password@host:5432/unipilot

# 🌐 Frontend URLs
VITE_BACKEND_URL=https://unipilot-backend.onrender.com
APP_URL=https://unipilot-backend.onrender.com
FRONTEND_ORIGIN=https://unipilot-backend.onrender.com

# 🎯 Serve Frontend (Production)
SERVE_FRONTEND=1
```

### المتطلبات الاختيارية (OPTIONAL):

```env
# 💳 Stripe (للدفع)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_PRO_PLAN_PRICE_ID=price_xxxxx
STRIPE_STUDENT_PLAN_PRICE_ID=price_xxxxx

# 🤖 Groq AI
GROQ_API_KEY=gsk_xxxxx

# 📊 Monitoring
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
POSTHOG_API_KEY=phc_xxxxx
LOG_LEVEL=info

# 🚀 Redis (اختياري)
REDIS_URL=redis://xxxxx
```

---

## 🚀 الخطوة 2: نشر على Render

### الطريقة A: من خلال Blueprint (الموصى به)

1. اذهب إلى: https://dashboard.render.com/
2. اضغط **"New +"** → **"Blueprint"**
3. ألصق رابط المستودع: `https://github.com/Nibrasdaboul/UniPilot_V3.0.0.1`
4. سيقرأ Render ملف `render.yaml` تلقائياً
5. أدخل متغيرات البيئة الإجبارية:
   - **JWT_SECRET**: نسخ من قيمة عشوائية آمنة (32+ حرف)
   - **VITE_BACKEND_URL**: `https://unipilot-backend.onrender.com`
   - **APP_URL**: نفس الرابط أعلاه
   - **FRONTEND_ORIGIN**: نفس الرابط أو `*`
6. اضغط **"Deploy Blueprint"**

### الطريقة B: يدويًا (من Web Service)

1. اذهب إلى: https://dashboard.render.com/
2. اضغط **"New +"** → **"Web Service"**
3. ربط حسابك بـ GitHub
4. اختر المستودع: `Nibrasdaboul/UniPilot_V3.0.0.1`
5. استخدم الإعدادات التالية:

```
Name: unipilot
Environment: Node
Build Command: npm install && npm run build
Start Command: node server/index.js
Plan: Free (أو Paid حسب احتياجاتك)
```

6. أضف متغيرات البيئة (انظر الخطوة 1)
7. اضغط **"Create Web Service"**

---

## ✅ الخطوة 3: التحقق من الحسابات التجريبية

### 3.1 فحص قاعدة البيانات

بعد النشر بـ 2-5 دقائق، ستظهر رسائل في السجلات:

```
🌱 Starting college bootstrap...
✅ Bootstrap Dean (created): 0261000001 / College123!
✅ Bootstrap student (created): 0260000003 / College123!
✅ Bootstrap Student Affairs (created): 0261000002 / College123!
✅ College bootstrap completed
UniPilot API running at http://localhost:3001
```

**إذا لم تظهر هذه الرسائل:**
- تحقق من سجلات Render: Menu → Logs
- تأكد من `DATABASE_URL` صحيح
- تأكد من `NODE_ENV=production`

### 3.2 اختبار تسجيل الدخول (Login Test)

استخدم أداة مثل **Postman** أو **cURL**:

```bash
curl -X POST "https://unipilot-backend.onrender.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "university_id": "0260000003",
    "password": "College123!"
  }'
```

**الإجابة المتوقعة:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 3,
    "person_code": "0260000003",
    "full_name": "طالب تجريبي",
    "role": "student",
    "email": null,
    "avatar_url": null,
    "created_at": "2026-10-04T10:30:00Z"
  }
}
```

---

## 🧪 الخطوة 4: اختبار API Endpoints الكاملة

### 4.1 اختبار الصحة (Health Check)

```bash
# فحص بسيط
curl https://unipilot-backend.onrender.com/api/health

# الإجابة المتوقعة:
# {"status":"ok"}
```

### 4.2 فحص جاهزية قاعدة البيانات

```bash
curl https://unipilot-backend.onrender.com/api/ready

# الإجابة المتوقعة:
# {"status":"ready","database":"connected"}
```

### 4.3 اختبار Dashboard

```bash
# احصل على access_token أولاً (من 3.2)
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET "https://unipilot-backend.onrender.com/api/dashboard/summary" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# الإجابة المتوقعة:
# {
#   "pending_tasks": 0,
#   "today_sessions": 0,
#   "courses_count": 0,
#   "avg_progress": 0,
#   "semester_gpa": 0,
#   "cgpa": 0,
#   "semester_percent": 0,
#   "cumulative_percent": 0,
#   "completed_courses": [],
#   "carried_courses": []
# }
```

### 4.4 اختبار إضافة مادة دراسية (Course)

```bash
curl -X POST "https://unipilot-backend.onrender.com/api/student/courses" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "course_name": "مقدمة البرمجة",
    "course_code": "CS101",
    "credit_hours": 3,
    "semester_id": 1
  }'
```

### 4.5 اختبار الملاحظات (Notes)

```bash
# الحصول على الملاحظات
curl -X GET "https://unipilot-backend.onrender.com/api/notes" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# إضافة ملاحظة جديدة
curl -X POST "https://unipilot-backend.onrender.com/api/notes" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "هذه ملاحظة اختبار",
    "student_course_id": null
  }'
```

---

## 📊 الخطوة 5: مراقبة الأداء

### 5.1 فحص السجلات (Logs)

في لوحة تحكم Render:
1. اضغط على اسم الخدمة: **unipilot**
2. اختر تبويب **"Logs"**
3. ابحث عن رسائل الأخطاء أو التحذيرات

### 5.2 معالجة المشاكل الشائعة

#### ❌ مشكلة: "DATABASE_URL is required"
**الحل:**
```
1. اذهب إلى Settings → Environment
2. تأكد من وجود DATABASE_URL
3. تأكد من أنها تبدأ بـ: postgresql://
```

#### ❌ مشكلة: "Invalid JWT_SECRET"
**الحل:**
```
JWT_SECRET يجب أن يكون:
- أكثر من 32 حرف
- عشوائي وآمن
مثال: 
mk@9XzK$pL#2vN%5qR&8sT!3uV(4wX)7yZ
```

#### ❌ مشكلة: "CORS Error"
**الحل:**
```env
FRONTEND_ORIGIN=https://your-frontend-url.com
# أو للاختبار السريع:
FRONTEND_ORIGIN=*
```

#### ❌ مشكلة: الحسابات التجريبية لم تُنشأ
**الحل:**
```
1. تحقق من السجلات (Logs)
2. تأكد من أن initDb() أنهت بدء النظام بنجاح
3. جرب إعادة النشر: Deploy → Redeploy
4. تحقق من جداول البيانات مباشرة عبر:
   psql $DATABASE_URL -c "SELECT * FROM users LIMIT 5;"
```

---

## 🔧 الخطوة 6: اختبار متقدم (Test Suite)

### 6.1 اختبار كامل محاكي Render

أنشئ ملف `test.api.sh`:

```bash
#!/bin/bash

# المتغيرات
API_URL="https://unipilot-backend.onrender.com"
DEMO_ID="0260000003"
DEMO_PASS="College123!"

echo "🧪 UniPilot API Test Suite"
echo "================================"

# 1. Health Check
echo "✅ Health Check..."
curl -s "$API_URL/api/health" | jq .

# 2. Ready Check
echo "✅ Ready Check..."
curl -s "$API_URL/api/ready" | jq .

# 3. Login
echo "✅ Login Test..."
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"university_id\":\"$DEMO_ID\",\"password\":\"$DEMO_PASS\"}")
echo "$RESPONSE" | jq .
TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')

# 4. Get User Profile
echo "✅ Get User Profile..."
curl -s -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/auth/me" | jq .

# 5. Dashboard
echo "✅ Dashboard Summary..."
curl -s -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/dashboard/summary" | jq .

echo "================================"
echo "✅ All tests completed!"
```

### 6.2 تشغيل الاختبارات

```bash
chmod +x test.api.sh
./test.api.sh
```

---

## 🎉 قائمة التحقق النهائية

- [ ] DATABASE_URL مضبوط ويتصل
- [ ] JWT_SECRET قوي وفريد
- [ ] VITE_BACKEND_URL صحيح
- [ ] الحسابات التجريبية ظاهرة في السجلات
- [ ] /api/health يعطي استجابة صحيحة
- [ ] /api/ready يعطي استجابة صحيحة
- [ ] تسجيل الدخول يعمل بـ 0260000003 / College123!
- [ ] /api/dashboard/summary يعطي بيانات صحيحة
- [ ] الملاحظات تُحفظ واسترجع بنجاح
- [ ] المتغيرات الاختيارية مضبوطة (Stripe, Groq, Sentry)

---

## 📞 المساعدة والدعم

- **Render Docs**: https://render.com/docs
- **GitHub Issues**: https://github.com/Nibrasdaboul/UniPilot_V3.0.0.1/issues
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

**الآن جاهز للإطلاق! 🚀**
