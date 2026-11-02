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
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-8 flex flex-col gap-6 text-slate-800">
      {/* HEADER SECTION - Full Bleed Flat Clean */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản Trị Lookbook & BST Váy Cưới</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                  <Sparkles className="w-3 h-3" /> Haute Couture
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Quản lý các tài liệu số hóa, catalogue điện tử và highlight video phục vụ tư vấn cô dâu.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="Tải lại danh sách"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-sm shadow-sm transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Thêm Bộ Sưu Tập Mới
          </button>
        </div>
      </div>

      {/* FILTER & STATS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tổng Bộ Sưu Tập</div>
            <div className="text-xl font-bold text-slate-800">{lookbooks.length} BST</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Đang Xuất Bản</div>
            <div className="text-xl font-bold text-emerald-700">{lookbooks.filter(x => x.is_active).length} Đang Hiện</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Catalogue PDF</div>
            <div className="text-xl font-bold text-slate-800">{lookbooks.filter(x => x.file_type === 'pdf').length} Tệp PDF</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Video Runway</div>
            <div className="text-xl font-bold text-slate-800">{lookbooks.filter(x => x.file_type === 'video').length} Video MP4</div>
          </div>
        </div>
      </div>

      {/* SEARCH & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên BST, phiên bản (v1, v2)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Định dạng:</span>
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterType('pdf')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${filterType === 'pdf' ? 'bg-white text-rose-600 font-semibold shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              PDF Lookbook
            </button>
            <button
              onClick={() => setFilterType('video')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${filterType === 'video' ? 'bg-white text-indigo-600 font-semibold shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Video MP4
            </button>
          </div>
        </div>
      </div>

      {/* TABLE LIST - Full Bleed Flat Canvas Clean */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4 w-24">Ảnh Bìa</th>
                <th className="py-3.5 px-4 min-w-[220px]">Tên BST & Giới Thiệu</th>
                <th className="py-3.5 px-4 w-28 text-center">Phiên Bản</th>
                <th className="py-3.5 px-4 min-w-[200px]">Tệp Đính Kèm Cloud</th>
                <th className="py-3.5 px-4 w-28 text-center">Hiển Thị</th>
                <th className="py-3.5 px-4 w-28 text-center">Thứ Tự</th>
                <th className="py-3.5 px-4 w-28 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                      <span>Đang tải dữ liệu bộ sưu tập...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLookbooks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <BookOpen className="w-8 h-8 text-slate-300" />
                      <span className="text-base font-medium text-slate-600">Chưa có Bộ Sưu Tập nào phù hợp</span>
                      <p className="text-xs text-slate-400">Nhấn &quot;Thêm Bộ Sưu Tập Mới&quot; để tải lên lookbook đầu tiên.</p>
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
                      <td className="py-4 px-4 text-center font-mono text-xs font-semibold text-slate-400">
                        {String(index + 1).padStart(2, '0')}
                      </td>

                      {/* Ảnh bìa */}
                      <td className="py-4 px-4">
                        <div
                          onClick={() => item.cover_image_url && setPreviewModalUrl({ url: item.cover_image_url, type: 'image', title: item.title })}
                          className="w-16 h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-xs relative cursor-pointer group/img"
                        >
                          {item.cover_image_url ? (
                            <img
                              src={item.cover_image_url}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-slate-400">
                              <BookOpen className="w-5 h-5 text-slate-300 mb-1" />
                              <span>No cover</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                      </td>

                      {/* Tên BST & Mô tả */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors text-base line-clamp-1">
                          {item.title}
                        </div>
                        {item.description ? (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 max-w-md leading-relaxed">
                            {item.description}
                          </p>
                        ) : (
                          <span className="text-xs italic text-slate-400 mt-1 block">Chưa có phần giới thiệu</span>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                          <span>Cập nhật: {new Date(item.updated_at || item.created_at).toLocaleDateString('vi-VN')}</span>
                          {item.total_views !== undefined && (
                            <span className="inline-flex items-center gap-1 text-slate-500">
                              <Eye className="w-3 h-3" /> {item.total_views} lượt xem
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Phiên bản */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-xs">
                          {item.version || 'v1.0'}
                        </span>
                      </td>

                      {/* Tệp đính kèm Cloud */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${isPdf ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-indigo-50 text-indigo-600 border border-indigo-200'}`}>
                              {isPdf ? <FileText className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                              {item.file_type.toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              {formatFileSize(item.file_size)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 max-w-xs">
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
                                className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50 transition-colors shrink-0"
                                title="Xem tệp trực tuyến"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Hiển thị Hiện/Ẩn */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                            item.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {item.is_active ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Hiển thị</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                              <span>Ẩn</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Đổi thứ tự ▲ ▼ */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleReorder(item, 'up')}
                            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            title="Di chuyển lên trên"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <span className="text-[11px] font-mono font-bold text-slate-600 px-1">
                            {item.sort_order ?? index + 1}
                          </span>
                          <button
                            type="button"
                            disabled={index === filteredLookbooks.length - 1}
                            onClick={() => handleReorder(item, 'down')}
                            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            title="Di chuyển xuống dưới"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      {/* Sửa, Xóa */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa bộ sưu tập"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>

      {/* MODAL CHI TIẾT 2 VÙNG CẤU HÌNH */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {editingItem ? 'Chỉnh Sửa Bộ Sưu Tập Lookbook' : 'Thêm Bộ Sưu Tập Mới'}
                  </h3>
                  <p className="text-xs text-slate-500">Cấu hình thông tin chi tiết và tải tệp số hóa lên lưu trữ đám mây</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* VÙNG 1: THIẾT LẬP THÔNG TIN & ẢNH BÌA */}
              <div className="rounded-xl border border-slate-200 p-5 bg-white shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                  <h4 className="font-bold text-slate-900 text-sm tracking-wide uppercase">Vùng 1: Thiết Lập Thông Tin & Ảnh Bìa BST</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Cột Trái: Ảnh Bìa */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-700">Ảnh Bìa Bộ Sưu Tập (Cover)</label>
                    <div className="relative w-full aspect-[3/4] max-h-56 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex flex-col items-center justify-center group hover:border-indigo-400 transition-colors">
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
                              className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 text-xs font-semibold hover:bg-white shadow-sm"
                            >
                              Đổi ảnh bìa
                            </button>
                          </div>
                        </>
                      ) : (
                        <div
                          onClick={() => coverInputRef.current?.click()}
                          className="flex flex-col items-center justify-center p-4 text-center cursor-pointer"
                        >
                          <UploadCloud className="w-8 h-8 text-slate-400 mb-2 group-hover:text-indigo-600 transition-colors" />
                          <span className="text-xs font-semibold text-slate-600">Chọn ảnh bìa</span>
                          <span className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WebP</span>
                        </div>
                      )}

                      {/* Thanh tiến trình ảnh bìa nếu đang tải */}
                      {coverProgress !== null && coverProgress < 100 && (
                        <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center p-4">
                          <span className="text-xs font-bold text-indigo-600 mb-2">Đang tải: {coverProgress}%</span>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 transition-all duration-150" style={{ width: `${coverProgress}%` }} />
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
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="url"
                        placeholder="Hoặc dán URL ảnh bìa trực tiếp..."
                        value={formData.cover_image_url || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, cover_image_url: e.target.value }))}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Cột Phải: Thông tin chi tiết */}
                  <div className="md:col-span-2 flex flex-col gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Tên Bộ Sưu Tập <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: BST Dạ Vũ Ánh Sao - Spring/Summer 2026"
                        value={formData.title || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Phiên Bản <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="VD: v1.0, v2.1"
                          value={formData.version || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:border-indigo-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Trạng Thái Hiển Thị
                        </label>
                        <select
                          value={formData.is_active ? 'true' : 'false'}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:bg-white"
                        >
                          <option value="true">Hiển thị (Public)</option>
                          <option value="false">Ẩn (Draft / Lưu trữ)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Mô Tả & Cảm Hứng Thiết Kế
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Mô tả chất liệu ren, phom dáng dạ hội, đính kết Swarovski, câu chuyện truyền cảm hứng..."
                        value={formData.description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:bg-white resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* VÙNG 2: TẢI TỆP LÊN CLOUD (HỖ TRỢ PDF & MP4 VIDEO) */}
              <div className="rounded-xl border border-slate-200 p-5 bg-white shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                    <h4 className="font-bold text-slate-900 text-sm tracking-wide uppercase">Vùng 2: Tải Tệp Lên Cloud (PDF & Video MP4)</h4>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Supabase / Firebase Storage Ready</span>
                </div>

                {/* Dropzone Upload */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/60 p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    Bấm vào đây để chọn tệp tải lên đám mây
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-md">
                    Hỗ trợ tệp <strong>Catalogue PDF</strong> hoặc <strong>Video MP4</strong> giới thiệu Lookbook chất lượng cao.
                  </p>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUploadAttachment}
                    accept=".pdf,video/mp4,video/*"
                    className="hidden"
                  />
                </div>

                {/* Thanh tiến trình % trực quan */}
                {fileProgress !== null && (
                  <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className={`w-3.5 h-3.5 ${fileProgress < 100 ? 'animate-spin text-indigo-600' : 'text-emerald-600'}`} />
                        {fileProgress < 100 ? 'Đang truyền dữ liệu lên Cloud...' : 'Hoàn thành tải tệp!'}
                      </span>
                      <span className="font-mono text-indigo-600 text-sm">{fileProgress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-200 rounded-full ${fileProgress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-indigo-600'}`}
                        style={{ width: `${fileProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Tệp hiện tại đã đính kèm */}
                {formData.file_url && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${formData.file_type === 'pdf' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                        {formData.file_type === 'pdf' ? <FileText className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {formData.file_name || 'Đã đính kèm tệp'}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                          <span className="uppercase font-bold">{formData.file_type}</span>
                          <span>•</span>
                          <span>{formatFileSize(formData.file_size)}</span>
                          <span>•</span>
                          <span className="text-emerald-600 flex items-center gap-0.5 font-sans font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Cloud Hosted
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewModalUrl({
                          url: formData.file_url!,
                          type: formData.file_type as 'pdf' | 'video',
                          title: formData.title || 'Xem thử tệp'
                        })}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> Xem thử
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold shadow-xs"
                      >
                        Thay tệp
                      </button>
                    </div>
                  </div>
                )}

                {/* Hoặc nhập URL trực tiếp */}
                <div className="mt-3">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Hoặc nhập URL Cloud Public có sẵn:
                  </label>
                  <input
                    type="url"
                    placeholder="https://...supabase.co/... hoặc https://firebasestorage.googleapis.com/..."
                    value={formData.file_url || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, file_url: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-sm shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang lưu trữ...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingItem ? 'Lưu Thay Đổi' : 'Tạo Bộ Sưu Tập'}</span>
                    </>
                  )}
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
