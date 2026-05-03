const OVERVIEW_STATUS_OPTIONS = ['NS', 'ASI', 'ASC', 'VRP', 'VRC', 'VRF', 'VRD', 'VRI', 'ASD'];

function renderOverviewFactoryDirectory() {
    const section = document.getElementById('overviewDirectorySection');
    const tbody = document.getElementById('overviewDirectoryTbody');
    const uploadPrompt = document.getElementById('uploadPrompt');

    if (!section || !tbody) return;

    if (!appData.bulkperformance || !appData.bulkperformance.length) {
        section.style.display = 'none';
        if (uploadPrompt) uploadPrompt.style.display = 'block';
        return;
    }

    if (uploadPrompt) uploadPrompt.style.display = 'none';
    section.style.display = 'block';

    populateOverviewVersionFilter();

    const q = (document.getElementById('overviewFilterSearch')?.value || '').trim().toLowerCase();
    const version = document.getElementById('overviewFilterVersion')?.value || '';
    const status = document.getElementById('overviewFilterStatus')?.value || '';
    const tier = document.getElementById('overviewFilterTier')?.value || '';

    const filtered = appData.bulkperformance.filter(row => {
        const name = (row.account_name || '').toLowerCase();
        const higgId = String(row.higg_id || '').toLowerCase();
        const rowVersion = String(row.version || '');
        const rowStatus = getOverviewAssessmentStatus(row);
        const rowTier = getOverviewTier(row.tags).toLowerCase();

        return (!q || name.includes(q) || higgId.includes(q)) &&
            (!version || rowVersion === version) &&
            (!status || rowStatus === status) &&
            (!tier || rowTier === tier);
    });

    if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="no-results">No factories match the selected filters.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map((row, i) => {
        const statusCode = getOverviewAssessmentStatus(row);
        const tierLabel = getOverviewTier(row.tags) || '—';
        const safeHiggId = String(row.higg_id || '').replace(/'/g, "\\'");

        return `<tr onclick="selectFactory('${safeHiggId}')">
            <td>${i + 1}</td>
            <td><strong>${row.account_name || '—'}</strong></td>
            <td>${row.higg_id || '—'}</td>
            <td>${row.account_country || '—'}</td>
            <td>${tierLabel}</td>
            <td>${row.version || '—'}</td>
            <td><span class="status-badge ${getStatusClass(statusCode)}">${statusCode || '—'}</span></td>
        </tr>`;
    }).join('');
}

function populateOverviewVersionFilter() {
    const select = document.getElementById('overviewFilterVersion');
    if (!select || select.dataset.loaded === 'true') return;

    const versions = [...new Set(appData.bulkperformance.map(r => r.version).filter(Boolean))].sort((a, b) => {
        const ay = Number(String(a).replace(/\D/g, ''));
        const by = Number(String(b).replace(/\D/g, ''));
        return ay - by;
    });

    select.innerHTML = '<option value="">All FEM Versions</option>' +
        versions.map(v => `<option value="${v}">${v}</option>`).join('');

    select.dataset.loaded = 'true';
}

function getOverviewAssessmentStatus(row) {
    const raw = String(row.assessment_status || row.survey_status || '').trim();
    const upper = raw.toUpperCase();

    const found = OVERVIEW_STATUS_OPTIONS.find(code => upper.includes(code));
    return found || raw || '';
}

function getOverviewTier(tags) {
    const text = String(tags || '').toLowerCase();

    if (text.includes('tier 1')) return 'Tier 1';
    if (text.includes('tier 2')) return 'Tier 2';
    if (text.includes('tier 3')) return 'Tier 3';
    if (text.includes('tier 4')) return 'Tier 4';

    return tags || '';
}

(function initOverviewDirectory() {
    const originalNavigateTo = window.navigateTo;

    if (typeof originalNavigateTo === 'function' && !window.__overviewNavigateWrapped) {
        window.navigateTo = function(page) {
            originalNavigateTo(page);

            if (page === 'overview') {
                setTimeout(renderOverviewFactoryDirectory, 0);
            }
        };

        window.__overviewNavigateWrapped = true;
    }

    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(renderOverviewFactoryDirectory, 300);
    });

    const timer = setInterval(() => {
        if (appData.bulkperformance && appData.bulkperformance.length) {
            renderOverviewFactoryDirectory();
            clearInterval(timer);
        }
    }, 500);
})();
