/* globals api */
{
  const body = document.body;

  body.addEventListener('dragenter', e => e.target.classList.add('over'), false);
  body.addEventListener('dragleave', e => e.target.classList.remove('over'), false);
  body.addEventListener('dragend', () => body.classList.remove('over'), false);
  body.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
  }, false);
  body.addEventListener('drop', e => {
    e.preventDefault();
    e.stopPropagation();

    [...e.dataTransfer.files].forEach(file => api.emit('db.file', file));
  }, false);

/*  document.querySelector('[type=file]').addEventListener('change', e => {
    [...e.target.files].forEach(file => api.emit('db.file', file));
    e.target.value = '';
  });*/
}
