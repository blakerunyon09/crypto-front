const backendBaseAPI = "http://localhost:3000/search?name_id="
const coinSearch = document.querySelector('#coin_search')
const searchSuggestion = document.querySelector('#search_suggestion')

const handleResponse = (response) => {
  return response.json()
}

coinSearch.addEventListener('keyup', (event) => {
  input = event.target.value
  searchAPI = backendBaseAPI + input
  if(event.target.value != ""){
    fetch(searchAPI)
    .then(handleResponse)
    .then(data => {
      searchSuggestion.textContent = data.name_id
      console.log(event)
    })
  }
  else{
    searchSuggestion.textContent = ""
  }
})