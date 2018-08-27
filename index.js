"use strict";

const p = (fn, ...args) => new Promise(resolve => fn(...args, resolve));
// I copied this from
// https://github.com/sindresorhus/merge-windows/blob/master/background.js

const hoverState = { activeTab: 0, hoveredTab: 0 };

const updateTabHoverClasses = () => {
  const { activeTab, hoveredTab } = hoverState;
  const tabElements = Array.from(document.querySelectorAll(".tab-list-item"));
  tabElements.forEach(el => el.classList.remove("-hovered"));
  tabElements
    .slice(activeTab + 1, hoveredTab + 1)
    .concat(tabElements.slice(hoveredTab, activeTab))
    .forEach(el => el.classList.add("-hovered"));
};

/**
 * @param {number} index
 */
const hoverTab = index => {
  hoverState.hoveredTab = index;
  updateTabHoverClasses();
};

/**
 * @param {number} start
 * @param {number} end
 */
const detachRange = async (start, end) => {
  const tabs = await p(chrome.tabs.query, { currentWindow: true });
  const newWindow = await p(chrome.windows.create, {
    tabId: tabs[start].id,
  });
  const tabsToMove = tabs.slice(start + 1, end).map(tab => tab.id);
  await p(chrome.tabs.move, tabsToMove, { windowId: newWindow.id, index: -1 });
};

const detachHoveredRange = async () => {
  const { hoveredTab, activeTab } = hoverState;
  if (hoveredTab < activeTab) {
    detachRange(hoveredTab, activeTab + 1);
  } else {
    detachRange(activeTab, hoveredTab + 1);
  }
};

const renderTabList = async () => {
  const tabListElement = document.querySelector("#tabs");
  if (!tabListElement) return;
  const tabs = await p(chrome.tabs.query, { currentWindow: true });
  tabs.forEach((tab, index) => {
    const el = document.createElement("button");
    el.innerHTML = tab.title;
    el.onmouseenter = () => hoverTab(index);
    el.classList.add("tab-list-item");
    el.onclick = detachHoveredRange;
    if (tab.active) {
      el.classList.add("-active-tab");
      hoverState.activeTab = index;
      hoverState.hoveredTab = index;
    }
    tabListElement.appendChild(el);
  });
};

// main:
renderTabList();
