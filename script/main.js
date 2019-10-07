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
                    <span title="Remove Item">
                        <img src="./images/remove.svg" alt="remove item">
                    </span>
                </p>
        `;

        ul.appendChild(item);
    } //addBookmarksToDOM

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
