//script by Sophie "Shinko to Kuma". discord: Sophie#2418 website: https://www.shinko-to-kuma.com/
(function () {
    'use strict';
    /*
    Map SDK by Thomas "Sass" Ameye

    I am not affiliated to Innogames
    Under MIT License:

    Copyright 2022 Thomas "Sass" Ameye

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

    */
    function colorWithOpacity(color, opacity) {
        const temp = document.createElement("canvas").getContext("2d");
        temp.fillStyle = color;
        const computed = temp.fillStyle; // normalized color (often rgb)
        // If already rgb/rgba
        if (computed.startsWith("rgb")) {
            const values = computed.match(/\d+/g);
            return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${opacity})`;
        }

        // If hex (#rrggbb or #rgb)
        if (computed.startsWith("#")) {
            let hex = computed.slice(1);

            if (hex.length === 3) {
                hex = hex.split("").map(c => c + c).join("");
            }

            const num = parseInt(hex, 16);
            const r = (num >> 16) & 255;
            const g = (num >> 8) & 255;
            const b = num & 255;

            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }

        // fallback
        return computed;
    }
    if(game_data.screen === "map") {
        const MapSdk = {
            init() {
                if (this.mapOverlay.mapHandler._spawnSector) {
                    //exists already, don't recreate
                } else {
                    //doesn't exist yet
                    this.mapOverlay.mapHandler._spawnSector = this.mapOverlay.mapHandler.spawnSector;
                }
                this.mapOverlay.mapHandler.spawnSector = (data, sector) => {
                    this.mapOverlay.mapHandler._spawnSector(data, sector);
                    // Main map canvas
                    var beginX = sector.x - data.x;
                    var endX = beginX + this.mapOverlay.mapSubSectorSize;
                    var beginY = sector.y - data.y;
                    var endY = beginY + this.mapOverlay.mapSubSectorSize;
                    for (var x in data.tiles) {
                        var x = parseInt(x, 10);
                        if (x < beginX || x >= endX) {
                            continue;
                        }
                        for (var y in data.tiles[x]) {
                            var y = parseInt(y, 10);
                            if (y < beginY || y >= endY) {
                                continue;
                            }
                            // comment is if you don't want to draw anything in sectors where there are no villages to reduce drawing calls.
                            // var v = this.mapOverlay.villages[(data.x + x) * 1000 + (data.y + y)];
                            // if (v) {
                            var el = $('#mapOverlay_canvas_' + sector.x + '_' + sector.y);
                            if (!el.length) {
                                var canvas = document.createElement('canvas');
                                canvas.style.position = 'absolute';
                                canvas.width = (this.mapOverlay.map.scale[0] * this.mapOverlay.map.sectorSize);
                                canvas.height = (this.mapOverlay.map.scale[1] * this.mapOverlay.map.sectorSize);
                                canvas.style.zIndex = 10;
                                canvas.className = 'mapOverlay_map_canvas';
                                canvas.id = 'mapOverlay_canvas_' + sector.x + '_' + sector.y;
                                sector.appendElement(canvas, 0, 0);

                                // draw here
                                this.redrawSector(sector, canvas);
                            }
                            // }
                        }
                    }

                    // Topo canvas
                    for (var key in this.mapOverlay.minimap._loadedSectors) {
                        var sector = this.mapOverlay.minimap._loadedSectors[key];
                        var el = $('#mapOverlay_topo_canvas_' + key);
                        if (!el.length) {
                            var canvas = document.createElement('canvas');
                            canvas.style.position = 'absolute';
                            canvas.width = '250';
                            canvas.height = '250';
                            canvas.style.zIndex = 11;
                            canvas.className = 'mapOverlay_topo_canvas';
                            canvas.id = 'mapOverlay_topo_canvas_' + key;
                            sector.appendElement(canvas, 0, 0);

                            this.redrawMiniSector(sector, canvas);
                        }
                    }

                }
                this.mapOverlay.reload();
                return "Initialised Map SDK";
            },
            line(x1, y1, x2, y2, styling, sector, canvas) {
                let ctx = canvas.getContext('2d');
                let origin = this.pixelByCoord(sector, x1, y1);
                let target = this.pixelByCoord(sector, x2, y2);
                // TODO: only draw in sectors where the line is in
                ctx.beginPath();
                if (styling.main && styling.main.strokeStyle) ctx.strokeStyle = styling.main.strokeStyle;
                if (styling.main && styling.main.lineWidth) ctx.lineWidth = styling.main.lineWidth;
                if (styling.main && styling.main.fillStyle) ctx.fillStyle = styling.main.fillStyle;
                ctx.moveTo(origin[0], origin[1]);
                ctx.lineTo(target[0], target[1]);
                ctx.stroke();
                ctx.closePath();
            },
            polygon(coords, styling, sector, canvas) {
                let ctx = canvas.getContext('2d');
                ctx.save();
                let origin = this.pixelByCoord(sector, coords[0].x, coords[0].y);
                if (styling.main && styling.main.strokeStyle) ctx.strokeStyle = styling.main.strokeStyle;
                if (styling.main && styling.main.lineWidth) ctx.lineWidth = styling.main.lineWidth;
                if (styling.main && styling.main.fillStyle) ctx.fillStyle = styling.main.fillStyle;
                ctx.beginPath();
                ctx.moveTo(origin[0], origin[1]);
                for (let i = 0; i < coords.length; i++) {
                    let target = this.pixelByCoord(sector, coords[i].x, coords[i].y);
                    ctx.lineTo(target[0], target[1]);
                }
                ctx.closePath();
                ctx.stroke();
                ctx.fill();
                ctx.restore();
            },
            polygonOnMini(coords, styling, sector, canvas) {
                let ctx = canvas.getContext('2d');
                ctx.save();
                let x = (coords[0].x - sector.x) * 5 + 3;
                let y = (coords[0].y - sector.y) * 5 + 3;
                if (styling.mini && styling.mini.strokeStyle) ctx.strokeStyle = styling.mini.strokeStyle;
                if (styling.mini && styling.mini.lineWidth) ctx.lineWidth = styling.mini.lineWidth;
                if (styling.mini && styling.mini.fillStyle) ctx.fillStyle = styling.mini.fillStyle;
                ctx.beginPath();
                ctx.moveTo(x, y);
                for (let i = 0; i < coords.length; i++) {
                    x = (coords[i].x - sector.x) * 5 + 3;
                    y = (coords[i].y - sector.y) * 5 + 3;
                    ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
                ctx.fill();
                ctx.restore();
            },
            iconOnMap(img, x, y, size, sector, canvas) {
                let ctx = canvas.getContext('2d');
                let pos = this.pixelByCoord(sector, x, y);
                // TODO: only draw in sectors where the icon is in
                ctx.drawImage(img, pos[0] - (size / 2), pos[1] - (size / 2), size, size);
            },
            iconOnMiniMap(img, x, y, size, sector, canvas) {
                let ctx = canvas.getContext('2d');
                x = (x - sector.x) * 5 + 3;
                y = (y - sector.y) * 5 + 3;
                ctx.drawImage(img, x - (size / 2), y - (size / 2), size, size);
            },
            pixelByCoord(sector, x, y) {
                let st_pixel = this.mapOverlay.map.pixelByCoord(sector.x, sector.y);
                let originXY = this.mapOverlay.map.pixelByCoord(x, y);
                let originX = (originXY[0] - st_pixel[0]) + this.mapOverlay.tileSize[0] / 2;
                let originY = (originXY[1] - st_pixel[1]) + this.mapOverlay.tileSize[1] / 2;
                return [originX, originY];
            },
            clearMap() {
                this.circles = [];
                this.lines = [];
                this.texts = [];
                this.icons = [];
                // reload the overlay once cleared
                this.mapOverlay.reload();
            },
            redrawSector(sector, canvas) {
                this.polygons.forEach(element => {
                    if (element.drawOnMap) this.polygon(element.coords, element.styling, sector, canvas);
                })
                this.icons.forEach(element => {
                    if (element.drawOnMap) this.iconOnMap(element.img && element.img.src != '' ? element.img : this.defaultImg, element.x, element.y, element.mapSize || 20, sector, canvas);
                })
            },
            redrawMiniSector(sector, canvas) {
                this.icons.forEach(element => {
                    if (element.drawOnMini) this.iconOnMiniMap(element.img && element.img.src != '' ? element.img : this.defaultImg, element.x, element.y, element.miniSize || 5, sector, canvas);
                })
                this.polygons.forEach(element => {
                    if (element.drawOnMini) this.polygonOnMini(element.coords, element.styling, sector, canvas);
                })
            },
            polygons: [],
            icons: [],
            mapOverlay: TWMap,
            defaultImg: new Image()
        };
        MapSdk.defaultImg.src = "/graphic/buildings/wall.png";
        MapSdk.init();
        const relics = JSON.parse(localStorage.getItem("shinkoRelicFinderResults")) || [];
        relics.forEach((relic, index) => {
            const img = new Image();
            img.src = relic.img.match('src="([^"]+)"')[1];
            const x = parseInt(relic.village.substring(0, 3));
            const y = parseInt(relic.village.substring(4, 7));
            MapSdk.icons.push({
                img,
                x: x-0.29,
                y: y+0.21,
                drawOnMini: false,
                drawOnMap: true,
                mapSize: 20,
                miniSize: 5,
            });
            MapSdk.polygons.push({
                coords: [
                    {
                        x: x-0.5,
                        y: y-0.5,
                    },
                    {
                        x: x-0.5,
                        y: y+0.5,
                    },
                    {
                        x: x+0.5,
                        y: y+0.5,
                    },
                    {
                        x: x+0.5,
                        y: y-0.5
                    }
                ],
                styling: {
                    main: {
                        "strokeStyle": relic.color,
                        "lineWidth": 2,
                        "fillStyle": colorWithOpacity(relic.color, 0.4),
                    },
                    mini: {
                        "strokeStyle": 'black',
                        "lineWidth": 1,
                        "fillStyle": colorWithOpacity(relic.color, 0.8),
                    },
                },
                drawOnMini: true,
                drawOnMap: true,
            });
        });

        setTimeout(()=>MapSdk.mapOverlay.reload(), 500);
        return;
    }
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
            this.relics = JSON.parse(localStorage.getItem("shinkoRelicFinderResults")) || [];
            this.collectReportUrlsFromAllPages()
                .then(() => {
                    if (this.reportUrls.length === 0) {
                        UI.ErrorMessage(LANG.noReportsFound);
                        return;
                    }
                    if (this.relics.length > 0) {
                        const processedReportIds = new Set(this.relics.map(r => r.reportId));
                        this.reportUrls = this.reportUrls.filter(url => {
                            const reportId = url.match(/view=(\d+)/)[1];
                            return !processedReportIds.has(reportId);
                        });
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
                    img: qc.img.outerHTML,
                    reportUrl: this.reportUrls[index],
                    reportId: this.reportUrls[index].match(/view=(\d+)/)[1]
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

            // sort by report ID to make sure we take the most recent information
            this.relics.sort((a, b) => parseInt(b.reportId) - parseInt(a.reportId));
            this.relics.forEach(relic => {
                if (!seenVillages.has(relic.village)) {
                    seenVillages.add(relic.village);
                    uniqueRelics.push(relic);
                }
            });
            localStorage.setItem("shinkoRelicFinderResults", JSON.stringify(this.relics));

            // sort by distance
            uniqueRelics.sort((a, b) => a.distance - b.distance);

            const renownedCount = uniqueRelics.filter(r => r.quality === LANG.qualities.renowned).length;
            const superiorCount = uniqueRelics.filter(r => r.quality === LANG.qualities.superior).length;
            const refinedCount = uniqueRelics.filter(r => r.quality === LANG.qualities.refined).length;
            const polishedCount = uniqueRelics.filter(r => r.quality === LANG.qualities.polished).length;
            const shoddyCount = uniqueRelics.filter(r => r.quality === LANG.qualities.shoddy).length;

            let html = `
                <div style="margin-bottom: 15px; display: flex;">
                    <button class="btn btn-default filter-btn btn-confirm-yes" data-filter="all">Show All (${uniqueRelics.length})</button>
                    <button class="btn btn-default filter-btn" data-filter="${LANG.qualities.renowned}" style="color: orange;">${LANG.qualities.renowned} (${renownedCount})</button>
                    <button class="btn btn-default filter-btn" data-filter="${LANG.qualities.superior}" style="color: purple">${LANG.qualities.superior} (${superiorCount})</button>
                    <button class="btn btn-default filter-btn" data-filter="${LANG.qualities.refined}" style="color: blue;">${LANG.qualities.refined} (${refinedCount})</button>
                    <button class="btn btn-default filter-btn" data-filter="${LANG.qualities.polished}" style="color: green;">${LANG.qualities.polished} (${polishedCount})</button>
                    <button class="btn btn-default filter-btn" data-filter="${LANG.qualities.shoddy}" style="color: gray;">${LANG.qualities.shoddy} (${shoddyCount})</button>
                    <button class="btn btn-default" id="clearCache" style="margin-left: auto">Clear cache</button>
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
                        <td style="max-width:380px;word-break:break-word">${r.img ? r.img : ''} ${r.relic}</td>
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
            document.querySelector('#clearCache').addEventListener('click', (e) => {
                localStorage.removeItem("shinkoRelicFinderResults");
                UI.SuccessMessage("Cache cleared! Please close and rerun the script.");
            });
        },
        calculateDistanceFromCurrentVillage(coord) {
            const [x, y] = coord.split("|").map(Number);
            const dx = Math.abs(x - game_data.village.x);
            const dy = Math.abs(y - game_data.village.y);
            return dx + dy;
        },
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