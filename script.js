"use strict";

let studentList_link = "http://petlatkea.dk/2019/hogwartsdata/students.json";
let modal = document.querySelector(".modal");
let close = document.querySelector(".close");
let modalImg = document.querySelector("modal-image");

window.addEventListener("DOMContentLoaded", start);

const allStudents = [];
const expelledList = [];
const activeList = [];
let currentList = activeList.concat(expelledList);
const prefectList = [];

function start() {
  document.querySelector("#sorting").addEventListener("change", selectSorting);
  document.querySelector("#students").addEventListener("click", clickSomething);

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
function clickSomething(event) {
  const element = event.target; //the thing that was clicked
  const uuid = element.dataset.attribute;
  if (element.dataset.action === "remove") {
    let selectedStudent = activeList.find(student => student.id === uuid);

    element.value = "EXPELLED";
    element.disabled = "true";
    element.classList.add("buttonstyle");

    expelledList.push(selectedStudent);
    document.querySelector("#noOfStudExpelled").innerHTML = expelledList.length;
    const indexOfActiveList = activeList.findIndex(studentId);
    activeList.splice(indexOfActiveList, 1);
    showNumber();
    document.querySelector("#noOfActiveStud").innerHTML = activeList.length;
  }

  function studentId(student) {
    if (student.id === uuid) {
      return true;
    } else {
      return false;
    }
  }
  //return uuid;
}
function selectSorting(event) {
  const sortBy = event.target.value;
  sortListBy(sortBy);
  displayList(currentList);
}

function loadJSON() {
  fetch(studentList_link)
    .then(response => response.json())
    .then(jsonData => {
      cleanObjects(jsonData);
    });
}
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
function cleanObjects(jsonData) {
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
    allStudents.push(student);
    activeList.push(student);
    document.querySelector("#noOfActiveStud").innerHTML = activeList.length;
    showNumber();
  });

  rebuildList();
}
function rebuildList() {
  filterList("all");
  sortListBy("firstName");
  displayList(currentList);
}
function capitalize(str) {
  let cap = str[0].toUpperCase() + str.slice(1).toLowerCase();
  return cap;
}
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
function sortListBy(prop) {
  currentList.sort((a, b) => {
    return a[prop].localeCompare(b[prop]);
  });
  displayList(currentList);
}

function displayList(students) {
  document.querySelector("#list tbody").innerHTML = "";

  students.forEach(displayStudent);
}

function displayStudent(student) {
  const clone = document
    .querySelector("template#studentList")
    .content.cloneNode(true);

  clone.querySelector("[data-field=firstName]").textContent = student.firstName;
  clone.querySelector("[data-field=lastName]").textContent = student.lastName;
  clone.querySelector("[data-field=house]").textContent = student.house;

  let expelledStudent = expelledList.find(stud => stud.id === student.id);
  if (expelledStudent !== undefined) {
    clone.querySelector("[data-field=expelledStatus]").textContent =
      student.expel;
    clone.querySelector("[data-action=remove]").parentElement.remove();
  } else if (expelledStudent === undefined) {
    clone.querySelector("[data-action=remove]").dataset.attribute = student.id;
  }

  clone
    .querySelector("[data-action=openButton]")
    .addEventListener("click", function() {
      toggleModal();
      showDetails(student);
    });

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}
function toggleModal() {
  modal.classList.toggle("show-modal");
}
function windowOnClick(event) {
  if (event.target === modal) {
    toggleModal();
  }
}
close.addEventListener("click", toggleModal);
function showDetails(data) {
  if (data.middleName !== "-middleName-") {
    modal.querySelector(".modal-fullname").textContent =
      data.firstName + " " + data.middleName + " " + data.lastName;
  } else {
    modal.querySelector(".modal-fullname").textContent =
      data.firstName + " " + data.lastName;
  }
  if (data.lastName === "Patil") {
    modal.querySelector(
      ".modal-image"
    ).src = `images/${data.lastName.toLowerCase()}_${data.firstName.toLowerCase()}.png`;
  } else {
    modal.querySelector(
      ".modal-image"
    ).src = `images/${data.lastName.toLowerCase()}_${data.firstName[0].toLowerCase()}.png`;
  }
  modal.querySelector(
    ".modal-crest"
  ).src = `images/crest/${data.house.toLowerCase()}-crest.jpg`;

  let expelledStudent = expelledList.find(stud => stud.id === `${data.id}`);
  if (expelledStudent !== undefined) {
    modal.querySelector(".modal-expel").textContent = `${data.expel}`;
  } else {
    modal.querySelector(".modal-expel").textContent = "";
  }
}

//Prototype for Student
const StudentPrototype = {
  firstName: "-firstName-",
  middleName: "-middleName-",
  lastName: "-lastName-",
  house: "-house-",
  id: "-uuid-",
  expel: "-expelled-",
  prefect: "-prefect-"
};
//create UUID source: https://www.w3resource.com/javascript-exercises/javascript-math-exercise-23.php
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
