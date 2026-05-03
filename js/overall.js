const PROD_TYPE_MAP = [
    { matchKey: 'finished product assembler', label: 'Finished Product Assembler', col2025: 'annual_prod_vol_finalProductAssembly_amount', colBase: 'annual_prod_vol_finalProductAssembly_amount' },
    { matchKey: 'product printing', label: 'Finished Product Processing (Printing/Painting/Embroidery...)', col2025: 'annual_prod_vol_finishedProductProcessing_amount', colBase: null },
    { matchKey: 'product dyeing', label: 'Finished Product Processing (Dyeing/Laundering/Finishing)', col2025: 'annual_prod_vol_printingProductDyeingAndLaundering_amount', colBase: null },
    { matchKey: 'finished product processing', label: 'Finished Product Processing', col2025: null, colBase: 'annual_prod_vol_printingProductDyeingAndLaundering_amount' },
    { matchKey: 'material production', label: 'Material Production', col2025: 'annual_prod_vol_materialProduction_amount', colBase: 'annual_prod_vol_materialProduction_amount' },
    { matchKey: 'raw material processing', label: 'Raw Material Processing', col2025: 'annual_prod_vol_rawMaterialProcessing_amount', colBase: 'annual_prod_vol_rawMaterialProcessing_amount' },
    { matchKey: 'raw material collection', label: 'Raw Material Collection', col2025: 'annual_prod_vol_rawMaterialCollection_amount', colBase: 'annual_prod_vol_rawMaterialCollection_amount' },
    { matchKey: 'component', label: 'Component / Sub-Assembly Manufacturing', col2025: 'annual_prod_vol_hardComponentTrimProduction_amount', colBase: 'annual_prod_vol_hardComponentTrimProduction_amount' },
];

const OVERALL_ENERGY_GROUPS = [
    {
        key: 'nonRenewable',
        label: 'Non-Renewable Energy',
        color: '#ef4444',
        cols: [
            'energy_electricpurch_mj',
            'energy_steampurch_mj',
            'energy_chilledwater_mj',
            'energy_heating_mj',
            'energy_lpg_mj',
            'energy_coal_mj',
            'energy_diesel_mj',
            'energy_fueloil_mj',
            'energy_lng_mj',
            'energy_naturalgas_mj',
            'energy_petrol_mj',
            'energy_propane_mj',
            'energy_CNG_mj',
            'energy_coalwaterslurry_mj',
            'enery_fabricwaste_mj',
            'energy_ethanol_mj',
            'energy_hydrogrenNR_mj'
        ]
    },
    {
        key: 'renewable',
        label: 'Renewable Energy',
        color: '#22c55e',
        cols: [
            'energy_biodiesel_mj',
            'energy_biogas_mj',
            'energy_hydro_mj',
            'energy_hydrogrenR_mj',
            'energy_microhydro_mj',
            'energy_purchrenewelec_mj',
            'energy_purchrenew_mj',
            'energy_solarphoto_mj',
            'energy_solarthermal_mj',
            'energy_wind_mj',
            'energy_geotherm_mj'
        ]
    },
    {
        key: 'biomass',
        label: 'Biomass Energy',
        color: '#a855f7',
        cols: [
            'energy_biomassgen_mj',
            'energy_biomasscert_mj',
            'energy_biomasswood_mj'
        ]
    }
];

const OVERALL_GHG_SOURCES = [
    {
        key: 'nonRenewable',
        label: 'Non-Renewable Energy',
        color: '#ef4444',
        cols: [
            'total_non-renewable_ghg_kgco2e',
            'total_non_renewable_ghg_kgco2e',
            'total_nonrenewable_ghg_kgco2e',
            'total_non-renewable_energy_ghg_kgco2e',
            'total_non_renewable_energy_ghg_kgco2e'
        ]
    },
    {
        key: 'refrigerants',
        label: 'Refrigerants',
        color: '#06b6d4',
        cols: [
            'total_refrigerant_ghg_kgco2e',
            'total_refrigerants_ghg_kgco2e',
            'refrigerant_ghg_kgco2e',
            'refrigerants_ghg_kgco2e'
        ]
    }
];

