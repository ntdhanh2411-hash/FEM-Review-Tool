let waterSelectedYear = null;

const WATER_OVERVIEW_COLOR = '#0ea5e9';

const WATER_SOURCE_GROUPS = [
    {
        key: 'blue',
        label: 'Blue Water',
        color: '#2563eb',
        sources: [
            { label: 'Surface Water', col: 'water_surface_l' },
            { label: 'Ground Water', col: 'water_ground_l' },
            { label: 'Municipal Water', col: 'water_municipal_l' },
            { label: 'Municipal Blue Water', col: 'water_municipalblue_l' },
            { label: 'Sea Water', col: 'water_sea_l' },
            { label: 'Rain Water', col: 'water_rain_l' },
            { label: 'Condensate Water', col: 'water_condensate_l' },
        ]
    },
    {
        key: 'grey',
        label: 'Grey Water',
        color: '#64748b',
        sources: [
            { label: 'Municipal Grey Water', col: 'water_municipalgrey_l' },
            { label: 'Reused Water', col: 'water_reuse_l' },
            { label: 'Treated Wastewater', col: 'water_treatedwastewater_l' },
            { label: 'Untreated Wastewater', col: 'water_untreatedwastewater_l' },
            { label: 'Recycled Water', col: 'water_recycled_l' },
        ]
    }
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

function getWaterRows() {
    if (typeof appData === 'undefined' || !Array.isArray(appData.bulkperformance)) return [];
    return appData.bulkperformance;
}

function parseWaterValue(value) {
    const n = parseFloat(String(value ?? '').replace(/,/g, ''));
    return !isNaN(n) && n > 0 ? n : 0;
}

function formatWaterLiters(value) {
    const n = parseWaterValue(value);

    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';

    return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function sortWaterYears(years) {
    return [...years].sort((a, b) => {
        const ay = Number(String(a).replace(/\D/g, ''));
        const by = Number(String(b).replace(/\D/g, ''));
        return ay - by;
    });
}

function escapeWaterHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getCurrentWaterHiggId() {
    const waterHiggId = document.getElementById('water-higgid')?.textContent;
    if (waterHiggId && waterHiggId !== '-' && waterHiggId !== '—') return waterHiggId;

    if (typeof selectedHiggId !== 'undefined' && selectedHiggId) return selectedHiggId;
    if (typeof currentHiggId !== 'undefined' && currentHiggId) return currentHiggId;
    if (typeof selectedFactoryHiggId !== 'undefined' && selectedFactoryHiggId) return selectedFactoryHiggId;

    return null;
}

function getWaterYears(rows) {
    return sortWaterYears([...new Set(rows.map(row => row.version).filter(Boolean))]);
}

function getWaterRowByYear(rows, year) {
    return rows.find(row => String(row.version) === String(year)) || null;
}

function ensureWaterContent() {
    let content = document.getElementById('water-content');

    if (content) return content;

    const placeholder = document.getElementById('water-placeholder');
    content = document.createElement('div');
    content.id = 'water-content';
    content.style.display = 'none';

    if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.insertBefore(content, placeholder);
    }

    return content;
}

function renderWaterHeader(base, rows) {
    document.getElementById('water-factory-name').textContent = base.account_name || '-';
    document.getElementById('water-group').textContent = base.tags || '-';
    document.getElementById('water-higgid').textContent = base.higg_id || '-';
    document.getElementById('water-country').textContent = base.account_country || '-';

    const years = getWaterYears(rows);
    const tabs = document.getElementById('water-year-tabs');

    if (!waterSelectedYear || !years.includes(waterSelectedYear)) {
        waterSelectedYear = years[years.length - 1] || null;
    }

    if (!tabs) return;

    tabs.innerHTML = years.map(year => `
        <button
            type="button"
            class="fem-year-tab ${String(year) === String(waterSelectedYear) ? 'active' : ''}"
            onclick="selectWaterYear('${escapeWaterHtml(year)}')"
        >
            ${escapeWaterHtml(year)}
        </button>
    `).join('');
}

function getWaterPreviousRow(rows, years, selectedYear) {
    const idx = years.findIndex(year => String(year) === String(selectedYear));
    if (idx <= 0) return null;

    return getWaterRowByYear(rows, years[idx - 1]);
}

function buildWaterChangeBadge(currentValue, previousValue) {
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

function renderWaterContent(rows) {
    const content = ensureWaterContent();
    const placeholder = document.getElementById('water-placeholder');

    if (!rows.length) {
        content.style.display = 'none';
        if (placeholder) placeholder.style.display = '';
        return;
    }

    const years = getWaterYears(rows);

    if (!waterSelectedYear || !years.includes(waterSelectedYear)) {
        waterSelectedYear = years[years.length - 1] || null;
    }

    const selectedRow = getWaterRowByYear(rows, waterSelectedYear);
    const previousRow = getWaterPreviousRow(rows, years, waterSelectedYear);

    const selectedWater = parseWaterValue(selectedRow?.total_water_l);
    const previousWater = parseWaterValue(previousRow?.total_water_l);

    content.innerHTML = '';

    content.appendChild(renderWaterUseOverview(rows, years, waterSelectedYear, selectedWater, previousWater));
    content.appendChild(renderWaterUseBySource(selectedRow));
    content.appendChild(renderWaterProductionScopeInsights(rows, years, waterSelectedYear));
    content.appendChild(renderWaterQuestionResponses(rows, waterSelectedYear));
    content.appendChild(renderWaterPerformanceScore(rows, waterSelectedYear));

    content.style.display = '';
    if (placeholder) placeholder.style.display = 'none';
}

function renderWaterUseOverview(rows, years, selectedYear, selectedWater, previousWater) {
    const section = document.createElement('div');
    section.id = 'water-use-overview-wrap';
    section.style.cssText = 'margin-top:20px;';

    const title = document.createElement('div');
    title.style.cssText = `font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:${WATER_OVERVIEW_COLOR};padding:9px 16px;border-radius:6px 6px 0 0;`;
    title.textContent = 'WATER USE OVERVIEW';

    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:0 0 14px 14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:24px;display:grid;grid-template-columns:minmax(260px,0.75fr) minmax(460px,1.7fr);gap:28px;align-items:start;';

    const left = document.createElement('div');
    left.style.cssText = 'background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:18px;';

    left.innerHTML = `
        <div style="font-size:11px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;">Total Water Use</div>
        <div style="font-size:34px;font-weight:850;color:#0f172a;line-height:1;">${formatWaterLiters(selectedWater)}</div>
        <div style="font-size:12px;color:#64748b;margin-top:4px;">liters in ${escapeWaterHtml(selectedYear)}</div>
        <div style="margin-top:14px;">${buildWaterChangeBadge(selectedWater, previousWater)}</div>
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
        btn.style.cssText = `padding:5px 14px;border-radius:20px;border:2px solid ${i === 0 ? WATER_OVERVIEW_COLOR : '#e5e7eb'};background:${i === 0 ? WATER_OVERVIEW_COLOR : '#fff'};color:${i === 0 ? '#fff' : '#6b7280'};font-size:12px;font-weight:700;cursor:pointer;`;

        btn.onclick = () => {
            selectorWrap.querySelectorAll('button').forEach(b => {
                b.style.background = '#fff';
                b.style.color = '#6b7280';
                b.style.borderColor = '#e5e7eb';
            });

            btn.style.background = WATER_OVERVIEW_COLOR;
            btn.style.color = '#fff';
            btn.style.borderColor = WATER_OVERVIEW_COLOR;

            if (resizeCanvasToParent(canvas)) {
                drawWaterUseChart(canvas, legend, rows, years, opt.value === 0 ? years.length : opt.value);
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
            drawWaterUseChart(canvas, legend, rows, years, 3);
        }
    }, 0);

    return section;
}

function getWaterSourceItems(row) {
    const items = [];

    WATER_SOURCE_GROUPS.forEach(group => {
        group.sources.forEach(source => {
            const value = parseWaterValue(row?.[source.col]);

            if (value > 0) {
                items.push({
                    label: source.label,
                    value,
                    group: group.label,
                    color: group.color
                });
            }
        });
    });

    items.sort((a, b) => b.value - a.value);

    const total = items.reduce((sum, item) => sum + item.value, 0);

    return items.map((item, index) => ({
        ...item,
        ranking: index + 1,
        share: total > 0 ? (item.value / total) * 100 : 0
    }));
}

function renderWaterUseBySource(row) {
    const section = document.createElement('div');
    section.id = 'water-use-source-wrap';
    section.style.cssText = 'margin-top:24px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:#075985;padding:9px 16px;border-radius:6px 6px 0 0;';
    title.textContent = 'WATER USE BY SOURCE';

    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:0 0 14px 14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:20px 24px;overflow-x:auto;';

    const items = getWaterSourceItems(row);

    if (!items.length) {
        card.innerHTML = '<div style="font-size:13px;color:#9ca3af;padding:12px;">No water source data available for this year.</div>';
    } else {
        const rowsHtml = items.map(item => `
            <tr>
                <td style="padding:9px 10px;border-bottom:1px solid #f1f5f9;text-align:center;">
                    <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:${item.color};color:#fff;font-size:11px;font-weight:800;">${item.ranking}</span>
                </td>
                <td style="padding:9px 10px;border-bottom:1px solid #f1f5f9;">
                    <div style="font-weight:700;color:#1a1f2e;">${escapeWaterHtml(item.label)}</div>
                    <div style="font-size:10px;color:${item.color};font-weight:800;margin-top:2px;">${escapeWaterHtml(item.group)}</div>
                </td>
                <td style="padding:9px 10px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;color:#1a1f2e;">${formatWaterLiters(item.value)}</td>
                <td style="padding:9px 10px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:800;color:${item.color};">${item.share.toFixed(1)}%</td>
                <td style="padding:9px 10px;border-bottom:1px solid #f1f5f9;min-width:140px;">
                    <div style="height:10px;background:#e5e7eb;border-radius:999px;overflow:hidden;">
                        <div style="height:100%;width:${Math.min(item.share, 100)}%;background:${item.color};border-radius:999px;"></div>
                    </div>
                    <div style="font-size:10px;color:#94a3b8;margin-top:3px;">${item.share.toFixed(1)}%</div>
                </td>
            </tr>
        `).join('');

        card.innerHTML = `
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
                <thead>
                    <tr>
                        <th style="padding:9px 10px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:800;text-transform:uppercase;border-bottom:2px solid #e2e8f0;text-align:center;width:80px;">Ranking</th>
                        <th style="padding:9px 10px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:800;text-transform:uppercase;border-bottom:2px solid #e2e8f0;text-align:left;">Water Source</th>
                        <th style="padding:9px 10px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:800;text-transform:uppercase;border-bottom:2px solid #e2e8f0;text-align:right;">Volume</th>
                        <th style="padding:9px 10px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:800;text-transform:uppercase;border-bottom:2px solid #e2e8f0;text-align:right;">% Share</th>
                        <th style="padding:9px 10px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:800;text-transform:uppercase;border-bottom:2px solid #e2e8f0;text-align:left;">Distribution</th>
                    </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
            </table>
        `;
    }

    section.appendChild(title);
    section.appendChild(card);

    return section;
}

function drawWaterUseChart(canvas, legendEl, rows, allYears, count) {
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
        const row = getWaterRowByYear(rows, year);
        return parseWaterValue(row?.total_water_l);
    });

    if (!values.some(v => v > 0)) {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '13px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No water data available', W / 2, H / 2);
        legendEl.innerHTML = '';
        return;
    }

    const maxVal = Math.max(...values) * 1.18 || 1;
    const barGap = chartW / years.length;
    const barW = Math.min(68, barGap * 0.52);

    for (let i = 0; i <= 5; i++) {
        const y = padT + chartH - (i / 5) * chartH;
        const tickValue = maxVal * i / 5;

        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + chartW, y);
        ctx.stroke();

        ctx.fillStyle = '#7dd3fc';
        ctx.font = '10px Segoe UI, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatWaterLiters(tickValue), padL - 8, y);
    }

    years.forEach((year, index) => {
        const value = values[index];
        const barX = padL + index * barGap + (barGap - barW) / 2;
        const barH = value > 0 ? Math.max((value / maxVal) * chartH, 2) : 0;
        const barY = padT + chartH - barH;

        ctx.fillStyle = WATER_OVERVIEW_COLOR;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(barX, barY, barW, barH);
        ctx.globalAlpha = 1;

        if (value > 0) {
            ctx.fillStyle = '#0369a1';
            ctx.font = 'bold 10px Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(formatWaterLiters(value), barX + barW / 2, barY - 7);
        }

        ctx.fillStyle = '#334155';
        ctx.font = 'bold 11px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(year, barX + barW / 2, padT + chartH + 9);
    });

    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + chartH);
    ctx.lineTo(padL + chartW, padT + chartH);
    ctx.stroke();

    legendEl.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px;">
            <div style="width:12px;height:12px;border-radius:3px;background:${WATER_OVERVIEW_COLOR};flex-shrink:0;"></div>
            <span style="font-size:12px;color:#374151;font-weight:700;">Total Water Use</span>
        </div>
    `;
}

function renderWaterPage(higgId) {
    const rows = getWaterRows().filter(row => String(row.higg_id) === String(higgId));

    if (!rows.length) {
        const content = ensureWaterContent();
        const placeholder = document.getElementById('water-placeholder');

        content.style.display = 'none';
        if (placeholder) placeholder.style.display = '';

        return;
    }

    renderWaterHeader(rows[0], rows);
    renderWaterContent(rows);
}

function selectWaterYear(year) {
    waterSelectedYear = String(year);

    const higgId = getCurrentWaterHiggId();
    if (higgId) renderWaterPage(higgId);
}

function updateWaterPage() {
    const higgId = getCurrentWaterHiggId();
    if (higgId) renderWaterPage(higgId);
}

function redrawWaterChartsWhenVisible() {
    if (!isDashboardPageVisible('page-water')) return;

    const higgId = getCurrentWaterHiggId();
    if (higgId) {
        requestAnimationFrame(() => renderWaterPage(higgId));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const originalNavigateTo = window.navigateTo;

    if (typeof originalNavigateTo === 'function' && !window.__waterNavigateWrapped) {
        window.__waterNavigateWrapped = true;

        window.navigateTo = function (page) {
            originalNavigateTo(page);

            if (page === 'water') {
                setTimeout(redrawWaterChartsWhenVisible, 80);
            }
        };
    }

    window.addEventListener('resize', () => {
        setTimeout(redrawWaterChartsWhenVisible, 120);
    });

    setTimeout(redrawWaterChartsWhenVisible, 0);
});

const WATER_PRODUCTION_SCOPE_ITEMS = [
    { key: 'finalProductAssembly', label: 'Final Product Assembly', col: 'finalProductAssembly_water_l', prodCol: 'annual_prod_vol_finalProductAssembly_amount', color: '#2563eb' },
    { key: 'finishedProductProcessing', label: 'Finished Product Processing', col: 'finishedProductProcessing_water_l', color: '#14b8a6' },
    { key: 'printingProductDyeingAndLaundering', label: 'Printing / Dyeing / Laundering', col: 'printingProductDyeingAndLaundering_water_l', color: '#f97316' },
    { key: 'hardComponentTrimProduction', label: 'Hard Component / Trim', col: 'hardComponentTrimProduction_water_l', color: '#8b5cf6' },
    { key: 'materialProduction', label: 'Material Production', col: 'materialProduction_water_l', color: '#22c55e' },
    { key: 'rawMaterialProcessing', label: 'Raw Material Processing', col: 'rawMaterialProcessing_water_l', color: '#0ea5e9' },
    { key: 'rawMaterialCollection', label: 'Raw Material Collection', col: 'rawMaterialCollection_water_l', color: '#64748b' },
];

function getWaterResponseDataset() {
    if (typeof appData === 'undefined') return [];

    return appData.water
        || appData.rawresponseWater
        || appData.rawresponse_water
        || appData.fem_rawresponse_water
        || appData['fem_rawresponse_water']
        || appData['fem_rawresponse_water.csv']
        || [];
}

function normalizeWaterResponseKey(key) {
    return String(key || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function readWaterResponseValue(row, field) {
    if (!row || !field) return '';

    const normalized = Object.keys(row).reduce((map, actualKey) => {
        map[normalizeWaterResponseKey(actualKey)] = actualKey;
        return map;
    }, {});

    const getValue = key => {
        if (Object.prototype.hasOwnProperty.call(row, key) && row[key] !== '') return row[key];

        const actual = normalized[normalizeWaterResponseKey(key)];
        return actual && row[actual] !== '' ? row[actual] : '';
    };

    const status = String(getValue('status')).toUpperCase();
    const corrected = getValue(`${field}.corrected`);
    const value = getValue(`${field}.value`);

    if (status === 'VRF' && corrected !== '') return corrected;

    return value || getValue(field) || '';
}

function findWaterResponseRow(bulkRow) {
    const rows = getWaterResponseDataset();
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

function sumWaterColumn(rows, year, col) {
    return rows
        .filter(row => String(row.version) === String(year))
        .reduce((sum, row) => sum + parseWaterValue(row?.[col]), 0);
}

function getWaterProductionScopeData(rows, years, selectedYear) {
    const selectedIndex = years.findIndex(year => String(year) === String(selectedYear));
    const previousYear = selectedIndex > 0 ? years[selectedIndex - 1] : null;

    const items = WATER_PRODUCTION_SCOPE_ITEMS.map(scope => {
        const value = sumWaterColumn(rows, selectedYear, scope.col);
        const previousValue = previousYear ? sumWaterColumn(rows, previousYear, scope.col) : 0;

        return {
            ...scope,
            value,
            previousValue,
        };
    }).filter(item => item.value > 0 || item.previousValue > 0);

    const total = items.reduce((sum, item) => sum + item.value, 0);

    return items
        .map(item => ({
            ...item,
            share: total > 0 ? (item.value / total) * 100 : 0,
            changePct: item.previousValue > 0 ? ((item.value - item.previousValue) / item.previousValue) * 100 : null,
        }))
        .sort((a, b) => b.value - a.value);
}

function formatWaterChangePct(changePct) {
    if (changePct === null || changePct === undefined || !isFinite(changePct)) {
        return '<span style="color:#94a3b8;font-weight:700;">-</span>';
    }

    const color = changePct > 0 ? '#dc2626' : changePct < 0 ? '#16a34a' : '#64748b';
    const arrow = changePct > 0 ? '▲' : changePct < 0 ? '▼' : '→';

    return `<span style="color:${color};font-weight:850;">${arrow} ${Math.abs(changePct).toFixed(1)}%</span>`;
}

function getWaterRiskValue(bulkRow) {
    const waterRow = findWaterResponseRow(bulkRow);
    const rawRisk = readWaterResponseValue(waterRow, 'watriskrating') || String(bulkRow?.watriskrating || '').trim();

    if (!rawRisk) return '-';

    if (/^yes$/i.test(rawRisk)) return 'Yes';
    if (/^no$/i.test(rawRisk)) return 'No';

    return rawRisk;
}

function renderWaterRiskPanel(row) {
    const risk = getWaterRiskValue(row);
    const isHigh = /^yes$/i.test(risk) || /high|very/i.test(risk);
    const color = isHigh ? '#dc2626' : risk !== '-' ? '#16a34a' : '#64748b';

    const panel = document.createElement('div');
    panel.style.cssText = 'background:#fff;border-radius:0 0 14px 14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:22px;min-height:100%;';

    panel.innerHTML = `
        <div style="font-size:11px;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:12px;">Water Risk</div>
        <div style="font-size:36px;font-weight:900;color:${color};line-height:1;">${escapeWaterHtml(risk)}</div>
        <div style="font-size:13px;color:#64748b;line-height:1.35;margin-top:10px;">High/Very High Risk per WRI Aqueduct</div>
    `;

    return panel;
}

function getWaterIntensityYearlyData(rows) {
    const sortedYears = getWaterYears(rows);

    return sortedYears.map(year => {
        const yearRows = rows.filter(row => String(row.version) === String(year));

        const water = yearRows.reduce((sum, row) => {
            return sum + parseWaterValue(row.total_water_l);
        }, 0);

        const production = yearRows.reduce((sum, row) => {
            return sum + (
                parseWaterValue(row.annual_prod_vol_amount) ||
                parseWaterValue(row.annual_prod_vol_amount_optional)
            );
        }, 0);

        return {
            year,
            water,
            production,
            intensity: production > 0 ? water / production : null,
        };
    });
}

function getPcPairProductionWaterIntensity(rows, selectedYear) {
    const sortedYears = getWaterYears(rows);

    const yearly = sortedYears.map(year => {
        const yearRows = rows.filter(row => String(row.version) === String(year));

        const water = yearRows.reduce((sum, row) => {
            return sum + parseWaterValue(row.total_water_l);
        }, 0);

        const production = yearRows.reduce((sum, row) => {
            return sum + (
                parseWaterValue(row.annual_prod_vol_amount) ||
                parseWaterValue(row.annual_prod_vol_amount_optional)
            );
        }, 0);

        return {
            year,
            water,
            production,
            intensity: production > 0 ? water / production : null,
        };
    });

    const currentIndex = yearly.findIndex(item => String(item.year) === String(selectedYear));
    const current = currentIndex >= 0
        ? yearly[currentIndex]
        : { year: selectedYear, water: 0, production: 0, intensity: null };

    const previous = currentIndex > 0 ? yearly[currentIndex - 1] : null;

    let changePct = null;

    if (
        current.intensity !== null &&
        previous &&
        previous.intensity !== null &&
        previous.intensity > 0
    ) {
        changePct = ((current.intensity - previous.intensity) / previous.intensity) * 100;
    }

    return {
        ...current,
        yearly,
        previous,
        previousYear: previous ? previous.year : null,
        changePct,
    };
}

function buildWaterIntensityChangeBadge(changePct, previousYear) {
    if (changePct === null || changePct === undefined || !isFinite(changePct)) {
        return '';
    }

    const color = changePct > 0 ? '#ef4444' : changePct < 0 ? '#16a34a' : '#64748b';
    const arrow = changePct > 0 ? '▲' : changePct < 0 ? '▼' : '→';
    const wording = changePct > 0 ? 'increase' : changePct < 0 ? 'decrease' : 'no change';
    const compareText = previousYear ? `vs ${escapeWaterHtml(previousYear)}` : 'vs previous FEM year';

    return `
        <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-top:18px;">
            <span style="font-size:22px;font-weight:850;color:${color};">${arrow} ${Math.abs(changePct).toFixed(1)}%</span>
            <span style="font-size:12px;font-weight:700;color:#64748b;">${wording} ${compareText}</span>
        </div>
    `;
}

function renderWaterIntensityPanel(rows, selectedYear) {
    const result = getPcPairProductionWaterIntensity(rows, selectedYear);

    const panel = document.createElement('div');
    panel.style.cssText = 'background:#fff;border-radius:0 0 14px 14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:22px;min-height:100%;display:flex;flex-direction:column;';

    const valueHtml = result.intensity === null
        ? '-'
        : result.intensity.toFixed(4);

    panel.innerHTML = `
        <div style="font-size:11px;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:12px;">Water Intensity</div>

        <div style="font-size:13px;color:#64748b;line-height:1.45;margin-bottom:28px;">
            Liters of water used, normalized by total production volume.
        </div>

        <div style="margin-top:0;">
            <div style="font-size:32px;font-weight:900;color:#0f172a;line-height:1;">
                ${valueHtml}
                <span style="font-size:15px;font-weight:700;color:#64748b;">L/unit</span>
            </div>
            <div style="font-size:12px;color:#94a3b8;margin-top:6px;">
                in ${escapeWaterHtml(selectedYear)}
            </div>
            ${buildWaterIntensityChangeBadge(result.changePct, result.previousYear)}
        </div>
    `;

    return panel;
}

function renderWaterProductionScopePanel(rows, years, selectedYear) {
    const panel = document.createElement('div');
    panel.style.cssText = 'background:#fff;border-radius:0 0 14px 14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:18px;min-width:0;';

    const panelTitle = document.createElement('div');
    panelTitle.style.cssText = 'font-size:11px;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:12px;';
    panelTitle.textContent = 'WATER USE BY PRODUCTION SCOPE';
    panel.appendChild(panelTitle);

    const selectorWrap = document.createElement('div');
    selectorWrap.style.cssText = 'display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center;';
    selectorWrap.innerHTML = '<span style="font-size:12px;color:#6b7280;font-weight:700;">Show:</span>';

    const canvas = document.createElement('canvas');
    canvas.height = 220;
    canvas.style.cssText = 'width:100%;display:block;';

    const legend = document.createElement('div');
    legend.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;';

    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'margin-top:14px;overflow-x:auto;';

    const options = [
        { label: 'Last 3 Years', value: 3 },
        { label: 'Last 5 Years', value: 5 },
        { label: 'All Years', value: 0 },
    ];

    options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.textContent = opt.label;
        btn.style.cssText = `padding:5px 12px;border-radius:20px;border:2px solid ${index === 0 ? '#075985' : '#e5e7eb'};background:${index === 0 ? '#075985' : '#fff'};color:${index === 0 ? '#fff' : '#6b7280'};font-size:12px;font-weight:700;cursor:pointer;`;

        btn.onclick = () => {
            selectorWrap.querySelectorAll('button').forEach(b => {
                b.style.background = '#fff';
                b.style.color = '#6b7280';
                b.style.borderColor = '#e5e7eb';
            });

            btn.style.background = '#075985';
            btn.style.color = '#fff';
            btn.style.borderColor = '#075985';

            if (resizeCanvasToParent(canvas)) {
                drawWaterProductionScopeChart(canvas, legend, rows, years, opt.value === 0 ? years.length : opt.value);
            }
        };

        selectorWrap.appendChild(btn);
    });

    panel.appendChild(selectorWrap);
    panel.appendChild(canvas);
    panel.appendChild(legend);
    panel.appendChild(tableWrap);

    renderWaterProductionScopeTable(tableWrap, rows, years, selectedYear);

    setTimeout(() => {
        if (resizeCanvasToParent(canvas)) {
            drawWaterProductionScopeChart(canvas, legend, rows, years, 3);
        }
    }, 0);

    return panel;
}

function renderWaterProductionScopeTable(tableWrap, rows, years, selectedYear) {
    const items = getWaterProductionScopeData(rows, years, selectedYear);

    if (!items.length) {
        tableWrap.innerHTML = '<div style="font-size:13px;color:#9ca3af;padding:10px;">No production scope water data available for this year.</div>';
        return;
    }

    const rowsHtml = items.map(item => `
        <tr>
            <td style="padding:8px 9px;border-bottom:1px solid #e2e8f0;">
                <div style="display:flex;align-items:center;gap:7px;">
                    <span style="width:10px;height:10px;border-radius:3px;background:${item.color};flex-shrink:0;"></span>
                    <span style="font-size:12px;font-weight:800;color:#1f2937;">${escapeWaterHtml(item.label)}</span>
                </div>
            </td>
            <td style="padding:8px 9px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:12px;font-weight:800;color:#111827;">${formatWaterLiters(item.value)}</td>
            <td style="padding:8px 9px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:12px;font-weight:800;color:${item.color};">${item.share.toFixed(1)}%</td>
            <td style="padding:8px 9px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:12px;">${formatWaterChangePct(item.changePct)}</td>
        </tr>
    `).join('');

    tableWrap.innerHTML = `
        <table style="width:100%;border-collapse:collapse;font-size:12px;min-width:520px;">
            <thead>
                <tr>
                    <th style="padding:8px 9px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:900;text-transform:uppercase;text-align:left;border-bottom:2px solid #e2e8f0;">Production Scope</th>
                    <th style="padding:8px 9px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:900;text-transform:uppercase;text-align:right;border-bottom:2px solid #e2e8f0;">Water</th>
                    <th style="padding:8px 9px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:900;text-transform:uppercase;text-align:right;border-bottom:2px solid #e2e8f0;">Share</th>
                    <th style="padding:8px 9px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:900;text-transform:uppercase;text-align:right;border-bottom:2px solid #e2e8f0;">YoY</th>
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>
    `;
}

function drawWaterProductionScopeChart(canvas, legendEl, rows, allYears, count) {
    const years = count >= allYears.length ? allYears : allYears.slice(-count);

    const w = canvas.width;
    const h = canvas.height;

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const padL = 64;
    const padR = 18;
    const padT = 20;
    const padB = 46;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const series = WATER_PRODUCTION_SCOPE_ITEMS.map(scope => ({
        ...scope,
        values: years.map(year => sumWaterColumn(rows, year, scope.col)),
    })).filter(scope => scope.values.some(value => value > 0));

    const stackedTotals = years.map((_, yearIndex) => {
        return series.reduce((sum, scope) => sum + scope.values[yearIndex], 0);
    });

    if (!stackedTotals.some(value => value > 0)) {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '13px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No production scope water data available', W / 2, H / 2);
        legendEl.innerHTML = '';
        return;
    }

    const maxVal = Math.max(...stackedTotals) * 1.18 || 1;
    const barGap = chartW / years.length;
    const barW = Math.min(54, barGap * 0.52);

    for (let i = 0; i <= 4; i++) {
        const y = padT + chartH - (i / 4) * chartH;
        const tickValue = maxVal * i / 4;

        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + chartW, y);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Segoe UI, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatWaterLiters(tickValue), padL - 8, y);
    }

    years.forEach((year, yearIndex) => {
        const barX = padL + yearIndex * barGap + (barGap - barW) / 2;
        let baseY = padT + chartH;

        series.forEach(scope => {
            const value = scope.values[yearIndex];
            if (value <= 0) return;

            const barH = Math.max((value / maxVal) * chartH, 2);
            baseY -= barH;

            ctx.fillStyle = scope.color;
            ctx.globalAlpha = 0.9;
            ctx.fillRect(barX, baseY, barW, barH);
            ctx.globalAlpha = 1;
        });

        ctx.fillStyle = '#334155';
        ctx.font = 'bold 10px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(year, barX + barW / 2, padT + chartH + 9);
    });

    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + chartH);
    ctx.lineTo(padL + chartW, padT + chartH);
    ctx.stroke();

    legendEl.innerHTML = series.map(scope => `
        <div style="display:flex;align-items:center;gap:5px;">
            <span style="width:10px;height:10px;border-radius:3px;background:${scope.color};flex-shrink:0;"></span>
            <span style="font-size:11px;color:#374151;font-weight:700;">${escapeWaterHtml(scope.label)}</span>
        </div>
    `).join('');
}

