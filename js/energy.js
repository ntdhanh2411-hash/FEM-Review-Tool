// Non-Renewable=RED, Renewable=GREEN, Biomass=PURPLE
const ENERGY_GROUPS = [
    { key: 'nr', label: 'Non-Renewable', cols: [
        { label: 'Purchased Electricity', col: 'energy_electricpurch_mj' },
        { label: 'Purchased Steam', col: 'energy_steampurch_mj' },
        { label: 'Purchased Chilled Water', col: 'energy_chilledwater_mj' },
        { label: 'District Heating', col: 'energy_heating_mj' },
        { label: 'Liquid Petroleum Gas', col: 'energy_lpg_mj' },
        { label: 'Coal', col: 'energy_coal_mj' },
        { label: 'Diesel', col: 'energy_diesel_mj' },
        { label: 'Fuel Oil', col: 'energy_fueloil_mj' },
        { label: 'Liquid Natural Gas', col: 'energy_lng_mj' },
        { label: 'Natural Gas', col: 'energy_naturalgas_mj' },
        { label: 'Petrol/Gasoline', col: 'energy_petrol_mj' },
        { label: 'Propane', col: 'energy_propane_mj' },
        { label: 'Compressed Natural Gas', col: 'energy_CNG_mj' },
        { label: 'Coal-Water Slurry', col: 'energy_coalwaterslurry_mj' },
        { label: 'Fabric Waste', col: 'enery_fabricwaste_mj' },
        { label: 'Ethanol', col: 'energy_ethanol_mj' },
        { label: 'Hydrogen (non-renewable)', col: 'energy_hydrogrenNR_mj' },
    ], color: '#ef4444' },
    { key: 'r', label: 'Renewable', cols: [
        { label: 'Biodiesel', col: 'energy_biodiesel_mj' },
        { label: 'Biogas', col: 'energy_biogas_mj' },
        { label: 'Hydro', col: 'energy_hydro_mj' },
        { label: 'Hydrogen (renewable)', col: 'energy_hydrogrenR_mj' },
        { label: 'Micro-Hydro', col: 'energy_microhydro_mj' },
        { label: 'Purchased Renewable Electricity', col: 'energy_purchrenewelec_mj' },
        { label: 'Purchased Renewables', col: 'energy_purchrenew_mj' },
        { label: 'Solar Photovoltaic', col: 'energy_solarphoto_mj' },
        { label: 'Solar Thermal', col: 'energy_solarthermal_mj' },
        { label: 'Wind', col: 'energy_wind_mj' },
        { label: 'Geothermal', col: 'energy_geotherm_mj' },
    ], color: '#22c55e' },
    { key: 'b', label: 'Biomass', cols: [
        { label: 'Biomass - General', col: 'energy_biomassgen_mj' },
        { label: 'Biomass - With Certification', col: 'energy_biomasscert_mj' },
        { label: 'Biomass - Wood', col: 'energy_biomasswood_mj' },
    ], color: '#a855f7' },
];

const PURPOSE_ITEMS = [
    { key: 'production', label: 'Production', color: '#3b82f6' },
    { key: 'domestic', label: 'Domestic', color: '#f59e0b' },
    { key: 'vehicle', label: 'Vehicle', color: '#8b5cf6' },
];

