/* globals api */
{
  const body = document.body;

  const process = files => {
    files.filter(f => f.name.toLowerCase().endsWith('.csv') === false)
      .forEach(file => api.emit('db.file', file));
    files.filter(f => f.name.toLowerCase().endsWith('.csv') === true)
      .forEach(file => api.emit('csv.file', file));
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
