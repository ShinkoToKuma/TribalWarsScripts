/*
    * Mass Scavenging Script for Tribal Wars
    * Version: 2.0
    * Date: 09/03/2026
    * Author: Sophie "Shinko to Kuma"
    * Description: This script allows players to send mass scavenging runs across multiple villages with customizable settings for unit selection, category prioritization, and return times. It features a user-friendly interface and is designed to work on both desktop and mobile versions of the game.
    * Changelog:
    * Version 2.0 - Complete rewrite with new features, improved UI, and better performance.
    * Version 1.0 - Don't even remember tbh, it was a mess but it worked for the most part
 */

//relocate to mass scavenging page
if (window.location.href.indexOf('screen=place&mode=scavenge_mass') < 0) {
    //relocate
    window.location.assign(game_data.link_base_pure + "place&mode=scavenge_mass");
}

var DOM = {
    // Main windows
    main: () => $('#massScavengeSophie'),
    settingsWindow: () => $('#settingsWindow'),

    // Display elements
    offDisplay: () => $('#offDisplay'),
    defDisplay: () => $('#defDisplay'),

    // Containers
    mainCell: () => $('.maincell'),
    mobileContent: () => $('#mobileContent'),
    imgRow: () => $('#imgRow'),

    // Time selectors
    timeSelectorDate: () => $('#timeSelectorDate'),
    timeSelectorHours: () => $('#timeSelectorHours'),
    offDay: () => $('#offDay'),
    offTime: () => $('#offTime'),
    defDay: () => $('#defDay'),
    defTime: () => $('#defTime'),
    runTimeOff: () => $('.runTime_off'),
    runTimeDef: () => $('.runTime_def'),

    // Settings
    settingPriorityBalanced: () => $('#settingPriorityBalanced'),
    settingPriorityPriority: () => $('#settingPriorityPriority'),
    colorThemeSelect: () => $('#colorThemeSelect'),
    premiumEnabledCheckbox: () => $('#premiumEnabledCheckbox'),

    // Buttons
    sendMassButtons: () => $(':button[id^="sendMass"]'),
    sendMassPremiumButtons: () => $(':button[id^="sendMassPremium"]'),

    // Categories
    category1: () => $('#category1'),
    category2: () => $('#category2'),
    category3: () => $('#category3'),
    category4: () => $('#category4'),

    // Unit selectors
    unitCheckbox: (unit) => $(`#${unit}`),
    unitBackup: (unit) => $(`#${unit}Backup`),

    // Misc
    progressBar: () => $('#progress'),
    serverDate: () => $("#serverDate"),
    serverTime: () => $("#serverTime"),
};

serverTimeTemp = DOM.serverDate()[0].innerText + " " + DOM.serverTime()[0].innerText;
serverTime = serverTimeTemp.match(/^([0][1-9]|[12][0-9]|3[01])[\/\-]([0][1-9]|1[012])[\/\-](\d{4})( (0?[0-9]|[1][0-9]|[2][0-3])[:]([0-5][0-9])([:]([0-5][0-9]))?)?$/);
serverDate = Date.parse(serverTime[3] + "/" + serverTime[2] + "/" + serverTime[1] + serverTime[4]);
let is_mobile = !!navigator.userAgent.match(/iphone|android|blackberry/ig) || false;
let scavengeInfo;
if (game_data.player.sitter > 0) {
    URLReq = `game.php?t=${game_data.player.id}&screen=place&mode=scavenge_mass`;
} else {
    URLReq = "game.php?&screen=place&mode=scavenge_mass";
}

DOM.main().remove();

if (typeof version == 'undefined') {
    version = "new";
}

//set translations
let langShinko = [
    "Mass scavenging",
    "Select unit types/ORDER to scavenge with (use arrows to reorder)",
    "Select categories to use",
    "When do you want your scav runs to return (approximately)?",
    "Runtime here",
    "Calculate runtimes for each page",
    "Creator: ",
    "Mass scavenging: send per 50 villages",
    "Launch group "
]

if (game_data.locale === "ro_RO") {
    //romanian server
    langShinko = [
        "Curatare in masa",
        "Selecteaza tipul unitatii/ORDONEAZA sa curete cu (foloseste sageti pentru a ordona)",
        "Selecteaza categoria",
        "Cand vrei sa se intoarca trupele de la curatare (aproximativ)",
        "Durata aici",
        "Calculeaza durata pentru fiecare pagina",
        "Creator: ",
        "Cueatare in masa: trimite pe 50 de sate",
        "Lanseaza grup "
    ]
}
if (game_data.locale === "ar_AE") {
    //arabic server
    langShinko = [
        "الاغارات",
        "اختار الوحدات المستخدمة فى الاغارات",
        "اختار انواع   الاغارات المستخدمة ",
        " ما المده المده الزمنيه المراد ارسال الاغارات بها",
        "ضع االمده هنا",
        "حساب المده لكل صفحه ",
        "Creator: ",
        "الاغارات : ترسل لكل 50 قريه على حدى ",
        " تشغيل المجموعة "
    ]
}
if (game_data.locale === "el_GR") {
    //greek server
    langShinko = [
        "Μαζική σάρωση",
        "Επιλέξτε τις μονάδες με τις οποίες θα κάνετε σάρωση",
        "Επιλέξτε επίπεδα σάρωσης που θα χρησιμοποιηθούν",
        "Χρόνος Σάρωσης (Ώρες.Λεπτά)",
        "Χρόνος",
        "Υπολόγισε χρόνους σάρωσης για κάθε σελίδα.",
        "Δημιουργός: ",
        "Μαζική σάρωση: Αποστολή ανα 50 χωριά",
        "Αποστολή ομάδας "
    ]
}
if (game_data.locale === "nl_NL") {
    //dutch server
    langShinko = [
        "Massa rooftochten",
        "Kies welke troeptypes je wil mee roven, gebruik pijlen om prioriteit te ordenen",
        "Kies categorieën die je wil gebruiken",
        "Wanneer wil je dat je rooftochten terug zijn?",
        "Looptijd hier invullen",
        "Bereken rooftochten voor iedere pagina",
        "Scripter: ",
        "Massa rooftochten: verstuur per 50 dorpen",
        "Verstuur groep "
    ]
}
if (game_data.locale === "it_IT") {
    //Italian server
    langShinko = [
        "Rovistamento di massa",
        "Seleziona i tipi da unità con cui rovistare",
        "Seleziona quali categorie utilizzare",
        "Inserisci la durata voluta dei rovistamenti in ORE",
        "Inserisci qui il tempo",
        "Calcola tempi per tutte le pagine",
        "Creatore: ",
        "Rovistamento di massa: manda su 50 villaggi",
        "Lancia gruppo"
    ]
}

// Global variables for scavenging (need to refactor into a proper state management system but this will do for now)
let premiumBtnEnabled = false;
let squad_requests = [];
let squad_requests_premium = [];
let squads = [];
let squads_premium = [];
let totalLoot = 0;
let totalHaul = 0;
let haulCategoryRate = {};
let unitsReadyForSend = {};
let actuallyEnabled = false; // This variable remains false until the user confirms one group as premium sending
let haulFlagNames = [];

// Scavenging constants
let duration_factor = 0;
let duration_initial_seconds = 0;
let duration_exponent = 0;

// Category names
let categoryNames = JSON.parse("[" + $.find('script:contains("ScavengeMassScreen")')[0].innerHTML.match(/\{.*\:\{.*\:.*\}\}/g) + "]")[0];


// Current theme object
let currentTheme = null;

