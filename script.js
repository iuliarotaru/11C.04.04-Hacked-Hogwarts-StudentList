"use strict";

let studentList_link = "http://petlatkea.dk/2019/hogwartsdata/students.json";
let families_link = "http://petlatkea.dk/2019/hogwartsdata/families.json";
let modal = document.querySelector(".modal");
let close = document.querySelector(".close");
let modalImg = document.querySelector("modal-image");

window.addEventListener("DOMContentLoaded", start);

const allStudents = [];
const expelledList = [];
const activeList = [];
let currentList = activeList.concat(expelledList);
const prefectsList = [];
const inquisitorialList = [];

//Function start has event listeners for sorting and filtering, clicking buttons and calls the function that loads JSON
//-----------------------------------------------------------------
function start() {
  document.querySelector("#sorting").addEventListener("change", selectSorting);
  document.querySelector("#students").addEventListener("click", expelStudent);

  document.querySelector(".ravenclaw").addEventListener("click", function() {
    filterList("Ravenclaw");
  });
  document.querySelector(".slytherin").addEventListener("click", function() {
    filterList("Slytherin");
  });
  document.querySelector(".gryffindor").addEventListener("click", function() {
    filterList("Gryffindor");
  });
  document.querySelector(".hufflepuff").addEventListener("click", function() {
    filterList("Hufflepuff");
  });
  document.querySelector(".all").addEventListener("click", function() {
    rebuildList();
  });
  document.querySelector("#noOfStudExpelled").innerHTML = expelledList.length;

  loadJSON();
}
//Load JSON
//---------------------------------------------------
function loadJSON() {
  fetch(studentList_link)
    .then(response => response.json())
    .then(jsonData => {
      prepareStudentData(jsonData);
    });
}
//Prototype for Student
//--------------------------------------------------
const StudentPrototype = {
  firstName: "-firstName-",
  middleName: "-middleName-",
  lastName: "-lastName-",
  house: "-house-",
  id: "-uuid-",
  expel: "-expelled-",
  prefect: "-prefect-",
  inquisitorial: "-inquisitorial-"
};
//Prepare the objects
//----------------------------------------------------
function prepareStudentData(jsonData) {
  jsonData.forEach(jsonObject => {
    const student = Object.create(StudentPrototype);
    //Interpret jsonObject into student properties;

    //clean fullname
    let trimFullName = jsonObject.fullname.trim();
    let splitFullName = trimFullName.split(/[ ,.""-]+/);

    student.firstName = capitalize(splitFullName[0]);
    if (splitFullName.length === 1) {
      student.lastName = " ";
    } else if (splitFullName.length === 2) {
      student.lastName = capitalize(splitFullName[1]);
    } else if (splitFullName.length === 3) {
      student.middleName = capitalize(splitFullName[1]);
      student.lastName = capitalize(splitFullName[2]);
    }

    //clean house
    let trimHouse = jsonObject.house.trim();
    student.house = capitalize(trimHouse);

    student.id = create_UUID();
    student.expel = "EXPELLED";
    student.prefect = "PROUD PREFECT";
    student.inquisitorial = "Member of Inquisitorial Squad";
    //pushing students to allStudents and activeList arrays
    allStudents.push(student);
    activeList.push(student);
    document.querySelector("#noOfActiveStud").innerHTML = activeList.length;
    showNumber();
  });
  //hacking myself in the list
  const meStudent = Object.create(StudentPrototype);
  meStudent.firstName = "Iulia";
  meStudent.lastName = "Rotaru";
  meStudent.house = "Slytherin";
  meStudent.id = "1119";
  meStudent.expel = "EXPELLED";
  meStudent.prefect = "PROUD PREFECT";
  meStudent.inquisitorial = "Member of Inquisitorial Squad";
  allStudents.push(meStudent);
  activeList.push(meStudent);
  rebuildList();
}
//capitalize
function capitalize(str) {
  let cap = str[0].toUpperCase() + str.slice(1).toLowerCase();
  return cap;
}
//Rebuilding the list
//-----------------------------------------------------
function rebuildList() {
  filterList("all");
  sortListBy("firstName");
  displayList(currentList);
}
//Filter the list
//----------------------------------------------------
function filterList(house) {
  currentList = allStudents.filter(filterByHouse);
  function filterByHouse(student) {
    if (student.house === house || house === "all") {
      return true;
    } else {
      return false;
    }
  }
  displayList(currentList);
}
//Sort the list
//---------------------------------------------------
function selectSorting(event) {
  const sortBy = event.target.value;
  sortListBy(sortBy);
  displayList(currentList);
}
function sortListBy(prop) {
  currentList.sort((a, b) => {
    return a[prop].localeCompare(b[prop]);
  });
  displayList(currentList);
}
//Expel
//---------------------------------------------------
function expelStudent(event) {
  const element = event.target; //the thing that was clicked

  const uuid = element.dataset.attribute;
  function studentId(student) {
    if (student.id === uuid) {
      return true;
    } else {
      return false;
    }
  }

  let selectedStudent = activeList.find(student => student.id === uuid);
  console.log(selectedStudent);
  if (
    element.dataset.action === "remove" &&
    selectedStudent.firstName !== "Iulia"
  ) {
    element.value = "EXPELLED";
    element.disabled = "true";
    element.classList.add("buttonstyle");
    prefectsList.splice(
      prefectsList.findIndex(student => student.id === selectedStudent.id),
      1
    );
    inquisitorialList.splice(
      inquisitorialList.findIndex(student => student.id === selectedStudent.id),
      1
    );
    expelledList.push(selectedStudent);

    document.querySelector("#noOfStudExpelled").innerHTML = expelledList.length;
    const indexOfActiveList = activeList.findIndex(studentId);
    activeList.splice(indexOfActiveList, 1);

    showNumber();
    document.querySelector("#noOfActiveStud").innerHTML = activeList.length;
  } else if (selectedStudent.firstName === "Iulia") {
    alert("YOU CAN'T EXPEL ME!");
  }
}
//Make PREFECT
//----------------------------------------------------
function makePrefectStudent(event) {
  const element = event.target; //the thing that was clicked

  const uuid = element.dataset.attribute;

  let selectedStudent = activeList.find(student => student.id === uuid);

  function studentId(student) {
    if (student.id === uuid) {
      return true;
    } else {
      return false;
    }
  }
  if (selectedStudent === undefined) {
    alert("You can't make prefect an expelled student");
  } else {
    const indexOfPrefectsList = prefectsList.findIndex(studentId);

    //toggle button
    if (element.value === "MAKE PREFECT") {
      if (
        prefectsList.filter(stud => stud.house === selectedStudent.house)
          .length == 2
      ) {
        alert(
          "There are already two prefects of " +
            selectedStudent.house +
            ".Remove one of them"
        );
      } else {
        prefectsList.push(selectedStudent);
        return (element.value = "REMOVE PREFECT");
      }
    } else if (element.value === "REMOVE PREFECT") {
      prefectsList.splice(indexOfPrefectsList, 1);
      return (element.value = "MAKE PREFECT");
    }
  }
}

