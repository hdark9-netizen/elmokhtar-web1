\
    import React, { useEffect, useRef, useState } from 'react';

    // Simple autosave hook (saves to localStorage)
    function useAutoSave(key, state, delay = 1200) {
      const timer = useRef(null);
      useEffect(() => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          try { localStorage.setItem(key, JSON.stringify(state)); } catch(e){ console.error(e); }
        }, delay);
        return () => clearTimeout(timer.current);
      }, [key, state, delay]);
    }

    // Utility: load from localStorage
    function load(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
      } catch (e) { return fallback; }
    }

    export default function App(){
      const [user, setUser] = useState(() => load('elm_user', null));
      const [invoices, setInvoices] = useState(() => load('elm_invoices', [
        { id: Date.now(), number: 'INV-001', date: new Date().toISOString().slice(0,10), customer: 'عميل تجريبي', total: 120, lines: []}
      ]));
      const [products, setProducts] = useState(() => load('elm_products', [
        { id: 'p1', sku:'P-001', name:'منتج تجريبي', price:50, stock:100 }
      ]));
      const [warehouses, setWarehouses] = useState(() => load('elm_warehouses', [
        { id: 'w1', name: 'المخزن الرئيسي' }
      ]));
      const [expenses, setExpenses] = useState(() => load('elm_expenses', []));
      const [revenues, setRevenues] = useState(() => load('elm_revenues', []));

      // autosave to localStorage
      useAutoSave('elm_invoices', invoices);
      useAutoSave('elm_products', products);
      useAutoSave('elm_warehouses', warehouses);
      useAutoSave('elm_expenses', expenses);
      useAutoSave('elm_revenues', revenues);
      useAutoSave('elm_user', user);

      // simple demo login: Elmokhtar / ١٠٢٠٣٠ or 102030
      function tryLogin(username, password){
        if(username === 'Elmokhtar' && (password === '١٠٢٠٣٠' || password === '102030' || password === '102030')) {
          const u = { username: 'Elmokhtar', role: 'admin' };
          setUser(u); localStorage.setItem('elm_user', JSON.stringify(u));
          return true;
        }
        return false;
      }

      if(!user) return <LoginScreen onLogin={tryLogin} />;

      return (
        <div className="min-h-screen p-6 bg-gray-100 text-gray-900" dir="rtl">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">إدارة متكاملة للنشاط التجاري — Elmokhtar</h1>
              <div className="text-sm text-gray-600">مسجّل دخول باسم: {user.username} — صلاحية: {user.role}</div>
            </div>
            <div className="flex gap-2 items-center">
              <button className="px-3 py-1 border rounded" onClick={() => { localStorage.clear(); window.location.reload(); }}>خروج / إعادة ضبط</button>
              <ExportButton data={{invoices, products, warehouses, expenses, revenues}} />
            </div>
          </header>

          <main className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-4">
              <Dashboard invoices={invoices} products={products} expenses={expenses} revenues={revenues} />
              <InvoicesPanel invoices={invoices} setInvoices={setInvoices} products={products} setProducts={setProducts} />
              <ExpensesPanel expenses={expenses} setExpenses={setExpenses} />
            </div>

            <aside className="space-y-4">
              <ProductsPanel products={products} setProducts={setProducts} />
              <WarehousePanel warehouses={warehouses} setWarehouses={setWarehouses} products={products} setProducts={setProducts} />
              <RevenuesPanel revenues={revenues} setRevenues={setRevenues} />
            </aside>
          </main>
        </div>
      );
    }

    function LoginScreen({onLogin}) {
      const [username, setUsername] = useState('');
      const [password, setPassword] = useState('');
      const [error, setError] = useState('');
      function submit(e){
        e.preventDefault();
        if(onLogin(username, password)) return;
        setError('بيانات الدخول غير صحيحة — جرب Elmokhtar و ١٠٢٠٣٠');
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <form onSubmit={submit} className="bg-white p-6 rounded shadow w-full max-w-sm">
            <h2 className="text-lg font-bold mb-3">تسجيل الدخول — Elmokhtar</h2>
            <label className="block text-sm">اسم المستخدم
              <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full mt-1 p-2 border rounded" />
            </label>
            <label className="block text-sm mt-2">كلمة المرور
              <input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full mt-1 p-2 border rounded" />
            </label>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            <div className="mt-4 flex gap-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded">دخول</button>
              <button type="button" onClick={()=>{ setUsername('Elmokhtar'); setPassword('١٠٢٠٣٠'); }} className="px-3 py-1 border rounded">تعبئة تلقائية</button>
            </div>
            <p className="text-xs text-gray-500 mt-3">هذه حساب تجريبي. للتشغيل الحقيقي اربط المشروع بـ Supabase كما في دليل النشر.</p>
          </form>
        </div>
      );
    }

    function Dashboard({invoices, products, expenses, revenues}){
      const totalRevenue = invoices.reduce((s,i)=>s + (Number(i.total)||0),0) + revenues.reduce((s,r)=>s+Number(r.amount||0),0);
      const totalExpenses = expenses.reduce((s,e)=>s + (Number(e.amount)||0),0);
      return (
        <div className="bg-white p-4 rounded shadow">
          <div className="grid grid-cols-3 gap-4">
            <StatCard title="إجمالي الإيرادات" value={`${totalRevenue.toFixed(2)} ج.م`} />
            <StatCard title="إجمالي المصروفات" value={`${totalExpenses.toFixed(2)} ج.م`} />
            <StatCard title="المنتجات" value={products.length} />
          </div>
        </div>
      );
    }

    function StatCard({title, value}) {
      return (
        <div className="p-3 border rounded">
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-xl font-bold">{value}</div>
        </div>
      );
    }

    function ProductsPanel({products, setProducts}) {
      const [form, setForm] = useState({name:'', sku:'', price:0, stock:0});
      function add(e){ e.preventDefault(); setProducts(prev=>[{...form, id:Date.now().toString()}, ...prev]); setForm({name:'', sku:'', price:0, stock:0}); }
      function remove(id){ setProducts(prev=>prev.filter(p=>p.id!==id)); }
      return (
        <div className="bg-white p-3 rounded shadow">
          <h3 className="font-semibold mb-2">المنتجات</h3>
          <form onSubmit={add} className="space-y-2 text-sm">
            <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="اسم المنتج" className="w-full border p-2 rounded" />
            <div className="flex gap-2">
              <input value={form.sku} onChange={e=>setForm({...form, sku:e.target.value})} placeholder="SKU" className="flex-1 border p-2 rounded" />
              <input type="number" value={form.price} onChange={e=>setForm({...form, price:Number(e.target.value)})} placeholder="سعر" className="w-28 border p-2 rounded" />
            </div>
            <div className="flex gap-2">
              <input type="number" value={form.stock} onChange={e=>setForm({...form, stock:Number(e.target.value)})} placeholder="كمية" className="w-28 border p-2 rounded" />
              <button className="px-3 py-1 bg-blue-600 text-white rounded">أضف</button>
            </div>
          </form>
          <ul className="mt-3 text-sm space-y-1">
            {products.map(p=>(
              <li key={p.id} className="flex justify-between items-center border-b py-1">
                <div>{p.name} — {p.sku} — {p.price} ج.م — {p.stock} قطعة</div>
                <div className="flex gap-2">
                  <button onClick={()=>remove(p.id)} className="px-2 py-1 border rounded text-sm">حذف</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    function WarehousePanel({warehouses, setWarehouses, products, setProducts}) {
      const [name, setName] = useState('');
      function add(){ if(!name) return; setWarehouses(prev=>[{id:Date.now().toString(), name}, ...prev]); setName(''); }
      return (
        <div className="bg-white p-3 rounded shadow">
          <h3 className="font-semibold mb-2">المخازن (الخزن)</h3>
          <div className="flex gap-2">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="اسم المخزن" className="flex-1 border p-2 rounded" />
            <button onClick={add} className="px-3 py-1 bg-blue-600 text-white rounded">أضف</button>
          </div>
          <ul className="text-sm mt-2">
            {warehouses.map(w=> <li key={w.id} className="py-1 border-b">{w.name}</li>)}
          </ul>
        </div>
      );
    }

    function InvoicesPanel({invoices, setInvoices, products, setProducts}) {
      const [open, setOpen] = useState(false);
      const [form, setForm] = useState({number:`INV-${Date.now()}`, date:new Date().toISOString().slice(0,10), customer:'', lines:[], total:0});
      useEffect(()=> { const t = form.lines.reduce((s,l)=>s + (l.qty*l.unit_price),0); setForm(f=>({...f, total: t})); }, [form.lines]);

      function addLine(){ setForm(f=>({...f, lines:[...f.lines, {id:Date.now(), product_id: products[0]?.id || '', qty:1, unit_price: products[0]?.price || 0}]})); }
      function updateLine(id, key, value){ setForm(f=>({...f, lines: f.lines.map(l=> l.id===id? {...l, [key]: value} : l)})); }
      function save(e){ e.preventDefault(); setInvoices(prev=>[{...form, id: Date.now().toString()}, ...prev]); // update stock
        form.lines.forEach(ln=> {
          const p = products.find(x=>x.id===ln.product_id);
          if(p){ setProducts(prev=> prev.map(pp=> pp.id===p.id? {...pp, stock: Number(pp.stock) - Number(ln.qty)} : pp )); }
        });
        setForm({number:`INV-${Date.now()}`, date:new Date().toISOString().slice(0,10), customer:'', lines:[], total:0});
        setOpen(false);
      }

      return (
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">الفواتير</h3>
            <div><button onClick={()=>setOpen(true)} className="px-3 py-1 bg-green-600 text-white rounded">فاتورة جديدة</button></div>
          </div>

          {open && (
            <form onSubmit={save} className="mt-3 space-y-2 text-sm">
              <input className="w-full border p-2 rounded" value={form.customer} onChange={e=>setForm({...form, customer:e.target.value})} placeholder="اسم العميل" />
              <div className="space-y-2">
                {form.lines.map(line=>(
                  <div key={line.id} className="flex gap-2">
                    <select className="border p-2 rounded" value={line.product_id} onChange={e=>updateLine(line.id, 'product_id', e.target.value)}>
                      {products.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" className="w-20 border p-2 rounded" value={line.qty} onChange={e=>updateLine(line.id, 'qty', Number(e.target.value))} />
                    <input type="number" className="w-28 border p-2 rounded" value={line.unit_price} onChange={e=>updateLine(line.id, 'unit_price', Number(e.target.value))} />
                    <div className="w-28 p-2">{(line.qty * line.unit_price).toFixed(2)}</div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <button type="button" onClick={addLine} className="px-3 py-1 border rounded">أضف بند</button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>الإجمالي: <strong>{form.total.toFixed(2)}</strong> ج.م</div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded">حفظ الفاتورة</button>
                  <button type="button" onClick={()=>setOpen(false)} className="px-3 py-1 border rounded">إلغاء</button>
                </div>
              </div>
            </form>
          )}

          <ul className="mt-3 text-sm">
            {invoices.map(inv=>(
              <li key={inv.id} className="border-b py-2 flex justify-between">
                <div>{inv.number} — {inv.customer || 'عميل غير معروف'}</div>
                <div className="text-xs text-gray-500">{inv.total} ج.م — {inv.date}</div>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    function ExpensesPanel({expenses, setExpenses}) {
      const [form, setForm] = useState({amount:0, category:'', notes:''});
      function add(e){ e.preventDefault(); setExpenses(prev=>[{...form, id:Date.now().toString(), date:new Date().toISOString().slice(0,10)}, ...prev]); setForm({amount:0, category:'', notes:''}); }
      return (
        <div className="bg-white p-3 rounded shadow">
          <h3 className="font-semibold mb-2">المصروفات</h3>
          <form onSubmit={add} className="space-y-2 text-sm">
            <input value={form.amount} onChange={e=>setForm({...form, amount:Number(e.target.value)})} placeholder="المبلغ" className="w-full border p-2 rounded" />
            <input value={form.category} onChange={e=>setForm({...form, category:e.target.value})} placeholder="التصنيف" className="w-full border p-2 rounded" />
            <input value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} placeholder="ملاحظات" className="w-full border p-2 rounded" />
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded">أضف</button>
            </div>
          </form>
          <ul className="mt-2 text-sm">
            {expenses.map(ex=> <li key={ex.id} className="py-1 border-b">{ex.date} — {ex.amount} ج.م — {ex.category}</li>)}
          </ul>
        </div>
      );
    }

    function RevenuesPanel({revenues, setRevenues}) {
      const [form, setForm] = useState({amount:0, source:'', notes:''});
      function add(e){ e.preventDefault(); setRevenues(prev=>[{...form, id:Date.now().toString(), date:new Date().toISOString().slice(0,10)}, ...prev]); setForm({amount:0, source:'', notes:''}); }
      return (
        <div className="bg-white p-3 rounded shadow">
          <h3 className="font-semibold mb-2">الإيرادات</h3>
          <form onSubmit={add} className="space-y-2 text-sm">
            <input value={form.amount} onChange={e=>setForm({...form, amount:Number(e.target.value)})} placeholder="المبلغ" className="w-full border p-2 rounded" />
            <input value={form.source} onChange={e=>setForm({...form, source:e.target.value})} placeholder="المصدر" className="w-full border p-2 rounded" />
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded">أضف</button>
            </div>
          </form>
          <ul className="mt-2 text-sm">
            {revenues.map(rv=> <li key={rv.id} className="py-1 border-b">{rv.date} — {rv.amount} ج.م — {rv.source}</li>)}
          </ul>
        </div>
      );
    }

    function ExportButton({data}) {
      function downloadJSON() {
        const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'elmokhtar-backup.json'; a.click();
        URL.revokeObjectURL(url);
      }
      return <button onClick={downloadJSON} className="px-3 py-1 border rounded">تنزيل نسخة احتياطية</button>;
    }