// Constants for styling
var STYLES = {
    PADDING_STANDARD: '5px',
    PADDING_LARGE: '10px',
    MARGIN_STANDARD: '10px',
    WIDTH_HALF: '50%',
    WIDTH_FULL: '100%',
    POSITION_ABSOLUTE: 'absolute',
    TEXT_ALIGN_CENTER: 'center',
    RADIO_WIDTH: '22px',
    BUTTON_SIZE: '30px',
    BUTTON_OFFSET: '30px',
};

// CSS Classes for common patterns
var CSS_CLASSES = {
    TABLE_MAIN: 'vis',
    BTN_PRIMARY: 'btn btnSophie',
    CENTER_MARGIN: 'center-margin',
    HEADER_ROW: 'header-row',
    DATA_ROW: 'data-row',
    CENTER_TEXT: 'center-text',
};

// Settings Management
var SettingsManager = {
    defaultSettings: {
        colorTheme: 'standard',
        premiumEnabled: false,
        troopTypeEnabled: {
        },
        keepHome: {
            spear: 0,
            sword: 0,
            axe: 0,
            archer: 0,
            light: 0,
            marcher: 0,
            heavy: 0
        },
        categoryEnabled: [true, true, true, true],
        prioritiseHighCat: false,
        timeElement: 'Date',
        sendOrder: [],
        runTimes: {
            off: 4,
            def: 3
        }
    },
    themes: [
        {
            name: 'standard',
            label: 'Dark (Standard)',
            colors: {bg: '#36393f', border: '#3e4147', header: '#202225', title: '#ffffdf'}
        },
        { name: 'pink', label: 'Pink', colors: {bg: '#FEC5E5', border: '#FF1694', header: '#F699CD', title: '#E11584'}},
        {
            name: 'swedish',
            label: 'Swedish (Blue/Yellow)',
            colors: {bg: '#fecd00', border: '#03456b', header: '#006aa8', title: '#121212'}
        },
        {
            name: 'minimalistGray',
            label: 'Minimalist Gray',
            colors: {bg: '#f1f1f1', border: '#777777', header: '#ded9d9', title: '#383834'}
        },
        {
            name: 'TW',
            label: 'Tribal Wars',
            colors: {bg: '#F4E4BC', border: '#c1a264', header: 'rgb(221 202 153)', title: '#803000'}
        }
    ],

    load() {
        if (localStorage.getItem('scavengeSettings')) {
            const saved = JSON.parse(localStorage.getItem('scavengeSettings'));
            return { ...this.defaultSettings, ...saved };
        }

        // Initialize troopTypeEnabled with correct defaults
        const defaultWithUnits = { ...this.defaultSettings };
        const worldUnits = game_data.units;
        for (let i = 0; i < worldUnits.length; i++) {
            if (worldUnits[i] !== "militia" && worldUnits[i] !== "snob" && worldUnits[i] !== "ram" && worldUnits[i] !== "catapult" && worldUnits[i] !== "spy" && worldUnits[i] !== "knight") {
                defaultWithUnits.troopTypeEnabled[worldUnits[i]] = false;
            }
        }

        // Initialize sendOrder with correct defaults
        defaultWithUnits.sendOrder = [];
        for (let i = 0; i < worldUnits.length; i++) {
            if (worldUnits[i] !== "militia" && worldUnits[i] !== "snob" && worldUnits[i] !== "ram" && worldUnits[i] !== "catapult" && worldUnits[i] !== "spy" && worldUnits[i] !== "knight") {
                defaultWithUnits.sendOrder.push(worldUnits[i]);
            }
        }

        return defaultWithUnits;
    },

    save(settings) {
        localStorage.setItem('scavengeSettings', JSON.stringify(settings));
    },

    getThemeByName(name) {
        return this.themes.find(t => t.name === name) || this.themes[0];
    }
};

// Load settings
let scavengeSettings = SettingsManager.load();
premiumBtnEnabled = scavengeSettings.premiumEnabled;


// Apply initial theme
currentTheme = SettingsManager.getThemeByName(scavengeSettings.colorTheme);
applyThemeToPage(currentTheme);


// Event listener manager
var EventManager = {
    listeners: new Map(),

    on(element, event, handler, namespace = 'default') {
        const key = `${element.id || element.className}:${event}:${namespace}`;

        if (!this.listeners.has(key)) {
            element.addEventListener(event, handler, false);
            this.listeners.set(key, {element, event, handler});
        }
    },
};


// HTML Builder - Creates consistent HTML elements
var HTMLBuilder = {
    /**
     * Create a header cell with title and color
     */
    headerCell(content, colspan = 1) {
        return `<th colspan="${colspan}" class="table-header header-row pad-large"><h3><center class="center-margin"><u><font class="text-title">${content}</font></u></center></h3></th>`;
    },

    /**
     * Create a data cell with proper styling
     */
    dataCell(content, classes = '', style = '') {
        const styleAttr = style ? `style="${style}"` : '';
        return `<td class="data-row pad-standard bg-primary ${classes}" ${styleAttr}>${content}</td>`;
    },

    /**
     * Create a checkbox cell
     */
    checkboxCell(id, name) {
        return this.dataCell(`<center><input type="checkbox" ID="${id}" name="${name}"></center>`, 'bg-primary');
    },

    /**
     * Create category header row
     */
    categoryHeaderRow(categories) {
        return `<tr class="header-row">
            ${categories.map(cat => `<th class="table-header center-text pad-large"><font class="text-title">${cat.name}</font></th>`).join('')}
        </tr>`;
    },

    /**
     * Create a button
     */
    button(label, onClick, id = '', classes = CSS_CLASSES.BTN_PRIMARY) {
        const idAttr = id ? `id="${id}"` : '';
        return `<button class="${classes}" onclick="${onClick}" ${idAttr}>${label}</button>`;
    },

    /**
     * Create table wrapper
     */
    table(content, id = '') {
        const idAttr = id ? `id="${id}"` : '';
        return `<table class="vis table-bg" border="1" style="width: 100%;" ${idAttr}>${content}</table>`;
    }
};

// ============ HTML TEMPLATE BUILDER ============

