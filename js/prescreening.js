let psSelectedHiggId = null;

const PS_COMMENT_PREFIX = 'ps_comment_v1';

const PS_PROD_COLS = [
    { label: 'Finished Product Assembler', col: 'annual_prod_vol_finalProductAssembly_amount', unitCol: 'annual_prod_vol_finalProductAssembly_unit', col2025: 'annual_prod_vol_finalProductAssembly_amount', unitCol2025: 'annual_prod_vol_finalProductAssembly_unit' },
    { label: 'Finished Product Processing (Printing/Painting/Embroidery...)', col: 'annual_prod_vol_printingProductDyeingAndLaundering_amount', unitCol: 'annual_prod_vol_printingProductDyeingAndLaundering_unit', col2025: 'annual_prod_vol_finishedProductProcessing_amount', unitCol2025: 'annual_prod_vol_finishedProductProcessing_unit', only2025: false },
    { label: 'Finished Product Processing (Dyeing/Laundering/Finishing)', col: null, unitCol: null, col2025: 'annual_prod_vol_printingProductDyeingAndLaundering_amount', unitCol2025: 'annual_prod_vol_printingProductDyeingAndLaundering_unit', only2025: true },
    { label: 'Material Production', col: 'annual_prod_vol_materialProduction_amount', unitCol: 'annual_prod_vol_materialProduction_unit', col2025: 'annual_prod_vol_materialProduction_amount', unitCol2025: 'annual_prod_vol_materialProduction_unit' },
    { label: 'Raw Material Processing', col: 'annual_prod_vol_rawMaterialProcessing_amount', unitCol: 'annual_prod_vol_rawMaterialProcessing_unit', col2025: 'annual_prod_vol_rawMaterialProcessing_amount', unitCol2025: 'annual_prod_vol_rawMaterialProcessing_unit' },
    { label: 'Raw Material Collection', col: 'annual_prod_vol_rawMaterialCollection_amount', unitCol: 'annual_prod_vol_rawMaterialCollection_unit', col2025: 'annual_prod_vol_rawMaterialCollection_amount', unitCol2025: 'annual_prod_vol_rawMaterialCollection_unit' },
    { label: 'Sub-Assembly Manufacturing', col: 'annual_prod_vol_hardComponentTrimProduction_amount', unitCol: 'annual_prod_vol_hardComponentTrimProduction_unit', col2025: 'annual_prod_vol_hardComponentTrimProduction_amount', unitCol2025: 'annual_prod_vol_hardComponentTrimProduction_unit' },
];

const ENERGY_NON_RENEWABLE = [
    { label: 'Purchased Electricity (MJ)', col: 'energy_electricpurch_mj' },
    { label: 'Purchased Steam (MJ)', col: 'energy_steampurch_mj' },
    { label: 'Purchased Chilled Water (MJ)', col: 'energy_chilledwater_mj' },
    { label: 'District Heating (MJ)', col: 'energy_heating_mj' },
    { label: 'Liquid Petroleum Gas (MJ)', col: 'energy_lpg_mj' },
    { label: 'Coal (MJ)', col: 'energy_coal_mj' },
    { label: 'Diesel (MJ)', col: 'energy_diesel_mj' },
    { label: 'Fuel Oil (MJ)', col: 'energy_fueloil_mj' },
    { label: 'Liquid Natural Gas (MJ)', col: 'energy_lng_mj' },
    { label: 'Natural Gas (MJ)', col: 'energy_naturalgas_mj' },
    { label: 'Petrol/Gasoline (MJ)', col: 'energy_petrol_mj' },
    { label: 'Propane (MJ)', col: 'energy_propane_mj' },
    { label: 'Compressed Natural Gas (MJ)', col: 'energy_CNG_mj' },
    { label: 'Coal-Water Slurry (MJ)', col: 'energy_coalwaterslurry_mj' },
    { label: 'Fabric Waste (MJ)', col: 'enery_fabricwaste_mj' },
    { label: 'Ethanol (MJ)', col: 'energy_ethanol_mj' },
    { label: 'Hydrogen (non-renewable source) (MJ)', col: 'energy_hydrogrenNR_mj' },
];

const ENERGY_RENEWABLE = [
    { label: 'Biodiesel (MJ)', col: 'energy_biodiesel_mj' },
    { label: 'Biogas (MJ)', col: 'energy_biogas_mj' },
    { label: 'Hydro (MJ)', col: 'energy_hydro_mj' },
    { label: 'Hydrogen (renewable source) (MJ)', col: 'energy_hydrogrenR_mj' },
    { label: 'Micro-Hydro (MJ)', col: 'energy_microhydro_mj' },
    { label: 'Purchased Renewable Electricity (MJ)', col: 'energy_purchrenewelec_mj' },
    { label: 'Purchased Renewables (MJ)', col: 'energy_purchrenew_mj' },
    { label: 'Solar Photovoltaic (MJ)', col: 'energy_solarphoto_mj' },
    { label: 'Solar Thermal (MJ)', col: 'energy_solarthermal_mj' },
    { label: 'Wind (MJ)', col: 'energy_wind_mj' },
    { label: 'Geothermal (MJ)', col: 'energy_geotherm_mj' },
];

const ENERGY_BIOMASS = [
    { label: 'Biomass - general (MJ)', col: 'energy_biomassgen_mj' },
    { label: 'Biomass - with certification (MJ)', col: 'energy_biomasscert_mj' },
    { label: 'Biomass - wood (MJ)', col: 'energy_biomasswood_mj' },
];

