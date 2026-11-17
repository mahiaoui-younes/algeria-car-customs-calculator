# حاسبة جمركة السيارات - الجزائر

موقع ثابت (HTML + CSS + JS) بدون سيرفر، جاهز للنشر مجاناً على Netlify.

## النشر على Netlify (مجاناً)

1. ادخل إلى https://app.netlify.com/drop وسجّل حساباً مجانياً.
2. اسحب مجلد `website` كاملاً وأفلته في الصفحة.
3. من **Site configuration → Change site name** اختر اسماً، مثلاً `jomrouka-dz` فيصبح الرابط `https://jomrouka-dz.netlify.app`.

## بعد اختيار اسم الموقع

استبدل `YOUR-SITE.netlify.app` برابطك الحقيقي في هذه الملفات، ثم أعد رفع المجلد:
- `index.html` و `about.html` و `privacy.html` (الوسم canonical و og:url)
- `sitemap.xml` و `robots.txt`

وغيّر البريد `contact@example.com` في `about.html` إلى بريدك.

## جلب الزيارات (SEO)

1. سجّل الموقع في **Google Search Console** وأرسل `sitemap.xml`.
2. شارك الحاسبة في مجموعات فيسبوك الخاصة باستيراد السيارات في الجزائر.
3. زر «مشاركة على واتساب» داخل الحاسبة يساعد على الانتشار.

## الإعلانات (Google AdSense)

- AdSense يشترط عادةً **دومين خاص بك** (مثل `jomrouka-dz.com`، حوالي 10$ في السنة)، ولا يقبل غالباً روابط `netlify.app`. اربط الدومين من Netlify: **Domain management → Add a domain**.
- بعد القبول:
  1. الصق سكربت AdSense في `<head>` داخل `index.html` (يوجد تعليق يوضح المكان).
  2. الصق كود الوحدات الإعلانية داخل العناصر `ad-top` و `ad-middle` و `ad-bottom`.
  3. ضع سطر Google في ملف `ads.txt`.

## تحديث النسب عند صدور قانون مالية جديد

كل النسب وأسعار الصرف الاحتياطية موجودة في أعلى الملف `assets/app.js` داخل `CONFIG`.