// Main UI Template Builder
var UITemplates = {
    /**
     * Build the main scavenging interface
     */
    buildMainInterface() {
        return `
            <div id="massScavengeSophie" class="ui-widget-content main-window">
                ${HTMLBuilder.button('⚙️', 'settings()', 'cog', 'btn close-btn')}
                ${HTMLBuilder.button('X', "closeWindow('massScavengeSophie')", 'x', 'btn close-btn')}
                ${this.buildTitleSection()}
                ${this.buildCategorySelectionSection()}
                ${this.buildRuntimeSection()}
                ${this.buildPrioritySection()}
                ${this.buildActionSection()}
                ${this.buildFooterSection()}
            </div>
        `;
    },

    buildTitleSection() {
        return `
            <table class="${CSS_CLASSES.TABLE_MAIN} table-bg" border="1" style="width: 100%;">
                <tr>
                    <td class="header-row pad-large bg-primary" colspan="15">
                        <h3><center class="center-margin"><u><font class="text-title">${langShinko[0]}</font></u></center></h3>
                    </td>
                </tr>
                <tr>
                    <td class="header-row pad-large bg-primary" colspan="15">
                        <h3><center class="center-margin"><u><font class="text-title">${langShinko[1]}</font></u></center></h3>
                    </td>
                </tr>
                <tr id="imgRow"></tr>
            </table>
        `;
    },

    buildCategoryHeaders() {
        return HTMLBuilder.categoryHeaderRow(Object.values(categoryNames));
    },

    buildCategoryCheckboxes() {
        return `
            <tr>
                ${[1, 2, 3, 4].map(num => HTMLBuilder.checkboxCell(`category${num}`, `cat${num}`)).join('')}
            </tr>
        `;
    },

    buildCategorySelectionSection() {
        return `
            <hr>
            <table class="${CSS_CLASSES.TABLE_MAIN} table-bg" border="1" style="width: 100%;">
                <tbody>
                  
                    ${HTMLBuilder.headerCell(langShinko[2], 4)}
                    ${this.buildCategoryHeaders()}
                    ${this.buildCategoryCheckboxes()}
                </tbody>
            </table>
        `;
    },

    buildRuntimeSection() {
        return `
            <hr>
            <table class="${CSS_CLASSES.TABLE_MAIN} table-bg" border="1" style="width: 100%;">
                <tr class="header-row">
                    <th class="table-header center-text pad-large" colspan="3">
                        <center class="center-margin"><font class="text-title">${langShinko[3]}</font></center>
                    </th>
                </tr>
                <tr class="header-row">
                    <th class="table-header pad-standard"></th>
                    <th class="table-header center-text pad-large"><font class="text-title">Off villages</font></th>
                    <th class="table-header center-text pad-large"><font class="text-title">Def villages</font></th>
                </tr>
                ${this.buildDateTimeInputs()}
                ${this.buildHourInputs()}
                ${this.buildDisplayRows()}
            </table>
        `;
    },

    buildDateTimeInputs() {
        return `
            <tr>
                <td class="data-row pad-standard table-header"><input type="radio" id="timeSelectorDate" name="timeSelector"></td>
                <td class="data-row pad-standard bg-primary">
                    <input type="date" id="offDay" name="offDay" value="${setDayToField(scavengeSettings.runTimes.off)}">
                    <input type="time" id="offTime" name="offTime" value="${setTimeToField(scavengeSettings.runTimes.off)}">
                </td>
                <td class="data-row pad-standard bg-primary">
                    <input type="date" id="defDay" name="defDay" value="${setDayToField(scavengeSettings.runTimes.def)}">
                    <input type="time" id="defTime" name="defTime" value="${setTimeToField(scavengeSettings.runTimes.def)}">
                </td>
            </tr>
        `;
    },

    buildHourInputs() {
        return `
            <tr>
                <td class="data-row pad-standard table-header"><input type="radio" id="timeSelectorHours" name="timeSelector"></td>
                <td class="data-row pad-standard bg-primary">
                    <input type="text" class="runTime_off input-field" value="${scavengeSettings.runTimes.off}" onclick="this.select();">
                </td>
                <td class="data-row pad-standard bg-primary">
                    <input type="text" class="runTime_def input-field" value="${scavengeSettings.runTimes.def}" onclick="this.select();">
                </td>
            </tr>
        `;
    },

    buildDisplayRows() {
        return `
            <tr>
                <td class="data-row pad-standard table-header"></td>
                <td class="data-row pad-standard bg-primary"><font class="text-title"><span id="offDisplay"></span></font></td>
                <td class="data-row pad-standard bg-primary"><font class="text-title"><span id="defDisplay"></span></font></td>
            </tr>
        `;
    },

    buildPrioritySection() {
        return `
            <hr>
            <table class="${CSS_CLASSES.TABLE_MAIN} table-bg" style="width: 100%;">
                <tr class="header-row">
                    <th class="table-header center-text pad-large" colspan="2">
                        <center class="center-margin"><font class="text-title">Which setting?</font></center>
                    </th>
                </tr>
                <tr class="header-row">
                    <th class="table-header center-text pad-standard half-width">
                        <font class="text-title">Balanced over all categories</font>
                    </th>
                    <th class="table-header center-text pad-standard half-width">
                        <font class="text-title">Priority on filling higher categories</font>
                    </th>
                </tr>
                <tr class="header-row">
                    <td class="data-row pad-standard center-text bg-primary"><input type="radio" id="settingPriorityBalanced" name="prio"></td>
                    <td class="data-row pad-standard center-text bg-primary"><input type="radio" id="settingPriorityPriority" name="prio"></td>
                </tr>
            </table>
        `;
    },

    buildActionSection() {
        return `
            <hr>
            <center class="center-margin">
                <input type="button" class="${CSS_CLASSES.BTN_PRIMARY}" id="sendMass" onclick="readyToSend()" value="${langShinko[5]}">
            </center>
        `;
    },

    buildFooterSection() {
        return `
            <hr>
            <center>
                <p class="sophSignature">
                    ${langShinko[6]}
                    <a href="https://www.shinko-to-kuma.com" title="Sophie profile" target="_blank">
                        Sophie "Shinko to Kuma"
                    </a>
                </p>
            </center>
        `;
    }
};

// Function to generate theme CSS with all utility classes
function generateThemeCSS(theme) {
    const {bg, border, header, title} = theme.colors;

    const baseStyles = `
        /* Base Styles */
        .sophRowA { background-color: #32353b; color: white; }
        .sophRowB { background-color: #36393f; color: white; }
        .sophHeader { background-color: #202225; font-weight: bold; color: white; }
        .sophSignature { color: ${title}; }
        .sophSignature a { text-shadow:-1px -1px 0 ${title},1px -1px 0 ${title},-1px 1px 0 ${title},1px 1px 0 ${title}; }

        /* Layout Classes */
        .center-margin { margin: ${STYLES.MARGIN_STANDARD}; }
        .center-text { text-align: center; }
        .full-width { width: ${STYLES.WIDTH_FULL}; }
        .half-width { width: ${STYLES.WIDTH_HALF}; }

        /* Table Classes */
        .vis { border-collapse: collapse; }
        .header-row { text-align: center; width: auto; }
        .data-row { text-align: center; width: auto; }
        #settingsWindow .vis td { background-color: ${bg};}

        /* Padding Classes */
        .pad-standard { padding: ${STYLES.PADDING_STANDARD}; }
        .pad-large { padding: ${STYLES.PADDING_LARGE}; }
        .pad-both { padding: ${STYLES.PADDING_LARGE} ${STYLES.PADDING_STANDARD}; }

        /* Color Classes */
        .bg-primary { background-color: ${bg}!important; }
        .bg-header { background-color: ${header}!important; }
        .text-title { color: ${title}!important; }
        .border-primary { border-color: ${border}!important; }

        /* Table Color Classes */
        .table-bg { background-color: ${bg}; border-color: ${border}; }
        th.table-header { background-image: none!important; background-color: ${header}!important; color: ${title}!important; text-align: center; width: auto; padding: ${STYLES.PADDING_STANDARD}; }
        td.table-header { background-image: none!important; background-color: ${header}!important; color: ${title}!important; text-align: center; width: auto; padding: ${STYLES.PADDING_STANDARD}; }

        /* Button Base */
        .btn { cursor: pointer; border: none; padding: 8px 16px; border-radius: 4px; }
        .btn:hover { opacity: 0.9; }

        /* Window Classes */
        .main-window { width: 600px; background-color: ${bg}; border: 1px solid ${border}; cursor: move; z-index: 50; position: relative }
        .close-btn { position: absolute; width: ${STYLES.BUTTON_SIZE}; height: ${STYLES.BUTTON_SIZE}; display: flex; align-items: center; justify-content: center; }
        #x { top: 0; right: 0; background: red; border: 1px solid ${border}; color: white;}
        #cog { top: 0; right: ${STYLES.BUTTON_OFFSET}; background: white; border: 1px solid ${border}; color: white; }

        /* Input Classes */
        .input-field { background-color: ${bg}; color: ${title}; }

        /* Window Styling */
        .settings-window { position: fixed; background-color: ${bg}; border: 1px solid ${border}; cursor: move; z-index: 100; min-width: 400px; }
        .launch-window { position: fixed; background-color: ${bg}; border: 1px solid ${border}; cursor: move; z-index: 50; }
        .close-btn-settings { position: absolute; top: 0; right: 0; width: 30px; height: 30px; background: red; color: white; }

        /* Unit Item Classes */
        .unit-container { position: relative; text-align: center; }
        .unit-table { width: 100%; }
        .unit-header { text-align: center; padding: 5px; }
        .unit-cell { text-align: center; padding: 5px; }
        .unit-input { background-color: ${bg}; color: ${title} }
        .unit-button { padding: 4px 8px; }
        .btn-hidden { display: none; }
    `;

    const themeStyles = {
        standard: `
            <style>
            ${baseStyles}
            .sophRowA { background-color: #32353b; color: white; }
            .sophRowB { background-color: #36393f; color: white; }
            .sophHeader { background-color: #202225; font-weight: bold; color: white; }
            .sophSignature a { color: #36393f;}
            .btnSophie { background-image: linear-gradient(#6e7178 0%, #36393f 30%, #202225 80%, black 100%); }
            .btnSophie:hover { background-image: linear-gradient(#7b7e85 0%, #40444a 30%, #393c40 80%, #171717 100%); }
            </style>`,
        pink: `
            <style>
            ${baseStyles}
            .btnSophie { background-image: linear-gradient(#FEC5E5 0%, #FD5DA8 30%, #FF1694 80%, #E11584 100%); }
            .btnSophie:hover { background-image: linear-gradient(#F2B8C6 0%, #FCBACB 30%, #FA86C4 80%, #FE7F9C 100%); }
            .sophSignature a { color: white;}
            </style>`,
        swedish: `
            <style>
            ${baseStyles}
            .btnSophie { background-image: linear-gradient(#00a1fe 0%, #5d9afd 30%, #1626ff 80%, #1f15e1 100%); }
            .btnSophie:hover { background-image: linear-gradient(#b8bcf2 0%, #babbfc 30%, #8c86fa 80%, #969fff 100%); }
            .sophSignature a { color: white;}
            </style>`,
        minimalistGray: `
            <style>
            ${baseStyles}
            .btnSophie { background-image: linear-gradient(#00a1fe 0%, #5d9afd 30%, #1626ff 80%, #1f15e1 100%); color: white; }
            .btnSophie:hover { background-image: linear-gradient(#b8bcf2 0%, #babbfc 30%, #8c86fa 80%, #969fff 100%); color: white; }
            .sophSignature a { color: white;}
            </style>`,
        TW: `
            <style>
            ${baseStyles}
            .sophRowA { background-color: #f4e4bc; color: black; }
            .sophRowB { background-color: #fff5da; color: black; }
            .sophHeader { background-color: #c6a768; font-weight: bold; color: #803000; }
            .sophLink { color: #803000; }
            .btnSophie { background: linear-gradient(to bottom, #947a62 0%, #7b5c3d 22%, #6c4824 30%, #6c4824 100%); color: white; }
            .btnSophie:hover { background: linear-gradient(to bottom, #b69471 0%, #9f764d 22%, #8f6133 30%, #6c4d2d 100%); color: white; }
            .sophSignature a { color: white;}
            </style>`
    };
    return themeStyles[theme.name] || themeStyles.standard;
}

