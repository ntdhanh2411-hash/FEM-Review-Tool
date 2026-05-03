let wasteSelectedYear = null;

const WASTE_TYPE_GROUPS = [
    {
        key: 'nonhazardous',
        label: 'Non-Hazardous Waste',
        totalCol: 'total_nonhazardous_waste_kg',
        color: '#22c55e'
    },
    {
        key: 'hazardous',
        label: 'Hazardous Waste',
        totalCol: 'total_hazardous_waste_kg',
        color: '#ef4444'
    }
];

const NON_HAZARDOUS_WASTE_COMPOSITION = [
    { label: 'Materials', col: 'nonhazardous_waste_materials_kg' },
    { label: 'Metal', col: 'nonhazardous_waste_metal_kg' },
    { label: 'Plastic', col: 'nonhazardous_waste_plastic_kg' },
    { label: 'Paper', col: 'nonhazardous_waste_paper_kg' },
    { label: 'Cans', col: 'nonhazardous_waste_cans_kg' },
    { label: 'Food', col: 'nonhazardous_waste_food_kg' },
    { label: 'Glass', col: 'nonhazardous_waste_glass_kg' },
    { label: 'Cartons', col: 'nonhazardous_waste_cartons_kg' },
    { label: 'Other', col: 'nonhazardous_waste_other_kg' },
    { label: 'Domestic Total', col: 'nonhazardous_waste_domtotal_kg' },
    { label: 'Textile', col: 'nonhazardous_waste_textile_kg' },
    { label: 'Leather', col: 'nonhazardous_waste_leather_kg' },
    { label: 'Rubber', col: 'nonhazardous_waste_rubber_kg' },
    { label: 'Wood', col: 'nonhazardous_waste_wood_kg' },
    { label: 'Foams', col: 'nonhazardous_waste_foams_kg' },
    { label: 'Pre-Water Sludge', col: 'nonhazardous_waste_prewatersludge_kg' },
    { label: 'General', col: 'nonhazardous_waste_general_kg' },
    { label: 'Slag', col: 'nonhazardous_waste_slag_kg' },
];

const HAZARDOUS_WASTE_COMPOSITION = [
    { label: 'Production Chemical Drum', col: 'hazardous_waste_prodchemdrum_kg' },
    { label: 'Production Film / Print', col: 'hazardous_waste_prodfilmprint_kg' },
    { label: 'Production Sludge', col: 'hazardous_waste_prodsludge_kg' },
    { label: 'Production Chemicals', col: 'hazardous_waste_prodchem_kg' },
    { label: 'Production Compressed Gas', col: 'hazardous_waste_prodcompgas_kg' },
    { label: 'Production Contaminated Materials', col: 'hazardous_waste_prodcontammat_kg' },
    { label: 'Domestic Batteries', col: 'hazardous_waste_dombatteries_kg' },
    { label: 'Domestic Fluorescent Light', col: 'hazardous_waste_domflolight_kg' },
    { label: 'Domestic Ink Cartridge', col: 'hazardous_waste_dominkcart_kg' },
    { label: 'Domestic Oil / Grease', col: 'hazardous_waste_domoilgrease_kg' },
    { label: 'Domestic Empty Container', col: 'hazardous_waste_domemptycont_kg' },
    { label: 'Domestic Electronic Waste', col: 'hazardous_waste_domelectronic_kg' },
    { label: 'Domestic Coal Combustion', col: 'hazardous_waste_domcoalcomb_kg' },
    { label: 'Other', col: 'hazardous_waste_other_kg' },
    { label: 'Production Oil', col: 'hazardous_waste_productionoil_kg' },
    { label: 'Metal Sludge', col: 'hazardous_waste_metalsludge_kg' },
    { label: 'Hazardous Slag', col: 'hazardous_waste_slagh_kg' },
];

function isDashboardPageVisible(pageId) {
    const page = document.getElementById(pageId);
    return page && page.classList.contains('active');
}

function resizeCanvasToParent(canvas, minWidth = 320) {
    if (!canvas || !canvas.parentElement) return false;

    const rect = canvas.parentElement.getBoundingClientRect();
    const width = Math.floor(rect.width);

    if (!width || width < 20) return false;

    canvas.width = Math.max(width, minWidth);
    return true;
}

function getWasteRows() {
    if (typeof appData === 'undefined' || !Array.isArray(appData.bulkperformance)) return [];
    return appData.bulkperformance;
}

function parseWasteValue(value) {
    const n = parseFloat(String(value ?? '').replace(/,/g, ''));
    return !isNaN(n) && n > 0 ? n : 0;
}

function formatWasteKg(value) {
    const n = parseWasteValue(value);

    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';

    return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function sortWasteYears(years) {
    return [...years].sort((a, b) => {
        const ay = Number(String(a).replace(/\D/g, ''));
        const by = Number(String(b).replace(/\D/g, ''));
        return ay - by;
    });
}

function escapeWasteHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getCurrentWasteHiggId() {
    const wasteHiggId = document.getElementById('waste-higgid')?.textContent;
    if (wasteHiggId && wasteHiggId !== '-' && wasteHiggId !== '—') return wasteHiggId;

    if (typeof selectedHiggId !== 'undefined' && selectedHiggId) return selectedHiggId;
    if (typeof currentHiggId !== 'undefined' && currentHiggId) return currentHiggId;
    if (typeof selectedFactoryHiggId !== 'undefined' && selectedFactoryHiggId) return selectedFactoryHiggId;

    return null;
}

function getWasteYears(rows) {
    return sortWasteYears([...new Set(rows.map(row => row.version).filter(Boolean))]);
}

function getWasteRowByYear(rows, year) {
    return rows.find(row => String(row.version) === String(year)) || null;
}

function ensureWasteContent() {
    let content = document.getElementById('waste-content');

    if (content) return content;

    const placeholder = document.getElementById('waste-placeholder');
    content = document.createElement('div');
    content.id = 'waste-content';
    content.style.display = 'none';

    if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.insertBefore(content, placeholder);
    }

    return content;
}