function renderWaterProductionScopeInsights(rows, years, selectedYear) {
    const selectedRow = getWaterRowByYear(rows, selectedYear);

    const section = document.createElement('div');
    section.id = 'water-production-scope-insights-wrap';
    section.style.cssText = 'margin-top:24px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:#075985;padding:9px 16px;border-radius:6px 6px 0 0;';
    title.textContent = 'WATER PERFORMANCE BY PRODUCTION SCOPE & RISK OVERVIEW';

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:minmax(480px,1.55fr) minmax(220px,0.72fr) minmax(300px,0.9fr);gap:18px;align-items:stretch;background:#f8fafc;border-radius:0 0 14px 14px;padding:18px;box-shadow:0 1px 6px rgba(0,0,0,0.07);';

    grid.appendChild(renderWaterProductionScopePanel(rows, years, selectedYear));
    grid.appendChild(renderWaterRiskPanel(selectedRow));
    grid.appendChild(renderWaterIntensityPanel(rows, selectedYear));

    section.appendChild(title);
    section.appendChild(grid);

    return section;
}
const WATER_RESPONSE_QUESTIONS = [
    { n: 1, field: 'watsourcetrackopt', text: 'Does your facility track any of its water use?', lv: 'LV1', wt: 'M', max: 11.5 },
    { n: 2, field: 'watsourcetrackoptall', text: 'Does your facility track the consumption of water from all the sources it utilizes?', lv: 'LV1', wt: 'M', max: 11.5 },
    { n: 3, field: 'watsourcetrackoptrejected', text: 'Does the water consumption you track and report include the rejected water quantity from pre-treatment?', lv: 'LV1', wt: 'B', max: 1 },
    { n: 4, field: 'wattrackdomprodsep', text: 'Are you able to identify and track domestic and production water use separately?', lv: 'LV1', wt: 'S', max: 4 },
    { n: 5, field: 'watmonitorleaks', text: 'Does your facility have a process to inspect and monitor its water supply network for leaks?', lv: 'LV1', wt: 'B', max: 1 },

    { n: 6, field: 'watbaselineset', text: 'Has your facility set baselines for any of its water use?', lv: 'LV2', wt: 'M', max: 11.5 },
    { n: 7, field: 'watbaselinesepdomprod', text: 'Has your facility set baselines separately for domestic and production water use?', lv: 'LV2', wt: 'B', max: 1 },
    { n: 8, field: '_watbaselineall', text: 'Which water sources does your facility set a baseline on?', lv: 'LV2', wt: 'S', max: 4, compute: 'watbaseline' },
    { n: 9, field: 'watbalanceanalysis', text: 'Does your facility conduct a water balance analysis (from water intake to wastewater treatment plant)?', lv: 'LV2', wt: 'B', max: 1 },
    { n: 10, field: 'wattargetoptblue', text: 'Has your facility set targets for reducing blue water use from any source, except rainwater?', lv: 'LV2', wt: 'M', max: 11.5 },
    { n: 11, field: 'wattargetoptgrey', text: 'Has your facility set targets for increasing grey water use from any source?', lv: 'LV2', wt: 'M', max: 11.5 },
    { n: 12, field: 'watimproverainharvesting', text: 'Does your facility set targets to improve the rainwater harvesting capacity at your facility?', lv: 'LV2', wt: 'B', max: 1 },
    { n: 13, field: 'watimproveplan', text: 'Does your facility have an implementation plan to improve water use?', lv: 'LV2', wt: 'S', max: 4 },
    { n: 14, field: 'watimproveopt', text: 'Has your facility reduced blue water use for any sources, compared with your baseline?', lv: 'LV2', wt: 'B', max: 1 },
    { n: 15, field: 'watimproveoptgrey', text: 'Has your facility reduced grey water use for any sources, compared with your baseline?', lv: 'LV2', wt: 'B', max: 1 },
    { n: 16, field: 'watreduceplan', text: 'Does your facility have a plan to reduce your absolute bluewater use?', lv: 'LV2', wt: 'S', max: 4 },

    { n: 17, field: 'watgroundelim', text: 'Have you eliminated (reduced >90%) groundwater use for production?', lv: 'LV3', wt: 'B', max: 1, conditional: { col: 'water_ground_l', reqVal: 0, op: 'gt' } },
    { n: 18, field: 'watbluereducedemonstrate', text: 'Can your facility demonstrate you have reduced your overall absolute blue water use?', lv: 'LV3', wt: 'M', max: 11.5 },
    { n: 19, field: 'watriskdisclosure', text: 'Does your facility disclose its water risk using internationally recognized frameworks (e.g. GRI / CDP)?', lv: 'LV3', wt: 'B', max: 1 },
    { n: 20, field: 'watdemonstratepositiveimpact', text: 'Can your facility demonstrate positive impact on the water catchment/basin area or water source in your community?', lv: 'LV3', wt: 'B', max: 1 },
    { n: 21, field: 'watleadingtech', text: 'Does your facility implement any "leading technology" practices to significantly reduce water use?', lv: 'LV3', wt: 'S', max: 4 },
    { n: 22, field: 'watsbt', text: 'Has your facility set a Science-Based Target on Water?', lv: 'LV3', wt: 'B', max: 1 },
];

