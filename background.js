console.log("Hi background");

const BASE_URL = "http://127.0.0.1:8080/";
const GET_ALL_COURSES_URL = BASE_URL + "courses";
const GET_ALL_MEETS_URL = BASE_URL + "meets";
const GET_ALL_PARTICIPANTS_URL = BASE_URL + "participants";
const GET_ALL_FOLOW_COURSE_URL = BASE_URL + "follow_course";
const GET_ALL_PARTICIPATE_MEET_URL = BASE_URL + "participate_meet";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //console.log(request);
  if (request.message == "load_content_script") {
    //popup message
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      //console.log(tabs);
      let currentTab = tabs[0];
      if (/https\:\/\/meet\.google\.com/.test(currentTab.url)) {
        //inject main.js
        //console.log(currentTab.title);
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
    //from main js
    chrome.storage.local.get(["meet_info"], function (result) {
      //alert("added to DB ! " + result.meet_info.meet_data.meet_id);
      console.log(result);
      insertMeeToDb(result.meet_info);
    });
  }
});

function insertMeeToDb(meet_info) {
  // const url = "http://127.0.0.1:8000/meets";
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
  let test = {
    meet_data: {
      attandence_taking_datetime: "2021-10-01 16:09:45",
      course_info: {
        course_id: "Java EE 2",
        is_new_course: true,
      },
      meet_date: "2021-10-01",
      meet_id: "cid-kvnd-mzi",
    },
    messages: [
      {
        message_formatted_timestamp: "17:09",
        message_timestamp: "1633104564001",
        participant_messages: ["essadeq@gmail.com"],
        participant_name: "You",
      },
    ],
  };
  //insert course if it is new
  let course_to_insert = null;
  let meet_to_insert = null;

  //insert meet to course
  meet_to_insert = {
    MEET_ID: meet_info.meet_data.meet_id + "D" + meet_info.meet_data.meet_date,
    COURSE_ID: meet_info.meet_data.course_info.is_new_course
      ? null //TODO: get thegenerated course_id
      : meet_info.meet_data.course_info.course_id,
    MEET_DATE_TIME: meet_info.meet_data.attandence_taking_datetime,
    PAR_NUMBER: null,
    MEET_ORGANISER: null,
    MEET_NOTES: "From extension",
  };

  //lopping and insert participants (par to meet ) && (par to course )
  let filtred_participants = [];
  for (let i = meet_info.messages.length - 1; i >= 0; i--) {
    if (
      !isMessageParExist(
        filtred_participants,
        meet_info.messages[i].participant_name
      )
    ) {
      filtred_participants.push(meet_info.messages[i]);
    }
  }

  /*
"PAR_FNAME":"Mariam","PAR_LNAME":"Mzil","PAR_EMAIL":null}
  */

  //logging
  // console.log(course_to_insert);
  // console.log(meet_to_insert);
  // console.log(filtred_participants);

  for (let parIndex in filtred_participants) {
    filtred_participants[parIndex] = {
      PAR_FNAME: filtred_participants[parIndex].participant_name.includes(" ")
        ? filtred_participants[parIndex].participant_name.slice(
            0,
            filtred_participants[parIndex].participant_name.indexOf(" ")
          )
        : filtred_participants[parIndex].participant_name,
      PAR_LNAME: filtred_participants[parIndex].participant_name.includes(" ")
        ? filtred_participants[parIndex].participant_name.slice(
            filtred_participants[parIndex].participant_name.indexOf(" ") + 1
          )
        : "_",
      PAR_EMAIL:
        filtred_participants[parIndex].participant_messages[
          filtred_participants[parIndex].participant_messages.length - 1
        ],
    };
  }

  if (meet_info.meet_data.course_info.is_new_course) {
    course_to_insert = {
      COURSE_NAME: meet_info.meet_data.course_info.course_id,
      COURSE_DESC:
        "From extension, meet " +
        meet_info.meet_data.meet_id +
        "D" +
        meet_info.meet_data.meet_date,
      MEETS_NUMBER: null,
    };
    insertData(GET_ALL_COURSES_URL, course_to_insert)
      .then((data) => {
        meet_to_insert.COURSE_ID = data.COURSE_ID;
        insertData(GET_ALL_MEETS_URL, meet_to_insert);
        //insert partcipants
        filtred_participants.forEach((par) => {
          //insert par
          insertData(GET_ALL_PARTICIPANTS_URL, par)
            .then((par_data) => {
              insertData(GET_ALL_FOLOW_COURSE_URL, {
                PAR_ID: par_data.PAR_ID,
                COURSE_ID: data.COURSE_ID,
              });
              insertData(GET_ALL_PARTICIPATE_MEET_URL, {
                PAR_ID: par_data.PAR_ID,
                MEET_ID: meet_to_insert.MEET_ID,
              });
            })
            .catch((err) => {
              console.log(err);
            });
          // insertData(GET_ALL_FOLOW_COURSE_URL, {"PAR_ID":"2","COURSE_ID":"3"})
          // insertData(GET_ALL_PARTICIPATE_MEET_URL, {"PAR_ID":"4","MEET_ID":"454124"})
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    insertData(GET_ALL_MEETS_URL, meet_to_insert);
    //insert partcipants
    filtred_participants.forEach((par) => {
      //insert par
      insertData(GET_ALL_PARTICIPANTS_URL, par)
        .then((par_data) => {
          insertData(GET_ALL_FOLOW_COURSE_URL, {
            PAR_ID: par_data.PAR_ID,
            COURSE_ID: Number.parseInt(
              meet_info.meet_data.course_info.course_id
            ),
          });
          insertData(GET_ALL_PARTICIPATE_MEET_URL, {
            PAR_ID: par_data.PAR_ID,
            MEET_ID: meet_to_insert.MEET_ID,
          });
        })
        .catch((err) => {
          console.log(err);
        });
      // insertData(GET_ALL_FOLOW_COURSE_URL, {"PAR_ID":"2","COURSE_ID":"3"})
      // insertData(GET_ALL_PARTICIPATE_MEET_URL, {"PAR_ID":"4","MEET_ID":"454124"})
    });
  }
}

//check if participant in the array
function isMessageParExist(array_, par_name) {
  if (this.length <= 0) return 0;
  if (!this.participant_name) return 0;
  //else if()
  for (let i = array_.length - 1; i >= 0; i--) {
    if (array_participant_name == par_name) return 1;
  }
  return 0;
}

//insert a course
function insertData_(url, data) {
  let options = {
    method: "POST",
    body: JSON.stringify(data),
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
      chrome.runtime.sendMessage({
        message: "item has been added!",
        source: "bg",
      });
    })
    .catch((err) => {
      console.log("Error message: " + err);
    });
}

async function insertData(url, data) {
  let options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
    },
  };

  let response = await fetch(url, options);
  return response.json();
}

//insert
