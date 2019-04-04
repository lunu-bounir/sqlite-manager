/* globals api */
{
  const body = document.body;

  const process = files => {
    console.log(files);
    files.filter(f => f.type !== 'text/csv' && f.type !== 'application/json')
      .forEach(file => api.emit('db.file', file));
    files.filter(f => f.type === 'text/csv')
      .forEach(file => api.emit('csv.file', file));
    files.filter(f => f.type === 'application/json')
      .forEach(file => api.emit('json.file', file));
  };

  body.addEventListener('dragenter', e => e.target.classList && e.target.classList.add('over'), false);
  body.addEventListener('dragleave', e => e.target.classList && e.target.classList.remove('over'), false);
  body.addEventListener('dragend', () => body.classList.remove('over'), false);
  body.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
  }, false);
  body.addEventListener('drop', e => {
    e.preventDefault();
    e.stopPropagation();

    process([...e.dataTransfer.files]);
  }, false);

  document.querySelector('[type=file]').addEventListener('change', e => {
    process([...e.target.files]);
    e.target.value = '';
  });
}
