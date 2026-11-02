'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  WeddingLookbook,
  getLookbooks,
  saveLookbook,
  deleteLookbook,
  toggleLookbookStatus,
  reorderLookbook
} from './actions';
import {
  BookOpen,
  Plus,
  RefreshCw,
  Search,
  FileText,
  Video,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Edit3,
  Trash2,
  ExternalLink,
  Sparkles,
  Layers,
  FileCheck,
  AlertCircle,
  X
} from 'lucide-react';

export default function LookbooksPage() {
  const [lookbooks, setLookbooks] = useState<WeddingLookbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pdf' | 'video'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<WeddingLookbook> | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<WeddingLookbook>>({
    title: '',
    description: '',
    version: 'v1.0',
    cover_image_url: '',
    file_url: '',
    file_name: '',
    file_type: 'pdf',
    file_size: 0,
    is_active: true
  });

  // Upload state
  const [coverProgress, setCoverProgress] = useState<number | null>(null);
  const [fileProgress, setFileProgress] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewModalUrl, setPreviewModalUrl] = useState<{ url: string; type: 'pdf' | 'video' | 'image'; title: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getLookbooks();
      setLookbooks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      version: 'v1.0',
      cover_image_url: '',
      file_url: '',
      file_name: '',
      file_type: 'pdf',
      file_size: 0,
      is_active: true
    });
    setCoverProgress(null);
    setFileProgress(null);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: WeddingLookbook) => {
    setEditingItem(item);
    setFormData({ ...item });
    setCoverProgress(null);
    setFileProgress(null);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setCoverProgress(null);
    setFileProgress(null);
  };

  // Upload handler with real progress simulation/tracking via XMLHttpRequest
  const uploadWithProgress = (file: File, folder: string, onProgress: (pct: number) => void): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const body = new FormData();
      body.append('file', file);
      body.append('folder', folder);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            if (res.success) {
              resolve(res);
            } else {
              reject(new Error(res.error || 'Upload failed'));
            }
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          reject(new Error(`Server error (${xhr.status})`));
        }
      };

      xhr.onerror = () => reject(new Error('Lỗi kết nối mạng khi tải tệp'));
      xhr.open('POST', '/api/marketing/lookbooks/upload', true);
      xhr.send(body);
    });
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WebP).');
      return;
    }

    try {
      setCoverProgress(5);
      const res = await uploadWithProgress(file, 'covers', (pct) => setCoverProgress(pct));
      setFormData(prev => ({
        ...prev,
        cover_image_url: res.url
      }));
      setCoverProgress(100);
    } catch (err: any) {
      alert('Tải ảnh bìa thất bại: ' + err.message);
      setCoverProgress(null);
    }
  };

  const handleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4');

    if (!isPdf && !isVideo) {
      alert('Chỉ hỗ trợ tải lên tệp PDF hoặc Video MP4!');
      return;
    }

    try {
      setFileProgress(5);
      const detectedType: 'pdf' | 'video' = isVideo ? 'video' : 'pdf';
      const res = await uploadWithProgress(file, detectedType === 'video' ? 'videos' : 'pdfs', (pct) => setFileProgress(pct));
      setFormData(prev => ({
        ...prev,
        file_url: res.url,
        file_name: file.name,
        file_type: detectedType,
        file_size: file.size
      }));
      setFileProgress(100);
    } catch (err: any) {
      alert('Tải tệp đính kèm thất bại: ' + err.message);
      setFileProgress(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setErrorMessage('Vui lòng nhập tên Bộ Sưu Tập!');
      return;
    }
    if (!formData.file_url) {
      setErrorMessage('Vui lòng tải lên tệp đính kèm (PDF hoặc Video MP4)!');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const res = await saveLookbook({
        ...formData,
        id: editingItem?.id
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Lưu thất bại');
        setIsSaving(false);
        return;
      }

      await loadData();
      handleCloseModal();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi hệ thống');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (item: WeddingLookbook) => {
    const newStatus = !item.is_active;
    // Optimistic UI update
    setLookbooks(prev => prev.map(x => x.id === item.id ? { ...x, is_active: newStatus } : x));
    await toggleLookbookStatus(item.id, newStatus);
  };

  const handleReorder = async (item: WeddingLookbook, direction: 'up' | 'down') => {
    await reorderLookbook(item.id, direction);
    await loadData();
  };

  const handleDelete = async (item: WeddingLookbook) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bộ sưu tập "${item.title}"?`)) {
      return;
    }
    setLookbooks(prev => prev.filter(x => x.id !== item.id));
    await deleteLookbook(item.id);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Filtered list
  const filteredLookbooks = lookbooks.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.version.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || item.file_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col text-slate-800 -mt-2 sm:-mt-4 lg:-mt-6 -mx-0 sm:-mx-2 md:-mx-4 lg:-mx-6 bg-white min-h-[calc(100vh-65px)]">
      {/* 1. TOP BAR - FULL BLEED FLAT CANVAS HEADER */}
      <div className="h-14 border-b border-slate-200/90 px-6 sm:px-8 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-bold tracking-tight text-slate-900">Quản Trị Lookbook & BST Váy</h1>
            <span className="text-[11px] font-mono font-medium text-slate-400">/</span>
            <span className="text-xs text-slate-500 font-medium">Haute Couture Bridal</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Tải lại danh sách"
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-slate-900' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white font-medium text-xs transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm BST Mới
          </button>
        </div>
      </div>

      {/* 2. STATS KPI BAR - FLAT BORDER SEPARATION (NO HEAVY CARDS/PILLS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200/90 divide-x divide-slate-100 bg-slate-50/40 text-xs">
        <div className="py-2.5 px-6 flex items-center gap-2.5">
          <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">Tổng BST:</span>
          <span className="font-bold font-mono text-slate-900 text-sm">{lookbooks.length}</span>
        </div>
        <div className="py-2.5 px-6 flex items-center gap-2.5">
          <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">Đang Hiện:</span>
          <span className="font-bold font-mono text-emerald-600 text-sm">{lookbooks.filter(x => x.is_active).length}</span>
        </div>
        <div className="py-2.5 px-6 flex items-center gap-2.5">
          <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">Catalogue PDF:</span>
          <span className="font-bold font-mono text-slate-800 text-sm">{lookbooks.filter(x => x.file_type === 'pdf').length}</span>
        </div>
        <div className="py-2.5 px-6 flex items-center gap-2.5">
          <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">Video Runway:</span>
          <span className="font-bold font-mono text-slate-800 text-sm">{lookbooks.filter(x => x.file_type === 'video').length}</span>
        </div>
      </div>

      {/* 3. TOOLBAR FILTER & SEARCH - FLAT BORDER-B */}
      <div className="px-6 sm:px-8 py-2.5 border-b border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên BST, phiên bản (v1, v2)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Lọc:</span>
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterType('pdf')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${filterType === 'pdf' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
            >
              PDF Lookbook
            </button>
            <button
              onClick={() => setFilterType('video')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${filterType === 'video' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Video MP4
            </button>
          </div>
        </div>
      </div>

      {/* 4. MASTER TABLE - FULL BLEED FLAT CANVAS (NO ROUNDED CARD, NO SHADOWS) */}
      <div className="flex-1 overflow-x-auto bg-white">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-6 w-12 text-center">STT</th>
              <th className="py-2.5 px-4 w-20">Ảnh Bìa</th>
              <th className="py-2.5 px-6 min-w-[240px]">Tên BST & Giới Thiệu</th>
              <th className="py-2.5 px-4 w-24 text-center">Phiên Bản</th>
              <th className="py-2.5 px-6 min-w-[220px]">Tệp Đính Kèm Cloud</th>
              <th className="py-2.5 px-4 w-28 text-center">Hiển Thị</th>
              <th className="py-2.5 px-4 w-24 text-center">Thứ Tự</th>
              <th className="py-2.5 px-6 w-24 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-slate-600" />
                    <span>Đang tải danh sách bộ sưu tập...</span>
                  </div>
                </td>
              </tr>
            ) : filteredLookbooks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <BookOpen className="w-6 h-6 text-slate-300" />
                    <span className="text-sm font-medium text-slate-600">Chưa có Bộ Sưu Tập nào</span>
                    <p className="text-xs text-slate-400">Nhấn &quot;Thêm BST Mới&quot; để cấu hình catalogue đầu tiên.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLookbooks.map((item, index) => {
                const isPdf = item.file_type === 'pdf';
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* STT */}
                    <td className="py-3 px-6 text-center font-mono text-xs text-slate-400">
                      {String(index + 1).padStart(2, '0')}
                    </td>

                    {/* Ảnh bìa */}
                    <td className="py-3 px-4">
                      <div
                        onClick={() => item.cover_image_url && setPreviewModalUrl({ url: item.cover_image_url, type: 'image', title: item.title })}
                        className="w-12 h-16 rounded border border-slate-200 overflow-hidden bg-slate-50 relative cursor-pointer group/img"
                      >
                        {item.cover_image_url ? (
                          <img
                            src={item.cover_image_url}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover/img:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-400">
                            No img
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </td>

                    {/* Tên BST & Mô tả */}
                    <td className="py-3 px-6">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors text-xs line-clamp-1">
                        {item.title}
                      </div>
                      {item.description ? (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-lg leading-relaxed">
                          {item.description}
                        </p>
                      ) : (
                        <span className="text-[11px] italic text-slate-400 mt-0.5 block">Chưa có phần giới thiệu</span>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 font-mono">
                        <span>Cập nhật: {new Date(item.updated_at || item.created_at).toLocaleDateString('vi-VN')}</span>
                        {item.total_views !== undefined && (
                          <span className="text-slate-500">
                            • {item.total_views} lượt xem
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Phiên bản - Flat Text Monospace (Không pill) */}
                    <td className="py-3 px-4 text-center font-mono text-xs font-semibold text-slate-700">
                      {item.version || 'v1.0'}
                    </td>

                    {/* Tệp đính kèm Cloud */}
                    <td className="py-3 px-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600">
                            [{item.file_type.toUpperCase()}]
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {formatFileSize(item.file_size)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 max-w-xs">
                          <span className="text-xs text-slate-700 font-medium truncate" title={item.file_name}>
                            {item.file_name || 'document'}
                          </span>
                          {item.file_url && (
                            <button
                              type="button"
                              onClick={() => setPreviewModalUrl({
                                url: item.file_url,
                                type: item.file_type,
                                title: item.title
                              })}
                              className="text-slate-500 hover:text-slate-900 p-0.5 rounded transition-colors shrink-0"
                              title="Xem tệp trực tuyến"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Hiển thị Hiện/Ẩn - Dot indicator thanh thoát (Không lạm pill) */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        className="inline-flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className={`font-medium ${item.is_active ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {item.is_active ? 'Hiển thị' : 'Đang ẩn'}
                        </span>
                      </button>
                    </td>

                    {/* Đổi thứ tự ▲ ▼ */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-0.5 border border-slate-200 rounded p-0.5 bg-white">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleReorder(item, 'up')}
                          className="p-1 rounded text-slate-400 hover:text-slate-900 disabled:opacity-20 transition-colors"
                          title="Lên trên"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[11px] font-mono font-semibold text-slate-700 px-1">
                          {item.sort_order ?? index + 1}
                        </span>
                        <button
                          type="button"
                          disabled={index === filteredLookbooks.length - 1}
                          onClick={() => handleReorder(item, 'down')}
                          className="p-1 rounded text-slate-400 hover:text-slate-900 disabled:opacity-20 transition-colors"
                          title="Xuống dưới"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Sửa, Xóa */}
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CHI TIẾT 2 VÙNG CẤU HÌNH - FLAT CANVAS CLEAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {editingItem ? 'Chỉnh Sửa Bộ Sưu Tập Lookbook' : 'Thêm Bộ Sưu Tập Mới'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Cấu hình thông tin catalogue và tệp đám mây ERP</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
              {errorMessage && (
                <div className="p-3 rounded border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* VÙNG 1: THIẾT LẬP THÔNG TIN & ẢNH BÌA */}
              <div className="border border-slate-200 rounded p-4 bg-white">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 mb-3.5">
                  <span className="font-mono text-xs font-bold text-slate-900">[1]</span>
                  <h4 className="font-bold text-slate-900 text-xs tracking-wider uppercase">Thông Tin Cơ Bản & Ảnh Bìa</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Cột Trái: Ảnh Bìa */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-slate-600">Ảnh Bìa BST (Cover)</label>
                    <div className="relative w-full aspect-[3/4] max-h-48 rounded border border-slate-200 bg-slate-50 overflow-hidden flex flex-col items-center justify-center group hover:border-slate-400 transition-colors">
                      {formData.cover_image_url ? (
                        <>
                          <img
                            src={formData.cover_image_url}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white">
                            <button
                              type="button"
                              onClick={() => coverInputRef.current?.click()}
                              className="px-2.5 py-1 rounded bg-white text-slate-900 text-xs font-medium hover:bg-slate-100"
                            >
                              Đổi ảnh
                            </button>
                          </div>
                        </>
                      ) : (
                        <div
                          onClick={() => coverInputRef.current?.click()}
                          className="flex flex-col items-center justify-center p-3 text-center cursor-pointer"
                        >
                          <UploadCloud className="w-6 h-6 text-slate-400 mb-1.5" />
                          <span className="text-xs font-medium text-slate-600">Chọn ảnh bìa</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP</span>
                        </div>
                      )}

                      {/* Thanh tiến trình ảnh bìa */}
                      {coverProgress !== null && coverProgress < 100 && (
                        <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-3">
                          <span className="text-xs font-mono font-bold text-slate-800 mb-1.5">{coverProgress}%</span>
                          <div className="w-full h-1.5 bg-slate-200 rounded overflow-hidden">
                            <div className="h-full bg-slate-900 transition-all duration-150" style={{ width: `${coverProgress}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={coverInputRef}
                      onChange={handleUploadCover}
                      accept="image/*"
                      className="hidden"
                    />
                    <input
                      type="url"
                      placeholder="Hoặc dán URL ảnh bìa..."
                      value={formData.cover_image_url || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, cover_image_url: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  {/* Cột Phải: Thông tin chi tiết */}
                  <div className="md:col-span-2 flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Tên Bộ Sưu Tập <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: BST Dạ Vũ Ánh Sao - Spring/Summer 2026"
                        value={formData.title || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-700 block mb-1">
                          Phiên Bản <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="v1.0"
                          value={formData.version || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono focus:outline-none focus:border-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-700 block mb-1">
                          Trạng Thái
                        </label>
                        <select
                          value={formData.is_active ? 'true' : 'false'}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-slate-900"
                        >
                          <option value="true">Hiển thị (Public)</option>
                          <option value="false">Ẩn (Draft / Lưu trữ)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Mô Tả & Cảm Hứng Thiết Kế
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Mô tả chất liệu, phom dáng, phong cách thiết kế..."
                        value={formData.description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-900 resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* VÙNG 2: TẢI TỆP LÊN CLOUD (HỖ TRỢ PDF & MP4 VIDEO) */}
              <div className="border border-slate-200 rounded p-4 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">[2]</span>
                    <h4 className="font-bold text-slate-900 text-xs tracking-wider uppercase">Tệp Đính Kèm Cloud (PDF / Video MP4)</h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Max 100MB</span>
                </div>

                {/* Dropzone Upload */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400 p-5 flex flex-col items-center justify-center cursor-pointer transition-colors group text-center"
                >
                  <UploadCloud className="w-6 h-6 text-slate-400 mb-1.5 group-hover:text-slate-800 transition-colors" />
                  <div className="text-xs font-semibold text-slate-800">
                    Bấm để chọn tệp Catalogue PDF hoặc Video MP4
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tệp được lưu trữ trực tiếp vào kho Storage đám mây
                  </p>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUploadAttachment}
                    accept=".pdf,video/mp4,video/*"
                    className="hidden"
                  />
                </div>

                {/* Thanh tiến trình % */}
                {fileProgress !== null && (
                  <div className="mt-3 p-3 rounded border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <RefreshCw className={`w-3 h-3 ${fileProgress < 100 ? 'animate-spin text-slate-800' : 'text-emerald-600'}`} />
                        {fileProgress < 100 ? 'Đang tải lên...' : 'Hoàn thành tải tệp'}
                      </span>
                      <span className="font-mono font-bold text-xs">{fileProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded overflow-hidden">
                      <div
                        className="h-full bg-slate-900 transition-all duration-150"
                        style={{ width: `${fileProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Tệp hiện tại đã đính kèm */}
                {formData.file_url && (
                  <div className="mt-3 p-3 rounded bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded border border-slate-200 bg-white flex items-center justify-center text-slate-700 shrink-0">
                        {formData.file_type === 'pdf' ? <FileText className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {formData.file_name || 'Tệp đã gắn'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span className="uppercase font-bold">[{formData.file_type}]</span>
                          <span>•</span>
                          <span>{formatFileSize(formData.file_size)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewModalUrl({
                          url: formData.file_url!,
                          type: formData.file_type as 'pdf' | 'video',
                          title: formData.title || 'Xem thử tệp'
                        })}
                        className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:text-slate-900 text-xs font-medium transition-colors"
                      >
                        Xem thử
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:text-slate-900 text-xs font-medium transition-colors"
                      >
                        Đổi tệp
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-2.5">
                  <input
                    type="url"
                    placeholder="Hoặc dán trực tiếp Cloud URL..."
                    value={formData.file_url || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, file_url: e.target.value }))}
                    className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-mono focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-1.5 rounded border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-1.5 rounded bg-slate-900 hover:bg-black text-white text-xs font-medium disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {isSaving && <RefreshCw className="w-3 h-3 animate-spin" />}
                  {isSaving ? 'Đang lưu...' : (editingItem ? 'Lưu Thay Đổi' : 'Tạo Bộ Sưu Tập')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL CHO TỆP (PDF, VIDEO HOẶC ẢNH) */}
      {previewModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-800 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  {previewModalUrl.type}
                </span>
                <span className="font-semibold text-sm text-slate-900 truncate">
                  {previewModalUrl.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewModalUrl.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200 text-xs flex items-center gap-1"
                  title="Mở tab mới"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreviewModalUrl(null)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-900 flex items-center justify-center overflow-hidden">
              {previewModalUrl.type === 'image' && (
                <img
                  src={previewModalUrl.url}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              )}

              {previewModalUrl.type === 'video' && (
                <video
                  src={previewModalUrl.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )}

              {previewModalUrl.type === 'pdf' && (
                <iframe
                  src={previewModalUrl.url}
                  className="w-full h-full border-none"
                  title="PDF Viewer"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
