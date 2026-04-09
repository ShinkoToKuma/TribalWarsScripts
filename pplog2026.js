/**
 * Premium Points Log Analyzer
 * Fetches and analyzes premium points transaction history
 *
 * Version: 1.0.0
 * Features:
 *   - Batch processing with version-controlled storage
 *   - Dual progress bars (overall + current batch)
 *   - Automatic resume from last unprocessed page
 */

if (window.location.href.indexOf('premium&mode=log&page=0') < 0) {
    window.location.assign(game_data.link_base_pure + "premium&mode=log&page=0");
}

const SCRIPT_VERSION = '1.0.0';
const STORAGE_KEY = 'PPLogShinko';
const BATCH_SIZE = 20;
const MIN_REQUEST_INTERVAL = 200; // ms between requests

const state = {
    pagesProcessed: {},
    currentPageIndex: 0,
    totalPages: 0,
    lastDate: 0,
    lastChange: 0,
    skip: false,
    baseURL: '',
    URLs: [],
    locale: 'en_DK'
};

const aggregates = {
    purchases: [],
    spending: [],
    farmed: [],
    worldReward: [],
    yearlyReward: [],
    refunds: [],
    totalRefunds: 0,
    totalYearlyReward: 0,
    totalBought: 0,
    totalSpent: 0,
    totalFarmed: 0,
    totalGiftsReceived: 0,
    totalWorldReward: 0,
    totalGiftsSent: 0,
    giftTo: [],
    giftFrom: [],
    worldDataBase: {}
};

