import { ActivityPlan } from '../types';

export interface DocsExportResult {
  success: boolean;
  documentId?: string;
  documentUrl?: string;
  error?: string;
  exportedAt: string;
}

/**
 * Builds an executive-formatted text dossier from the Activity Plan.
 */
export const buildPlanDocumentContent = (plan: ActivityPlan): string => {
  const divider = '========================================================================\n';
  const subDivider = '------------------------------------------------------------------------\n';

  let content = '';
  content += `${plan.title}\n`;
  content += `版本：${plan.version}  |  會議基準日：${plan.date}  |  預計晚宴日：${plan.eventTargetDate}\n`;
  content += `召集單位：${plan.organization}  |  大會主席/主委：${plan.chairperson}\n`;
  content += divider;
  content += '\n【前言與程序會議規範】\n';
  content += '將程序會議應用在福委會年度規劃中，用意是規範『活動會議要怎麼開』；\n';
  content += '定位為「正式提案與表決前的預備」，用來定預算、時程表、執行規則。\n\n';

  content += '【審查與表決規則 (含決策適用範圍)】\n';
  content += '1. 一般議題：由福委會委員過半數表決或全體員工投票（如旅遊目的地、節目形式）。\n';
  content += '2. 不適用多數決的重大議題：\n';
  plan.decisionRules.nonMajorityRules.forEach((rule, idx) => {
    content += `   (${idx + 1}) ${rule}\n`;
  });
  content += '3. 需向高階主管正式對齊並取得核准之項目：\n';
  plan.decisionRules.executiveSignOffItems.forEach((item, idx) => {
    content += `   - ${item}\n`;
  });
  content += '\n' + divider;

  content += '【年度總預算與分配上限】\n';
  content += `年度總預算：NT$ ${plan.budget.totalBudget.toLocaleString()} 元  |  預備金：NT$ ${plan.budget.contingencyBudget.toLocaleString()} 元\n`;
  plan.budget.allocations.forEach(alloc => {
    content += `· ${alloc.category}：分配金額 NT$ ${alloc.allocatedAmount.toLocaleString()} 元 (已核銷 NT$ ${alloc.spentAmount.toLocaleString()} 元)\n`;
  });
  content += '\n' + divider;

  content += '【任務分組與職責名冊】\n';
  content += '· 行政 (主委 Bear)：提報核可、預算編列與核定、主題節目、任務分派、結案最終核定\n';
  content += '· 財務 (財委 Amos)：預算審編、會計出納、核銷憑證、中獎稅務申報\n';
  content += '· 總務 (Ann, Lydia, Carol)：外包比價、廠商簽約、場勘、物資採購、訂位飲食調查\n';
  content += '· 活動 (Philip, Sharon, Mason)：主題企劃、晚宴流程 Rundown、表演主持、互動遊戲、問卷統計\n';
  content += '\n' + divider;

  content += '【尾牙活動分項檢核表 (五大執行階段)】\n\n';

  plan.phases.forEach(phase => {
    content += `=== [${phase.code}] ${phase.name} (${phase.subtitle}) ===\n`;
    content += `階段目標：${phase.description}\n`;
    content += subDivider;
    content += `代號 | 時限(L-T) | 組別 | 負責人 | 交付項目 | 狀態 | 檢核工作名稱\n`;
    content += subDivider;

    const phaseTasks = plan.tasks.filter(t => t.phaseId === phase.id);
    phaseTasks.forEach(task => {
      const statusLabel = 
        task.status === 'completed' ? '[已完成]' :
        task.status === 'in_progress' ? '[進行中]' :
        task.status === 'under_review' ? '[審核中]' :
        task.status === 'blocked' ? '[遇阻礙]' : '[待啟動]';

      content += `${task.code.padEnd(5)} | ${(task.leadTime || '-').padEnd(8)} | ${task.group.padEnd(4)} | ${task.assignee.padEnd(5)} | ${task.deliverables.padEnd(16)} | ${statusLabel} | ${task.title}\n`;
    });

    if (phase.wrapUpNotes && phase.wrapUpNotes.length > 0) {
      content += `\n【${phase.code} 結案檢核重點 (Wrap-up)】:\n`;
      phase.wrapUpNotes.forEach((note, i) => {
        content += `  ${i + 1}. ${note}\n`;
      });
    }
    content += '\n';
  });

  content += divider;
  content += `文件匯出時間：${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}\n`;
  content += `EventFlow 企業活動規劃系統 · 數位化會議程序檢核表\n`;

  return content;
};

/**
 * Creates a real Google Document using the Google Docs & Drive REST API with user's access token.
 */
export const exportToGoogleDocs = async (
  accessToken: string,
  plan: ActivityPlan
): Promise<DocsExportResult> => {
  const timestamp = new Date().toISOString();
  try {
    const docTitle = `${plan.title} - ${plan.date} (EventFlow Export)`;

    // 1. Create a blank Google Document
    const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: docTitle,
      }),
    });

    if (!createRes.ok) {
      const errJson = await createRes.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `HTTP ${createRes.status}: Failed to create Google Document`);
    }

    const docData = await createRes.json();
    const documentId = docData.documentId;

    // 2. Prepare structured body text
    const textContent = buildPlanDocumentContent(plan);

    // 3. Insert content using batchUpdate
    const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: textContent,
            },
          },
        ],
      }),
    });

    if (!updateRes.ok) {
      console.warn('Batch update returned status:', updateRes.status);
    }

    const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

    return {
      success: true,
      documentId,
      documentUrl,
      exportedAt: timestamp,
    };
  } catch (err: any) {
    console.error('Google Docs export failed:', err);
    return {
      success: false,
      error: err.message || 'Unknown error exporting to Google Docs',
      exportedAt: timestamp,
    };
  }
};
