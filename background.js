console.log("Hi background");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  if (request.message == "load_content_script") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log(tabs);
      let currentTab = tabs[0];
      if (/https\:\/\/meet\.google\.com/.test(currentTab.url)) {
        console.log(currentTab.title);
        if (currentTab.title.startsWith("Meet –")) {
          let tabID = currentTab.id;
          chrome.tabs.executeScript(tabID, {
            file: "./content_scripts/main.js",
          });
        }
      }
    });
  }

  if (request.message == "send_data_to_db") {
    chrome.storage.local.get(["meet_info"], function (result) {
      //alert("added to DB ! " + result.meet_info.meet_data.meet_id);
      console.log(result);
      insertMeeToDb(result.meet_info);
    });
  }
});

function insertMeeToDb(meet_info) {
  const url = "http://127.0.0.1:8000/meets";
  /*
    {
        "MEET_ID": "123",
        "COURSE_ID": null,
        "MEET_DATE_TIME": "2021-09-14 15:27:08",
        "PAR_NUMBER": null,
        "MEET_ORGANISER": "Ali Rawn",
        "MEET_NOTES": "bla bla ba "
    }
    */
  let data_to_db = {
    MEET_ID: meet_info.meet_data.meet_id,
    COURSE_ID: null,
    MEET_DATE_TIME: meet_info.meet_data.meet_date,
    PAR_NUMBER: null,
    MEET_ORGANISER: "Mariam Amzil",
    MEET_NOTES: "bla bla ba ",
  };
  let options = {
    method: "POST",
    body: JSON.stringify(data_to_db),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
    },
  };

  fetch(url, options)
    .then((res) => {
      res.json();
    })
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log("Error message: " + err);
    });
}