const LANGUAGE_MAP = {
    "en_DK": {
        "Purchase": "Purchase",
        "Premium Exchange": "Premium Exchange",
        "Points redeemed": "Points redeemed",
        "Transfer": "Transfer",
        "Sold": "sold",
        "giftTo": "to: ",
        "giftFrom": "from: ",
        "Free premium points": "Free premium points",
        "Endgame reward": "Endgame reward",
        "Manually": "Manually",
        "Withdrawn": "Withdrawn"
    },
    "es_ES": {
        "Purchase": "Comprar",
        "Premium Exchange": "Bolsa Premium",
        "Points redeemed": "Utilizado",
        "Transfer": "Transferir",
        "Sold": "vendido",
        "giftTo": "to: ",
        "giftFrom": "from: ",
        "Free premium points": "Puntos premium gratis",
        "Endgame reward": "Recompensa por el final del juego",
        "Manually": "Manually",
        "Withdrawn": "Withdrawn"
    },
    "en_GB": {
        "Purchase": "Purchase",
        "Premium Exchange": "Premium Exchange",
        "Points redeemed": "Points redeemed",
        "Transfer": "Transfer",
        "Sold": "sold",
        "giftTo": "to: ",
        "giftFrom": "from: ",
        "Free premium points": "Free premium points",
        "Endgame reward": "Endgame reward",
        "Manually": "Manually",
        "Withdrawn": "Withdrawn"
    },
    "en_US": {
        "Purchase": "Purchase",
        "Premium Exchange": "Premium Exchange",
        "Points redeemed": "Points redeemed",
        "Transfer": "Transfer",
        "Sold": "sold",
        "giftTo": "to: ",
        "giftFrom": "from: ",
        "Free premium points": "Free premium points",
        "Endgame reward": "Endgame reward",
        "Manually": "Manually",
        "Withdrawn": "Withdrawn"
    },
    "nl_NL": {
        "Purchase": "Koop",
        "Premium Exchange": "Premium Beurs",
        "Points redeemed": "Ingezet",
        "Transfer": "Overdragen",
        "Sold": "Gehandeld voor",
        "giftTo": "to: ",
        "giftFrom": "from: ",
        "Free premium points": "Free premium points",
        "Endgame reward": "Endgame reward",
        "Manually": "Manually",
        "Withdrawn": "Withdrawn"
    },
    "it_IT": {
        "Purchase": "Ottieni",
        "Premium Exchange": "Cambio del Premium",
        "Points redeemed": "Utilizzati",
        "Transfer": "Trasferisci",
        "Sold": "venduto",
        "giftTo": "to: ",
        "giftFrom": "from: ",
        "Free premium points": "Free premium points",
        "Endgame reward": "Endgame reward",
        "Manually": "Manually",
        "Withdrawn": "Withdrawn"
    },
    "el_GR": {
        "Purchase": "Αγορά",
        "Premium Exchange": "Ανταλλακτήριο",
        "Points redeemed": "Αλλαγή πόντων",
        "Transfer": "Μεταφορά",
        "Sold": "Πουλήθηκε",
        "giftTo": "to:",
        "giftFrom": "from: ",
        "Free premium points": "Free premium points",
        "Endgame reward": "Endgame reward",
        "Manually": "Manually",
        "Withdrawn": "Withdrawn"
    },
    "ar_AE": {
        "Purchase": "شراء",
        "Premium Exchange": "مصرف نقاط التمييز",
        "Points redeemed": "النقاط المستخدمة",
        "Transfer": "إرسال ",
        "Sold": " تم بيع",
        "giftTo": "to:",
        "giftFrom": "from: ",
        "Free premium points": "Free premium points",
        "Endgame reward": "Endgame reward",
        "Manually": "Manually",
        "Withdrawn": "Withdrawn"
    },
    "pt_BR": {
        "Purchase": "Compra",
        "Premium Exchange": "Troca Premium",
        "Points redeemed": "Utilizado",
        "Transfer": "Transferir",
        "Sold": "vendido",
        "giftTo": "to: ",
        "giftFrom": "from: ",
        "Free premium points": "Free premium points",
        "Endgame reward": "Endgame reward",
        "Manually": "Manually",
        "Withdrawn": "Withdrawn"
    },
    "de_DE": {
        "Purchase": "Kauf",
        "Premium Exchange": "Premium-Depot",
        "Points redeemed": " Eingesetzt ",
        "Transfer": "Übertragen",
        "Sold": "verkauft",
        "giftTo": "to: ",
        "giftFrom": "from: ",
        "Free premium points": "Free premium points",
        "Endgame reward": "Endgame reward",
        "Manually": "Manually",
        "Withdrawn": "Withdrawn"
    },
    "sv_SE": {
        "Purchase": "Köp",
        "Premium Exchange": "PremiumBörsen",
        "Points redeemed": "Utlösta Poäng",
        "Transfer": "Överför",
        "Sold": "Sålda",
        "giftTo": "to: ",
        "giftFrom": "from: ",
        "Free premium points": "Free premium points",
        "Endgame reward": "Endgame reward",
        "Manually": "Manually",
        "Withdrawn": "Withdrawn"
    },
    "pt_PT": {
        "Purchase": "Compra",
        "Premium Exchange": "Troca Premium",
        "Points redeemed": "Utilizados",
        "Transfer": "Transferir",
        "Sold": "vendido",
        "giftTo": "to: ",
        "giftFrom": "from: ",
        "Free premium points": "Pontos premium gratuitos",
        "Endgame reward": "Recompensa de fim de jogo",
        "Manually": "Manualmente",
        "Withdrawn": "Withdrawn"
    },
    "ro_RO": {
        "Purchase": "Cumpărare",
        "Premium Exchange": "Depozit Premium",
        "Points redeemed": "Activat",
        "Transfer": "Transmite",
        "Sold": "vândut",
        "giftTo": "to: ",
        "giftFrom": "from: ",
        "Free premium points": "Puncte-Premium gratis",
        "Endgame reward": "Endgame reward",
        "Manually": "Manually",
        "Withdrawn": "Withdrawn",
        "recruit": "Recompensă de recrutare jucători"
    }
};

