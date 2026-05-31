import { TabManager, TabFactory } from './tab-objects.js';
import { lookupKanjiInfo, getSettings, setSettings, saveTabState, setStyling, getRadicals} from './controller.js';


const tabs = await chrome.runtime.sendMessage({
    type: "GET_TAB_STATE"
});
let tabManager = await TabManager.create(tabs);
let tabFactory = new TabFactory();

/* Tab logic functions */

async function appendKanjiTab(kanji) {
    try {
        const tab = await tabFactory.createKanjiTab({
            kanji: kanji, 
            index: tabManager.getLength(),
            kanjiInfo: await lookupKanjiInfo(kanji),
            settings: await getSettings(),
            radicals: await getRadicals()

        });
        tabManager.createNewTab(tab);
        renderTabs();
    } catch {
        return;
    }
    
}
function appendHomeTab() {
    const tab = tabFactory.createHomeTab(tabManager.getLength());
    tabManager.createNewTab(tab);
    renderTabs();
}
async function appendSettingTab() {
    const tab = await tabFactory.createSettingsTab({
        index: tabManager.getLength(),
        settings: await getSettings()
    });
    tabManager.createNewTab(tab);
    renderTabs();
}
function setHomeTab() {
    const currentTabIndex = tabManager.getCurrentTabIndex();
    const tab = tabFactory.createHomeTab(currentTabIndex);
    tabManager.changeCurrentTab(tab);
    renderTabs();
}
async function setKanjiTab(kanji) {
    try {
        const currentTabIndex = tabManager.getCurrentTabIndex();
        const tab = await tabFactory.createKanjiTab({
            kanji: kanji,
            index: currentTabIndex,
            kanjiInfo: await lookupKanjiInfo(kanji),
            settings: await getSettings(),
            radicals: await getRadicals()
        });
        tabManager.changeCurrentTab(tab);
        renderTabs();
    } catch {
        return;
    }
}
function clearTabs() {
    tabManager.clearTabs();
    renderTabs();
}
function tabSelect(index) {
    tabManager.setCurrentTab(index);
    renderTabs();
}
function tabExit(index) {
    try {
        tabManager.removeTab(index);
        renderTabs();
    } catch (error) {
        if (error instanceof RangeError) {
            return;
        }
        console.error(error);
    }
}

/* Search bar functions */

async function submitSearch(event) {
    event.preventDefault();
    const form = event.target;
    const kanji = form.querySelector('input[name=search-text]').value;
    await setKanjiTab(kanji);
}
async function appendSearch() {
    const searchValue = document.querySelector('input[name=search-text]').value;
    await appendKanjiTab(searchValue);
}



export async function submitSettings(event) {
    event.preventDefault();
    const form = event.target;

    const settings = {
        etymologyLanguage: form.querySelector('input[name="etymology-language"]:checked').value,
        hoverHotkey: form.querySelector('input[name="hover-hotkey"]:checked').value,
        newTabHotkey: form.querySelector('input[name="new-tab-hotkey"]:checked').value,
        theme: form.querySelector('input[name="theme"]:checked').value,
        onyomiKana: form.querySelector('input[name="onyomi-kana"]:checked').value,
        onyomiDisplay: form.querySelector('input[name="onyomi-display"]:checked').value,
        display: []
    };

    const displayCheckboxes = form.querySelectorAll('.display input[type="checkbox"]:checked');
    for (const cb of displayCheckboxes) {
        settings.display.push(cb.value);
    }
    await chrome.runtime.sendMessage({
        type: "SET_SETTINGS",
        settings
    });
}


/* Render */

function renderTabs() {
    const tabLabelContainer = document.getElementById("tab-label-container");
    const tabPanelContainer = document.getElementById("tab-panel-container");

    tabLabelContainer.innerHTML = '';
    tabPanelContainer.innerHTML = '';

    for (var tabLabel of tabManager.getTabLabels()) {
        const element = document.createElement('div');
        element.innerHTML = tabLabel.getHtml();
        tabLabelContainer.appendChild(element);
    }
    

    const tabPanelelement = document.createElement('div');
    tabPanelelement.innerHTML = tabManager.currentTab.getTabPanel().getHtml();
    tabPanelContainer.appendChild(tabPanelelement);

    const tabButtons = document.getElementsByClassName('tab-label-button');
    for (let button of tabButtons) {
        button.addEventListener("click", function() {tabSelect(button.dataset.index)});
    }

    var higlightedTabLabel = document.getElementById(`tab-label-button-${tabManager.getCurrentTabIndex()}`);
    higlightedTabLabel.setAttribute("value", "highlighted");

    const exitButtons = document.getElementsByClassName('exit-button');
    for (let button of exitButtons) {
        button.addEventListener("click", function() {tabExit(button.dataset.index)});
    }

    //settings tab
    const settingsForm = document.getElementById("setting-form");
    if (settingsForm) {
        settingsForm.addEventListener("submit", submitSettings);
    }

    //search bar
    const searchForm = document.getElementById("search-form");
    if (searchForm) {
        searchForm.addEventListener("submit", submitSearch);
        const appendSearchBtn = document.getElementById("append-search");
        appendSearchBtn.addEventListener("click", appendSearch);
    }
    saveTabState(tabManager.toJson());
}

/* Constant top-page buttons */

const clearButton = document.getElementById("clear-button");
const homeButton = document.getElementById("home-button");
const settingsButton = document.getElementById("settings-button");
const newTabButton = document.getElementById("new-tab-button");

clearButton.addEventListener("click", function() {clearTabs()})
homeButton.addEventListener("click", function() {setHomeTab()});
settingsButton.addEventListener("click", async function() {await appendSettingTab()});
newTabButton.addEventListener("click", function() {appendHomeTab()});


await setStyling();
renderTabs();