"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  Coins,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Layers,
  Plus,
  Save,
  Share2,
  Trash2,
  TrendingUp,
  UserCheck,
  Video,
  X
} from "lucide-react";
import {
  saveVideoReport,
  savePerformanceVersion,
  deletePerformanceVersion,
  PerformanceLog
} from "../actions";
import {
  approveVideoReward,
  VideoRewardRule
} from "../reward-actions";

interface VideoDetailViewProps {
  isNew: boolean;
  initialData: any;
  permissions: {
    can_create: boolean;
    can_update: boolean;
    can_delete: boolean;
  };
  rewardRule: VideoRewardRule;
  rewardAward: any;
  users: { id: string; full_name: string }[];
  currentUserId: string;
}

export default function VideoDetailView({
  isNew,
  initialData,
  permissions,
  rewardRule,
  rewardAward: initialAward,
  users,
  currentUserId
}: VideoDetailViewProps) {
  const router = useRouter();

  // Master Video Info State
  const [formData, setFormData] = useState({
    id: initialData?.id || "",
    title: initialData?.title || "",
    actual_publish_date:
      initialData?.actual_publish_date ||
      new Date().toISOString().split("T")[0],
    format: initialData?.format || "VIDEO_REEL",
    category: initialData?.category || "CHUNG",
    asset_link: initialData?.asset_link || "",
    script: initialData?.script || "",
    revision_notes: initialData?.revision_notes || "",
    published_links: {
      tiktok: initialData?.published_links?.tiktok || "",
      youtube: initialData?.published_links?.youtube || "",
      facebook: initialData?.published_links?.facebook || "",
      instagram: initialData?.published_links?.instagram || ""
    }
  });

  const [isSavingMaster, setIsSavingMaster] = useState(false);
  const [versions, setVersions] = useState<PerformanceLog[]>(
    initialData?.performance_logs || []
  );
  const [rewardAward, setRewardAward] = useState<any>(initialAward);

  // Version Modal State
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<PerformanceLog | null>(
    null
  );
  const [isSavingVersion, setIsSavingVersion] = useState(false);

  const getLocalDateString = () => {
    return new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];
  };

  const [versionForm, setVersionForm] = useState({
    id: "",
    version_name: "",
    logged_at: getLocalDateString(),
    views: 0,
    reach: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    leads_generated: 0,
    cost_spent: 0,
    notes: ""
  });

  // Reward Approval Modal State
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedLogForReward, setSelectedLogForReward] =
    useState<PerformanceLog | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  const canEdit = isNew ? permissions.can_create : permissions.can_update;
  const canApproveReward = permissions.can_update;

  // -- MASTER SAVE HANDLER --
  const handleSaveVideo = async () => {
    if (!formData.title.trim()) {
      return alert("Vui lòng nhập tên/tiêu đề video.");
    }

    try {
      setIsSavingMaster(true);
      const res = await saveVideoReport(isNew, formData);
      if (res.success) {
        alert(
          isNew
            ? "Tạo báo cáo video thành công! Giờ bạn có thể ghi nhận các đợt đo lường."
            : "Cập nhật thông tin video thành công!"
        );
        if (isNew) {
          router.push(`/dashboard/marketing/video-reports/${res.data.id}`);
        } else {
          router.refresh();
        }
      } else {
        alert("Lỗi khi lưu: " + res.error);
      }
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setIsSavingMaster(false);
    }
  };

  // -- VERSION MODAL HANDLERS --
  const openVersionModal = (version: PerformanceLog | null = null) => {
    if (version) {
      setEditingVersion(version);
      setVersionForm({
        id: version.id,
        version_name: version.version_name,
        logged_at:
          version.logged_at?.split("T")[0] || getLocalDateString(),
        views: Number(version.views) || 0,
        reach: Number(version.reach) || 0,
        likes: Number(version.likes) || 0,
        comments: Number(version.comments) || 0,
        shares: Number(version.shares) || 0,
        leads_generated: Number(version.leads_generated) || 0,
        cost_spent: Number(version.cost_spent) || 0,
        notes: version.notes || ""
      });
    } else {
      setEditingVersion(null);
      const nextVersionNum = versions.length + 1;
      setVersionForm({
        id: "",
        version_name: `Đợt ${nextVersionNum} - Sau ${
          nextVersionNum === 1
            ? "3 ngày"
            : nextVersionNum === 2
            ? "7 ngày"
            : "30 ngày"
        }`,
        logged_at: getLocalDateString(),
        views: 0,
        reach: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        leads_generated: 0,
        cost_spent: 0,
        notes: ""
      });
    }
    setIsVersionModalOpen(true);
  };

  const handleSaveVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionForm.version_name.trim()) {
      return alert("Vui lòng nhập tên lần ghi nhận (phiên bản).");
    }

    try {
      setIsSavingVersion(true);
      const res = await savePerformanceVersion(
        formData.id,
        !editingVersion,
        versionForm as any
      );

      if (res.success && res.data) {
        const savedLog = res.data as PerformanceLog;
        setIsVersionModalOpen(false);
        if (!editingVersion) {
          setVersions([savedLog, ...versions]);
        } else {
          setVersions(
            versions.map((v) => (v.id === editingVersion.id ? savedLog : v))
          );
        }
        router.refresh();
      } else {
        alert("Lỗi khi lưu phiên bản: " + (res.error || "Không có dữ liệu trả về"));
      }
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setIsSavingVersion(false);
    }
  };

  const handleDeleteVersion = async (logId: string) => {
    if (!confirm("Xác nhận xóa phiên bản ghi nhận này?")) return;
    const res = await deletePerformanceVersion(formData.id, logId);
    if (res.success) {
      setVersions(versions.filter((v) => v.id !== logId));
      router.refresh();
    } else {
      alert("Lỗi khi xóa phiên bản: " + res.error);
    }
  };

  // -- REWARD APPROVAL HANDLERS --
  const openApproveModal = (log: PerformanceLog) => {
    setSelectedLogForReward(log);
    setSelectedStaffId("");
    setIsApproveModalOpen(true);
  };

  const calculateEstimatedReward = (log: PerformanceLog | null) => {
    if (!log) return 0;
    const views = Number(log.views) || 0;
    const engagement =
      (Number(log.likes) || 0) +
      (Number(log.comments) || 0) +
      (Number(log.shares) || 0);

    const amount = Math.round(
      (views / 1000) * Number(rewardRule.per_thousand_views || 0) +
        engagement * Number(rewardRule.per_engagement || 0)
    );
    return amount;
  };

  const handleApproveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLogForReward) return;
    if (!selectedStaffId) {
      return alert("Vui lòng chọn nhân viên được duyệt thưởng.");
    }
    if (selectedStaffId === currentUserId) {
      return alert(
        "Theo quy định kiểm soát chéo, người duyệt không được tự nhận thưởng cho chính mình."
      );
    }

    try {
      setIsApproving(true);
      const res = await approveVideoReward(
        formData.id,
        selectedLogForReward.id,
        selectedStaffId
      );

      if (res.success) {
        alert(
          `Đã duyệt thưởng thành công: ${Number(res.amount).toLocaleString(
            "vi-VN"
          )} VNĐ! Dữ liệu đã được đồng bộ vào Bảng lương.`
        );
        setIsApproveModalOpen(false);
        setRewardAward({
          video_id: formData.id,
          user_id: selectedStaffId,
          log_id: selectedLogForReward.id,
          amount: res.amount,
          user: users.find((u) => u.id === selectedStaffId),
          approved_at: new Date().toISOString()
        });
        router.refresh();
      }
    } catch (err: any) {
      alert("Lỗi duyệt thưởng: " + err.message);
    } finally {
      setIsApproving(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-w-0 space-y-5 pb-16 text-slate-900 md:space-y-6">
      {/* TOP HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard/marketing/video-reports"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-800"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-slate-900 sm:text-2xl">
              {isNew ? "Thêm Báo cáo Video mới" : formData.title || "Chi tiết Video"}
            </h1>
            <p className="text-xs text-slate-500">
              {isNew
                ? "Khởi tạo bài đăng video để bắt đầu đo lường các mốc hiệu quả"
                : `Mã ID: ${formData.id.slice(0, 8)}... · Đăng ngày: ${formatDate(formData.actual_publish_date)}`}
            </p>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={handleSaveVideo}
            disabled={isSavingMaster}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isSavingMaster ? "Đang lưu..." : "Lưu Thông Tin Video"}
            </span>
          </button>
        )}
      </div>

      {/* REWARD AWARD STATUS BANNER IF AWARDED */}
      {rewardAward && (
        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-emerald-950">
                  Video đã được duyệt thưởng
                </h4>
                <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  Đã khóa thưởng
                </span>
              </div>
              <p className="mt-0.5 text-xs text-emerald-800">
                Nhân sự nhận thưởng:{" "}
                <strong className="font-semibold">
                  {rewardAward.user?.full_name || "Nhân viên"}
                </strong>{" "}
                · Số tiền:{" "}
                <strong className="text-emerald-950">
                  {Number(rewardAward.amount || 0).toLocaleString("vi-VN")} VNĐ
                </strong>{" "}
                · Ngày duyệt: {formatDate(rewardAward.approved_at)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: MASTER GENERAL INFO */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Video className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              1. Thông tin chung của Video
            </h2>
          </div>
          {formData.asset_link && (
            <a
              href={formData.asset_link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Mở link video gốc</span>
            </a>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:gap-5">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Tên / Tiêu đề bài đăng video <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={!canEdit}
              placeholder="VD: Hậu trường thử váy cưới Haute Couture cô dâu Thanh Hằng..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Ngày xuất bản (Publish Date)
            </label>
            <input
              type="date"
              value={formData.actual_publish_date}
              onChange={(e) =>
                setFormData({ ...formData, actual_publish_date: e.target.value })
              }
              disabled={!canEdit}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Định dạng video
            </label>
            <select
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              disabled={!canEdit}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 disabled:bg-slate-50"
            >
              <option value="VIDEO_REEL">Ngắn / Reels / TikTok (Dọc)</option>
              <option value="VIDEO_LONG">Video dài / YouTube / Phỏng vấn (Ngang)</option>
              <option value="LIVESTREAM">Livestream sự kiện / Bán hàng</option>
              <option value="VIDEO_REPORT">Báo cáo hiệu quả Video chung</option>
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Link xem video chính (URL)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.asset_link}
                onChange={(e) =>
                  setFormData({ ...formData, asset_link: e.target.value })
                }
                disabled={!canEdit}
                placeholder="https://www.tiktok.com/... hoặc https://www.facebook.com/reel/..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
              />
              {formData.asset_link && (
                <a
                  href={formData.asset_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-slate-700 hover:bg-slate-100"
                  title="Mở tab mới"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Published platform links */}
          <div className="sm:col-span-2 space-y-2 pt-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Link phân phối theo từng kênh (Tùy chọn)
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="url"
                value={formData.published_links.tiktok}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    published_links: {
                      ...formData.published_links,
                      tiktok: e.target.value
                    }
                  })
                }
                disabled={!canEdit}
                placeholder="Link TikTok..."
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-emerald-500 disabled:bg-slate-50"
              />
              <input
                type="url"
                value={formData.published_links.facebook}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    published_links: {
                      ...formData.published_links,
                      facebook: e.target.value
                    }
                  })
                }
                disabled={!canEdit}
                placeholder="Link Facebook Reels / Fanpage..."
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-emerald-500 disabled:bg-slate-50"
              />
              <input
                type="url"
                value={formData.published_links.youtube}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    published_links: {
                      ...formData.published_links,
                      youtube: e.target.value
                    }
                  })
                }
                disabled={!canEdit}
                placeholder="Link YouTube Shorts..."
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-emerald-500 disabled:bg-slate-50"
              />
              <input
                type="url"
                value={formData.published_links.instagram}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    published_links: {
                      ...formData.published_links,
                      instagram: e.target.value
                    }
                  })
                }
                disabled={!canEdit}
                placeholder="Link Instagram Reels..."
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-emerald-500 disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Kịch bản / Nội dung tóm tắt
            </label>
            <textarea
              rows={3}
              value={formData.script}
              onChange={(e) => setFormData({ ...formData, script: e.target.value })}
              disabled={!canEdit}
              placeholder="Tóm tắt nội dung video, hook đầu video, CTA..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 disabled:bg-slate-50"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: PERFORMANCE VERSIONS HISTORY */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                2. Lịch sử các phiên bản ghi nhận hiệu quả
              </h2>
              <p className="text-xs text-slate-500">
                Ghi nhận số liệu theo từng giai đoạn (Sau 3 ngày, sau 7 ngày, chốt tháng)
              </p>
            </div>
          </div>

          {canEdit && !isNew && (
            <button
              onClick={() => openVersionModal()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Plus className="h-4 w-4 text-emerald-600" />
              <span>Ghi nhận đợt đo lường mới</span>
            </button>
          )}
        </div>

        {isNew ? (
          <div className="p-8 text-center bg-slate-50/40">
            <p className="text-sm font-medium text-slate-700 mb-1">
              Vui lòng bấm <strong className="text-emerald-700 font-semibold">Lưu Thông Tin Video</strong> (ở góc trên phải) trước khi ghi nhận các phiên bản đo lường.
            </p>
            <p className="text-xs text-slate-400">
              Sau khi lưu, hệ thống sẽ mở khóa bảng theo dõi hiệu quả theo từng mốc thời gian.
            </p>
          </div>
        ) : versions.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
              <BarChart3 className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              Chưa có phiên bản đo lường nào được ghi nhận.
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Bấm &quot;Ghi nhận đợt đo lường mới&quot; để nhập số lượt xem, tương tác và khách tiềm năng sau khi đăng bài.
            </p>
            {canEdit && (
              <button
                onClick={() => openVersionModal()}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" /> Ghi nhận đợt đầu tiên
              </button>
            )}
          </div>
        ) : (
          <>
            {/* MOBILE VIEW */}
            <div className="divide-y divide-slate-100 sm:hidden">
              {versions.map((ver) => {
                const totalEngagement =
                  (Number(ver.likes) || 0) +
                  (Number(ver.comments) || 0) +
                  (Number(ver.shares) || 0);
                const isAwardedLog = rewardAward?.log_id === ver.id;

                return (
                  <article key={ver.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">
                            {ver.version_name}
                          </h3>
                          {isAwardedLog && (
                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                              Đã duyệt thưởng
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Ngày đo: {formatDate(ver.logged_at)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {canEdit && (
                          <button
                            onClick={() => openVersionModal(ver)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Sửa phiên bản"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => handleDeleteVersion(ver.id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Xóa phiên bản"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-slate-50 p-2">
                        <span className="block text-[10px] text-slate-400 uppercase">Views</span>
                        <strong className="text-slate-800">
                          {(Number(ver.views) || 0).toLocaleString("vi-VN")}
                        </strong>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2">
                        <span className="block text-[10px] text-slate-400 uppercase">Tương tác</span>
                        <strong className="text-amber-700">
                          {totalEngagement.toLocaleString("vi-VN")}
                        </strong>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2">
                        <span className="block text-[10px] text-slate-400 uppercase">Leads</span>
                        <strong className="text-emerald-700">
                          {(Number(ver.leads_generated) || 0).toLocaleString("vi-VN")}
                        </strong>
                      </div>
                    </div>

                    {ver.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50/60 p-2 rounded-lg italic">
                        {ver.notes}
                      </p>
                    )}

                    {canApproveReward && !rewardAward && (
                      <button
                        onClick={() => openApproveModal(ver)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100"
                      >
                        <Coins className="h-3.5 w-3.5" />
                        <span>Duyệt thưởng theo phiên bản này</span>
                      </button>
                    )}
                  </article>
                );
              })}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap">Phiên bản / Đợt đo</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">Lượt xem (Views)</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">Tiếp cận (Reach)</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">Tương tác (Likes + Cmt + Share)</th>
                    <th className="px-4 py-3 whitespace-nowrap text-center">Khách tiềm năng</th>
                    <th className="px-4 py-3 whitespace-nowrap">Người xác nhận</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {versions.map((ver) => {
                    const totalEngagement =
                      (Number(ver.likes) || 0) +
                      (Number(ver.comments) || 0) +
                      (Number(ver.shares) || 0);
                    const isAwardedLog = rewardAward?.log_id === ver.id;

                    return (
                      <tr key={ver.id} className="transition hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {ver.version_name}
                            </span>
                            {isAwardedLog && (
                              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                                Đã duyệt thưởng
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatDate(ver.logged_at)}
                          </p>
                          {ver.notes && (
                            <p className="text-xs text-slate-500 italic mt-0.5 max-w-xs truncate">
                              {ver.notes}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold text-slate-800">
                          {(Number(ver.views) || 0).toLocaleString("vi-VN")}
                        </td>

                        <td className="px-4 py-3 text-right text-slate-600">
                          {(Number(ver.reach) || 0).toLocaleString("vi-VN")}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-amber-700">
                            {totalEngagement.toLocaleString("vi-VN")}
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            ({Number(ver.likes) || 0} th / {Number(ver.comments) || 0} bl / {Number(ver.shares) || 0} chia sẻ)
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-100">
                            {Number(ver.leads_generated) || 0} leads
                          </span>
                        </td>

                        <td className="px-4 py-3 text-xs text-slate-600">
                          <span className="font-medium text-slate-800">
                            {ver.verified_by_name || "Marketing"}
                          </span>
                          {ver.verified_at && (
                            <span className="block text-[10px] text-slate-400">
                              {formatDate(ver.verified_at)}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {canApproveReward && !rewardAward && (
                              <button
                                onClick={() => openApproveModal(ver)}
                                className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                                title="Duyệt thưởng theo mốc này"
                              >
                                <Coins className="h-3.5 w-3.5" />
                                <span>Duyệt thưởng</span>
                              </button>
                            )}

                            {canEdit && (
                              <button
                                onClick={() => openVersionModal(ver)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Sửa đợt đo này"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                            )}

                            {canEdit && (
                              <button
                                onClick={() => handleDeleteVersion(ver.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Xóa đợt đo này"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* VERSION MODAL */}
      {isVersionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingVersion
                      ? "Chỉnh sửa phiên bản đo lường"
                      : "Ghi nhận phiên bản hiệu quả mới"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nhập các chỉ số thực tế từ kênh phân phối (TikTok, Meta, YouTube...).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVersionModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVersion} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Tên phiên bản / Đợt ghi nhận <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={versionForm.version_name}
                    onChange={(e) =>
                      setVersionForm({ ...versionForm, version_name: e.target.value })
                    }
                    placeholder="VD: Đợt 1 - Sau 3 ngày, Sau 7 ngày, Chốt tháng..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Ngày ghi nhận
                  </label>
                  <input
                    type="date"
                    required
                    value={versionForm.logged_at}
                    onChange={(e) =>
                      setVersionForm({ ...versionForm, logged_at: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Lượt xem (Views) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={versionForm.views}
                    onChange={(e) =>
                      setVersionForm({ ...versionForm, views: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Tiếp cận (Reach)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={versionForm.reach}
                    onChange={(e) =>
                      setVersionForm({ ...versionForm, reach: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Lượt thích (Likes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={versionForm.likes}
                    onChange={(e) =>
                      setVersionForm({ ...versionForm, likes: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Bình luận (Comments)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={versionForm.comments}
                    onChange={(e) =>
                      setVersionForm({ ...versionForm, comments: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Chia sẻ (Shares)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={versionForm.shares}
                    onChange={(e) =>
                      setVersionForm({ ...versionForm, shares: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Khách tiềm năng (Leads)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={versionForm.leads_generated}
                    onChange={(e) =>
                      setVersionForm({
                        ...versionForm,
                        leads_generated: Number(e.target.value)
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Chi phí chạy Ads (nếu có, VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={versionForm.cost_spent}
                    onChange={(e) =>
                      setVersionForm({
                        ...versionForm,
                        cost_spent: Number(e.target.value)
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Ghi chú đợt đo
                  </label>
                  <textarea
                    rows={2}
                    value={versionForm.notes}
                    onChange={(e) =>
                      setVersionForm({ ...versionForm, notes: e.target.value })
                    }
                    placeholder="VD: Video có chuyển đổi cao từ TikTok search, tỷ lệ xem hết > 35%..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsVersionModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingVersion}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSavingVersion ? "Đang lưu..." : "Lưu Đợt Đo Lường"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVE REWARD MODAL */}
      {isApproveModalOpen && selectedLogForReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Duyệt Thưởng Hiệu Quả Video
                  </h3>
                  <p className="text-xs text-slate-500">
                    Theo phiên bản: {selectedLogForReward.version_name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApproveReward} className="mt-5 space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-950 space-y-2">
                <div className="flex justify-between">
                  <span>Mức thưởng / 1.000 views:</span>
                  <strong>{Number(rewardRule.per_thousand_views || 0).toLocaleString("vi-VN")} ₫</strong>
                </div>
                <div className="flex justify-between">
                  <span>Mức thưởng / tương tác (Likes+Cmt+Share):</span>
                  <strong>{Number(rewardRule.per_engagement || 0).toLocaleString("vi-VN")} ₫</strong>
                </div>
                <div className="border-t border-amber-200 pt-2 flex justify-between text-sm text-emerald-800 font-bold">
                  <span>TỔNG TIỀN THƯỞNG DỰ KIẾN:</span>
                  <span className="text-base text-emerald-950 font-extrabold">
                    {calculateEstimatedReward(selectedLogForReward).toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Nhân viên nhận thưởng <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500"
                >
                  <option value="">-- Chọn nhân viên phụ trách nhận thưởng --</option>
                  {users.map((u) => (
                    <option
                      key={u.id}
                      value={u.id}
                      disabled={u.id === currentUserId}
                    >
                      {u.full_name} {u.id === currentUserId ? "(Bạn - Cần người khác duyệt)" : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">
                  Lưu ý: Theo nguyên tắc kiểm soát, người duyệt không được tự chọn chính mình.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApproveModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isApproving}
                  className="rounded-xl bg-amber-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50"
                >
                  {isApproving ? "Đang phê duyệt..." : "Xác Nhận Duyệt Thưởng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
