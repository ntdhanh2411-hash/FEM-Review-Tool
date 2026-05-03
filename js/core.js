// ---- SHARED DATA & CONSTANTS ----
const appData = window.appData = {};
let selectedHiggId = null;

const FILE_MAP = {
    'bulkperformance': 'bulkperformance',
    'bulk': 'bulkperformance',

    'quantitative': 'quantitativeimpacts',
    'quantitativeimpacts': 'quantitativeimpacts',

    'airemissions': 'airemissions',
    'chemicals': 'chemicals',
    'chemical': 'chemicals',
    'ems': 'ems',

    'energy_renewable': 'energy_renewable',
    'renewable': 'energy_renewable',
    'energy': 'energy',

    'wastewater': 'wastewater',
    'waste': 'waste',
    'water': 'water',

    'production_volume': 'production_volume',
    'productionvolume': 'production_volume',
};

const FILE_LABELS = {
    'bulkperformance': '📋 Bulk Performance',
    'quantitativeimpacts': '📈 Quantitative Impacts',
    'airemissions': '💨 Air Emissions',
    'chemicals': '🧪 Chemicals',
    'ems': '⚙️ EMS',

    'energy': '⚡ Energy',
    'energy_renewable': '🌱 Renewable Energy',

    'waste': '🗑️ Waste',
    'wastewater': '🌊 Wastewater',
    'water': '💧 Water',

    'production_volume': '🏭 Production Volume',
};

const ALL_PAGES = ['overall', 'energy', 'waste', 'water', 'chemical', 'air'];
const PERFORMANCE_PAGES = ['overall', 'energy', 'waste', 'water', 'chemical', 'air'];

// ---- FILE UPLOAD ----
function detectFileKey(filename) {
    const lower = filename
        .toLowerCase()
        .replace(/\s/g, '_')
        .replace('.csv', '')
        .replace('.xlsx', '');

    for (const [kw, key] of Object.entries(FILE_MAP)) {
        if (lower.includes(kw)) return key;
    }

    return null;
}

function updateStatusItem(key, status, message) {
    let item = document.getElementById('status-' + key);

    if (!item) {
        item = document.createElement('div');
        item.className = 'file-status-item';
        item.id = 'status-' + key;
        document.getElementById('uploadStatus').appendChild(item);
    }

    item.className = 'file-status-item ' + status;

    const icon = status === 'processing'
        ? '<span class="spinner"></span>'
        : status === 'done'
            ? '✅'
            : '❌';

    item.innerHTML = `<span class="status-icon">${icon}</span><span>${message}</span>`;
}

function handleFileUpload(event) {
    Array.from(event.target.files).forEach(file => {
        const key = detectFileKey(file.name);
        const label = key ? FILE_LABELS[key] : file.name;

        if (!key) {
            updateStatusItem(file.name, 'error', `❓ Unknown: ${file.name}`);
            return;
        }

        updateStatusItem(key, 'processing', `Reading ${label}...`);

        setTimeout(() => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete(results) {
                    appData[key] = results.data;
                    updateStatusItem(key, 'done', `${label} (${results.data.length} rows)`);

                    if (key === 'bulkperformance') {
                        const uploadPrompt = document.getElementById('uploadPrompt');
                        const overviewContent = document.getElementById('overviewContent');
                        const versionFilter = document.getElementById('overviewFilterVersion');

                        if (uploadPrompt) uploadPrompt.style.display = 'none';
                        if (overviewContent) overviewContent.style.display = 'block';
                        if (versionFilter) versionFilter.dataset.loaded = 'false';

                        if (typeof renderOverviewFactoryDirectory === 'function') {
                            renderOverviewFactoryDirectory();
                        }

                        if (selectedHiggId) {
                            refreshActivePerformancePage();
                        }
                    }

                    if (typeof renderOverviewFactoryDirectory === 'function') {
                        renderOverviewFactoryDirectory();
                    }
                },
                error() {
                    updateStatusItem(key, 'error', `Failed: ${label}`);
                }
            });
        }, 100);
    });

    event.target.value = '';
}

