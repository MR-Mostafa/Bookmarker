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
                <p class="buttons ml-auto">
                    <a href="${data.url}" target="_blank" title="Open Website">
                        <img src="./images/link.svg" alt="${data.name}">
                    </a>
                    <span title="Delete Item">
                        <img src="./images/remove.svg" alt="delete item">
                    </span>
                </p>
        `;

        ul.appendChild(item);
    } //addBookmarksToDOM

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
            if (data.name == name && data.url == url) {
                datas.splice(index, 1);
            }
        });

        localStorage.setItem('bookmarks', JSON.stringify(datas));
    } //removeBookmarkFromStorage
}

/*
====================== Event ======================
*/
document.querySelector('#form .btn').addEventListener('click', function (e) {
    e.preventDefault();
    const siteName = document.querySelector('#form #site-name').value;
    const siteURL = document.querySelector('#form #site-url').value;
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

        // save bookmark
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
});
