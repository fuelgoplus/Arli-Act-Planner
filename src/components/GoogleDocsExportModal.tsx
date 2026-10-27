import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportToGoogleDocs, buildPlanDocumentContent, DocsExportResult } from '../services/googleDocs';
import { googleSignIn } from '../services/auth';
import {
  X,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface GoogleDocsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDocsExportModal: React.FC<GoogleDocsExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { plan, googleToken, setGoogleToken, currentUser } = useApp();

  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<DocsExportResult | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setExportResult(null);

    try {
      let token = googleToken;

      // If token not present in memory, trigger interactive Google Sign-In with Docs & Drive scopes
      if (!token) {
        const signResult = await googleSignIn();
        if (signResult?.accessToken) {
          token = signResult.accessToken;
          setGoogleToken(token);
        } else {
          throw new Error('未取得 Google Docs 授權 Access Token');
        }
      }

      const result = await exportToGoogleDocs(token, plan);
      setExportResult(result);
    } catch (err: any) {
      console.error('Export Error:', err);
      setExportResult({
        success: false,
        error: err.message || '匯出至 Google 文件失敗，請確認 Google 帳戶授權狀態。',
        exportedAt: new Date().toISOString(),
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyText = () => {
    const text = buildPlanDocumentContent(plan);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const previewSnippet = buildPlanDocumentContent(plan).slice(0, 800) + '...';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              匯出活動程序檢核表至 Google 文件 (Google Docs Export)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            系統將透過 Google Docs REST API，於您的 Google 雲端硬碟建立一份完整格式化之活動規劃執行報告，
            包含會議程序規範、決策與審查多數決例外、預算分項表、四組分工名冊以及五大階段共 {plan.tasks.length} 項工作成果檢核表。
          </p>

          {/* Export Success Banner */}
          {exportResult?.success && exportResult.documentUrl && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Google 文件已建立成功！文件 ID：{exportResult.documentId}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={exportResult.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>立即於新分頁開啟 Google 文件</span>
                </a>
                <span className="text-[11px] text-emerald-700">
                  可直接於 Google Docs 中列印、排版或與高階主管共享協作
                </span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {exportResult && !exportResult.success && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">匯出遇到狀況：</div>
                <div className="text-[11px] mt-0.5">{exportResult.error}</div>
                <div className="text-[11px] text-rose-600 mt-1">
                  提示：您亦可點擊下方「複製格式化全文」，直接貼入任何 Google Doc 或 Word 之中。
                </div>
              </div>
            </div>
          )}

          {/* Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs font-medium text-slate-700">
              <span>文件內容預覽 (Executive Layout Preview)</span>
              <button
                onClick={handleCopyText}
                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-[11px] font-semibold"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? '已複製全文至剪貼簿！' : '複製格式化文字'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] leading-relaxed overflow-x-auto max-h-56 select-all">
              {previewSnippet}
            </pre>
          </div>

          {/* Document Properties */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">文件標題</span>
              <span className="font-semibold text-slate-800 truncate block">{plan.title}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">籌備版本 / 基準日</span>
              <span className="font-mono text-slate-800 font-semibold">{plan.version} ({plan.date})</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">包含任務筆數</span>
              <span className="font-tabular text-slate-800 font-semibold">{plan.tasks.length} 項工作清單</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200">
          <div className="text-[11px] text-slate-500">
            {googleToken ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 已具備 Google Docs 寫入授權
              </span>
            ) : (
              <span>點擊後將彈出 Google 帳號授權同意視窗</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              關閉
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>正在寫入 Google 文件...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  <span>正式匯出至 Google Docs</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
