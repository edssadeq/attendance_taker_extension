console.log("Hiiiii popup");
// let status_h2 = document.querySelector("#status");
let activate_btn = document.querySelector("#activateBtn");

activate_btn.addEventListener("click", (_) => {
  console.log("POPUP btn");
  chrome.runtime.sendMessage({
    message: "load_content_script",
    source: "popup",
  });
  // status_h2.textContent = "Service Added !";
  // status_h2.classList.add("activated");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
});
