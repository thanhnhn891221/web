'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, 
  Target, Zap, PieChart, ArrowUpRight, 
  Download, RefreshCw, Filter, Calendar, Activity,
  Edit, Trash2, Plus, Save, Building2
} from 'lucide-react';
import { Card, StatCard, Badge, Button, Modal, Input, Select, ConfirmModal } from '@/components/ui';

type Tab = 'dashboard' | 'budgets';

export default function BMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [budgets, setBudgets] = useState<any[]>([]);
  const [biData, setBiData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any | null>(null);

  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'success' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: () => {},
  });

  // Form state
  const [formData, setFormData] = useState({ departmentName: '', period: '2026', allocated: '0', spent: '0', status: 'active' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/budgets');
      const json = await res.json();
      if (json.success) setBudgets(json.data);

      // Simulated BI Data
      setBiData({
        revenue: 1250000000,
        growth: 12.5,
        leads: 450,
        conversion: 8.2,
        topProducts: [
          { name: 'Sợi Cotton', sales: 450 },
          { name: 'Vải lụa', sales: 320 },
          { name: 'Sợi PE', sales: 280 }
        ]
      });
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  // SAVE Handler
  const handleSave = async () => {
    if (editingBudget) {
      setConfirmConfig({
        isOpen: true,
        title: 'Cập nhật ngân sách',
        message: `Xác nhận lưu thay đổi cho ngân sách ${editingBudget.departmentName}?`,
        type: 'success',
        onConfirm: executeSave
      });
    } else {
      executeSave();
    }
  };

  const executeSave = async () => {
    try {
      const url = editingBudget ? `/api/budgets/${editingBudget.id}` : '/api/budgets';
      const method = editingBudget ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) { 
        setIsModalOpen(false); 
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData(); 
      }
    } catch (err) { console.error(err); }
  };

  // DELETE Handler
  const confirmDelete = (b: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa ngân sách',
      message: `Bạn có chắc chắn muốn xóa bản ghi ngân sách của ${b.departmentName}?`,
      type: 'danger',
      onConfirm: () => executeDelete(b.id)
    });
  };

  const executeDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  // Edit Init
  const openEdit = (b: any) => {
    setEditingBudget(b);
    setFormData({
      departmentName: b.departmentName,
      period: b.period || '2026',
      allocated: b.allocated.toString(),
      spent: b.spent.toString(),
      status: b.status || 'active'
    });
    setIsModalOpen(true);
  };

  const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(250, 80%, 50%, 0.12)' }}>
            <BarChart3 size={22} style={{ color: 'hsl(250, 80%, 50%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">BMS — Business Intelligence</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Phân tích dữ liệu, xu hướng & dự báo AI</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="ghost" onClick={() => setActiveTab(activeTab === 'dashboard' ? 'budgets' : 'dashboard')}>
             {activeTab === 'dashboard' ? 'Quản lý Ngân sách' : 'Xem Dashboard'}
           </Button>
           {activeTab === 'budgets' && <Button icon={Plus} onClick={() => {
              setEditingBudget(null);
              setFormData({ departmentName: '', period: '2026', allocated: '0', spent: '0', status: 'active' });
              setIsModalOpen(true);
           }}>Tạo ngân sách</Button>}
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in stagger-children">
            <StatCard title="Doanh thu" value={biData ? fmt(biData.revenue) : '...'} icon={TrendingUp} color="var(--primary-500)" />
            <StatCard title="Tăng trưởng" value={biData ? `+${biData.growth}%` : '...'} icon={Zap} color="var(--amber)" />
            <StatCard title="Leads" value={biData ? biData.leads : '...'} icon={Users} color="var(--accent-500)" />
            <StatCard title="Chuyển đổi" value={biData ? `${biData.conversion}%` : '...'} icon={Target} color="var(--emerald)" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card padding="lg" className="lg:col-span-2">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold">Xu hướng doanh thu (AI Forecast)</h3>
                  <Badge variant="success">Tin cậy: 94%</Badge>
               </div>
               <div className="h-[250px] flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed text-slate-400">
                  <div className="text-center">
                     <Activity size={32} className="mx-auto mb-2 opacity-20" />
                     <p className="text-xs uppercase font-bold tracking-widest">Neural Analysis Engine</p>
                  </div>
               </div>
            </Card>

            <Card padding="lg">
               <h3 className="font-bold mb-6">Sản phẩm bán chạy</h3>
               <div className="space-y-4">
                  {biData?.topProducts.map((p: any, i: number) => (
                     <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black">{i+1}</div>
                           <span className="text-xs font-bold text-slate-700">{p.name}</span>
                        </div>
                        <span className="text-xs font-black text-blue-600">{p.sales}</span>
                     </div>
                  ))}
               </div>
            </Card>
          </div>
          
          <Card padding="lg" className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                   <Zap size={20} className="text-yellow-400 fill-yellow-400" />
                   <h3 className="font-bold text-lg">AI Financial Insight</h3>
                </div>
                <p className="text-sm opacity-80 max-w-2xl leading-relaxed">
                   Dựa trên dòng tiền 30 ngày qua, chúng tôi nhận thấy tiềm năng tiết kiệm 12% chi phí vận chuyển nếu gộp các lô hàng từ đại lý khu vực Miền Nam.
                </p>
             </div>
             <div className="absolute -bottom-8 -right-8 opacity-10 rotate-12">
                <PieChart size={180} />
             </div>
          </Card>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in stagger-children">
           {budgets.map(b => (
              <Card key={b.id} hover padding="md" className="group cursor-pointer" onClick={() => openEdit(b)}>
                 <div className="flex items-start justify-between">
                    <div>
                       <Badge variant="custom" bg="var(--slate-100)" color="var(--primary-600)" size="sm">{b.period}</Badge>
                       <h3 className="font-bold text-sm mt-3 flex items-center gap-2">
                          <Building2 size={14} className="text-slate-400" />
                          {b.departmentName}
                       </h3>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <Badge variant={b.status === 'active' ? 'success' : 'default'}>{b.status}</Badge>
                       <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); openEdit(b); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                            <Edit size={14} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); confirmDelete(b); }} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                       </div>
                    </div>
                 </div>
                 <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-[11px] font-bold uppercase text-slate-400">
                       <span>Sử dụng</span>
                       <span className="text-slate-700">{Math.round((b.spent / b.allocated) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                       <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${Math.min(100, (b.spent / b.allocated) * 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs">
                       <span className="text-slate-500">Đã chi: <strong>{b.spent.toLocaleString()}</strong></span>
                       <span className="text-slate-500">Hạn mức: <strong>{b.allocated.toLocaleString()}</strong></span>
                    </div>
                 </div>
              </Card>
           ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBudget ? "Điều chỉnh ngân sách" : "Tạo ngân sách mới"}
        footer={<><Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button><Button onClick={handleSave} icon={editingBudget ? Save : Plus}>{editingBudget ? 'Cập nhật' : 'Lưu ngân sách'}</Button></>}>
        <div className="space-y-4">
           <Input label="Phòng ban / Dự án" value={formData.departmentName} onChange={e => setFormData({...formData, departmentName: e.target.value})} placeholder="Phòng Marketing..." />
           <div className="grid grid-cols-2 gap-4">
              <Input label="Giai đoạn / Năm" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} placeholder="2026" />
              <Select label="Trạng thái" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} options={[{value:'active', label:'Đang cấp phép'}, {value:'closed', label:'Đã quyết toán'}]} />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <Input label="Ngân sách cấp (VNĐ)" type="number" value={formData.allocated} onChange={e => setFormData({...formData, allocated: e.target.value})} />
              <Input label="Đã giải ngân (VNĐ)" type="number" value={formData.spent} onChange={e => setFormData({...formData, spent: e.target.value})} />
           </div>
        </div>
      </Modal>

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
      />
    </div>
  );
}