function renderWasteHeader(base, rows) {
    document.getElementById('waste-factory-name').textContent = base.account_name || '-';
    document.getElementById('waste-group').textContent = base.tags || '-';
    document.getElementById('waste-higgid').textContent = base.higg_id || '-';
    document.getElementById('waste-country').textContent = base.account_country || '-';

    const years = getWasteYears(rows);
    const tabs = document.getElementById('waste-year-tabs');

    if (!wasteSelectedYear || !years.includes(wasteSelectedYear)) {
        wasteSelectedYear = years[years.length - 1] || null;
    }

    if (!tabs) return;

    tabs.innerHTML = years.map(year => `
        <button
            type="button"
            class="fem-year-tab ${String(year) === String(wasteSelectedYear) ? 'active' : ''}"
            onclick="selectWasteYear('${escapeWasteHtml(year)}')"
        >
            ${escapeWasteHtml(year)}
        </button>
    `).join('');
}

function getWastePreviousRow(rows, years, selectedYear) {
    const idx = years.findIndex(year => String(year) === String(selectedYear));
    if (idx <= 0) return null;

    return getWasteRowByYear(rows, years[idx - 1]);
}

function buildWasteChangeBadge(currentValue, previousValue) {
    if (!previousValue || previousValue <= 0 || !currentValue) {
        return '<span style="color:#9ca3af;font-size:13px;font-weight:600;">No previous year comparison</span>';
    }

    const pct = ((currentValue - previousValue) / previousValue) * 100;
    const color = pct > 0 ? '#ef4444' : pct < 0 ? '#16a34a' : '#64748b';
    const arrow = pct > 0 ? '▲' : pct < 0 ? '▼' : '→';
    const wording = pct > 0 ? 'increase' : pct < 0 ? 'decrease' : 'no change';

    return `
        <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;">
            <span style="font-size:22px;font-weight:800;color:${color};">${arrow} ${Math.abs(pct).toFixed(1)}%</span>
            <span style="font-size:12px;font-weight:600;color:#64748b;">${wording} vs previous FEM year</span>
        </div>
    `;
}

function renderWasteContent(rows) {
    const content = ensureWasteContent();
    const placeholder = document.getElementById('waste-placeholder');

    if (!rows.length) {
        content.style.display = 'none';
        if (placeholder) placeholder.style.display = '';
        return;
    }

    const years = getWasteYears(rows);

    if (!wasteSelectedYear || !years.includes(wasteSelectedYear)) {
        wasteSelectedYear = years[years.length - 1] || null;
    }

    const selectedRow = getWasteRowByYear(rows, wasteSelectedYear);
    const previousRow = getWastePreviousRow(rows, years, wasteSelectedYear);

    const selectedWaste = parseWasteValue(selectedRow?.total_waste_kg);
    const previousWaste = parseWasteValue(previousRow?.total_waste_kg);

    content.innerHTML = '';

    content.appendChild(renderWasteOverview(rows, years, wasteSelectedYear, selectedWaste, previousWaste));
    content.appendChild(renderWasteGenerationByType(rows, years, wasteSelectedYear));
    content.appendChild(renderWasteCompositionSection(selectedRow));
    content.appendChild(renderWasteQuestionResponses(rows, wasteSelectedYear));
    content.appendChild(renderWastePerformanceScore(rows, wasteSelectedYear));

    content.style.display = '';
    if (placeholder) placeholder.style.display = 'none';
}

function renderWasteOverview(rows, years, selectedYear, selectedWaste, previousWaste) {
    const section = document.createElement('div');
    section.id = 'waste-overview-wrap';
    section.style.cssText = 'margin-top:20px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:#475569;padding:9px 16px;border-radius:6px 6px 0 0;';
    title.textContent = 'WASTE OVERVIEW';

    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:0 0 14px 14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:24px;display:grid;grid-template-columns:minmax(260px,0.75fr) minmax(460px,1.7fr);gap:28px;align-items:start;';

    const left = document.createElement('div');
    left.style.cssText = 'background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;';

    left.innerHTML = `
        <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;">Total Waste Generated</div>
        <div style="font-size:34px;font-weight:850;color:#111827;line-height:1;">${formatWasteKg(selectedWaste)}</div>
        <div style="font-size:12px;color:#94a3b8;margin-top:4px;">kg in ${escapeWasteHtml(selectedYear)}</div>
        <div style="margin-top:14px;">${buildWasteChangeBadge(selectedWaste, previousWaste)}</div>
    `;

    const right = document.createElement('div');
    right.style.cssText = 'min-width:0;';

    const selectorWrap = document.createElement('div');
    selectorWrap.style.cssText = 'display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;align-items:center;';
    selectorWrap.innerHTML = '<span style="font-size:12px;color:#6b7280;font-weight:700;">Show:</span>';

    const canvas = document.createElement('canvas');
    canvas.height = 320;
    canvas.style.cssText = 'width:100%;display:block;';

    const legend = document.createElement('div');
    legend.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;margin-top:12px;justify-content:center;';

    const options = [
        { label: 'Last 3 Years', value: 3 },
        { label: 'Last 5 Years', value: 5 },
        { label: 'All Years', value: 0 },
    ];

    options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.textContent = opt.label;
        btn.style.cssText = `padding:5px 14px;border-radius:20px;border:2px solid ${i === 0 ? '#475569' : '#e5e7eb'};background:${i === 0 ? '#475569' : '#fff'};color:${i === 0 ? '#fff' : '#6b7280'};font-size:12px;font-weight:700;cursor:pointer;`;

        btn.onclick = () => {
            selectorWrap.querySelectorAll('button').forEach(b => {
                b.style.background = '#fff';
                b.style.color = '#6b7280';
                b.style.borderColor = '#e5e7eb';
            });

            btn.style.background = '#475569';
            btn.style.color = '#fff';
            btn.style.borderColor = '#475569';

            if (resizeCanvasToParent(canvas)) {
                drawWasteOverviewChart(canvas, legend, rows, years, opt.value === 0 ? years.length : opt.value);
            }
        };

        selectorWrap.appendChild(btn);
    });

    right.appendChild(selectorWrap);
    right.appendChild(canvas);
    right.appendChild(legend);

    card.appendChild(left);
    card.appendChild(right);

    section.appendChild(title);
    section.appendChild(card);

    setTimeout(() => {
        if (resizeCanvasToParent(canvas)) {
            drawWasteOverviewChart(canvas, legend, rows, years, 3);
        }
    }, 0);

    return section;
}

