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
        const ul = document.querySelector('ul#bookmarks');
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

        ul.appendChild(item);
    } //addBookmarksToDOM

    static editBookmark(el) {

    } //editBookmark

    static removeBookmarkFromDOM(el) {
        const li = el.parentElement.parentElement.parentElement;
        const name = el.parentElement.parentElement.previousElementSibling.textContent;
        const url = el.parentElement.previousElementSibling.href;
        Store.removeBookmarkFromStorage(name, url);
        li.remove();
        UI.showAlert('This item has been deleted', 'success');
    } //removeBookmarkFromDOM

    static showAlert(message, className) {
        Toastify({
            text: message,
            duration: 4000,
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
    } //addBookmark

    static removeBookmarkFromStorage(name, url) {
        const datas = Store.getBookmark();
        datas.forEach(function (data, index) {
            if (data.name == name && (data.url == url || data.url + '/')) {
                datas.splice(index, 1);

            }
        });
        localStorage.setItem('bookmarks', JSON.stringify(datas));
    } //removeBookmarkFromStorage
}

/*
====================== Event ======================
*/
document.querySelector('#form .submit').addEventListener('click', function (e) {
    e.preventDefault();
    const siteName = document.querySelector('#form #site-name').value.trim();
    const siteURL = document.querySelector('#form #site-url').value.trim();
    const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    const bookmarks = Store.getBookmark();
    let error = false;

    if (siteName == '' || siteURL == '') {
        UI.showAlert('Please fill in required fields', 'danger')
    } else if (!urlRegex.test(siteURL)) {
        UI.showAlert('Please enter a valid URL', 'danger')
    } else {
        //check that the fields are not a duplicated
        if (bookmarks != false) {
            bookmarks.forEach(function (bookmark) {
                if (bookmark.name == siteName) {
                    UI.showAlert('The Website name is a duplicate.<br>please enter another name', 'warning');
                    error = true;
                }
                if (bookmark.url == siteURL) {
                    UI.showAlert('The Website URL is a duplicate.<br>please enter another URL', 'warning');
                    error = true;
                }
            });
        }

        // save new bookmark
        if (error == false) {
            const fieldsData = new Bookmark(siteName, siteURL);
            UI.showAlert('The bookmark has been added', 'success');
            UI.addBookmarksToDOM(fieldsData);
            Store.addBookmarkToStorage(fieldsData);
            UI.clearFields();
        }
    }
});

document.addEventListener('DOMContentLoaded', UI.displayBookmark);

document.querySelector('ul#bookmarks').addEventListener('click', function (e) {
    // delete item
    if (e.target.tagName == 'IMG' && e.target.alt == 'delete item') {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.value) {
                UI.removeBookmarkFromDOM(e.target);
            }
        })
    }

    // edit item
    if (e.target.tagName == 'IMG' && e.target.alt == 'edit item') {

        const li = e.target.parentElement.parentElement.parentElement,
            oldName = e.target.parentElement.parentElement.previousElementSibling.textContent,
            oldUrl = e.target.parentElement.previousElementSibling.href,
            submit = document.querySelector('#form .submit'),
            editBtnDiv = document.querySelector('#form .edit-btn'),
            name = document.querySelector('#form #site-name'),
            url = document.querySelector('#form #site-url'),
            editingLi = document.querySelectorAll('ul#bookmarks li');


        editingLi.forEach(function (item) {
            item.classList.add('not-editing');
            item.classList.remove('editing');
        });


        submit.style.display = 'none';
        editBtnDiv.style.display = 'block';
        name.value = oldName;
        url.value = oldUrl;
        li.classList.remove('not-editing');
        li.classList.add('editing');
    }
});

document.querySelector('#form .cancel').addEventListener('click', function () {

});

document.querySelector('input#site-url').addEventListener('focus', function () {
    if (this.value == '') {
        this.value = 'https://';
    }
});

document.querySelector('input#site-url').addEventListener('blur', function () {
    if (this.value == 'https://') {
        this.value = '';
    }
})
