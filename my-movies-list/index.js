const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const PAGE_amount = 12
const changePanel = document.querySelector('.change-panel')

let filteredMovies = []
let nowPage = 1

const VIEW_STATE = {
  ListModel: "ListModel",
  CardModel: "CardModel",
}


axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    showList(getMoviesByPage(1))
    pageAmount(movies.length)
  })
  .catch((err) => console.log(err))

function showList(data) {
  let listHTML = ''
  data.forEach((index) => {
    listHTML += ` <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img
            src="${POSTER_URL + index.image}"
            class="card-img-top" alt="Movie Poster" />
          <div class="card-body">
            <h5 class="card-title">${index.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie"
              data-bs-toggle="modal"
              data-bs-target="#movie-modal"
              data-id = "${index.id}"
            >More</button>
            <button class="btn btn-info btn-add-favorite" data-id = "${index.id}">+</button>
          </div> 
        </div>
      </div>
    </div>`
  })
  dataPanel.innerHTML = listHTML
}
function renderMovieByList(data) {
  let listHTML = ''
  data.forEach((index) => {
    listHTML += ` <div class="d-flex  justify-content-between m-2 align-items-center">
    <div>
      <h4>${index.title}</h4>
    </div>
    <div>
      <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
      data-id="${index.id}">More</button>
      <button class="btn btn-info btn-add-favorite" data-id="${index.id}">+</button>
    </div>
  </div>`
  })
  dataPanel.innerHTML = listHTML
}
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title');
  const modalImage = document.querySelector('#movie-modal-image');
  const modalDate = document.querySelector('#movie-modal-date');
  const modalDescription = document.querySelector('#movie-modal-description');
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results;
      modalTitle.innerText = data.title;
      modalDate.innerHTML = 'Release date:' + data.release_date;
      modalDescription.innerText = data.description;
      modalImage.innerHTML = `<img src ="${POSTER_URL + data.image}" alt = "movie-poster" class = "img-fluid"/> `;
    });
}
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中')
  }
  list.push(movie)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}
function pageAmount(amount) {
  let redHTML = ''
  const numberOfPage = Math.ceil(amount / PAGE_amount)
  for (let page = 1; page <= numberOfPage; page++) {
    redHTML += `<li class="page-item"><a class="page-link" href="#" data-page ="${page}" >${page}</a></li>`
  }
  paginator.innerHTML = redHTML
}
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * PAGE_amount
  return data.slice(startIndex, startIndex + PAGE_amount)
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})
searchForm.addEventListener('submit', function onSearchSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  // if(!keyword.length){
  //   return alert('please enter a voild string')
  // }


  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))
  if (filteredMovies.length === 0) {
    return alert('Can not find movie with keyword :' + keyword)
  }

  // for(const movie of movies){
  //   if(movie.title.toLowerCase().includes(keyword)){
  //     filteredMovies.push(movie)
  //   }
  // }
  pageAmount(filteredMovies.length)
  controller.displayByModel(getMoviesByPage(1))
})

paginator.addEventListener('click', function getPage(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  nowPage = page
  controller.displayByModel(getMoviesByPage(page))
})

const controller = {
  currentState: VIEW_STATE.CardModel,

  changeListOrCard(event) {
    if (event.includes('list')) {
      this.currentState = VIEW_STATE.ListModel
      return this.displayByModel(getMoviesByPage(1))
    }
    else if (event.includes('card')) {

      this.currentState = VIEW_STATE.CardModel
      return this.displayByModel(getMoviesByPage(1))
    }
  },

  displayByModel(date) {
    switch (this.currentState) {
      case VIEW_STATE.CardModel:
        showList(date)
        break
      case VIEW_STATE.ListModel:
        renderMovieByList(date)
        break
    }
  }
}

changePanel.addEventListener('click', (event) => {
  controller.changeListOrCard(event.target.className)
})