const PPLogUI = {
    init() {
        const width = $("#contentContainer")[0] ? $("#contentContainer")[0].clientWidth : $("#mobileHeader")[0].clientWidth;
        const container = $("#contentContainer")[0] ? $("#contentContainer").eq(0) : $("#mobileHeader").eq(0);

        this.addCSSStyles();

        container.prepend(`
            <div id="pplog-container">
                <div class="bordered-box">
                    <h3>Shinko's Premium Points Log Analyzer</h3>
                    To prevent running into captcha issues, pages are loaded in batches of 10. After each batch, the "Load Next Batch" button will be enabled to allow you to continue at your own pace. 
                    Your progress is automatically saved, so you can safely navigate away and return later to resume from where you left off. Once all pages are loaded, the overview will show all your expenses and gains.
                    <br>
                    From that point onwards, it will only fetch additional pages and keep your history saved
                    <hr>
                    <button id="loadBatch" class="btn">
                        Load Next Batch
                    </button>
                    <div class="batch-info" id="batch-info">
                        Batch Size: ${BATCH_SIZE} pages • Version: ${SCRIPT_VERSION}
                    </div>
                    <hr>
                    <div style="margin-bottom: 15px;">
                        <div class="progress-section">
                            <span class="progress-label">Overall Progress</span>
                            <span id="overall-count" class="progress-count">0 / ${state.totalPages + 1}</span>
                        </div>
                        <div id="progressbar" class="progress-bar progress-bar-alive progressbar">
                            <div id="progress" class="progress-fill"></div>
                        </div>
                    </div>

                    <div id="batch-progress-container" style="display: none;">
                        <div class="progress-section">
                            <span class="progress-label">Current Batch</span>
                            <span id="batch-count" class="progress-count batch">0 / 0</span>
                        </div>
                        <div id="batchProgressbar" class="progress-bar progress-bar-alive progressbar batch">
                            <div id="batchProgress" class="progress-fill batch"></div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        this.loadBatchButton = $("#loadBatch");
        this.setupButtonListener();
    },

    addCSSStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #results-container .pplog-content {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 10px;
            }
            #results-container .pplog-content .pplog-group {
                display:flex;
                gap: 0.5rem;
            }
            #results-container .award img {
                width: 48px!important;
                margin: 6px!important;
                background: #f4e4bc;
            }
            .tabs-container {
                display: flex;
                margin-bottom: 20px;
                min-height: 400px;
            }
            .nav-tabs {
                display: flex;
                flex-direction: column;
                gap: 0;
                width: 180px;
                border-radius: 8px 0px 0px 8px;
                overflow: hidden;
                flex-shrink: 0;
                margin-top: 4px;
            }
            .tab-button {
                color: #495057;
                border: none;
                border-bottom: 1px solid #dee2e6;
                border-left: 1px solid #dee2e6;
                border-right: 1px solid #dee2e6;
                padding: 12px 16px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: left;
                white-space: nowrap;
                border-image: url(https://dsen.innogamescdn.com/asset/8e371e58/graphic/ui/borderedbox/border.webp) 32 30 7 fill repeat;
                border-width: 0px 0px 7px;
            }
            .tab-button.active {
                color: black !important;
            }
            .tabs-content-wrapper {
                flex: 1;
                display: flex;
                flex-direction: column;
            }
            .tab-content {
                display: none;
            }
            .tab-content.active {
                display: block;
            }
            .table-wrapper {
                overflow-x: auto;
                min-width: 0;
            }
            .table-wrapper table {
                min-width: 600px;
                margin-bottom: 0;
            }
            .difference-cell {
                font-weight: 600;
            }
            .pplog-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 20px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .pplog-header h2 {
                margin: 0;
                font-size: 24px;
                font-weight: 300;
            }
            .pplog-header p {
                margin: 5px 0 0 0;
                opacity: 0.9;
                font-size: 14px;
            }
            .pplog-controls {
                background: white;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 20px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                border: 1px solid #e1e5e9;
            }
            .pplog-controls .btn {
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .batch-info {
                margin-top: 15px;
                font-size: 14px;
                color: #666;
            }
            .pplog-progress {
                background: white;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 20px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                border: 1px solid #e1e5e9;
            }
            .pplog-progress h3 {
                margin: 0 0 15px 0;
                color: #333;
                font-size: 18px;
                font-weight: 500;
            }
            .progress-label {
                font-weight: 500;
                color: #555;
            }
            .progress-count {
                font-weight: 600;
                color: #4CAF50;
            }
            .progress-count.batch {
                color: #2196F3;
            }
            .progressbar {
                height: 12px;
                border-radius: 6px;
                overflow: hidden;
                background: #f0f0f0;
            }
            .progressbar.batch {
                height: 8px;
                border-radius: 4px;
            }
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%);
                width: 0%;
                transition: width 0.3s ease;
                border-radius: 6px;
            }
            .progress-fill.batch {
                background: linear-gradient(90deg, #2196F3 0%, #1976D2 100%);
                border-radius: 4px;
            }
            .pplog-container {
                margin: 20px 0;
                font-family: Arial, sans-serif;
            }
            .progress-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
            }
            .results-container {
                font-family: Arial, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
            }
        `;
        document.head.appendChild(style);
    },

    setupButtonListener() {
        this.loadBatchButton.click(() => BatchProcessor.fetchBatch());
    },

    updateOverallProgress(processed, total) {
        const percentage = (processed / total) * 100;
        $("#progress").css("width", `${percentage}%`);
        $("#overall-count").text(`${processed} / ${total}`);
    },

    showBatchProgress(current, total) {
        if (total === 0) {
            $("#batch-progress-container").hide();
            return;
        }
        $("#batch-progress-container").show();
        const percentage = (current / total) * 100;
        $("#batchProgress").css("width", `${percentage}%`);
        $("#batch-count").text(`${current} / ${total}`);
    },

    hideBatchProgress() {
        $("#batch-progress-container").hide();
    },

    enableLoadButton() {
        this.loadBatchButton.prop('disabled', false);
    },

    disableLoadButton() {
        this.loadBatchButton.prop('disabled', true);
    },

    removeProgressBars() {
        $("#pplog-container").remove();
    }
};

const Storage = {
    load() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            console.log(`Storage: No data found for version ${SCRIPT_VERSION}`);
            return false;
        }

        try {
            const data = JSON.parse(stored);
            if (data.version !== SCRIPT_VERSION) {
                console.log(`Storage: Version mismatch (found ${data.version}, expected ${SCRIPT_VERSION}). Clearing old data.`);
                localStorage.removeItem(STORAGE_KEY);
                return false;
            }
            state.pagesProcessed = data.pagesProcessed || {};
            state.currentPageIndex = data.currentPageIndex || 0;
            state.lastDate = data.lastDate || 0;
            state.lastChange = data.lastChange || 0;
            console.log("Storage: Loaded previous data");
            return true;
        } catch (e) {
            console.error("Storage: Failed to parse stored data:", e);
            return false;
        }
    },

    save() {
        const storeData = {
            lastDate: state.lastDate,
            lastChange: state.lastChange,
            pagesProcessed: state.pagesProcessed,
            currentPageIndex: state.currentPageIndex,
            version: SCRIPT_VERSION
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storeData));
    }
};