function updateOverallContent(rows, years, selectedYear) {
    const row = rows.find(r => r.version === selectedYear);
    if (!row) return;

    document.getElementById('ov-tier').textContent = row.tags || '—';
    document.getElementById('ov-sector').textContent = row.sector || '—';
    document.getElementById('ov-facility').textContent = row.facility_type || '—';
    document.getElementById('ov-employees').textContent = row.employees_full_time ? Number(row.employees_full_time).toLocaleString() : '—';
    document.getElementById('ov-opdays').textContent = row.operating_days || '—';

    const tbody = document.getElementById('fem-history-tbody');
    tbody.innerHTML = years.map(y => {
        const r = rows.find(rr => rr.version === y);
        if (!r) return '';

        const sc = getStatusClass(r.survey_status);
        const score = r.total_fem_score ? Number(r.total_fem_score).toFixed(1) : '—';

        return `<tr class="${y === selectedYear ? 'active-year' : ''}">
            <td><strong>${y}</strong></td>
            <td><span class="status-badge ${sc}">${r.survey_status || '—'}</span></td>
            <td>${r.verification_verifier_name || '—'}</td>
            <td><span class="score-value">${score}</span></td>
        </tr>`;
    }).join('');

    updateFemSectionPerformanceByYear(rows, years, selectedYear);

    updateProductionOutput(rows, years, selectedYear, row);
    updateOverallResourceSummary(row, selectedYear);
    updateOverallWasteAirSummary(rows, years, selectedYear);

    document.getElementById('overall-grid').style.display = 'grid';
    document.getElementById('overall-placeholder').style.display = 'none';
}

function updateProductionOutput(rows, years, selectedYear, currentRow) {
    const facilityType = (currentRow.facility_type || '').toLowerCase();
    const yearIndex = years.indexOf(selectedYear);
    const prevYear = yearIndex > 0 ? years[yearIndex - 1] : null;
    const prevRow = prevYear ? rows.find(r => r.version === prevYear) : null;
    const is2025 = selectedYear === 'fem2025';

    const prodTypes = is2025
        ? PROD_TYPE_MAP.filter(pt => pt.col2025 !== null)
        : PROD_TYPE_MAP.filter(pt => pt.colBase !== null && pt.matchKey !== 'product printing' && pt.matchKey !== 'product dyeing');

    const tbody = document.getElementById('production-tbody');
    let rowsHtml = '';

    prodTypes.forEach(pt => {
        if (!facilityType.includes(pt.matchKey)) return;

        const col = is2025 ? pt.col2025 : pt.colBase;
        const vol = currentRow[col];
        const unitCol = col.replace('_amount', '_unit');
        const uom = currentRow[unitCol];

        if (!vol || String(vol).trim() === '' || parseFloat(vol) === 0) return;

        const volNum = parseFloat(vol);
        let yoyHtml = '—';

        if (prevRow) {
            const prevVol = parseFloat(prevRow[col] || 0);
            if (!isNaN(prevVol) && prevVol > 0 && !isNaN(volNum)) {
                const pct = ((volNum - prevVol) / prevVol) * 100;
                if (pct > 0) yoyHtml = `<span class="trend-up">▲ +${pct.toFixed(1)}%</span>`;
                else if (pct < 0) yoyHtml = `<span class="trend-down">▼ ${pct.toFixed(1)}%</span>`;
                else yoyHtml = `<span class="trend-neutral">→ 0.0%</span>`;
            } else if (!isNaN(volNum) && volNum > 0) {
                yoyHtml = `<span class="trend-up">🆕 New</span>`;
            }
        }

        const yoyLabel = prevYear ? `<span style="color:#9ca3af;font-size:11px;">vs ${prevYear}</span>` : '';

        rowsHtml += `<tr>
            <td>${pt.label}</td>
            <td><strong>${isNaN(volNum) ? vol : volNum.toLocaleString()}</strong></td>
            <td>${uom || '—'}</td>
            <td>${yoyHtml} ${yoyLabel}</td>
        </tr>`;
    });

    if (!rowsHtml) {
        rowsHtml = `<tr><td colspan="4" class="no-results">No production data available.</td></tr>`;
    }

    tbody.innerHTML = rowsHtml;
    document.getElementById('production-section').classList.add('show');
}

