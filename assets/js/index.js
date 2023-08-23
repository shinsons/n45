var app = document.querySelector('div.app');
var titleEl = document.querySelector('title');
var beginEl = document.querySelector('div.begin');
var summaryEl = document.querySelector('div.summary');
var timerEl = document.querySelector('div.timer-container');
var descriptionEl = document.querySelector('div.description');
var listEl = document.querySelector('ul');
var timeEl = document.querySelector('h1');
var nextEl = document.querySelector('div.next');
var doneEl = document.querySelector('h3.done');
var whistle = new Howl({
  src: ['assets/sound/start.wav']
});
var rest = new Howl({
  src: ['assets/sound/finish.wav']
});

class WOD { 

  constructor(db_entry) {
    this.wod = db_entry;
    this.currentStation = undefined;
    this.lastTick = undefined;
    if(this.wod !== undefined) {
      this.list();
      titleEl.innerHTML = 'Appy Gym - ' + new Date(); 
    }
  }

  list() {
    const listContent = [];
    this.wod.workout.forEach((name) => { 
      listContent.push('<li>' + name + '</li>') 
    }); 
    listEl.innerHTML = listContent.join('\n');
    descriptionEl.innerHTML = this.wod.description;
    addRemoveClass([beginEl], 'hide');
    addRemoveClass([summaryEl], 'hide', 'remove');
    addRemoveClass([summaryEl], 'show');
  }

  start() {
    this.currentStation = this.wod.stations.shift();
    whistle.play();
    addRemoveClass([app], 'blue', 'remove');
    addRemoveClass([app], 'green');
    addRemoveClass([summaryEl], 'show', 'remove');
    addRemoveClass([summaryEl], 'hide');
    nextEl.innerHTML = this.currentStation.name;
    addRemoveClass([timerEl, nextEl], 'hide', 'remove');
    addRemoveClass([timerEl, nextEl], 'show');
    requestAnimationFrame(this.update.bind(this));
  }

  update(timestamp) {
    if(!this.lastTick || timestamp - this.lastTick >= 1000) {
      if(this.currentStation.work <= 0 && this.currentStation.rest <= 0) {
        if(this.wod.stations.length === 0) {
          this.done();
          return;
        }
        addRemoveClass([app], 'blue', 'remove');
        addRemoveClass([app], 'red', 'remove');
        addRemoveClass([app], 'green');
        whistle.play();
        this.currentStation = this.wod.stations.shift();
        nextEl.innerHTML = this.currentStation.name;
        timeEl.innerHTML = this.currentStation.work;
        this.currentStation.work = this.currentStation.work -1;
      }
      else if(this.currentStation.work > 0) {
        timeEl.innerHTML = this.currentStation.work;
        this.currentStation.work = this.currentStation.work -1;
      }
      else if(this.currentStation.rest > 0) {
        if(this.wod.stations.length > 0) {
          nextEl.innerHTML = 'Next Up: ' + this.wod.stations[0].name;
        }
        addRemoveClass([app], 'green', 'remove');
        if(this.currentStation.name.toLowerCase() === 'rest') {
          addRemoveClass([app], 'blue');
        }
        else {
          addRemoveClass([app], 'red');
        }
        if(this.currentStation.rest === 2) {
          rest.play();
        }
        timeEl.innerHTML = this.currentStation.rest;
        this.currentStation.rest = this.currentStation.rest -1;
      }
      this.lastTick = timestamp;
    }
    requestAnimationFrame(this.update.bind(this));
  }

 	hydrate() {

	}
 
  done() {
    addRemoveClass([app], 'red', 'remove');
    addRemoveClass([app], 'green');
    addRemoveClass([timerEl, nextEl], 'show', 'remove');
    addRemoveClass([timerEl, nextEl], 'hide');
    addRemoveClass([doneEl], 'hide', 'remove');
    addRemoveClass([doneEl], 'show');
  }
};

function addRemoveClass(els, modification, remove) {
  for (var i = 0; i < els.length; i++) {
    if(remove) {
      els[i].classList.remove(modification);
      continue
    }
    els[i].classList.add(modification);
  }
};

function daysIntoYear(date){
    return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
};

function getWOD() {
  const today = new Date();
  let wod_key = daysIntoYear(today) % 28;
  if(wod_key === 0) {
    wod_key = 28;
  }
  return db[wod_key]
};

var thisWod = new WOD(getWOD());