const DataAggregator = {
    computeTotals() {
        // Reset all aggregates
        Object.assign(aggregates, {
            purchases: [],
            spending: [],
            farmed: [],
            worldReward: [],
            yearlyReward: [],
            refunds: [],
            totalRefunds: 0,
            totalYearlyReward: 0,
            totalBought: 0,
            totalSpent: 0,
            totalFarmed: 0,
            totalGiftsReceived: 0,
            totalWorldReward: 0,
            totalGiftsSent: 0,
            giftTo: [],
            giftFrom: [],
            worldDataBase: {}
        });

        // Aggregate data from all processed pages
        for (let page in state.pagesProcessed) {
            const pageData = state.pagesProcessed[page];
            aggregates.purchases = aggregates.purchases.concat(pageData.purchases);
            aggregates.spending = aggregates.spending.concat(pageData.spending);
            aggregates.farmed = aggregates.farmed.concat(pageData.farmed);
            aggregates.worldReward = aggregates.worldReward.concat(pageData.worldReward);
            aggregates.yearlyReward = aggregates.yearlyReward.concat(pageData.yearlyReward);
            aggregates.refunds = aggregates.refunds.concat(pageData.refunds);
            aggregates.totalRefunds += pageData.totalRefunds;
            aggregates.totalYearlyReward += pageData.totalYearlyReward;
            aggregates.totalBought += pageData.totalBought;
            aggregates.totalSpent += pageData.totalSpent;
            aggregates.totalFarmed += pageData.totalFarmed;
            aggregates.totalGiftsReceived += pageData.totalGiftsReceived;
            aggregates.totalWorldReward += pageData.totalWorldReward;
            aggregates.totalGiftsSent += pageData.totalGiftsSent;
            aggregates.giftTo = aggregates.giftTo.concat(pageData.giftTo);
            aggregates.giftFrom = aggregates.giftFrom.concat(pageData.giftFrom);

            for (let world in pageData.worldDataBase) {
                if (!aggregates.worldDataBase[world]) {
                    aggregates.worldDataBase[world] = { Purchases: 0, Spending: 0, Farming: 0 };
                }
                aggregates.worldDataBase[world].Purchases += pageData.worldDataBase[world].Purchases;
                aggregates.worldDataBase[world].Spending += pageData.worldDataBase[world].Spending;
                aggregates.worldDataBase[world].Farming += pageData.worldDataBase[world].Farming;
            }
        }
    }
};