// Setup event listeners for time input fields
function setupTimeInputListeners() {
    const timeInputs = [
        {sel: '#offDay', handler: updateTimers},
        {sel: '#defDay', handler: updateTimers},
        {sel: '#offTime', handler: updateTimers},
        {sel: '#defTime', handler: updateTimers},
        {sel: '.runTime_off', handler: updateTimers},
        {sel: '.runTime_def', handler: updateTimers},
    ];

    timeInputs.forEach(input => {
        const element = $(input.sel)[0];
        if (element) {
            EventManager.on(element, 'input', input.handler);
        }
    });

    // Time selector radio buttons
    const timeSelDate = DOM.timeSelectorDate()[0];
    const timeSelHours = DOM.timeSelectorHours()[0];

    if (timeSelDate) {
        EventManager.on(timeSelDate, 'input', () => {
            selectType('Date');
            updateTimers();
        });
    }

    if (timeSelHours) {
        EventManager.on(timeSelHours, 'input', () => {
            selectType('Hours');
            updateTimers();
        });
    }
}

//first UI, will always open as soon as you run the script.
html = UITemplates.buildMainInterface();
DOM.mainCell().eq(0).prepend(html);
DOM.mobileContent().eq(0).prepend(html);
if (is_mobile === false) {
    DOM.main().css("position", "fixed");
    DOM.main().draggable();
}

DOM.offDisplay()[0].innerText = fancyTimeFormat(scavengeSettings.runTimes.off * 3600);
DOM.defDisplay()[0].innerText = fancyTimeFormat(scavengeSettings.runTimes.def * 3600);
if (scavengeSettings.timeElement === "Date") {
    DOM.timeSelectorDate().prop("checked", true);
    selectType("Date");
    updateTimers();
} else {
    DOM.timeSelectorHours().prop("checked", true);
    selectType("Hours");
    updateTimers();
}

// Setup event listeners for time input fields
setupTimeInputListeners();

//create checkboxes and add them to the UI

// Function to render unit items with arrow buttons
function renderUnitItems() {
    // Store current checkbox and input states before clearing
    const unitStates = {};
    scavengeSettings.sendOrder.forEach(unit => {
        unitStates[unit] = {
            checked: $(`#${unit}`).is(':checked'),
            backup: $(`#${unit}Backup`).val() || scavengeSettings.keepHome[unit]
        };
    });

    DOM.imgRow().empty();

    for (let i = 0; i < scavengeSettings.sendOrder.length; i++) {
        const unitName = scavengeSettings.sendOrder[i];
        const isFirst = i === 0;
        const isLast = i === scavengeSettings.sendOrder.length - 1;

        // Get preserved state or use default
        const isChecked = unitStates[unitName] ? unitStates[unitName].checked : false;
        const backupValue = unitStates[unitName] ? unitStates[unitName].backup : keepHome[unitName];

        // Build left arrow button with conditional class
        const leftArrowClass = isFirst ? 'unit-button btn-hidden' : 'unit-button';
        // Build right arrow button with conditional class
        const rightArrowClass = isLast ? 'unit-button btn-hidden' : 'unit-button';

        DOM.imgRow().eq(0).append(`
            <td class="unit-container bg-primary">
                <table class="vis unit-table" border="1">
                    <thead></thead>
                    <tbody>    
                        <tr>
                            <td class="unit-header bg-header">
                                <img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_${unitName}.png" title="${unitName}" alt="">
                            </td>
                        </tr>
                        <tr>
                            <td class="unit-cell bg-primary">
                                <input type="checkbox" ID="${unitName}" name="${unitName}" ${isChecked ? 'checked' : ''}>
                            </td>
                        </tr>
                        <tr>
                            <td class="unit-cell bg-primary">
                                ${HTMLBuilder.button('←', `moveUnit('${unitName}', 'left')`, '', `btn btnSophie ${leftArrowClass}`)}
                                ${HTMLBuilder.button('→', `moveUnit('${unitName}', 'right')`, '', `btn btnSophie ${rightArrowClass}`)}
                            </td>
                        </tr>
                        <tr>
                            <td class="unit-header bg-header">
                                <font class="text-title">Backup</font>
                            </td>
                        </tr>
                        <tr>
                            <td class="unit-cell bg-primary">
                                <input type="text" class="unit-input" ID="${unitName}Backup" name="${unitName}" value="${backupValue}" size="5">
                            </td>
                        </tr>
                    </tbody>  
                </table>
            </td>
        `);
    }
}