const GHG_SOURCES = [
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

function parseEnergyValue(value) {
    const n = parseFloat(String(value ?? '').replace(/,/g, ''));
    return !isNaN(n) && n > 0 ? n : 0;
}

function getEnergyValueByCols(row, cols) {
    if (!row) return 0;

    for (const col of cols) {
        if (Object.prototype.hasOwnProperty.call(row, col)) {
            return parseEnergyValue(row[col]);
        }
    }

    const normalizedCols = Object.keys(row).reduce((map, key) => {
        const normalized = String(key).toLowerCase().replace(/[^a-z0-9]+/g, '');
        map[normalized] = key;
        return map;
    }, {});

    for (const col of cols) {
        const normalized = String(col).toLowerCase().replace(/[^a-z0-9]+/g, '');
        const actualKey = normalizedCols[normalized];

        if (actualKey) return parseEnergyValue(row[actualKey]);
    }

    return 0;
}

function formatMJ(val) {
    if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
    if (val >= 1_000) return (val / 1_000).toFixed(1) + 'K';
    return val.toFixed(0);
}

function formatKgCO2e(val) {
    const n = parseEnergyValue(val);
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function sortFemYears(years) {
    return [...years].sort((a, b) => {
        const ay = Number(String(a).replace(/\D/g, ''));
        const by = Number(String(b).replace(/\D/g, ''));
        return ay - by;
    });
}

function getCurrentEnergyHiggId() {
    const energyHiggId = document.getElementById('energy-higgid')?.textContent;
    if (energyHiggId && energyHiggId !== '-' && energyHiggId !== '—') return energyHiggId;

    if (typeof selectedHiggId !== 'undefined' && selectedHiggId) return selectedHiggId;
    if (typeof currentHiggId !== 'undefined' && currentHiggId) return currentHiggId;
    if (typeof selectedFactoryHiggId !== 'undefined' && selectedFactoryHiggId) return selectedFactoryHiggId;

    return null;
}

function drawDonutChart(canvas, slices, total, centerLine1, centerLine2) {
    if (!canvas) return;

    const validSlices = slices.filter(s => Number(s.value) > 0);
    const safeTotal = validSlices.reduce((sum, s) => sum + Number(s.value || 0), 0);

    const w = canvas.width;
    const h = canvas.height;

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    if (!validSlices.length || safeTotal <= 0) {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '13px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No data', w / 2, h / 2);
        return;
    }

    const cx = w / 2;
    const cy = h / 2;
    const outerR = Math.min(w, h) / 2 - 10;
    const innerR = outerR * 0.58;
    let startAngle = -Math.PI / 2;

    validSlices.forEach(s => {
        const sliceAngle = (s.value / safeTotal) * 2 * Math.PI;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.arc(cx, cy, outerR, startAngle, endAngle);
        ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = s.color;
        ctx.fill();

        if (validSlices.length > 1) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        startAngle = endAngle;
    });

    ctx.fillStyle = '#1a1f2e';
    ctx.font = `bold ${Math.round(w * 0.058)}px Segoe UI, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(centerLine1, cx, cy - h * 0.04);
    ctx.fillText(centerLine2, cx, cy + h * 0.04);
}

function getGhgTotal(row) {
    return parseEnergyValue(row?.['total_ghg_kgco2e']);
}

function getGhgSourceValues(row) {
    return {
        nonRenewable: getEnergyValueByCols(row, GHG_SOURCES[0].cols),
        refrigerants: getEnergyValueByCols(row, GHG_SOURCES[1].cols),
    };
}

function getPreviousYearRow(rows, years, selectedYear) {
    const selectedIndex = years.findIndex(y => String(y) === String(selectedYear));
    if (selectedIndex <= 0) return null;

    const previousYear = years[selectedIndex - 1];
    return rows.find(r => String(r.version) === String(previousYear)) || null;
}

function buildGhgChangeBadge(currentTotal, previousTotal) {
    if (!previousTotal || previousTotal <= 0 || !currentTotal) {
        return '<span style="color:#9ca3af;font-size:13px;font-weight:600;">No previous year comparison</span>';
    }

    const pct = ((currentTotal - previousTotal) / previousTotal) * 100;
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

function getCarbonIntensity(row) {
    const totalGhg = getGhgTotal(row);
    const refrigerantGhg = getEnergyValueByCols(row, GHG_SOURCES[1].cols);
    const totalEnergy = parseEnergyValue(row?.total_energy_mj);

    if (!totalEnergy || totalEnergy <= 0) return null;

    return (totalGhg - refrigerantGhg) / totalEnergy;
}

function getPcPairProductionCarbonIntensity(row) {
    const facilityType = String(row?.facility_type || '').toLowerCase();
    const isFinishedProductAssembler = facilityType.includes('finished product assembler');

    if (!isFinishedProductAssembler) return null;

    const ghg = parseEnergyValue(row?.total_finalProductAssembly_ghg_kgco2e);
    const productionVolume = parseEnergyValue(row?.annual_prod_vol_finalProductAssembly_amount);

    if (!productionVolume || productionVolume <= 0) return null;

    return ghg / productionVolume;
}

function formatKpiValue(value, unit) {
    if (value === null || value === undefined || !isFinite(value)) return 'N/A';
    return `${value.toFixed(5)} <span style="font-size:13px;font-weight:600;color:#94a3b8;">${unit}</span>`;
}

function buildKpiChangeBadge(currentValue, previousValue) {
    if (
        currentValue === null ||
        currentValue === undefined ||
        previousValue === null ||
        previousValue === undefined ||
        !previousValue ||
        previousValue <= 0
    ) {
        return '<span style="color:#9ca3af;font-size:13px;font-weight:700;">No previous year comparison</span>';
    }

    const pct = ((currentValue - previousValue) / previousValue) * 100;
    const color = pct > 0 ? '#ef4444' : pct < 0 ? '#16a34a' : '#64748b';
    const arrow = pct > 0 ? '▲' : pct < 0 ? '▼' : '→';
    const wording = pct > 0 ? 'increase' : pct < 0 ? 'decrease' : 'no change';

    return `
        <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-top:14px;">
            <span style="font-size:22px;font-weight:850;color:${color};">${arrow} ${Math.abs(pct).toFixed(1)}%</span>
            <span style="font-size:12px;font-weight:700;color:#64748b;">${wording} vs previous FEM year</span>
        </div>
    `;
}

function renderDecarbonizationKpis(rows, years, selectedYear) {
    const row = rows.find(r => String(r.version) === String(selectedYear));
    if (!row) return document.createElement('div');

    const sortedYears = sortFemYears(years);
    const previousRow = getPreviousYearRow(rows, sortedYears, selectedYear);

    const carbonIntensity = getCarbonIntensity(row);
    const previousCarbonIntensity = previousRow ? getCarbonIntensity(previousRow) : null;

    const pcPairIntensity = getPcPairProductionCarbonIntensity(row);
    const previousPcPairIntensity = previousRow ? getPcPairProductionCarbonIntensity(previousRow) : null;

    const section = document.createElement('div');
    section.id = 'decarbonization-kpis-wrap';
    section.style.cssText = 'margin-top:24px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:#14532d;padding:9px 16px;border-radius:6px 6px 0 0;';
    title.textContent = 'DECARBONIZATION KPI';

    const grid = document.createElement('div');
    grid.style.cssText = 'background:#fff;border-radius:0 0 14px 14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:24px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;align-items:stretch;';

    const carbonCard = document.createElement('div');
    carbonCard.style.cssText = 'background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;display:flex;flex-direction:column;min-height:220px;';
    carbonCard.innerHTML = `
        <div style="font-size:16px;font-weight:850;color:#111827;margin-bottom:10px;">Carbon Intensity</div>
        <div style="font-size:13px;line-height:1.55;color:#64748b;margin-bottom:18px;">
            A measure of how many kilograms of carbon dioxide equivalent are released per one megajoule of energy consumed. This metric allows organizations to interpret their footprint
        </div>
        <div style="margin-top:auto;">
            <div style="font-size:32px;font-weight:850;color:#111827;line-height:1;">
                ${formatKpiValue(carbonIntensity, 'kgCO2e/MJ')}
            </div>
            <div style="font-size:12px;color:#94a3b8;margin-top:5px;">in ${selectedYear}</div>
            ${buildKpiChangeBadge(carbonIntensity, previousCarbonIntensity)}
        </div>
    `;

    const pcPairCard = document.createElement('div');
    pcPairCard.style.cssText = 'background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;display:flex;flex-direction:column;min-height:220px;';
    pcPairCard.innerHTML = `
        <div style="font-size:16px;font-weight:850;color:#111827;margin-bottom:10px;">Pc-Pair Production Carbon Intensity</div>
        <div style="font-size:13px;line-height:1.55;color:#64748b;margin-bottom:18px;">
            The emissions from a facility normalized by production volume in pieces/pairs. This metric only captures emissions from facilities that report production volume in pieces/pairs (reffered to as "Final Product Assembly")
        </div>
        <div style="margin-top:auto;">
            <div style="font-size:32px;font-weight:850;color:#111827;line-height:1;">
                ${formatKpiValue(pcPairIntensity, 'kgCO2e/pc-pair')}
            </div>
            <div style="font-size:12px;color:#94a3b8;margin-top:5px;">
                ${pcPairIntensity === null ? 'Only applies to Finished Product Assembler facilities' : `in ${selectedYear}`}
            </div>
            ${buildKpiChangeBadge(pcPairIntensity, previousPcPairIntensity)}
        </div>
    `;

    grid.appendChild(carbonCard);
    grid.appendChild(pcPairCard);
    section.appendChild(title);
    section.appendChild(grid);

    return section;
}

function updateEnergyContent(rows, years, selectedYear) {
    const row = rows.find(r => String(r.version) === String(selectedYear));
    if (!row) return;

    const existing = document.getElementById('energy-content-wrap');
    if (existing) existing.remove();

    const placeholder = document.getElementById('energy-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    const wrap = document.createElement('div');
    wrap.id = 'energy-content-wrap';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:#c2410c;padding:9px 16px;border-radius:6px 6px 0 0;';
    title.textContent = 'ENERGY PROFILE OVERVIEW';
    wrap.appendChild(title);

    const groupTotals = { nr: 0, r: 0, b: 0 };

    ENERGY_GROUPS.forEach(g => {
        g.cols.forEach(c => {
            groupTotals[g.key] += parseEnergyValue(row[c.col]);
        });
    });

    const calcTotal = groupTotals.nr + groupTotals.r + groupTotals.b;
    const totalEnergy = parseEnergyValue(row.total_energy_mj);
    const baseTotal = calcTotal > 0 ? calcTotal : totalEnergy;

    const allTypes = [];
    ENERGY_GROUPS.forEach(g => {
        g.cols.forEach(c => {
            const v = parseEnergyValue(row[c.col]);
            if (v > 0) allTypes.push({ label: c.label, value: v, group: g.label, color: g.color });
        });
    });

    allTypes.sort((a, b) => b.value - a.value);

    const fmtNum = v => v > 0
        ? v.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
        : '-';

    const fmtPct = v => v > 0 ? v.toFixed(1) + '%' : '-';

    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:0 0 14px 14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:24px;margin-bottom:24px;display:flex;gap:32px;align-items:flex-start;';

    const tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'flex:1.4;min-width:0;overflow-x:auto;';

    let tableHtml = `<table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr>
        <th style="padding:8px 10px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:700;text-transform:uppercase;border-bottom:2px solid #e2e8f0;border-right:1px solid #e2e8f0;text-align:center;width:48px;">Rank</th>
        <th style="padding:8px 10px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:700;text-transform:uppercase;border-bottom:2px solid #e2e8f0;border-right:1px solid #e2e8f0;text-align:left;">Energy Type</th>
        <th style="padding:8px 10px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:700;text-transform:uppercase;border-bottom:2px solid #e2e8f0;border-right:1px solid #e2e8f0;text-align:right;">Consumption (MJ)</th>
        <th style="padding:8px 10px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:700;text-transform:uppercase;border-bottom:2px solid #e2e8f0;border-right:1px solid #e2e8f0;text-align:right;width:70px;">% Share</th>
        <th style="padding:8px 10px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:700;text-transform:uppercase;border-bottom:2px solid #e2e8f0;text-align:left;min-width:120px;">Distribution</th>
    </tr></thead><tbody>`;

    allTypes.forEach((et, i) => {
        const pct = baseTotal > 0 ? (et.value / baseTotal) * 100 : 0;

        tableHtml += `<tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'};">
            <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;border-right:1px solid #e2e8f0;text-align:center;">
                <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:${et.color};color:#fff;font-size:11px;font-weight:700;">${i + 1}</span>
            </td>
            <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;border-right:1px solid #e2e8f0;">
                <div style="font-weight:600;color:#1a1f2e;">${et.label}</div>
                <div style="font-size:10px;color:${et.color};font-weight:600;margin-top:1px;">${et.group}</div>
            </td>
            <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;border-right:1px solid #e2e8f0;text-align:right;font-weight:600;color:#1a1f2e;">${fmtNum(et.value)}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;border-right:1px solid #e2e8f0;text-align:right;font-weight:700;color:${et.color};">${fmtPct(pct)}</td>
            <td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;">
                <div style="background:#f3f4f6;border-radius:4px;height:10px;overflow:hidden;">
                    <div style="height:100%;width:${Math.min(pct, 100)}%;background:${et.color};border-radius:4px;"></div>
                </div>
                <div style="font-size:10px;color:#9ca3af;margin-top:2px;">${fmtPct(pct)}</div>
            </td>
        </tr>`;
    });

    tableHtml += `<tr style="background:#f1f5f9;">
        <td colspan="2" style="padding:8px 10px;border-top:2px solid #e2e8f0;border-right:1px solid #e2e8f0;font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;">TOTAL ENERGY</td>
        <td style="padding:8px 10px;border-top:2px solid #e2e8f0;border-right:1px solid #e2e8f0;text-align:right;font-weight:700;color:#1a1f2e;">${fmtNum(baseTotal)}</td>
        <td style="padding:8px 10px;border-top:2px solid #e2e8f0;border-right:1px solid #e2e8f0;text-align:right;font-weight:700;color:#1a1f2e;">100%</td>
        <td style="padding:8px 10px;border-top:2px solid #e2e8f0;"></td>
    </tr></tbody></table>`;

    tableWrap.innerHTML = tableHtml;

    const rightWrap = document.createElement('div');
    rightWrap.style.cssText = 'flex:0 0 300px;display:flex;flex-direction:column;gap:20px;';

    const energyCanvas = document.createElement('canvas');
    energyCanvas.width = 220;
    energyCanvas.height = 220;

    const chartWrap = document.createElement('div');
    chartWrap.style.cssText = 'display:flex;align-items:center;justify-content:center;';
    chartWrap.appendChild(energyCanvas);

    const breakdownWrap = document.createElement('div');
    breakdownWrap.style.cssText = 'background:#f8fafc;border-radius:10px;padding:16px;border:1px solid #e2e8f0;';

    let breakdownHtml = `
        <div style="font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Total Energy Consumption</div>
        <div style="font-size:26px;font-weight:800;color:#1a1f2e;margin-bottom:16px;">${fmtNum(baseTotal)} <span style="font-size:13px;font-weight:500;color:#9ca3af;">MJ</span></div>
        <div style="display:flex;flex-direction:column;gap:8px;">`;

    ENERGY_GROUPS.forEach(g => {
        const val = groupTotals[g.key];
        if (val <= 0) return;
        const pct = baseTotal > 0 ? (val / baseTotal * 100).toFixed(1) : '0.0';

        breakdownHtml += `
            <div style="display:flex;align-items:center;gap:10px;">
                <div style="width:10px;height:10px;border-radius:50%;background:${g.color};flex-shrink:0;"></div>
                <div style="flex:1;font-size:12px;font-weight:600;color:#374151;">${g.label}</div>
                <div style="font-size:12px;font-weight:700;color:${g.color};">${pct}%</div>
                <div style="font-size:11px;color:#9ca3af;white-space:nowrap;">${fmtNum(val)} MJ</div>
            </div>`;
    });

    breakdownHtml += '</div>';
    breakdownWrap.innerHTML = breakdownHtml;

    rightWrap.appendChild(chartWrap);
    rightWrap.appendChild(breakdownWrap);
    card.appendChild(tableWrap);
    card.appendChild(rightWrap);
    wrap.appendChild(card);

    const row2 = document.createElement('div');
    row2.style.cssText = 'display:flex;gap:24px;align-items:flex-start;';

    const domestic = parseEnergyValue(row.domestic_total_mj);
    const vehicle = parseEnergyValue(row.vehicle_total_mj);
    const production = Math.max(0, baseTotal - domestic - vehicle);

    const purposeSlices = PURPOSE_ITEMS
        .map(p => ({
            ...p,
            value: p.key === 'production' ? production : p.key === 'domestic' ? domestic : vehicle
        }))
        .filter(p => p.value > 0);

    const purposeTotal = purposeSlices.reduce((s, p) => s + p.value, 0);

    const purposeSection = document.createElement('div');
    purposeSection.style.cssText = 'flex:1;min-width:0;';

    const purposeTitle = document.createElement('div');
    purposeTitle.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:#0369a1;padding:9px 16px;border-radius:6px 6px 0 0;';
    purposeTitle.textContent = 'ENERGY USE BY PURPOSE';

    const purposeCard = document.createElement('div');
    purposeCard.style.cssText = 'background:#fff;border-radius:0 0 14px 14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:24px;display:flex;flex-direction:column;align-items:center;gap:16px;';

    const purposeCanvas = document.createElement('canvas');
    purposeCanvas.width = 200;
    purposeCanvas.height = 200;
    purposeCard.appendChild(purposeCanvas);

    const purposeLegend = document.createElement('div');
    purposeLegend.style.cssText = 'width:100%;display:flex;flex-direction:column;gap:8px;';

    purposeSlices.forEach(p => {
        const pct = purposeTotal > 0 ? (p.value / purposeTotal * 100).toFixed(1) : '0.0';
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;align-items:center;gap:10px;';
        item.innerHTML = `
            <div style="width:10px;height:10px;border-radius:50%;background:${p.color};flex-shrink:0;"></div>
            <div style="flex:1;font-size:12px;font-weight:600;color:#374151;">${p.label}</div>
            <div style="font-size:12px;font-weight:700;color:${p.color};">${pct}%</div>
            <div style="font-size:11px;color:#9ca3af;">${fmtNum(p.value)} MJ</div>`;
        purposeLegend.appendChild(item);
    });

    purposeCard.appendChild(purposeLegend);
    purposeSection.appendChild(purposeTitle);
    purposeSection.appendChild(purposeCard);
    row2.appendChild(purposeSection);

    const selectedFactoryId = typeof selectedHiggId !== 'undefined' ? selectedHiggId : row.higg_id;
    const allRows = appData.bulkperformance.filter(r => String(r.higg_id) === String(selectedFactoryId));
    const allYears = sortFemYears([...new Set(allRows.map(r => r.version))]);

    const trendsSection = document.createElement('div');
    trendsSection.style.cssText = 'flex:2;min-width:0;';

    const trendsTitle = document.createElement('div');
    trendsTitle.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:#0f766e;padding:9px 16px;border-radius:6px 6px 0 0;';
    trendsTitle.textContent = 'YEARLY ENERGY CONSUMPTION TRENDS';

    const trendsCard = document.createElement('div');
    trendsCard.style.cssText = 'background:#fff;border-radius:0 0 14px 14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:20px 24px;';

    const selectorWrap = document.createElement('div');
    selectorWrap.style.cssText = 'display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:center;';
    selectorWrap.innerHTML = '<span style="font-size:12px;color:#6b7280;font-weight:600;">Show:</span>';

    const trendsCanvas = document.createElement('canvas');
    trendsCanvas.style.cssText = 'width:100%;display:block;';
    trendsCanvas.height = 280;

    const trendsLegend = document.createElement('div');
    trendsLegend.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;margin-top:12px;justify-content:center;';

    const options = [
        { label: 'Last 3 Years', value: 3 },
        { label: 'Last 5 Years', value: 5 },
        { label: 'All Years', value: 0 },
    ];

    options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.textContent = opt.label;
        btn.style.cssText = `padding:5px 14px;border-radius:20px;border:2px solid ${i === 0 ? '#0f766e' : '#e5e7eb'};background:${i === 0 ? '#0f766e' : '#fff'};color:${i === 0 ? '#fff' : '#6b7280'};font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s;`;

        btn.onclick = () => {
            selectorWrap.querySelectorAll('button').forEach(b => {
                b.style.background = '#fff';
                b.style.color = '#6b7280';
                b.style.borderColor = '#e5e7eb';
            });

            btn.style.background = '#0f766e';
            btn.style.color = '#fff';
            btn.style.borderColor = '#0f766e';

            if (resizeCanvasToParent(trendsCanvas)) {
                drawTrendsChart(trendsCanvas, trendsLegend, allRows, allYears, opt.value === 0 ? allYears.length : opt.value);
            }
        };

        selectorWrap.appendChild(btn);
    });

    trendsCard.appendChild(selectorWrap);
    trendsCard.appendChild(trendsCanvas);
    trendsCard.appendChild(trendsLegend);
    trendsSection.appendChild(trendsTitle);
    trendsSection.appendChild(trendsCard);
    row2.appendChild(trendsSection);

    wrap.appendChild(row2);
    wrap.appendChild(renderGhgEmissionsOverview(allRows, allYears, selectedYear));
    wrap.appendChild(renderDecarbonizationKpis(allRows, allYears, selectedYear));
    wrap.appendChild(renderEnergyQuestionResponses(allRows, allYears, selectedYear));
    wrap.appendChild(renderEnergyPerformanceScore(allRows, allYears, selectedYear));

    const headerCard = document.getElementById('energy-header');
    headerCard.insertAdjacentElement('afterend', wrap);

    const energySlices = ENERGY_GROUPS
        .map(g => ({ key: g.key, label: g.label, color: g.color, value: groupTotals[g.key] || 0 }))
        .filter(s => s.value > 0);

    drawDonutChart(energyCanvas, energySlices, null, 'Energy', 'Mix');
    drawDonutChart(purposeCanvas, purposeSlices, null, 'Purpose', 'Mix');

    requestAnimationFrame(() => {
        if (resizeCanvasToParent(trendsCanvas)) {
            drawTrendsChart(trendsCanvas, trendsLegend, allRows, allYears, 3);
        }
    });
}

function renderGhgEmissionsOverview(rows, years, selectedYear) {
    const row = rows.find(r => String(r.version) === String(selectedYear));
    if (!row) return document.createElement('div');

    const sortedYears = sortFemYears(years);
    const previousRow = getPreviousYearRow(rows, sortedYears, selectedYear);
    const total = getGhgTotal(row);
    const previousTotal = previousRow ? getGhgTotal(previousRow) : 0;
    const sourceValues = getGhgSourceValues(row);

    const section = document.createElement('div');
    section.id = 'ghg-emissions-overview-wrap';
    section.style.cssText = 'margin-top:24px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:#7f1d1d;padding:9px 16px;border-radius:6px 6px 0 0;';
    title.textContent = 'GHG EMISSIONS OVERVIEW';

    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:0 0 14px 14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:24px;display:grid;grid-template-columns:minmax(280px,0.85fr) minmax(460px,1.6fr);gap:28px;align-items:start;';

    const left = document.createElement('div');
    left.style.cssText = 'display:flex;flex-direction:column;gap:16px;';

    const breakdownRows = GHG_SOURCES.map(source => {
        const value = sourceValues[source.key] || 0;

        return `
            <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #e2e8f0;">
                <div style="width:11px;height:11px;border-radius:50%;background:${source.color};flex-shrink:0;"></div>
                <div style="flex:1;font-size:13px;font-weight:700;color:#334155;">${source.label}</div>
                <div style="font-size:15px;font-weight:850;color:${source.color};white-space:nowrap;">${formatKgCO2e(value)}</div>
                <div style="font-size:11px;color:#94a3b8;white-space:nowrap;">kgCO2e</div>
            </div>
        `;
    }).join('');

    left.innerHTML = `
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;">
            <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;">Total GHG Emissions</div>
            <div style="font-size:32px;font-weight:850;color:#111827;line-height:1;">${formatKgCO2e(total)}</div>
            <div style="font-size:12px;color:#94a3b8;margin-top:4px;">kgCO2e in ${selectedYear}</div>
            <div style="margin-top:14px;">${buildGhgChangeBadge(total, previousTotal)}</div>
        </div>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;">
            <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;">Emissions Sources</div>
            ${breakdownRows}
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
        btn.style.cssText = `padding:5px 14px;border-radius:20px;border:2px solid ${i === 0 ? '#7f1d1d' : '#e5e7eb'};background:${i === 0 ? '#7f1d1d' : '#fff'};color:${i === 0 ? '#fff' : '#6b7280'};font-size:12px;font-weight:700;cursor:pointer;`;

        btn.onclick = () => {
            selectorWrap.querySelectorAll('button').forEach(b => {
                b.style.background = '#fff';
                b.style.color = '#6b7280';
                b.style.borderColor = '#e5e7eb';
            });

            btn.style.background = '#7f1d1d';
            btn.style.color = '#fff';
            btn.style.borderColor = '#7f1d1d';

            if (resizeCanvasToParent(canvas)) {
                drawGhgTrendsChart(canvas, legend, rows, sortedYears, opt.value === 0 ? sortedYears.length : opt.value);
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
            drawGhgTrendsChart(canvas, legend, rows, sortedYears, 3);
        }
    }, 0);

    return section;
}