const PageProcessor = {
    process(page, data) {
        const pageData = {
            purchases: [],
            spending: [],
            farmed: [],
            worldReward: [],
            yearlyReward: [],
            refunds: [],
            totalRefunds: 0,
            totalYearlyReward: 0,
            totalBought: 0,
            totalSpent: 0,
            totalFarmed: 0,
            totalGiftsReceived: 0,
            totalWorldReward: 0,
            totalGiftsSent: 0,
            giftTo: [],
            giftFrom: [],
            worldDataBase: {}
        };

        state.pagesProcessed[page] = pageData;

        const tempRows = $(data).find("table .vis> tbody > tr");
        if (tempRows.length < 3) {
            console.warn(`Page ${page} has no data rows`);
            return;
        }

        if (page === 0) {
            state.lastDate = tempRows[2].children[0].innerText.trim();
            state.lastChange = tempRows[2].children[3].innerText.trim();
        }

        const langMap = LANGUAGE_MAP[state.locale];

        for (let j = 0; j < tempRows.length - 2; j++) {
            const row = tempRows[j + 2];
            if (!row.children[2]) continue;

            const transactionType = row.children[2].innerText;
            const world = row.children[1].innerText;
            const amount = parseInt(row.children[3].innerText);
            const transactionData = {
                Date: row.children[0].innerText,
                World: world,
                Transaction: transactionType,
                Amount: row.children[3].innerText,
                newTotal: row.children[4].innerText,
                moreInformation: row.children[5].innerText
            };

            this.categorizeTransaction(transactionData, transactionType, world, amount, pageData, langMap);
        }

        console.log(`Page ${page} processed: ${pageData.purchases.length + pageData.spending.length + pageData.refunds.length} entries`);
    },

    categorizeTransaction(data, type, world, amount, pageData, langMap) {
        if (type.indexOf(langMap["Purchase"]) > -1) {
            this.ensureWorld(pageData, world);
            pageData.purchases.push(data);
            pageData.worldDataBase[world]["Purchases"] += amount;
            pageData.totalBought += amount;
        }
        else if (type.indexOf(langMap["Premium Exchange"]) > -1 || type.indexOf(langMap["Points redeemed"]) > -1) {
            this.ensureWorld(pageData, world);
            pageData.worldDataBase[world]["Spending"] += -amount;
            pageData.totalSpent += amount;
        }
        else if (type.indexOf(langMap["Transfer"]) > -1 &&
                 (data.moreInformation.indexOf(langMap["Sold"]) > -1 || data.moreInformation.indexOf(langMap["Premium Exchange"]) > -1)) {
            this.ensureWorld(pageData, world);
            pageData.worldDataBase[world]["Farming"] += amount;
            pageData.totalFarmed += amount;
        }
        else if (data.moreInformation.indexOf(langMap["giftTo"]) === 0) {
            pageData.giftTo.push(data);
            pageData.totalGiftsSent += -amount;
        }
        else if (data.moreInformation.indexOf(langMap["giftFrom"]) > -1) {
            pageData.giftFrom.push(data);
            pageData.totalGiftsReceived += amount;
        }
        else if (type.indexOf(langMap["Free premium points"]) > -1) {
            pageData.yearlyReward.push(data);
            pageData.totalYearlyReward += amount;
        }
        else if (type.indexOf(langMap["Endgame reward"]) > -1) {
            pageData.worldReward.push(data);
            pageData.totalWorldReward += amount;
        }
        else if (type.indexOf(langMap["Withdrawn"]) > -1 || type.indexOf(langMap["Manually"]) > -1) {
            pageData.refunds.push(data);
            pageData.totalRefunds += amount;
        }
    },

    ensureWorld(pageData, world) {
        if (!pageData.worldDataBase[world]) {
            pageData.worldDataBase[world] = { Purchases: 0, Spending: 0, Farming: 0 };
        }
    }
};
const DataFetcher = {
    async fetch(urls, onLoad, onDone, onError) {
        let numDone = 0;
        let lastRequestTime = 0;

        const loadNext = async () => {
            if (numDone === urls.length || state.skip) {
                console.log(`Fetcher: Completed. Loaded ${numDone}/${urls.length} URLs`);
                onDone();
                return;
            }

            const now = Date.now();
            const timeElapsed = now - lastRequestTime;
            if (timeElapsed < MIN_REQUEST_INTERVAL) {
                const timeRemaining = MIN_REQUEST_INTERVAL - timeElapsed;
                setTimeout(loadNext, timeRemaining);
                return;
            }

            PPLogUI.showBatchProgress(numDone + 1, urls.length);
            lastRequestTime = now;

            try {
                const data = await $.get(urls[numDone]);
                onLoad(numDone, data);
                numDone++;
                await loadNext();
            } catch (xhr) {
                console.error(`Fetcher: Failed to fetch URL ${numDone}:`, xhr);
                onError(xhr);
            }
        };

        await loadNext();
    }
};