// ---- GLOBAL SEARCH ----
function getUniqueFactories() {
    if (!appData.bulkperformance) return [];

    const seen = new Set();

    return appData.bulkperformance.filter(r => {
        const id = String(r.higg_id || '').trim();

        if (!id || seen.has(id)) return false;

        seen.add(id);
        return true;
    });
}

function buildDropdownHTML(matches, onClickFn) {
    if (!matches.length) {
        return '<div style="padding:16px;color:#9ca3af;text-align:center;font-size:13px;">No factories found</div>';
    }

    return matches.map(f => `
        <div class="dropdown-item" onclick="${onClickFn}('${String(f.higg_id).replace(/'/g, "\\'")}')">
            <div class="factory-name">${f.account_name || '—'}</div>
            <div class="factory-meta">Higg ID: ${f.higg_id || '—'} · ${f.account_country || ''}</div>
        </div>
    `).join('');
}

function onGlobalSearch(val) {
    const dropdown = document.getElementById('globalDropdown');
    const q = val.trim().toLowerCase();

    if (!dropdown) return;

    if (!q || !appData.bulkperformance) {
        dropdown.classList.remove('show');
        return;
    }

    const matches = getUniqueFactories().filter(f =>
        (f.account_name || '').toLowerCase().includes(q) ||
        String(f.higg_id || '').toLowerCase().includes(q)
    ).slice(0, 20);

    dropdown.innerHTML = buildDropdownHTML(matches, 'selectFactory');
    dropdown.classList.add('show');
}

function showGlobalDropdown() {
    const input = document.getElementById('globalSearchInput');
    if (!input) return;

    const val = input.value;
    if (val.trim()) onGlobalSearch(val);
}

function selectFactory(higgId) {
    if (!appData.bulkperformance) return;

    selectedHiggId = String(higgId);

    const rows = getSelectedFactoryRows();
    if (!rows.length) return;

    const base = rows[0];
    const years = getFactoryYears(rows);
    const latestYear = years[years.length - 1];

    const searchInput = document.getElementById('globalSearchInput');
    const dropdown = document.getElementById('globalDropdown');
    const pillName = document.getElementById('pillFactoryName');
    const selectedPill = document.getElementById('selectedFactoryPill');

    if (searchInput) searchInput.value = base.account_name || '';
    if (dropdown) dropdown.classList.remove('show');
    if (pillName) pillName.textContent = `${base.account_name || '—'} (${base.higg_id || '—'})`;
    if (selectedPill) selectedPill.classList.add('show');

    ALL_PAGES.forEach(page => updatePageHeader(page, base, years, latestYear));

    refreshActivePerformancePage(latestYear);

    if (typeof selectPsFactory === 'function') {
        selectPsFactory(higgId);
    }
}

// ---- PAGE HEADER + CONTENT REFRESH ----
function getSelectedFactoryRows() {
    if (!selectedHiggId || !appData.bulkperformance) return [];

    return appData.bulkperformance.filter(r =>
        String(r.higg_id) === String(selectedHiggId)
    );
}

function getFactoryYears(rows) {
    return [...new Set(rows.map(r => r.version).filter(Boolean))].sort((a, b) => {
        const ay = Number(String(a).replace(/\D/g, ''));
        const by = Number(String(b).replace(/\D/g, ''));

        if (!isNaN(ay) && !isNaN(by) && ay !== by) return ay - by;

        return String(a).localeCompare(String(b));
    });
}

function getActivePageName() {
    const activePage = document.querySelector('.page.active');

    if (!activePage || !activePage.id) return null;

    return activePage.id.replace('page-', '');
}

function getActiveYearForPage(page, years) {
    const activeTab = document.querySelector(`#${page}-year-tabs .fem-year-tab.active`);
    const activeYear = activeTab ? activeTab.textContent.trim() : '';

    if (activeYear && years.includes(activeYear)) return activeYear;

    return years[years.length - 1];
}