function renderWasteGenerationByType(rows, years, selectedYear) {
    const row = getWasteRowByYear(rows, selectedYear);
    const previousRow = getWastePreviousRow(rows, years, selectedYear);

    const total = parseWasteValue(row?.total_waste_kg);
    const previousTotal = parseWasteValue(previousRow?.total_waste_kg);
    const nonHazardous = parseWasteValue(row?.total_nonhazardous_waste_kg);
    const hazardous = parseWasteValue(row?.total_hazardous_waste_kg);

    const section = document.createElement('div');
    section.id = 'waste-generation-type-wrap';
    section.style.cssText = 'margin-top:24px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:#166534;padding:9px 16px;border-radius:6px 6px 0 0;';
    title.textContent = 'WASTE GENERATION BY TYPE';

    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:0 0 14px 14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:24px;display:grid;grid-template-columns:minmax(280px,0.85fr) minmax(460px,1.6fr);gap:28px;align-items:start;';

    const left = document.createElement('div');
    left.style.cssText = 'display:flex;flex-direction:column;gap:16px;';

    const typeRows = WASTE_TYPE_GROUPS.map(group => {
        const value = group.key === 'nonhazardous' ? nonHazardous : hazardous;
        const pct = total > 0 ? (value / total) * 100 : 0;

        return `
            <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #e2e8f0;">
                <div style="width:11px;height:11px;border-radius:50%;background:${group.color};flex-shrink:0;"></div>
                <div style="flex:1;">
                    <div style="font-size:13px;font-weight:700;color:#334155;">${group.label}</div>
                    <div style="height:8px;background:#e5e7eb;border-radius:999px;overflow:hidden;margin-top:5px;">
                        <div style="height:100%;width:${Math.min(pct, 100)}%;background:${group.color};border-radius:999px;"></div>
                    </div>
                </div>
                <div style="text-align:right;min-width:96px;">
                    <div style="font-size:12px;font-weight:850;color:${group.color};">${pct.toFixed(1)}%</div>
                    <div style="font-size:11px;color:#94a3b8;">${formatWasteKg(value)} kg</div>
                </div>
            </div>
        `;
    }).join('');

    left.innerHTML = `
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;">
            <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;">Total Waste Generated</div>
            <div style="font-size:32px;font-weight:850;color:#111827;line-height:1;">${formatWasteKg(total)}</div>
            <div style="font-size:12px;color:#94a3b8;margin-top:4px;">kg in ${escapeWasteHtml(selectedYear)}</div>
            <div style="margin-top:14px;">${buildWasteChangeBadge(total, previousTotal)}</div>
        </div>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;">
            <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;">Waste Type Breakdown</div>
            ${typeRows}
        </div>
    `;

    const right = document.createElement('div');
    right.style.cssText = 'min-width:0;';

    const selectorWrap = document.createElement('div');
    selectorWrap.style.cssText = 'display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;align-items:center;';
    selectorWrap.innerHTML = '<span style="font-size:12px;color:#6b7280;font-weight:700;">Show:</span>';

    const canvas = document.createElement('canvas');
    canvas.height = 320;
    canvas.style.cssText = 'width:100%;display:block;';

    const legend = document.createElement('div');
    legend.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;margin-top:12px;justify-content:center;';

    const options = [
        { label: 'Last 3 Years', value: 3 },
        { label: 'Last 5 Years', value: 5 },
        { label: 'All Years', value: 0 },
    ];

    options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.textContent = opt.label;
        btn.style.cssText = `padding:5px 14px;border-radius:20px;border:2px solid ${i === 0 ? '#166534' : '#e5e7eb'};background:${i === 0 ? '#166534' : '#fff'};color:${i === 0 ? '#fff' : '#6b7280'};font-size:12px;font-weight:700;cursor:pointer;`;

        btn.onclick = () => {
            selectorWrap.querySelectorAll('button').forEach(b => {
                b.style.background = '#fff';
                b.style.color = '#6b7280';
                b.style.borderColor = '#e5e7eb';
            });

            btn.style.background = '#166534';
            btn.style.color = '#fff';
            btn.style.borderColor = '#166534';

            if (resizeCanvasToParent(canvas)) {
                drawWasteTypeChart(canvas, legend, rows, years, opt.value === 0 ? years.length : opt.value);
            }
        };

        selectorWrap.appendChild(btn);
    });

    right.appendChild(selectorWrap);
    right.appendChild(canvas);
    right.appendChild(legend);

    card.appendChild(left);
    card.appendChild(right);
    section.appendChild(title);
    section.appendChild(card);

    setTimeout(() => {
        if (resizeCanvasToParent(canvas)) {
            drawWasteTypeChart(canvas, legend, rows, years, 3);
        }
    }, 0);

    return section;
}

function renderWasteCompositionSection(row) {
    const section = document.createElement('div');
    section.id = 'waste-composition-wrap';
    section.style.cssText = 'margin-top:24px;display:grid;grid-template-columns:minmax(420px,1fr) minmax(420px,1fr);gap:24px;align-items:start;';

    section.appendChild(renderCompositionTable(
        'HAZARDOUS WASTE COMPOSITION',
        HAZARDOUS_WASTE_COMPOSITION,
        row,
        '#ef4444'
    ));

    section.appendChild(renderCompositionTable(
        'NON-HAZARDOUS WASTE COMPOSITION',
        NON_HAZARDOUS_WASTE_COMPOSITION,
        row,
        '#22c55e'
    ));

    return section;
}