function updateOverallResourceSummary(row, selectedYear) {
    const existing = document.getElementById('overall-resource-summary');
    if (existing) existing.remove();

    const section = document.createElement('div');
    section.id = 'overall-resource-summary';
    section.style.cssText = 'display:grid;grid-template-columns:repeat(3,minmax(260px,1fr));gap:20px;margin-bottom:20px;';

    section.appendChild(buildOverallEnergyCard(row, selectedYear));
    section.appendChild(buildOverallGhgCard(row, selectedYear));
    section.appendChild(buildOverallWaterCard(row, selectedYear));

    const productionSection = document.getElementById('production-section');
    productionSection.insertAdjacentElement('afterend', section);
}

function buildOverallEnergyCard(row, selectedYear) {
    const groupTotals = getOverallEnergyGroupTotals(row);
    const calculatedTotal = Object.values(groupTotals).reduce((sum, val) => sum + val, 0);
    const reportedTotal = getOverallNumber(row.total_energy_mj);
    const total = reportedTotal > 0 ? reportedTotal : calculatedTotal;

    return buildOverallSummaryCard({
        title: 'Energy Consumption',
        accent: '#c2410c',
        totalLabel: 'Total Energy Consumption',
        totalValue: `${formatOverallNumber(total)} MJ`,
        subText: selectedYear || '',
        rows: OVERALL_ENERGY_GROUPS.map(g => ({
            label: g.label,
            value: `${formatOverallNumber(groupTotals[g.key])} MJ`,
            color: g.color
        }))
    });
}

function buildOverallGhgCard(row, selectedYear) {
    const total = getOverallNumber(row.total_ghg_kgco2e);
    const sourceValues = getOverallGhgSourceValues(row);

    return buildOverallSummaryCard({
        title: 'GHG Emissions',
        accent: '#7f1d1d',
        totalLabel: 'Total GHG Emissions',
        totalValue: `${formatOverallNumber(total)} kgCO2e`,
        subText: selectedYear || '',
        rows: OVERALL_GHG_SOURCES.map(source => ({
            label: source.label,
            value: `${formatOverallNumber(sourceValues[source.key])} kgCO2e`,
            color: source.color
        }))
    });
}

function buildOverallWaterCard(row, selectedYear) {
    const totalWater = getOverallNumber(row.total_water_l);

    return buildOverallSummaryCard({
        title: 'Water Use',
        accent: '#0ea5e9',
        totalLabel: 'Total Water Use',
        totalValue: `${formatOverallNumber(totalWater)} L`,
        subText: selectedYear || '',
        rows: [
            {
                label: 'Total Water Consumption',
                value: `${formatOverallNumber(totalWater)} L`,
                color: '#0ea5e9'
            }
        ]
    });
}