function updatePageHeader(page, base, years, activeYear) {
    const nameEl = document.getElementById(`${page}-factory-name`);
    if (!nameEl) return;

    const rows = getSelectedFactoryRows();
    const selectedYearForTabs = activeYear || years[years.length - 1];
    const activeRow = rows.find(r => String(r.version) === String(selectedYearForTabs)) || base;

    const groupEl = document.getElementById(`${page}-group`);
    const higgEl = document.getElementById(`${page}-higgid`);
    const countryEl = document.getElementById(`${page}-country`);
    const tabsEl = document.getElementById(`${page}-year-tabs`);
    const headerEl = document.getElementById(`${page}-header`);
    const ph = document.getElementById(`${page}-placeholder`);

    nameEl.textContent = base.account_name || '—';
    if (groupEl) groupEl.textContent = base.tags || '—';
    if (higgEl) higgEl.textContent = base.higg_id || '—';
    if (countryEl) countryEl.textContent = base.account_country || '—';

    setAssessmentStatusBesideCountry(page, activeRow);

    if (tabsEl) {
        tabsEl.innerHTML = years.map(y => `
            <div class="fem-year-tab ${String(y) === String(selectedYearForTabs) ? 'active' : ''}"
                 onclick="onYearTabClick('${page}', '${base.higg_id}', '${y}', this)">${y}</div>
        `).join('');
    }

    if (headerEl) headerEl.classList.add('show');
    if (ph) ph.style.display = 'none';
}

function refreshActivePerformancePage(forceYear) {
    if (!selectedHiggId || !appData.bulkperformance) return;

    const activePage = getActivePageName();
    if (!activePage || !PERFORMANCE_PAGES.includes(activePage)) return;

    const rows = getSelectedFactoryRows();
    if (!rows.length) return;

    const years = getFactoryYears(rows);
    const year = forceYear || getActiveYearForPage(activePage, years);

    renderPerformancePage(activePage, rows, years, year);
}

function renderPerformancePage(page, rows, years, year) {
    if (!rows.length || !years.length) return;

    switch (page) {
        case 'overall':
            if (typeof updateOverallContent === 'function') {
                updateOverallContent(rows, years, year);
            }
            break;

        case 'energy':
            if (typeof updateEnergyContent === 'function') {
                updateEnergyContent(rows, years, year);
            }
            break;

        case 'waste':
            if (typeof updateWasteContent === 'function') {
                updateWasteContent(rows, years, year);
            }
            break;

        case 'water':
            if (typeof updateWaterContent === 'function') {
                updateWaterContent(rows, years, year);
            }
            break;

        case 'chemical':
            if (typeof updateChemicalContent === 'function') {
                updateChemicalContent(rows, years, year);
            }
            break;

        case 'air':
            if (typeof updateAirContent === 'function') {
                updateAirContent(rows, years, year);
            }
            break;
    }
}

function onYearTabClick(page, higgId, year, tabEl) {
    const tabsWrap = document.getElementById(`${page}-year-tabs`);

    if (tabsWrap) {
        tabsWrap.querySelectorAll('.fem-year-tab').forEach(t => t.classList.remove('active'));
    }

    if (tabEl) tabEl.classList.add('active');

    if (!appData.bulkperformance) return;

    selectedHiggId = String(higgId);

    const rows = getSelectedFactoryRows();
    const years = getFactoryYears(rows);
    const base = rows[0];

    updatePageHeader(page, base, years, year);
    renderPerformancePage(page, rows, years, year);
}

function clearFactory() {
    selectedHiggId = null;

    const searchInput = document.getElementById('globalSearchInput');
    const selectedPill = document.getElementById('selectedFactoryPill');

    if (searchInput) searchInput.value = '';
    if (selectedPill) selectedPill.classList.remove('show');

    ALL_PAGES.forEach(page => {
        const header = document.getElementById(`${page}-header`);
        const ph = document.getElementById(`${page}-placeholder`);

        if (header) header.classList.remove('show');
        if (ph) ph.style.display = 'block';
    });

    const overallGrid = document.getElementById('overall-grid');
    const productionSection = document.getElementById('production-section');
    const overallPlaceholder = document.getElementById('overall-placeholder');

    if (overallGrid) overallGrid.style.display = 'none';
    if (productionSection) productionSection.classList.remove('show');
    if (overallPlaceholder) overallPlaceholder.style.display = 'block';

    removeContentWraps();

    if (typeof clearPsSelection === 'function') {
        clearPsSelection();
    }

    const psPh = document.getElementById('ps-placeholder');
    if (psPh) psPh.style.display = 'block';
}

