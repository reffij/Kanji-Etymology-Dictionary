/* Settings */

const DEFAULT_SETTINGS = {
    etymologyLanguage: 'en',
    hoverHotkey: 'alt',
    newTabHotkey: 'alt+t',
    theme: 'dark',
    onyomiKana: 'katakana',
    onyomiDisplay: 'compact',
    display: [
                'strokeCount',
                'radicals',
                'grade',
                'JLPT',
                'frequency',
                'englishMeaning',
                'heisig',
                'unicode',
                'kyujitai',
                'citations'
            ]
};

async function getSettings() {
    try {
        const response = await chrome.storage.local.get("settings");

        return {
            ...DEFAULT_SETTINGS,
            ...(response.settings || {})
        };
    } catch (error) {
        console.error("Error getting settings: ", error);
        return DEFAULT_SETTINGS;
    }
    
}

async function saveSettings(settings) {
    try {
        await chrome.storage.local.set({settings});
    } catch (error) {
        console.error("Error setting settings: ", error);
    }
}

async function getSetting(key) {
    const settings = await getSettings();
    return settings[key];
}

/* Tab state */

const DEFAULT_TAB_STATE = {
    tabs: ['H'],
    index: 0
}

async function getTabState() {
    try {
        const response = await chrome.storage.local.get("tabState");

        return {
            ...DEFAULT_TAB_STATE,
            ...(response.tabState || {})
        };
    } catch (error) {
        console.error("Error getting tab state: ", error);
        return DEFAULT_TAB_STATE;
    }
    
}

async function saveTabState(tabState) {
    try {
        await chrome.storage.local.set({tabState})
    } catch (error) {
        console.error("Error setting tab state: ", error);
    }
}


/* Kanji data */

let KANJI_DATA = null;

async function loadKanjiData() {
    if (KANJI_DATA) {
        return KANJI_DATA;
    }

    const response = await fetch(chrome.runtime.getURL("kanji-data.json"));
    const raw = await response.json();

    KANJI_DATA = new Map(Object.entries(raw));
    return KANJI_DATA;
}

async function getKanji(kanji) {
    const kanjiData = await loadKanjiData();
    const res = kanjiData.get(kanji);
    if (!res) {
        return null;
    }
    return res;
}

/* TODO Radical data */

let RADICAL_DATA = null;

async function loadRadicalData() {
    if (RADICAL_DATA) {
        return RADICAL_DATA;
    }

    const response = await fetch(chrome.runtime.getURL("bipartite-radical-kanji.json"));
    const raw = await response.json();

    RADICAL_DATA = new Map(Object.entries(raw));
    return RADICAL_DATA;
}

async function getRadicals(kanji) {
    const radicalData = await loadRadicalData();
    const res = radicalData.get(`1,${kanji}`);
    if (!res) {
        return null;
    }
    return res;
}

/* TODO Phonetic series data */

/* Interface */

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    (async () => {
        switch (msg.type) {

            case "KANJI_LOOKUP":
                sendResponse(
                    await getKanji(msg.kanji)
                );
                break;
            case "GET_SETTINGS":
                sendResponse(await getSettings());
                break;
            case "GET_SETTING":
                sendResponse(await getSetting(msg.key));
                break;
            case "SET_SETTINGS":
                await saveSettings(msg.settings);
                sendResponse(true);
                break;
            case "GET_TAB_STATE":
                sendResponse(await getTabState());
                break;
            case "SET_TAB_STATE":
                await saveTabState(msg.tabState);
                sendResponse(true);
                break;
            case "OPEN_POPUP":
                chrome.action.openPopup();
                sendResponse(true);
                break;
            case "GET_RADICALS":
                sendResponse(await getRadicals(msg.kanji));
                break;
            default:
                console.warn("Unknown message:", msg);
                sendResponse(null);
        }
    })();

    return true;
});