function drawTrendsChart(canvas, legendEl, rows, allYears, count) {
    const years = count >= allYears.length ? allYears : allYears.slice(-count);
    const w = canvas.width;

    canvas.width = w;

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const padL = 70;
    const padR = 20;
    const padT = 20;
    const padB = 50;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const groupData = ENERGY_GROUPS.map(g => ({
        label: g.label,
        color: g.color,
        values: years.map(y => {
            const row = rows.find(r => String(r.version) === String(y));
            if (!row) return 0;
            return g.cols.reduce((s, c) => s + parseEnergyValue(row[c.col]), 0);
        })
    })).filter(g => g.values.some(v => v > 0));

    if (!groupData.length) {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '13px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', W / 2, H / 2);
        return;
    }

    const stackedTotals = years.map((_, yi) => groupData.reduce((s, g) => s + g.values[yi], 0));
    const maxVal = Math.max(...stackedTotals) * 1.1 || 1;
    const barW = Math.min(60, (chartW / years.length) * 0.6);
    const barGap = chartW / years.length;

    for (let i = 0; i <= 5; i++) {
        const y = padT + chartH - (i / 5) * chartH;

        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + chartW, y);
        ctx.stroke();

        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px Segoe UI, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatMJ(maxVal * i / 5), padL - 6, y);
    }

    years.forEach((y, yi) => {
        const barX = padL + yi * barGap + (barGap - barW) / 2;
        let baseY = padT + chartH;

        groupData.forEach(g => {
            const val = g.values[yi];
            if (val <= 0) return;

            const barH = (val / maxVal) * chartH;
            baseY -= barH;

            ctx.fillStyle = g.color;
            ctx.fillRect(barX, baseY, barW, barH);

            if (barH > 18) {
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 9px Segoe UI, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(formatMJ(val), barX + barW / 2, baseY + barH / 2);
            }
        });

        ctx.fillStyle = '#374151';
        ctx.font = 'bold 11px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(y, barX + barW / 2, padT + chartH + 8);
    });

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + chartH);
    ctx.lineTo(padL + chartW, padT + chartH);
    ctx.stroke();

    legendEl.innerHTML = groupData.map(g => `
        <div style="display:flex;align-items:center;gap:6px;">
            <div style="width:12px;height:12px;border-radius:3px;background:${g.color};flex-shrink:0;"></div>
            <span style="font-size:12px;color:#374151;font-weight:600;">${g.label}</span>
        </div>`).join('');
}

