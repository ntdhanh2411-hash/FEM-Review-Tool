let airSelectedYear = null;

const AIR_OVERVIEW_COLOR = '#8b1d1d';

const AIR_REFRIG_COLORS = [
    '#14b8a6', '#e91e63', '#2563eb', '#f97316', '#8b5cf6', '#22c55e',
    '#0ea5e9', '#64748b', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'
];

const AIR_UOM_TO_KG = {
    kg: 1,
    g: 0.001,
    lb: 0.453592,
    lbs: 0.453592,
    t: 1000,
    ton: 1000,
    tonne: 1000
};

const AIR_REFRIGERANT_NAME_MAP = {
    r22: 'R-22 (HCFC-22 / Freon 22)',
    r32: 'R-32 (Difluoromethane / HFC-32)',
    r134A: 'R-134a (HFC-134a / 1,1,1,2-Tetrafluoroethane)',
    r410A: 'R-410A (HFC-410A / Puron)',
    r404A: 'R-404A (HFC-404A blend)',
    r407C: 'R-407C (HFC-407C blend)',
    r507A: 'R-507A (AZ-50 / HFC-507A)',
    r290: 'R-290 (Propane)',
    r600A: 'R-600a (Isobutane / R-600a)',
    r717: 'R-717 (Ammonia / NH3)',
    r744: 'R-744 (Carbon Dioxide / CO2)'
};

const AIR_RESPONSE_QUESTIONS_RAW = [
    { n: 1, field: 'airmobile', lv: 'LV1', wt: 'M', text: 'Has your facility created an inventory of all mobile and fugitive emission sources at your facility?' },
    { n: 2, field: 'aircompliance', lv: 'LV1', wt: 'M', text: 'Is your facility in compliance with all applicable legal requirements relating to air emissions including all permitting, reporting and testing requirements?' },
    { n: 3, field: 'airrefrigerant', lv: 'LV1', wt: 'M', text: 'Do you know what refrigerants your facility uses?' },
    { n: 4, field: 'airleakage', lv: 'LV1', wt: 'M', text: 'Does your facility have preventative maintenance procedures in place to avoid refrigerant leakage from your equipment?' },
    { n: 5, field: 'airrefrigtrack', lv: 'LV1', wt: 'M', text: 'Does your facility track refrigerant usage?' },
    { n: 6, field: 'airsourceinvent', lv: 'LV1', wt: 'M', text: 'Has your facility created an inventory of all point source air emissions sources at your facility?' },
    { n: 7, field: 'airmonitor', lv: 'LV1', wt: 'B', text: 'Are you monitoring or reporting against any industry guidelines or tools for air emissions (additional to the legal requirement)?' },

    { n: 8, field: 'airpollutanttrack', lv: 'LV2', wt: 'S', text: 'Does your facility track the total annual emissions quantities of key pollutants from all point source emissions from facility operations?' },
    { n: 9, field: 'airproduction', lv: 'LV2', wt: 'S', text: 'Does your facility track the total annual emissions quantities of key pollutants from all emissions from production?' },
    { n: 10, field: 'airreduce', lv: 'LV2', wt: 'S', text: 'Has your facility established an implementation plan to reduce air emissions from facility operations?' },
    { n: 11, field: 'airimplementation', lv: 'LV2', wt: 'S', text: 'Has your facility established an implementation plan to reduce air emissions from production processes?' },
    { n: 12, field: 'airmonitorscore', lv: 'LV2', wt: 'B', text: 'Are you monitoring or reporting against any industry guidelines or tools for air emissions (additional to the legal requirement)?' },
    { n: 13, field: 'airindustryreq', lv: 'LV2', wt: 'B', text: 'Are you meeting / conforming to the requirements of the industry guideline(s) on air emissions?' },
    { n: 14, field: 'airreplace', lv: 'LV2', wt: 'S', text: 'Do you have a plan to or have you already replaced your current refrigerant with low ODP / low GWP refrigerant gasses that goes beyond current legal requirements?' },
    { n: 15, field: 'airpolicies', lv: 'LV2', wt: 'S', text: 'Does the facility have business policies or procedures in effect that ensure that all Best Available Technologies (BAT) for air emissions reductions are considered in the long-term environmental plans of the facility?' },

    { n: 16, field: 'airplan', lv: 'LV3', wt: 'B', text: 'Has your facility made progress on your implementation plan to reduce air emissions from facility operations in the reporting year?' },
    { n: 17, field: 'airprogress', lv: 'LV3', wt: 'B', text: 'Has your facility made progress on your implementation plan to reduce air emissions from production processes in the reporting year?' },
    { n: 18, field: 'airreplacelegal', lv: 'LV3', wt: 'B', text: 'Have you replaced your current refrigerant with low ODP / low GWP refrigerant gasses that goes beyond current legal requirements?' },
    { n: 19, field: 'airtech', lv: 'LV3', wt: 'B', text: 'Have you utilized the best available technology (BAT) for the major air emissions from your facility?' },
];

