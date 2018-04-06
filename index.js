"use strict";

const p = (fn, ...args) => new Promise(resolve => fn(...args, resolve));
// I copied this from
// https://github.com/sindresorhus/merge-windows/blob/master/background.js

const detachRight = async () => {
  const tabs = await p(chrome.tabs.query, { currentWindow: true });
  const currentIndex = tabs.findIndex(tab => tab.active === true);
  if (currentIndex === -1) return;
  const newWindow = await p(chrome.windows.create, {
    tabId: tabs[currentIndex].id,
  });
  const tabsToMove = tabs.slice(currentIndex + 1).map(tab => tab.id);
  await p(chrome.tabs.move, tabsToMove, { windowId: newWindow.id, index: -1 });
};

const detachRightButton = document.querySelector("#detach-right");
if (detachRightButton) {
  detachRightButton.addEventListener("click", detachRight);
}