// Function to move unit in the order array
function moveUnit(unitName, direction) {
    const currentIndex = scavengeSettings.sendOrder.indexOf(unitName);

    if (currentIndex === -1) return;

    if (direction === 'left' && currentIndex > 0) {
        // Swap with previous element
        [scavengeSettings.sendOrder[currentIndex - 1], scavengeSettings.sendOrder[currentIndex]] = [scavengeSettings.sendOrder[currentIndex], scavengeSettings.sendOrder[currentIndex - 1]];
        renderUnitItems();
    } else if (direction === 'right' && currentIndex < scavengeSettings.sendOrder.length - 1) {
        // Swap with next element
        [scavengeSettings.sendOrder[currentIndex + 1], scavengeSettings.sendOrder[currentIndex]] = [scavengeSettings.sendOrder[currentIndex], scavengeSettings.sendOrder[currentIndex + 1]];
        renderUnitItems();
    }
}

// Initial render of unit items
renderUnitItems();

if (scavengeSettings.prioritiseHighCat === true) {
    DOM.settingPriorityPriority().prop("checked", true);
} else {
    DOM.settingPriorityBalanced().prop("checked", true);
}

enableCorrectTroopTypes();


//focus calculate button!
DOM.sendMassButtons().eq(0).focus();

function readyToSend() {
    //check if every setting is chosen, otherwise alert and abort
    if (DOM.settingPriorityPriority()[0].checked === false && DOM.settingPriorityBalanced()[0].checked === false) {
        // no setting chosen
        alert("You have not chosen how you want to split your troops! Choose either prioritising higher categories till chosen runtime, or balanced spread over all categories!");
        throw Error("didn't choose type");
    }

    if (DOM.category1().is(":checked") === false && DOM.category2().is(":checked") === false && DOM.category3().is(":checked") === false && DOM.category4().is(":checked") === false) {
        // no category chosen
        alert("You have not chosen which categories you want to use!");
        throw Error("didn't choose category");
    }

    //get trooptypes we want to use, and runtime
    for (let i = 0; i < scavengeSettings.sendOrder.length; i++) {
        scavengeSettings.troopTypeEnabled[scavengeSettings.sendOrder[i]] = DOM.unitCheckbox(scavengeSettings.sendOrder[i]).is(":checked");
    }
    for (let i = 0; i < scavengeSettings.sendOrder.length; i++) {
        scavengeSettings.keepHome[scavengeSettings.sendOrder[i]] = DOM.unitBackup(scavengeSettings.sendOrder[i]).val();
    }

    // Update scavengeSettings with all user selections
    scavengeSettings.categoryEnabled = [
        DOM.category1().is(":checked"),
        DOM.category2().is(":checked"),
        DOM.category3().is(":checked"),
        DOM.category4().is(":checked")
    ];
    scavengeSettings.timeElement = DOM.timeSelectorDate()[0].checked === true ? "Date" : "Hours";
    if (scavengeSettings.timeElement === "Date") {
        scavengeSettings.runTimes.off = Date.parse(DOM.offDay().val().replace(/-/g, "/") + " " + DOM.offTime().val());
        scavengeSettings.runTimes.def = Date.parse(DOM.defDay().val().replace(/-/g, "/") + " " + DOM.defTime().val());
        scavengeSettings.runTimes.off = (scavengeSettings.runTimes.off - serverDate) / 1000 / 3600;
        scavengeSettings.runTimes.def = (scavengeSettings.runTimes.def - serverDate) / 1000 / 3600;
    }
    else {
        scavengeSettings.runTimes.off = DOM.runTimeOff().val();
        scavengeSettings.runTimes.def =  DOM.runTimeDef().val();
    }

    if (scavengeSettings.runTimes.off > 24 || scavengeSettings.runTimes.def > 24) {
        alert("Your runtime is higher than 24h!");
    }
    if (scavengeSettings.runTimes.off <= 0 || scavengeSettings.runTimes.def <= 0) {
        alert("You can't send units to the past, atleast, not yet ;)");
        return;
    }
    scavengeSettings.prioritiseHighCat = DOM.settingPriorityPriority()[0].checked === true;

    // Save all settings at once
    SettingsManager.save(scavengeSettings);
    getData();
}

function showGroup(groupNr) {
    //show the group in a prompt, so the user can see which villages/units they are sending with
    let group = "<table>" +
        "<tr><th>Village ID</th><th>Category</th><th>Units</th></tr>";
    for (let i = 0; i < squads[groupNr].length; i++) {
        const villageId = squads[groupNr][i].village_id;
        const category = categoryNames[squads[groupNr][i].option_id].name;
        const units = JSON.stringify(squads[groupNr][i].candidate_squad.unit_counts);
        group += `<tr><td>${villageId}</td><td>${category}</td><td>${units}</td></tr>`;
    }
    group += "</table>";

    Dialog.show('Group overview', group);
}
function sendGroup(groupNr, premiumEnabled) {
    if (premiumEnabled === true) {
        actuallyEnabled = false;
        actuallyEnabled = confirm("Are you sure you want to send the scavenge runs using premium? Cancelling will send the scav run without premium.   ********* DEPENDING ON HOW MANY UNITS/VILLAGES YOU SEND WITH, THIS CAN RESULT IN VERY HIGH AMOUNTS OF PP BEING USED! ONLY USE THIS IF YOU CAN AFFORD IT/KNOW HOW MUCH THE INDIVIDUAL PP RUNS WOULD COST YOU! *********");
    } else {
        actuallyEnabled = false;
    }

    //Send one group(one page worth of scavenging)
    DOM.sendMassButtons().prop('disabled', true);
    DOM.sendMassPremiumButtons().prop('disabled', true);
    TribalWars.post('scavenge_api',
        { ajaxaction: 'send_squads' },
        { "squad_requests": actuallyEnabled ? squads_premium[groupNr] : squads[groupNr] }, function () {
            UI.SuccessMessage("Group sent successfully");
        },
        !1
    );

    //once group is sent, remove the row from the table
    setTimeout(function () {
        $(`#sendRow${groupNr}`).remove();
        DOM.sendMassButtons().prop('disabled', false);
        DOM.sendMassPremiumButtons().prop('disabled', false);
        DOM.sendMassButtons().eq(0)[0].focus();
    }, 200);
}