const WATER_BASELINE_SOURCE_MAP = [
    { key: 'surface', label: 'Surface Water', col: 'water_surface_l' },
    { key: 'rain', label: 'Rainwater', col: 'water_rain_l' },
    { key: 'ground', label: 'Groundwater', col: 'water_ground_l' },
    { key: 'sea', label: 'Sea / Brackish Water', col: 'water_sea_l' },
    { key: 'municipalblue', label: 'Municipal Blue Water', col: 'water_municipalblue_l' },
    { key: 'municipalunk', label: 'Municipal Water Unknown', col: 'water_municipalunkown_l' },
    { key: 'cond', label: 'Condensate', col: 'water_condensate_l' },
    { key: 'waste', label: 'Wastewater', col: 'water_wastewater_l' },
    { key: 'municipalgrey', label: 'Municipal Grey Water', col: 'water_municipalgrey_l' },
    { key: 'recycle', label: 'Recycled Water', col: 'water_recycled_l' },
    { key: 'reuse', label: 'Reuse Water', col: 'water_reuse_l' },
    { key: 'wasteinternal', label: 'Untreated Wastewater', col: 'water_untreatedwastewater_l' },
];

function normalizeWaterAnswer(rawValue) {
    const raw = String(rawValue ?? '').trim();

    if (!raw || raw === 'null' || raw === 'undefined') return null;
    if (/^yes$/i.test(raw)) return 'Yes';
    if (/^no$/i.test(raw)) return 'No';
    if (/partial\s*yes/i.test(raw)) return 'Partial Yes';
    if (/not[\s_]?applicable|n\/a/i.test(raw)) return 'Not Applicable';

    return raw;
}