const BatchProcessor = {
    async fetchBatch() {
        PPLogUI.disableLoadButton();

        const start = Math.max(0, state.currentPageIndex - BATCH_SIZE + 1);
        const end = state.currentPageIndex + 1;
        const batchURLs = state.URLs.slice(start, end);

        const onLoad = (index, data) => {
            const page = start + index;
            PageProcessor.process(page, data);
            const totalProcessed = (state.totalPages + 1) - start;
            PPLogUI.updateOverallProgress(totalProcessed, state.totalPages + 1);
        };

        const onDone = () => {
            state.currentPageIndex = start - 1;
            Storage.save();
            DataAggregator.computeTotals();
            PPLogUI.hideBatchProgress();

            if (state.currentPageIndex < 0) {
                ResultsDisplay.show();
            } else {
                PPLogUI.enableLoadButton();
            }
        };

        const onError = (error) => {
            PPLogUI.enableLoadButton();
        };

        await DataFetcher.fetch(batchURLs, onLoad, onDone, onError);
    }
};

const ResultsDisplay = {
    show() {
        const html = this.buildHTML();
        PPLogUI.removeProgressBars();
        Storage.save();
        UI.AjaxPopup(null,'ppLogShinko', `
            <div id="results-container" class="results-container">
                ${html}
            </div>
        `, "Premium Points Log", null, { dataType: "prerendered" }, 1200, "auto", 330, 200);
        this.setupCategoryDisplay();
        this.displayCategory("overview");
    },

    buildHTML() {
        const tabs = [
            { id: 'overview', label: 'Overview', content: this.buildOverviewTable() },
            { id: 'purchaseHistory', label: 'Purchase History', content: this.buildTable('purchaseHistory', 'Purchase History', aggregates.purchases) },
            { id: 'giftReceived', label: 'Gifts Received', content: this.buildTable('giftReceived', 'Gifts Received', aggregates.giftFrom) },
            { id: 'giftSent', label: 'Gifts Sent', content: this.buildTable('giftSent', 'Gifts Sent', aggregates.giftTo) },
            { id: 'yearlyReward', label: 'Yearly Rewards', content: this.buildTable('yearlyReward', 'Yearly Rewards', aggregates.yearlyReward) },
            { id: 'worldReward', label: 'World Rewards', content: this.buildTable('worldReward', 'World Rewards', aggregates.worldReward) },
            { id: 'refunds', label: 'Refunds', content: this.buildTable('refunds', 'Refunds', aggregates.refunds) }
        ];

        let html = this.buildSummaryCards();
        html += '<div class="tabs-container">';
        html += this.buildNavigationButtons(tabs);
        html += '<div class="tabs-content-wrapper">';

        tabs.forEach((tab, index) => {
            html += `<div id="${tab.id}-content" class="tab-content ${index === 0 ? 'active' : ''}">
                ${tab.content}
            </div>`;
        });

        html += '</div></div>';
        return html;
    },

    buildSummaryCards() {
        const stats = [
            { name: "Premium Points Farmed", value: aggregates.totalFarmed, image: "https://www.shinko-to-kuma.com/images/ppLogImages/PPFarmed.png" },
            { name: "Premium Points Spent", value: -aggregates.totalSpent, image: "https://www.shinko-to-kuma.com/images/ppLogImages/PPSpent.png" },
            { name: "Gifts Received", value: aggregates.totalGiftsReceived, image: "https://www.shinko-to-kuma.com/images/ppLogImages/GiftsReceived.png" },
            { name: "Gifts Sent", value: aggregates.totalGiftsSent, image: "https://www.shinko-to-kuma.com/images/ppLogImages/GiftsSent.png" },
            { name: "Yearly Rewards", value: aggregates.totalYearlyReward, image: "https://www.shinko-to-kuma.com/images/ppLogImages/YearlyReward.png" },
            { name: "World Rewards", value: aggregates.totalWorldReward, image: "https://www.shinko-to-kuma.com/images/ppLogImages/WorldReward.png" },
            { name: "Premium Points Bought", value: aggregates.totalBought, image: "https://www.shinko-to-kuma.com/images/ppLogImages/PPBought.png" },
            { name: "Total Refunds", value: aggregates.totalRefunds, image: "https://www.shinko-to-kuma.com/images/ppLogImages/Refunds.png" }
        ];

        let html = '<div class="bordered-box"><h3>Statistics</h3><div class="pplog-content">';

        stats.forEach(stat => {
            html += `<div class="pplog-group"><div class="award level4"><img src="${stat.image}" alt="" class="content-box-image"></div><p>${stat.name}<br><br>${stat.value}</p></div>`;
        });

        html += '</div></div>';
        return html;
    },

    buildNavigationButtons(tabs) {
        let buttonsHtml = '<div class="nav-tabs">';
        tabs.forEach((tab, index) => {
            buttonsHtml += `<button class="tab-button ${index === 0 ? 'active' : ''}" id="${tab.id}Button" onclick="displayCategory('${tab.id}')">${tab.label}</button>`;
        });
        buttonsHtml += '</div>';
        return buttonsHtml;
    },

    buildTable(id, title, data) {
        let html = `<div id="${id}" class="bordered-box"><h3>${title}</h3><div class="table-wrapper"><table class="vis" width="100%"><tr><th>Date</th><th>World</th><th>Transaction</th><th>Amount</th><th>New Total</th><th>More Info</th></tr>`;
        data.forEach(item => {
            html += `<tr><td>${item.Date}</td><td>${item.World}</td><td>${item.Transaction}</td><td>${item.Amount}</td><td>${item.newTotal}</td><td>${item.moreInformation}</td></tr>`;
        });
        html += `</table></div></div>`;
        return html;
    },

    buildOverviewTable() {
        let html = `<div id="overview" class="bordered-box"><h3>World Overview</h3><div class="table-wrapper"><table class="vis" width="100%"><tr><th colspan="2">World</th><th>Purchases</th><th>Spending</th><th>Farmed</th><th>Difference</th></tr>`;
        Object.keys(aggregates.worldDataBase).forEach(world => {
            const d = aggregates.worldDataBase[world];
            const difference = d.Farming - d.Spending + d.Purchases;
            const differenceColor = difference >= 0 ? '#4CAF50' : '#f44336';
            html += `<tr><td colspan="2">${world}</td><td>${d.Purchases}</td><td>${d.Spending}</td><td>${d.Farming}</td><td class="difference-cell" style="color: ${differenceColor};">${difference}</td></tr>`;
        });
        html += `</table></div></div>`;
        return html;
    },

    setupCategoryDisplay() {
        const categories = ["overview", "purchaseHistory", "giftReceived", "giftSent", "worldReward", "yearlyReward", "refunds"];
        categories.forEach(cat => {
            $(`#${cat}-content`).hide();
        });
        // Show overview by default
        $("#overview-content").show().addClass("active");
    },

    displayCategory(category) {
        const allCategories = ["overview", "purchaseHistory", "giftReceived", "giftSent", "worldReward", "yearlyReward", "refunds"];

        // Remove active class from all tab buttons
        allCategories.forEach(cat => {
            $(`#${cat}Button`).removeClass("active");
        });

        // Add active class to selected tab button
        $(`#${category}Button`).addClass("active");

        // Hide all tab content
        $(".tab-content").removeClass("active").hide();

        // Show the selected tab content
        $(`#${category}-content`).addClass("active").show();
    }
};

