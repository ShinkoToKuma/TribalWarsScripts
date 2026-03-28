//script by Sophie "Shinko to Kuma". discord: Sophie#2418 website: https://www.shinko-to-kuma.com/
(function () {
    'use strict';
    const LANGUAGES = {
        en_DK: {
            noReportsFound: "No reports found! Please run this script from the report list or loot assistant list report list",
            noRelicsFound: "No relics found!",
            relicFinderTitle: "Relic Finder",
            foundRelics: "Found relics",
            tableHeaders: {
                location: "Location",
                distance: "Distance",
                relic: "Relic",
                quality: "Quality",
                reportLink: "Report Link"
            },
            qualities: {
                renowned: "Renowned",
                superior: "Superior",
                refined: "Enhanced",
                polished: "Basic",
                shoddy: "Shoddy",
                unknown: "Unknown"
            },
        },
    };

    const CURRENT_LOCALE = typeof game_data !== 'undefined' ? game_data.locale : 'en_DK';
    const LANG = LANGUAGES[CURRENT_LOCALE] || LANGUAGES['en_DK'];

    const RelicFinder = {
        relics: [],
        reportUrls: [],
        stopped: false,

        init() {
            this.collectReportUrlsFromAllPages()
                .then(() => {
                    if (this.reportUrls.length === 0) {
                        UI.ErrorMessage(LANG.noReportsFound);
                        return;
                    }
                    this.setupProgressBar();
                    this.staggeredFetchReports(
                        this.reportUrls,
                        this.processReport.bind(this),
                        LANG.relicFinderTitle
                    ).then(() => this.displayResults());
                });
        },

        parseReportLinksFromHTML(htmlString) {
            let doc;
            if (typeof htmlString === 'string') {
                const parser = new DOMParser();
                doc = parser.parseFromString(htmlString, "text/html");
            } else {
                doc = htmlString;
            }

            const $doc = $(doc);
            const urls = [];
            $doc.find('#report_list td:has(img[src*="/command/spy"])').each((i, el) => {
                const url = $(el).find('.report-link').attr("href");
                const reportId = $(el).find('.report-link').data("id");
                if (url) urls.push(url);
            });
            return urls;
        },

        collectReportUrlsFromAllPages() {
            return new Promise((resolve) => {
                // Collect URLs from current page (using document)
                const currentPageUrls = this.parseReportLinksFromHTML(document);
                this.reportUrls.push(...currentPageUrls);

                // Find pagination links
                const pageLinks = Array.from(document.querySelectorAll('a.paged-nav-item'))
                    .map(el => el.getAttribute('href'))
                    .filter(href => href);

                if (pageLinks.length === 0) {
                    // No more pages
                    resolve();
                    return;
                }

                // Stagger pagination page fetches
                let pageIndex = 0;
                const lastRequestTime = {value: 0};

                const fetchNextPage = () => {
                    if (pageIndex === pageLinks.length) {
                        resolve();
                        return;
                    }

                    const now = Date.now();
                    if (now - lastRequestTime.value < 200) {
                        setTimeout(fetchNextPage, 200 - (now - lastRequestTime.value));
                        return;
                    }

                    lastRequestTime.value = Date.now();
                    const pageUrl = pageLinks[pageIndex];

                    fetch(pageUrl, {credentials: "same-origin"})
                        .then(r => r.text())
                        .then(html => {
                            // Use the same parseReportLinksFromHTML function
                            const pageUrls = this.parseReportLinksFromHTML(html);
                            this.reportUrls.push(...pageUrls);
                            pageIndex++;
                            fetchNextPage();
                        })
                        .catch(() => {
                            pageIndex++;
                            fetchNextPage();
                        });
                };

                fetchNextPage();
            });
        },


        setupProgressBar() {
            const container = $("#contentContainer").length ? $("#contentContainer") : $("#mobileHeader");
            const width = container[0]?.clientWidth || 300;
            container.eq(0).prepend(`
                    <div id="progressbar" class="progress-bar progress-bar-alive">
                        <span id="count" class="label">0/${this.reportUrls.length}</span>
                        <div id="progress"><span id="count2" class="label" style="width: ${width}px;">0/${this.reportUrls.length}</span></div>
                    </div>`);
        },

        staggeredFetchReports(urls, onLoad, label) {
            return new Promise((resolve, reject) => {
                let numDone = 0;
                const lastRequestTime = {value: 0};

                const loadNext = () => {
                    if (numDone === urls.length || this.stopped) {
                        $("#progressbar").remove();
                        resolve();
                        return;
                    }

                    const now = Date.now();
                    if (now - lastRequestTime.value < 200) {
                        setTimeout(loadNext, 200 - (now - lastRequestTime.value));
                        return;
                    }

                    const progress = (numDone + 1) / urls.length * 100;
                    $("#progress").css("width", `${progress}%`);
                    $("#count").text(`${label}: ${numDone + 1}/${urls.length}`);
                    $("#count2").text(`${label}: ${numDone + 1}/${urls.length}`);

                    lastRequestTime.value = Date.now();

                    fetch(urls[numDone], {credentials: "same-origin"})
                        .then(r => r.text())
                        .then(html => {
                            try {
                                onLoad(numDone, html);
                                numDone++;
                                loadNext();
                            } catch (e) {
                                reject(e);
                            }
                        })
                        .catch(() => {
                            numDone++;
                            loadNext();
                        });
                };

                loadNext();
            });
        },

        detectQuality(elem) {
            const img = elem.querySelector("img");
            if (elem.classList.contains("relic-quality-renowned")) {
                return {q: LANG.qualities.renowned, color: "orange", img};
            }
            if (elem.classList.contains("relic-quality-superior")) {
                return {q: LANG.qualities.superior, color: "purple", img};
            }
            if (elem.classList.contains("relic-quality-refined")) {
                return {q: LANG.qualities.refined, color: "blue", img};
            }
            if (elem.classList.contains("relic-quality-polished")) {
                return {q: LANG.qualities.polished, color: "green", img};
            }
            if (elem.classList.contains("relic-quality-shoddy")) {
                return {q: LANG.qualities.shoddy, color: "gray", img};
            }
            return {q: LANG.qualities.unknown, color: "#999", img};
        },

        processReport(index, htmlData) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlData, "text/html");

            const titleText = (
                doc.querySelector(".quickedit-label")?.textContent ||
                doc.querySelector(".report-title")?.textContent ||
                ""
            ).trim();

            const coordsMatch = titleText.match(/\d{1,3}\|\d{1,3}/g);
            const defenderCoord = coordsMatch?.length >= 2 ? coordsMatch[coordsMatch.length - 1] : "???";
            const defenderName = doc.querySelector("#attack_info_def a")?.textContent.trim();

            let defenderHref = "#";
            if (defenderCoord !== "???") {
                const [x, y] = defenderCoord.split("|");
                defenderHref = `/game.php?screen=map&x=${x}&y=${y}`;
            }

            const relicElems = Array.from(doc.querySelectorAll(
                "[class*='relic'], img[src*='relic'], .inline-relic, .relic-icon-small"
            ));

            relicElems.forEach(elem => {
                const raw = (elem.textContent || elem.getAttribute("title") || "").trim();
                if (!raw) return;

                const qc = this.detectQuality(elem);
                this.relics.push({
                    village: defenderCoord,
                    distance: this.calculateDistanceFromCurrentVillage(defenderCoord),
                    defenderName,
                    villageHref: defenderHref,
                    relic: raw,
                    quality: qc.q,
                    color: qc.color,
                    img: qc.img,
                    reportUrl: this.reportUrls[index]
                });
            });
        },

        displayResults() {
            if (this.relics.length === 0) {
                UI.ErrorMessage(LANG.noRelicsFound);
                return;
            }

            // Remove duplicates - keep only the first relic for each village
            const uniqueRelics = [];
            const seenVillages = new Set();

            this.relics.forEach(relic => {
                if (!seenVillages.has(relic.village)) {
                    seenVillages.add(relic.village);
                    uniqueRelics.push(relic);
                }
            });

            // sort by distance
            uniqueRelics.sort((a, b) => a.distance - b.distance);

            const renownedCount = uniqueRelics.filter(r => r.quality === LANG.qualities.renowned).length;
            const superiorCount = uniqueRelics.filter(r => r.quality === LANG.qualities.superior).length;
            const refinedCount = uniqueRelics.filter(r => r.quality === LANG.qualities.refined).length;
            const polishedCount = uniqueRelics.filter(r => r.quality === LANG.qualities.polished).length;
            const shoddyCount = uniqueRelics.filter(r => r.quality === LANG.qualities.shoddy).length;

            let html = `
                <div style="margin-bottom: 15px;">
                    <button class="btn btn-default filter-btn" data-filter="all">Show All (${uniqueRelics.length})</button>
                    <button class="btn btn-default filter-btn" data-filter="${LANG.qualities.renowned}" style="color: orange;">${LANG.qualities.renowned} (${renownedCount})</button>
                    <button class="btn btn-default filter-btn" data-filter="${LANG.qualities.superior}" style="color: purple">${LANG.qualities.superior} (${superiorCount})</button>
                    <button class="btn btn-default filter-btn" data-filter="${LANG.qualities.refined}" style="color: blue;">${LANG.qualities.refined} (${refinedCount})</button>
                    <button class="btn btn-default filter-btn" data-filter="${LANG.qualities.polished}" style="color: green;">${LANG.qualities.polished} (${polishedCount})</button>
                    <button class="btn btn-default filter-btn" data-filter="${LANG.qualities.shoddy}" style="color: gray;">${LANG.qualities.shoddy} (${shoddyCount})</button>
                </div>
                <div style="margin-bottom: 10px; padding-right: 10px;max-height: 400px; overflow-y: auto;">
                    <table class="vis" id="relicTable" style="width:100%">
                        <tr>
                            <th>${LANG.tableHeaders.location}</th>
                            <th>${LANG.tableHeaders.distance}</th>
                            <th>${LANG.tableHeaders.relic}</th>
                            <th>${LANG.tableHeaders.quality}</th>
                            <th>${LANG.tableHeaders.reportLink}</th>
                        </tr>
                `;

            uniqueRelics.forEach((r, index) => {
                html += `
                    <tr class="relic-row" data-quality="${r.quality}">
                        <td><a href="${r.villageHref}">${r.defenderName ?? r.village}</a></td>
                        <td>${r.distance}</td>
                        <td style="max-width:380px;word-break:break-word">${r.img ? r.img.outerHTML : ''} ${r.relic}</td>
                        <td style="color:${r.color}">${r.quality}</td>
                        <td><a href="${r.reportUrl}" target="_blank">${LANG.tableHeaders.reportLink}</a></td>
                    </tr>
                `;
            });

            html += `</table></div>`;
            UI.AjaxPopup(null, "shinkoRelicFinder", html, LANG.foundRelics, null, {dataType: "prerendered"}, 800, "auto", 330, 200);
            // Add event listeners to filter buttons
            this.setupFilterListeners();
        },

        setupFilterListeners() {
            const filterBtns = document.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const filter = e.target.getAttribute('data-filter');
                    const rows = document.querySelectorAll('.relic-row');

                    // Update button styling
                    filterBtns.forEach(b => b.classList.remove('btn-confirm-yes'));
                    e.target.classList.add('btn-confirm-yes');

                    // Filter rows
                    rows.forEach(row => {
                        if (filter === 'all') {
                            row.style.display = '';
                        } else {
                            row.style.display = row.getAttribute('data-quality') === filter ? '' : 'none';
                        }
                    });
                });
            });
        },
        calculateDistanceFromCurrentVillage(coord) {
            const [x, y] = coord.split("|").map(Number);
            const dx = Math.abs(x - game_data.village.x);
            const dy = Math.abs(y - game_data.village.y);
            return dx + dy;
        }
    };


    // make sure bot protection is not already present before initializing
    if (document.querySelector("#botprotection_quest, .bot-protection-row")) {
        UI.ErrorMessage("Bot protection detected. Script execution stopped, please solve the captcha and run the script again.", 10000);
        return;
    }

    // watch current DOM for bot protection elements in case they change in the future
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        if (node.matches("#botprotection_quest, .bot-protection-row") || node.querySelector("#botprotection_quest, .bot-protection-row")) {
                            observer.disconnect();
                            UI.ErrorMessage("Bot protection detected. Script execution stopped, please solve the captcha and run the script again.", 10000);
                            RelicFinder.stopped = true;
                            throw new Error("Bot protection detected. Please solve the captcha and run the script again.");
                        }
                    }
                });
            }
        });
    });
    observer.observe(document.body, {childList: true, subtree: true});
    RelicFinder.init();
})();