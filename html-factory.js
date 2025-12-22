export class HtmlFactory {
    tabLabelHtml(name, index) {
        return `
        <div class="tab-label" id="tab-label-${index}">
            <button class="tab-label-button" id="tab-label-button-${index}" data-index="${index}">${name}</button>
            <button class="exit-button" id="tab-exit-button-${index}" data-index="${index}">x</button>
        </div>`;
    }

    searchBar() {
        return `
        <div id=search-bar>
            <form id="search-form">
                <input type="text" id="search-text" name="search-text" placeholder="Search">
                <button type="submit">Search</button>
                <button type="Button" id="append-search">+</button>
            </form>
        </div>`;
    }

    searchByRadical() {
        return `TODO`;
    }

    etymology(isJp, etmologyText, isCitations) {
        function citationStrip(str) {
            return str
                .split('\n')
                .filter(line => !line.trim().startsWith('↑'))
                .join('\n')
                .trim();
            }

        var label = (isJp) ? '字源' : 'Etymology';
        etmologyText = (isCitations) ? etmologyText : citationStrip(etmologyText);
        if (!etmologyText || etmologyText === '字源 unavailable\n' || etmologyText === '字源 unavailable') {
            etmologyText = null;
        }
        return `
            <div id="etymology">
                <h2>${label}</h2>
                <span id="etymology-text">${etmologyText}</span>
            </div>`;

    }

    readingTable(isJp, isCompact, isKatakana, kun, goon, kanon, toon, soon) {
        //helper function
        function hiraganaToKatakana(str) {
            return str.split('').map(char => {
                return String.fromCharCode(char.charCodeAt(0) + 0x60);
            }).join('');
        }

        const DELIMITER = '、';

        if (isKatakana) {
            var goonStrs = goon.map(str => 
                hiraganaToKatakana(str)
            ).join(DELIMITER);
            var kanonStrs = kanon.map(str => 
                hiraganaToKatakana(str)
            ).join(DELIMITER);
            var toonStrs = toon.map(str => 
                hiraganaToKatakana(str)
            ).join(DELIMITER);
            var soonStrs = soon.map(str =>
                hiraganaToKatakana(str)
            ).join(DELIMITER);
        } else {
            var goonStrs = goon.join(DELIMITER);
            var kanonStrs = kanon.join(DELIMITER);
            var toonStrs = toon.join(DELIMITER);
            var soonStrs = soon.join(DELIMITER);
        }
        var kunyomiStrs = kun.join(DELIMITER);
        toonStrs += soonStrs;
        
        if (isJp) {
            var title = '読み';
            var kunyomiTitle = '訓読み';
            var onyomiTitle = '音読み';
            var goonTitle = '呉音';
            var kanonTitle = '漢音';
            var toonTitle = '唐音';
        } else {
            var title = 'Readings';
            var kunyomiTitle = 'Kun';
            var onyomiTitle = 'On';
            var goonTitle = 'Go-on';
            var kanonTitle = 'Kan-on';
            var toonTitle = 'Tō-on';
        }

        var onRow = '';
        var strs = [goonStrs, kanonStrs, toonStrs]
                .filter(str => str !== '')
                .join(DELIMITER);
        if (isCompact && strs) {
            onRow = `<tr>
                        <td>${onyomiTitle}</td>
                        <td>${strs}</td>
                    </tr>`;
        } else {
            if (goonStrs) {
                onRow += `<tr>
                            <td>${goonTitle}</td>
                            <td>${goonStrs}</td>
                        </tr>`;
            }
            if (kanonStrs) {
                onRow += `<tr>
                            <td>${kanonTitle}</td>
                            <td>${kanonStrs}</td>
                        </tr>`;
            }
            if (toonStrs) {
                onRow += `<tr>
                            <td>${toonTitle}</td>
                            <td>${toonStrs}</td>
                        </tr>`;
            }
        }
        
        var kunRow = '';
        if (kunyomiStrs) {
            kunRow = `<tr>
                        <td>${kunyomiTitle}</td>
                        <td>${kunyomiStrs}</td>
                    </tr>`;
        }

        return `
            <div id="reading-table">
                <h2>${title}</h2>
                <table>
                    <tbody>
                        ${onRow}
                        ${kunRow}
                    <tbody>
                </table>
            </div>`;
    }

    infoTable(isJp, display, data, radicals) {
        function row(title, datapoint) {
            return `
                <tr>
                    <td>${title}</td>
                    <td>${datapoint}</td>
                </tr>`;
        }

        var title = (isJp) ? '情報' : 'Info';
        let titles = {}
        if (isJp) {
            titles = {
            'frequency': '頻度',
            'grade': '学年',
            'JLPT': 'JLPT',
            'englishMeaning': '英語',
            'strokeCount': '画数',
            'heisig': 'Heisig',
            'unicode': 'Unicode',
            'kyujitai': '旧字体',
            'radicals': '構成要素'
            };
        } else {
            titles = {
            'frequency': 'Frequency',
            'grade': 'Grade',
            'JLPT': 'JLPT',
            'englishMeaning': 'English',
            'strokeCount': 'Stroke Count',
            'heisig': 'Heisig',
            'unicode': 'Unicode',
            'kyujitai': 'Kyūjitai',
            'radicals': 'Radicals'
            };
        }

        function ordinalString(n) {
            res = String(n);
            if (n % 10 === 1 && n % 100 !== 11) {
                return res + 'st';
            }
            if (n % 10 === 2 && n % 100 !== 12) {
                return res + 'nd'
            }
            if (n % 10 === 3 && n % 100 !== 13) {
                return res + 'rd'
            }
            return res + 'th'
        }

        var radicalsString = (radicals) ? radicals.join('、') : null;
        const englishMeaning = data["meanings"].join(', ');
        var jlpt = (data["jlpt"]) ? `N${data["jlpt"]}` : null;
        var frequency = (data["freq_mainichi_shinbun"]) ? ordinalString(data["freq_mainichi_shinbun"]) : null;
        var dataPoints = {
            'frequency': frequency,
            'grade': data["grade"],
            'JLPT': jlpt,
            'englishMeaning': englishMeaning,
            'strokeCount': data["stroke_count"],
            'heisig': data["heisig_en"],
            'unicode': data["unicode"],
            'kyujitai': data["kyujitai"],
            'radicals': radicalsString
        };

        var res = `
            <div id='info-table'>
                <h2>${title}</h2>
                <table>
                    <tbody>`;

        for (let i = 0; i < display.length; i++) {
            res += row(titles[display[i]], dataPoints[display[i]]);
        }
        
        res += `
                    </tbody>
                </table>
            </div>`;
        return res;
    }

    async kanjiTabPanelHtml(kanji) {
        const kanjiInfo = await chrome.runtime.sendMessage({
            type: "KANJI_LOOKUP",
            kanji: kanji
        });

        const settings = await chrome.runtime.sendMessage({
            type: "GET_SETTINGS"
        });

        const radicals = await chrome.runtime.sendMessage({
            type: "GET_RADICALS",
            kanji: kanji
        })

        const isJp = (settings.etymologyLanguage === 'jp');
        const isKatakana = (settings.onyomiKana === 'katakana');
        const isCompact = (settings.onyomiDisplay === 'compact');
        var display = settings.display;
        const displaySet = new Set(display)

        const title = `<h1 id="kanji-character">${kanji}</h1>`;

        //etymology
        var etymologyText = (isJp) ? kanjiInfo["jpjigen"] : kanjiInfo["enjigen"];
        var isCitations = (displaySet.has('citations'))
        var etymologyComponent = this.etymology(isJp, etymologyText, isCitations);


        //reading table
        var readingTable = this.readingTable(
                isJp,
                isCompact, 
                isKatakana,
                kanjiInfo["kun"],
                kanjiInfo["goon"],
                kanjiInfo["kanon"],
                kanjiInfo["toon"],
                kanjiInfo["soon"],
            );

        //info table
        //helper function
        function intersection(set1, set2) {
            let res = []
            for (let item of set1) {
                if (set2.has(item)) {
                    res.push(item);
                }
            }
            return res;
        }

        var infoTable = '';
        var dataTableDisplay = intersection(displaySet, new Set([
            'strokeCount', 
            'radicals',
            'grade', 
            'JLPT', 
            'frequency', 
            'englishMeaning', 
            'heisig', 
            'unicode', 
            'kyujitai'
        ]));
        if (dataTableDisplay) {
            infoTable = this.infoTable(isJp, dataTableDisplay, kanjiInfo, radicals);
        }

        return `
                ${this.searchBar()}
                <div class="kanji-card">
                    <div id="row-1">
                        ${title}
                        ${etymologyComponent}
                    </div>
                    <div id="row-2">
                        ${readingTable}
                        ${infoTable}
                    </div>
                </div>`;
    }

    toggleButton(title, className, option1, option2, value1, value2, firstChecked) {
        let checked1 = (firstChecked) ? 'checked' : '';
        let checked2 = (firstChecked) ? '' : 'checked';

        return `
            <fieldset class="${className}">
            <legend>${title}</legend>

                 <div class="toggle switch">
                    <label for="${className}-${value1}">${option1}</label>

                    <div class="switch-control">
                        <input type="radio" name="${className}" id="${className}-${value1}" value ="${value1}" ${checked1}>
                        <input type="radio" name="${className}" id="${className}-${value2}" value ="${value2}" ${checked2}>

                        <div class="switch-track">
                        <div class="switch-thumb"></div>
                        </div>
                    </div>

                    <label for="${className}-${value2}">${option2}</label>
                </div>
                
            </fieldset>`;
    }

    multiToggleButton(n, title, className, options, values, checkedIndex) {
        let res = `
            <fieldset class="${className}">
            <legend>${title}</legend>
                <div class="multi-toggle">`;
        for (let i = 0; i < n; i++) {
            let checked = (checkedIndex === i) ? 'checked' : ''
            res += `
                    <input type="radio" name="${className}" id="${className}-${values[i]}" value="${values[i]}" ${checked}>
                    <label for="${className}-${values[i]}">${options[i]}</label>`;
        }
        res += `
                    <div class="multi-toggle-track">
                        <div class="multi-toggle-thumb"></div>
                    </div>`;

        res +=  `
                    </div>
                </fieldset>`;

        return res;
    }

    multiCheckBox(n, title, className, options, values, checkedIndexes) {
        let res = `
            <fieldset class="${className}">
            <legend>${title}</legend>
                <div class="multi-checkbox">`;

        for (let i = 0; i < n; i++) {
            let checked = (checkedIndexes.has(i)) ? 'checked' : '';

            res += `
                    <input type="checkbox" id="${className}-${values[i]}" value="${values[i]}" ${checked}>
                    <label for="${className}-${values[i]}">${options[i]}</label>`;
        }

        res += `
                </div>
            </fieldset>`;
        return res;
    }

    async settingTabPanelHtml() {
        const settings = await chrome.runtime.sendMessage({
            type: "GET_SETTINGS"
        });

        const language = (settings.etymologyLanguage === 'jp');
        const hoverHotkey = ['ctrl', 'alt', 'auto'].indexOf(settings.hoverHotkey);
        const newTabHotkey = (settings.newTabHotkey === 'alt+t');
        const theme = (settings.theme === 'dark');
        const onyomiKana = (settings.onyomiKana === 'katakana');
        const onyomiDisplay = (settings.onyomiDisplay === 'compact');
        const display = settings.display;
        const displayOptions = [
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
                            ];
        const displayIndexes = new Set(displayOptions.map((val, index) => {
            if (display.includes(val)) {
                return index;
            }
        }));

        return `
        <div class="settings-form">
            <form id="setting-form">

                <div class="settings-grid">

                    <div class="toggle-column">
                        ${this.toggleButton(
                            '言語・Language', 
                            'etymology-language', 
                            '日本語', 
                            'English', 
                            'jp', 
                            'en', 
                            language
                        )}
                        ${this.multiToggleButton(
                            3, 
                            'ホットキー (Hover)・Hover Hotkey', 
                            'hover-hotkey', 
                            ['CTRL', 'ALT', 'AUTO'], 
                            ['ctrl', 'alt', 'auto'], 
                            hoverHotkey
                        )}
                        ${this.toggleButton(
                            'ホットキー (New Tab)・New Tab Hotkey', 
                            'new-tab-hotkey', 
                            'ALT+T', 
                            'NONE', 
                            'alt+t', 
                            'none', 
                            newTabHotkey)}
                        ${this.toggleButton(
                            'テーマ・Theme', 
                            'theme', 
                            'ダーク・Dark', 
                            'ライト・Light', 
                            'dark', 
                            'light', 
                            theme
                        )}
                        ${this.toggleButton(
                            '音読みの文字・On’yomi Kana', 
                            'onyomi-kana', 
                            'カタカナ', 
                            'ひらがな', 
                            'katakana', 
                            'hiragana', 
                            onyomiKana
                        )}
                        ${this.toggleButton(
                            '音読み表示・On’yomi Display', 
                            'onyomi-display', 
                            '省略・Compact', 
                            '展開・Expanded', 
                            'compact', 
                            'expanded', 
                            onyomiDisplay)}
                    </div>
                    <div class="multi-checkbox-column">
                        ${this.multiCheckBox(
                            10, 
                            '表示・Display', 
                            'display', 
                            [
                                '画数・Stroke Count',
                                '構成要素・Radicals',
                                '学年・Grade',
                                'JLPT',
                                '頻度・Frequency', 
                                '英語意味・English meaning', 
                                'Heisig', 
                                'Unicode', 
                                '旧字体・Kyūjitai',
                                '脚注・Footnotes'
                                ], 
                            displayOptions,
                            displayIndexes
                        )}
                    </div>
                </div>
                <button type="submit" id="save-settings">Save</button>
            </form>
        </div>`;
        //index radical 部首
    }

    license() {
        return `
            <p>
                Reading and character etymology data comes from 
                <a href="https://www.wiktionary.org/">Wiktionary</a> and is 
                liscensed under the 
                <a href="https://creativecommons.org/licenses/by-sa/4.0/">
                Creative Commons Atrribution-ShareAlike licence 4.0 License</a>.
            </p>
            <p>
                Kanji data is gathered from <a href="https://kanjiapi.dev/#!/">
                kanjiapi.dev</a> and is licenced under the <a href="">MIT 
                license</a>
            </p>
            <p>
                kanjiapi.dev uses the EDICT and KANJIDIC dictionary files, 
                which are the property of the <a href="https://www.edrdg.org/">
                Electronic Dictionary Research and Development Group</a> and 
                are used in accordance with their 
                <a href="https://www.edrdg.org/edrdg/licence.html">licence</a>.
            </p>
            <p>
                radical data derived from 
                <a href="https://github.com/yagays/kanjivg-radical">
                kanjivg-radical</a>, licensed under the 
                <a href="https://creativecommons.org/licenses/by-sa/4.0/">
                Creative Commons Attribution–ShareAlike 4.0 License</a>.
            </p>`;
    }

    about() {
        return `
            <div id="welcome">
                <p>
                <strong>Welcome to Kanji-no-jigen</strong>, a kanji dictionary 
                focused on etymology. Enter a kanji into the search bar to 
                learn about its origins and structure. If a kanji's etymology 
                refrences another kanji, use the "+" button to append a tab for 
                another lookup. When web browsing, hover over a kanji to see 
                its etymology, or press "alt+t" to look up the last kanji you
                hovered. You can adjust the dictionary’s behavior and 
                appearance using the settings menu at the top.
                \n
                </p>
                <p> Kanji are traditionally classified according to how they 
                were formed. These categories come from classical 
                Chinese etymology and are often referred to as the <em>Six 
                Categories of Characters</em> (六書). This system is a useful 
                guide for understanding their origins. Below is a legend of 
                common vocabulary used in this dictionary: 
                </p>
                <ul>
                    <li><strong>Ideogram ( 指事 ):</strong> Kanji that indicate 
                    an abstract idea or concept using symbolic marks rather 
                    than pictures. See 下 "down" or 一 "one".</li>
                    <li><strong>Pictogram ( 象形 ):</strong> Kanji that 
                    originated as stylized drawings of real-world objects. Over 
                    time, these drawings became simplified into standard 
                    character forms. See 山 "mountain" or 木 "tree".</li>
                    <li><strong>Ideogrammic compound  ( 會意 / 会意 ): </strong> 
                    Kanji formed by combining two or more characters or 
                    components, where the overall meaning is derived from the 
                    combined meanings of the parts. See 休 "rest", from 
                    "person" (人) by a "tree" (木).
                    <li><strong>Phono-semantic compound ( 形聲 / 形声 ):
                    </strong> Kanji that consist of a semantic component 
                    (hinting at the meaning) and a phonetic component (hinting 
                    at the pronunciation). This is the most common type of 
                    kanji. See 河 "river", from semantic radical "water" (氵) + 
                    phonetic 可.</li>
                    <li><strong>Phonetic loan ( 假借 / 仮借 ):</strong> Kanji 
                    that were originally created for one meaning but later 
                    borrowed to write a different word with a similar 
                    pronunciation, sometimes losing the original meaning. See 
                    来, originally meaning “wheat,” now meaning “to come”.</li>
                    <li><strong>OC:</strong> short for <em>Old Chinese</em>, 
                    referring to reconstructed pronunciations of Chinese as it 
                    was spoken in ancient times.</li>
                </ul>
            </div>`;
    }

    homeTabPanelHtml() {
        return `
        <div id="home-tab">
            ${this.searchBar()}
            ${this.about()}
            ${this.license()}
        </div>`;
    }
}