function computeWaterBaselineCoverage(waterRow, bulkRow) {
    if (!waterRow && !bulkRow) return { display: null, applicable: true };

    const allCats = [
        'allfinalProductAssembly',
        'allhardComponentTrimProduction',
        'allmaterialProduction',
        'allprintingProductDyeingAndLaundering',
        'allrawMaterialProcessing',
    ];

    const prodCats = [
        'prodfinalProductAssembly',
        'prodhardComponentTrimProduction',
        'prodmaterialProduction',
        'prodprintingProductDyeingAndLaundering',
        'prodrawMaterialProcessing',
    ];

    let totalVolume = 0;
    let coveredVolume = 0;

    WATER_BASELINE_SOURCE_MAP.forEach(source => {
        let sourceVolume = parseWaterValue(bulkRow?.[source.col]);

        if (sourceVolume <= 0 && waterRow) {
            sourceVolume += parseWaterValue(readWaterResponseValue(waterRow, `wattrackdomwatsource${source.key}quant`));

            prodCats.forEach(cat => {
                sourceVolume += parseWaterValue(readWaterResponseValue(waterRow, `wattrackwatsource${source.key}${cat}quant`));
            });

            allCats.forEach(cat => {
                sourceVolume += parseWaterValue(readWaterResponseValue(waterRow, `wattrackwatsource${source.key}${cat}quant`));
            });
        }

        if (sourceVolume <= 0) return;

        totalVolume += sourceVolume;

        let hasBaseline = /^yes$/i.test(String(
            readWaterResponseValue(waterRow, `watbaselinesourcewatsource${source.key}dom`)
        ));

        if (!hasBaseline) {
            for (const cat of allCats) {
                const flag = readWaterResponseValue(waterRow, `watbaselinesourcewatsource${source.key}${cat}`);
                const quant = readWaterResponseValue(waterRow, `watbaselinesourcewatsource${source.key}quant${cat}`);

                if (/^yes$/i.test(String(flag)) || parseWaterValue(quant) > 0) {
                    hasBaseline = true;
                    break;
                }
            }
        }

        if (!hasBaseline) {
            for (const cat of prodCats) {
                const flag = readWaterResponseValue(waterRow, `watbaselinesourcewatsource${source.key}${cat}`);

                if (/^yes$/i.test(String(flag))) {
                    hasBaseline = true;
                    break;
                }
            }
        }

        if (hasBaseline) coveredVolume += sourceVolume;
    });

    if (totalVolume <= 0) return { display: null, applicable: true };

    const coverage = (coveredVolume / totalVolume) * 100;

    return {
        display: coverage >= 70 ? 'Yes' : coverage >= 40 ? 'Partial Yes' : 'No',
        applicable: true,
        computedCoverage: coverage,
    };
}

