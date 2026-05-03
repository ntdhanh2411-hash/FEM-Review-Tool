let chemicalSelectedYear = null;

const CHEMICAL_RESPONSE_QUESTIONS = [
    { n: 1, field: 'chemtrack', lv: 'LV1', wt: 'M', text: 'Does your facility keep a Chemical Inventory List (CIL) and the suppliers of each chemical product?' },
    { n: 2, field: 'chemsds', lv: 'LV1', wt: 'M', text: 'Does your facility make Safety Data Sheets (SDS) available to employees for all chemicals used?' },
    { n: 3, field: 'chemtraining', lv: 'LV1', wt: 'M', text: 'Does your facility train all employees who handle chemicals on chemical hazards, risk, proper handling, and what to do in case of emergency or spill?' },
    { n: 4, field: 'chememergplan', lv: 'LV1', wt: 'M', text: 'Does your facility have a chemical spill and emergency response plan that is practiced periodically?' },
    { n: 5, field: 'chemsafetyequip', lv: 'LV1', wt: 'M', text: 'Does your facility have appropriate and operable protective and safety equipment, as recommended by the Global Harmonization System compliant (or equivalent) Safety Data Sheet, in all areas where chemicals are stored and used?' },
    { n: 6, field: 'chemhazardsign', lv: 'LV1', wt: 'M', text: 'Does your facility have chemical hazard signage and safe handling equipment in the areas of the facility where chemicals are used?' },
    { n: 7, field: 'chempurchasereqrsl', lv: 'LV1', wt: 'M', text: 'Does your facility select and purchase chemicals based on their hazards and RSL requirements?' },
    { n: 8, field: 'chemstorage', lv: 'LV1', wt: 'M', text: 'Does your facility have well-marked, designated chemical storage areas?' },
    { n: 9, field: 'chemsubstorage', lv: 'LV1', wt: 'M', text: 'Does your facility have well-marked sub-storage areas?' },
    { n: 10, field: 'chemtrainingr', lv: 'LV1', wt: 'M', text: 'Does your facility train employees responsible for the chemical management system on Restricted Substance Lists (RSLs)?' },
    { n: 11, field: 'chemfailresolution', lv: 'LV1', wt: 'M', text: 'Does your facility have an established process to investigate and resolve a potential RSL failure?' },
    { n: 12, field: 'chemcmspolicynonprod', lv: 'LV1', wt: 'S', text: 'Does your facility have a written Chemical Management System (CMS) policy?' },
    { n: 13, field: 'chemcmstraining', lv: 'LV1', wt: 'S', text: 'Have you assigned the responsibility of implementing and maintaining the Chemical Management System (CMS) to a team/staff member?' },
    { n: 14, field: 'chempurchasingpolicy', lv: 'LV1', wt: 'S', text: 'Does your facility have a chemical purchasing policy?' },
    { n: 15, field: 'chemtrack', lv: 'LV1', wt: 'S', text: "Does your facility's Chemical Inventory List (CIL) include the following data? Select all that apply:" },

    { n: 16, field: 'chempurchasereqmrsl', lv: 'LV2', wt: 'M', text: 'Does your facility select and purchase chemicals based on their hazards and MRSL requirements?' },
    { n: 17, field: 'chememgagecontractors', lv: 'LV2', wt: 'M', text: 'Does your facility engage contractor(s) or subcontractor(s) on MRSL / RSL?' },
    { n: 18, field: 'chemtracelotnumber', lv: 'LV2', wt: 'M', text: 'Does your facility have a traceability procedure in place which can track chemicals and raw materials used back from the product to the inventory?' },
    { n: 19, field: 'chemengagesuppliers', lv: 'LV2', wt: 'M', text: 'Does your facility engage upstream supplier(s) on MRSL / RSL?' },
    { n: 20, field: 'chemcmsteamknow', lv: 'LV2', wt: 'S', text: 'Are relevant personnel knowledgeable about chemical products, production processes and their applications?' },
    { n: 21, field: 'chemcmsteamdrive', lv: 'LV2', wt: 'S', text: 'Do you or your team have the necessary authority from leadership to drive the Chemical Management System (CMS)?' },
    { n: 22, field: 'chemcmsteamtest', lv: 'LV2', wt: 'S', text: 'Does the facility have access to in-house testing (e.g., pH testing, color fastness)?' },
    { n: 23, field: 'chemimproveplan', lv: 'LV2', wt: 'S', text: 'Does your facility have an implementation plan to improve your chemical management system?' },
    { n: 24, field: 'chemsourcelist', lv: 'LV2', wt: 'S', text: 'Does your facility source already approved or preferred chemicals from a positive list?' },
    { n: 25, field: 'chemhealthprogram', lv: 'LV2', wt: 'S', text: 'Does your facility have an environmental and occupational health and safety program specific to chemicals management?' },
    { n: 26, field: 'chemtrainingm', lv: 'LV2', wt: 'S', text: 'Does your facility train employees responsible for the chemical management system on Manufacturing Restricted Substance Lists (MRSLs)?' },

    { n: 27, field: 'chemzdhcroadtozero', lv: 'LV3', wt: 'B', text: 'Have you adopted and implemented the ZDHC Roadmap to Zero (or the Supplier to Zero) program on sustainable chemical management and its impact areas or other chemical management related industry programs?' },
    { n: 28, field: 'chemtransparency', lv: 'LV3', wt: 'B', text: 'Do you have a transparency policy or procedure in which you share information regarding chemical products, chemical waste, and wastewater with stakeholders (For example: with ZDHC, chemical formulators, brands/retailers, authorities, NGOs)?' },
    { n: 29, field: 'chemcollabalternatives', lv: 'LV3', wt: 'B', text: 'Does your facility collaborate with brands and/or chemical suppliers to select chemicals for alternative assessment?' },
    { n: 30, field: 'chemanalysishumanenv', lv: 'LV3', wt: 'B', text: 'Does your facility contribute to a chemical analysis against human and environmental hazard criteria (e.g. persistent, bioaccumulative, and toxic) for selecting alternative processes?' },
    { n: 31, field: 'chemcontractorsr', lv: 'LV3', wt: 'B', text: 'Does your contractor(s)/subcontractor(s)/upstream supplier(s) source already approved or preferred chemicals from a positive list to replace chemicals not already included in RSL?' },
    { n: 32, field: 'chemcontractorsm', lv: 'LV3', wt: 'B', text: 'Does your contractor(s)/subcontractor(s)/upstream supplier(s) source already approved or preferred chemicals from a positive list to replace chemicals not already included in MRSL?' },
];

function escapeChemicalHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getChemicalRowByYear(rows, year) {
    return rows.find(row => String(row.version) === String(year)) || null;
}

function getChemicalResponseDataset() {
    if (typeof appData === 'undefined') return [];

    return appData.chemicals
        || appData.rawresponseChemicals
        || appData.rawresponse_chemicals
        || appData.fem_rawresponse_chemicals
        || appData['fem_rawresponse_chemicals']
        || appData['fem_rawresponse_chemicals.csv']
        || [];
}

function normalizeChemicalResponseKey(key) {
    return String(key || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function readChemicalResponseValue(row, field) {
    if (!row || !field) return '';

    const normalized = Object.keys(row).reduce((map, actualKey) => {
        map[normalizeChemicalResponseKey(actualKey)] = actualKey;
        return map;
    }, {});

    const getValue = key => {
        if (Object.prototype.hasOwnProperty.call(row, key) && row[key] !== '') return row[key];

        const actual = normalized[normalizeChemicalResponseKey(key)];
        return actual && row[actual] !== '' ? row[actual] : '';
    };

    const status = String(
        getValue('status') ||
        getValue('survey_status') ||
        getValue('surveystatus')
    ).toUpperCase();

    const corrected = getValue(`${field}.corrected`);
    const value = getValue(`${field}.value`);

    if (status === 'VRF' && corrected !== '') return String(corrected);

    return String(value || '');
}

function findChemicalResponseRow(bulkRow) {
    const rows = getChemicalResponseDataset();
    if (!rows.length || !bulkRow) return null;

    const surveyId = String(bulkRow.survey_id || bulkRow.surveyid || '').trim();
    const higgId = String(bulkRow.higg_id || '').trim();
    const version = String(bulkRow.version || '').trim().toLowerCase();

    return rows.find(row => {
        const rowSurveyId = String(row.surveyid || row.survey_id || '').trim();
        return surveyId && rowSurveyId === surveyId;
    }) || rows.find(row => {
        const rowSacid = String(row.sacid || row.SACID || row.higg_id || '').trim();
        const rowVersion = String(row.version || row.Version || '').trim().toLowerCase();

        return rowSacid === higgId && (!version || rowVersion === version);
    }) || null;
}

function normalizeChemicalAnswer(rawValue) {
    const raw = String(rawValue ?? '').trim();

    if (!raw || raw === 'null' || raw === 'undefined') {
        return { display: null, applicable: true };
    }

    if (/^yes$/i.test(raw)) {
        return { display: 'Yes', applicable: true };
    }

    if (/^no$/i.test(raw)) {
        return { display: 'No', applicable: true };
    }

    if (/partial\s*yes/i.test(raw)) {
        return { display: 'Partial Yes', applicable: true };
    }

    if (/not[\s_]?applicable/i.test(raw)) {
        return { display: 'Not Applicable', applicable: false };
    }

    if (raw.length > 3) {
        return { display: 'Yes', applicable: true };
    }

    return { display: null, applicable: true };
}

function resolveChemicalAnswer(question, chemicalRow, bulkRow) {
    let raw = chemicalRow ? readChemicalResponseValue(chemicalRow, question.field) : '';

    if (!raw && bulkRow) {
        raw = String(
            bulkRow[`${question.field}.corrected`] ||
            bulkRow[`${question.field}.value`] ||
            bulkRow[question.field] ||
            ''
        );
    }

    return normalizeChemicalAnswer(raw);
}

function renderChemicalQuestionWeightBadge(weight) {
    const styles = {
        M: { label: 'M', bg: '#fee2e2', color: '#b91c1c', title: 'Mandatory' },
        S: { label: 'S', bg: '#dbeafe', color: '#1d4ed8', title: 'Scored' },
        B: { label: 'B', bg: '#fef3c7', color: '#b45309', title: 'Bonus' },
    };

    const item = styles[weight];
    if (!item) return '';

    return `<span title="${item.title}" style="display:inline-block;margin-left:5px;padding:2px 6px;border-radius:999px;background:${item.bg};color:${item.color};font-size:10px;font-weight:850;">${item.label}</span>`;
}

function renderChemicalAnswerBadge(value) {
    const text = String(value ?? '').trim();
    const lower = text.toLowerCase();

    let color = '#64748b';
    let bg = '#e2e8f0';

    if (lower === 'yes') {
        color = '#166534';
        bg = '#dcfce7';
    } else if (lower === 'partial yes') {
        color = '#92400e';
        bg = '#fef3c7';
    } else if (lower === 'no') {
        color = '#991b1b';
        bg = '#fee2e2';
    } else if (lower === 'not applicable' || lower === 'n/a') {
        color = '#475569';
        bg = '#f1f5f9';
    }

    return `<span style="display:inline-block;padding:3px 9px;border-radius:999px;background:${bg};color:${color};font-size:11px;font-weight:800;white-space:nowrap;">${escapeChemicalHtml(text || '-')}</span>`;
}

function renderChemicalQuestionResponses(rows, selectedYear) {
    const row = getChemicalRowByYear(rows, selectedYear);
    if (!row) return document.createElement('div');

    const chemicalRow = findChemicalResponseRow(row);

    const section = document.createElement('div');
    section.id = 'chemical-question-responses-wrap';
    section.style.cssText = 'margin-top:24px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:#1d4ed8;padding:9px 16px;border-radius:6px 6px 0 0;';
    title.textContent = 'SUMMARY OF QUESTION RESPONSES';

    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:0 0 14px 14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:0;overflow:hidden;';

    const tableRows = CHEMICAL_RESPONSE_QUESTIONS.map((question, index) => {
        const answer = resolveChemicalAnswer(question, chemicalRow, row);
        const levelColor = question.lv === 'LV1' ? '#2563eb' : question.lv === 'LV2' ? '#059669' : '#7c3aed';

        return `
            <tr style="background:${index % 2 === 0 ? '#fff' : '#f8fafc'};">
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:#64748b;font-size:12px;font-weight:700;">${question.n}</td>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;white-space:nowrap;">
                    <span style="display:inline-block;padding:2px 8px;border-radius:999px;background:${levelColor}18;color:${levelColor};font-size:11px;font-weight:850;">${question.lv}</span>
                    ${renderChemicalQuestionWeightBadge(question.wt)}
                </td>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;color:#1f2937;font-size:13px;line-height:1.45;">${escapeChemicalHtml(question.text)}</td>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;text-align:center;white-space:nowrap;">${renderChemicalAnswerBadge(answer.display || '-')}</td>
            </tr>
        `;
    }).join('');

    card.innerHTML = `
        <div style="padding:12px 16px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <div style="font-size:13px;font-weight:800;color:#111827;">Summary of Question Responses</div>
            <div style="font-size:12px;color:#64748b;">${chemicalRow ? `Matched raw response for ${escapeChemicalHtml(selectedYear)}` : `Using bulk fields for ${escapeChemicalHtml(selectedYear)}`}</div>
        </div>
        <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;min-width:720px;">
                <thead>
                    <tr>
                        <th style="padding:8px 12px;background:#f1f5f9;color:#475569;font-size:11px;font-weight:800;text-transform:uppercase;text-align:center;width:48px;border-bottom:2px solid #e2e8f0;">#</th>
                        <th style="padding:8px 12px;background:#f1f5f9;color:#475569;font-size:11px;font-weight:800;text-transform:uppercase;text-align:left;width:96px;border-bottom:2px solid #e2e8f0;">Level</th>
                        <th style="padding:8px 12px;background:#f1f5f9;color:#475569;font-size:11px;font-weight:800;text-transform:uppercase;text-align:left;border-bottom:2px solid #e2e8f0;">Question</th>
                        <th style="padding:8px 12px;background:#f1f5f9;color:#475569;font-size:11px;font-weight:800;text-transform:uppercase;text-align:center;width:150px;border-bottom:2px solid #e2e8f0;">Response</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
        </div>
    `;

    section.appendChild(title);
    section.appendChild(card);

    return section;
}

function getChemicalQuestionMax(question) {
    const mCount = CHEMICAL_RESPONSE_QUESTIONS.filter(q => q.wt === 'M').length;
    const bCount = CHEMICAL_RESPONSE_QUESTIONS.filter(q => q.wt === 'B').length;
    const sCount = CHEMICAL_RESPONSE_QUESTIONS.filter(q => q.wt === 'S').length;

    if (question.wt === 'M') return 4;
    if (question.wt === 'B') return 1;

    return sCount > 0 ? (100 - bCount - mCount * 4) / sCount : 0;
}

function calculateChemicalPerformanceScore(rows, selectedYear) {
    const row = getChemicalRowByYear(rows, selectedYear);
    if (!row) return null;

    const chemicalRow = findChemicalResponseRow(row);
    const answers = {};
    const scores = {};
    const maxes = {};
    const levels = {};
    const byLevel = { LV1: [], LV2: [], LV3: [] };

    CHEMICAL_RESPONSE_QUESTIONS.forEach(question => {
        answers[question.n] = resolveChemicalAnswer(question, chemicalRow, row);
        maxes[question.n] = getChemicalQuestionMax(question);
        byLevel[question.lv].push(question);
    });

    CHEMICAL_RESPONSE_QUESTIONS.forEach(question => {
        const answer = answers[question.n] || { display: null, applicable: true };
        const max = maxes[question.n] || 0;
        let score = 0;

        if (answer.applicable !== false) {
            if (question.wt === 'M') {
                if (answer.display === 'Yes') score = 4;
                else if (answer.display === 'Partial Yes') score = 2;
            } else if (question.wt === 'B') {
                score = answer.display === 'Yes' ? 1 : 0;
            } else {
                if (answer.display === 'Yes') score = max;
                else if (answer.display === 'Partial Yes') score = max * 0.5;
            }
        }

        scores[question.n] = score;
    });

    ['LV1', 'LV2', 'LV3'].forEach(level => {
        const questions = byLevel[level];

        const levelScore = questions.reduce((sum, question) => sum + (scores[question.n] || 0), 0);
        const levelMax = questions.reduce((sum, question) => sum + (maxes[question.n] || 0), 0);
        const levelPctOk = levelMax > 0 ? levelScore / levelMax >= 0.5 : true;

        const mandatoryOk = questions
            .filter(question => question.wt === 'M')
            .every(question => {
                const answer = answers[question.n] || {};
                return answer.applicable === false || answer.display !== 'No';
            });

        const previousLevel = level === 'LV1'
            ? null
            : `LV${parseInt(level.slice(2), 10) - 1}`;

        const previousOk = previousLevel ? !!levels[previousLevel] : true;

        levels[level] = mandatoryOk && levelPctOk && previousOk;
    });

    return { scores, maxes, levels, byLevel, answers };
}

function renderChemicalPerformanceScore(rows, selectedYear) {
    const result = calculateChemicalPerformanceScore(rows, selectedYear);
    if (!result) return document.createElement('div');

    const { scores, maxes, levels, byLevel } = result;

    const section = document.createElement('div');
    section.id = 'chemical-performance-score-wrap';
    section.style.cssText = 'margin-top:24px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:#166534;padding:9px 16px;border-radius:6px 6px 0 0;';
    title.textContent = 'CHEMICALS MANAGEMENT PERFORMANCE SCORE & RATING';

    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:0 0 14px 14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:24px;';

    const levelColors = {
        LV1: '#2563eb',
        LV2: '#16a34a',
        LV3: '#7c3aed',
    };

    let achievedLevel = 0;
    if (levels.LV1) achievedLevel = 1;
    if (levels.LV2) achievedLevel = 2;
    if (levels.LV3) achievedLevel = 3;

    let scoreHtml = '';

    ['LV1', 'LV2', 'LV3'].forEach(level => {
        const questions = byLevel[level];
        const levelScore = questions.reduce((sum, question) => sum + (scores[question.n] || 0), 0);
        const levelMax = questions.reduce((sum, question) => sum + (maxes[question.n] || 0), 0);
        const pct = levelMax > 0 ? (levelScore / levelMax) * 100 : 0;
        const color = levelColors[level];

        scoreHtml += `
            <div style="margin-bottom:18px;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:7px;">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="font-size:15px;font-weight:850;color:#111827;">${level} Score</span>
                        ${levels[level] ? `<span style="display:inline-block;padding:3px 9px;border-radius:999px;background:${color}18;color:${color};font-size:12px;font-weight:850;">✓ Achieved</span>` : ''}
                    </div>
                    <div style="font-size:14px;font-weight:850;color:#111827;">
                        ${levelScore.toFixed(1)}
                        <span style="font-weight:600;color:#94a3b8;">/ ${levelMax.toFixed(1)}</span>
                    </div>
                </div>
                <div style="height:14px;background:#f1f5f9;border-radius:999px;overflow:hidden;">
                    <div style="height:100%;width:${Math.min(pct, 100).toFixed(1)}%;background:${color};border-radius:999px;"></div>
                </div>
            </div>
        `;
    });

    const totalScore = CHEMICAL_RESPONSE_QUESTIONS.reduce((sum, question) => sum + (scores[question.n] || 0), 0);
    const totalMax = CHEMICAL_RESPONSE_QUESTIONS.reduce((sum, question) => sum + (maxes[question.n] || 0), 0);
    const totalPct = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
    const totalColor = totalPct >= 70 ? '#166534' : totalPct >= 40 ? '#b45309' : '#991b1b';

    card.innerHTML = `
        ${scoreHtml}

        <div style="border-top:1px solid #e2e8f0;margin-top:6px;padding-top:18px;display:flex;align-items:flex-end;justify-content:space-between;gap:18px;">
            <div>
                <div style="font-size:20px;font-weight:900;color:#111827;margin-bottom:6px;">Total Chemicals Score</div>
                <div style="font-size:13px;color:#64748b;">Level Achieved</div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:30px;font-weight:900;color:${totalColor};line-height:1;">${totalScore.toFixed(1)}</div>
                <div style="margin-top:8px;">
                    <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${achievedLevel ? levelColors[`LV${achievedLevel}`] + '18' : '#f1f5f9'};color:${achievedLevel ? levelColors[`LV${achievedLevel}`] : '#64748b'};font-size:13px;font-weight:850;">
                        ${achievedLevel ? `Level ${achievedLevel}` : 'Level 0'}
                    </span>
                </div>
            </div>
        </div>
    `;

    section.appendChild(title);
    section.appendChild(card);

    return section;
}

function updateChemicalContent(rows, years, selectedYear) {
    if (!rows.length || !years.length) return;

    const existing = document.getElementById('chemical-content-wrap');
    if (existing) existing.remove();

    const placeholder = document.getElementById('chemical-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    const activeYear = selectedYear || chemicalSelectedYear || years[years.length - 1];
    chemicalSelectedYear = activeYear;

    const wrap = document.createElement('div');
    wrap.id = 'chemical-content-wrap';

    wrap.appendChild(renderChemicalQuestionResponses(rows, activeYear));
    wrap.appendChild(renderChemicalPerformanceScore(rows, activeYear));

    const headerCard = document.getElementById('chemical-header');

    if (headerCard) {
        headerCard.insertAdjacentElement('afterend', wrap);
    }
}
