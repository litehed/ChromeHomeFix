document.querySelectorAll('.widget-icon').forEach(function(elem) {
  elem.addEventListener('click', function() {
      this.classList.add('clicked');
      setTimeout(() => this.classList.remove('clicked'), 300);
  });
});

document.getElementById('addWidget').addEventListener('click', function() {
  const url = prompt("Enter the URL for the new widget:");
  if(url) {
      addNewWidget(url);
  }
});


function addNewWidget(url) {
  const faviconUrl = url + '/favicon.ico'; // Simple assumption
  const widgetContainer = document.querySelector('.widget-container');
  const newWidget = document.createElement('a');
  newWidget.href = url;
  newWidget.innerHTML = `<img src="${faviconUrl}" alt="${faviconUrl}" class="widget-icon">`;
  widgetContainer.insertBefore(newWidget, document.getElementById('addWidget'));
}
