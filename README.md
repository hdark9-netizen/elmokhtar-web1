# Elmokhtar - Web Accounting Starter

هذا مشروع بداية (Starter) لتطبيق محاسبة ويب. يحتوي على واجهة React + Vite + Tailwind، مع حفظ تلقائي محلي (localStorage) كنموذج جاهز للنشر على Vercel و الربط مع Supabase.

**ملاحظة مهمة:** هذا المشروع يحتوي على واجهة تجريبية (demo) لتسجيل الدخول باسم المستخدم `Elmokhtar` وكلمة المرور `١٠٢٠٣٠` أو `102030` (للتجربة المحلية فقط). يجب ربطه بمشروع Supabase حقيقي لإضافة مصادقة حقيقية وقاعدة بيانات.

## خطوات سريعة للنشر (بدون برامج محلية)
1. انزل ملف الـ ZIP من الفيديو أو من الرابط المرفق في هذه المحادثة.
2. افتح GitHub > New Repository > ارفع الملفات (Upload files) أو فك الـ ZIP وادفعه إلى repo.
3. افتح Vercel > New Project > Import from GitHub > اضبط متغيرات البيئة:
   - `VITE_SUPABASE_URL` = <SUPABASE_URL>
   - `VITE_SUPABASE_ANON_KEY` = <SUPABASE_ANON_KEY>
4. اضغط Deploy — Vercel سيشغّل `npm install` و `npm run build` تلقائياً.
5. في Supabase: أنشئ project، شغّل سكربت SQL لإنشاء الجداول (مثال في شرح الفيديو)، وأنشئ user إداري `Elmokhtar` بكلمة المرور `١٠٢٠٣٠`.
