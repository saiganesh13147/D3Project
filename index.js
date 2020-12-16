const modal = document.querySelector('.modal');

M.Modal.init(modal);

const form = document.querySelector('form');
const name = document.querySelector('#name');
const parent = document.querySelector('#parent');
const group = document.querySelector('#group');

form.addEventListener('submit', e => {
  e.preventDefault();

  db.collection('technology').add({
    name: name.value, 
    parent: parent.value, 
    group: group.value
  });

  var instance = M.Modal.getInstance(modal);
  instance.close();

  form.reset();

});