function getWaterQuestionResponse(question, waterRow, bulkRow) {
    if (question.compute === 'watbaseline') {
        const computed = computeWaterBaselineCoverage(waterRow, bulkRow);

        return {
            ...computed,
            display: computed.display || '-',
        };
    }

    if (question.conditional) {
        const { col, reqVal, op } = question.conditional;

        if (op === 'gt') {
            const value = parseWaterValue(bulkRow?.[col]);

            if (value <= Number(reqVal || 0)) {
                return {
                    display: 'Not Applicable',
                    applicable: true,
                    autoNA: true,
                };
            }
        }
    }

    const raw = readWaterResponseValue(waterRow, question.field) ||
        String(
            bulkRow?.[`${question.field}.corrected`] ||
            bulkRow?.[`${question.field}.value`] ||
            bulkRow?.[question.field] ||
            ''
        );

    const display = normalizeWaterAnswer(raw);

    return {
        display: display || '-',
        applicable: true,
    };
}

function renderWaterQuestionWeightBadge(weight) {
    const styles = {
        M: { label: 'M', bg: '#fee2e2', color: '#b91c1c', title: 'Mandatory' },
        S: { label: 'S', bg: '#dbeafe', color: '#1d4ed8', title: 'Scored' },
        B: { label: 'B', bg: '#fef3c7', color: '#b45309', title: 'Bonus' },
    };

    const item = styles[weight];
    if (!item) return '';

    return `<span title="${item.title}" style="display:inline-block;margin-left:5px;padding:2px 6px;border-radius:999px;background:${item.bg};color:${item.color};font-size:10px;font-weight:850;">${item.label}</span>`;
}