function removeContentWraps() {
    [
        'energy-content-wrap',
        'waste-content-wrap',
        'water-content-wrap',
        'chemical-content-wrap',
        'air-content-wrap',
        'ghg-emissions-overview-wrap',
        'response-summary-wrap',
        'overall-resource-summary'
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });
}

// ---- SHARED HELPERS ----
function escapeAssessmentHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function setAssessmentStatusBesideCountry(page, row) {
    const countryEl = document.getElementById(`${page}-country`);
    if (!countryEl) return;

    const countryBlock = countryEl.parentElement;
    const infoRow = countryBlock?.parentElement;
    if (!countryBlock || !infoRow) return;

    let statusBlock = document.getElementById(`${page}-assessment-status-block`);

    if (!statusBlock) {
        statusBlock = countryBlock.cloneNode(true);
        statusBlock.id = `${page}-assessment-status-block`;

        const clonedValue = statusBlock.querySelector(`#${page}-country`);
        if (clonedValue) {
            clonedValue.id = `${page}-assessment-status`;
        }

        infoRow.appendChild(statusBlock);
    }

    const labelEl = statusBlock.children[0];
    const valueEl = statusBlock.children[1];

    if (labelEl) labelEl.textContent = 'ASSESSMENT STATUS';
    if (valueEl) valueEl.textContent = row?.survey_status || '—';
}

function removeAssessmentStatus(page) {
    const block = document.getElementById(`${page}-assessment-status-block`);
    if (block) block.remove();
}