function calculateHaulCategories(data) {
    //check if village has rally point
    if (data.has_rally_point === true) {
        var troopsAllowed = {};
        for (let key in scavengeSettings.troopTypeEnabled) {
            if (scavengeSettings.troopTypeEnabled[key] === true) {
                if (data.unit_counts_home[key] - scavengeSettings.keepHome[key] > 0) {
                    troopsAllowed[key] = data.unit_counts_home[key] - scavengeSettings.keepHome[key];
                } else {
                    troopsAllowed[key] = 0;
                }
            }
        }
        var unitType = {
            "spear": 'def',
            "sword": 'def',
            "axe": 'off',
            "archer": 'def',
            "light": 'off',
            "marcher": 'off',
            "heavy": 'def',
        }

        var typeCount = {'off': 0, 'def': 0};

        for (let prop in troopsAllowed) {
            typeCount[unitType[prop]] = typeCount[unitType[prop]] + troopsAllowed[prop];
        }

        totalLoot = 0;
        let haul = 0;
        //check what the max possible loot is
        for (let key in troopsAllowed) {
            if (key === "spear") totalLoot += troopsAllowed[key] * (data.unit_carry_factor * 25);
            if (key === "sword") totalLoot += troopsAllowed[key] * (data.unit_carry_factor * 15);
            if (key === "axe") totalLoot += troopsAllowed[key] * (data.unit_carry_factor * 10);
            if (key === "archer") totalLoot += troopsAllowed[key] * (data.unit_carry_factor * 10);
            if (key === "light") totalLoot += troopsAllowed[key] * (data.unit_carry_factor * 80);
            if (key === "marcher") totalLoot += troopsAllowed[key] * (data.unit_carry_factor * 50);
            if (key === "heavy") totalLoot += troopsAllowed[key] * (data.unit_carry_factor * 50);
            if (key === "knight") totalLoot += troopsAllowed[key] * (data.unit_carry_factor * 100);
        }

        if (totalLoot === 0) {
            //can't loot from here, end
            return;
        }
        if (typeCount.off > typeCount.def) {
            haul = parseInt(((scavengeSettings.runTimes.off * 3600) / duration_factor - duration_initial_seconds) ** (1 / (duration_exponent)) / 100) ** (1 / 2);
        } else {
            haul = parseInt(((scavengeSettings.runTimes.def * 3600) / duration_factor - duration_initial_seconds) ** (1 / (duration_exponent)) / 100) ** (1 / 2);
        }

        haulCategoryRate = {};

        //check which categories are enabled
        if (data.options[1].is_locked === true || data.options[1].scavenging_squad != null) {
            haulCategoryRate[1] = 0;
        } else {
            haulCategoryRate[1] = haul / 0.1;
        }
        if (data.options[2].is_locked === true || data.options[2].scavenging_squad != null) {
            haulCategoryRate[2] = 0;
        } else {
            haulCategoryRate[2] = haul / 0.25;
        }
        if (data.options[3].is_locked === true || data.options[3].scavenging_squad != null) {
            haulCategoryRate[3] = 0;
        } else {
            haulCategoryRate[3] = haul / 0.50;
        }
        if (data.options[4].is_locked === true || data.options[4].scavenging_squad != null) {
            haulCategoryRate[4] = 0;
        } else {
            haulCategoryRate[4] = haul / 0.75;
        }

        for (let i = 0; i < scavengeSettings.categoryEnabled.length; i++) {
            if (scavengeSettings.categoryEnabled[i] === false) haulCategoryRate[i + 1] = 0;
        }


        totalHaul = haulCategoryRate[1] + haulCategoryRate[2] + haulCategoryRate[3] + haulCategoryRate[4];
        if(totalHaul === 0) {
            //no categories available, end
            return;
        }
        unitsReadyForSend = calculateUnitsPerVillage(troopsAllowed);
        for (let k = 0; k < Object.keys(unitsReadyForSend).length; k++) {
            let candidate_squad = {"unit_counts": unitsReadyForSend[k], "carry_max": 9999999999};
            if (data.options[k + 1].is_locked === false) {
                squad_requests.push({
                    "village_id": data.village_id,
                    "candidate_squad": candidate_squad,
                    "option_id": k + 1,
                    "use_premium": false
                })
                squad_requests_premium.push({
                    "village_id": data.village_id,
                    "candidate_squad": candidate_squad,
                    "option_id": k + 1,
                    "use_premium": true
                })

            }
        }
    } else {
        console.error("no rally point");
    }
}

function enableCorrectTroopTypes() {
    worldUnits = game_data.units;
    for (let i = 0; i < worldUnits.length; i++) {
        if (worldUnits[i] !== "militia" && worldUnits[i] !== "snob" && worldUnits[i] !== "ram" && worldUnits[i] !== "catapult" && worldUnits[i] !== "spy") {
            if (scavengeSettings.troopTypeEnabled[worldUnits[i]] === true) DOM.unitCheckbox(worldUnits[i]).prop("checked", true);
        }
    }
    for (let i = 0; i < scavengeSettings.categoryEnabled.length + 1; i++) {
        if (scavengeSettings.categoryEnabled[i] === true) {
            const categoryNum = i + 1;
            switch(categoryNum) {
                case 1: DOM.category1().prop("checked", true); break;
                case 2: DOM.category2().prop("checked", true); break;
                case 3: DOM.category3().prop("checked", true); break;
                case 4: DOM.category4().prop("checked", true); break;
            }
        }
    }
}

function calculateUnitsPerVillage(troopsAllowed) {
    let unitHaul = {
        "spear": 25,
        "sword": 15,
        "axe": 10,
        "archer": 10,
        "light": 80,
        "marcher": 50,
        "heavy": 50,
        "knight": 100
    };
    //calculate HERE :D
    unitsReadyForSend = {};
    unitsReadyForSend[0] = {};
    unitsReadyForSend[1] = {};
    unitsReadyForSend[2] = {};
    unitsReadyForSend[3] = {};
    const calculateTroops = () => {
        for (let j = 3; j >= 0; j--) {
            let reach = haulCategoryRate[j + 1];
            scavengeSettings.sendOrder.forEach((unit) => {
                if (troopsAllowed.hasOwnProperty(unit) && reach > 0) {
                    let amountNeeded = Math.floor(reach / unitHaul[unit]);

                    if (amountNeeded > troopsAllowed[unit]) {
                        unitsReadyForSend[j][unit] = troopsAllowed[unit];
                        reach = reach - (troopsAllowed[unit] * unitHaul[unit]);
                        troopsAllowed[unit] = 0;
                    } else {
                        unitsReadyForSend[j][unit] = amountNeeded;
                        reach = 0;
                        troopsAllowed[unit] = troopsAllowed[unit] - amountNeeded;
                    }
                }
            });
        }
    }

    if (totalLoot > totalHaul) {
        //too many units
        //prioritise higher category first
        if (version !== "old") {
            calculateTroops()
        } else {
            for (let j = 0; j < 4; j++) {
                for (let key in troopsAllowed) {
                    unitsReadyForSend[j][key] = Math.floor((haulCategoryRate[j + 1] * (troopsAllowed[key] / totalLoot)));
                }
            }

        }
    } else {
        //not enough units, spread evenly
        let troopNumber = 0;
        for (let key in troopsAllowed) {
            troopNumber += troopsAllowed[key];
        }
        if (scavengeSettings.prioritiseHighCat !== true && troopNumber > 130) {
            for (let j = 0; j < 4; j++) {
                for (let key in troopsAllowed) {
                    unitsReadyForSend[j][key] = Math.floor((totalLoot / totalHaul * haulCategoryRate[j + 1]) * (troopsAllowed[key] / totalLoot));
                }
            }
        } else {
            //prioritise higher category first
            calculateTroops()
        }
    }
    return unitsReadyForSend;
}

function resetSettings() {
    localStorage.removeItem("scavengeSettings");
    UI.BanneredRewardMessage("Settings reset");
    window.location.reload();
}

function closeWindow(title) {
    $("#" + title).remove();
}

