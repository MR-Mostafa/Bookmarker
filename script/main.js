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
            const ul = document.createElement('ul');
            ul.id = 'bookmarks';

            bookmarks.forEach(function (bookmark) {
                UI.addBookmarksToDOM(ul, bookmark);
            });

            document.querySelector('.col-xl-6').appendChild(ul);
        }
    }//getBookmark

    static addBookmarksToDOM(el, data) {
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
        el.appendChild(item);
    }

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
    }
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

    if (siteName == '' || siteURL == '') {
        UI.showAlert('Please fill in required fields', 'danger')
    } else if (!urlRegex.test(siteURL)) {
        UI.showAlert('Please enter a valid URL', 'danger')
    } else {
        //check that the filds are not a duplicated
        if (bookmarks != false) {
            bookmarks.forEach(function (bookmark) {
                if (bookmark.name == siteName) {
                    UI.showAlert('The Website name is a duplicate.<br>please enter another name', 'warning');
                }
                if (bookmark.url == siteURL) {
                    UI.showAlert('The Website URL is a duplicate.<br>please enter another URL', 'warning');
                }
            });
        } else {
            // save bookmark
            const info = new Bookmark(siteName, siteURL);
            UI.displayBookmark();
            Store.addBookmarkToStorage(info);
        }
    }

});


document.addEventListener('DOMContentLoaded', function () {
    UI.displayBookmark();
});
