let KANJI_DATA = {};
let SETTINGS = {};


async function fetchSettings() {
  const response = await new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (response) => {
      resolve(response);
    });
  });
  SETTINGS = response;
}

async function main() {
    await fetchSettings();
    fetch(chrome.runtime.getURL("kanji-data.json"))
        .then(response => response.json())
        .then(data => {
            KANJI_DATA = data;
        });
    
    let lastKanji = 'H';
    let popup = null;
    let isKeyActivated = (SETTINGS.hoverHotkey === 'auto') ? true : false;

    const keys = {
        'ctrl': 'Control',
        'alt': 'Alt'
    }

    const ETYMOLOGY_KEY = (SETTINGS.etymologyLanguage === 'jp') ? 'jpjigen' : 'enjigen';
    const HOVER_HOTKEY = keys[SETTINGS.hoverHotkey];
    const isNewTabHotKey = (SETTINGS.newTabHotkey === 'alt+t') ? true : false;
    const THEME = SETTINGS.theme;
    const BKG = THEME === 'dark' ? 'rgb(24,24,24)' : 'rgb(239,239,239)';
    const TEXTCOLOR = THEME === 'dark' ? 'rgb(239,239,239)' : 'rgb(24,24,24)';
    const isCitations = new Set(SETTINGS.display).has('citations');

    function citationStrip(str) {
    return str
        .split('\n')
        .filter(line => !line.trim().startsWith('↑'))
        .join('\n')
        .trim();
    }

    function createPopup() {
        popup = document.createElement("div");
        popup.id = "char-popup";

        popup.innerHTML = `
            <div class="kanji-jigen-header"></div>
            <div class="kanji-jigen-body"></div>
        `;

        popup.style.position = "fixed";
        popup.style.background = BKG;
        popup.style.color = TEXTCOLOR;
        popup.style.padding = "6px 10px";
        popup.style.borderRadius = "6px";
        popup.style.fontSize = "12px";
        popup.style.pointerEvents = "none";
        popup.style.zIndex = "999999";
        popup.style.maxWidth = "300px";
        popup.style.display = "none";
        document.body.appendChild(popup);
    }
    createPopup();

    function showPopup(char, data, x, y) {
        const header = popup.querySelector(".kanji-jigen-header");
        const body = popup.querySelector(".kanji-jigen-body");
        body.style.whiteSpace = "pre-wrap";

        header.textContent = char;

        etymologText = (isCitations) ? data[ETYMOLOGY_KEY] : citationStrip(data[ETYMOLOGY_KEY])

        body.textContent = `${etymologText}`;

        popup.style.left = x + 12 + "px";
        popup.style.top = y + 12 + "px";
        popup.style.display = "block";
    }

    function hidePopup() {
        popup.style.display = "none";
    }

    document.addEventListener("mousemove", (e) => {
        const pos = document.caretPositionFromPoint(e.clientX, e.clientY);

        if (!pos || !pos.offsetNode) {
            popup.style.display = "none";
            return;
        }

        const node = pos.offsetNode;

        if (node.nodeType !== Node.TEXT_NODE) {
            popup.style.display = "none";
            return;
        }

        const text = node.textContent;
        const offset = pos.offset;

        const char = text[offset];

        if (char && KANJI_DATA[char] && isKeyActivated) {
            lastKanji = char;
            showPopup(char, KANJI_DATA[char], e.clientX, e.clientY);
        } else {
            hidePopup();
        }
    });


    document.addEventListener("keydown", async (e) => {
        if (e.altKey && e.key === 't' && isNewTabHotKey) {
            tabState = await chrome.runtime.sendMessage({type: 'GET_TAB_STATE'});
            tabState.tabs.push(lastKanji);
            tabState.index = tabState.tabs.length - 1;
            await chrome.runtime.sendMessage({
                type: "SET_TAB_STATE",
                tabState
            });
            await chrome.runtime.sendMessage({type: 'OPEN_POPUP'});
            isKeyActivated = (SETTINGS.hoverHotkey === 'auto') ? true : false;
        }
        if (e.key === HOVER_HOTKEY) {
            isKeyActivated = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === HOVER_HOTKEY) {
            isKeyActivated = false;
        }
    });
}

main();