//Show the number of students in each house
//--------------------------------------------------
function countStudentsFromHouse(house) {
  return activeList.filter(x => x.house === house).length;
}
function showNumber() {
  document.querySelector(
    "#noOfStudRavenclaw"
  ).innerHTML = countStudentsFromHouse("Ravenclaw");
  document.querySelector(
    "#noOfStudSlytherin"
  ).innerHTML = countStudentsFromHouse("Slytherin");
  document.querySelector(
    "#noOfStudGryffindor"
  ).innerHTML = countStudentsFromHouse("Gryffindor");
  document.querySelector(
    "#noOfStudHufflepuff"
  ).innerHTML = countStudentsFromHouse("Hufflepuff");
}
//Display the list
//-------------------------------------------------
function displayList(students) {
  document.querySelector("#list tbody").innerHTML = "";

  students.forEach(displayStudent);
}
//Display the students
//--------------------------------------------------
function displayStudent(student) {
  const clone = document
    .querySelector("template#studentList")
    .content.cloneNode(true);

  clone.querySelector("[data-field=firstName]").textContent = student.firstName;
  clone.querySelector("[data-field=lastName]").textContent = student.lastName;
  clone.querySelector("[data-field=house]").textContent = student.house;
  //Checks if one of the displayed student is expelled and if it is, removes the button and adds a text content.
  let expelledStudent = expelledList.find(stud => stud.id === student.id);
  if (expelledStudent !== undefined) {
    clone.querySelector("[data-field=expelledStatus]").textContent =
      student.expel;
    clone.querySelector("[data-action=remove]").parentElement.remove();
  } else if (expelledStudent === undefined) {
    clone.querySelector("[data-action=remove]").dataset.attribute = student.id;
  }
  //Checks if one of the displayed student is prefect and if it is, keeps the value of the button "REMOVE PREFECT" no matter sorting or filtering, and if it is not, then keeps the value"ADD PREFECT"
  let prefectStudent = prefectsList.find(stud => stud.id === student.id);
  if (prefectStudent !== undefined) {
    clone.querySelector("[data-action = prefect]").value = "REMOVE PREFECT";
  } else if (prefectsList === undefined) {
    clone.querySelector("[data-action = prefect]").value = "ADD PREFECT";
  }

  clone.querySelector("[data-action=prefect]").dataset.attribute = student.id;
  clone
    .querySelector("[data-field=prefect")
    .addEventListener("click", makePrefectStudent);
  clone
    .querySelector("[data-action=openButton]")
    .addEventListener("click", function() {
      toggleModal();
      showDetails(student);
    });

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}
//Toggle for open, close the modal
//------------------------------------------------
function windowOnClick(event) {
  if (event.target === modal) {
    toggleModal();
  }
}
close.addEventListener("click", toggleModal);
function toggleModal() {
  modal.classList.toggle("show-modal");
}
//Show details in modal
//-------------------------------------------------
function showDetails(data) {
  document.querySelector(".modal-placeholder").innerHTML = "";
  let clone = document.querySelector(".modal-content").content.cloneNode(true);
  const modalPlaceholder = document.querySelector(".modal-placeholder");

  //show full name in the modal
  if (data.middleName !== "-middleName-") {
    clone.querySelector(".modal-fullname").textContent =
      data.firstName + " " + data.middleName + " " + data.lastName;
  } else {
    clone.querySelector(".modal-fullname").textContent =
      data.firstName + " " + data.lastName;
  }
  //show image in the modal
  if (data.lastName === "Patil") {
    clone.querySelector(
      ".modal-image"
    ).src = `images/${data.lastName.toLowerCase()}_${data.firstName.toLowerCase()}.png`;
  } else {
    clone.querySelector(
      ".modal-image"
    ).src = `images/${data.lastName.toLowerCase()}_${data.firstName[0].toLowerCase()}.png`;
  }
  //show crest
  clone.querySelector(
    ".modal-crest"
  ).src = `images/crest/${data.house.toLowerCase()}-crest.jpg`;
  //Checks if a student is expelled; if it is, shows in the modal "EXPELLED"
  let expelledStudent = expelledList.find(stud => stud.id === `${data.id}`);
  if (expelledStudent !== undefined) {
    clone.querySelector(".modal-expel").textContent = `${data.expel}`;
  } else {
    clone.querySelector(".modal-expel").textContent = "";
  }
  //Checks if a student is prefect; if it is, shows in the modal "PREFECT"
  let prefectStudent = prefectsList.find(stud => stud.id === `${data.id}`);
  if (prefectStudent !== undefined) {
    clone.querySelector(".modal-prefect").textContent = `${data.prefect}`;
  } else {
    clone.querySelector(".modal-prefect").textContent = "";
  }
  //Checks if a student is part of inquisitorial list; if it is, shows in the modal"Member of Inquisitorial List"
  let inquisitorialStudent = inquisitorialList.find(
    stud => stud.id === `${data.id}`
  );
  if (inquisitorialStudent !== undefined) {
    clone.querySelector(
      ".modal-inquisitorial"
    ).textContent = `${data.inquisitorial}`;
    clone.querySelector("[data-action=inquisitorial]").value =
      "Remove from Inquisitorial Squad";
  } else {
    clone.querySelector(".modal-inquisitorial").textContent = "";
    clone.querySelector("[data-action=inquisitorial]").value =
      "Add to Inquisitorial Squad";
  }
  //Blood status
  //-------------------------------------------------
  loadFamilyJSON();

  const FamilyPrototype = {
    halfBlood: "-half-",
    pureBlood: "-pure-"
  };

  function loadFamilyJSON() {
    fetch(families_link)
      .then(response => response.json())
      .then(jsonData => {
        prepareFamilyData(jsonData);
      });
  }
  function prepareFamilyData(jsonData) {
    const family = Object.create(FamilyPrototype);
    //Interpret jsonObject into student properties;

    family.halfBlood = jsonData.half;
    family.pureBlood = jsonData.pure;
    setBloodStatus(family);
  }
  function setBloodStatus(family) {
    if (family.halfBlood.includes(`${data.lastName}`)) {
      modal.querySelector(
        ".modal-blood"
      ).textContent = `blood status: half-blood`;
    } else if (family.pureBlood.includes(`${data.lastName}`)) {
      modal.querySelector(
        ".modal-blood"
      ).textContent = `blood status: pure-wizard`;
    } else {
      modal.querySelector(".modal-blood").textContent = `blood status: muggle`;
    }
    //Inquisitorial List
    //-----------------------------------------------------
    modal.querySelector("[data-action=inquisitorial]").dataset.attribute =
      data.id;

    modal
      .querySelector("#inquisitorial")
      .addEventListener("click", addInquisitorialList);

    function addInquisitorialList(event) {
      const element = event.target;
      const uuid = element.dataset.attribute;

      let selectedStudent = activeList.find(student => student.id === uuid);
      if (selectedStudent === undefined) {
        alert("You can't add to inquisitorial squad an expelled student");
      } else {
        const indexOfInquisitorialList = inquisitorialList.findIndex(studentId);
        function studentId(student) {
          if (student.id === uuid) {
            return true;
          } else {
            return false;
          }
        }
        //TOGGLE BUTTON
        if (element.value === "Add to Inquisitorial Squad") {
          if (
            selectedStudent.house === "Slytherin" ||
            family.pureBlood.includes(capitalize(`${data.lastName}`))
          ) {
            inquisitorialList.push(selectedStudent);
            modal.querySelector(".modal-inquisitorial").textContent =
              "I am part of Inquisitorial Squad";
            console.log(inquisitorialList);
            return (element.value = "Remove from Inquisitorial Squad");
          } else {
            alert(
              "The student does not have pure blood or is not from Slytherin house"
            );
          }
        } else if (element.value === "Remove from Inquisitorial Squad") {
          modal.querySelector(".modal-inquisitorial").textContent = "";
          inquisitorialList.splice(indexOfInquisitorialList, 1);
          return (element.value = "Add to Inquisitorial Squad");
        }
      }
    }
  }
  modalPlaceholder.appendChild(clone);
}

//create UUID source: https://www.w3resource.com/javascript-exercises/javascript-math-exercise-23.php
//------------------------------------------------------
function create_UUID() {
  var dt = new Date().getTime();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(
    c
  ) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}
