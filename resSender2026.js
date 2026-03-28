(function () {
    'use strict';

    class AppConfig {
        constructor() {
            this.locale = game_data.locale;
            this.isSitter = game_data.player.sitter > 0;
            this.playerId = game_data.player.id;
            this.storageKeys = {
                coordinate: 'resLimit_coordinate',
                resLimit: 'resLimit_value',
            };
            this.defaultResLimit = 0;
            this.resourcePercentages = {
                wood: 28000 / 83000,
                stone: 30000 / 83000,
                iron: 25000 / 83000,
            };
            this.colors = {
                background: '#36393f',
                border: '#3e4147',
                header: '#202225',
                title: '#ffffdf',
            };
            this.translations = this.initializeTranslations();
            this.loadFromStorage();
        }

        initializeTranslations() {
            const translations = {
                en_US: [
                    'Resource sender for flag boost minting',
                    'Enter coordinate to send to',
                    'Save',
                    'Creator',
                    'Player',
                    'Village',
                    'Points',
                    'Coordinate to send to',
                    'Keep WH% behind',
                    'Recalculate res/change',
                    'Res sender',
                    'Source village',
                    'Target village',
                    'Distance',
                    'Wood',
                    'Clay',
                    'Iron',
                    'Send resources',
                    "Created by Sophie 'Shinko to Kuma'"
                ],
                en_DK: [
                    'Resource sender for flag boost minting',
                    'Enter coordinate to send to',
                    'Save',
                    'Creator',
                    'Player',
                    'Village',
                    'Points',
                    'Coordinate to send to',
                    'Keep WH% behind',
                    'Recalculate res/change',
                    'Res sender',
                    'Source village',
                    'Target village',
                    'Distance',
                    'Wood',
                    'Clay',
                    'Iron',
                    'Send resources',
                    "Created by Sophie 'Shinko to Kuma'"
                ],
                el_GR: [
                    'Αποστολή πόρων',
                    'Εισάγετε τις συντεταγμένες - στόχο',
                    'Αποθήκευση',
                    'Δημιουργός',
                    'Παίκτης',
                    'Χωριό',
                    'Πόντοι',
                    'Στόχος',
                    'Διατήρησε το % Αποθήκης κάτω από',
                    'Υπολογισμός πόρων/αλλαγή στόχου',
                    'Αποστολή πόρων',
                    'Προέλευση',
                    'Χωριό στόχος',
                    'Απόσταση',
                    'Ξύλο',
                    'Πηλός',
                    'Σίδερο',
                    'Αποστολή πόρων',
                    'Δημιουργήθηκε από την Sophie \'Shinko to Kuma\''
                ],
                nl_NL: [
                    'Grondstoffen versturen voor vlagfarmen',
                    'Geef coordinaat in om naar te sturen',
                    'Opslaan',
                    'Scripter',
                    'Speler',
                    'Dorp',
                    'Punten',
                    'Coordinaat om naar te sturen',
                    'Hou WH% achter',
                    'Herbereken gs/doelwit',
                    'Gs versturen',
                    'Oorsprong',
                    'Doelwit',
                    'Afstand',
                    'Hout',
                    'Leem',
                    'Ijzer',
                    'Verstuur grondstoffen',
                    'Gemaakt door Sophie \'Shinko to Kuma\''
                ],
                it_IT: [
                    'Script pushing per coniare',
                    'Inserire le coordinate a cui mandare risorse',
                    'Salva',
                    'Creatrice',
                    'Giocatore',
                    'Villaggio',
                    'Punti',
                    'Coordinate a cui mandare',
                    'Conserva % magazzino',
                    'Ricalcola trasporti',
                    'Invia risorse',
                    'Villaggio di origine',
                    'Villaggio di destinazione',
                    'Distanza',
                    'Legno',
                    'Argilla',
                    'Ferro',
                    'Manda risorse',
                    'Creato da Sophie \'Shinko to Kuma\''
                ],
                pt_BR: [
                    'Enviar recursos para cunhagem de moedas',
                    'Insira coordenada para enviar recursos',
                    'Salvar',
                    'Criador',
                    'Jogador',
                    'Aldeia',
                    'Pontos',
                    'Enviar para',
                    'Manter % no armazém',
                    'Recalcular transporte',
                    'Enviar recursos',
                    'Origem',
                    'Destino',
                    'Distância',
                    'Madeira',
                    'Argila',
                    'Ferro',
                    'Enviar recursos',
                    'Criado por Sophie \'Shinko to Kuma\''
                ]
            };
            return translations[this.locale] || translations.en_US;
        }

        getLangString(index) {
            return this.translations[index] || '';
        }

        getResourcePercentage(resource) {
            return this.resourcePercentages[resource] || 0;
        }

        loadFromStorage() {
            const storedCoord = sessionStorage.getItem(this.storageKeys.coordinate);
            const storedLimit = sessionStorage.getItem(this.storageKeys.resLimit);

            this.coordinate = storedCoord || '';
            this.resLimit = storedLimit ? parseInt(storedLimit) : this.defaultResLimit;
        }

        saveToStorage() {
            sessionStorage.setItem(this.storageKeys.coordinate, this.coordinate);
            sessionStorage.setItem(this.storageKeys.resLimit, this.resLimit);
        }
    }

    class VillageData {
        constructor(data) {
            this.id = data.id;
            this.url = data.url;
            this.coord = data.coord;
            this.name = data.name;
            this.wood = parseInt(data.wood) || 0;
            this.stone = parseInt(data.stone) || 0;
            this.iron = parseInt(data.iron) || 0;
            this.availableMerchants = parseInt(data.availableMerchants) || 0;
            this.totalMerchants = parseInt(data.totalMerchants) || 0;
            this.warehouseCapacity = parseInt(data.warehouseCapacity) || 0;
            this.farmSpaceUsed = parseInt(data.farmSpaceUsed) || 0;
            this.farmSpaceTotal = parseInt(data.farmSpaceTotal) || 0;
        }

        getResourceTotal() {
            return this.wood + this.stone + this.iron;
        }

        toJSON() {
            return {
                id: this.id,
                url: this.url,
                coord: this.coord,
                name: this.name,
                wood: this.wood,
                stone: this.stone,
                iron: this.iron,
                availableMerchants: this.availableMerchants,
                totalMerchants: this.totalMerchants,
                warehouseCapacity: this.warehouseCapacity,
                farmSpaceUsed: this.farmSpaceUsed,
                farmSpaceTotal: this.farmSpaceTotal
            };
        }
    }

    class CoordinateService {
        static parseCoordinate(input) {
            const match = input.match(/^(\d+)\|(\d+)$/);
            return match ? match[0] : null;
        }

        static validateCoordinate(coord) {
            const match = coord.match(/^(\d+)\|(\d+)$/);
            return match !== null;
        }

        static calculateDistance(x1, y1, x2, y2) {
            const a = x1 - x2;
            const b = y1 - y2;
            return Math.round(Math.hypot(a, b));
        }

        static extractCoordinates(coord) {
            const parts = coord.split('|');
            return {x: parseInt(parts[0]), y: parseInt(parts[1])};
        }

        static async coordToId(coordinate) {
            const config = AppConfig.getInstance();
            let url;

            if (config.isSitter) {
                url = `game.php?t=${config.playerId}&screen=api&ajax=target_selection&input=${coordinate}&type=coord`;
            } else {
                url = `/game.php?&screen=api&ajax=target_selection&input=${coordinate}&type=coord`;
            }

            return new Promise((resolve, reject) => {
                $.get(url, function (json) {
                    if (json.villages && json.villages.length > 0) {
                        const village = json.villages[0];
                        resolve({
                            id: village.id,
                            name: village.name,
                            image: village.image,
                            player: village.player_name,
                            points: village.points,
                            x: village.x,
                            y: village.y
                        });
                    } else {
                        reject(new Error('Village not found'));
                    }
                }).fail(() => reject(new Error('Failed to fetch village data')));
            });
        }
    }

    class ResourceCalculator {
        constructor(config) {
            this.config = config;
        }

        calculateShipment(sourceVillage, warehouseLimit) {
            const merchantCarry = sourceVillage.availableMerchants * 1000;
            const leaveBehindRes = Math.floor(sourceVillage.warehouseCapacity / 100 * warehouseLimit);

            let localWood = sourceVillage.wood - leaveBehindRes;
            let localStone = sourceVillage.stone - leaveBehindRes;
            let localIron = sourceVillage.iron - leaveBehindRes;

            localWood = Math.max(0, localWood);
            localStone = Math.max(0, localStone);
            localIron = Math.max(0, localIron);

            return this.calculateProportionalShipment(merchantCarry, localWood, localStone, localIron);
        }

        calculateProportionalShipment(merchantCarry, wood, stone, iron) {
            const woodPerc = this.config.getResourcePercentage('wood');
            const stonePerc = this.config.getResourcePercentage('stone');
            const ironPerc = this.config.getResourcePercentage('iron');

            let merchantWood = merchantCarry * woodPerc;
            let merchantStone = merchantCarry * stonePerc;
            let merchantIron = merchantCarry * ironPerc;

            // Adjust if any resource exceeds available
            let perc = 1;
            if (merchantWood > wood) {
                perc = wood / merchantWood;
                merchantWood *= perc;
                merchantStone *= perc;
                merchantIron *= perc;
            }
            if (merchantStone > stone) {
                perc = stone / merchantStone;
                merchantWood *= perc;
                merchantStone *= perc;
                merchantIron *= perc;
            }
            if (merchantIron > iron) {
                perc = iron / merchantIron;
                merchantWood *= perc;
                merchantStone *= perc;
                merchantIron *= perc;
            }

            return {
                wood: Math.floor(merchantWood),
                stone: Math.floor(merchantStone),
                iron: Math.floor(merchantIron)
            };
        }
    }

    // ==================== VillageDataFetcher ====================
    class VillageDataFetcher {
        constructor(config) {
            this.config = config;
        }

        async fetch() {
            let url;
            if (this.config.isSitter) {
                url = `game.php?t=${this.config.playerId}&screen=overview_villages&mode=prod&page=-1&`;
            } else {
                url = 'game.php?&screen=overview_villages&mode=prod&page=-1&';
            }

            return new Promise((resolve, reject) => {
                $.get(url, function (page) {
                    try {
                        const villageDataList = this.parseVillageData(page);
                        resolve(villageDataList);
                    } catch (error) {
                        reject(error);
                    }
                }.bind(this)).fail(() => reject(new Error('Failed to fetch village data')));
            });
        }

        parseVillageData(page) {
            const $page = $(page);

            // Check if mobile format (widgets)
            const $mobileContainer = $page.find('.overview-container');
            if ($mobileContainer.length > 0) {
                return this.parseMobileWidgets($mobileContainer);
            }

            // Check if desktop format (table)
            const $table = $page.find('#production_table');
            if ($table.length === 0) {
                throw new Error('Could not find production_table or overview-container');
            }

            return this.parseProductionTable($table);
        }

        parseProductionTable($table) {
            const columnIndices = this.findColumnIndices($table);

            const villages = [];
            const $rows = $table.find('tbody tr');
            $rows.each((rowIndex, row) => {
                const $row = $(row);
                const $cells = $row.find('td');

                try {
                    const villageData = this.parseTableRow($cells, columnIndices);
                    if (villageData) {
                        villages.push(new VillageData(villageData));
                    }
                } catch (error) {
                    console.warn(`Failed to parse village row ${rowIndex}:`, error);
                }
            });

            return villages;
        }

        findColumnIndices($table) {
            const indices = {
                name: -1,
                warehouse: -1,
                merchants: -1,
                farm: -1
            };

            // Iterate through th elements to get correct column index
            const $headerCells = $table.find('thead th');
            $headerCells.each((thIndex, th) => {
                const $th = $(th);
                const $anchor = $th.find('a');

                if ($anchor.length > 0) {
                    const href = $anchor.attr('href') || '';

                    if (href.includes('order=name')) {
                        indices.name = thIndex;
                    } else if (href.includes('order=storage_max')) {
                        indices.warehouse = thIndex;
                    } else if (href.includes('order=trader_available')) {
                        indices.merchants = thIndex;
                    } else if (href.includes('order=pop')) {
                        indices.farm = thIndex;
                    }
                }
            });

            return indices;
        }

        parseTableRow($cells, columnIndices) {
            // Extract village info from name column
            const $nameCell = $cells.eq(columnIndices.name);
            const $villageEl = $nameCell.find('.quickedit-vn');
            if ($villageEl.length === 0) {
                return null;
            }

            const villageId = $villageEl.data('id');
            const $link = $villageEl.find('a').first();
            const villageUrl = $link.attr('href');
            const nameText = $villageEl.find('.quickedit-label').data('text') || '';

            const coordMatch = $villageEl[0].innerText.match(/\((\d+\|\d+)\)/);
            const coord = coordMatch ? coordMatch[1] : '';

            // Extract resources from their respective columns (they're always in resource columns)
            const $resourceCell = $cells.eq(columnIndices.warehouse -1);
            const wood = this.extractResourceAmount($resourceCell.find('.res.wood'));
            const stone = this.extractResourceAmount($resourceCell.find('.res.stone'));
            const iron = this.extractResourceAmount($resourceCell.find('.res.iron'));

            // Extract warehouse capacity from warehouse column
            const $warehouseCell = $cells.eq(columnIndices.warehouse);
            const warehouseCapacity = this.cleanNumber($warehouseCell.text());

            // Extract merchants from merchants column
            const $merchantsCell = $cells.eq(columnIndices.merchants);
            const merchantsMatch = $merchantsCell.text().match(/(\d+)\/(\d+)/);
            const availableMerchants = merchantsMatch ? merchantsMatch[1] : '0';
            const totalMerchants = merchantsMatch ? merchantsMatch[2] : '999';

            // Extract farm space from farm column
            const $farmCell = $cells.eq(columnIndices.farm);
            const farmMatch = $farmCell.text().match(/(\d+)\/(\d+)/);
            const farmSpaceUsed = farmMatch ? farmMatch[1] : '0';
            const farmSpaceTotal = farmMatch ? farmMatch[2] : '0';

            return {
                id: villageId,
                url: villageUrl,
                coord: coord,
                name: nameText,
                wood: wood,
                stone: stone,
                iron: iron,
                availableMerchants: availableMerchants,
                totalMerchants: totalMerchants,
                warehouseCapacity: warehouseCapacity,
                farmSpaceUsed: farmSpaceUsed,
                farmSpaceTotal: farmSpaceTotal
            };
        }

        extractResourceAmount($element) {
            if ($element.length === 0) return '0';
            let value = $element.text();
            return this.cleanNumber(value);
        }

        cleanNumber(value) {
            if (!value) return '0';
            // Remove dots (thousands separators) and commas (decimal separators)
            return value.replace(/\./g, '').replace(',', '').trim();
        }

        parseMobileWidgets($container) {
            const mobileVillages = [];
            const $widgets = $container.find('.widget.overview-container-item');

            $widgets.each((widgetIndex, widget) => {
                const $widget = $(widget);

                try {
                    const villageData = this.parseMobileWidget($widget);
                    if (villageData) {
                        mobileVillages.push(new VillageData(villageData));
                    }
                } catch (error) {
                    console.warn(`Failed to parse mobile widget ${widgetIndex}:`, error);
                }
            });
            return mobileVillages;
        }

        parseMobileWidget($widget) {
            // Extract village info from header
            const $header = $widget.find('.head.overview_tile_header.points-header');
            const $villageEl = $header.find('.quickedit-vn');

            if ($villageEl.length === 0) {
                return null;
            }

            const villageId = $villageEl.data('id');
            const $link = $villageEl.find('a').first();
            const villageUrl = $link.attr('href');
            const nameText = $villageEl.find('.quickedit-label').data('text') || '';

            // Extract coordinate from name text (format: "001 - Boo (497|509)")
            const coordMatch = $villageEl[0].innerText.match(/\((\d+\|\d+)\)/);
            const coord = coordMatch ? coordMatch[1] : '';

            // Extract resources from resource-row
            const $resourceRow = $widget.find('.resource-row');
            const wood = this.extractResourceAmount($resourceRow.find('.res.mwood'));
            const stone = this.extractResourceAmount($resourceRow.find('.res.mstone'));
            const iron = this.extractResourceAmount($resourceRow.find('.res.miron'));

            // Extract warehouse capacity
            const $warehouseColumn = $widget.find('.production_column').filter((i, el) => {
                return $(el).find('.overview_subheader').text().includes('Warehouse:');
            });
            const warehouseCapacity = this.cleanNumber($warehouseColumn.find('span').last().text());

            // Extract farm space
            const $farmColumn = $widget.find('.production_column').filter((i, el) => {
                return $(el).find('.overview_subheader').text().includes('Farm:');
            });
            const farmText = $farmColumn.find('span').last().text();
            const farmMatch = farmText.match(/(\d+)\/(\d+)/);
            const farmSpaceUsed = farmMatch ? farmMatch[1] : '0';
            const farmSpaceTotal = farmMatch ? farmMatch[2] : '0';

            // Extract merchants
            const $merchantsColumn = $widget.find('.production_column').filter((i, el) => {
                return $(el).find('.overview_subheader').text().includes('Merchants:');
            });
            const merchantsText = $merchantsColumn.find('span').last().text();
            const availableMerchants = this.cleanNumber(merchantsText);
            const totalMerchants = '999'; // Mobile doesn't show total merchants

            return {
                id: villageId,
                url: villageUrl,
                coord: coord,
                name: nameText,
                wood: wood,
                stone: stone,
                iron: iron,
                availableMerchants: availableMerchants,
                totalMerchants: totalMerchants,
                warehouseCapacity: warehouseCapacity,
                farmSpaceUsed: farmSpaceUsed,
                farmSpaceTotal: farmSpaceTotal
            };
        }
    }

    class UIElementFactory {
        constructor(config) {
            this.config = config;
        }

        getStyleSheet() {
            return `
            <style>
            .sophRowA {
                background-color: #32353b;
                color: white;
            }
            .sophRowB {
                background-color: #36393f;
                color: white;
            }
            .sophHeader {
                background-color: #202225;
                font-weight: bold;
                color: white;
            }
            </style>`;
        }

        createSettingsPanel() {
            return `
            <div id="resourceSender">
            <table id="Settings" width="600">
                <thead>
                    <tr>
                        <td class="sophHeader">${this.config.getLangString(7)}</td>
                        <td class="sophHeader">${this.config.getLangString(8)}</td>
                        <td class="sophHeader"></td>
                        <td class="sophHeader"></td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="sophRowA">
                            <input type="text" ID="coordinateTarget" name="coordinateTarget" size="20" margin="5" align=left>
                        </td>
                        <td class="sophRowA" align="right">
                            <input type="text" ID="resPercent" name="resPercent" size="1" align=right>%
                        </td>
                        <td class="sophRowA" margin="5">
                            <button type="button" ID="button" class="btn-confirm-yes" >${this.config.getLangString(2)}</button>
                        </td>
                        <td class="sophRowA">
                            <button type="button" ID="sendRes" class="btn" name="sendRes"> ${this.config.getLangString(9)}</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            </br>
            </div>`;
        }

        createResourceTable() {
            return `
            <div id="sendResources" border=0>
            <table id="tableSend" width="100%">
                <tbody id="appendHere">
                    <tr>
                        <td class="sophHeader" colspan=7 width="550" style="text-align:center" >${this.config.getLangString(10)}</td>
                    </tr>
                    <tr>
                        <td class="sophHeader" width="25%" style="text-align:center">${this.config.getLangString(11)}</td>
                        <td class="sophHeader" width="25%" style="text-align:center">${this.config.getLangString(12)}</td>
                        <td class="sophHeader" width="5%" style="text-align:center">${this.config.getLangString(13)}</td>
                        <td class="sophHeader" width="10%" style="text-align:center">${this.config.getLangString(14)}</td>
                        <td class="sophHeader" width="10%" style="text-align:center">${this.config.getLangString(15)}</td>
                        <td class="sophHeader" width="10%" style="text-align:center">${this.config.getLangString(16)}</td>
                        <td class="sophHeader" width="15%">
                            <font size="1">${this.config.getLangString(18)}</font>
                        </td>
                    </tr>
                </tbody>
            </table>
            </div>`;
        }

        createTargetInfo(targetVillage, totalSent) {
            return `
            <table id="playerTarget" width="600">
            <tbody>
                <tr>
                    <td class="sophHeader" rowspan="3"><img src="${targetVillage.image}"></td>
                    <td class="sophHeader">${this.config.getLangString(4)}:</td>
                    <td class="sophRowA">${targetVillage.player}</td>
                    <td class="sophHeader"><span class="icon header wood"> </span></td>
                    <td class="sophRowB" id="woodSent">${this.formatNumber(totalSent.wood)}</td>
                </tr>
                <tr>
                    <td class="sophHeader">${this.config.getLangString(5)}:</td>
                    <td class="sophRowB">${targetVillage.name}</td>
                    <td class="sophHeader"><span class="icon header stone"> </span></td>
                    <td class="sophRowA" id="stoneSent">${this.formatNumber(totalSent.stone)}</td>
                </tr>
                <tr>
                    <td class="sophHeader">${this.config.getLangString(6)}: </td>
                    <td class="sophRowA">${targetVillage.points}</td>
                    <td class="sophHeader"><span class="icon header iron"> </span></td>
                    <td class="sophRowB" id="ironSent">${this.formatNumber(totalSent.iron)}</td>
                </tr>
            </tbody>
            </table>`;
        }

        createTableRow(rowIndex, sourceVillage, targetVillage, distance, resources) {
            const rowClass = rowIndex % 2 === 0 ? 'sophRowB' : 'sophRowA';
            const totalRes = resources.wood + resources.stone + resources.iron;

            if (totalRes === 0) return '';

            return `
                <tr id="${rowIndex}" class="${rowClass}" height="40">
                <td><a href="${sourceVillage.url}" style="color:#40D0E0;">${sourceVillage.name}</a></td>
                <td><a href="" style="color:#40D0E0;">${targetVillage.name}</a></td>
                <td>${distance}</td>
                <td width="50" style="text-align:center">${resources.wood}<span class="icon header wood"> </span></td>
                <td width="50" style="text-align:center">${resources.stone}<span class="icon header stone"> </span></td>
                <td width="50" style="text-align:center">${resources.iron}<span class="icon header iron"> </span></td>
                <td style="text-align:center"><input type="button" class="btn evt-confirm-btn btn-confirm-yes" data-row="${rowIndex}" value="${this.config.getLangString(17)}" /></td>
                </tr>`;
        }

        createInitialDialog() {
            return `<div style="max-width:1000px;">
                <h2 class="popup_box_header">
                   <center><u><font color="darkgreen">${this.config.getLangString(0)}</font></u></center>
                </h2>
                <hr>
                <p><center><font color="maroon"><b>${this.config.getLangString(1)}</b></font></center></p>
                <center>
                    <table>
                        <tr>
                            <td><center><input type="text" ID="coordinateTargetFirstTime" name="coordinateTargetFirstTime" size="20" margin="5" align=left></center></td>
                        </tr>
                        <tr></tr>
                        <tr><td><center><input type="button" class="btn evt-cancel-btn btn-confirm-yes" id="saveCoord" value="${this.config.getLangString(2)}">&emsp;</center></td></tr>
                        <tr></tr>
                    </table>
                </center>
                <br>
                <hr>
                <center><p>${this.config.getLangString(3)}: <a href="https://shinko-to-kuma.my-free.website/" title="Sophie profile" target="_blank">Sophie "Shinko to Kuma"</a></p></center>
                </div>`;
        }

        formatNumber(num) {
            const str = num.toString();
            let result = '';
            let count = 0;
            for (let i = str.length - 1; i >= 0; i--) {
                if (count > 0 && count % 3 === 0) {
                    result = '.' + result;
                }
                result = str[i] + result;
                count++;
            }
            return result;
        }
    }

    // ==================== UIManager ====================
    class UIManager {
        constructor(config, factory) {
            this.config = config;
            this.factory = factory;
            this.isMobile = !!$("#mobileHeader")[0];
            this.targetVillage = null;
            this.warehouseLimit = 0;
            this.totalSent = {wood: 0, stone: 0, iron: 0};
        }

        init() {
            this.injectStyles();
        }

        injectStyles() {
            const stylesheet = this.factory.getStyleSheet();
            const $container = this.isMobile ? $("#mobileHeader").eq(0) : $("#contentContainer").eq(0);
            $container.prepend(stylesheet);
        }

        renderSettingsPanel() {
            const panel = this.factory.createSettingsPanel();
            const $container = this.isMobile ? $("#mobileHeader") : $("#contentContainer");
            $container.prepend(panel);

            $("#resPercent")[0].value = this.config.resLimit;
            $("#coordinateTarget")[0].value = this.config.coordinate;
        }

        renderResourceTable(villages, calculator, targetVillage, targetCoord) {
            const html = this.factory.createResourceTable();
            const sendContainer = $("#resourceSender");
            sendContainer.append(html);

            sendContainer.prepend(this.factory.createTargetInfo(targetVillage, this.totalSent));

            let rowHtml = '';
            let rowIndex = 0;

            for (let i = 0; i < villages.length; i++) {
                const village = villages[i];
                if (village.id === targetVillage.id) continue; // Skip target village

                const resources = calculator.calculateShipment(village, this.config.resLimit);
                const coords = CoordinateService.extractCoordinates(village.coord);
                const distance = CoordinateService.calculateDistance(
                    targetCoord.x, targetCoord.y,
                    coords.x, coords.y
                );

                const row = this.factory.createTableRow(rowIndex, village, targetVillage, distance, resources);
                if (row) {
                    rowHtml += row;
                    rowIndex++;
                }
            }

            $("#appendHere").append(rowHtml);
            this.sortTable(2);
            // Focus first button
            $(":button[data-row]").first().focus();
        }

        removeOldUI() {
            $("#sendResources").remove();
            $("#resourceSender").remove();
        }

        updateSentTotals(wood, stone, iron) {
            this.totalSent.wood += wood;
            this.totalSent.stone += stone;
            this.totalSent.iron += iron;

            $("#woodSent").text(this.factory.formatNumber(this.totalSent.wood));
            $("#stoneSent").text(this.factory.formatNumber(this.totalSent.stone));
            $("#ironSent").text(this.factory.formatNumber(this.totalSent.iron));
        }

        removeRow(rowIndex) {
            $(`#${rowIndex}`).remove();
        }

        showCompletionMessage() {
            alert('Finished sending!');
            if ($('.btn-pp').length > 0) {
                $('.btn-pp').remove();
            }
        }

        bindSettingsEvents(onSettingsSave, onRecalculate) {
            $('#button').click(() => {
                const coord = CoordinateService.parseCoordinate($("#coordinateTarget")[0].value);
                if (coord) {
                    this.config.coordinate = coord;
                    this.config.resLimit = parseInt($("#resPercent")[0].value) || 0;
                    this.config.saveToStorage();
                    onSettingsSave();
                }
            });

            $('#sendRes').click(onRecalculate);
        }

        bindSendButtons(onSendRequest) {
            $(document).on('click', 'input[data-row]', (e) => {
                const button = e.target;
                const $row = $(button).closest('tr');
                const rowData = {
                    index: button.dataset.row,
                    wood: parseInt($row.find('td').eq(3).text()),
                    stone: parseInt($row.find('td').eq(4).text()),
                    iron: parseInt($row.find('td').eq(5).text())
                };
                onSendRequest(rowData);
            });
        }

        sortTable(columnIndex) {
            const table = document.getElementById("tableSend");
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr')).slice(2); // Skip header rows

            rows.sort((rowA, rowB) => {
                const cellA = rowA.getElementsByTagName('td')[columnIndex];
                const cellB = rowB.getElementsByTagName('td')[columnIndex];
                const valueA = Number(cellA.textContent) || 0;
                const valueB = Number(cellB.textContent) || 0;
                return valueA - valueB;
            });

            rows.forEach((row, index) => {
                const rowClass = index % 2 === 0 ? 'sophRowA' : 'sophRowB';
                row.className = rowClass;
                tbody.appendChild(row);
            });
        }

        isTableEmpty() {
            return $("#tableSend tr").length <= 2;
        }
    }

    class ResourceSender {
        constructor(config) {
            this.config = config;
            this.sendInProgress = false;
        }

        async sendResource(sourceId, targetId, wood, stone, iron) {
            if (this.sendInProgress) return;

            this.sendInProgress = true;
            const data = {
                target_id: targetId,
                wood: wood,
                stone: stone,
                iron: iron
            };

            return new Promise((resolve, reject) => {
                TribalWars.post('market', {
                    ajaxaction: 'map_send',
                    village: sourceId
                }, data, (response) => {
                    this.sendInProgress = false;
                    UI.SuccessMessage(response.message);
                    resolve(response);
                }, (error) => {
                    this.sendInProgress = false;
                    reject(new Error(error));
                });
            });
        }
    }

    class AppController {
        constructor() {
            this.config = AppConfig.getInstance();
            this.calculator = new ResourceCalculator(this.config);
            this.fetcher = new VillageDataFetcher(this.config);
            this.factory = new UIElementFactory(this.config);
            this.uiManager = new UIManager(this.config, this.factory);
            this.resourceSender = new ResourceSender(this.config);
            this.villages = [];
            this.targetVillage = null;
            this.targetCoord = null;
        }

        static getInstance() {
            if (!AppController.instance) {
                AppController.instance = new AppController();
            }
            return AppController.instance;
        }

        async initialize() {
            this.uiManager.init();
            await this.askUserForTarget();
        }

        async askUserForTarget() {
            const dialogContent = this.factory.createInitialDialog();
            Dialog.show('Resource Sender', dialogContent);

            return new Promise((resolve) => {
                $('#saveCoord').click(async () => {
                    const input = $("#coordinateTargetFirstTime")[0].value;
                    const coord = CoordinateService.parseCoordinate(input);
                    if (!coord || !CoordinateService.validateCoordinate(coord)) {
                        alert('Invalid coordinate format. Use format: X|Y');
                        return;
                    }

                    this.config.coordinate = coord;
                    this.config.saveToStorage();

                    try {
                        this.targetVillage = await CoordinateService.coordToId(coord);
                        this.targetCoord = CoordinateService.extractCoordinates(coord);
                        Dialog.close();
                        await this.fetchAndDisplay();
                        resolve();
                    } catch (error) {
                        alert('Failed to fetch village data. Please try again.');
                    }
                });
            });
        }

        async fetchAndDisplay() {
            try {
                this.villages = await this.fetcher.fetch();
                this.displayUI();
            } catch (error) {
                alert('Failed to fetch village data. Please try again.');
            }
        }

        displayUI() {
            this.uiManager.removeOldUI();
            this.uiManager.renderSettingsPanel();
            this.uiManager.renderResourceTable(this.villages, this.calculator, this.targetVillage, this.targetCoord);
            this.bindEvents();
        }

        bindEvents() {
            this.uiManager.bindSettingsEvents(
                () => this.fetchAndDisplay(),
                () => this.fetchAndDisplay()
            );

            this.uiManager.bindSendButtons((rowData) => this.handleSendRequest(rowData));
        }

        async handleSendRequest(rowData) {
            const village = this.villages.find(v => !this.villages.indexOf(v).toString().localeCompare(rowData.index.toString()));
            if (!village) return;

            try {
                await this.resourceSender.sendResource(
                    village.id,
                    this.targetVillage.id,
                    rowData.wood,
                    rowData.stone,
                    rowData.iron
                );

                this.uiManager.updateSentTotals(rowData.wood, rowData.stone, rowData.iron);
                this.uiManager.removeRow(rowData.index);
                $(':button[data-row]').prop('disabled', false);

                if (this.uiManager.isTableEmpty()) {
                    this.uiManager.showCompletionMessage();
                    throw new Error('Done.');
                }

                $(":button[data-row]").first().focus();
            } catch (error) {
                console.error('Error sending resources:', error);
            }
        }
    }

    AppConfig.instance = null;
    AppConfig.getInstance = function () {
        if (!AppConfig.instance) {
            AppConfig.instance = new AppConfig();
        }
        return AppConfig.instance;
    };

    $(document).ready(() => {
        const app = AppController.getInstance();
        app.initialize();
    });

})();