function init() {
    try {
        state.locale = game_data.locale || 'en_DK';
        state.baseURL = game_data.player.sitter > 0
            ? `/game.php?t=${game_data.player.id}&screen=premium&mode=log&page=`
            : "/game.php?&screen=premium&mode=log&page=";

        const pageLinks = $(".paged-nav-item");
        if (pageLinks.length === 0) {
            console.error("Could not find page navigation");
            return;
        }

        state.totalPages = parseInt(pageLinks[pageLinks.length - 1].href.match(/page=(\d+)/)[1]);

        for (let i = 0; i <= state.totalPages; i++) {
            state.URLs.push(state.baseURL + i);
        }

        PPLogUI.init();

        const hasData = Storage.load();

        if (hasData && Object.keys(state.pagesProcessed).length > 0) {
            const processedPages = Object.keys(state.pagesProcessed)
                .map(p => parseInt(p))
                .sort((a, b) => a - b);
            const lowestProcessed = Math.min(...processedPages);
            state.currentPageIndex = lowestProcessed - 1;
        } else {
            state.currentPageIndex = state.totalPages;
        }

        DataAggregator.computeTotals();

        const totalProcessed = (state.totalPages + 1) - (state.currentPageIndex + 1);
        PPLogUI.updateOverallProgress(totalProcessed, state.totalPages + 1);

        if (state.currentPageIndex < 0) {
            ResultsDisplay.show();
        }

    } catch (error) {
        console.error("Initialization error:", error);
    }
}

function displayCategory(category) {
    ResultsDisplay.displayCategory(category);
}

init();