function settings() {
    const settingsHTML = `
    <div id="settingsWindow" class="ui-widget-content settings-window">
        <button class="btn close-btn-settings" id="settingsClose" onclick="closeWindow('settingsWindow')">X</button>

        <table class="vis table-bg" border="1" style="width:100%;">
            <tr>
                <th class="table-header" colspan="2">
                    <h3 class="text-title" style="margin:0;">⚙️ Settings</h3>
                </th>
            </tr>

            <!-- Color Theme Selection -->
            <tr class="bg-primary">
                <th class="table-header" colspan="2">
                    <font class="text-title">Color Theme</font>
                </th>
            </tr>
            <tr class="bg-primary">
                <td colspan="2" style="padding:10px;">
                    <select id="colorThemeSelect" style="width:100%;padding:5px;" class="bg-primary text-title">
                        ${SettingsManager.themes.map(t => `<option value="${t.name}" ${scavengeSettings.colorTheme === t.name ? 'selected' : ''}>${t.label}</option>`).join('')}
                    </select>
                </td>
            </tr>

            <!-- Premium Button Setting -->
            <tr class="bg-primary">
                <th class="table-header" colspan="2">
                    <font class="text-title">Premium Options</font>
                </th>
            </tr>
            <tr class="bg-primary">
                <td style="text-align:center;padding:10px;width:50%;">
                    <label class="text-title" style="cursor:pointer;">
                        <input type="checkbox" id="premiumEnabledCheckbox" ${scavengeSettings.premiumEnabled ? 'checked' : ''} style="margin-right:5px;">
                        Enable Premium Button
                    </label>
                </td>
                <td style="text-align:center;padding:10px;font-size:12px;" class="text-title">
                    ⚠️ Warning: Uses Premium Points!
                </td>
            </tr>
             <tr class="header-row">
                <td class="data-row pad-standard center-text bg-primary"><font class="text-title">Settings bugged?</font></td>
                <td class="data-row pad-standard center-text bg-primary">
                    <input type="button" class="${CSS_CLASSES.BTN_PRIMARY}" id="reset" onclick="resetSettings()" value="Reset settings">
                </td>
            </tr>

            <!-- Action Buttons -->
            <tr class="bg-primary">
                <td style="text-align:center;padding:10px;">
                    <button class="btn btnSophie" onclick="applySettings()" style="padding:8px 16px;">Save Settings</button>
                </td>
                <td style="text-align:center;padding:10px;">
                    <button class="btn btnSophie" onclick="closeWindow('settingsWindow')" style="padding:8px 16px;">Close</button>
                </td>
            </tr>
        </table>
    </div>
    `;

    // Check if settings window already exists
    if (DOM.settingsWindow().length > 0) {
        closeWindow('settingsWindow');
    }

    DOM.mainCell().eq(0).prepend(settingsHTML);
    DOM.mobileContent().eq(0).prepend(settingsHTML);

    if (is_mobile === false) {
        DOM.settingsWindow().draggable();
    }

    // Add instant theme switching on dropdown change
    DOM.colorThemeSelect().on('change', function() {
        const selectedTheme = $(this).val();
        const theme = SettingsManager.getThemeByName(selectedTheme);

        // Apply theme instantly
        applyThemeToPage(theme);

        // Update the settings object (but don't save or close yet)
        scavengeSettings.colorTheme = selectedTheme;
    });
}

function applySettings() {
    const newTheme = DOM.colorThemeSelect().val();
    const newPremium = DOM.premiumEnabledCheckbox().is(':checked');

    // Update global settings (theme already updated by change event)
    scavengeSettings.colorTheme = newTheme;
    scavengeSettings.premiumEnabled = newPremium;
    premiumBtnEnabled = newPremium;

    // Save settings to localStorage
    SettingsManager.save(scavengeSettings);

    // Update premium button visibility
    updatePremiumButtonVisibility(newPremium);

    UI.SuccessMessage("Settings saved!");
    closeWindow('settingsWindow');
}

// Function to apply theme colors instantly to the page
function applyThemeToPage(theme) {
    // Update the global currentTheme
    currentTheme = theme;

    // Update or create CSS style tag for theme
    let styleTag = document.getElementById('dynamicThemeStyles');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'dynamicThemeStyles';
        document.head.appendChild(styleTag);
    }

    // Generate and apply theme CSS - pass theme object
    styleTag.textContent = generateThemeCSS(theme).replace(/<style>|<\/style>/g, '');
}


// Function to update premium button visibility
function updatePremiumButtonVisibility(enabled) {
    if (enabled) {
        DOM.sendMassPremiumButtons().show();
    } else {
        DOM.sendMassPremiumButtons().hide();
    }
}

function zeroPadded(val) {
    if (val >= 10)
        return val;
    else
        return '0' + val;
}

function setTimeToField(runtimeType) {

    d = Date.parse(new Date(serverDate)) + runtimeType * 1000 * 3600;
    d = new Date(d);
    d = zeroPadded(d.getHours()) + ":" + zeroPadded(d.getMinutes());
    return d;
}

function setDayToField(runtimeType) {

    d = Date.parse(new Date(serverDate)) + runtimeType * 1000 * 3600;
    d = new Date(d);
    d = d.getFullYear() + "-" + zeroPadded(d.getMonth() + 1) + "-" + zeroPadded(d.getDate());
    return d;
}

function fancyTimeFormat(time) {
    if (time < 0) {
        return "Time is in the past!"
    } else {
        // Hours, minutes and seconds
        var hrs = ~~(time / 3600);
        var mins = ~~((time % 3600) / 60);
        var secs = ~~time % 60;

        // Output like "1:01" or "4:03:59" or "123:03:59"
        var ret = "Max duration: ";

        if (hrs > 0) {
            ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
        } else {
            ret += "0:" + (mins < 10 ? "0" : "");
        }

        ret += "" + mins + ":" + (secs < 10 ? "0" : "");
        ret += "" + secs;
        return ret;
    }
}

function updateTimers() {
    if (DOM.timeSelectorDate()[0].checked === true) {
        DOM.offDisplay()[0].innerText = fancyTimeFormat((Date.parse(DOM.offDay().val().replace(/-/g, "/") + " " + DOM.offTime().val()) - serverDate) / 1000);
        DOM.defDisplay()[0].innerText = fancyTimeFormat((Date.parse(DOM.defDay().val().replace(/-/g, "/") + " " + DOM.defTime().val()) - serverDate) / 1000);
    } else {
        DOM.offDisplay()[0].innerText = fancyTimeFormat(DOM.runTimeOff().val() * 3600);
        DOM.defDisplay()[0].innerText = fancyTimeFormat(DOM.runTimeDef().val() * 3600);
    }
}

function selectType(type) {
    const setDateFields = () => {
        DOM.offDay().prop("disabled", true);
        DOM.defDay().prop("disabled", true);
        DOM.offTime().prop("disabled", true);
        DOM.defTime().prop("disabled", true);
        DOM.runTimeOff().eq(0).removeAttr('disabled');
        DOM.runTimeDef().eq(0).removeAttr('disabled');
    }
    const setTimeFields = () => {
        DOM.offDay().eq(0).removeAttr('disabled');
        DOM.defDay().eq(0).removeAttr('disabled');
        DOM.offTime().eq(0).removeAttr('disabled');
        DOM.defTime().eq(0).removeAttr('disabled');
        DOM.runTimeOff().prop("disabled", true);
        DOM.runTimeDef().prop("disabled", true);
    }
    switch (type) {
        case 'Hours':
            if (DOM.timeSelectorDate()[0].checked === true) {
                setTimeFields();
            } else {
                setDateFields();
            }
            break;
        case 'Date':
            if (DOM.timeSelectorHours()[0].checked === true) {
                setDateFields();
            } else {
                setTimeFields();
            }
            break;
        default:
            break;

    }
}

//get scavenging data that is in play for this world, every world has different exponent, factor, and initial seconds. Also getting the URLS of each mass scavenging page
/**
 * Extract scavenge data from HTML response
 * @param {string} html - HTML content to parse
 * @param {number} dataIndex - Index of data object to extract
 * @returns {object} Parsed scavenge data
 */
function extractScavengeData(html, dataIndex) {
    const jsonMatches = $(html).find('script:contains("ScavengeMassScreen")').html().match(/\{.*\:\{.*\:.*\}\}/g);
    if (!jsonMatches || !jsonMatches[dataIndex]) {
        throw new Error(`Could not extract scavenge data at index ${dataIndex}`);
    }
    return jsonMatches[dataIndex];
}

/**
 * Extract page count from pagination elements
 * @returns {number} Total number of pages
 */
function getPageCount() {
    const pageItems = $(".paged-nav-item");
    if (pageItems.length === 0) return 0;
    const lastPageMatch = pageItems[pageItems.length - 1].href.match(/page=(\d+)/);
    return lastPageMatch ? parseInt(lastPageMatch[1]) : 0;
}

