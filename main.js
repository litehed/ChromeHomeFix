const CONSTANTS = {
    CLICK_DURATION: 300,
    DEFAULT_PROTOCOL: 'https://',
    FAVICON_URL: 'https://www.google.com/s2/favicons',
    STORAGE_KEY: 'userWidgets',
    ICON_SIZE: '64'
};


class WidgetManager {
    constructor() {
        this.widgets = document.getElementById('widgets');
        this.addButton = document.getElementById('addWidget');
        this.dialog = document.getElementById('dialog');
        this.widgetForm = document.getElementById('widgetForm');
        this.protocolSelector = document.getElementById('protocols');
        this.cancelButton = document.getElementById('cancelButton');
        this.actionMenu = document.getElementById('actionMenu');
        this.editWidgetButton = document.getElementById('editWidget');
        this.removeWidgetButton = document.getElementById('removeWidget');

        this.selectedTile = null;
        this.editMode = false;
        this.currentWidgetId = null;
        this.draggedTile = null;

        this.dragPlaceholder = document.createElement('div');
        this.dragPlaceholder.style.width = '112px';
        this.dragPlaceholder.classList.add('tile-placeholder');

        this.initEventListeners();
        this.loadWidgets();
    }

    initEventListeners() {
        // Widget Form Stuff
        this.addButton.addEventListener('click', () => {
            this.openDialog();
        });

        this.widgetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        this.cancelButton.addEventListener('click', () => {
            this.closeDialog();
        });

        window.addEventListener('click', (e) => {
            if (e.target === this.dialog) {
                this.closeDialog();
            }
        });

        // Action Menu Stuff
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.tile') && !e.target.closest('.action-menu')) {
                this.closeActionMenu();
            }
        });

        document.addEventListener('contextmenu', (e) => {
            const tile = e.target.closest('.tile');
            if (tile) {
                e.preventDefault();
                this.showActionMenuForTile(tile, e.clientX, e.clientY);
            }
        });

        this.editWidgetButton.addEventListener('click', () => {
            this.editCurrentWidget();
        });

        this.removeWidgetButton.addEventListener('click', () => {
            this.removeCurrentWidget();
        });

        // Draggable Stuff
        this.widgets.addEventListener('dragstart', (e) => {
            const tile = e.target.closest('.tile');
            if (tile) {
                this.draggedTile = tile;
                this.dragPlaceholder = tile.cloneNode(true);
                this.dragPlaceholder.style.opacity = '0.4';
                this.dragPlaceholder.style.pointerEvents = 'none';

                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', tile.getAttribute('data-id'));
                e.dataTransfer.setDragImage(tile, tile.offsetWidth / 2, tile.offsetHeight / 2);

                setTimeout(() => {
                    tile.style.display = 'none';
                }, 0);
            }
        });

        this.widgets.addEventListener('dragend', (e) => {
            if (this.draggedTile) {
                this.draggedTile.style.display = '';
            }
            this.dragPlaceholder.remove();
            this.draggedTile = null;
            this.saveWidgets();
        });

        this.widgets.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        this.widgets.addEventListener('dragenter', (e) => {
            e.preventDefault();
            const tile = e.target.closest('.tile');
            if (tile && tile !== this.draggedTile) {
                const dropBefore = e.clientX < tile.getBoundingClientRect().left + tile.offsetWidth / 2;
                this.widgets.insertBefore(this.dragPlaceholder, dropBefore ? tile : tile.nextSibling);
            }
        });

        this.widgets.addEventListener('drop', (e) => {
            e.preventDefault();

            if (this.draggedTile && this.dragPlaceholder.parentElement) {
                this.widgets.insertBefore(this.draggedTile, this.dragPlaceholder);
                this.dragPlaceholder.remove();

                this.saveWidgets();
            }
        });
    }

    openDialog(widget = null) {
        if (widget) {
            this.editMode = true;
            this.currentWidgetId = widget.id;
            document.getElementById('name').value = widget.name;
            document.getElementById('url').value = widget.url;
        } else {
            this.editMode = false;
            this.currentWidgetId = null;
            this.widgetForm.reset();
        }

        this.dialog.style.display = 'flex';
    }

    closeDialog() {
        this.dialog.style.display = 'none';
        this.widgetForm.reset();
        this.editMode = false;
        this.currentWidgetId = null;
    }

    handleFormSubmit() {
        const name = document.getElementById('name').value.trim();
        let url = document.getElementById('url').value.trim();
        const selectedProtocol = this.protocolSelector.value;

        // Add protocol if missing
        if (!url.match(/^(https?:\/\/|ftp:\/\/|mailto:)/i) && selectedProtocol != 'none') {
            url = selectedProtocol + url;
        }

        if (this.editMode && this.currentWidgetId) {
            const widget = { id: this.currentWidgetId, name, url };
            this.updateWidget(widget);
        } else {
            this.addWidget({ id: this.generateUniqueId(), name, url });
        }

        this.closeDialog();
        this.saveWidgets();
    }

    generateUniqueId() {
        return `widget-${crypto.randomUUID()}`;
    }

    createTileElement(widget) {
        console.log('Creating tile element for widget:', widget);
        const tile = document.createElement('a');
        tile.classList.add('tile');
        tile.href = widget.url;
        tile.setAttribute('data-url', widget.url);
        tile.setAttribute('data-name', widget.name);
        tile.setAttribute('data-id', widget.id);

        tile.draggable = true;

        // Click anim
        tile.addEventListener('click', (e) => {
            e.preventDefault();
            tile.classList.add('clicked');
            setTimeout(() => {
                window.location.href = widget.url;
            }, 300);
        });

        const favicon = document.createElement('img');
        favicon.src = `${CONSTANTS.FAVICON_URL}?sz=${CONSTANTS.ICON_SIZE}&domain_url=${encodeURIComponent(widget.url)}`;
        favicon.alt = `${widget.name} icon`;
        favicon.classList.add('tile-icon');

        const name = document.createElement('span');
        name.textContent = widget.name;
        name.classList.add('tile-name');

        tile.appendChild(favicon);
        tile.appendChild(name);

        return tile;
    }

    addWidget(widget) {
        const newTile = this.createTileElement(widget);
        this.widgets.insertBefore(newTile, this.addButton);
    }

    updateWidget(widget) {
        const tile = this.widgets.querySelector(`.tile[data-id="${widget.id}"]`);

        if (tile) {
            tile.setAttribute('data-name', widget.name);
            tile.setAttribute('data-url', widget.url);
            tile.href = widget.url;

            tile.querySelector('.tile-name').textContent = widget.name;
            tile.querySelector('.tile-icon').src =
                `${CONSTANTS.FAVICON_URL}?sz=${CONSTANTS.ICON_SIZE}&domain_url=${encodeURIComponent(widget.url)}`;

            console.log('Widget updated successfully');
        } else {
            console.error('Tile not found for widget ID:', widget.id);
        }
    }

    showActionMenuForTile(tile, x, y) {
        this.selectedTile = tile;

        this.actionMenu.style.left = `${x}px`;
        this.actionMenu.style.top = `${y}px`;
        this.actionMenu.style.display = 'block';
    }

    closeActionMenu() {
        this.actionMenu.style.display = 'none';
        this.selectedTile = null;
    }

    removeCurrentWidget() {
        if (!this.selectedTile) return;

        // Fade for coolness
        this.selectedTile.style.opacity = '0';
        this.selectedTile.style.transform = 'scale(0.9)';

        setTimeout(() => {
            this.selectedTile.remove();
            this.saveWidgets();
            this.closeActionMenu();
        }, 300);
    }

    editCurrentWidget() {
        if (!this.selectedTile) return;

        const widget = {
            id: this.selectedTile.getAttribute('data-id'),
            name: this.selectedTile.getAttribute('data-name'),
            url: this.selectedTile.getAttribute('data-url')
        };

        this.openDialog(widget);
        this.closeActionMenu();
    }

    saveWidgets() {
        const widgets = [];
        const tiles = this.widgets.querySelectorAll('.tile');

        tiles.forEach(tile => {
            widgets.push({
                id: tile.getAttribute('data-id'),
                name: tile.getAttribute('data-name'),
                url: tile.getAttribute('data-url')
            });
        });

        localStorage.setItem(CONSTANTS.STORAGE_KEY, JSON.stringify(widgets));
    }

    loadWidgets() {
        const savedWidgets = localStorage.getItem(CONSTANTS.STORAGE_KEY);

        if (savedWidgets) {
            try {
                const widgets = JSON.parse(savedWidgets);
                widgets.forEach(widget => {
                    if (!widget.id) {
                        widget.id = this.generateUniqueId();
                    }
                    this.addWidget(widget);
                });
            } catch (e) {
                console.error('Error loading widgets:', e);
            }
        } else {
            const defaultWidgets = [
                { id: this.generateUniqueId(), name: 'Mail', url: 'https://mail.google.com/' },
                { id: this.generateUniqueId(), name: 'YouTube', url: 'https://www.youtube.com' }
            ];

            defaultWidgets.forEach(widget => {
                this.addWidget(widget);
            });

            this.saveWidgets();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WidgetManager();
});