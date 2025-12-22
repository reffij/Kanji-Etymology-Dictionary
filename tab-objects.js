import { HtmlFactory } from './html-factory.js'

const htmlFactory = new HtmlFactory();

class TabLabel {
    constructor(name, index) {
        this.name = name;
        this.index = index
        this.html = htmlFactory.tabLabelHtml(name, index);
    }

    shift(dIndex) {
        this.index += dIndex;
        this.update();
    }

    update() {
        this.html = htmlFactory.tabLabelHtml(this.name, this.index);
    }

    getHtml() {
        return this.html;
    }
}

class TabPanel {
    constructor(html) {
        this.html = html
    }

    getHtml() {
        return this.html;
    }
}

class Tab {
    constructor(name, index, tabPanel) {
        this.name = name;
        this.index = index;
        this.tabLabel = new TabLabel(name, index);
        this.tabPanel = tabPanel;
    }

    getName() {
        return this.name;
    }

    getTabLabel() {
        return this.tabLabel;
    }

    getTabPanel() {
        return this.tabPanel;
    }

    getIndex() {
        return this.index;
    }

    shift(dIndex) {
        this.index += dIndex
        this.tabLabel.shift(dIndex);
    }
}

export class TabFactory {
    async createKanjiTab(kanji, index) {
        const html = await htmlFactory.kanjiTabPanelHtml(kanji);
        const tabPanel = new TabPanel(html);
        return new Tab(kanji, index, tabPanel);
    }

    async createSettingsTab(index) {
        const html = await htmlFactory.settingTabPanelHtml();
        const tabPanel = new TabPanel(html);
        return new Tab('S', index, tabPanel);
    }

    createHomeTab(index) {
        const html = htmlFactory.homeTabPanelHtml();
        const tabPanel = new TabPanel(html);
        return new Tab('H', index, tabPanel);
    }
}

const tabFactory = new TabFactory();

export class TabManager {
    constructor(tabs, currentIndex) {
        this.tabs = tabs
        this.setCurrentTab(currentIndex);
    }

    static async create(tabManagerJson) {
        var tabs = await Promise.all(
                tabManagerJson.tabs.map(async (tabName, i) => {
                if (tabName === 'H') {
                    return tabFactory.createHomeTab(i);
                }
                if (tabName === 'S') {
                    return await tabFactory.createSettingsTab(i);
                }
                    return await tabFactory.createKanjiTab(tabName, i);
            })
        );
        return new TabManager(tabs, tabManagerJson.index);
    }

    toJson() {
        return {
            tabs: this.tabs.map(tab => tab.getName()),
            index: this.currentTabIndex
        };
    }

    createNewTab(tab) {
        this.tabs.push(tab);
        this.setCurrentTab(this.tabs.length - 1);
    }

    setCurrentTab(index) {
        if (index < 0 || index >= this.tabs.length) {
            throw new RangeError("index out of range.");
        }
        this.currentTabIndex = index;
        this.currentTab = this.tabs[index];
    }

    changeCurrentTab(tab) {
        this.tabs[this.currentTabIndex] = tab;
        this.currentTab = tab;
    }

    removeTab(index) {
        if (index < 0 || index >= this.tabs.length || this.tabs.length == 1) {
            throw new RangeError("index out of range.");
        }

        const removedTab = this.tabs[index];
        const wasCurrent = (this.currentTab === removedTab);

        this.tabs.splice(index, 1);
        
        for (let j = index; j < this.tabs.length; j++) {
            this.tabs[j].shift(-1);
        }
        
        if (wasCurrent && Number(index) === Number(this.tabs.length)) {
            this.setCurrentTab(index - 1);
        } else if (wasCurrent) {
            this.setCurrentTab(index);
        } else if (this.currentTabIndex > Number(index)) {
            this.currentTabIndex -= 1;
        }
    }

    getTabLabels() {
        return this.tabs.map(tab => tab.getTabLabel());
    }

    getCurrentTab() {
        return this.currentTab.getTabPanel();
    }

    getLength() {
        return this.tabs.length;
    }

    getCurrentTabIndex() {
        return this.currentTabIndex;
    }

    clearTabs() {
        this.tabs = [];
        this.currentTab = tabFactory.createHomeTab(0);
        this.tabs.push(this.currentTab);
        this.currentTabIndex = 0;
    }
}