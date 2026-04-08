'use client';

import React, { useState, useEffect } from 'react';
import {
  Server, Shield, Activity, Database, HardDrive,
  Clock, FileText, Plus, Search, Tag, User, AlertCircle, CheckCircle, Lock,
  PlusCircle, LayoutDashboard, Monitor, Ticket, Edit, Trash2, Save
} from 'lucide-react';
import { Button, Badge, Card, Modal, Input, Select, StatCard, ConfirmModal } from '@/components/ui';

type Tab = 'infrastructure' | 'assets' | 'support';

export default function IMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('infrastructure');
  const [assets, setAssets] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);
  const [editingTicket, setEditingTicket] = useState<any | null>(null);

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
  const [assetForm, setAssetForm] = useState({ code: '', name: '', type: 'workstation', status: 'active', location: '', assignedTo: '' });
  const [ticketForm, setTicketForm] = useState({ title: '', description: '', priority: 'medium', status: 'open', requester: 'Admin', assignee: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [assetRes, ticketRes] = await Promise.all([
        fetch('/api/it-assets'),
        fetch('/api/support-tickets')
      ]);
      const assetsJson = await assetRes.json();
      const ticketsJson = await ticketRes.json();
      if (assetsJson.success) setAssets(assetsJson.data);
      if (ticketsJson.success) setTickets(ticketsJson.data);
    } catch (error) {
      console.error('Failed to load IMS data', error);
    } finally {
      setIsLoading(false);
    }
  };

  // SAVE Handlers
  const handleSaveAsset = async () => {
    if (editingAsset) {
      setConfirmConfig({
        isOpen: true,
        title: 'Xác nhận cập nhật',
        message: `Bạn có muốn lưu thay đổi cho tài sản ${editingAsset.code}?`,
        type: 'success',
        onConfirm: executeSaveAsset
      });
    } else {
      executeSaveAsset();
    }
  };

  const executeSaveAsset = async () => {
    try {
      const url = editingAsset ? `/api/it-assets/${editingAsset.id}` : '/api/it-assets';
      const method = editingAsset ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetForm)
      });
      if (res.ok) { 
        setIsAssetModalOpen(false); 
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData(); 
      }
    } catch (err) { console.error(err); }
  };

  const handleSaveTicket = async () => {
    if (editingTicket) {
      setConfirmConfig({
        isOpen: true,
        title: 'Cập nhật Ticket',
        message: `Lưu thay đổi cho ticket ${editingTicket.code}?`,
        type: 'success',
        onConfirm: executeSaveTicket
      });
    } else {
      executeSaveTicket();
    }
  };

  const executeSaveTicket = async () => {
    try {
      const url = editingTicket ? `/api/support-tickets/${editingTicket.id}` : '/api/support-tickets';
      const method = editingTicket ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketForm)
      });
      if (res.ok) { 
        setIsTicketModalOpen(false); 
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData(); 
      }
    } catch (err) { console.error(err); }
  };

  // DELETE Handlers
  const confirmDeleteAsset = (asset: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xóa tài sản',
      message: `Xác nhận xóa tài sản ${asset.name} (${asset.code})? Bản ghi sẽ được lưu trữ trong lịch sử (Soft Delete).`,
      type: 'danger',
      onConfirm: () => executeDeleteAsset(asset.id)
    });
  };

  const executeDeleteAsset = async (id: string) => {
    try {
      const res = await fetch(`/api/it-assets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const confirmDeleteTicket = (ticket: any) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hủy Ticket',
      message: `Xác nhận xóa ticket ${ticket.code}?`,
      type: 'danger',
      onConfirm: () => executeDeleteTicket(ticket.id)
    });
  };

  const executeDeleteTicket = async (id: string) => {
    try {
      const res = await fetch(`/api/support-tickets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  // Edit Init
  const openEditAsset = (asset: any) => {
    setEditingAsset(asset);
    setAssetForm({
      code: asset.code,
      name: asset.name,
      type: asset.type,
      status: asset.status,
      location: asset.location || '',
      assignedTo: asset.assignedTo || ''
    });
    setIsAssetModalOpen(true);
  };

  const openEditTicket = (ticket: any) => {
    setEditingTicket(ticket);
    setTicketForm({
      title: ticket.title,
      description: ticket.description || '',
      priority: ticket.priority,
      status: ticket.status,
      requester: ticket.requester,
      assignee: ticket.assignee || ''
    });
    setIsTicketModalOpen(true);
  };

  const renderHeaderButton = () => {
    if (activeTab === 'assets') return (
      <Button icon={PlusCircle} onClick={() => {
        setEditingAsset(null);
        setAssetForm({ code: '', name: '', type: 'workstation', status: 'active', location: '', assignedTo: '' });
        setIsAssetModalOpen(true);
      }}>
        Thêm tài sản
      </Button>
    );
    if (activeTab === 'support') return (
      <Button icon={PlusCircle} onClick={() => {
        setEditingTicket(null);
        setTicketForm({ title: '', description: '', priority: 'medium', status: 'open', requester: 'Admin', assignee: '' });
        setIsTicketModalOpen(true);
      }}>
        Mở ticket
      </Button>
    );
    return <Button variant="outline" icon={Activity}>Refresh Stats</Button>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(250, 60%, 52%, 0.12)' }}>
            <Server size={22} style={{ color: 'hsl(250, 60%, 52%)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">IMS — Quản lý CNTT</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Bảo mật, hạ tầng, tài sản và hỗ trợ kĩ thuật</p>
          </div>
        </div>
        {renderHeaderButton()}
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--slate-100)' }}>
        {[
          { key: 'infrastructure', label: 'Hạ tầng', icon: LayoutDashboard },
          { key: 'assets', label: 'Tài sản IT', icon: Monitor },
          { key: 'support', label: 'Hỗ trợ Tickets', icon: Ticket },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab.key ? 'bg-white text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              <Icon size={16} />{tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'infrastructure' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Uptime" value="99.98%" icon={Activity} color="var(--emerald)" />
            <StatCard title="Storage" value="18/50 GB" icon={HardDrive} color="var(--primary-500)" />
            <StatCard title="Users On" value="12" icon={Shield} color="var(--accent-500)" />
            <StatCard title="Incidents" value="0" icon={AlertCircle} color="var(--amber)" />
          </div>
          <Card padding="lg">
            <h3 className="font-bold mb-4">Hoạt động gần đây (Audit Log)</h3>
            <p className="text-sm text-[var(--text-muted)] italic">Hệ thống đang hoạt động ổn định...</p>
          </Card>
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {assets.map(asset => (
            <Card key={asset.id} hover padding="lg" className="cursor-pointer" onClick={() => openEditAsset(asset)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--primary-500)]">{asset.code}</p>
                  <h3 className="font-semibold">{asset.name}</h3>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={asset.status === 'active' ? 'success' : 'warning'}>{asset.status}</Badge>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); openEditAsset(asset); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                      <Edit size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); confirmDeleteAsset(asset); }} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="custom" bg="var(--slate-100)" color="var(--text-secondary)"><Tag size={10}/> {asset.type}</Badge>
                <Badge variant="custom" bg="var(--slate-100)" color="var(--text-secondary)"><User size={10}/> {asset.assignedTo || 'Unassigned'}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'support' && (
        <div className="space-y-3 animate-fade-in">
          {tickets.map(ticket => (
            <Card key={ticket.id} hover className="flex items-center gap-4 cursor-pointer" onClick={() => openEditTicket(ticket)}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--slate-100)] text-[var(--text-muted)]">
                <Ticket size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{ticket.title}</h3>
                  <Badge variant={ticket.priority === 'high' ? 'danger' : 'info'}>{ticket.priority}</Badge>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">{ticket.code} · Yêu cầu bởi: {ticket.requester}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={ticket.status === 'open' ? 'warning' : 'success'}>{ticket.status}</Badge>
                <div className="flex items-center gap-1 border-l pl-3 border-slate-200">
                  <button onClick={(e) => { e.stopPropagation(); openEditTicket(ticket); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                    <Edit size={14} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); confirmDeleteTicket(ticket); }} className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} title={editingAsset ? "Chỉnh sửa tài sản" : "Thêm tài sản IT"} 
        footer={<><Button variant="ghost" onClick={() => setIsAssetModalOpen(false)}>Hủy</Button><Button onClick={handleSaveAsset} icon={editingAsset ? Save : Plus}>{editingAsset ? 'Cập nhật' : 'Lưu tài sản'}</Button></>}>
        <div className="space-y-4">
          <Input label="Mã tài sản" value={assetForm.code} onChange={e => setAssetForm({...assetForm, code: e.target.value})} placeholder="AST-005" disabled={!!editingAsset} />
          <Input label="Tên tài sản" value={assetForm.name} onChange={e => setAssetForm({...assetForm, name: e.target.value})} placeholder="Macbook Pro M3" />
          <Select label="Loại" value={assetForm.type} onChange={e => setAssetForm({...assetForm, type: e.target.value})} 
            options={[{value:'server', label:'Server'}, {value:'workstation', label:'Workstation'}, {value:'software', label:'Software'}]} />
          <Input label="Người sở hữu" value={assetForm.assignedTo} onChange={e => setAssetForm({...assetForm, assignedTo: e.target.value})} placeholder="Nguyễn Văn A" />
          <Select label="Trạng thái" value={assetForm.status} onChange={e => setAssetForm({...assetForm, status: e.target.value})} 
            options={[{value:'active', label:'Hoạt động'}, {value:'maintenance', label:'Bảo trì'}, {value:'retired', label:'Ngừng sử dụng'}]} />
        </div>
      </Modal>

      <Modal isOpen={isTicketModalOpen} onClose={() => setIsTicketModalOpen(false)} title={editingTicket ? "Chỉnh sửa Ticket" : "Tạo Ticket hỗ trợ"} 
        footer={<><Button variant="ghost" onClick={() => setIsTicketModalOpen(false)}>Hủy</Button><Button onClick={handleSaveTicket} icon={editingTicket ? Save : Plus}>{editingTicket ? 'Cập nhật' : 'Gửi hỗ trợ'}</Button></>}>
        <div className="space-y-4">
          <Input label="Tiêu đề" value={ticketForm.title} onChange={e => setTicketForm({...ticketForm, title: e.target.value})} placeholder="Quên mật khẩu / Lỗi phần mềm..." />
          <Select label="Độ ưu tiên" value={ticketForm.priority} onChange={e => setTicketForm({...ticketForm, priority: e.target.value})} 
            options={[{value:'low', label:'Thấp'}, {value:'medium', label:'Trung bình'}, {value:'high', label:'Cao'}]} />
          <Select label="Trạng thái" value={ticketForm.status} onChange={e => setTicketForm({...ticketForm, status: e.target.value})} 
            options={[{value:'open', label:'Mở'}, {value:'in_progress', label:'Đang xử lí'}, {value:'resolved', label:'Đã giải quyết'}, {value:'closed', label:'Đã đóng'}]} />
          <Input label="Người yêu cầu" value={ticketForm.requester} onChange={e => setTicketForm({...ticketForm, requester: e.target.value})} />
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
