
const btns = document.querySelectorAll('button');

const form = document.querySelector('form');

const formAct = document.querySelector('form span');

const input = document.querySelector('input');

const error = document.querySelector('.error');

var activity = 'Sleep';

btns.forEach(btn => {
  btn.addEventListener('click', e => {
    // get selected activity
    activity = e.target.dataset.activity;

    // remove and add active class
    btns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    // set id of input field
    input.setAttribute('id', activity);

    // set text of form span (the activity)
    formAct.textContent = activity;

    // call the update function
    update(data);
  });
});

// form submit
form.addEventListener('submit', e => {
  // prevent default action
  e.preventDefault()

  const time = parseInt(input.value);

  if(time){

    db.collection('tasks').add({

      time , 

      activity,

      date: new Date().toString()

    }).then(() => {

      error.textContent = '';

      input.value = '';

    }).catch(err => console.log(err));

  } else {

    error.textContent = 'Please enter a valid value for time in hour';

  }

});