function getCompositionItems(items, row) {
    const activeItems = items
        .map(item => ({ ...item, value: parseWasteValue(row?.[item.col]) }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);

    const total = activeItems.reduce((sum, item) => sum + item.value, 0);

    return activeItems.map((item, index) => ({
        ...item,
        ranking: index + 1,
        share: total > 0 ? (item.value / total) * 100 : 0
    }));
}

function renderCompositionTable(titleText, items, row, color) {
    const wrap = document.createElement('div');

    const title = document.createElement('div');
    title.style.cssText = `font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:${color};padding:9px 16px;border-radius:6px 6px 0 0;`;
    title.textContent = titleText;

    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:0 0 14px 14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:20px;overflow-x:auto;';

    const compositionItems = getCompositionItems(items, row);

    if (!compositionItems.length) {
        card.innerHTML = '<div style="font-size:13px;color:#9ca3af;padding:12px;">No waste composition data available for this year.</div>';
    } else {
        const rowsHtml = compositionItems.map(item => `
            <tr>
                <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;text-align:center;">
                    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:${color};color:#fff;font-size:11px;font-weight:800;">${item.ranking}</span>
                </td>
                <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;font-weight:700;color:#1a1f2e;">${escapeWasteHtml(item.label)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;color:#1a1f2e;">${formatWasteKg(item.value)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:800;color:${color};">${item.share.toFixed(1)}%</td>
                <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;min-width:120px;">
                    <div style="height:10px;background:#e5e7eb;border-radius:999px;overflow:hidden;">
                        <div style="height:100%;width:${Math.min(item.share, 100)}%;background:${color};border-radius:999px;"></div>
                    </div>
                </td>
            </tr>
        `).join('');

        card.innerHTML = `
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
                <thead>
                    <tr>
                        <th style="padding:9px 10px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:800;text-transform:uppercase;border-bottom:2px solid #e2e8f0;text-align:center;width:70px;">Ranking</th>
                        <th style="padding:9px 10px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:800;text-transform:uppercase;border-bottom:2px solid #e2e8f0;text-align:left;">Waste Composition</th>
                        <th style="padding:9px 10px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:800;text-transform:uppercase;border-bottom:2px solid #e2e8f0;text-align:right;">Amount (KG)</th>
                        <th style="padding:9px 10px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:800;text-transform:uppercase;border-bottom:2px solid #e2e8f0;text-align:right;">% Share</th>
                        <th style="padding:9px 10px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:800;text-transform:uppercase;border-bottom:2px solid #e2e8f0;text-align:left;">Distribution</th>
                    </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
            </table>
        `;
    }

    wrap.appendChild(title);
    wrap.appendChild(card);

    return wrap;
}

function drawWasteOverviewChart(canvas, legendEl, rows, allYears, count) {
    const years = count >= allYears.length ? allYears : allYears.slice(-count);

    const w = canvas.width;
    const h = canvas.height;

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const padL = 76;
    const padR = 24;
    const padT = 28;
    const padB = 58;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const values = years.map(year => {
        const row = getWasteRowByYear(rows, year);
        return parseWasteValue(row?.total_waste_kg);
    });

    if (!values.some(v => v > 0)) {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '13px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No waste data available', W / 2, H / 2);
        legendEl.innerHTML = '';
        return;
    }

    const maxVal = Math.max(...values) * 1.18 || 1;
    const barGap = chartW / years.length;
    const barW = Math.min(68, barGap * 0.52);

    drawWasteChartGrid(ctx, W, H, padL, padT, chartW, chartH, maxVal);

    years.forEach((year, index) => {
        const value = values[index];
        const barX = padL + index * barGap + (barGap - barW) / 2;
        const barH = value > 0 ? Math.max((value / maxVal) * chartH, 2) : 0;
        const barY = padT + chartH - barH;

        ctx.fillStyle = '#64748b';
        ctx.globalAlpha = 0.88;
        ctx.fillRect(barX, barY, barW, barH);
        ctx.globalAlpha = 1;

        if (value > 0) {
            ctx.fillStyle = '#334155';
            ctx.font = 'bold 10px Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(formatWasteKg(value), barX + barW / 2, barY - 7);
        }

        drawWasteYearLabel(ctx, year, barX + barW / 2, padT + chartH + 9);
    });

    drawWasteChartAxis(ctx, padL, padT, chartW, chartH);

    legendEl.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px;">
            <div style="width:12px;height:12px;border-radius:3px;background:#64748b;flex-shrink:0;"></div>
            <span style="font-size:12px;color:#374151;font-weight:700;">Total Waste Generated</span>
        </div>
    `;
}

function drawWasteTypeChart(canvas, legendEl, rows, allYears, count) {
    const years = count >= allYears.length ? allYears : allYears.slice(-count);

    const w = canvas.width;
    const h = canvas.height;

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const padL = 76;
    const padR = 24;
    const padT = 28;
    const padB = 58;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const groupData = WASTE_TYPE_GROUPS.map(group => ({
        label: group.label,
        color: group.color,
        values: years.map(year => {
            const row = getWasteRowByYear(rows, year);
            return parseWasteValue(row?.[group.totalCol]);
        })
    }));

    const stackedTotals = years.map((_, yi) => groupData.reduce((sum, group) => sum + group.values[yi], 0));

    if (!stackedTotals.some(v => v > 0)) {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '13px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No waste type data available', W / 2, H / 2);
        legendEl.innerHTML = '';
        return;
    }

    const maxVal = Math.max(...stackedTotals) * 1.18 || 1;
    const barGap = chartW / years.length;
    const barW = Math.min(68, barGap * 0.52);

    drawWasteChartGrid(ctx, W, H, padL, padT, chartW, chartH, maxVal);

    years.forEach((year, yi) => {
        const barX = padL + yi * barGap + (barGap - barW) / 2;
        let baseY = padT + chartH;

        groupData.forEach(group => {
            const value = group.values[yi];
            if (value <= 0) return;

            const barH = Math.max((value / maxVal) * chartH, 2);
            baseY -= barH;

            ctx.fillStyle = group.color;
            ctx.globalAlpha = 0.86;
            ctx.fillRect(barX, baseY, barW, barH);
            ctx.globalAlpha = 1;

            if (barH > 18) {
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 9px Segoe UI, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(formatWasteKg(value), barX + barW / 2, baseY + barH / 2);
            }
        });

        drawWasteYearLabel(ctx, year, barX + barW / 2, padT + chartH + 9);
    });

    drawWasteChartAxis(ctx, padL, padT, chartW, chartH);

    legendEl.innerHTML = groupData.map(group => `
        <div style="display:flex;align-items:center;gap:6px;">
            <div style="width:12px;height:12px;border-radius:3px;background:${group.color};flex-shrink:0;"></div>
            <span style="font-size:12px;color:#374151;font-weight:700;">${group.label}</span>
        </div>
    `).join('');
}

function drawWasteChartGrid(ctx, W, H, padL, padT, chartW, chartH, maxVal) {
    for (let i = 0; i <= 5; i++) {
        const y = padT + chartH - (i / 5) * chartH;
        const tickValue = maxVal * i / 5;

        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + chartW, y);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Segoe UI, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatWasteKg(tickValue), padL - 8, y);
    }
}

function drawWasteChartAxis(ctx, padL, padT, chartW, chartH) {
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + chartH);
    ctx.lineTo(padL + chartW, padT + chartH);
    ctx.stroke();
}

function drawWasteYearLabel(ctx, year, x, y) {
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 11px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(year, x, y);
}

function renderWastePage(higgId) {
    const rows = getWasteRows().filter(row => String(row.higg_id) === String(higgId));

    if (!rows.length) {
        const content = ensureWasteContent();
        const placeholder = document.getElementById('waste-placeholder');

        content.style.display = 'none';
        if (placeholder) placeholder.style.display = '';

        return;
    }

    renderWasteHeader(rows[0], rows);
    renderWasteContent(rows);
}

function selectWasteYear(year) {
    wasteSelectedYear = String(year);

    const higgId = getCurrentWasteHiggId();
    if (higgId) renderWastePage(higgId);
}

function updateWastePage() {
    const higgId = getCurrentWasteHiggId();
    if (higgId) renderWastePage(higgId);
}

function redrawWasteChartsWhenVisible() {
    if (!isDashboardPageVisible('page-waste')) return;

    const higgId = getCurrentWasteHiggId();
    if (higgId) {
        requestAnimationFrame(() => renderWastePage(higgId));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const originalNavigateTo = window.navigateTo;

    if (typeof originalNavigateTo === 'function' && !window.__wasteNavigateWrapped) {
        window.__wasteNavigateWrapped = true;

        window.navigateTo = function (page) {
            originalNavigateTo(page);

            if (page === 'waste') {
                setTimeout(redrawWasteChartsWhenVisible, 80);
            }
        };
    }

    window.addEventListener('resize', () => {
        setTimeout(redrawWasteChartsWhenVisible, 120);
    });

    setTimeout(redrawWasteChartsWhenVisible, 0);
});

const WASTE_RESPONSE_NONHAZ = [
    { col: 'nonhazardous_waste_textile_kg', lbl: 'Textile', trk: 'textile' },
    { col: 'nonhazardous_waste_leather_kg', lbl: 'Leather', trk: 'leather' },
    { col: 'nonhazardous_waste_rubber_kg', lbl: 'Rubber', trk: 'rubber' },
    { col: 'nonhazardous_waste_wood_kg', lbl: 'Wood', trk: 'wood' },
    { col: 'nonhazardous_waste_metal_kg', lbl: 'Metal', trk: 'metal' },
    { col: 'nonhazardous_waste_plastic_kg', lbl: 'Plastic', trk: 'plastic' },
    { col: 'nonhazardous_waste_paper_kg', lbl: 'Paper', trk: 'paper' },
    { col: 'nonhazardous_waste_cartons_kg', lbl: 'Cartons', trk: 'cartons' },
    { col: 'nonhazardous_waste_foams_kg', lbl: 'Foams', trk: 'foams' },
    { col: 'nonhazardous_waste_cans_kg', lbl: 'Cans', trk: 'cans' },
    { col: 'nonhazardous_waste_food_kg', lbl: 'Food', trk: 'food' },
    { col: 'nonhazardous_waste_glass_kg', lbl: 'Glass', trk: 'glass' },
    { col: 'nonhazardous_waste_prewatersludge_kg', lbl: 'Pre-water Sludge', trk: 'wastewaterTreatmentSludge' },
    { col: 'nonhazardous_waste_slag_kg', lbl: 'Slag', trk: 'slagnh' },
    { col: 'nonhazardous_waste_other_kg', lbl: 'Other', trk: 'other' },
    { col: 'nonhazardous_waste_general_kg', lbl: 'General/Unspecified', trk: 'general' },
];

const WASTE_RESPONSE_HAZ = [
    { col: 'hazardous_waste_prodchemdrum_kg', lbl: 'Empty Chemical Drums', trk: 'prodchemdrum' },
    { col: 'hazardous_waste_prodfilmprint_kg', lbl: 'Film & Printing Frame', trk: 'prodfilmprint' },
    { col: 'hazardous_waste_prodsludge_kg', lbl: 'Pre-water Treatment Sludge', trk: 'prodsludge' },
    { col: 'hazardous_waste_prodchem_kg', lbl: 'Expired/Used Chemicals', trk: 'prodchem' },
    { col: 'hazardous_waste_prodcompgas_kg', lbl: 'Compressed Gas Cylinders', trk: 'prodcompgas' },
    { col: 'hazardous_waste_prodcontammat_kg', lbl: 'Contaminated Materials', trk: 'prodcontammat' },
    { col: 'hazardous_waste_productionoil_kg', lbl: 'Waste Oil & Grease (Prod)', trk: 'productionoil' },
    { col: 'hazardous_waste_metalsludge_kg', lbl: 'Metal Sludge', trk: 'metalsludge' },
    { col: 'hazardous_waste_slagh_kg', lbl: 'Slag (Hazardous)', trk: 'slag' },
    { col: 'hazardous_waste_dombatteries_kg', lbl: 'Batteries (Dom)', trk: 'dombatteries' },
    { col: 'hazardous_waste_domflolight_kg', lbl: 'Fluorescent Lights (Dom)', trk: 'domflolight' },
    { col: 'hazardous_waste_dominkcart_kg', lbl: 'Ink Cartridges (Dom)', trk: 'dominkcart' },
    { col: 'hazardous_waste_domoilgrease_kg', lbl: 'Cooking Oil/Grease (Dom)', trk: 'domoilgrease' },
    { col: 'hazardous_waste_domemptycont_kg', lbl: 'Empty Containers (Dom)', trk: 'emptyother' },
    { col: 'hazardous_waste_domelectronic_kg', lbl: 'Electronic Waste (Dom)', trk: 'domelectronic' },
    { col: 'hazardous_waste_domcoalcomb_kg', lbl: 'Coal Combustion Residuals', trk: 'domcoalcomb' },
    { col: 'hazardous_waste_other_kg', lbl: 'Other Hazardous', trk: 'other' },
];

const WASTE_MANAGE_OPTS = [
    { key: 'wstmanage1', lbl: 'Waste mapping' },
    { key: 'wstmanage2', lbl: 'Waste segregation' },
    { key: 'wstmanage3', lbl: 'Waste training' },
    { key: 'wstmanage4', lbl: 'Waste storing' },
    { key: 'wstmanage5', lbl: 'Waste labelling/bagging' },
    { key: 'wstmanage6', lbl: 'Waste tracking & digitized reporting' },
    { key: 'wstmanage7', lbl: 'Waste matching to solution providers' },
    { key: 'wstmanage8', lbl: 'Working with stakeholders/circular' },
];

const WASTE_RESPONSE_QUESTIONS = [
    { n: 2, field: 'wstsourcenhtrack', text: 'Does your facility track any of its non-hazardous waste streams?', lv: 'LV1', wt: 'M', max: 4.125 },
    { n: 3, field: 'wstsourceeach', text: 'Does your facility track each non-hazardous waste stream your facility generates?', lv: 'LV1', wt: 'M', max: 4.125 },
    { n: 4, field: 'x_tracktop3nonhz', text: 'Are quantities of non-hazardous waste tracked by waste type at your facility?', lv: 'LV1', wt: 'S', max: 4.000, compute: 'wst_nh_track' },

    { n: 6, field: 'wstsourcehtrack', text: 'Does your facility track any of its hazardous waste streams?', lv: 'LV1', wt: 'M', max: 4.125 },
    { n: 7, field: 'wstsourcehtrackeach', text: 'Does your facility track each hazardous waste stream your facility generates?', lv: 'LV1', wt: 'M', max: 4.125 },
    { n: 8, field: 'x_tracktop3hz', text: 'Are quantities of hazardous waste tracked by waste type at your facility?', lv: 'LV1', wt: 'S', max: 4.000, compute: 'wst_h_track' },

    { n: 9, field: 'wstsegregatestreams', text: 'Does your facility segregate all waste streams into non-hazardous and hazardous?', lv: 'LV1', wt: 'S', max: 4.000 },
    { n: 10, field: 'wsthstorage', text: 'Does your facility have well-marked, designated hazardous waste storage areas?', lv: 'LV1', wt: 'S', max: 4.000 },
    { n: 11, field: 'wstnhstorage', text: 'Does your facility have well-marked, designated non-hazardous waste storage areas?', lv: 'LV1', wt: 'S', max: 4.000 },
    { n: 12, field: 'wstpolburn', text: 'Does your facility forbid all irresponsible waste disposal actions, including open burning?', lv: 'LV1', wt: 'M', max: 4.125 },
    { n: 13, field: 'wsttraining', text: 'Does your facility provide awareness training to employees regarding segregation of waste?', lv: 'LV1', wt: 'S', max: 4.000 },
    { n: 14, field: 'wsthtrain', text: 'Does your facility provide training to all employees whose work involves hazardous waste?', lv: 'LV1', wt: 'S', max: 4.000 },

    { n: 15, field: 'wstbaselinenh', text: 'Has your facility set baselines for non-hazardous waste?', lv: 'LV2', wt: 'M', max: 4.125 },
    { n: 16, field: 'wstbaselineh', text: 'Has your facility set baselines for hazardous waste?', lv: 'LV2', wt: 'M', max: 4.125 },
    { n: 18, field: 'wstbaselinedisp', text: "Did you set a baseline for waste disposal methods for your facility's overall waste?", lv: 'LV2', wt: 'M', max: 4.125 },

    { n: 19, field: 'wsttargetnh', text: 'Does your facility set formal targets to reduce non-hazardous waste generation?', lv: 'LV2', wt: 'S', max: 4.000 },
    { n: 20, field: 'wsttargeth', text: 'Does your facility set formal targets to reduce hazardous waste generation?', lv: 'LV2', wt: 'S', max: 4.000 },
    { n: 21, field: 'wsttargetdisp', text: 'Does your facility set a target for improving waste disposal methods for your overall waste?', lv: 'LV2', wt: 'S', max: 4.000 },
    { n: 22, field: 'wstmanage', text: 'Which of the following are you doing to manage your waste? (Select All That Apply)', lv: 'LV2', wt: 'S', max: 4.000, compute: 'wst_manage' },
    { n: 23, field: 'wstredimpplan', text: 'Does your facility have an implementation plan to switch to a more preferred disposal method?', lv: 'LV2', wt: 'S', max: 4.000 },

    { n: 24, field: 'wstredimpnhsource', text: 'Has your facility reduced non-hazardous waste generation in the reporting year?', lv: 'LV2', wt: 'B', max: 1.000 },
    { n: 25, field: 'wstredimphprodsource', text: 'Has your facility reduced hazardous waste generation in the reporting year?', lv: 'LV2', wt: 'B', max: 1.000 },
    { n: 26, field: 'wstredimpdisp', text: 'Has your facility improved waste disposal methods for overall waste in the reporting year?', lv: 'LV2', wt: 'B', max: 1.000 },
    { n: 27, field: 'wsthazdispvalidate', text: 'Does your facility validate the final disposal and treatment of all hazardous waste?', lv: 'LV2', wt: 'S', max: 4.000 },

    { n: 28, field: 'wstvalidate1', text: 'Does your facility validate the final disposal and treatment of all non-hazardous waste?', lv: 'LV3', wt: 'S', max: 4.000 },
    { n: 29, field: 'wstdispzerowaste', text: 'Has your facility disposed of waste through Preferred disposal methods?', lv: 'LV3', wt: 'S', max: 4.000 },
    { n: 30, field: 'wstworkoncircular', text: 'Do you or are you willing to work on circular economy systems?', lv: 'LV3', wt: 'S', max: 4.000 },
];

function getWasteResponseDataset() {
    if (typeof appData === 'undefined') return [];

    return appData.waste
        || appData.rawresponseWaste
        || appData.rawresponse_waste
        || appData.fem_rawresponse_waste
        || appData['fem_rawresponse_waste']
        || appData['fem_rawresponse_waste.csv']
        || [];
}

function normalizeWasteResponseKey(key) {
    return String(key || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function readWasteResponseValue(row, field) {
    if (!row || !field) return '';

    const normalized = Object.keys(row).reduce((map, actualKey) => {
        map[normalizeWasteResponseKey(actualKey)] = actualKey;
        return map;
    }, {});

    const getValue = key => {
        if (Object.prototype.hasOwnProperty.call(row, key) && row[key] !== '') return row[key];

        const actual = normalized[normalizeWasteResponseKey(key)];
        return actual && row[actual] !== '' ? row[actual] : '';
    };

    const status = String(getValue('status')).toUpperCase();
    const corrected = getValue(`${field}.corrected`);
    const value = getValue(`${field}.value`);

    if (status === 'VRF' && corrected !== '') return corrected;

    return value || getValue(field) || '';
}

function findWasteResponseRow(bulkRow) {
    const rows = getWasteResponseDataset();
    if (!rows.length || !bulkRow) return null;

    const higgId = String(bulkRow.higg_id || '').trim();
    const version = String(bulkRow.version || '').trim().toLowerCase();

    return rows.find(row => {
        const rowSacid = String(row.sacid || row.SACID || row.higg_id || '').trim();
        const rowVersion = String(row.version || row.Version || '').trim().toLowerCase();

        return rowSacid === higgId && (!version || rowVersion === version);
    }) || null;
}

function computeWasteTrackingCoverage(bulkRow, wasteRow, sources, prefix) {
    const activeSources = sources
        .filter(source => source.trk)
        .map(source => ({
            ...source,
            value: parseWasteValue(bulkRow?.[source.col]),
        }))
        .filter(source => source.value > 0);

    if (!activeSources.length) return '-';

    const total = activeSources.reduce((sum, source) => sum + source.value, 0);
    const tracked = activeSources.reduce((sum, source) => {
        const answer = readWasteResponseValue(wasteRow, `${prefix}${source.trk}track`);
        return /^yes$/i.test(String(answer)) ? sum + source.value : sum;
    }, 0);

    const pct = total > 0 ? (tracked / total) * 100 : 0;

    if (pct >= 70) return 'Yes';
    if (pct >= 40) return 'Partial Yes';
    return 'No';
}

function computeWasteManageResponse(wasteRow, bulkRow) {
    const yesCount = WASTE_MANAGE_OPTS.reduce((sum, option) => {
        const value = readWasteResponseValue(wasteRow, option.key) || String(bulkRow?.[option.key] || '');
        return /^yes$/i.test(String(value)) ? sum + 1 : sum;
    }, 0);

    const pct = (yesCount / WASTE_MANAGE_OPTS.length) * 100;

    if (pct >= 70) return 'Yes';
    if (pct >= 40) return 'Partial Yes';
    return 'No';
}

function getWasteQuestionResponse(question, wasteRow, bulkRow) {
    if (question.compute === 'wst_nh_track') {
        return computeWasteTrackingCoverage(bulkRow, wasteRow, WASTE_RESPONSE_NONHAZ, 'wstsourcenh');
    }

    if (question.compute === 'wst_h_track') {
        return computeWasteTrackingCoverage(bulkRow, wasteRow, WASTE_RESPONSE_HAZ, 'wstsourceh');
    }

    if (question.compute === 'wst_manage') {
        return computeWasteManageResponse(wasteRow, bulkRow);
    }

    const raw = readWasteResponseValue(wasteRow, question.field) || String(bulkRow?.[question.field] || '');
    const value = String(raw || '').trim();

    if (!value) return '-';
    if (/^yes$/i.test(value)) return 'Yes';
    if (/^no$/i.test(value)) return 'No';
    if (/partial/i.test(value)) return 'Partial Yes';
    if (/not.applicable/i.test(value)) return 'Not Applicable';

    return value;
}

function renderWasteQuestionWeightBadge(weight) {
    const styles = {
        M: { label: 'M', bg: '#fee2e2', color: '#b91c1c', title: 'Mandatory' },
        S: { label: 'S', bg: '#dbeafe', color: '#1d4ed8', title: 'Scored' },
        B: { label: 'B', bg: '#fef3c7', color: '#b45309', title: 'Bonus' },
    };

    const item = styles[weight];
    if (!item) return '';

    return `<span title="${item.title}" style="display:inline-block;margin-left:5px;padding:2px 6px;border-radius:999px;background:${item.bg};color:${item.color};font-size:10px;font-weight:850;">${item.label}</span>`;
}

function renderWasteAnswerBadge(value) {
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

    return `<span style="display:inline-block;padding:3px 9px;border-radius:999px;background:${bg};color:${color};font-size:11px;font-weight:800;white-space:nowrap;">${escapeWasteHtml(text || '-')}</span>`;
}

function renderWasteQuestionResponses(rows, selectedYear) {
    const row = getWasteRowByYear(rows, selectedYear);
    if (!row) return document.createElement('div');

    const wasteRow = findWasteResponseRow(row);

    const section = document.createElement('div');
    section.id = 'waste-question-responses-wrap';
    section.style.cssText = 'margin-top:24px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:#1d4ed8;padding:9px 16px;border-radius:6px 6px 0 0;';
    title.textContent = 'SUMMARY OF QUESTION RESPONSES';

    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:0 0 14px 14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:0;overflow:hidden;';

    const tableRows = WASTE_RESPONSE_QUESTIONS.map((question, index) => {
        const answer = getWasteQuestionResponse(question, wasteRow, row);
        const levelColor = question.lv === 'LV1' ? '#2563eb' : question.lv === 'LV2' ? '#059669' : '#7c3aed';

        return `
            <tr style="background:${index % 2 === 0 ? '#fff' : '#f8fafc'};">
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:#64748b;font-size:12px;font-weight:700;">${question.n}</td>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;white-space:nowrap;">
                    <span style="display:inline-block;padding:2px 8px;border-radius:999px;background:${levelColor}18;color:${levelColor};font-size:11px;font-weight:850;">${question.lv}</span>
                    ${renderWasteQuestionWeightBadge(question.wt)}
                </td>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;color:#1f2937;font-size:13px;line-height:1.45;">${escapeWasteHtml(question.text)}</td>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;text-align:center;white-space:nowrap;">${renderWasteAnswerBadge(answer)}</td>
            </tr>
        `;
    }).join('');

    card.innerHTML = `
        <div style="padding:12px 16px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <div style="font-size:13px;font-weight:800;color:#111827;">Summary of Question Responses</div>
            <div style="font-size:12px;color:#64748b;">${wasteRow ? `Matched raw response for ${escapeWasteHtml(selectedYear)}` : `Using bulk fields for ${escapeWasteHtml(selectedYear)}`}</div>
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

function calculateWastePerformanceScore(rows, selectedYear) {
    const row = getWasteRowByYear(rows, selectedYear);
    if (!row) return null;

    const wasteRow = findWasteResponseRow(row);
    const answers = {};

    WASTE_RESPONSE_QUESTIONS.forEach(question => {
        answers[question.n] = {
            display: getWasteQuestionResponse(question, wasteRow, row),
            applicable: true,
        };

        if (answers[question.n].display === 'Not Applicable') {
            answers[question.n].applicable = false;
        }
    });

    const scores = {};
    const maxes = {};
    const byLevel = { LV1: [], LV2: [], LV3: [] };

    WASTE_RESPONSE_QUESTIONS.forEach(question => {
        byLevel[question.lv].push(question);
    });

    Object.entries(byLevel).forEach(([level, questions]) => {
        const naQuestions = questions.filter(question => {
            const answer = answers[question.n] || {};
            return answer.applicable === false;
        });

        const naTotal = naQuestions.reduce((sum, question) => sum + question.max, 0);

        const nonNaApplicableQuestions = questions.filter(question => {
            const answer = answers[question.n] || {};
            return answer.applicable !== false;
        });

        const redistributedMax = nonNaApplicableQuestions.length > 0
            ? naTotal / nonNaApplicableQuestions.length
            : 0;

        questions.forEach(question => {
            const answer = answers[question.n] || { applicable: true, display: null };

            let adjustedMax = question.max;

            if (nonNaApplicableQuestions.find(q => q.n === question.n)) {
                adjustedMax = question.max + redistributedMax;
            }

            maxes[question.n] = adjustedMax;

            let score = 0;

            if (answer.applicable !== false) {
                if (answer.display === 'Yes') score = adjustedMax;
                else if (answer.display === 'Partial Yes') score = adjustedMax * 0.5;
            }

            scores[question.n] = score;
        });
    });

    const levels = {};

    ['LV1', 'LV2', 'LV3'].forEach(level => {
        const questions = byLevel[level];

        const mandatoryOk = questions
            .filter(question => question.wt === 'M')
            .every(question => {
                const answer = answers[question.n] || {};
                return answer.applicable === false ||
                    ['Yes', 'Partial Yes', 'Not Applicable'].includes(answer.display);
            });

        const previousLevelOk = level === 'LV1'
            ? true
            : levels[`LV${parseInt(level.slice(2), 10) - 1}`];

        levels[level] = mandatoryOk && previousLevelOk;
    });

    return { scores, maxes, levels, byLevel, answers };
}

function renderWastePerformanceScore(rows, selectedYear) {
    const result = calculateWastePerformanceScore(rows, selectedYear);
    if (!result) return document.createElement('div');

    const { scores, maxes, levels, byLevel } = result;

    const section = document.createElement('div');
    section.id = 'waste-performance-score-wrap';
    section.style.cssText = 'margin-top:24px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:#166534;padding:9px 16px;border-radius:6px 6px 0 0;';
    title.textContent = 'WASTE PERFORMANCE SCORE & RATING';

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

    const totalScore = WASTE_RESPONSE_QUESTIONS.reduce((sum, question) => sum + (scores[question.n] || 0), 0);
    const totalMax = WASTE_RESPONSE_QUESTIONS.reduce((sum, question) => sum + (maxes[question.n] || question.max), 0);
    const totalPct = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
    const totalColor = totalPct >= 70 ? '#166534' : totalPct >= 40 ? '#b45309' : '#991b1b';

    card.innerHTML = `
        ${scoreHtml}

        <div style="border-top:1px solid #e2e8f0;margin-top:6px;padding-top:18px;display:flex;align-items:flex-end;justify-content:space-between;gap:18px;">
            <div>
                <div style="font-size:20px;font-weight:900;color:#111827;margin-bottom:6px;">Total Waste Score</div>
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
