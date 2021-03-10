const backendBaseAPI = "http://localhost:3000/search?name_id="
const coinGeckoAPI = "https://api.coingecko.com/api/v3/coins/list"
let cryptoID = ""
const coinSearch = document.querySelector('#coin_search')
const searchSuggestion = document.querySelector('#search_suggestion')
const searchInput = document.querySelector('#search_input')
const priceButton = document.querySelector('#price')
const marCapButton = document.querySelector('#mar_cap')
const chart = document.querySelector('#myChart')
const startDate = document.querySelector('#start_date')
const endDate = document.querySelector('#end_date')
const submitSearch = document.querySelector('#submit_search')
const username = document.querySelector('#username')
const password = document.querySelector('#password')
const loginSubmit = document.querySelector('#login_submit')
const selectFavorite = document.querySelector('#select_favorite')
const priceArray = []
const marketArray = []
const timeArray = []
const lastYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
const today = new Date()
let user_id = 0

loginSubmit.addEventListener('click',function(){
  fetch(`http://localhost:3000/login?username=${username.value}&password=${password.value}`)
    .then(handleResponse)
    .then(user => {
      fetch(`https://api.coingecko.com/api/v3/coins/${user.cryptocurrencies[0].name_id}/market_chart?vs_currency=usd&days=${findTime()}&interval=daily`)
      .then(handleResponse)
      .then(data => {
        priceArray.length = 0
        createChartData(data, marketArray, "market_caps")
        renderChart(timeArray,priceArray, marketArray)
      })
      const select = document.createElement('select')
      user.cryptocurrencies.forEach(favorite => {
        const option = document.createElement('option')
        option.value = favorite.name
        option.textContent = favorite.name
        option.id = favorite.name_id
        select.append(option)
      })
      user_id = user.id
      selectFavorite.append(select)
    })
})

selectFavorite.addEventListener('change', (e) => {
  priceArray.length = 0
  fetch(`https://api.coingecko.com/api/v3/coins/${e.target.selectedOptions[0].id}/market_chart?vs_currency=usd&days=${findTime()}&interval=daily`)
  .then(handleResponse)
  .then(data => {
    marketArray.length = 0
    createChartData(data, priceArray, "prices")
    renderChart(timeArray,priceArray, marketArray)
  })
})

const findTime = () => {
  let startDateInt = new Date(startDate.value)
  let endDateInt = new Date(endDate.value)
  let diffTime = Math.abs(endDateInt - startDateInt);
  diffTime = Math.floor(diffTime / 1000 / 60 / 60 / 24)
  return diffTime
}

// UPDATES CHART AFTER RADIO BUTTON
submitSearch.addEventListener('click', () => {
  if(priceButton.checked){
    fetchChart("prices", priceArray, marketArray)
  }
  if(marCapButton.checked){
    fetchChart("market_caps", marketArray, priceArray)
  }
})

// FETCH API, CREATE CHART, AND RENDER CHART
const fetchChart = (dataType, arraySet, arrayReset) => {
  fetch(`https://api.coingecko.com/api/v3/coins/${input.toLowerCase()}/market_chart?vs_currency=usd&days=${findTime()}&interval=daily`)
  .then(handleResponse)
  .then(data => {
    arrayReset.length = 0
    createChartData(data, arraySet, dataType)
    renderChart(timeArray,priceArray, marketArray)
  })
}

// RENDER PRICE CHART ON BUTTON
priceButton.addEventListener('click', function(){
  fetchChart("prices", priceArray, marketArray)
})

// RENDERS MARKET CAP CHART ON BUTTON
marCapButton.addEventListener('click', function(){
  fetchChart("market_caps", marketArray, priceArray)
})

// PREDICTS USERS SEARCH
const predictSearch = (event) => {
  searchSuggestion.textContent = ""
  input = event.target.value.toUpperCase()
  searchAPI = backendBaseAPI + input
  if(event.target.value != ""){
    fetch(searchAPI)
    .then(handleResponse)
    .then(data => {
      searchSuggestion.textContent = data.name_id
    })
  }
  else{
    searchSuggestion.textContent = ""
  }
}

