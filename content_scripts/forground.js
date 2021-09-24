chrome.storage.local.set({ div_appended: "not_yet" }, function () {
  console.log("content script says : " + value);
});
