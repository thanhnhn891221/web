'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet, Plus, Search, Filter, Eye, Edit, Trash2,
  DollarSign, Receipt, TrendingUp, TrendingDown,
  Calendar, Building2, ArrowUpRight, ArrowDownRight,
  FileText, CheckCircle2, AlertCircle, Clock, MoreHorizontal, Save
} from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, StatCard, ConfirmModal } from '@/components/ui';

type Tab = 'journal' | 'invoices';

export default function AMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('journal');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isInvModalOpen, setIsInvModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<any | null>(null);
  const [editingInv, setEditingInv] = useState<any | null>(null);

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
  const [txForm, setTxForm] = useState({ description: '', account: '1111', debit: '0', credit: '0', type: 'revenue', date: '' });
  const [invForm, setInvForm] = useState({ customerId: '', customerName: '', amount: '0', status: 'unpaid', dueDate: '', salesOrderId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tRes, iRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/invoices')
      ]);
      const tJson = await tRes.json();
      const iJson = await iRes.json();
      if (tJson.success) setTransactions(tJson.data);
      if (iJson.success) setInvoices(iJson.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  // SAVE Handlers
  const handleSaveTx = async () => {
    if (editingTx) {
      setConfirmConfig({
        isOpen: true,
        title: 'Cập nhật bút toán',
        message: `Xác nhận lưu thay đổi cho bút toán ${editingTx.code}?`,
        type: 'success',
        onConfirm: executeSaveTx
      });
    } else {
      executeSaveTx();
    }
  };

  const executeSaveTx = async () => {
    try {
      const url = editingTx ? `/api/transactions/${editingTx.id}` : '/api/transactions';
      const method = editingTx ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txForm)
      });
      if (res.ok) { 
        setIsTxModalOpen(false); 
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData(); 
      }
    } catch (err) { console.error(err); }
  };

  const handleSaveInv = async () => {
    if (editingInv) {
      setConfirmConfig({
        isOpen: true,
        title: 'Cập nhật hóa đơn',
        message: `Xác nhận lưu thay đổi cho hóa đơn ${editingInv.code}?`,
        type: 'success',
        onConfirm: executeSaveInv
      });
    } else {
      executeSaveInv();
    }
  };

  const executeSaveInv = async () => {
    try {
      const url = editingInv ? `/api/invoices/${editingInv.id}` : '/api/invoices';
      const method = editingInv ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invForm)
      });
      if (res.ok) { 
        setIsInvModalOpen(false); 
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData(); 
      }
    } catch (err) { console.error(err); }
  };

  // DELETE Handlers
  const confirmDeleteTx = (tx: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa bút toán',
      message: `Bạn có chắc chắn muốn xóa bút toán ${tx.code}? Dữ liệu sẽ được ẩn khỏi sổ cái.`,
      type: 'danger',
      onConfirm: () => executeDeleteTx(tx.id)
    });
  };

  const executeDeleteTx = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const confirmDeleteInv = (inv: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hủy hóa đơn',
      message: `Xác nhận hủy hóa đơn ${inv.code}? Dữ liệu sẽ được ẩn khỏi danh sách.`,
      type: 'danger',
      onConfirm: () => executeDeleteInv(inv.id)
    });
  };

  const executeDeleteInv = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  // Edit Init
  const openEditTx = (tx: any) => {
    setEditingTx(tx);
    setTxForm({
      description: tx.description,
      account: tx.account || '1111',
      debit: tx.debit.toString(),
      credit: tx.credit.toString(),
      type: tx.type || 'revenue',
      date: tx.date ? new Date(tx.date).toISOString().split('T')[0] : ''
    });
    setIsTxModalOpen(true);
  };

  const openEditInv = (inv: any) => {
    setEditingInv(inv);
    setInvForm({
      customerId: inv.customerId || '',
      customerName: inv.customerName || '',
      amount: inv.amount.toString(),
      status: inv.status || 'unpaid',
      dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
      salesOrderId: inv.salesOrderId || ''
    });
    setIsInvModalOpen(true);
  };

  const renderHeaderButton = () => {
    if (activeTab === 'journal') return (
      <Button icon={Plus} onClick={() => {
        setEditingTx(null);
        setTxForm({ description: '', account: '1111', debit: '0', credit: '0', type: 'revenue', date: '' });
        setIsTxModalOpen(true);
      }}>
        Ghi bút toán
      </Button>
    );
    if (activeTab === 'invoices') return (
      <Button icon={Plus} onClick={() => {
        setEditingInv(null);
        setInvForm({ customerId: '', customerName: '', amount: '0', status: 'unpaid', dueDate: '', salesOrderId: '' });
        setIsInvModalOpen(true);
      }}>
        Tạo hóa đơn
      </Button>
    );
    return <Button variant="outline" icon={FileText}>Xuất BCTC</Button>;
  };

  const totalRevenue = transactions.reduce((s, t) => s + (t.type === 'revenue' ? t.credit : 0), 0);
  const totalExpense = transactions.reduce((s, t) => s + (t.type === 'expense' ? t.debit : 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(142, 70%, 45%, 0.12)' }}>
            <Wallet size={22} style={{ color: 'hsl(142, 70%, 45%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AMS — Kế toán & Tài chính</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sổ cái, hóa đơn & báo cáo tài chính</p>
          </div>
        </div>
        {renderHeaderButton()}
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--primary-900)' }}>
        {[
          { key: 'journal', label: 'Sổ cái journal', icon: FileText },
          { key: 'invoices', label: 'Hóa đơn invoices', icon: Receipt },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab.key ? 'bg-[var(--primary-600)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--primary-600)]/10 hover:text-[var(--text-primary)]'}`}>
              <Icon size={16} />{tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'journal' && (
        <div className="space-y-4 animate-fade-in stagger-children">
           <div className="grid grid-cols-2 gap-4">
              <StatCard title="Tổng thu" value={totalRevenue.toLocaleString()} icon={TrendingUp} color="var(--emerald)" />
              <StatCard title="Tổng chi" value={totalExpense.toLocaleString()} icon={TrendingDown} color="var(--rose)" />
           </div>
           <Card padding="none" className="overflow-hidden border shadow-premium bg-white">
             <table className="w-full text-sm">
                <thead className="bg-[var(--slate-50)] text-slate-500 font-bold border-b text-[11px] uppercase tracking-wider">
                   <tr>
                      <th className="px-6 py-4 text-left">Ngày</th>
                      <th className="px-6 py-4 text-left">Diễn giải</th>
                      <th className="px-6 py-4 text-left">Tài khoản</th>
                      <th className="px-6 py-4 text-right">Nợ (Debit)</th>
                      <th className="px-6 py-4 text-right">Có (Credit)</th>
                      <th className="px-6 py-4 text-center">Thao tác</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => openEditTx(tx)}>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">{new Date(tx.date).toLocaleDateString('vi-VN')}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{tx.description}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono">{tx.account}</td>
                      <td className="px-6 py-4 text-right font-bold text-rose-500">{tx.debit > 0 ? tx.debit.toLocaleString() : '-'}</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600">{tx.credit > 0 ? tx.credit.toLocaleString() : '-'}</td>
                      <td className="px-6 py-4 text-center">
                         <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); openEditTx(tx); }} className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                              <Edit size={14} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); confirmDeleteTx(tx); }} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                              <Trash2 size={14} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </Card>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in stagger-children">
           {invoices.map(inv => (
             <Card key={inv.id} hover padding="md" className="group cursor-pointer" onClick={() => openEditInv(inv)}>
                <div className="flex items-start justify-between">
                   <div>
                      <Badge variant="custom" bg="var(--slate-100)" color="var(--primary-600)">{inv.code}</Badge>
                      <h3 className="font-bold text-sm mt-3 line-clamp-1">{inv.customerName || 'Vãng lai'}</h3>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                      <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>{inv.status}</Badge>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e) => { e.stopPropagation(); openEditInv(inv); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                           <Edit size={14} />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); confirmDeleteInv(inv); }} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                           <Trash2 size={14} />
                         </button>
                      </div>
                   </div>
                </div>
                <div className="mt-6 flex justify-between items-end pt-3 border-t">
                   <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Tổng tiền</p>
                      <p className="text-lg font-black text-blue-700">{inv.amount.toLocaleString()} <span className="text-xs font-normal">đ</span></p>
                   </div>
                   <p className="text-[10px] text-slate-400 font-bold uppercase">Hạn: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                </div>
             </Card>
           ))}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={isTxModalOpen} onClose={() => setIsTxModalOpen(false)} title={editingTx ? "Chỉnh sửa bút toán" : "Ghi bút toán mới"}
        footer={<><Button variant="ghost" onClick={() => setIsTxModalOpen(false)}>Hủy</Button><Button onClick={handleSaveTx} icon={editingTx ? Save : Plus}>{editingTx ? 'Cập nhật' : 'Lưu bút toán'}</Button></>}>
        <div className="space-y-4">
           <Input label="Diễn giải" value={txForm.description} onChange={e => setTxForm({...txForm, description: e.target.value})} placeholder="Thu tiền khách hàng..." />
           <div className="grid grid-cols-2 gap-4">
              <Input label="Ngày ghi sổ" type="date" value={txForm.date} onChange={e => setTxForm({...txForm, date: e.target.value})} />
              <Input label="Tài khoản đối ứng" value={txForm.account} onChange={e => setTxForm({...txForm, account: e.target.value})} placeholder="1111" />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <Select label="Loại giao dịch" value={txForm.type} onChange={e => setTxForm({...txForm, type: e.target.value})} 
                options={[{value:'revenue', label:'Thu nhập'}, {value:'expense', label:'Chi phí'}, {value:'receivable', label:'Phải thu'}, {value:'payable', label:'Phải trả'}]} />
              <div />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <Input label="Số tiền Nợ" type="number" value={txForm.debit} onChange={e => setTxForm({...txForm, debit: e.target.value})} />
              <Input label="Số tiền Có" type="number" value={txForm.credit} onChange={e => setTxForm({...txForm, credit: e.target.value})} />
           </div>
        </div>
      </Modal>

      <Modal isOpen={isInvModalOpen} onClose={() => setIsInvModalOpen(false)} title={editingInv ? "Cập nhật hóa đơn" : "Tạo hóa đơn mới"}
        footer={<><Button variant="ghost" onClick={() => setIsInvModalOpen(false)}>Hủy</Button><Button onClick={handleSaveInv} icon={editingInv ? Save : Plus}>{editingInv ? 'Cập nhật' : 'Lưu hóa đơn'}</Button></>}>
        <div className="space-y-4">
            <Input label="Khách hàng" value={invForm.customerName} onChange={e => setInvForm({...invForm, customerName: e.target.value})} placeholder="Tên khách hàng/đại lý..." />
            <div className="grid grid-cols-2 gap-4">
               <Input label="Tổng tiền" type="number" value={invForm.amount} onChange={e => setInvForm({...invForm, amount: e.target.value})} />
               <Input label="Ngày đáo hạn" type="date" value={invForm.dueDate} onChange={e => setInvForm({...invForm, dueDate: e.target.value})} />
            </div>
            <Select label="Trạng thái" value={invForm.status} onChange={e => setInvForm({...invForm, status: e.target.value})} options={[{value:'paid', label:'Đã thanh toán'}, {value:'unpaid', label:'Chưa thanh toán'}, {value:'overdue', label:'Quá hạn'}, {value:'draft', label:'Nháp'}]} />
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
