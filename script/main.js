/*
====================== define Variable ======================
*/
const VAR = {
    name: document.querySelector('#form #site-name'),
    url: document.querySelector('#form #site-url'),
    submit: document.querySelector('#form .submit'),
    editBtnDiv: document.querySelector('#form .edit-btn'),
    save: document.querySelector('#form .edit-btn .save'),
    cancel: document.querySelector('#form .edit-btn .cancel'),
    ul: document.querySelector('ul#bookmarks')
}

/*
====================== messages ======================
*/
const msg = {
    addBookmark: 'The bookmark has been added',
    editBookmark: 'This item has been updated',
    deleteBookmark: 'This item has been deleted',
    updateError: 'Bookmark information could not be updated.<br>The information may be duplicated or no edits have been made.',
    fillAllFields: 'Please fill in required fields',
    invalidURL: 'Please enter a valid URL',
    duplicateName: 'The Website name is a duplicate.<br>please enter another name',
    duplicateURL: 'The Website URL is a duplicate.<br>please enter another URL',
    confirmTitle: 'Are you sure?',
    confirmText: 'You won\'t be able to revert this!',
    confirmDeleteBtnText: 'Yes, delete it!',
    confirmSaveBtnText: 'Yes, save it'
}


/*
====================== class Bookmark ======================
*/
class Bookmark {
    constructor(name, url) {
        this.name = name;
        this.url = url;
    }
}

/*
====================== UI ======================
*/
class UI {
    static displayBookmark() {
        const bookmarks = Store.getBookmark();

        // check localStorage has item
        if (bookmarks != false) {
            bookmarks.forEach(function (bookmark) {
                UI.addBookmarksToDOM(bookmark);
            });
        }
    }//getBookmark

    static addBookmarksToDOM(data) {
        const item = document.createElement('li');

        item.className = 'd-flex flex-row align-items-center';
        item.innerHTML = `
                <p class="title">${data.name}</p>
                <p class="buttons flex-shrink-0 ml-auto">
                    <a href="${data.url}" target="_blank" title="Open Website">
                        <img src="./images/link.svg" alt="${data.name}">
                    </a>
                    <span title="Edit Item">
                        <img src="./images/edit.svg" alt="edit item">
                    </span>
                    <span title="Delete Item">
                        <img src="./images/remove.svg" alt="delete item">
                    </span>
                </p>
        `;

        VAR.ul.appendChild(item);
    } //addBookmarksToDOM

    static editBookmarkFromDOM(name, url) {
        let oldName = document.querySelector('ul#bookmarks li.editing .title'),
            oldUrl = document.querySelector('ul#bookmarks li.editing .buttons a');

        Store.editBookmarkFromStorage(oldName.textContent, oldUrl.href, name, url);
        oldName.textContent = name;
        oldUrl.href = url;
        UI.showAlert(msg.editBookmark, 'success');
    } //editBookmarkFromDOM

    static removeBookmarkFromDOM(el) {
        const li = el.parentElement.parentElement.parentElement;
        const name = el.parentElement.parentElement.previousElementSibling.textContent;
        const url = el.parentElement.previousElementSibling.href;
        Store.removeBookmarkFromStorage(name, url);
        li.remove();
        UI.showAlert(msg.deleteBookmark, 'success');
    } //removeBookmarkFromDOM

    static showAlert(message, className) {
        Toastify({
            text: message,
            duration: 5000,
            newWindow: true,
            close: true,
            gravity: "bottom",
            position: 'right',
            className: `text-white bg-${className}`,
            stopOnFocus: true, // Prevents dismissing of toast on hover
        }).showToast();
    } //showAlert

    // after submiting, all fields will be cleared
    static clearFields() {
        document.querySelector('#form #site-name').value = '';
        document.querySelector('#form #site-url').value = '';
    } //clearFields
}

/*
====================== Store ======================
*/
class Store {
    static getBookmark() {
        let bookmarks;
        if (localStorage.getItem('bookmarks') == null || localStorage.getItem('bookmarks') == '') {
            bookmarks = [];
        } else {
            bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
        }

        return bookmarks;
    } //getBookmark

    static addBookmarkToStorage(data) {
        const datas = Store.getBookmark();
        datas.push(data);
        localStorage.setItem('bookmarks', JSON.stringify(datas));
    } //addBookmarkToStorage

    static removeBookmarkFromStorage(name, url) {
        const datas = Store.getBookmark();
        datas.forEach(function (data, index) {
            if (data.name == name && (data.url == url || data.url + '/')) {
                datas.splice(index, 1);
            }
        });
        localStorage.setItem('bookmarks', JSON.stringify(datas));
    } //removeBookmarkFromStorage