function drawGhgTrendsChart(canvas, legendEl, rows, allYears, count) {
    const years = count >= allYears.length ? allYears : allYears.slice(-count);
    const w = canvas.width;
    const h = canvas.height;

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const padL = 82;
    const padR = 28;
    const padT = 34;
    const padB = 58;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const sourceData = GHG_SOURCES.map(source => ({
        key: source.key,
        label: source.label,
        color: source.color,
        values: years.map(year => {
            const row = rows.find(r => String(r.version) === String(year));
            if (!row) return 0;

            const values = getGhgSourceValues(row);
            return values[source.key] || 0;
        })
    }));

    const stackedTotals = years.map((_, yi) =>
        sourceData.reduce((sum, source) => sum + source.values[yi], 0)
    );

    const maxVal = Math.max(...stackedTotals, ...sourceData.flatMap(s => s.values)) * 1.18 || 1;
    const barGap = chartW / years.length;
    const barW = Math.min(64, barGap * 0.5);

    if (!sourceData.some(source => source.values.some(v => v > 0))) {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '13px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No GHG emissions data available', W / 2, H / 2);
        legendEl.innerHTML = '';
        return;
    }

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
        ctx.fillText(formatKgCO2e(value), padL - 8, y);
    }

    years.forEach((year, yi) => {
        const barX = padL + yi * barGap + (barGap - barW) / 2;
        let baseY = padT + chartH;

        sourceData.forEach(source => {
            const value = source.values[yi];
            if (value <= 0) return;

            const barH = Math.max((value / maxVal) * chartH, 2);
            baseY -= barH;

            ctx.fillStyle = source.color;
            ctx.globalAlpha = 0.82;
            ctx.fillRect(barX, baseY, barW, barH);
            ctx.globalAlpha = 1;

            const label = formatKgCO2e(value);
            ctx.font = 'bold 9px Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (barH >= 18) {
                ctx.fillStyle = '#fff';
                ctx.fillText(label, barX + barW / 2, baseY + barH / 2);
            } else {
                ctx.fillStyle = source.color;
                ctx.fillText(label, barX + barW / 2, baseY - 8);
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

    legendEl.innerHTML = sourceData.map(source => `
        <div style="display:flex;align-items:center;gap:6px;">
            <div style="width:12px;height:12px;border-radius:3px;background:${source.color};flex-shrink:0;"></div>
            <span style="font-size:12px;color:#374151;font-weight:700;">${source.label}</span>
        </div>
    `).join('');
}

function renderEnergyPage(higgId) {
    if (!higgId || typeof appData === 'undefined' || !Array.isArray(appData.bulkperformance)) return;

    const rows = appData.bulkperformance.filter(r => String(r.higg_id) === String(higgId));
    if (!rows.length) return;

    const years = sortFemYears([...new Set(rows.map(r => r.version).filter(Boolean))]);
    const selectedYear = years[years.length - 1];

    updateEnergyContent(rows, years, selectedYear);
}

function redrawEnergyChartsWhenVisible() {
    if (!isDashboardPageVisible('page-energy')) return;

    const higgId = getCurrentEnergyHiggId();
    if (higgId) {
        requestAnimationFrame(() => renderEnergyPage(higgId));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const originalNavigateTo = window.navigateTo;

    if (typeof originalNavigateTo === 'function' && !window.__energyNavigateWrapped) {
        window.__energyNavigateWrapped = true;

        window.navigateTo = function (page) {
            originalNavigateTo(page);

            if (page === 'energy') {
                setTimeout(redrawEnergyChartsWhenVisible, 80);
            }
        };
    }

    window.addEventListener('resize', () => {
        setTimeout(redrawEnergyChartsWhenVisible, 120);
    });

    setTimeout(redrawEnergyChartsWhenVisible, 0);
});

// Add this block to fem-dashboard/js/energy.js.
// Then call:
//   wrap.appendChild(renderEnergyQuestionResponses(allRows, allYears, selectedYear));
// inside updateEnergyContent(), after the other Energy sections.

const ENERGY_RESPONSE_QUESTIONS = [
    { n: 1, field: 'ensourcepurcheac', text: 'Does your facility purchase Energy Attribute Certificates (EACs, e.g. RECs)?', lv: 'LV1', wt: 'S', max: 4.57, source: 'energy_renewable' },
    { n: 2, field: 'enpurchco', text: 'Does your facility purchase Carbon Offsets?', lv: 'LV1', wt: 'B', max: 1.00 },
    { n: 3, field: 'ensourcetrackopt', text: 'Does your facility track any of its energy use (excluding energy used for company owned and controlled vehilces)?', lv: 'LV1', wt: 'M', max: 10.00 },
    { n: 4, field: 'ensourcetrackopteach', text: 'Does your facility track energy use from each energy source it utilizes?', lv: 'LV1', wt: 'M', max: 10.00 },
    { n: 5, field: 'ensourcetracksepdomprod', text: 'Does your facility identify and track separately energy use in domestic vs. production?', lv: 'LV1', wt: 'B', max: 1.00 },
    { n: 6, field: 'ensourcevehicletrackopt', text: 'Does your facility track the use of every energy/fuel source used by company owned/controlled vehicles?', lv: 'LV1', wt: 'S', max: 4.57, conditional: { col: 'ensourcevehicleany', reqVal: 'Yes', op: 'eq' } },
    { n: 7, field: 'enbaselinesource', text: 'Has your facility set a baseline for any of its energy use?', lv: 'LV2', wt: 'M', max: 10.00 },
    { n: 8, field: 'enbaselineeall', text: 'Which energy sources does your facility set a baseline on?', lv: 'LV2', wt: 'S', max: 4.57, compute: 'baseline' },
    { n: 9, field: 'enhighestuse', text: 'Does your facility know what processes or operations use the most energy?', lv: 'LV2', wt: 'M', max: 10.00 },
    { n: 10, field: 'entargetssource', text: 'Has your facility set targets for improving energy use?', lv: 'LV2', wt: 'S', max: 4.57 },
    { n: 11, field: 'x_entargetsource', text: 'Select all energy sources for which your facility has set an energy target', lv: 'LV2', wt: 'S', max: 4.57, compute: 'target' },
    { n: 12, field: 'enGHGtarget', text: 'Has your facility set targets for reducing overall Scope 1 and Scope 2 GHG emissions?', lv: 'LV2', wt: 'B', max: 1.00 },
    { n: 13, field: 'enimproveplan', text: 'Does your facility have an implementation plan to improve energy use and/or GHG Emissions?', lv: 'LV2', wt: 'S', max: 4.57 },
    { n: 14, field: 'enaudit', text: 'Has an energy audit been conducted at your facility within the last 5 years?', lv: 'LV2', wt: 'S', max: 4.57 },
    { n: 15, field: 'encoalphaseout', text: 'Does your facility have a plan to phase-out Coal?', lv: 'LV2', wt: 'M', max: 10.00, conditional: { col: 'energy_coal_mj', reqVal: 0, op: 'gt' } },
    { n: 16, field: 'enimproveopt', text: 'Has your facility improved energy consumption compared with its baseline in the reporting year?', lv: 'LV2', wt: 'B', max: 1.00 },
    { n: 17, field: 'enscope1and2reduction', text: 'Has your facility reduced overall Scope 1 and 2 GHG emissions compared with its baseline?', lv: 'LV2', wt: 'B', max: 1.00 },
    { n: 18, field: 'enscope3ghg', text: "Were your facility's annual Scope 3 GHG emissions calculated during this reporting year?", lv: 'LV3', wt: 'B', max: 1.00 },
    { n: 19, field: 'enscope3sbti', text: 'Has your facility set a Science-Based Target?', lv: 'LV3', wt: 'M', max: 10.00 },
    { n: 20, field: 'enfossilphaseout', text: 'Does your facility have a plan to phase-out any fossil fuel other than Coal?', lv: 'LV3', wt: 'B', max: 1.00, conditional: { col: '_fossil_noc', reqVal: 0, op: 'gt' } },
    { n: 21, field: 'enfossilphaseoutsucc', text: 'Has your facility successfully replaced any fossil fuel(s) with renewable energy?', lv: 'LV3', wt: 'B', max: 1.00 },
];

const ENERGY_RESPONSE_SOURCE_MAP = {
    energy_solarphoto_mj: { lbl: 'Solar PV', baseline: 'energy_baseline_solarphoto_mj', target: 'energy_target_solarphoto_percent' },
    energy_solarthermal_mj: { lbl: 'Solar Thermal', baseline: 'energy_baseline_solarthermal_mj', target: 'energy_target_solarthermal_percent' },
    energy_wind_mj: { lbl: 'Wind', baseline: 'energy_baseline_wind_mj', target: 'energy_target_wind_percent' },
    energy_hydro_mj: { lbl: 'Hydro', baseline: 'energy_baseline_hydro_mj', target: 'energy_target_hydro_percent' },
    energy_microhydro_mj: { lbl: 'Micro Hydro', baseline: 'energy_baseline_microhydro_mj', target: 'energy_target_microhydro_percent' },
    energy_purchrenewelec_mj: { lbl: 'Purchased Renewable Electricity', baseline: 'energy_baseline_purchrenewelec_mj', target: 'energy_target_purchrenewelec_percent' },
    energy_purchrenew_mj: { lbl: 'Purchased Renewables', baseline: 'energy_baseline_purchrenew_mj', target: 'energy_target_purchrenew_percent' },
    energy_biodiesel_mj: { lbl: 'Biodiesel', baseline: 'energy_baseline_biodiesel_mj', target: 'energy_target_biodiesel_percent' },
    energy_biogas_mj: { lbl: 'Biogas', baseline: 'energy_baseline_biogas_mj', target: 'energy_target_biogas_percent' },
    energy_geotherm_mj: { lbl: 'Geothermal', baseline: 'energy_baseline_geotherm_mj', target: 'energy_target_geotherm_percent' },
    energy_biomassgen_mj: { lbl: 'Biomass - General', baseline: 'energy_baseline_biomassgen_mj', target: 'energy_target_biomassgen_percent' },
    energy_biomasscert_mj: { lbl: 'Biomass - Certified', baseline: 'energy_baseline_biomasscert_mj', target: 'energy_target_biomasscert_percent' },
    energy_biomasswood_mj: { lbl: 'Biomass - Wood', baseline: 'energy_baseline_biomasswood_mj', target: 'energy_target_biomasswood_percent' },
    energy_electricpurch_mj: { lbl: 'Purchased Electricity', baseline: 'energy_baseline_electricpurch_mj', target: 'energy_target_electricpurch_percent' },
    energy_steampurch_mj: { lbl: 'Purchased Steam', baseline: 'energy_baseline_steampurch_mj', target: 'energy_target_steampurch_percent' },
    energy_chilledwater_mj: { lbl: 'Purchased Chilled Water', baseline: 'energy_baseline_chilledwater_mj', target: 'energy_target_chilledwater_percent' },
    energy_heating_mj: { lbl: 'District Heating', baseline: 'energy_baseline_heating_mj', target: 'energy_target_heating_percent' },
    energy_lpg_mj: { lbl: 'LPG', baseline: 'energy_baseline_lpg_mj', target: 'energy_target_lpg_percent' },
    energy_coal_mj: { lbl: 'Coal', baseline: 'energy_baseline_coal_mj', target: 'energy_target_coal_percent' },
    energy_coalwaterslurry_mj: { lbl: 'Coal-Water Slurry', baseline: 'energy_baseline_coalwaterslurry_mj', target: 'energy_target_coalwaterslurry_percent' },
    energy_diesel_mj: { lbl: 'Diesel', baseline: 'energy_baseline_diesel_mj', target: 'energy_target_diesel_percent' },
    energy_fueloil_mj: { lbl: 'Fuel Oil', baseline: 'energy_baseline_fueloil_mj', target: 'energy_target_fueloil_percent' },
    energy_lng_mj: { lbl: 'LNG', baseline: 'energy_baseline_lng_mj', target: 'energy_target_lng_percent' },
    energy_naturalgas_mj: { lbl: 'Natural Gas', baseline: 'energy_baseline_naturalgas_mj', target: 'energy_target_naturalgas_percent' },
    energy_petrol_mj: { lbl: 'Petrol/Gasoline', baseline: 'energy_baseline_petrol_mj', target: 'energy_target_petrol_percent' },
    energy_propane_mj: { lbl: 'Propane', baseline: 'energy_baseline_propane_mj', target: 'energy_target_propane_percent' },
    energy_CNG_mj: { lbl: 'CNG', baseline: 'energy_baseline_CNG_mj', target: 'energy_target_CNG_percent' },
};

function getEnergyResponseDataset() {
    if (typeof appData === 'undefined') return [];

    return appData.rawresponseEnergy
        || appData.rawresponse_energy
        || appData.energy
        || appData.fem_rawresponse_energy
        || appData['fem_rawresponse_energy']
        || appData['fem_rawresponse_energy.csv']
        || [];
}

function getEnergyRenewableResponseDataset() {
    if (typeof appData === 'undefined') return [];

    return appData.energy_renewable
        || appData.rawresponseEnergyRenewable
        || appData.rawresponse_energy_renewable
        || appData.fem_rawresponse_energy_renewable
        || appData['fem_rawresponse_energy_renewable']
        || appData['fem_rawresponse_energy_renewable.csv']
        || [];
}

function normalizeEnergyResponseKey(key) {
    return String(key || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function readEnergyResponseValue(row, field) {
    if (!row || !field) return '';

    const normalized = Object.keys(row).reduce((map, actualKey) => {
        map[normalizeEnergyResponseKey(actualKey)] = actualKey;
        return map;
    }, {});

    const getValue = key => {
        if (Object.prototype.hasOwnProperty.call(row, key) && row[key] !== '') return row[key];

        const actual = normalized[normalizeEnergyResponseKey(key)];
        return actual && row[actual] !== '' ? row[actual] : '';
    };

    const status = String(getValue('status')).toUpperCase();
    const corrected = getValue(`${field}.corrected`);
    const value = getValue(`${field}.value`);

    if (status === 'VRF' && corrected !== '') {
        return corrected;
    }

    return value || '';
}

function findEnergyResponseRow(bulkRow) {
    const rows = getEnergyResponseDataset();
    if (!rows.length || !bulkRow) return null;

    const higgId = String(bulkRow.higg_id || '').trim();
    const version = String(bulkRow.version || '').trim().toLowerCase();

    return rows.find(row => {
        const rowSacid = String(row.sacid || row.SACID || '').trim();
        const rowVersion = String(row.version || row.Version || '').trim().toLowerCase();

        return rowSacid === higgId &&
            (!version || rowVersion === version);
    }) || null;
}

function findEnergyRenewableResponseRow(bulkRow) {
    const rows = getEnergyRenewableResponseDataset();
    if (!rows.length || !bulkRow) return null;

    const higgId = String(bulkRow.higg_id || '').trim();
    const version = String(bulkRow.version || '').trim().toLowerCase();

    return rows.find(row => {
        const rowSacid = String(row.sacid || row.SACID || '').trim();
        const rowVersion = String(row.version || row.Version || '').trim().toLowerCase();

        return rowSacid === higgId &&
            (!version || rowVersion === version);
    }) || null;
}

function computeEnergyBaselineOrTarget(row, type) {
    if (!row) return null;

    const sourceMap = {
        energy_solarphoto_mj: { label: 'Solar PV', key: 'solarphoto' },
        energy_solarthermal_mj: { label: 'Solar Thermal', key: 'solarthermal' },
        energy_wind_mj: { label: 'Wind', key: 'wind' },
        energy_hydro_mj: { label: 'Hydro', key: 'hydro' },
        energy_microhydro_mj: { label: 'Micro Hydro', key: 'microhydro' },
        energy_geotherm_mj: { label: 'Geothermal', key: 'geotherm' },
        energy_purchrenew_mj: { label: 'Purch. Renewable', key: 'purchrenew' },
        energy_purchrenewelec_mj: { label: 'Purch. Renew. Elec.', key: null },
        energy_hydrogrenR_mj: { label: 'Renew. Hydrogen', key: null },
        energy_coal_mj: { label: 'Coal', key: 'coal' },
        energy_naturalgas_mj: { label: 'Natural Gas', key: 'naturalgas' },
        energy_lng_mj: { label: 'LNG', key: 'lng' },
        energy_diesel_mj: { label: 'Diesel', key: 'diesel' },
        energy_fueloil_mj: { label: 'Fuel Oil', key: 'fueloil' },
        energy_lpg_mj: { label: 'LPG', key: 'lpg' },
        energy_petrol_mj: { label: 'Petrol', key: 'petrol' },
        energy_propane_mj: { label: 'Propane', key: 'propane' },
        energy_electricpurch_mj: { label: 'Grid Electricity', key: 'electricpurch' },
        energy_steampurch_mj: { label: 'Purch. Steam', key: 'steampurch' },
        energy_chilledwater_mj: { label: 'Chilled Water', key: 'chilledwater' },
        energy_heating_mj: { label: 'Dist. Heating', key: 'districtheating' },
        energy_CNG_mj: { label: 'CNG', key: 'cng' },
        energy_coalwaterslurry_mj: { label: 'Coal Water Slurry', key: 'coalwaterslurry' },
        energy_hydrogrenNR_mj: { label: 'Non-Renew. H2', key: null },
        energy_biodiesel_mj: { label: 'Biodiesel', key: 'biodiesel' },
        energy_biomassgen_mj: { label: 'Biomass (General)', key: 'biomassgen' },
        energy_biomasswood_mj: { label: 'Biomass Wood', key: 'biomasswood' },
        energy_biomasscert_mj: { label: 'Certified Biomass', key: 'biomasscert' },
        energy_biogas_mj: { label: 'Biogas', key: 'biogas' },
        enery_fabricwaste_mj: { label: 'Fabric Waste', key: 'fabricwaste' },
    };

    const totalEnergy = parseEnergyValue(row.total_energy_mj);
    if (!totalEnergy) return null;

    const sources = Object.entries(sourceMap)
        .map(([col, meta]) => ({
            ...meta,
            energy: parseEnergyValue(row[col]),
        }))
        .filter(source => source.energy > 0)
        .sort((a, b) => b.energy - a.energy);

    const coveredEnergy = sources.reduce((sum, source) => {
        if (!source.key) return sum;

        const hasMetric = type === 'baseline'
            ? parseEnergyValue(row[`energy_baseline_${source.key}_mj`]) > 0
            : parseEnergyValue(row[`energy_target_${source.key}_percent`]) > 0 ||
              parseEnergyValue(row[`energy_target_${source.key}_year`]) > 0;

        return hasMetric ? sum + source.energy : sum;
    }, 0);

    const coverage = (coveredEnergy / totalEnergy) * 100;

    if (coverage >= 70) return 'Yes';
    if (coverage >= 40) return 'Partial Yes';
    return 'No';
}

function getEnergyQuestionResponse(question, responseRow, bulkRow) {
    if (question.compute) {
        return computeEnergyBaselineOrTarget(bulkRow, question.compute) || '-';
    }

    if (question.conditional) {
        const { col, reqVal, op } = question.conditional;

        if (op === 'gt') {
            let value = 0;
            if (col === '_fossil_noc') {
                value = [
                    'energy_naturalgas_mj',
                    'energy_lng_mj',
                    'energy_diesel_mj',
                    'energy_fueloil_mj',
                    'energy_lpg_mj',
                    'energy_petrol_mj',
                    'energy_propane_mj',
                    'energy_CNG_mj',
                ].reduce((sum, field) => sum + parseEnergyValue(bulkRow?.[field]), 0);
            } else {
                value = parseEnergyValue(bulkRow?.[col]);
            }

            if (value <= Number(reqVal || 0)) return 'Not Applicable';
        }

        if (op === 'eq') {
            const conditionValue = String(readEnergyResponseValue(responseRow, col) || bulkRow?.[col] || '').trim().toLowerCase();
            if (conditionValue !== String(reqVal).trim().toLowerCase()) return 'Not Applicable';
        }
    }

    return readEnergyResponseValue(responseRow, question.field)
        || bulkRow?.[question.field]
        || '-';
}

function renderEnergyAnswerBadge(value) {
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

    return `<span style="display:inline-block;padding:3px 9px;border-radius:999px;background:${bg};color:${color};font-size:11px;font-weight:800;white-space:nowrap;">${text || '-'}</span>`;
}

function renderQuestionWeightBadge(weight) {
    const styles = {
        M: { label: 'M', bg: '#fee2e2', color: '#b91c1c', title: 'Mandatory' },
        S: { label: 'S', bg: '#dbeafe', color: '#1d4ed8', title: 'Scored' },
        B: { label: 'B', bg: '#fef3c7', color: '#b45309', title: 'Bonus' },
    };

    const item = styles[weight];
    if (!item) return '';

    return `<span title="${item.title}" style="display:inline-block;margin-left:5px;padding:2px 6px;border-radius:999px;background:${item.bg};color:${item.color};font-size:10px;font-weight:850;">${item.label}</span>`;
}

function renderEnergyQuestionResponses(rows, years, selectedYear) {
    const row = rows.find(r => String(r.version) === String(selectedYear));
    if (!row) return document.createElement('div');

    const responseRow = findEnergyResponseRow(row);
    const renewableResponseRow = findEnergyRenewableResponseRow(row);
    const section = document.createElement('div');
    section.id = 'energy-question-responses-wrap';
    section.style.cssText = 'margin-top:24px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:#1d4ed8;padding:9px 16px;border-radius:6px 6px 0 0;';
    title.textContent = 'SUMMARY OF QUESTION RESPONSES';

    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:0 0 14px 14px;box-shadow:0 1px 6px rgba(0,0,0,0.07);padding:0;overflow:hidden;';

    const tableRows = ENERGY_RESPONSE_QUESTIONS.map((question, index) => {
        const answerSourceRow = question.source === 'energy_renewable'
    ? renewableResponseRow
    : responseRow;

    const answer = getEnergyQuestionResponse(question, answerSourceRow, row);

        const levelColor = question.lv === 'LV1' ? '#2563eb' : question.lv === 'LV2' ? '#059669' : '#7c3aed';

        return `
            <tr style="background:${index % 2 === 0 ? '#fff' : '#f8fafc'};">
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:#64748b;font-size:12px;font-weight:700;">${question.n}</td>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;white-space:nowrap;">
                    <span style="display:inline-block;padding:2px 8px;border-radius:999px;background:${levelColor}18;color:${levelColor};font-size:11px;font-weight:850;">${question.lv}</span>
                    ${renderQuestionWeightBadge(question.wt)}
                    </td>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;color:#1f2937;font-size:13px;line-height:1.45;">${question.text}</td>
                <td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;text-align:center;white-space:nowrap;">${renderEnergyAnswerBadge(answer)}</td>
            </tr>
        `;
    }).join('');

    card.innerHTML = `
        <div style="padding:12px 16px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <div style="font-size:13px;font-weight:800;color:#111827;">Summary of Question Responses</div>
            <div style="font-size:12px;color:#64748b;">${responseRow ? `Matched raw response for ${selectedYear}` : `Using bulk fields for ${selectedYear}`}</div>
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
function calculateEnergyPerformanceScore(rows, selectedYear) {
    const row = rows.find(r => String(r.version) === String(selectedYear));
    if (!row) return null;

    const responseRow = findEnergyResponseRow(row);
    const renewableResponseRow = findEnergyRenewableResponseRow(row);
    const answers = {};

    ENERGY_RESPONSE_QUESTIONS.forEach(question => {
        const answerSourceRow = question.source === 'energy_renewable'
            ? renewableResponseRow
            : responseRow;

        answers[question.n] = {
            display: getEnergyQuestionResponse(question, answerSourceRow, row),
            applicable: true,
        };
    });

    const scores = {};
    const maxes = {};
    const byLevel = { LV1: [], LV2: [], LV3: [] };

    ENERGY_RESPONSE_QUESTIONS.forEach(question => {
        byLevel[question.lv].push(question);
    });

    Object.entries(byLevel).forEach(([level, questions]) => {
        const naQuestions = questions.filter(question => {
            const answer = answers[question.n] || {};
            return answer.display === 'Not Applicable';
        });

        const naTotal = naQuestions.reduce((sum, question) => sum + question.max, 0);

        const applicableQuestions = questions.filter(question => {
            const answer = answers[question.n] || {};
            return answer.display !== 'Not Applicable';
        });

        const redistributedMax = applicableQuestions.length > 0
            ? naTotal / applicableQuestions.length
            : 0;

        questions.forEach(question => {
            const answer = answers[question.n] || {};
            const adjustedMax = answer.display !== 'Not Applicable'
                ? question.max + redistributedMax
                : question.max;

            maxes[question.n] = adjustedMax;

            let score = 0;
            if (answer.display === 'Yes') score = adjustedMax;
            else if (answer.display === 'Partial Yes') score = adjustedMax * 0.5;

            scores[question.n] = score;
        });
    });

    const levels = {};

['LV1', 'LV2', 'LV3'].forEach(level => {
    const questions = byLevel[level];

    const levelScore = questions.reduce((sum, question) => {
        return sum + (scores[question.n] || 0);
    }, 0);

    const levelMax = questions.reduce((sum, question) => {
        return sum + (maxes[question.n] || question.max);
    }, 0);

    const levelPct = levelMax > 0 ? (levelScore / levelMax) * 100 : 0;

    const previousLevelOk = level === 'LV1'
        ? true
        : levels[`LV${parseInt(level.slice(2), 10) - 1}`];

    levels[level] = previousLevelOk && levelPct >= 50;
});

    return { scores, maxes, levels, byLevel };
}

function renderEnergyPerformanceScore(rows, years, selectedYear) {
    const result = calculateEnergyPerformanceScore(rows, selectedYear);
    if (!result) return document.createElement('div');

    const { scores, maxes, levels, byLevel } = result;

    const section = document.createElement('div');
    section.id = 'energy-performance-score-wrap';
    section.style.cssText = 'margin-top:24px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#fff;background:#166534;padding:9px 16px;border-radius:6px 6px 0 0;';
    title.textContent = 'ENERGY PERFORMANCE SCORE & RATING';

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

    const totalScore = ENERGY_RESPONSE_QUESTIONS.reduce((sum, question) => sum + (scores[question.n] || 0), 0);
    const totalMax = ENERGY_RESPONSE_QUESTIONS.reduce((sum, question) => sum + (maxes[question.n] || question.max), 0);
    const totalPct = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
    const totalColor = totalPct >= 70 ? '#166534' : totalPct >= 40 ? '#b45309' : '#991b1b';

    card.innerHTML = `
        ${scoreHtml}

        <div style="border-top:1px solid #e2e8f0;margin-top:6px;padding-top:18px;display:flex;align-items:flex-end;justify-content:space-between;gap:18px;">
            <div>
                <div style="font-size:20px;font-weight:900;color:#111827;margin-bottom:6px;">Total Energy Score</div>
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