function buildOverallSummaryCard({ title, accent, totalLabel, totalValue, subText, rows }) {
    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);overflow:hidden;min-width:0;';

    const header = document.createElement('div');
    header.style.cssText = `background:${accent};color:#fff;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;padding:10px 16px;`;
    header.textContent = title;

    const body = document.createElement('div');
    body.style.cssText = 'padding:18px;';

    const rowsHtml = rows.map(item => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #eef2f7;">
            <div style="width:10px;height:10px;border-radius:50%;background:${item.color};flex-shrink:0;"></div>
            <div style="flex:1;font-size:12px;font-weight:700;color:#334155;">${item.label}</div>
            <div style="font-size:12px;font-weight:850;color:${item.color};white-space:nowrap;text-align:right;">${item.value}</div>
        </div>
    `).join('');

    body.innerHTML = `
        <div style="font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;">${totalLabel}</div>
        <div style="font-size:28px;font-weight:850;color:#111827;line-height:1.05;">${totalValue}</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:4px;margin-bottom:12px;">${subText}</div>
        <div>${rowsHtml}</div>
    `;

    card.appendChild(header);
    card.appendChild(body);

    return card;
}

function getOverallEnergyGroupTotals(row) {
    const totals = {
        nonRenewable: 0,
        renewable: 0,
        biomass: 0
    };

    if (!row) return totals;

    OVERALL_ENERGY_GROUPS.forEach(group => {
        totals[group.key] = group.cols.reduce((sum, col) => {
            return sum + getOverallNumber(row[col]);
        }, 0);
    });

    return totals;
}

function getOverallGhgSourceValues(row) {
    return {
        nonRenewable: getOverallValueByCols(row, OVERALL_GHG_SOURCES[0].cols),
        refrigerants: getOverallValueByCols(row, OVERALL_GHG_SOURCES[1].cols),
    };
}

function getOverallValueByCols(row, cols) {
    if (!row) return 0;

    for (const col of cols) {
        if (Object.prototype.hasOwnProperty.call(row, col)) {
            return getOverallNumber(row[col]);
        }
    }

    const normalizedMap = Object.keys(row).reduce((map, key) => {
        const normalized = String(key).toLowerCase().replace(/[^a-z0-9]+/g, '');
        map[normalized] = key;
        return map;
    }, {});

    for (const col of cols) {
        const normalized = String(col).toLowerCase().replace(/[^a-z0-9]+/g, '');
        const actualKey = normalizedMap[normalized];
        if (actualKey) return getOverallNumber(row[actualKey]);
    }

    return 0;
}

function getOverallNumber(value) {
    const n = parseFloat(String(value ?? '').replace(/,/g, ''));
    return !isNaN(n) && n > 0 ? n : 0;
}

function formatOverallNumber(value) {
    const n = getOverallNumber(value);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n > 0 ? n.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '—';
}

function updateOverallWasteAirSummary(rows, years, selectedYear) {
    const existing = document.getElementById('overall-waste-air-summary');
    if (existing) existing.remove();

    const selectedRow = rows.find(r => String(r.version) === String(selectedYear));
    if (!selectedRow) return;

    const section = document.createElement('div');
    section.id = 'overall-waste-air-summary';
    section.style.cssText = 'display:grid;grid-template-columns:repeat(2,minmax(300px,1fr));gap:20px;margin-bottom:20px;';

    section.appendChild(buildOverallWasteSummaryPanel(rows, years, selectedYear));
    section.appendChild(buildOverallAirSummaryPanel(rows, years, selectedYear));

    const resourceSummary = document.getElementById('overall-resource-summary');
    if (resourceSummary && resourceSummary.parentNode) {
        resourceSummary.insertAdjacentElement('afterend', section);
    }
}

function buildOverallWasteSummaryPanel(rows, years, selectedYear) {
    const row = rows.find(r => String(r.version) === String(selectedYear));
    const yearIndex = years.findIndex(y => String(y) === String(selectedYear));
    const prevRow = yearIndex > 0 ? rows.find(r => String(r.version) === String(years[yearIndex - 1])) : null;

    const totalWaste = getOverallNumber(row?.total_waste_kg);
    const prevWaste = getOverallNumber(prevRow?.total_waste_kg);

    const nonHaz = getOverallNumber(row?.total_nonhazardous_waste_kg);
    const haz = getOverallNumber(row?.total_hazardous_waste_kg);
    const typeTotal = nonHaz + haz;

    const panel = document.createElement('div');
    panel.style.cssText = 'background:#fff;border-radius:14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:22px;display:grid;gap:20px;';

    panel.innerHTML = `
        <div style="background:#f8fafc;border:1px solid #dbe3ef;border-radius:14px;padding:22px;">
            <div style="font-size:12px;font-weight:850;color:#58708f;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Total Waste Generated</div>
            <div style="font-size:38px;font-weight:900;color:#081936;line-height:1;">${formatOverallCompact(totalWaste)}</div>
            <div style="font-size:13px;color:#7d91ae;margin-top:8px;">kg in ${escapeOverallHtml(selectedYear)}</div>
            <div style="margin-top:22px;">${buildOverallChangeBadge(totalWaste, prevWaste)}</div>
        </div>

        <div style="background:#f8fafc;border:1px solid #dbe3ef;border-radius:14px;padding:22px;">
            <div style="font-size:12px;font-weight:850;color:#58708f;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:20px;">Waste Type Breakdown</div>
            ${buildOverallWasteTypeRow('Non-Hazardous Waste', nonHaz, typeTotal, '#22c55e')}
            <div style="height:1px;background:#e2e8f0;margin:16px 0;"></div>
            ${buildOverallWasteTypeRow('Hazardous Waste', haz, typeTotal, '#ef4444')}
        </div>
    `;

    return panel;
}

function buildOverallWasteTypeRow(label, value, total, color) {
    const pct = total > 0 ? (value / total) * 100 : 0;

    return `
        <div>
            <div style="display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;">
                <div style="width:13px;height:13px;border-radius:50%;background:${color};"></div>
                <div style="font-size:14px;font-weight:850;color:#172033;">${escapeOverallHtml(label)}</div>
                <div style="text-align:right;">
                    <div style="font-size:13px;font-weight:900;color:${color};">${pct.toFixed(1)}%</div>
                    <div style="font-size:12px;color:#8ca0b8;margin-top:2px;">${formatOverallCompact(value)} kg</div>
                </div>
            </div>
            <div style="margin-left:28px;margin-top:8px;height:10px;background:#e5eaf1;border-radius:999px;overflow:hidden;">
                <div style="height:100%;width:${Math.min(pct, 100).toFixed(1)}%;background:${color};border-radius:999px;"></div>
            </div>
        </div>
    `;
}

function buildOverallAirSummaryPanel(rows, years, selectedYear) {
    const row = rows.find(r => String(r.version) === String(selectedYear));
    const yearIndex = years.findIndex(y => String(y) === String(selectedYear));
    const prevRow = yearIndex > 0 ? rows.find(r => String(r.version) === String(years[yearIndex - 1])) : null;

    const total = getOverallAirRefrigerantTotal(row);
    const prevTotal = getOverallAirRefrigerantTotal(prevRow);

    const panel = document.createElement('div');
    panel.style.cssText = 'background:#fff;border-radius:14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:22px;display:flex;flex-direction:column;';

    panel.innerHTML = `
        <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:14px;padding:22px;min-height:184px;">
            <div style="font-size:12px;font-weight:850;color:#991b1b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Total Refrigerant Quantity</div>
            <div style="font-size:38px;font-weight:900;color:#081936;line-height:1;">${total > 0 ? formatOverallKg(total) : '-'}</div>
            <div style="font-size:13px;color:#64748b;margin-top:10px;">in ${escapeOverallHtml(selectedYear)}</div>
            <div style="margin-top:22px;">${buildOverallChangeBadge(total, prevTotal)}</div>
        </div>
    `;

    return panel;
}

function getOverallAirRefrigerantTotal(row) {
    if (!row) return 0;

    if (typeof getAirTotalRefrigerantKg === 'function') {
        return getAirTotalRefrigerantKg(row);
    }

    return 0;
}

function buildOverallChangeBadge(currentValue, previousValue) {
    if (!previousValue || previousValue <= 0 || !currentValue) {
        return '<span style="color:#8ca0b8;font-size:13px;font-weight:800;">No previous year comparison</span>';
    }

    const pct = ((currentValue - previousValue) / previousValue) * 100;
    const color = pct > 0 ? '#ef4444' : pct < 0 ? '#16a34a' : '#64748b';
    const arrow = pct > 0 ? '▲' : pct < 0 ? '▼' : '→';
    const wording = pct > 0 ? 'increase' : pct < 0 ? 'decrease' : 'no change';

    return `
        <div style="display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;">
            <span style="font-size:24px;font-weight:900;color:${color};">${arrow} ${Math.abs(pct).toFixed(1)}%</span>
            <span style="font-size:12px;font-weight:800;color:#58708f;">${wording} vs previous FEM year</span>
        </div>
    `;
}

function formatOverallCompact(value) {
    const n = getOverallNumber(value);

    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';

    return n > 0 ? n.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '—';
}

function formatOverallKg(value) {
    const n = getOverallNumber(value);

    if (n >= 1000) return (n / 1000).toFixed(2) + ' t';

    return n > 0
        ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' kg'
        : '—';
}

function escapeOverallHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function updateFemSectionPerformanceByYear(rows, years, selectedYear) {
    const existing = document.getElementById('fem-section-performance-year');
    if (existing) existing.remove();

    const section = document.createElement('div');
    section.id = 'fem-section-performance-year';
    section.style.cssText = 'background:#fff;border-radius:14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);overflow:hidden;margin-bottom:20px;';

    const title = document.createElement('div');
    title.style.cssText = 'background:#1f2937;color:#fff;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;padding:10px 16px;';
    title.textContent = 'FEM SECTION PERFORMANCE BY YEAR';

    const body = document.createElement('div');
    body.style.cssText = 'padding:0;overflow-x:auto;';

    const rowsHtml = years.map(year => {
        const row = rows.find(r => String(r.version) === String(year));
        if (!row) return '';

        return `
            <tr style="background:${String(year) === String(selectedYear) ? '#f8fafc' : '#fff'};">
                <td style="padding:11px 12px;border-bottom:1px solid #e2e8f0;font-weight:850;color:#111827;white-space:nowrap;">${escapeOverallHtml(year)}</td>
                <td style="padding:11px 12px;border-bottom:1px solid #e2e8f0;white-space:nowrap;">
                    <span class="status-badge ${getStatusClass(row.survey_status)}">${escapeOverallHtml(row.survey_status || '—')}</span>
                </td>
                <td style="padding:11px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${renderOverallLevelBadge(getOverallSectionLevel('energy', rows, year))}</td>
                <td style="padding:11px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${renderOverallLevelBadge(getOverallSectionLevel('water', rows, year))}</td>
                <td style="padding:11px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${renderOverallLevelBadge(getOverallSectionLevel('waste', rows, year))}</td>
                <td style="padding:11px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${renderOverallLevelBadge(getOverallSectionLevel('air', rows, year))}</td>
                <td style="padding:11px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${renderOverallLevelBadge(getOverallSectionLevel('chemicals', rows, year))}</td>
            </tr>
        `;
    }).join('');

    body.innerHTML = `
        <table style="width:100%;border-collapse:collapse;min-width:860px;font-size:12px;">
            <thead>
                <tr>
                    <th style="padding:9px 12px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:900;text-transform:uppercase;text-align:left;border-bottom:2px solid #e2e8f0;">FEM Year</th>
                    <th style="padding:9px 12px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:900;text-transform:uppercase;text-align:left;border-bottom:2px solid #e2e8f0;">Status</th>
                    <th style="padding:9px 12px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:900;text-transform:uppercase;text-align:center;border-bottom:2px solid #e2e8f0;">Energy</th>
                    <th style="padding:9px 12px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:900;text-transform:uppercase;text-align:center;border-bottom:2px solid #e2e8f0;">Water</th>
                    <th style="padding:9px 12px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:900;text-transform:uppercase;text-align:center;border-bottom:2px solid #e2e8f0;">Waste</th>
                    <th style="padding:9px 12px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:900;text-transform:uppercase;text-align:center;border-bottom:2px solid #e2e8f0;">Air Emissions</th>
                    <th style="padding:9px 12px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:900;text-transform:uppercase;text-align:center;border-bottom:2px solid #e2e8f0;">Chemicals</th>
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>
    `;

    section.appendChild(title);
    section.appendChild(body);

    const productionSection = document.getElementById('production-section');
    if (productionSection && productionSection.parentNode) {
        productionSection.parentNode.insertBefore(section, productionSection);
    }
}

function getOverallSectionLevel(sectionKey, rows, year) {
    try {
        let result = null;

        if (sectionKey === 'energy' && typeof calculateEnergyPerformanceScore === 'function') {
            result = calculateEnergyPerformanceScore(rows, year);
        }

        if (sectionKey === 'water' && typeof calculateWaterPerformanceScore === 'function') {
            result = calculateWaterPerformanceScore(rows, year);
        }

        if (sectionKey === 'waste' && typeof calculateWastePerformanceScore === 'function') {
            result = calculateWastePerformanceScore(rows, year);
        }

        if (sectionKey === 'air' && typeof calculateAirPerformanceScore === 'function') {
            result = calculateAirPerformanceScore(rows, year);
        }

        if (sectionKey === 'chemicals' && typeof calculateChemicalPerformanceScore === 'function') {
            result = calculateChemicalPerformanceScore(rows, year);
        }

        if (!result || !result.levels) return null;

        if (result.levels.LV3) return 3;
        if (result.levels.LV2) return 2;
        if (result.levels.LV1) return 1;

        return 0;
    } catch (error) {
        return null;
    }
}

function renderOverallLevelBadge(level) {
    if (level === null || level === undefined) {
        return '<span style="display:inline-block;min-width:70px;padding:4px 10px;border-radius:999px;background:#f1f5f9;color:#94a3b8;font-size:11px;font-weight:850;">—</span>';
    }

    const config = {
        0: { label: 'Level 0', bg: '#f1f5f9', color: '#64748b' },
        1: { label: 'Level 1', bg: '#dbeafe', color: '#1d4ed8' },
        2: { label: 'Level 2', bg: '#dcfce7', color: '#166534' },
        3: { label: 'Level 3', bg: '#f3e8ff', color: '#7e22ce' },
    }[level];

    return `<span style="display:inline-block;min-width:70px;padding:4px 10px;border-radius:999px;background:${config.bg};color:${config.color};font-size:11px;font-weight:850;">${config.label}</span>`;
}
