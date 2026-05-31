export async function lookupKanjiInfo(kanji) {
    return await chrome.runtime.sendMessage({
            type: "KANJI_LOOKUP",
            kanji: kanji
        });
}

export async function getSettings() {
    return await chrome.runtime.sendMessage({
        type: "GET_SETTINGS"
    });
}

export async function setSettings(settings) {
    return await chrome.runtime.sendMessage({
        type: "SET_SETTINGS",
        
    })
}

export async function getRadicals(kanji) {
    return await chrome.runtime.sendMessage({
        type: "GET_RADICALS",
        kanji: kanji
    });
}

export async function saveTabState(tabState) {
    await chrome.runtime.sendMessage({
        type: "SET_TAB_STATE",
        tabState
    })
}


export async function setStyling() {
    const theme = await chrome.runtime.sendMessage({
        type: "GET_SETTING",
        key: "theme"
    });

    if (theme === "dark") {
        document.documentElement.style.setProperty('--color1', 'rgb(239,239,239)');
        document.documentElement.style.setProperty('--color2', 'rgb(170,170,170)');
        document.documentElement.style.setProperty('--color3', 'rgb(136,136,136)');
        document.documentElement.style.setProperty('--color4', 'rgb(68,68,68)');
        document.documentElement.style.setProperty('--color5', 'rgb(51,51,51)');
        document.documentElement.style.setProperty('--color6', 'rgb(34,34,34)');
        document.documentElement.style.setProperty('--bkg', 'rgb(24,24,24)');
    } else {
        document.documentElement.style.setProperty('--bkg', 'rgb(239,239,239)');
        document.documentElement.style.setProperty('--color6', 'rgb(255, 255, 255)');
        document.documentElement.style.setProperty('--color5', 'rgb(170,170,170)');
        document.documentElement.style.setProperty('--color4', 'rgb(68, 68, 68)');
        document.documentElement.style.setProperty('--color3', 'rgb(102, 102, 102)');
        document.documentElement.style.setProperty('--color2', 'rgb(136, 136, 136)');
        document.documentElement.style.setProperty('--color1', 'rgb(34, 34, 34)');
    }
}