function computeAirMaxScores(questions) {
    const mCount = questions.filter(q => q.wt === 'M').length;
    const bCount = questions.filter(q => q.wt === 'B').length;
    const sCount = questions.filter(q => q.wt === 'S').length;
    const sMax = sCount > 0 ? (100 - bCount - mCount * 10) / sCount : 0;

    return questions.map(q => ({
        ...q,
        max: q.wt === 'M' ? 10 : q.wt === 'B' ? 1 : Math.max(0, sMax)
    }));
}

const AIR_RESPONSE_QUESTIONS = computeAirMaxScores(AIR_RESPONSE_QUESTIONS_RAW);

function parseAirValue(value) {
    const n = parseFloat(String(value ?? '').replace(/,/g, ''));
    return !isNaN(n) && n > 0 ? n : 0;
}

function escapeAirHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatAirKg(value) {
    const n = parseAirValue(value);
    if (n >= 1000) return (n / 1000).toFixed(2) + ' t';
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' kg';
}

function sortAirYears(years) {
    return [...years].sort((a, b) => {
        const ay = Number(String(a).replace(/\D/g, ''));
        const by = Number(String(b).replace(/\D/g, ''));
        return ay - by;
    });
}

function getAirYears(rows) {
    return sortAirYears([...new Set(rows.map(row => row.version).filter(Boolean))]);
}

function getAirRowByYear(rows, year) {
    return rows.find(row => String(row.version) === String(year)) || null;
}

function getAirResponseDataset() {
    if (typeof appData === 'undefined') return [];

    return appData.airemissions
        || appData.air
        || appData.rawresponseAiremissions
        || appData.rawresponse_airemissions
        || appData.fem_rawresponse_airemissions
        || appData['fem_rawresponse_airemissions']
        || appData['fem_rawresponse_airemissions.csv']
        || [];
}