// EXECUTES SEARCH
const handleSearch = (e) => {
   if(e.key == "Enter"){
    if(priceButton.checked){
      fetchChart("prices", priceArray, marketArray)
    }
    else if(marCapButton.checked){
      fetchChart("market_caps", marketArray, priceArray)
    }
    else{
      fetchChart("prices", priceArray, marketArray)
    }
   }
}

// SEARCH LISTENER
coinSearch.addEventListener('input', predictSearch)
coinSearch.addEventListener('keydown', handleSearch)

// HANDLES RESPONSE
const handleResponse = (response) => {
  return response.json()
}

// CREATES CHART DATA
const createChartData = (data, array, capitalType) => {
  if(capitalType == "prices"){
    let date = new Date()
    timeArray.length = 0
    data.prices.forEach(timeframe => {
      array.push(timeframe[1])
      date.setDate(date.getDate() - 1)
      timeArray.push(date.toString().slice(0, -24))
    })
  }
  else if(capitalType == "market_caps"){
    let date = new Date()
    timeArray.length = 0
    data.market_caps.forEach(timeframe => {
      array.push(timeframe[1])
      date.setDate(date.getDate() - 1)
      timeArray.push(date.toString().slice(0, -24))
    })
  }
}

// CREATES CHART
const renderChart = (timeArray, priceArray, marketArray) => {
  var ctx = document.getElementById('myChart').getContext('2d');
            var myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: timeArray.reverse(),
                    datasets: [
                      {
                        label: '',
                        data: priceArray,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    },
                    {
                      label: '',
                      data: marketArray,
                      backgroundColor: [
                          'rgba(255, 99, 132, 0.2)',
                          'rgba(54, 162, 235, 0.2)',
                          'rgba(255, 206, 86, 0.2)',
                          'rgba(75, 192, 192, 0.2)',
                          'rgba(153, 102, 255, 0.2)',
                          'rgba(255, 159, 64, 0.2)'
                      ],
                      borderColor: [
                          'rgba(255, 99, 132, 1)',
                          'rgba(54, 162, 235, 1)',
                          'rgba(255, 206, 86, 1)',
                          'rgba(75, 192, 192, 1)',
                          'rgba(153, 102, 255, 1)',
                          'rgba(255, 159, 64, 1)'
                      ],
                      borderWidth: 1
                  }
                  ]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            }
            )
            const addRemove = document.querySelector('#add_remove')
            const add = document.createElement('span')
            const remove = document.createElement('span')
            addRemove.innerHTML = ""
            add.textContent = 'Add To Favorites'
            remove.textContent = 'Remove From Favorites'
            addRemove.append(add, remove)
            add.addEventListener('click', () => {
              fetch(`http://localhost:3000/search?name_id=${input.toLowerCase()}`)
                .then(handleResponse)
                .then(data => {
                  cryptoID = data.id
                }).then(data => {
                  fetch(`http://localhost:3000/favorites?cryptocurrency_id=${cryptoID}&user_id=${user_id}`, {
                method: 'POST'
              })
            })})
            remove.addEventListener('click', () => {
              const select = document.querySelector('select')
              console.log(select.value)
              fetch(`http://localhost:3000/search?name_id=${select.value.toLowerCase()}`)
                .then(handleResponse)
                .then(data => {
                  cryptoID = data.id
                }).then(data => {
                  fetch(`http://localhost:3000/removeFav?cryptocurrency_id=${cryptoID}&user_id=${user_id}`, {
                method: 'DELETE'
              })
            })})
          }

// RENDER CALENDER W/ JQUERY
$(function() {
  $( "#start_date" ).datepicker({ minDate: -1000, maxDate: "+0D" });
  $("#start_date").datepicker("setDate", lastYear);
  $( "#start_date" ).datepicker( "option", "dateFormat", "mm/dd/yy");
});
$(function() {
  $( "#end_date" ).datepicker({ minDate: -1000, maxDate: "+0D" });
  $("#end_date").datepicker("setDate",today);
  $( "#end_date" ).datepicker( "option", "dateFormat", "mm/dd/yy");
});