const PS_ENERGY_GROUPS = [
    { key: 'nonRenewable', label: 'Non-Renewable Energy', shortLabel: 'Non-Renewable', types: ENERGY_NON_RENEWABLE, color: '#ef4444', softBg: '#fff1f2', textColor: '#b91c1c' },
    { key: 'renewable', label: 'Renewable Energy', shortLabel: 'Renewable', types: ENERGY_RENEWABLE, color: '#22c55e', softBg: '#f0fdf4', textColor: '#15803d' },
    { key: 'biomass', label: 'Biomass Energy', shortLabel: 'Biomass', types: ENERGY_BIOMASS, color: '#a855f7', softBg: '#faf5ff', textColor: '#7e22ce' },
];

const PS_GHG_SOURCES = [
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

function getProdCol(pc, version) {
    if (pc.only2025 && version !== 'fem2025') return null;
    return version === 'fem2025' ? pc.col2025 : pc.col;
}

function getProdUnitCol(pc, version) {
    if (pc.only2025 && version !== 'fem2025') return null;
    return version === 'fem2025' ? pc.unitCol2025 : pc.unitCol;
}

function getPsFactories() {
    if (!appData.bulkperformance) return [];
    const seen = new Set();

    return appData.bulkperformance.filter(r => {
        if (seen.has(r.higg_id)) return false;
        seen.add(r.higg_id);
        return true;
    });
}

function getFemYearNumber(version) {
    const match = String(version ?? '').match(/\d{4}/);
    return match ? Number(match[0]) : 0;
}

function getPsDisplayYears(rows) {
    const years = [...new Set(rows.map(r => r.version).filter(Boolean))]
        .sort((a, b) => getFemYearNumber(a) - getFemYearNumber(b));

    const latest3 = years.slice(-3);

    while (latest3.length < 3) {
        latest3.unshift(null);
    }

    return latest3;
}

function selectPsFactory(higgId) {
    if (!appData.bulkperformance) return;

    psSelectedHiggId = String(higgId);
    const rows = appData.bulkperformance.filter(r => String(r.higg_id) === psSelectedHiggId);
    if (!rows.length) return;

    const base = rows[0];
    const last3 = getPsDisplayYears(rows);

    document.getElementById('psFactoryName').textContent = base.account_name || '—';
    document.getElementById('psHiggId').textContent = base.higg_id || '—';
    document.getElementById('psGroup').textContent = base.tags || '—';
    document.getElementById('psCountry').textContent = base.account_country || '—';
    document.getElementById('psSector').textContent = base.sector || '—';
    document.getElementById('psFactoryStrip').classList.add('show');

    const [y1, y2, y3] = last3;
    document.getElementById('ps-th-y1').textContent = y1 || '—';
    document.getElementById('ps-th-y2').textContent = y2 || '—';
    document.getElementById('ps-th-y3').textContent = y3 || '—';

    const ph = document.getElementById('ps-placeholder');
    if (ph) ph.style.display = 'none';

    const tableSection = document.getElementById('psTableSection');
    tableSection.classList.add('show');

    buildPsTable(rows, last3);
}

function buildPsTable(rows, years) {
    const [y1, y2, y3] = years;
    const getRow = y => y ? rows.find(r => r.version === y) : null;
    const r1 = getRow(y1), r2 = getRow(y2), r3 = getRow(y3);
    const yoyLabel = y2 ? `vs. ${y2}` : '';

    const container = document.getElementById('psTableBody');
    container.innerHTML = '';

    const topTable = document.createElement('table');
    topTable.className = 'ps-top-table';
    topTable.innerHTML = `
        <colgroup><col><col><col><col><col><col></colgroup>
        <thead>
            <tr>
                <th class="th-focus">Focus Area</th>
                <th class="th-y1">${y1 || '—'}</th>
                <th class="th-y2">${y2 || '—'}</th>
                <th class="th-y3">${y3 || '—'}</th>
                <th class="th-yoy">YoY Comparison<br><span style="font-size:9px;font-weight:400;opacity:0.8;">${yoyLabel}</span></th>
                <th class="th-comment">💬 Comments / Questions</th>
            </tr>
        </thead>
        <tbody id="psTopTbody"></tbody>`;
    container.appendChild(topTable);

    const topTbody = topTable.querySelector('#psTopTbody');
    let topHtml = '';
    let idx = 0;

    topHtml += `<tr class="ps-section-header ps-section-overall"><td colspan="6">Overall Factory Information</td></tr>`;
    topHtml += buildSimpleRow('Product Category', '', r1?.sector, r2?.sector, r3?.sector, 'text', y2, y3, idx++);
    topHtml += buildSimpleRow('Factory Group', '', r1?.tags, r2?.tags, r3?.tags, 'text', y2, y3, idx++);
    topHtml += buildSimpleRow('FEM Status', '', r1?.survey_status, r2?.survey_status, r3?.survey_status, 'status', y2, y3, idx++);

    topHtml += `<tr class="ps-section-header ps-section-production"><td colspan="6">Factory Production Information</td></tr>`;

    const fmtFT = row => {
        if (!row?.facility_type) return '<span style="color:#d1d5db;">—</span>';
        return row.facility_type.split(',').map(s => s.trim()).filter(Boolean).join(', ');
    };

    topHtml += `<tr>
        <td class="td-focus"><div class="ps-focus-label">Production Type</div></td>
        <td class="td-y1">${fmtFT(r1)}</td>
        <td class="td-y2">${fmtFT(r2)}</td>
        <td class="td-y3">${fmtFT(r3)}</td>
        <td class="td-yoy"><span style="color:#d1d5db;">—</span></td>
        <td class="td-comment"><input type="text" class="ps-comment-input" placeholder="Add comment..." id="ps-comment-${idx++}"></td>
    </tr>`;

    const getActiveCols = (row, version) => {
        if (!row) return [];
        return PS_PROD_COLS.filter(pc => {
            const col = getProdCol(pc, version);
            if (!col) return false;
            const v = parseFloat(row[col]);
            return !isNaN(v) && v > 0;
        });
    };

    const allLabels = [...new Set([
        ...getActiveCols(r1, y1).map(p => p.label),
        ...getActiveCols(r2, y2).map(p => p.label),
        ...getActiveCols(r3, y3).map(p => p.label),
    ])];

    const buildVolCell = (row, version) => {
        if (!row) return '<span style="color:#d1d5db;">—</span>';

        return allLabels.map(lbl => {
            const pc = PS_PROD_COLS.find(p => p.label === lbl);
            if (!pc) return '';

            const col = getProdCol(pc, version);
            const v = col ? parseFloat(row[col]) : NaN;
            const hasVal = !isNaN(v) && v > 0;

            return `<div class="ps-vol-line">
                <span class="ps-vol-sublabel">${lbl}</span>
                <span class="ps-vol-value">${hasVal ? v.toLocaleString() : '<span style="color:#d1d5db;">—</span>'}</span>
            </div>`;
        }).join('');
    };

    const buildVolYoy = () => {
        return allLabels.map(lbl => {
            const pc = PS_PROD_COLS.find(p => p.label === lbl);
            if (!pc) return `<div class="ps-vol-line"><span style="color:#d1d5db;">—</span></div>`;

            const col2 = r2 ? getProdCol(pc, y2) : null;
            const col3 = r3 ? getProdCol(pc, y3) : null;
            const v2 = col2 ? parseFloat(r2[col2]) : NaN;
            const v3 = col3 ? parseFloat(r3[col3]) : NaN;
            let s = '<span style="color:#d1d5db;">—</span>';

            if (!isNaN(v2) && v2 > 0 && !isNaN(v3) && v3 > 0) {
                const pct = ((v3 - v2) / v2) * 100;
                if (pct > 0) s = `<span class="trend-up">▲ +${pct.toFixed(1)}%</span>`;
                else if (pct < 0) s = `<span class="trend-down">▼ ${pct.toFixed(1)}%</span>`;
                else s = `<span class="trend-neutral">→ 0.0%</span>`;
            } else if (!isNaN(v3) && v3 > 0 && (isNaN(v2) || v2 === 0)) {
                s = `<span class="trend-up">🆕 New</span>`;
            }

            return `<div class="ps-vol-line" style="padding-top:14px;">${s}</div>`;
        }).join('');
    };

    const buildUomCell = (row, version) => {
        if (!row) return '<span style="color:#d1d5db;">—</span>';

        return allLabels.map(lbl => {
            const pc = PS_PROD_COLS.find(p => p.label === lbl);
            if (!pc) return '';

            const unitCol = getProdUnitCol(pc, version);
            const uom = unitCol ? (row[unitCol] || '—') : '—';

            return `<div class="ps-vol-line">
                <span class="ps-vol-sublabel">${lbl}</span>
                <span class="ps-vol-value">${uom}</span>
            </div>`;
        }).join('');
    };

    if (allLabels.length > 0) {
        topHtml += `<tr>
            <td class="td-focus"><div class="ps-focus-label">Production Volume</div></td>
            <td class="td-y1">${buildVolCell(r1, y1)}</td>
            <td class="td-y2">${buildVolCell(r2, y2)}</td>
            <td class="td-y3">${buildVolCell(r3, y3)}</td>
            <td class="td-yoy">${buildVolYoy()}</td>
            <td class="td-comment"><input type="text" class="ps-comment-input" placeholder="Add comment..." id="ps-comment-${idx++}"></td>
        </tr>
        <tr>
            <td class="td-focus"><div class="ps-focus-label">Unit of Measure (UOM)</div></td>
            <td class="td-y1">${buildUomCell(r1, y1)}</td>
            <td class="td-y2">${buildUomCell(r2, y2)}</td>
            <td class="td-y3">${buildUomCell(r3, y3)}</td>
            <td class="td-yoy"><span style="color:#d1d5db;">—</span></td>
            <td class="td-comment"><input type="text" class="ps-comment-input" placeholder="Add comment..." id="ps-comment-${idx++}"></td>
        </tr>`;
    } else {
        topHtml += `<tr>
            <td class="td-focus"><div class="ps-focus-label">Production Volume</div></td>
            <td class="td-y1" colspan="3" style="color:#d1d5db;text-align:center;">—</td>
            <td class="td-yoy"><span style="color:#d1d5db;">—</span></td>
            <td class="td-comment"><input type="text" class="ps-comment-input" placeholder="Add comment..." id="ps-comment-${idx++}"></td>
        </tr>
        <tr>
            <td class="td-focus"><div class="ps-focus-label">Unit of Measure (UOM)</div></td>
            <td class="td-y1" colspan="3" style="color:#d1d5db;text-align:center;">—</td>
            <td class="td-yoy"><span style="color:#d1d5db;">—</span></td>
            <td class="td-comment"><input type="text" class="ps-comment-input" placeholder="Add comment..." id="ps-comment-${idx++}"></td>
        </tr>`;
    }

    topHtml += buildPentlandTotalOrderRow(y1, y2, y3, idx++);

    topTbody.innerHTML = topHtml;

    const energySectionHeader = document.createElement('div');
    energySectionHeader.style.cssText = 'background:#3abeb7;color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding:8px 12px;margin-top:16px;border-radius:4px 4px 0 0;';
    energySectionHeader.textContent = 'Energy Profile Breakdown';
    container.appendChild(energySectionHeader);

    const energyTable = document.createElement('table');
    energyTable.className = 'ps-energy-table';
    energyTable.innerHTML = `
        <colgroup><col><col><col><col><col><col><col></colgroup>
        <thead>
            <tr>
                <th class="th-source">Energy Source</th>
                <th class="th-type">Energy Type</th>
                <th class="th-y1">${y1 || '—'}</th>
                <th class="th-y2">${y2 || '—'}</th>
                <th class="th-y3">${y3 || '—'}</th>
                <th class="th-yoy">YoY Comparision<br><span style="font-size:9px;font-weight:400;opacity:0.8;">${yoyLabel}</span></th>
                <th class="th-comment">💬 Comments / Questions</th>
            </tr>
        </thead>
        <tbody id="psEnergyTbody"></tbody>`;
    container.appendChild(energyTable);

    const energyTbody = energyTable.querySelector('#psEnergyTbody');
    let energyHtml = '';

    const groups = [
        { label: 'Non-Renewable Energy Sources', types: ENERGY_NON_RENEWABLE, totalLabel: 'TOTAL NON-RENEWABLE ENERGY CONSUMPTION (MJ)', bgColor: '#fff0f0', textColor: '#c0392b' },
        { label: 'Renewable Energy Sources', types: ENERGY_RENEWABLE, totalLabel: 'TOTAL RENEWABLE ENERGY CONSUMPTION (MJ)', bgColor: '#f0fff4', textColor: '#1a7a4a' },
        { label: 'Biomass Sources', types: ENERGY_BIOMASS, totalLabel: 'TOTAL BIOMASS ENERGY CONSUMPTION (MJ)', bgColor: '#f5f0ff', textColor: '#6d28d9' },
    ];

    groups.forEach(group => {
        let total1 = 0, total2 = 0, total3 = 0;
        let rowIdx = 0;

        group.types.forEach(et => {
            const val1 = getPsNumber(r1?.[et.col]);
            const val2 = getPsNumber(r2?.[et.col]);
            const val3 = getPsNumber(r3?.[et.col]);

            total1 += val1;
            total2 += val2;
            total3 += val3;

            let yoyHtml = '<span style="color:#d1d5db;">—</span>';
            if (val2 > 0 && val3 > 0) {
                const pct = ((val3 - val2) / val2) * 100;
                if (pct > 0) yoyHtml = `<span class="trend-up">▲ ${pct.toFixed(0)}%</span>`;
                else if (pct < 0) yoyHtml = `<span class="trend-down">▼ ${Math.abs(pct).toFixed(0)}%</span>`;
                else yoyHtml = `<span class="trend-neutral">→ 0%</span>`;
            } else if (val3 > 0 && val2 === 0) {
                yoyHtml = `<span class="trend-up">🆕 New</span>`;
            }

            const fmtV = v => v > 0
                ? v.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                : '<span style="color:#d1d5db;">—</span>';

            const sourceCell = rowIdx === 0
                ? `<td rowspan="${group.types.length}" class="td-source">${group.label}</td>`
                : '';

            energyHtml += `<tr>
                ${sourceCell}
                <td class="td-type">${et.label}</td>
                <td class="td-y1">${fmtV(val1)}</td>
                <td class="td-y2">${fmtV(val2)}</td>
                <td class="td-y3">${fmtV(val3)}</td>
                <td class="td-yoy">${yoyHtml}</td>
                <td class="td-comment"><input type="text" class="ps-comment-input" placeholder="Add comment..." id="energy-comment-${idx++}"></td>
            </tr>`;

            rowIdx++;
        });

        let totalYoy = '<span style="color:#d1d5db;">—</span>';
        if (total2 > 0 && total3 > 0) {
            const pct = ((total3 - total2) / total2) * 100;
            if (pct > 0) totalYoy = `<span class="trend-up">▲ ${pct.toFixed(0)}%</span>`;
            else if (pct < 0) totalYoy = `<span class="trend-down">▼ ${Math.abs(pct).toFixed(0)}%</span>`;
            else totalYoy = `<span class="trend-neutral">→ 0%</span>`;
        }

        const fmtTotal = v => v > 0
            ? v.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
            : '—';

        energyHtml += `<tr class="energy-total" style="background:${group.bgColor};">
            <td colspan="2" style="color:${group.textColor};">${group.totalLabel}</td>
            <td class="td-y1" style="text-align:right;font-weight:700;color:${group.textColor};background:${group.bgColor};">${fmtTotal(total1)}</td>
            <td class="td-y2" style="text-align:right;font-weight:700;color:${group.textColor};background:${group.bgColor};">${fmtTotal(total2)}</td>
            <td class="td-y3" style="text-align:right;font-weight:700;color:${group.textColor};background:${group.bgColor};">${fmtTotal(total3)}</td>
            <td class="td-yoy" style="background:${group.bgColor};">${totalYoy}</td>
            <td class="td-comment" style="background:${group.bgColor};"></td>
        </tr>`;
    });

    energyTbody.innerHTML = energyHtml;

    container.appendChild(buildPsEnergyOverviewSection(rows, years));
    container.appendChild(buildPsGhgOverviewSection(rows, years));

    setupPsCommentPersistence(container);
}

function buildPsEnergyOverviewSection(rows, years) {
    const latestYear = years[years.length - 1];
    const latestRow = rows.find(r => r.version === latestYear);

    const section = document.createElement('div');
    section.style.cssText = 'margin-top:18px;';

    const title = document.createElement('div');
    title.style.cssText = 'background:#0f766e;color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding:8px 12px;border-radius:4px 4px 0 0;';
    title.textContent = 'Energy Consumption Summary & Latest Year Mix';

    const body = document.createElement('div');
    body.style.cssText = 'background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;padding:16px;display:grid;grid-template-columns:360px 1fr;gap:18px;align-items:start;';

    const summary = document.createElement('div');
    summary.style.cssText = 'background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;';

    let summaryHtml = `
        <div style="font-size:11px;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:12px;">Last 3 FEM Years Energy Summary</div>
        <div style="display:flex;flex-direction:column;gap:10px;">`;

    years.forEach((year, i) => {
        const row = rows.find(r => r.version === year);
        const previousRow = i > 0 ? rows.find(r => r.version === years[i - 1]) : null;
        const groups = getPsEnergyGroupTotals(row);
        const total = getPsTotalEnergy(row, groups);
        const prevGroups = getPsEnergyGroupTotals(previousRow);
        const previousTotal = previousRow ? getPsTotalEnergy(previousRow, prevGroups) : 0;

        summaryHtml += `
            <div style="border:1px solid #e5e7eb;border-radius:9px;background:#fff;padding:12px;">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:8px;">
                    <div>
                        <div style="font-size:12px;font-weight:800;color:#111827;">${year}</div>
                        <div style="font-size:22px;font-weight:850;color:#0f172a;line-height:1.1;">${formatPsNumber(total)} <span style="font-size:11px;font-weight:600;color:#94a3b8;">MJ</span></div>
                    </div>
                    <div>${buildPsYoyBadge(total, previousTotal)}</div>
                </div>

                ${PS_ENERGY_GROUPS.map(g => {
                    const val = groups[g.key] || 0;
                    const pct = total > 0 ? (val / total) * 100 : 0;
                    return `
                        <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
                            <div style="width:9px;height:9px;border-radius:50%;background:${g.color};flex-shrink:0;"></div>
                            <div style="flex:1;font-size:11px;font-weight:700;color:#475569;">${g.shortLabel}</div>
                            <div style="font-size:11px;font-weight:800;color:${g.color};">${formatPsNumber(val)}</div>
                            <div style="font-size:10px;color:#94a3b8;width:38px;text-align:right;">${pct > 0 ? pct.toFixed(1) + '%' : '—'}</div>
                        </div>`;
                }).join('')}
            </div>`;
    });

    summaryHtml += '</div>';
    summary.innerHTML = summaryHtml;

    const chartsWrap = document.createElement('div');
    chartsWrap.style.cssText = 'display:grid;grid-template-columns:repeat(3,minmax(220px,1fr));gap:14px;';

    PS_ENERGY_GROUPS.forEach(group => {
        chartsWrap.appendChild(buildPsEnergyShareCard(group, latestRow, latestYear));
    });

    body.appendChild(summary);
    body.appendChild(chartsWrap);
    section.appendChild(title);
    section.appendChild(body);

    return section;
}

function buildPsEnergyShareCard(group, row, latestYear) {
    const card = document.createElement('div');
    card.style.cssText = 'border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;background:#fff;min-width:0;';

    const header = document.createElement('div');
    header.style.cssText = `background:${group.softBg};color:${group.textColor};font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;padding:10px 12px;border-bottom:1px solid #e5e7eb;`;
    header.textContent = `${group.label} Mix - ${latestYear || 'Latest FEM Year'}`;

    const body = document.createElement('div');
    body.style.cssText = 'padding:12px;';

    const items = group.types.map(item => ({
        label: item.label.replace(' (MJ)', ''),
        value: getPsNumber(row?.[item.col])
    })).filter(item => item.value > 0).sort((a, b) => b.value - a.value);

    const total = items.reduce((sum, item) => sum + item.value, 0);

    if (!items.length || total <= 0) {
        body.innerHTML = '<div style="padding:24px 8px;text-align:center;color:#9ca3af;font-size:12px;">No energy source reported</div>';
    } else {
        body.innerHTML = items.map((item, i) => {
            const pct = (item.value / total) * 100;
            return `
                <div style="margin-bottom:12px;">
                    <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:5px;">
                        <div style="width:21px;height:21px;border-radius:50%;background:${group.color};color:#fff;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i + 1}</div>
                        <div style="flex:1;min-width:0;">
                            <div style="font-size:12px;font-weight:700;color:#1f2937;line-height:1.25;">${item.label}</div>
                            <div style="font-size:10px;color:#94a3b8;margin-top:1px;">${formatPsNumber(item.value)} MJ</div>
                        </div>
                        <div style="font-size:12px;font-weight:850;color:${group.color};white-space:nowrap;">${pct.toFixed(1)}%</div>
                    </div>
                    <div style="height:9px;background:#f1f5f9;border-radius:999px;overflow:hidden;">
                        <div style="height:100%;width:${Math.min(pct, 100)}%;background:${group.color};border-radius:999px;"></div>
                    </div>
                </div>`;
        }).join('');
    }

    card.appendChild(header);
    card.appendChild(body);

    return card;
}

function buildPsGhgOverviewSection(rows, years) {
    const latestYear = years[years.length - 1];
    const latestRow = rows.find(r => String(r.version) === String(latestYear));
    const previousYear = years.length > 1 ? years[years.length - 2] : null;
    const previousRow = previousYear ? rows.find(r => String(r.version) === String(previousYear)) : null;

    const total = getPsNumber(latestRow?.total_ghg_kgco2e);
    const previousTotal = getPsNumber(previousRow?.total_ghg_kgco2e);
    const sourceValues = getPsGhgSourceValues(latestRow);

    const section = document.createElement('div');
    section.style.cssText = 'margin-top:18px;';

    const title = document.createElement('div');
    title.style.cssText = 'background:#7f1d1d;color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;padding:8px 12px;border-radius:4px 4px 0 0;';
    title.textContent = 'GHG Emissions Overview';

    const body = document.createElement('div');
    body.style.cssText = 'background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;padding:16px;display:grid;grid-template-columns:360px 1fr;gap:18px;align-items:start;';

    const left = document.createElement('div');
    left.style.cssText = 'display:flex;flex-direction:column;gap:14px;';

    left.innerHTML = `
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;">
            <div style="font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;">Total GHG Emissions</div>
            <div style="font-size:30px;font-weight:850;color:#111827;line-height:1;">${formatPsKgCO2e(total)}</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:4px;">kgCO2e in ${latestYear || 'latest FEM year'}</div>
            <div style="margin-top:14px;">${buildPsGhgYoyBadge(total, previousTotal)}</div>
        </div>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;">
            <div style="font-size:11px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;">Emission Sources</div>
            ${PS_GHG_SOURCES.map(source => {
                const value = sourceValues[source.key] || 0;
                return `
                    <div style="display:flex;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid #e2e8f0;">
                        <div style="width:10px;height:10px;border-radius:50%;background:${source.color};flex-shrink:0;"></div>
                        <div style="flex:1;font-size:12px;font-weight:800;color:#334155;">${source.label}</div>
                        <div style="font-size:14px;font-weight:850;color:${source.color};white-space:nowrap;">${formatPsKgCO2e(value)}</div>
                        <div style="font-size:10px;color:#94a3b8;white-space:nowrap;">kgCO2e</div>
                    </div>`;
            }).join('')}
        </div>
    `;

    const right = document.createElement('div');
    right.style.cssText = 'min-width:0;';

    const chartNote = document.createElement('div');
    chartNote.style.cssText = 'font-size:12px;color:#64748b;font-weight:700;margin-bottom:10px;';
    chartNote.textContent = 'Last 3 FEM Years';

    const canvas = document.createElement('canvas');
    canvas.height = 320;
    canvas.style.cssText = 'width:100%;display:block;';

    const legend = document.createElement('div');
    legend.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;margin-top:12px;justify-content:center;';

    right.appendChild(chartNote);
    right.appendChild(canvas);
    right.appendChild(legend);

    body.appendChild(left);
    body.appendChild(right);
    section.appendChild(title);
    section.appendChild(body);

    const redrawGhgChart = () => {
        const parent = canvas.parentElement;
        const rectWidth = parent ? parent.getBoundingClientRect().width : 0;
        const safeWidth = Math.max(Math.floor(rectWidth), 900);

        canvas.width = safeWidth;
        canvas.height = 320;

        drawPsGhgStackedChart(canvas, legend, rows, years);
    };

    requestAnimationFrame(() => {
        requestAnimationFrame(redrawGhgChart);
    });

    setTimeout(redrawGhgChart, 300);

    return section;
}

function drawPsGhgStackedChart(canvas, legendEl, rows, years) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    const padL = 78;
    const padR = 24;
    const padT = 28;
    const padB = 54;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const sourceData = PS_GHG_SOURCES.map(source => ({
        ...source,
        values: years.map(year => {
            const row = rows.find(r => String(r.version) === String(year));
            const values = getPsGhgSourceValues(row);
            return values[source.key] || 0;
        })
    }));

    const hasData = sourceData.some(source => source.values.some(v => v > 0));

    if (!hasData) {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '13px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No GHG emissions data available', W / 2, H / 2);
        legendEl.innerHTML = '';
        return;
    }

    const stackedTotals = years.map((_, yi) =>
        sourceData.reduce((sum, source) => sum + source.values[yi], 0)
    );

    const maxVal = Math.max(...stackedTotals) * 1.18 || 1;
    const barGap = chartW / years.length;
    const barW = Math.min(70, barGap * 0.45);

    for (let i = 0; i <= 5; i++) {
        const y = padT + chartH - (i / 5) * chartH;
        const value = maxVal * i / 5;

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
        ctx.fillText(formatPsKgCO2e(value), padL - 8, y);
    }

    years.forEach((year, yi) => {
        const barX = padL + yi * barGap + (barGap - barW) / 2;
        let baseY = padT + chartH;

        sourceData.forEach(source => {
            const value = source.values[yi];
            if (value <= 0) return;

            const barH = Math.max((value / maxVal) * chartH, 3);
            baseY -= barH;

            ctx.fillStyle = source.color;
            ctx.globalAlpha = 0.88;
            ctx.fillRect(barX, baseY, barW, barH);
            ctx.globalAlpha = 1;

            const label = formatPsKgCO2e(value);
            ctx.font = 'bold 9px Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (barH >= 18) {
                ctx.fillStyle = '#fff';
                ctx.fillText(label, barX + barW / 2, baseY + barH / 2);
            } else {
                ctx.fillStyle = source.color;
                ctx.fillText(label, barX + barW / 2, baseY - 7);
            }
        });

        ctx.fillStyle = '#334155';
        ctx.font = 'bold 11px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(year, barX + barW / 2, padT + chartH + 9);
    });

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + chartH);
    ctx.lineTo(padL + chartW, padT + chartH);
    ctx.stroke();

    legendEl.innerHTML = PS_GHG_SOURCES.map(source => `
        <div style="display:flex;align-items:center;gap:6px;">
            <div style="width:12px;height:12px;border-radius:3px;background:${source.color};flex-shrink:0;"></div>
            <span style="font-size:12px;color:#374151;font-weight:800;">${source.label}</span>
        </div>
    `).join('');
}

