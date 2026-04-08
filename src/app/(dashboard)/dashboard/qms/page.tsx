'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Search, Filter, Plus, Eye, CheckCircle2,
  AlertCircle, Clock, FileText, User, Tag, MoreHorizontal,
  ClipboardCheck, Trash2, Check, X, Edit, Save
} from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, StatCard, ConfirmModal } from '@/components/ui';

export default function QMSPage() {
  const [checks, setChecks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<any>(null);
  const [editingCheck, setEditingCheck] = useState<any | null>(null);

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

  // Forms
  const [formData, setFormData] = useState({
    product: '', batch: '', type: 'final', inspector: 'Admin', note: '', result: 'pending', defectRate: '0',
    criteria: [{ name: 'Ngoại quan', standard: 'Không trầy xước', actual: 'Đạt', pass: true }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/quality-checks');
      const json = await res.json();
      if (json.success) setChecks(json.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  // SAVE Handler
  const handleSave = async () => {
    if (editingCheck) {
      setConfirmConfig({
        isOpen: true,
        title: 'Cập nhật phiếu kiểm',
        message: `Xác nhận lưu thay đổi cho phiếu kiểm ${editingCheck.code}?`,
        type: 'success',
        onConfirm: executeSave
      });
    } else {
      executeSave();
    }
  };

  const executeSave = async () => {
    try {
      const url = editingCheck ? `/api/quality-checks/${editingCheck.id}` : '/api/quality-checks';
      const method = editingCheck ? 'PUT' : 'POST';
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
  const confirmDelete = (check: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa phiếu kiểm',
      message: `Bạn có chắc chắn muốn xóa phiếu kiểm ${check.code}? Dữ liệu sẽ được ẩn khỏi hệ thống (Soft Delete).`,
      type: 'danger',
      onConfirm: () => executeDelete(check.id)
    });
  };

  const executeDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/quality-checks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  // Edit Init
  const openEdit = (check: any) => {
    setEditingCheck(check);
    setFormData({
      product: check.product,
      batch: check.batch,
      type: check.type || 'final',
      inspector: check.inspector || 'Admin',
      note: check.note || '',
      result: check.result || 'pending',
      defectRate: check.defectRate?.toString() || '0',
      criteria: check.criteria || []
    });
    setIsModalOpen(true);
  };

  const addCriteria = () => {
    setFormData({ ...formData, criteria: [...formData.criteria, { name: '', standard: '', actual: '', pass: true }] });
  };

  const removeCriteria = (idx: number) => {
    setFormData({ ...formData, criteria: formData.criteria.filter((_, i) => i !== idx) });
  };

  const updateCriteria = (idx: number, field: string, val: any) => {
    const newC = [...formData.criteria];
    (newC[idx] as any)[field] = val;
    setFormData({ ...formData, criteria: newC });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(142, 70%, 45%, 0.12)' }}>
            <ShieldCheck size={22} style={{ color: 'hsl(142, 70%, 45%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">QMS — Quản lý Chất lượng</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tiêu chuẩn, kiểm định & báo cáo KCS</p>
          </div>
        </div>
        <Button icon={Plus} onClick={() => {
          setEditingCheck(null);
          setFormData({
            product: '', batch: '', type: 'final', inspector: 'Admin', note: '', result: 'pending', defectRate: '0',
            criteria: [{ name: 'Ngoại quan', standard: 'Không trầy xước', actual: 'Đạt', pass: true }]
          });
          setIsModalOpen(true);
        }}>
          Tạo phiếu kiểm
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in stagger-children">
        <StatCard title="Đã kiểm" value={checks.length} icon={ClipboardCheck} color="var(--primary-500)" />
        <StatCard title="Đạt chuẩn" value={checks.filter(c => c.result === 'passed').length} icon={CheckCircle2} color="var(--emerald)" />
        <StatCard title="Lỗi (Defect)" value={checks.filter(c => c.result === 'failed').length} icon={AlertCircle} color="var(--rose)" />
        <StatCard title="Đang chờ" value={checks.filter(c => c.result === 'pending').length} icon={Clock} color="var(--amber)" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Tìm kiếm phiếu kiểm định..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--primary-500)] outline-none transition-all" />
        </div>
        <div className="sm:w-48 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-[var(--primary-500)] outline-none transition-all">
            <option value="">Tất cả trạng thái</option>
            <option value="passed">Đạt chuẩn</option>
            <option value="failed">Lỗi (Defect)</option>
            <option value="pending">Đang chờ</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {checks.map(check => (
          <Card key={check.id} hover padding="md" className="group cursor-pointer" onClick={() => openEdit(check)}>
            <div className="flex items-start justify-between">
              <div className="flex-1 cursor-pointer" onClick={() => setSelectedCheck(check)}>
                <p className="text-[10px] font-bold text-[var(--primary-500)] uppercase">{check.code}</p>
                <h3 className="font-semibold text-sm line-clamp-1">{check.product}</h3>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={check.result === 'passed' ? 'success' : check.result === 'failed' ? 'danger' : 'warning'}>{check.result}</Badge>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={(e) => { e.stopPropagation(); openEdit(check); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                     <Edit size={14} />
                   </button>
                   <button onClick={(e) => { e.stopPropagation(); confirmDelete(check); }} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                     <Trash2 size={14} />
                   </button>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2 cursor-pointer" onClick={() => setSelectedCheck(check)}>
              <div className="flex items-center justify-between text-[11px]">
                <span style={{ color: 'var(--text-muted)' }}>Lô hàng:</span>
                <span className="font-medium text-slate-700">{check.batch}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span style={{ color: 'var(--text-muted)' }}>Người kiểm:</span>
                <span className="font-medium text-slate-700">{check.inspector}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span style={{ color: 'var(--text-muted)' }}>Tỷ lệ lỗi:</span>
                <span className={`font-medium ${check.defectRate > 0 ? 'text-[var(--rose)]' : 'text-emerald-600'}`}>{check.defectRate}%</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Details Modal */}
      <Modal isOpen={!!selectedCheck} onClose={() => setSelectedCheck(null)} title={`Chi tiết phiếu: ${selectedCheck?.code}`} size="lg">
         <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 rounded-xl mb-4">
               <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Sản phẩm</p>
                  <p className="text-sm font-semibold">{selectedCheck?.product}</p>
               </div>
               <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Lô hàng</p>
                  <p className="text-sm font-semibold">{selectedCheck?.batch}</p>
               </div>
               <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Kết quả</p>
                  <Badge variant={selectedCheck?.result === 'passed' ? 'success' : 'danger'}>{selectedCheck?.result}</Badge>
               </div>
            </div>
            <h4 className="font-bold text-sm">Tiêu chí kiểm định</h4>
            <div className="border rounded-xl overflow-hidden shadow-sm">
               <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-slate-600">
                     <tr>
                        <th className="px-4 py-2.5 text-left font-semibold">Tiêu chí</th>
                        <th className="px-4 py-2.5 text-left font-semibold">Tiêu chuẩn</th>
                        <th className="px-4 py-2.5 text-left font-semibold">Thực tế</th>
                        <th className="px-4 py-2.5 text-center font-semibold">Kết quả</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                     {selectedCheck?.criteria?.map((c: any) => (
                        <tr key={c.id} className="hover:bg-slate-50">
                           <td className="px-4 py-2 opacity-80">{c.name}</td>
                           <td className="px-4 py-2 opacity-80">{c.standard}</td>
                           <td className="px-4 py-2 opacity-80">{c.actual}</td>
                           <td className="px-4 py-2 text-center">
                              {c.pass ? <Check size={16} className="text-emerald-500 mx-auto"/> : <X size={16} className="text-rose-500 mx-auto"/>}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            {selectedCheck?.note && (
               <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-xs italic">
                  <strong>Ghi chú:</strong> {selectedCheck.note}
               </div>
            )}
         </div>
      </Modal>

      {/* Edit/Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCheck ? "Cập nhật phiếu kiểm" : "Tạo phiếu kiểm mới"} size="xl"
         footer={<><Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button><Button onClick={handleSave} icon={editingCheck ? Save : Plus}>{editingCheck ? 'Cập nhật' : 'Lưu phiếu kiểm'}</Button></>}>
         <div className="grid grid-cols-2 gap-4 mb-6">
            <Input label="Sản phẩm" value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})} placeholder="Sợi dệt..." />
            <Input label="Lô hàng" value={formData.batch} onChange={e => setFormData({...formData, batch: e.target.value})} placeholder="LOT-001" />
         </div>
         <div className="grid grid-cols-3 gap-4 mb-6">
            <Select label="Phân loại" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} options={[{value:'inbound', label:'Nguyên liệu'}, {value:'process', label:'Bán thành phẩm'}, {value:'final', label:'Thành phẩm'}]} />
            <Select label="Kết quả" value={formData.result} onChange={e => setFormData({...formData, result: e.target.value})} options={[{value:'pending', label:'Chưa có'}, {value:'passed', label:'ĐẠT'}, {value:'failed', label:'KHÔNG ĐẠT'}]} />
            <Input label="Tỷ lệ lỗi (%)" type="number" value={formData.defectRate} onChange={e => setFormData({...formData, defectRate: e.target.value})} />
         </div>
         <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
               <h4 className="font-bold text-sm">Nhập tiêu chí kiểm định</h4>
               <Button size="sm" variant="outline" icon={Plus} onClick={addCriteria}>Thêm tiêu chí</Button>
            </div>
            {formData.criteria.map((c, i) => (
               <div key={i} className="flex items-center gap-3 animate-fade-in group/item">
                  <div className="flex-1 min-w-0"><Input value={c.name} onChange={e => updateCriteria(i, 'name', e.target.value)} placeholder="Tên tiêu chí" /></div>
                  <div className="flex-1 min-w-0"><Input value={c.standard} onChange={e => updateCriteria(i, 'standard', e.target.value)} placeholder="Tiêu chuẩn" /></div>
                  <div className="flex-1 min-w-0"><Input value={c.actual} onChange={e => updateCriteria(i, 'actual', e.target.value)} placeholder="Thực tế" /></div>
                  <button onClick={() => updateCriteria(i, 'pass', !c.pass)} className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${c.pass ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
                     {c.pass ? <Check size={18}/> : <X size={18}/>}
                  </button>
                  <button onClick={() => removeCriteria(i)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
               </div>
            ))}
         </div>
         <div className="mt-6">
            <Input label="Ghi chú tổng quát" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="..." />
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