/**
 * Build array of URLs for all scavenge pages
 * @param {number} pageCount - Total number of pages
 * @returns {string[]} Array of URLs to fetch
 */
function buildPageURLs(pageCount) {
    const urls = [];
    for (let i = 0; i <= pageCount; i++) {
        urls.push(URLReq + "&page=" + i);
    }
    return urls;
}

/**
 * Initialize duration parameters from first page data
 * @param {string} htmlData - HTML from first page
 */
function initializeDurationParams(htmlData) {
    try {
        const tempData = JSON.parse(extractScavengeData(htmlData, 0));
        duration_exponent = tempData[1].duration_exponent;
        duration_factor = tempData[1].duration_factor;
        duration_initial_seconds = tempData[1].duration_initial_seconds;
    } catch (error) {
        console.error("Error initializing duration parameters:", error);
    }
}

/**
 * Collect village data from all pages
 * @param {string[]} urls - Array of page URLs to fetch
 * @returns {Promise<object[]>} Promise resolving to parsed scavenge info array
 */
function fetchAllVillageData(urls) {
    return new Promise((resolve, reject) => {
        let arrayWithData = "[";

        $.getAll(urls,
            (i, data) => {
                const villageData = extractScavengeData(data, 2);
                arrayWithData += villageData + ",";
            },
            () => {
                // Remove trailing comma and close JSON array
                arrayWithData = arrayWithData.slice(0, -1) + "]";
                try {
                    resolve(JSON.parse(arrayWithData));
                } catch (error) {
                    reject(new Error("Failed to parse village data: " + error.message));
                }
            },
            (error) => {
                reject(error);
            }
        );
    });
}

/**
 * Process all villages and calculate troop allocations
 * @param {object[]} villageData - Array of village scavenge data
 */
function processVillageData(villageData) {
    scavengeInfo = villageData;

    // Calculate per village how many troops per category need to be sent
    for (let i = 0; i < scavengeInfo.length; i++) {
        calculateHaulCategories(scavengeInfo[i]);
    }
}

/**
 * Group squad requests into batches (max 50 per batch)
 * @returns {object} Grouped squads with keys 0, 1, 2, etc.
 */
function groupSquadsByLimit() {
    const SQUAD_LIMIT = 50;
    const groupedSquads = {};
    const groupedSquadsPremium = {};

    let groupNumber = 0;
    let squadsInGroup = 0;

    groupedSquads[groupNumber] = [];
    groupedSquadsPremium[groupNumber] = [];

    for (let k = 0; k < squad_requests.length; k++) {
        if (squadsInGroup === SQUAD_LIMIT) {
            groupNumber++;
            groupedSquads[groupNumber] = [];
            groupedSquadsPremium[groupNumber] = [];
            squadsInGroup = 0;
        }
        squadsInGroup++;
        groupedSquads[groupNumber].push(squad_requests[k]);
        groupedSquadsPremium[groupNumber].push(squad_requests_premium[k]);
    }
    return {squads: groupedSquads, squads_premium: groupedSquadsPremium};
}

/**
 * Build HTML for launch buttons
 * @param {object} squadsData - Grouped squads object
 * @returns {string} HTML string for the launch interface
 */
function buildLaunchButtonsHTML(squadsData) {
    const squads = squadsData.squads;
    const groupCount = Object.keys(squads).length;

    // check if all groups are empty, if so, show message and return
    const allGroupsEmpty = Object.values(squads).every(group => group.length === 0);
    if (allGroupsEmpty) {
        UI.ErrorMessage("No valid scavenge runs available based on your settings and current village data. Maybe all your villages are already sent out for scavenging, or you have chosen very strict settings? Try changing your settings to get some valid runs!",5000);
        return "";
    }

    let html = `<div id="massScavengeFinal" class="ui-widget-content launch-window">
        <button class="btn close-btn" id="x" onclick="closeWindow('massScavengeFinal')">X</button>
        <table id="massScavengeSophieFinalTable" class="vis table-bg" border="1" style="width: 100%;">
            <tr>
                <th class="table-header" colspan="10" id="massScavengeSophieTitle">
                    <h3>
                        <center style="margin:10px"><u>
                            <font class="text-title">${langShinko[7]}</font>
                        </u></center>
                    </h3>
                </th>
            </tr>`;

    for (let s = 0; s < groupCount; s++) {
        html += `<tr id="sendRow${s}" class="bg-primary">
            <td class="center-text bg-primary">
                <center><input type="button" class="btn btnSophie" id="sendMass" onclick="sendGroup(${s},false)" value="${langShinko[8]}${s + 1}"></center>
            </td>
            <td class="center-text bg-primary">
                <center><input type="button" class="btn btn-pp btn-send-premium" id="sendMassPremium" onclick="sendGroup(${s},true)" value="${langShinko[8]}${s + 1} WITH PREMIUM" style="display:none"></center>
            </td>
            <td class="center-text bg-primary">
                <img src="https://dszz.innogamescdn.com/asset/c1ec22b6/graphic/questionmark.webp" class="" data-title="Show Group data" onclick="showGroup(${s})">
            </td>
        </tr>`;
    }

    html += "</table></div>";
    return html;
}

/**
 * Render the launch interface to the page
 * @param {string} htmlContent - HTML to render
 */
function renderLaunchInterface(htmlContent) {
    DOM.mainCell().eq(0).prepend(htmlContent);
    DOM.mobileContent().eq(0).prepend(htmlContent);

    if (!is_mobile) {
        $("#massScavengeFinal").draggable();
    }

    // Show premium buttons if enabled
    if (premiumBtnEnabled) {
        DOM.sendMassPremiumButtons().each((index, element) => {
            $(element).show();
        });
    }

    DOM.sendMassButtons().eq(0)[0].focus();
}

/**
 * Main function to fetch and process scavenge data
 */
async function getData() {
    DOM.main().remove();

    try {
        // Step 1: Get initial page data and count pages
        const initialData = await $.get(URLReq);
        const pageCount = getPageCount();
        initializeDurationParams(initialData);

        // Step 2: Build URLs for all pages
        const pageURLs = buildPageURLs(pageCount);

        // Step 3: Fetch all village data
        const villageData = await fetchAllVillageData(pageURLs);

        // Step 4: Process village data and calculate allocations
        processVillageData(villageData);

        // Step 5: Group squads by limit
        const squadsData = groupSquadsByLimit();
        squads = squadsData.squads;
        squads_premium = squadsData.squads_premium;

        // Step 6: Build and render UI
        const launchHTML = buildLaunchButtonsHTML(squadsData);
        renderLaunchInterface(launchHTML);

    } catch (error) {
        console.error("Error in getData:", error);
    }
}

$.getAll = function(
    urls, // array of URLs
    onLoad, // called when any URL is loaded, params (index, data)
    onDone, // called when all URLs successfully loaded, no params
    onError // called when a URL load fails or if onLoad throws an exception, params (error)
) {
    let numDone = 0;
    let lastRequestTime = 0;
    let minWaitTime = 200; // ms between requests
    loadNext();

    function loadNext() {
        if (numDone === urls.length) {
            onDone();
            return;
        }

        let now = Date.now();
        let timeElapsed = now - lastRequestTime;
        if (timeElapsed < minWaitTime) {
            let timeRemaining = minWaitTime - timeElapsed;
            setTimeout(loadNext, timeRemaining);
            return;
        }
        DOM.progressBar().css("width", `${(numDone + 1) / urls.length * 100}%`);
        lastRequestTime = now;
        $.get(urls[numDone])
            .done((data) => {
                try {
                    onLoad(numDone, data);
                    ++numDone;
                    loadNext();
                } catch (e) {
                    onError(e);
                }
            })
            .fail((xhr) => {
                onError(xhr);
            })
    }
};