function renderWaterAnswerBadge(value) {
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

    return `<span style="display:inline-block;padding:3px 9px;border-radius:999px;background:${bg};color:${color};font-size:11px;font-weight:800;white-space:nowrap;">${escapeWaterHtml(text || '-')}</span>`;
}

function renderWaterQuestionResponses(rows, selectedYear) {
    const row = getWaterRowByYear(rows, selectedYear);
    if (!row) return document.createElement('div');

    const waterRow = findWaterResponseRow(row);

    const section = document.createElement('div');
    section.id = 'water-question-responses-wrap';
    section.style.cssText = 'margin-top:24px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:#1d4ed8;padding:9px 16px;border-radius:6px 6px 0 0;';
    title.textContent = 'SUMMARY OF QUESTION RESPONSES';

    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:0 0 14px 14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:0;overflow:hidden;';

    const tableRows = WATER_RESPONSE_QUESTIONS.map((question, index) => {
        const answer = getWaterQuestionResponse(question, waterRow, row);
        const levelColor = question.lv === 'LV1' ? '#2563eb' : question.lv === 'LV2' ? '#059669' : '#7c3aed';

        return `
            <tr style="background:${index % 2 === 0 ? '#fff' : '#f8fafc'};">
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:#64748b;font-size:12px;font-weight:700;">${question.n}</td>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;white-space:nowrap;">
                    <span style="display:inline-block;padding:2px 8px;border-radius:999px;background:${levelColor}18;color:${levelColor};font-size:11px;font-weight:850;">${question.lv}</span>
                    ${renderWaterQuestionWeightBadge(question.wt)}
                </td>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;color:#1f2937;font-size:13px;line-height:1.45;">${escapeWaterHtml(question.text)}</td>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;text-align:center;white-space:nowrap;">${renderWaterAnswerBadge(answer.display)}</td>
            </tr>
        `;
    }).join('');

    card.innerHTML = `
        <div style="padding:12px 16px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <div style="font-size:13px;font-weight:800;color:#111827;">Summary of Question Responses</div>
            <div style="font-size:12px;color:#64748b;">${waterRow ? `Matched raw response for ${escapeWaterHtml(selectedYear)}` : `Using bulk fields for ${escapeWaterHtml(selectedYear)}`}</div>
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

function calculateWaterPerformanceScore(rows, selectedYear) {
    const row = getWaterRowByYear(rows, selectedYear);
    if (!row) return null;

    const waterRow = findWaterResponseRow(row);
    const answers = {};
    const scores = {};
    const maxes = {};
    const levels = {};
    const byLevel = { LV1: [], LV2: [], LV3: [] };

    WATER_RESPONSE_QUESTIONS.forEach(question => {
        answers[question.n] = getWaterQuestionResponse(question, waterRow, row);
        byLevel[question.lv].push(question);
    });

    Object.entries(byLevel).forEach(([level, questions]) => {
        const naQuestions = questions.filter(question => {
            const answer = answers[question.n] || {};
            return answer.applicable && answer.display === 'Not Applicable';
        });

        const naTotal = naQuestions.reduce((sum, question) => sum + question.max, 0);

        const nonNaQuestions = questions.filter(question => {
            const answer = answers[question.n] || {};
            return answer.applicable && answer.display !== 'Not Applicable';
        });

        const redistributedMax = nonNaQuestions.length > 0 ? naTotal / nonNaQuestions.length : 0;

        questions.forEach(question => {
            const answer = answers[question.n] || { applicable: true, display: null };
            const adjustedMax = nonNaQuestions.find(q => q.n === question.n)
                ? question.max + redistributedMax
                : question.max;

            maxes[question.n] = adjustedMax;

            let score = 0;

            if (answer.applicable) {
                if (answer.display === 'Yes') score = adjustedMax;
                else if (answer.display === 'Partial Yes') score = adjustedMax * 0.5;
            }

            scores[question.n] = score;
        });
    });

    ['LV1', 'LV2', 'LV3'].forEach(level => {
        const questions = byLevel[level];

        const mandatoryOk = questions
            .filter(question => question.wt === 'M')
            .every(question => {
                const answer = answers[question.n] || {};
                return !answer.applicable ||
                    ['Yes', 'Partial Yes', 'Not Applicable'].includes(answer.display);
            });

        const previousOk = level === 'LV1'
            ? true
            : levels[`LV${parseInt(level.slice(2), 10) - 1}`];

        levels[level] = mandatoryOk && previousOk;
    });

    return { scores, maxes, levels, byLevel, answers };
}

function renderWaterPerformanceScore(rows, selectedYear) {
    const result = calculateWaterPerformanceScore(rows, selectedYear);
    if (!result) return document.createElement('div');

    const { scores, maxes, levels, byLevel } = result;

    const section = document.createElement('div');
    section.id = 'water-performance-score-wrap';
    section.style.cssText = 'margin-top:24px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:#166534;padding:9px 16px;border-radius:6px 6px 0 0;';
    title.textContent = 'WATER PERFORMANCE SCORE & RATING';

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

    const totalScore = WATER_RESPONSE_QUESTIONS.reduce((sum, question) => sum + (scores[question.n] || 0), 0);
    const totalMax = WATER_RESPONSE_QUESTIONS.reduce((sum, question) => sum + (maxes[question.n] || question.max), 0);
    const totalPct = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
    const totalColor = totalPct >= 70 ? '#166534' : totalPct >= 40 ? '#b45309' : '#991b1b';

    card.innerHTML = `
        ${scoreHtml}

        <div style="border-top:1px solid #e2e8f0;margin-top:6px;padding-top:18px;display:flex;align-items:flex-end;justify-content:space-between;gap:18px;">
            <div>
                <div style="font-size:20px;font-weight:900;color:#111827;margin-bottom:6px;">Total Water Score</div>
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
