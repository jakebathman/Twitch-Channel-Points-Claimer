// ==UserScript==
// @name Twitch Channel Points Claimer
// @version 2.0
// @author JakeBathman
// @description Automatically claim channel points. Based on original script by PartMent
// @match https://www.twitch.tv/*
// @match https://dashboard.twitch.tv/*
// @license MIT
// @grant none
// @namespace https://github.com/jakebathman/Twitch-Channel-Points-Claimer
// ==/UserScript==

let MutationObserver =
    window.MutationObserver ||
    window.WebKitMutationObserver ||
    window.MozMutationObserver;
let claiming = false;
let channelName =
    window.location.pathname.substring(
        window.location.pathname.lastIndexOf('/') + 1
    ) || '';
let localStorageKey = `autoClaimer_count_${channelName}`;
let localStorageKeyGlobal = `autoClaimer_count_global`;

let claimCount = localStorageGet(localStorageKey);
let claimCountGlobal = getGlobalCount();

console.log('############ Global count: ', claimCountGlobal);

var addedCountElement = false;

function addCountEl() {
    console.log('Trying to add count');

    try {
        console.log('############ adding count');
        let cpButton = document.querySelector(
            '.chat-input__buttons-container div:first-of-type'
        );
        var countEl = document.createElement('div');
        countEl.className = 'autoClaimer_count tw-flex';
        countEl.style.cssText = 'margin: auto;color: #9147ff;';
        countEl.innerHTML = getCountHtml();
        cpButton.parentNode.insertBefore(countEl, cpButton.nextSibling);

        addedCountElement = true;
    } catch (e) {
        console.log('Waiting 1s', addedCountElement);
    }
    if (!addedCountElement) {
        setTimeout(() => {
            addCountEl();
        }, 1000);
    }
}
addCountEl();

if (MutationObserver) console.log('Auto claimer is enabled.');
let observer = new MutationObserver((e) => {
    try {
        let bonus = document.querySelector('.claimable-bonus__icon');
        if (bonus && !claiming) {
            console.log('Auto claimer: button added', bonus);
            bonus.click();
            claiming = true;

            claimCount = localStorageInc(localStorageKey);
            claimCountGlobal = localStorageInc(localStorageKeyGlobal);

            // Update counter
            var countEl = document.querySelector('.autoClaimer_count');
            countEl.innerHTML = getCountHtml();

            // After a second or so, revert the claimed status back
            // to false to keep waiting for the next button
            let date = new Date();
            setTimeout(() => {
                console.log('Claimed at ' + date);
                claiming = false;
            }, Math.random() * 1000 + 2000);
        }
    } catch (error) {
        console.error('#### AutoClaimer error!', error);
    }
});

observer.observe(document.body, { childList: true, subtree: true });

function getCountHtml() {
    return `<div style="padding-right: 4px;font-weight:bold;">${claimCount}</div> <div>(${claimCountGlobal})</div>`;
}

function localStorageGet(key) {
    if (!localStorage.hasOwnProperty(key)) {
        // Add the localStorage key for this channel and set to 0
        localStorage.setItem(key, 0);
    }

    return parseInt(localStorage.getItem(key)) || 0;
}

// Add helper increment a localStorage count
function localStorageInc(key) {
    // Get the current value as int
    let value = localStorageGet(key);

    // Add one
    value += 1;

    // Set again
    localStorage.setItem(key, value);

    return value;
}

function getGlobalCount() {
    let globalCount = 0;

    for (let k in localStorage) {
        if (
            k.indexOf('autoClaimer_count_') > -1 &&
            k !== localStorageKeyGlobal
        ) {
            globalCount += parseInt(localStorage.getItem(k));
        }
    }

    localStorage.setItem(localStorageKeyGlobal, globalCount);

    return globalCount;
}