function getPsEnergyGroupTotals(row) {
    const totals = { nonRenewable: 0, renewable: 0, biomass: 0 };
    if (!row) return totals;

    PS_ENERGY_GROUPS.forEach(group => {
        totals[group.key] = group.types.reduce((sum, item) => sum + getPsNumber(row[item.col]), 0);
    });

    return totals;
}

function getPsTotalEnergy(row, groupTotals) {
    const reportedTotal = getPsNumber(row?.total_energy_mj);
    const calculatedTotal = Object.values(groupTotals || {}).reduce((sum, val) => sum + val, 0);
    return reportedTotal > 0 ? reportedTotal : calculatedTotal;
}

function getPsGhgSourceValues(row) {
    return {
        nonRenewable: getPsValueByCols(row, PS_GHG_SOURCES[0].cols),
        refrigerants: getPsValueByCols(row, PS_GHG_SOURCES[1].cols),
    };
}

function getPsValueByCols(row, cols) {
    if (!row) return 0;

    for (const col of cols) {
        if (Object.prototype.hasOwnProperty.call(row, col)) {
            return getPsNumber(row[col]);
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
        if (actualKey) return getPsNumber(row[actualKey]);
    }

    return 0;
}

function getPsNumber(value) {
    const n = parseFloat(String(value ?? '').replace(/,/g, ''));
    return !isNaN(n) && n > 0 ? n : 0;
}

function formatPsNumber(value) {
    const n = getPsNumber(value);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n > 0 ? n.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '—';
}

function formatPsKgCO2e(value) {
    const n = getPsNumber(value);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n > 0 ? n.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '0';
}

function buildPsYoyBadge(current, previous) {
    if (!previous || previous <= 0 || !current) {
        return '<span style="font-size:10px;color:#cbd5e1;font-weight:700;">—</span>';
    }

    const pct = ((current - previous) / previous) * 100;

    if (pct > 0) {
        return `<span style="display:inline-flex;align-items:center;gap:3px;color:#ef4444;background:#fee2e2;border-radius:999px;padding:3px 7px;font-size:10px;font-weight:850;">▲ ${pct.toFixed(1)}%</span>`;
    }

    if (pct < 0) {
        return `<span style="display:inline-flex;align-items:center;gap:3px;color:#16a34a;background:#dcfce7;border-radius:999px;padding:3px 7px;font-size:10px;font-weight:850;">▼ ${Math.abs(pct).toFixed(1)}%</span>`;
    }

    return '<span style="display:inline-flex;align-items:center;gap:3px;color:#64748b;background:#f1f5f9;border-radius:999px;padding:3px 7px;font-size:10px;font-weight:850;">→ 0.0%</span>';
}

function buildPsGhgYoyBadge(current, previous) {
    if (!previous || previous <= 0 || !current) {
        return '<span style="font-size:11px;color:#cbd5e1;font-weight:700;">No previous year comparison</span>';
    }

    const pct = ((current - previous) / previous) * 100;

    if (pct > 0) {
        return `<span style="font-size:20px;font-weight:850;color:#ef4444;">▲ ${pct.toFixed(1)}%</span>
            <span style="font-size:11px;font-weight:700;color:#64748b;margin-left:6px;">increase vs previous FEM year</span>`;
    }

    if (pct < 0) {
        return `<span style="font-size:20px;font-weight:850;color:#16a34a;">▼ ${Math.abs(pct).toFixed(1)}%</span>
            <span style="font-size:11px;font-weight:700;color:#64748b;margin-left:6px;">decrease vs previous FEM year</span>`;
    }

    return `<span style="font-size:20px;font-weight:850;color:#64748b;">→ 0.0%</span>
        <span style="font-size:11px;font-weight:700;color:#64748b;margin-left:6px;">no change vs previous FEM year</span>`;
}

function buildSimpleRow(label, sub, v1, v2, v3, type, y2, y3, idx) {
    let yoyHtml = '<span style="color:#d1d5db;">—</span>';

    if (type === 'number' && v2 !== null && v3 !== null && v2 > 0) {
        const pct = ((v3 - v2) / v2) * 100;
        if (pct > 0) yoyHtml = `<span class="trend-up">▲ +${pct.toFixed(1)}%</span>`;
        else if (pct < 0) yoyHtml = `<span class="trend-down">▼ ${pct.toFixed(1)}%</span>`;
        else yoyHtml = `<span class="trend-neutral">→ 0.0%</span>`;
    }

    const fmtVal = v => {
        if (v === null || v === undefined || v === '') return '<span style="color:#d1d5db;">—</span>';
        if (type === 'number') return `<strong>${Number(v).toLocaleString()}</strong>`;
        if (type === 'status') return `<span class="status-badge ${getStatusClass(v)}">${v}</span>`;
        return `<span style="font-size:13px;">${v}</span>`;
    };

    return `<tr>
        <td class="td-focus">
            <div class="ps-focus-label">${label}</div>
            ${sub ? `<div class="ps-focus-sub">${sub}</div>` : ''}
        </td>
        <td class="td-y1">${fmtVal(v1)}</td>
        <td class="td-y2">${fmtVal(v2)}</td>
        <td class="td-y3">${fmtVal(v3)}</td>
        <td class="td-yoy">${yoyHtml}</td>
        <td class="td-comment"><input type="text" class="ps-comment-input" placeholder="Add comment..." id="ps-comment-${idx}"></td>
    </tr>`;
}

function getPsCommentKey(inputId) {
    return `${PS_COMMENT_PREFIX}_${psSelectedHiggId || 'no-factory'}_${inputId}`;
}

function setupPsCommentPersistence(scopeEl) {
    if (!scopeEl || !psSelectedHiggId) return;

    const inputs = scopeEl.querySelectorAll('.ps-comment-input');

    inputs.forEach(input => {
        if (!input.id) return;

        const saved = localStorage.getItem(getPsCommentKey(input.id));
        input.value = saved || '';

        input.addEventListener('input', () => {
            localStorage.setItem(getPsCommentKey(input.id), input.value);
        });
    });
}

async function downloadPreScreeningPdf() {
    if (typeof html2pdf === 'undefined') {
        alert('PDF library is not loaded yet. Please add html2pdf.js in index.html.');
        return;
    }

    const page = document.getElementById('page-prescreening');
    if (!page) return;

    const activeEl = document.activeElement;
    if (activeEl && typeof activeEl.blur === 'function') activeEl.blur();

    const clone = page.cloneNode(true);

    clone.querySelectorAll('input, textarea').forEach((clonedInput, i) => {
        const originalInput = page.querySelectorAll('input, textarea')[i];

        const valueBox = document.createElement('div');
        valueBox.className = 'ps-pdf-comment-value';
        valueBox.textContent = originalInput?.value || '';

        clonedInput.replaceWith(valueBox);
    });

    clone.querySelectorAll('canvas').forEach((clonedCanvas, i) => {
        const originalCanvas = page.querySelectorAll('canvas')[i];
        if (!originalCanvas) return;

        try {
            const img = document.createElement('img');
            img.src = originalCanvas.toDataURL('image/png');
            img.style.width = '100%';
            img.style.maxWidth = '100%';
            img.style.display = 'block';
            clonedCanvas.replaceWith(img);
        } catch (e) {}
    });

    const exportWidth = Math.max(page.scrollWidth + 220, 2300);

    const exportRoot = document.createElement('div');
    exportRoot.id = 'ps-pdf-export-root';
    exportRoot.style.cssText = `
        position: absolute;
        left: 0;
        top: 0;
        width: ${exportWidth}px;
        min-width: ${exportWidth}px;
        background: #f5f6fa;
        padding: 40px 90px 40px 90px;
        z-index: 999999;
        box-sizing: border-box;
        display: block;
        visibility: visible;
    `;

    clone.style.cssText = `
        display: block !important;
        width: ${exportWidth - 180}px !important;
        max-width: none !important;
        overflow: visible !important;
        background: #f5f6fa !important;
        margin: 0 !important;
        padding: 0 !important;
    `;

    exportRoot.appendChild(clone);
    document.body.appendChild(exportRoot);
    document.body.classList.add('ps-pdf-exporting');

    await new Promise(resolve => setTimeout(resolve, 800));

    const factoryName = document.getElementById('psFactoryName')?.textContent?.trim() || 'factory';
    const safeFactoryName = factoryName.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '-');

    const opt = {
        margin: [6, 6, 6, 6],
        filename: `pre-screening-${safeFactoryName}-${psSelectedHiggId || 'factory'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 1.15,
            useCORS: true,
            backgroundColor: '#ffffff',
            x: 0,
            y: 0,
            scrollX: 0,
            scrollY: 0,
            windowWidth: exportWidth,
            width: exportWidth,
            height: exportRoot.scrollHeight
        },
        jsPDF: {
            unit: 'mm',
            format: [841, 594],
            orientation: 'landscape'
        },
        pagebreak: {
            mode: ['css', 'legacy']
        }
    };

    try {
        await html2pdf().set(opt).from(exportRoot).save();
    } catch (err) {
        console.error(err);
        alert('PDF export failed. Please open Console for details.');
    } finally {
        exportRoot.remove();
        document.body.classList.remove('ps-pdf-exporting');
    }
}

function clearPsSelection() {
    psSelectedHiggId = null;

    const strip = document.getElementById('psFactoryStrip');
    const table = document.getElementById('psTableSection');
    const ph = document.getElementById('ps-placeholder');

    if (strip) strip.classList.remove('show');
    if (table) table.classList.remove('show');
    if (ph) ph.style.display = 'block';
}

function buildPentlandTotalOrderRow(y1, y2, y3, idx) {
    const v1 = getPentlandTotalOrder(y1);
    const v2 = getPentlandTotalOrder(y2);
    const v3 = getPentlandTotalOrder(y3);

    let yoyHtml = '<span style="color:#d1d5db;">—</span>';

    if (v2 > 0 && v3 > 0) {
        const pct = ((v3 - v2) / v2) * 100;

        if (pct > 0) {
            yoyHtml = `<span class="trend-up">▲ +${pct.toFixed(1)}%</span>`;
        } else if (pct < 0) {
            yoyHtml = `<span class="trend-down">▼ ${pct.toFixed(1)}%</span>`;
        } else {
            yoyHtml = `<span class="trend-neutral">→ 0.0%</span>`;
        }
    } else if (v3 > 0 && v2 === 0) {
        yoyHtml = `<span class="trend-up">🆕 New</span>`;
    }

    const fmtVal = v => v > 0
        ? `<strong>${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>`
        : '<span style="color:#d1d5db;">—</span>';

    return `<tr>
        <td class="td-focus">
            <div class="ps-focus-label">Pentland Total Order</div>
            <div class="ps-focus-sub">From production_volume.csv</div>
        </td>
        <td class="td-y1">${fmtVal(v1)}</td>
        <td class="td-y2">${fmtVal(v2)}</td>
        <td class="td-y3">${fmtVal(v3)}</td>
        <td class="td-yoy">${yoyHtml}</td>
        <td class="td-comment">
            <input type="text" class="ps-comment-input" placeholder="Add comment..." id="ps-comment-${idx}">
        </td>
    </tr>`;
}

function getPentlandTotalOrder(version) {
    if (!version || !psSelectedHiggId || !appData.production_volume) return 0;

    const row = appData.production_volume.find(r => {
        const rowHiggId = getFlexibleFieldValue(r, ['higg_id', 'higgid', 'higg id']);
        const rowVersion = getFlexibleFieldValue(r, ['version', 'fem_version', 'fem year', 'fem_year', 'year']);

        return normalizeMatchValue(rowHiggId) === normalizeMatchValue(psSelectedHiggId) &&
            normalizeVersionValue(rowVersion) === normalizeVersionValue(version);
    });

    if (!row) return 0;

    return getPsNumber(getFlexibleFieldValue(row, ['total_pentland_order']));
}

function getFlexibleFieldValue(row, possibleKeys) {
    if (!row) return '';

    for (const key of possibleKeys) {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
            return row[key];
        }
    }

    const normalizedMap = Object.keys(row).reduce((map, actualKey) => {
        const normalized = String(actualKey).toLowerCase().replace(/[^a-z0-9]+/g, '');
        map[normalized] = actualKey;
        return map;
    }, {});

    for (const key of possibleKeys) {
        const normalized = String(key).toLowerCase().replace(/[^a-z0-9]+/g, '');
        const actualKey = normalizedMap[normalized];

        if (actualKey) return row[actualKey];
    }

    return '';
}

function normalizeMatchValue(value) {
    return String(value ?? '')
        .trim()
        .replace(/\.0$/, '')
        .toLowerCase();
}

function normalizeVersionValue(value) {
    const text = String(value ?? '').trim().toLowerCase();
    const year = text.match(/\d{4}/);

    return year ? `fem${year[0]}` : text;
}
