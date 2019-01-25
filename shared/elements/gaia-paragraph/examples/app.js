(function(win) {
  var keyEles = document.querySelectorAll('.key');
  var curEle = keyEles[0];
  var index = 0;
  curEle.classList.add('key');
  curEle.focus();

  function onKeyDown(e) {
    switch (e.key) {
      case 'ArrowUp':
        {
          curEle.classList.remove('key');
          index--;
          if (index < 0) {
            index = 0;
          }
          curEle = keyEles[index];
          curEle.focus();
          curEle.classList.add('key');
          break;
        }
      case 'ArrowDown':
        {
          curEle.classList.remove('key');
          index++;
          if (index > keyEles.length - 1) {
            index = keyEles.length - 1;
          }
          curEle = keyEles[index];
          curEle.focus();
          curEle.classList.add('key');
          break;
        }
      case 'Enter':
      case 'Accept':
        {
          keyEles[index].click();
          break;
        }
      default:
        break;
    }
  }

  document.addEventListener('keydown', onKeyDown);

}(window));
