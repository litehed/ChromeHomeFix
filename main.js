const clickDur = 300;

document.querySelector('.widget-container').addEventListener('click', function (event) {
    let target = event.target;
    if (target.tagName === 'IMG' && target.parentElement.tagName === 'A') {
        target = target.parentElement;
    }

    if (target.classList.contains('widget') || target.closest('.widget')) {
        const widget = target.classList.contains('widget') ? target : target.closest('.widget');
        if (!widget.contains(event.target.closest('.delete-icon'))) {
            event.preventDefault();
            widget.classList.add('clicked');
            setTimeout(() => {
                window.location.href = widget.querySelector('a').href;
            }, clickDur);
        }
    }
});

document.getElementById('dropdownButton').addEventListener('click', function() {
    this.classList.add('clicked');
    const dropdownMenu = document.getElementById('dropdownMenu');
    dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';

    setTimeout(() => {
        this.classList.remove('clicked');
    }, clickDur); 
});

document.getElementById('addNewWidget').addEventListener('click', function() {
    this.classList.add('clicked');
    setTimeout(() => {
        const url = prompt("Enter the URL for the new widget:");
        if (url) {
            addNewWidget(url);
        }
        this.classList.remove('clicked');
    }, clickDur);
});

function saveWidgets() {
    const widgets = [];
    document.querySelectorAll('.widget-container .widget').forEach(widget => {
        const url = widget.querySelector('a').href;
        widgets.push({ url });
    });
    localStorage.setItem('userWidgets', JSON.stringify(widgets));
}

function loadWidgets() {
    const widgetsData = localStorage.getItem('userWidgets');
    if (widgetsData) {
        const widgets = JSON.parse(widgetsData);
        const existingUrls = new Set(Array.from(document.querySelectorAll('.widget-container .widget a')).map(a => a.href));
        widgets.forEach(widget => {
            if (!existingUrls.has(widget.url)) {
                addNewWidget(widget.url);
            }
        });
    }
}

function addNewWidget(url) {
    if (!url.match(/^http[s]?:\/\//)) {
        url = 'https://' + url;
    }
    const faviconUrl = url + '/favicon.ico';
    const widgetContainer = document.querySelector('.widget-container');

    const widgetWrapper = document.createElement('div');
    widgetWrapper.classList.add('widget');

    const newWidgetLink = document.createElement('a');
    newWidgetLink.href = url;
    newWidgetLink.className = 'widget-link';
    newWidgetLink.innerHTML = `<img src="https://www.google.com/s2/favicons?sz=64&domain_url=${faviconUrl}" alt="Widget" class="widget-icon">`;

    const newDeleteIcon = document.createElement('div');
    newDeleteIcon.classList.add('delete-icon');
    newDeleteIcon.textContent = 'X';
    newDeleteIcon.style.display = 'none';
    newDeleteIcon.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        widgetWrapper.parentNode.removeChild(widgetWrapper);
        saveWidgets();
    });


    widgetWrapper.appendChild(newWidgetLink);
    widgetWrapper.appendChild(newDeleteIcon);

    const addWidgetButton = document.getElementById('addWidget');
    widgetContainer.insertBefore(widgetWrapper, addWidgetButton);
    saveWidgets();
}

function addDeleteIcons() {
    var widgetContainer = document.querySelector('.widget-container');
    var widgets = document.querySelectorAll('.widget-container .widget');

    widgets.forEach(function (widgetWrapper) {
        var deleteIcon = widgetWrapper.querySelector('.delete-icon');

        if (widgetContainer.classList.contains('delete-mode')) {
            if (!deleteIcon) {
                deleteIcon = document.createElement('div');
                deleteIcon.classList.add('delete-icon');
                deleteIcon.textContent = 'X';
                widgetWrapper.appendChild(deleteIcon);
            }
            deleteIcon.style.display = 'block'; // Show the delete icon

            // Add click event listener for delete icon
            deleteIcon.onclick = function (e) {
                e.stopPropagation();
                e.preventDefault();
                if (widgetWrapper && widgetWrapper.parentNode) {
                    widgetWrapper.parentNode.removeChild(widgetWrapper);
                    saveWidgets();
                }
            };

        } else {
            if (deleteIcon) {
                deleteIcon.style.display = 'none';
            }
        }
    });
}

document.getElementById('toggleDeleteMode').addEventListener('click', function() {
    var widgetContainer = document.querySelector('.widget-container');
    widgetContainer.classList.toggle('delete-mode');
    addDeleteIcons();
    document.getElementById('dropdownMenu').style.display = 'none';
});

document.addEventListener('DOMContentLoaded', function () {
    loadWidgets();
    addDeleteIcons();
});
