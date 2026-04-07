let subjects = [];
let teachers = [];
let classes = [];
let timetable = {};
let breaks = [];
let availability = {};

const days = ["Mon","Tue","Wed","Thu","Fri"];
const periods = 7;

/* ---------------- TAB SYSTEM ---------------- */
document.querySelectorAll(".tab").forEach(btn=>{
  btn.onclick = () => {
    document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  };
});

/* ---------------- SUBJECTS ---------------- */
function addSubject(){
  const name = subjectName.value;
  const per = +subjectPeriods.value;

  subjects.push({id:Date.now(),name,per});
  subjectName.value="";

  renderSubjects();
  save();
}

function renderSubjects(){
  subjectList.innerHTML = subjects.map(s=>`<li>${s.name} (${s.per})</li>`).join("");

  teacherSubject.innerHTML = subjects.map(s=>`<option value="${s.id}">${s.name}</option>`).join("");
}

/* ---------------- TEACHERS ---------------- */
function addTeacher(){
  teachers.push({
    id:Date.now(),
    name:teacherName.value,
    subject:teacherSubject.value
  });

  teacherName.value="";
  renderTeachers();
  save();
}

function renderTeachers(){
  teacherList.innerHTML = teachers.map(t=>`<li>${t.name}</li>`).join("");

  availTeacher.innerHTML = teachers.map(t=>`<option value="${t.id}">${t.name}</option>`).join("");
}

/* ---------------- CLASSES ---------------- */
function addClass(){
  classes.push({id:Date.now(),name:className.value});
  className.value="";
  renderClasses();
  save();
}

function renderClasses(){
  classList.innerHTML = classes.map(c=>`<li>${c.name}</li>`).join("");
}

/* ---------------- BREAKS ---------------- */
function saveBreaks(){
  breaks = breakInput.value.split(",").map(x=>+x.trim());
  save();
}

/* ---------------- AVAILABILITY ---------------- */
availTeacher.onchange = renderAvailability;

function renderAvailability(){
  const id = availTeacher.value;
  if(!availability[id]) availability[id] = {};

  let html = "<table>";
  html += "<tr><th></th>"+days.map(d=>`<th>${d}</th>`).join("")+"</tr>";

  for(let p=1;p<=periods;p++){
    html += `<tr><td>P${p}</td>`;
    days.forEach((d,i)=>{
      const key = i+"-"+p;
      const blocked = availability[id][key];
      html += `<td class="${blocked?'blocked':''}" onclick="toggleAvail('${id}','${key}')">${blocked?'X':'✓'}</td>`;
    });
    html += "</tr>";
  }

  html += "</table>";
  availabilityGrid.innerHTML = html;
}

function toggleAvail(tid,key){
  if(!availability[tid]) availability[tid]={};

  if(availability[tid][key]) delete availability[tid][key];
  else availability[tid][key]=true;

  renderAvailability();
  save();
}

/* ---------------- TIMETABLE ---------------- */
function generateTimetable(){
  timetable = {};

  classes.forEach(c=>{
    timetable[c.id] = [];

    for(let d=0;d<days.length;d++){
      timetable[c.id][d] = [];

      for(let p=1;p<=periods;p++){
        if(breaks.includes(p)){
          timetable[c.id][d][p] = "BREAK";
          continue;
        }

        const sub = subjects[Math.floor(Math.random()*subjects.length)];
        const teacher = teachers.find(t=>t.subject==sub.id);

        timetable[c.id][d][p] = sub ? sub.name : "";
      }
    }
  });

  renderTimetable();
  renderConflicts();
  save();
}

function renderTimetable(){
  let html = "";

  classes.forEach(c=>{
    html += `<h3>${c.name}</h3><table>`;
    html += "<tr><th></th>"+days.map(d=>`<th>${d}</th>`).join("")+"</tr>";

    for(let p=1;p<=periods;p++){
      html += `<tr><td>P${p}</td>`;
      for(let d=0;d<days.length;d++){
        html += `<td>${timetable[c.id][d][p]||""}</td>`;
      }
      html += "</tr>";
    }

    html += "</table>";
  });

  timetableView.innerHTML = html;
}

/* ---------------- CONFLICTS ---------------- */
function renderConflicts(){
  let conflicts = [];

  classes.forEach(c=>{
    for(let d=0;d<days.length;d++){
      let used = {};
      for(let p=1;p<=periods;p++){
        const sub = timetable[c.id][d][p];
        if(used[sub]) conflicts.push(`${c.name} double subject ${sub}`);
        used[sub]=true;
      }
    }
  });

  conflictView.innerHTML = conflicts.length ? conflicts.join("<br>") : "No conflicts";
}

/* ---------------- STORAGE ---------------- */
function save(){
  localStorage.setItem("tt",JSON.stringify({subjects,teachers,classes,breaks,availability,timetable}));
}

function load(){
  const data = JSON.parse(localStorage.getItem("tt"));
  if(!data) return;

  subjects=data.subjects||[];
  teachers=data.teachers||[];
  classes=data.classes||[];
  breaks=data.breaks||[];
  availability=data.availability||{};
  timetable=data.timetable||{};

  renderSubjects();
  renderTeachers();
  renderClasses();
  renderTimetable();
}

load();