    static editBookmarkFromStorage(oldName, OldUrl, name, url) {
        const datas = Store.getBookmark();
        datas.forEach(function (data) {
            if (data.name == oldName && (data.url == OldUrl || data.url + '/')) {
                data.name = name;
                data.url = url;
            }
        });
        localStorage.setItem('bookmarks', JSON.stringify(datas));
    } //editBookmarkFromStorage
}

/*
====================== function ======================
*/
const cancel = function () {
    const items = document.querySelectorAll('ul#bookmarks li');

    items.forEach(function (item) {
        item.classList.remove('not-editing');
        item.classList.remove('editing');
    });

    VAR.submit.style.display = 'block';
    VAR.editBtnDiv.style.display = 'none';
    VAR.name.value = '';
    VAR.url.value = '';

    return false;
}

/*
====================== Event ======================
*/
VAR.submit.addEventListener('click', function (e) {
    const name = VAR.name.value.trim(),
        url = VAR.url.value.trim(),
        bookmarks = Store.getBookmark(),
        urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    let error = false;

    if (name == '' || url == '') {
        UI.showAlert(msg.fillAllFields, 'danger')
    } else if (!urlRegex.test(siteURL)) {
        UI.showAlert(msg.invalidURL, 'danger')
    } else {
        //check that the fields are not a duplicated
        if (bookmarks != false) {
            bookmarks.forEach(function (bookmark) {
                if (bookmark.name == name) {
                    UI.showAlert(msg.duplicateName, 'warning');
                    error = true;
                }
                if (bookmark.url == url) {
                    UI.showAlert(msg.duplicateURL, 'warning');
                    error = true;
                }
            });
        }

        // save new bookmark
        if (error == false) {
            const fieldsData = new Bookmark(name, url);
            UI.showAlert(msg.addBookmark, 'success');
            UI.addBookmarksToDOM(fieldsData);
            Store.addBookmarkToStorage(fieldsData);
            UI.clearFields();
        }
    }
});

document.addEventListener('DOMContentLoaded', UI.displayBookmark);

VAR.ul.addEventListener('click', function (e) {
    // delete item
    if (e.target.tagName == 'IMG' && e.target.alt == 'delete item') {
        Swal.fire({
            title: msg.confirmTitle,
            text: msg.confirmText,
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: msg.confirmDeleteBtnText
        }).then((result) => {
            if (result.value) {
                UI.removeBookmarkFromDOM(e.target);
            }
        });
    }

    // edit item
    if (e.target.tagName == 'IMG' && e.target.alt == 'edit item') {
        const li = e.target.parentElement.parentElement.parentElement,
            oldName = e.target.parentElement.parentElement.previousElementSibling.textContent,
            oldUrl = e.target.parentElement.previousElementSibling.href,
            items = document.querySelectorAll('ul#bookmarks li');

        items.forEach(function (item) {
            item.classList.add('not-editing');
            item.classList.remove('editing');
        });

        VAR.submit.style.display = 'none';
        VAR.editBtnDiv.style.display = 'block';
        VAR.name.value = oldName;
        VAR.url.value = oldUrl;
        li.classList.remove('not-editing');
        li.classList.add('editing');
    }
});

// cancel edit item
VAR.cancel.addEventListener('click', function () {
    cancel();
});

// save edit item
VAR.save.addEventListener('click', function () {
    const name = VAR.name.value.trim(),
        url = VAR.url.value.trim(),
        bookmarks = Store.getBookmark(),
        urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    let error = false;

    if (name == '' || url == '') {
        UI.showAlert(msg.fillAllFields, 'danger')
    } else if (!urlRegex.test(url)) {
        UI.showAlert(msg.invalidURL, 'danger')
    } else {
        //check that the fields are not a duplicated
        if (bookmarks != false) {
            bookmarks.forEach(function (bookmark) {
                if (bookmark.name == name || bookmark.url == url) {
                    UI.showAlert(msg.updateError, 'warning');
                    error = true;
                }
            });
        }

        // save update bookmark
        if (error == false) {
            Swal.fire({
                title: msg.confirmTitle,
                text: msg.confirmText,
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: msg.confirmSaveBtnText
            }).then((result) => {
                if (result.value) {
                    UI.editBookmarkFromDOM(name, url);
                    cancel();
                }
            });
        }

    }
});

VAR.url.addEventListener('focus', function () {
    if (this.value == '') {
        this.value = 'https://';
    }
});

VAR.url.addEventListener('blur', function () {
    if (this.value == 'https://') {
        this.value = '';
    }
})