function normalizeAirResponseKey(key) {
    return String(key || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function readAirResponseValue(row, field) {
    if (!row || !field) return '';

    const normalized = Object.keys(row).reduce((map, actualKey) => {
        map[normalizeAirResponseKey(actualKey)] = actualKey;
        return map;
    }, {});

    const getValue = key => {
        if (Object.prototype.hasOwnProperty.call(row, key) && row[key] !== '') return row[key];

        const actual = normalized[normalizeAirResponseKey(key)];
        return actual && row[actual] !== '' ? row[actual] : '';
    };

    const status = String(getValue('status')).toUpperCase();
    const corrected = getValue(`${field}.corrected`);
    const value = getValue(`${field}.value`);

    if (status === 'VRF' && corrected !== '') return corrected;

    return value || getValue(field) || '';
}

function findAirResponseRow(bulkRow) {
    const rows = getAirResponseDataset();
    if (!rows.length || !bulkRow) return null;

    const higgId = String(bulkRow.higg_id || '').trim();
    const version = String(bulkRow.version || '').trim().toLowerCase();
    const surveyId = String(bulkRow.survey_id || bulkRow.surveyid || '').trim();

    return rows.find(row => {
        const rowSacid = String(row.sacid || row.SACID || row.higg_id || row.higgid || '').trim();
        const rowVersion = String(row.version || row.Version || '').trim().toLowerCase();

        return rowSacid === higgId && (!version || rowVersion === version);
    }) || rows.find(row => {
        const rowSurveyId = String(row.surveyid || row.survey_id || row.SurveyID || '').trim();
        return surveyId && rowSurveyId === surveyId;
    }) || null;
}

function getAirRefrigerantSuffixes(airRow) {
    if (!airRow) return [];

    const suffixes = new Set();

    Object.keys(airRow).forEach(key => {
        const normalized = key.replace(/\.(value|corrected)$/i, '');
        const match = normalized.match(/^airrefrig(.+)quant$/i);

        if (match && match[1]) {
            suffixes.add(match[1]);
        }
    });

    return [...suffixes];
}

function getAirRefrigerantIdFromSuffix(suffix) {
    if (!suffix) return '';
    return suffix.startsWith('r') ? suffix : 'r' + suffix;
}

function getAirRefrigerantName(suffix) {
    const id = getAirRefrigerantIdFromSuffix(suffix);
    if (AIR_REFRIGERANT_NAME_MAP[id]) return AIR_REFRIGERANT_NAME_MAP[id];

    const label = suffix.startsWith('r') ? suffix.toUpperCase() : 'R-' + suffix.toUpperCase();
    return label.replace(/^R-([0-9]+)([A-Z])$/, 'R-$1$2');
}

function getAirRefrigerantKg(airRow, suffix) {
    if (!airRow || !suffix) return 0;

    const base = `airrefrig${suffix}`;
    const quantity = parseAirValue(readAirResponseValue(airRow, `${base}quant`));
    const uom = String(readAirResponseValue(airRow, `${base}uom`)).trim().toLowerCase();

    if (!quantity) return 0;

    const factor = AIR_UOM_TO_KG[uom] !== undefined ? AIR_UOM_TO_KG[uom] : 1;
    return quantity * factor;
}

function getAirRefrigerantLeakValue(airRow, suffix) {
    return String(readAirResponseValue(airRow, `airrefrig${suffix}leak`)).trim();
}

function getAirRefrigerantItems(row) {
    const airRow = findAirResponseRow(row);
    if (!airRow) return [];

    const items = getAirRefrigerantSuffixes(airRow).map((suffix, index) => {
        const quantity = getAirRefrigerantKg(airRow, suffix);
        const leak = getAirRefrigerantLeakValue(airRow, suffix);
        const hasLeak = /^yes$/i.test(leak);

        return {
            suffix,
            id: getAirRefrigerantIdFromSuffix(suffix),
            name: getAirRefrigerantName(suffix),
            quantity,
            hasLeak,
            color: AIR_REFRIG_COLORS[index % AIR_REFRIG_COLORS.length],
        };
    }).filter(item => item.quantity > 0 || item.hasLeak);

    const total = items.reduce((sum, item) => sum + item.quantity, 0);

    return items
        .sort((a, b) => b.quantity - a.quantity)
        .map((item, index) => ({
            ...item,
            ranking: index + 1,
            share: total > 0 ? (item.quantity / total) * 100 : 0,
        }));
}

function getAirTotalRefrigerantKg(row) {
    return getAirRefrigerantItems(row).reduce((sum, item) => sum + item.quantity, 0);
}

function buildAirChangeBadge(currentValue, previousValue) {
    if (!previousValue || previousValue <= 0 || !currentValue) {
        return '<span style="color:#94a3b8;font-size:13px;font-weight:700;">No previous year comparison</span>';
    }

    const pct = ((currentValue - previousValue) / previousValue) * 100;
    const color = pct > 0 ? '#dc2626' : pct < 0 ? '#16a34a' : '#64748b';
    const arrow = pct > 0 ? '▲' : pct < 0 ? '▼' : '→';
    const wording = pct > 0 ? 'increase' : pct < 0 ? 'decrease' : 'no change';

    return `
        <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;">
            <span style="font-size:22px;font-weight:850;color:${color};">${arrow} ${Math.abs(pct).toFixed(1)}%</span>
            <span style="font-size:12px;font-weight:700;color:#64748b;">${wording} vs previous FEM year</span>
        </div>
    `;
}

function renderAirRefrigerantSection(rows, years, selectedYear) {
    const selectedRow = getAirRowByYear(rows, selectedYear);
    const selectedIndex = years.findIndex(year => String(year) === String(selectedYear));
    const previousRow = selectedIndex > 0 ? getAirRowByYear(rows, years[selectedIndex - 1]) : null;

    const items = getAirRefrigerantItems(selectedRow);
    const total = getAirTotalRefrigerantKg(selectedRow);
    const previousTotal = getAirTotalRefrigerantKg(previousRow);

    const section = document.createElement('div');
    section.id = 'air-refrigerant-overview-wrap';
    section.style.cssText = 'margin-top:20px;';

    const title = document.createElement('div');
    title.style.cssText = `font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:${AIR_OVERVIEW_COLOR};padding:9px 16px;border-radius:6px 6px 0 0;`;
    title.textContent = 'REFRIGERANT EMISSIONS OVERVIEW';

    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:0 0 14px 14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:24px;display:grid;grid-template-columns:minmax(280px,0.8fr) minmax(520px,1.6fr);gap:28px;align-items:start;';

    const left = document.createElement('div');
    left.style.cssText = 'background:#fff1f2;border:1px solid #fecdd3;border-radius:12px;padding:18px;';

    left.innerHTML = `
        <div style="font-size:11px;font-weight:800;color:#991b1b;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:12px;">Total Refrigerant Quantity</div>
        <div style="font-size:34px;font-weight:900;color:#0f172a;line-height:1;">${total > 0 ? formatAirKg(total) : '-'}</div>
        <div style="font-size:12px;color:#64748b;margin-top:8px;">in ${escapeAirHtml(selectedYear)}</div>
        <div style="margin-top:14px;">${buildAirChangeBadge(total, previousTotal)}</div>
    `;

    const right = document.createElement('div');
    right.style.cssText = 'overflow-x:auto;';

    if (!items.length) {
        right.innerHTML = '<div style="font-size:13px;color:#94a3b8;padding:12px;">No refrigerant data available for this year.</div>';
    } else {
        const rowsHtml = items.map(item => `
            <tr>
                <td style="padding:9px 10px;border-bottom:1px solid #f1f5f9;text-align:center;">
                    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:${item.color};color:#fff;font-size:11px;font-weight:800;">${item.ranking}</span>
                </td>
                <td style="padding:9px 10px;border-bottom:1px solid #f1f5f9;">
                    <div style="font-weight:800;color:#1f2937;">${escapeAirHtml(item.name)}</div>
                    ${item.hasLeak ? '<div style="font-size:10px;color:#dc2626;font-weight:800;margin-top:2px;">Confirmed leak</div>' : ''}
                </td>
                <td style="padding:9px 10px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:800;color:#111827;">${formatAirKg(item.quantity)}</td>
                <td style="padding:9px 10px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:850;color:${item.color};">${item.share.toFixed(1)}%</td>
                <td style="padding:9px 10px;border-bottom:1px solid #f1f5f9;min-width:150px;">
                    <div style="height:10px;background:#e5e7eb;border-radius:999px;overflow:hidden;">
                        <div style="height:100%;width:${Math.min(item.share, 100).toFixed(1)}%;background:${item.color};border-radius:999px;"></div>
                    </div>
                    <div style="font-size:10px;color:#94a3b8;margin-top:3px;">${item.share.toFixed(1)}%</div>
                </td>
            </tr>
        `).join('');

        right.innerHTML = `
            <table style="width:100%;border-collapse:collapse;font-size:12px;min-width:680px;">
                <thead>
                    <tr>
                        <th style="padding:9px 10px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:900;text-transform:uppercase;text-align:center;border-bottom:2px solid #e2e8f0;width:80px;">Ranking</th>
                        <th style="padding:9px 10px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:900;text-transform:uppercase;text-align:left;border-bottom:2px solid #e2e8f0;">Refrigerant Types</th>
                        <th style="padding:9px 10px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:900;text-transform:uppercase;text-align:right;border-bottom:2px solid #e2e8f0;">Quantity</th>
                        <th style="padding:9px 10px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:900;text-transform:uppercase;text-align:right;border-bottom:2px solid #e2e8f0;">% Share</th>
                        <th style="padding:9px 10px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:900;text-transform:uppercase;text-align:left;border-bottom:2px solid #e2e8f0;">Distribution</th>
                    </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
            </table>
        `;
    }

    card.appendChild(left);
    card.appendChild(right);
    section.appendChild(title);
    section.appendChild(card);

    return section;
}

function normalizeAirAnswer(value) {
    const raw = String(value ?? '').trim();

    if (!raw || raw === 'null' || raw === 'undefined') return null;
    if (/^yes$/i.test(raw)) return 'Yes';
    if (/^no$/i.test(raw)) return 'No';
    if (/partial\s*yes/i.test(raw)) return 'Partial Yes';
    if (/not[\s_ -]?applicable/i.test(raw)) return 'Not Applicable';

    if (raw.length > 3) return 'Yes';

    return null;
}

function getAirQuestionResponse(question, airRow, bulkRow) {
    const raw = readAirResponseValue(airRow, question.field)
        || String(bulkRow?.[`${question.field}.corrected`] || bulkRow?.[`${question.field}.value`] || bulkRow?.[question.field] || '').trim();

    return normalizeAirAnswer(raw);
}

function renderAirQuestionWeightBadge(weight) {
    const config = {
        M: { label: 'M', bg: '#fee2e2', color: '#b91c1c' },
        S: { label: 'S', bg: '#dbeafe', color: '#1d4ed8' },
        B: { label: 'B', bg: '#fef3c7', color: '#b45309' },
    }[weight] || { label: weight || '-', bg: '#f1f5f9', color: '#64748b' };

    return `<span style="display:inline-block;margin-left:6px;padding:2px 7px;border-radius:999px;background:${config.bg};color:${config.color};font-size:10px;font-weight:900;">${config.label}</span>`;
}

function renderAirAnswerBadge(answer) {
    const config = {
        Yes: { bg: '#dcfce7', color: '#166534' },
        No: { bg: '#fee2e2', color: '#b91c1c' },
        'Partial Yes': { bg: '#fef3c7', color: '#b45309' },
        'Not Applicable': { bg: '#f1f5f9', color: '#64748b' },
    }[answer] || { bg: '#f8fafc', color: '#94a3b8' };

    return `<span style="display:inline-block;min-width:86px;padding:4px 10px;border-radius:999px;background:${config.bg};color:${config.color};font-size:12px;font-weight:850;">${escapeAirHtml(answer || '-')}</span>`;
}

function renderAirQuestionResponses(rows, selectedYear) {
    const row = getAirRowByYear(rows, selectedYear);
    const airRow = findAirResponseRow(row);

    const section = document.createElement('div');
    section.id = 'air-question-responses-wrap';
    section.style.cssText = 'margin-top:24px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:#475569;padding:9px 16px;border-radius:6px 6px 0 0;';
    title.textContent = 'SUMMARY OF QUESTION RESPONSES';

    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:0 0 14px 14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:0;overflow:hidden;';

    const tableRows = AIR_RESPONSE_QUESTIONS.map((question, index) => {
        const answer = getAirQuestionResponse(question, airRow, row);
        const levelColor = question.lv === 'LV1' ? '#2563eb' : question.lv === 'LV2' ? '#059669' : '#7c3aed';

        return `
            <tr style="background:${index % 2 === 0 ? '#fff' : '#f8fafc'};">
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:#64748b;font-size:12px;font-weight:800;">${question.n}</td>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;white-space:nowrap;">
                    <span style="display:inline-block;padding:2px 8px;border-radius:999px;background:${levelColor}18;color:${levelColor};font-size:11px;font-weight:900;">${question.lv}</span>
                    ${renderAirQuestionWeightBadge(question.wt)}
                </td>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;color:#1f2937;font-size:13px;line-height:1.45;">${escapeAirHtml(question.text)}</td>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;text-align:center;white-space:nowrap;">${renderAirAnswerBadge(answer)}</td>
            </tr>
        `;
    }).join('');

    card.innerHTML = `
        <div style="padding:12px 16px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <div style="font-size:13px;font-weight:900;color:#111827;">Summary of Question Responses</div>
            <div style="font-size:12px;color:#64748b;">${airRow ? `Matched air response for ${escapeAirHtml(selectedYear)}` : `Using bulk fields for ${escapeAirHtml(selectedYear)}`}</div>
        </div>
        <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;min-width:760px;">
                <thead>
                    <tr>
                        <th style="padding:8px 12px;background:#f1f5f9;color:#475569;font-size:11px;font-weight:900;text-transform:uppercase;text-align:center;width:48px;border-bottom:2px solid #e2e8f0;">#</th>
                        <th style="padding:8px 12px;background:#f1f5f9;color:#475569;font-size:11px;font-weight:900;text-transform:uppercase;text-align:left;width:110px;border-bottom:2px solid #e2e8f0;">Level</th>
                        <th style="padding:8px 12px;background:#f1f5f9;color:#475569;font-size:11px;font-weight:900;text-transform:uppercase;text-align:left;border-bottom:2px solid #e2e8f0;">Question</th>
                        <th style="padding:8px 12px;background:#f1f5f9;color:#475569;font-size:11px;font-weight:900;text-transform:uppercase;text-align:center;width:150px;border-bottom:2px solid #e2e8f0;">Response</th>
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

function calculateAirPerformanceScore(rows, selectedYear) {
    const row = getAirRowByYear(rows, selectedYear);
    if (!row) return null;

    const airRow = findAirResponseRow(row);
    const answers = {};
    const scores = {};
    const maxes = {};
    const byLevel = { LV1: [], LV2: [], LV3: [] };

    AIR_RESPONSE_QUESTIONS.forEach(question => {
        const display = getAirQuestionResponse(question, airRow, row);

        answers[question.n] = {
            display,
            applicable: display !== 'Not Applicable',
        };

        byLevel[question.lv].push(question);
        maxes[question.n] = question.max;

        let score = 0;

        if (display !== 'Not Applicable') {
            if (question.wt === 'M') {
                if (display === 'Yes') score = 10;
                else if (display === 'Partial Yes') score = 5;
            } else if (question.wt === 'B') {
                score = display === 'Yes' ? 1 : 0;
            } else {
                if (display === 'Yes') score = question.max;
                else if (display === 'Partial Yes') score = question.max * 0.5;
            }
        }

        scores[question.n] = score;
    });

    const levels = {};
    ['LV1', 'LV2', 'LV3'].forEach(level => {
        const questions = byLevel[level];
        const levelScore = questions.reduce((sum, question) => sum + (scores[question.n] || 0), 0);
        const levelMax = questions.reduce((sum, question) => sum + (maxes[question.n] || 0), 0);
        const levelPct = levelMax > 0 ? levelScore / levelMax : 0;

        const mandatoryOk = questions
            .filter(question => question.wt === 'M')
            .every(question => {
                const answer = answers[question.n] || {};
                return answer.applicable === false || answer.display !== 'No';
            });

        const previousLevelOk = level === 'LV1'
            ? true
            : levels[`LV${parseInt(level.slice(2), 10) - 1}`];

        levels[level] = previousLevelOk && mandatoryOk && levelPct >= 0.5;
    });

    return { scores, maxes, levels, byLevel, answers };
}

function renderAirPerformanceScore(rows, selectedYear) {
    const result = calculateAirPerformanceScore(rows, selectedYear);
    if (!result) return document.createElement('div');

    const { scores, maxes, levels, byLevel } = result;

    const section = document.createElement('div');
    section.id = 'air-performance-score-wrap';
    section.style.cssText = 'margin-top:24px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:#7f1d1d;padding:9px 16px;border-radius:6px 6px 0 0;';
    title.textContent = 'AIR EMISSIONS PERFORMANCE SCORE & RATING';

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
        const levelMax = questions.reduce((sum, question) => sum + (maxes[question.n] || question.max), 0);
        const pct = levelMax > 0 ? (levelScore / levelMax) * 100 : 0;
        const color = levelColors[level];

        scoreHtml += `
            <div style="margin-bottom:18px;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:7px;">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="font-size:15px;font-weight:900;color:#111827;">${level} Score</span>
                        ${levels[level] ? `<span style="display:inline-block;padding:3px 9px;border-radius:999px;background:${color}18;color:${color};font-size:12px;font-weight:900;">✓ Achieved</span>` : ''}
                    </div>
                    <div style="font-size:14px;font-weight:900;color:#111827;">
                        ${levelScore.toFixed(1)}
                        <span style="font-weight:600;color:#94a3b8;">/ ${levelMax.toFixed(1)}</span>
                    </div>
                </div>
                <div style="height:14px;background:#f1f5f9;border-radius:999px;overflow:hidden;">
                    <div style="height:100%;width:${Math.min(pct, 100).toFixed(1)}%;background:${pct >= 50 ? color : '#dc2626'};border-radius:999px;"></div>
                </div>
            </div>
        `;
    });

    const totalScore = AIR_RESPONSE_QUESTIONS.reduce((sum, question) => sum + (scores[question.n] || 0), 0);
    const totalMax = AIR_RESPONSE_QUESTIONS.reduce((sum, question) => sum + (maxes[question.n] || question.max), 0);
    const totalPct = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
    const totalColor = totalPct >= 70 ? '#166534' : totalPct >= 40 ? '#b45309' : '#991b1b';

    card.innerHTML = `
        ${scoreHtml}
        <div style="border-top:1px solid #e2e8f0;margin-top:6px;padding-top:18px;display:flex;align-items:flex-end;justify-content:space-between;gap:18px;">
            <div>
                <div style="font-size:20px;font-weight:900;color:#111827;margin-bottom:6px;">Total Air Emissions Score</div>
                <div style="font-size:13px;color:#64748b;">Level Achieved</div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:30px;font-weight:900;color:${totalColor};line-height:1;">${totalScore.toFixed(1)}</div>
                <div style="margin-top:8px;">
                    <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${achievedLevel ? levelColors[`LV${achievedLevel}`] + '18' : '#f1f5f9'};color:${achievedLevel ? levelColors[`LV${achievedLevel}`] : '#64748b'};font-size:13px;font-weight:900;">
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

function updateAirContent(rows, years, selectedYear) {
    const existing = document.getElementById('air-content-wrap');
    if (existing) existing.remove();

    const placeholder = document.getElementById('air-placeholder');
    const header = document.getElementById('air-header');

    if (!rows || !rows.length || !header) {
        if (placeholder) placeholder.style.display = '';
        return;
    }

    const activeYears = years && years.length ? years : getAirYears(rows);

    if (!airSelectedYear || !activeYears.includes(airSelectedYear)) {
        airSelectedYear = selectedYear || activeYears[activeYears.length - 1] || null;
    }

    const activeYear = selectedYear || airSelectedYear;

    const wrap = document.createElement('div');
    wrap.id = 'air-content-wrap';

    wrap.appendChild(renderAirRefrigerantSection(rows, activeYears, activeYear));
    wrap.appendChild(renderAirQuestionResponses(rows, activeYear));
    wrap.appendChild(renderAirPerformanceScore(rows, activeYear));

    header.insertAdjacentElement('afterend', wrap);

    if (placeholder) placeholder.style.display = 'none';
}
