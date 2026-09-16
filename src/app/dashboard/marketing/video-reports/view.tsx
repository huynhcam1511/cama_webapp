"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Edit3,
  ExternalLink,
  Eye,
  Filter,
  Layers,
  MoreVertical,
  Plus,
  Search,
  Share2,
  Trash2,
  TrendingUp,
  Video,
  X
} from "lucide-react";
import { deleteVideoReport } from "./actions";
import { saveVideoRewardRule, VideoRewardRule } from "./reward-actions";

interface VideoReportsViewProps {
  initialVideos: any[];
  permissions: {
    can_create: boolean;
    can_update: boolean;
    can_delete: boolean;
  };
  rewardRule: VideoRewardRule;
  users: { id: string; full_name: string }[];
}

export default function VideoReportsView({
  initialVideos,
  permissions,
  rewardRule,
  users
}: VideoReportsViewProps) {
  const router = useRouter();
  const [videos, setVideos] = useState(initialVideos);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Reward Rule Modal State
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    views: rewardRule.per_thousand_views || 0,
    engagement: rewardRule.per_engagement || 0
  });
  const [isSavingRule, setIsSavingRule] = useState(false);
  const [ruleMessage, setRuleMessage] = useState("");

  const canCreate = permissions.can_create;
  const canUpdate = permissions.can_update;
  const canDelete = permissions.can_delete;

  // Filtered list
  const filteredVideos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return videos.filter((item) => {
      const matchQuery =
        !query ||
        item.title?.toLowerCase().includes(query) ||
        item.code?.toLowerCase().includes(query);

      let matchStatus = true;
      if (statusFilter === "HAS_LOGS") {
        matchStatus = (item.versions_count || 0) > 0;
      } else if (statusFilter === "NO_LOGS") {
        matchStatus = (item.versions_count || 0) === 0;
      }

      return matchQuery && matchStatus;
    });
  }, [videos, searchQuery, statusFilter]);

  // Totals for top stat cards
  const stats = useMemo(() => {
    let totalViews = 0;
    let totalEngagement = 0;
    let totalLeads = 0;
    let totalVideos = videos.length;

    videos.forEach((v) => {
      const log = v.latest_log;
      if (log) {
        totalViews += Number(log.views) || 0;
        totalEngagement +=
          (Number(log.likes) || 0) +
          (Number(log.comments) || 0) +
          (Number(log.shares) || 0);
        totalLeads += Number(log.leads_generated) || 0;
      }
    });

    return { totalVideos, totalViews, totalEngagement, totalLeads };
  }, [videos]);

  const handleDeleteVideo = async (video: any) => {
    setMenuOpen(null);
    if (
      !confirm(
        `Xác nhận xóa báo cáo video “${video.title}”?\n\nToàn bộ dữ liệu các phiên bản đo lường liên quan sẽ bị xóa.`
      )
    )
      return;

    const res = await deleteVideoReport(video.id);
    if (res.success) {
      setVideos((cur) => cur.filter((item) => item.id !== video.id));
      router.refresh();
    } else {
      alert("Lỗi khi xóa: " + res.error);
    }
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingRule(true);
      setRuleMessage("");
      await saveVideoRewardRule(Number(ruleForm.views), Number(ruleForm.engagement));
      setRuleMessage("Đã cập nhật mức thưởng thành công!");
      setTimeout(() => {
        setIsRewardModalOpen(false);
        setRuleMessage("");
      }, 1200);
      router.refresh();
    } catch (err: any) {
      alert("Không lưu được mức thưởng: " + err.message);
    } finally {
      setIsSavingRule(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Chưa xác định";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  const ActionMenu = ({ video }: { video: any }) => {
    const videoUrl =
      video.asset_link ||
      video.published_links?.tiktok ||
      video.published_links?.youtube ||
      video.published_links?.page_vay;

    return (
      <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => setMenuOpen(menuOpen === video.id ? null : video.id)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          title="Tùy chọn"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
        {menuOpen === video.id && (
          <>
            <button
              className="fixed inset-0 z-30 cursor-default"
              onClick={() => setMenuOpen(null)}
            />
            <div className="absolute right-0 top-10 z-40 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-sm shadow-xl">
              {videoUrl ? (
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left font-medium text-emerald-700 hover:bg-emerald-50"
                  onClick={() => setMenuOpen(null)}
                >
                  <ExternalLink className="h-4 w-4" /> Mở link xem video
                </a>
              ) : (
                <span className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs italic text-slate-400">
                  <ExternalLink className="h-4 w-4" /> Chưa đính kèm link
                </span>
              )}

              <Link
                href={`/dashboard/marketing/video-reports/${video.id}`}
                className="mt-1 flex w-full items-center gap-2.5 rounded-lg border-t border-slate-100 px-3 py-2.5 text-left font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setMenuOpen(null)}
              >
                <Edit3 className="h-4 w-4 text-blue-600" />
                <span>Chi tiết & Quản lý phiên bản</span>
              </Link>

              {canDelete && (
                <button
                  onClick={() => handleDeleteVideo(video)}
                  className="mt-1 flex w-full items-center gap-2.5 rounded-lg border-t border-slate-100 px-3 py-2.5 text-left font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" /> Xóa video
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 text-slate-900 md:space-y-5">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
            Báo cáo Hiệu quả Video
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Theo dõi lượt xem, tương tác, khách tiềm năng và lịch sử các đợt đo lường hiệu quả bài đăng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canUpdate && (
            <button
              onClick={() => setIsRewardModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Award className="h-4 w-4 text-amber-500" />
              <span>Cấu hình thưởng</span>
            </button>
          )}

          {canCreate && (
            <Link
              href="/dashboard/marketing/video-reports/new"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm video mới</span>
            </Link>
          )}
        </div>
      </div>

      {/* STAT SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Tổng video</span>
            <Video className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
            {stats.totalVideos.toLocaleString("vi-VN")}
          </div>
          <p className="mt-1 text-xs text-slate-500">Video & Reels được ghi nhận</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Lượt xem tích lũy
            </span>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-blue-700 sm:text-2xl">
            {stats.totalViews.toLocaleString("vi-VN")}
          </div>
          <p className="mt-1 text-xs text-slate-500">Tính theo phiên bản mới nhất</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Tương tác
            </span>
            <Share2 className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-amber-700 sm:text-2xl">
            {stats.totalEngagement.toLocaleString("vi-VN")}
          </div>
          <p className="mt-1 text-xs text-slate-500">Thích + Bình luận + Chia sẻ</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Khách tiềm năng
            </span>
            <BarChart3 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-700 sm:text-2xl">
            {stats.totalLeads.toLocaleString("vi-VN")}
          </div>
          <p className="mt-1 text-xs text-slate-500">Leads tạo ra từ video</p>
        </div>
      </div>

      {/* SEARCH AND FILTER */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-3 md:flex-row md:items-center md:gap-4 md:p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Tìm theo tên video, mã video..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="flex w-full items-center gap-2 md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 md:w-auto"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="HAS_LOGS">Đã ghi nhận số liệu</option>
              <option value="NO_LOGS">Chưa có số liệu</option>
            </select>
          </div>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="divide-y divide-slate-100 sm:hidden">
          {filteredVideos.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              Không tìm thấy video nào phù hợp.
            </p>
          ) : (
            filteredVideos.map((video) => {
              const latest = video.latest_log;
              return (
                <article key={video.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/dashboard/marketing/video-reports/${video.id}`}
                      className="min-w-0 flex-1"
                    >
                      <h2 className="break-words text-[15px] font-semibold text-slate-900">
                        {video.title}
                      </h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(video.actual_publish_date)}
                        </span>
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-slate-600 font-medium">
                          {video.format || "VIDEO"}
                        </span>
                      </div>
                    </Link>
                    <ActionMenu video={video} />
                  </div>

                  <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs">
                    {latest ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between font-medium">
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700">
                            {latest.version_name}
                          </span>
                          <span className="text-slate-500">
                            {formatDate(latest.logged_at)}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-1.5 text-center">
                          <div className="rounded-lg bg-white p-1.5 border border-slate-200">
                            <span className="block text-[10px] text-slate-400 uppercase">Views</span>
                            <span className="font-bold text-slate-800">
                              {(Number(latest.views) || 0).toLocaleString("vi-VN")}
                            </span>
                          </div>
                          <div className="rounded-lg bg-white p-1.5 border border-slate-200">
                            <span className="block text-[10px] text-slate-400 uppercase">Tương tác</span>
                            <span className="font-bold text-amber-700">
                              {(
                                (Number(latest.likes) || 0) +
                                (Number(latest.comments) || 0) +
                                (Number(latest.shares) || 0)
                              ).toLocaleString("vi-VN")}
                            </span>
                          </div>
                          <div className="rounded-lg bg-white p-1.5 border border-slate-200">
                            <span className="block text-[10px] text-slate-400 uppercase">Leads</span>
                            <span className="font-bold text-emerald-700">
                              {(Number(latest.leads_generated) || 0).toLocaleString("vi-VN")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center italic text-slate-400">
                        Chưa có phiên bản đo lường nào
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-500">
                      {video.versions_count || 0} lần ghi nhận
                    </span>
                    <Link
                      href={`/dashboard/marketing/video-reports/${video.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      <span>Xem chi tiết</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* DESKTOP TABLE VIEW */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-white text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Video / Tiêu đề</th>
                <th className="px-4 py-3 whitespace-nowrap">Ngày đăng</th>
                <th className="px-4 py-3">Phiên bản đo lường mới nhất</th>
                <th className="px-4 py-3 text-center whitespace-nowrap">Số đợt đo</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredVideos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Không tìm thấy video nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredVideos.map((video) => {
                  const latest = video.latest_log;
                  return (
                    <tr key={video.id} className="transition hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/marketing/video-reports/${video.id}`}
                          className="group block"
                        >
                          <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition">
                            {video.title}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                              {video.format || "VIDEO"}
                            </span>
                            {video.asset_link && (
                              <a
                                href={video.asset_link}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" /> Xem link
                              </a>
                            )}
                          </div>
                        </Link>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        {formatDate(video.actual_publish_date)}
                      </td>

                      <td className="px-4 py-3">
                        {latest ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-100">
                                {latest.version_name}
                              </span>
                              <span className="text-xs text-slate-400">
                                ({formatDate(latest.logged_at)})
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-600">
                              <span>
                                <strong>{(Number(latest.views) || 0).toLocaleString("vi-VN")}</strong> views
                              </span>
                              <span>·</span>
                              <span>
                                <strong>
                                  {(
                                    (Number(latest.likes) || 0) +
                                    (Number(latest.comments) || 0) +
                                    (Number(latest.shares) || 0)
                                  ).toLocaleString("vi-VN")}
                                </strong> tương tác
                              </span>
                              <span>·</span>
                              <span className="text-emerald-700 font-semibold">
                                {Number(latest.leads_generated) || 0} leads
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs italic text-slate-400">
                            Chưa có số liệu đo lường
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                          {video.versions_count || 0} lần
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <ActionMenu video={video} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* REWARD RULE MODAL */}
      {isRewardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Cấu hình Đơn giá Thưởng Video
                  </h3>
                  <p className="text-xs text-slate-500">
                    Áp dụng khi Quản lý duyệt thưởng từ các phiên bản đo lường hiệu quả.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRewardModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Đơn giá trên 1.000 lượt xem (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={ruleForm.views}
                  onChange={(e) => setRuleForm({ ...ruleForm, views: Number(e.target.value) })}
                  placeholder="VD: 5000"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
                <p className="text-xs text-slate-500">
                  Ví dụ: Đặt 5.000đ thì video đạt 100.000 views được thưởng: (100.000 / 1.000) × 5.000 = 500.000 VNĐ.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Đơn giá trên mỗi lượt tương tác (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={ruleForm.engagement}
                  onChange={(e) => setRuleForm({ ...ruleForm, engagement: Number(e.target.value) })}
                  placeholder="VD: 200"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
                <p className="text-xs text-slate-500">
                  Tương tác bao gồm tổng số lượt: Thích (Likes) + Bình luận (Comments) + Chia sẻ (Shares).
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
                <strong className="block font-semibold">Công thức tính thưởng:</strong>
                <p className="mt-0.5">
                  Thưởng = (Lượt xem / 1.000 × Đơn giá views) + (Tổng tương tác × Đơn giá tương tác).
                </p>
                <p className="mt-1 text-amber-800">
                  * Mỗi video chỉ được duyệt thưởng chính thức 1 lần và sẽ tự động kết nối vào Bảng lương của nhân viên được chọn.
                </p>
              </div>

              {ruleMessage && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{ruleMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRewardModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSavingRule}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSavingRule ? "Đang lưu..." : "Lưu Cấu Hình Thưởng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

