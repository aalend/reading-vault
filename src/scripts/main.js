'use strict';

class Book {
  id = +new Date();
  createdAt = new Date();

  constructor(title, author, genre, coverURL) {
    this.title = title;
    this.author = author;
    this.genre = genre;
    this.coverURL = coverURL;
  }
}

class Fiction extends Book {
  type = 'fiction';
  constructor(title, author, genre, coverURL) {
    super(title, author, genre, coverURL);
  }
}
class NonFiction extends Book {
  type = 'non-fiction';
  constructor(title, author, genre, coverURL) {
    super(title, author, genre, coverURL);
  }
}

// Application Architecture
const formAddContainer = document.querySelector('.form__add');
const vaultList = document.querySelector('.vault__list');

const titleInput = document.querySelector('.form__add--title');
const authorInput = document.querySelector('.form__add--author');
const coverImageInput = document.querySelector('.form__add--book-image');
const genreInput = document.querySelector('.form__add--genre');
const searchInput = document.querySelector('.form__search--input');
const buttonBookDelete = document.querySelector('.book-card__button');
const sortSelect = document.querySelector('.search-bar__sort--item');
const filterSelect = document.querySelector('.search-bar__filter--item');
class App {
  #vault = [];

  constructor() {
    this.#getLocalStorage();

    // Get data from user
    formAddContainer.addEventListener(
      'submit',
      this.#getDataFromUser.bind(this)
    );

    // Remove vault item
    vaultList.addEventListener('click', this.#deleteVaultListItem.bind(this));

    // Sort vault items
    sortSelect.addEventListener('change', this.#sortVaultList.bind(this));

    // FIlter vault items
    filterSelect.addEventListener('change', this.#filterVaultList.bind(this));

    // Searching valut items
    searchInput.addEventListener('input', this.#searchVaultList.bind(this));
  }

  #getDataFromUser(e) {
    e.preventDefault();

    const title = titleInput.value;
    const author = authorInput.value;
    const coverImage = coverImageInput.value || '../images/default-image.png';
    const genre = genreInput.value;
    let book;

    if (genre === 'fiction')
      book = new Fiction(title, author, genre, coverImage);
    if (genre === 'non-fiction')
      book = new NonFiction(title, author, genre, coverImage);

    // Clear form inputs
    titleInput.value =
      authorInput.value =
      coverImageInput.value =
      genreInput.value =
        '';

    // Add book to vault array
    this.#vault.push(book);

    // Render book in UI
    this.#renderVaultList(book);

    // Set Local Storage
    this.#setLocalStorage();
  }

  #formatReadableDate(createdAt) {
    const locale = navigator.language;
    const options = {
      dateStyle: 'medium',
    };

    return new Intl.DateTimeFormat(locale, options).format(createdAt);
  }

  #renderVaultList(book) {
    const { id, title, author, coverURL } = book;

    const markup = `
      <li class="vault__item" data-id="${id}">
        <div class="book-card">
          <div class="book-card__inner">
            <img
              class="book-card__image"
              src="${coverURL}"
              alt="${title}"
            />
            <button
              class="btn btn--delete book-card__button"
              type="button"
            >
              Delete
            </button>
            <div class="book-card__content">
              <div class="book-card__content--inner">
                <h3>${title}</h3>
                <p>${author}</p>
              </div>
            </div>
          </div>
        </div>
      </li>
    `;

    vaultList.insertAdjacentHTML('afterbegin', markup);
  }

  #deleteVaultListItem(e) {
    const clickOrigin = e.target.closest('.book-card__button');
    const vaultItemID = +e.target.closest('.vault__item').dataset.id;

    if (!clickOrigin) return;
    if (!vaultItemID) return;

    const bookItem = this.#vault.findIndex(item => item.id === vaultItemID);
    this.#vault.splice(bookItem, 1);

    // Update vault list UI
    this.#updateVaultListItem(vaultItemID);
  }

  #updateVaultListItem(vaultItemID) {
    vaultList.querySelector(`.vault__item[data-id="${vaultItemID}"]`).remove();
    this.#updateLocalStorage();
  }

  #searchVaultList(e) {
    let delaySearch;
    let result = [];

    clearTimeout(delaySearch);
    delaySearch = setTimeout(() => {
      this.#vault.filter(item => {
        if (item.title.toLowerCase().includes(e.target.value.toLowerCase())) {
          result.push(item);
        }
      });
      vaultList.innerHTML = '';
      result.forEach(item => this.#renderVaultList(item));
    }, 1000);
  }

  #filterVaultList(e) {
    let filtred = [];

    this.#vault.filter(item => {
      if (e.target.value === 'fiction' && e.target.value === item.type) {
        filtred.push(item);
      }
      if (e.target.value === 'non-fiction' && e.target.value === item.type) {
        filtred.push(item);
      }
    });

    vaultList.innerHTML = '';
    filtred.forEach(item => this.#renderVaultList(item));
  }

  #sortVaultList(e) {
    let sorted;
    if (e.target.value === 'newest') {
      sorted = this.#vault.sort((a, b) => {
        if (a.createdAt > b.createdAt) return 1;
        if (a.createdAt < b.createdAt) return -1;
      });
    }
    if (e.target.value === 'earliest') {
      sorted = this.#vault.sort((a, b) => {
        if (a.createdAt < b.createdAt) return 1;
        if (a.createdAt > b.createdAt) return -1;
      });
    }

    this.#vault = sorted;

    vaultList.innerHTML = '';
    this.#vault.forEach(book => this.#renderVaultList(book));
  }

  #setLocalStorage() {
    localStorage.setItem('vault', JSON.stringify(this.#vault));
  }

  #getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('vault'));

    if (!data) return;

    this.#vault = data;
    this.#vault.forEach(item => this.#renderVaultList(item));
  }

  #updateLocalStorage() {
    localStorage.removeItem('vault');
    localStorage.setItem('vault', JSON.stringify(this.#vault));
  }
}

const app = new App();