async function downloadPerformancePdf(pageKey) {
    if (typeof html2pdf === 'undefined') {
        alert('PDF library is not loaded yet. Please add html2pdf.js in index.html.');
        return;
    }

    const page = document.getElementById(`page-${pageKey}`);
    if (!page) return;

    const activeEl = document.activeElement;
    if (activeEl && typeof activeEl.blur === 'function') activeEl.blur();

    const clone = page.cloneNode(true);

    // Xoá nút download khỏi bản export
    clone.querySelectorAll('button.ps-download-btn').forEach(btn => btn.remove());

    // Chuyển canvas → img để html2pdf render đúng
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

    // Chuyển input/textarea → div text tĩnh
    clone.querySelectorAll('input, textarea').forEach((clonedInput, i) => {
        const originalInput = page.querySelectorAll('input, textarea')[i];
        const valueBox = document.createElement('div');
        valueBox.className = 'ps-pdf-comment-value';
        valueBox.textContent = originalInput?.value || '';
        clonedInput.replaceWith(valueBox);
    });

    // Thêm CSS pagebreak vào các section/card để tránh bị cắt giữa chừng
    clone.querySelectorAll(
        '.card, .section, .ps-section, .content-card, ' +
        '.chart-wrap, .table-wrap, [class*="-card"], [class*="-section"], [class*="-block"]'
    ).forEach(el => {
        el.style.pageBreakInside  = 'avoid';
        el.style.breakInside      = 'avoid';
        el.style.pageBreakBefore  = 'auto';
    });

    // PDF landscape A3 width (mm)
    const PDF_W_MM    = 420;
    const MM_TO_PX    = 3.7795275591;
    const MARGIN_MM   = 8;

    // Vùng nội dung thực (mm → px)
    const contentWidthPx  = (PDF_W_MM - MARGIN_MM * 2) * MM_TO_PX; // ~1528px

    const exportRoot = document.createElement('div');
    exportRoot.id = 'performance-pdf-export-root';
    exportRoot.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: ${contentWidthPx}px;
        min-width: ${contentWidthPx}px;
        background: #f5f6fa;
        padding: 0;
        z-index: 999999;
        box-sizing: border-box;
        display: block;
        visibility: visible;
        opacity: 1;
        pointer-events: none;
    `;

    clone.style.cssText = `
        display: block !important;
        width: ${contentWidthPx}px !important;
        max-width: none !important;
        overflow: visible !important;
        background: #f5f6fa !important;
        margin: 0 !important;
        padding: 0 !important;
    `;

    exportRoot.appendChild(clone);
    document.body.appendChild(exportRoot);
    document.body.classList.add('ps-pdf-exporting');

    // Đợi layout ổn định (charts, images render xong)
    await new Promise(resolve => setTimeout(resolve, 900));

    const factoryName = document.getElementById(`${pageKey}-factory-name`)?.textContent?.trim()
        || document.getElementById('pillFactoryName')?.textContent?.trim()
        || 'factory';

    const safeFactoryName = factoryName
        .replace(/[\\/:*?"<>|]+/g, '-')
        .replace(/\s+/g, '-');

    // Đo chiều cao thực tế sau khi render xong
    const totalHeightPx = exportRoot.scrollHeight;
    const totalWidthPx  = exportRoot.scrollWidth;

    // Scale để nội dung vừa khít chiều rộng PDF
    const scale = (PDF_W_MM * MM_TO_PX) / totalWidthPx;

    // Chiều cao PDF (mm) = chiều cao nội dung thực sau khi scale + margin
    // → KHÔNG cố định theo A3, tự co giãn theo nội dung để không bị cắt
    const scaledHeightMm = (totalHeightPx * scale) / MM_TO_PX;
    const pdfHeightMm    = scaledHeightMm + MARGIN_MM * 2;

    const opt = {
        margin:   [MARGIN_MM, MARGIN_MM, MARGIN_MM, MARGIN_MM],
        filename: `${pageKey}-${safeFactoryName}.pdf`,
        image:    { type: 'jpeg', quality: 0.97 },
        html2canvas: {
            scale,
            useCORS:         true,
            backgroundColor: '#f5f6fa',
            x:               0,
            y:               0,
            scrollX:         0,
            scrollY:         0,
            windowWidth:     contentWidthPx,
            width:           contentWidthPx,
            height:          totalHeightPx,
            logging:         false,
        },
        jsPDF: {
            unit:        'mm',
            // Chiều cao = toàn bộ nội dung → 1 trang duy nhất, không bị cắt
            format:      [PDF_W_MM, pdfHeightMm],
            orientation: 'landscape',
            compress:    true,
        },
        // Không cần pagebreak vì chỉ có 1 trang duy nhất
        pagebreak: { mode: [] },
    };

    try {
        await html2pdf().set(opt).from(exportRoot).save();
    } finally {
        document.body.removeChild(exportRoot);
        document.body.classList.remove('ps-pdf-exporting');
    }
} // ← đóng hàm downloadPerformancePdf

// FIX: getStatusClass đã được đưa ra đúng scope toàn cục
function getStatusClass(status) {
    if (!status) return 'status-default';

    const s = String(status).toLowerCase();

    if (s.includes('verified') || s.includes('vrf')) return 'status-verified';
    if (s.includes('submitted') || s.includes('asc')) return 'status-submitted';
    if (s.includes('progress') || s.includes('vrp')) return 'status-progress';

    return 'status-default';
}

// ---- NAVIGATION ----
function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item, .nav-sub-item').forEach(n => n.classList.remove('active'));

    const pageEl = document.getElementById('page-' + page);
    const navEl = document.getElementById('nav-' + page);

    if (pageEl) pageEl.classList.add('active');
    if (navEl) navEl.classList.add('active');

    const subPages = ['overall', 'energy', 'waste', 'water', 'chemical', 'air'];

    if (subPages.includes(page)) {
        const performanceNav = document.getElementById('nav-performance');
        const submenu = document.getElementById('performance-submenu');

        if (performanceNav) performanceNav.classList.add('open');
        if (submenu) submenu.style.display = 'block';
    }

    if (page === 'overview' && typeof renderOverviewFactoryDirectory === 'function') {
        renderOverviewFactoryDirectory();
    }

    setTimeout(() => {
        refreshActivePerformancePage();
    }, 0);
}

function togglePerformance() {
    const submenu = document.getElementById('performance-submenu');
    const navItem = document.getElementById('nav-performance');

    if (!submenu || !navItem) return;

    const isOpen = submenu.style.display === 'block';

    submenu.style.display = isOpen ? 'none' : 'block';
    navItem.classList.toggle('open', !isOpen);
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('.global-search-wrap')) {
        const dropdown = document.getElementById('globalDropdown');
        if (dropdown) dropdown.classList.remove('show');
    }
});
