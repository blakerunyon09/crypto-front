const backendBaseAPI = "https://coin-tracker-backend.herokuapp.com/search?name_id="
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
const viewLogin = document.querySelector('#view-login')
const selectFavorite = document.querySelector('#select_favorite')
const menuIcon = document.querySelector('#menu_icon')
const login = document.querySelector('#login-bar')
const select = document.createElement('select')
let nameRefresh = ""
const favoritesArray = []
const priceArray = []
const marketArray = []
const timeArray = []
const lastYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
const today = new Date()
let user_id = 0

// RENDERS FIRST CHART ON LOAD
window.addEventListener('DOMContentLoaded', () => {
  input = 'bitcoin'
  fetchChart("prices", priceArray, marketArray)
});

// FETCHES LOGIN & FIRST CHART
loginSubmit.addEventListener('click',function(){
  firstLoadURL = ""
  fetch(`https://coin-tracker-backend.herokuapp.com/login?username=${username.value}&password=${password.value}`)
    .then(handleResponse)
    .catch(() => alert("Sorry, we couldn't find that Username & Password."))
    .then(user => {
      user.cryptocurrencies.forEach(coin => {
        favoritesArray.push(coin.name_id)
      })
      if(user.cryptocurrencies.length > 0){
        firstLoadURL = `https://api.coingecko.com/api/v3/coins/${user.cryptocurrencies[0].name_id}/market_chart?vs_currency=usd&days=${findTime()}&interval=daily`
      }
      else {
        firstLoadURL = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${findTime()}&interval=daily`
      }
      fetch(firstLoadURL)
      .then(handleResponse)
      .then(data => {
        priceArray.length = 0
        createChartData(data, marketArray, "market_caps")
        renderChart(timeArray,priceArray, marketArray)
        input = user.cryptocurrencies[0].name_id
        renderHeadings(data, input)
        nameRefresh = document.querySelector('h1').textContent.toLowerCase()
        renderTrackButtons(nameRefresh)
      })
      createSelector(user.cryptocurrencies)
      login.classList.add('hidden-top')
      const name = document.createElement('span')
      const nameDrop = document.querySelector('#name_drop')
      name.id = "name"
      name.textContent = user.username.slice(0,3).toUpperCase()
      nameDrop.append(name)
      user_id = user.id
      selectFavorite.append(select)
      const loginFields = document.querySelector("#login") 
      loginFields.innerHTML = '<div id="profile_options"><a href="/" id="logout">LOGOUT</a><span></span><span id="delete">DELETE ACCOUNT</span></div>'
      //DELETES PROFILE
      const deleteProfile = document.querySelector('#delete')
      deleteProfile.addEventListener('click', () => {
        fetch(`https://coin-tracker-backend.herokuapp.com/users/${user_id}`,{
          method: "DELETE"
        })
        .then(response => response.json())
        .then(alert('Your account has been deleted.'))
        .then(location.reload())
      })
    })
})

const createSelector = (iterator) => {
  selectFavorite.innerHTML = ""
  iterator.forEach(favorite => {
    const option = document.createElement('option')
    option.value = favorite.name
    option.textContent = favorite.name
    option.id = favorite.name_id
    select.append(option)
  })
  return select
}


// PULLS CHART FROM FAVORITES DROPDOWN
selectFavorite.addEventListener('change', (e) => {
  input = e.target.value
  fetchChart("prices", priceArray, marketArray)
})

// FETCHES TIME
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
    input = coinSearch.value
    fetchChart("prices", priceArray, marketArray)
  }
  else if(marCapButton.checked){
    input = coinSearch.value
    fetchChart("market_caps", marketArray, priceArray)
  }
  else{
    input = coinSearch.value
    fetchChart("prices", priceArray, marketArray)
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
    renderHeadings(data, input)
    nameRefresh = document.querySelector('h1').textContent.toLowerCase()
    renderTrackButtons(nameRefresh)
  })
}

// RENDERS TITLES & PRICE CHANGE
const renderHeadings = (data, input) => {
  let headings = document.querySelector('#headings')
  headings.innerHTML = ""
  let div = document.createElement('div')
  let h1 = document.createElement('h1')
  let h2 = document.createElement('h2')
  let h3 = document.createElement('h3')
  div.className = "row-1 animate__animated headings animate__fadeInLeft"
  h1.textContent = input.toUpperCase()
  dayPrice = data.prices.pop()
  startPrice = data.prices[0][1]
  netPrice = dayPrice[1] - startPrice
  h2.textContent = `$${dayPrice[1].toLocaleString()}`
  h3.textContent = `$${netPrice.toLocaleString()}`
  if(netPrice >= 0){
    h3.classList.add("green")
    h3.classList.remove("red")
  }
  else{
    h3.classList.add("red")
    h3.classList.remove("green")
  }
  div.append(h1, h2, h3)
  headings.append(div)
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
  input = event.target.value.toLowerCase()
  searchAPI = backendBaseAPI + input
  if(event.target.value != ""){
    fetch(searchAPI)
    .then(handleResponse)
    .then(data => {
      searchSuggestion.textContent = data.name_id
      input = data.name_id
    })
    .catch(error => {error})
  }
  else{
    setTimeout(function(){ searchSuggestion.textContent = "" }, 75);
  }
}

// EXECUTES SEARCH
const handleSearch = (e) => {
   if(e.key == "Enter"){
    if(priceButton.checked){
      fetchChart("prices", priceArray, marketArray)
      coinSearch.value = searchSuggestion.textContent
    }
    else if(marCapButton.checked){
      fetchChart("market_caps", marketArray, priceArray)
      coinSearch.value = searchSuggestion.textContent
    }
    else{
      fetchChart("prices", priceArray, marketArray)
      coinSearch.value = searchSuggestion.textContent
    }
   }
   if(e.key == "Tab"){
     e.preventDefault()
     coinSearch.value = searchSuggestion.textContent
     input = searchSuggestion.textContent
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
    array.length = 0
    data.prices.forEach(timeframe => {
      array.push(timeframe[1])
      date.setDate(date.getDate() - 1)
      timeArray.push(date.toString().slice(0, -24))
    })
  }
  else if(capitalType == "market_caps"){
    let date = new Date()
    timeArray.length = 0
    array.length = 0
    data.market_caps.forEach(timeframe => {
      array.push(timeframe[1])
      date.setDate(date.getDate() - 1)
      timeArray.push(date.toString().slice(0, -24))
    })
  }
}

// POPS FILTER ON AND OFF
menuIcon.addEventListener('click', () => {
  const nav = document.querySelector('nav')
  const menuIcon = document.querySelector('#menu_icon')
  if(nav.className == ""){
    nav.classList.add('hidden')
    menuIcon.className = "fas fa-bars"
  }
  else{
    nav.classList.remove('hidden')
    menuIcon.className = "fas fa-times"
  }
})

// POP LOGIN ON AND OFF
viewLogin.addEventListener('click', () => {
  if(login.classList.contains('hidden-top')){
    login.classList.remove('hidden-top')
    viewLogin.className = "fas fa-caret-square-up"
  }
  else{
    login.classList.add('hidden-top')
    viewLogin.className = "fas fa-caret-square-down"
  }
})

// CREATES CHART
const renderChart = (timeArray, priceArray, marketArray) => {
  var ctx = document.getElementById('myChart').getContext('2d');
            var myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: timeArray.reverse(),
                    datasets: [
                      {
                        label: 'Price',
                        data: priceArray,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0)'      
                        ],
                        borderColor: [
                          '#8FBCBB'
                            
                        ],
                        borderWidth: 2
                    },
                    {
                      label: 'Total Market Capitualization',
                      data: marketArray,
                      backgroundColor: [
                          'rgba(255, 99, 132, 0)'
                      ],
                      borderColor: [
                          '#ECEFF4'
                      ],
                      borderWidth: 2
                  }
                  ]
                },
                options: {
                  tooltips: {
                    mode: 'index',
                    intersect: false
                 },
                 hover: {
                    mode: 'index',
                    intersect: false
                 },
                  legend: {
                    display: false
                  },
                  elements: {
                    line: {
                      borderJoinStyle: 'miter',
                      borderWidth: 2
                    },
                    point:{
                      radius: 0
                    }
                  },
                  scales: {
                    xAxes: [{
                        gridLines: {
                            color: "rgba(0, 0, 0, 0)"
                        },
                        ticks: {
                          display: false
                        }
                    }],
                    yAxes: [{
                        gridLines: {
                            color: "rgba(0, 0, 0, 0)"
                        },
                        ticks: {
                          display: false
                        }
                    }]
                  }
                }
            }
            )
          }

const renderTrackButtons = (nameSearch) => {
  if(user_id > 0){
    const options = selectFavorite.childNodes
    const addRemove = document.querySelector('#add_remove')
    const add = document.createElement('span')
    const remove = document.createElement('span')
    add.className = "btn bg-green"
    remove.className = "btn bg-red"
    addRemove.innerHTML = ""
    remove.textContent = 'Untrack'
    add.textContent = 'Track'
    if(favoritesArray.includes(nameSearch)){
      console.log("Untrack Button")
      addRemove.append(remove)
      add.remove()
    }
    else{
      console.log("Track Button")
      addRemove.append(add)
      remove.remove()
    }
    add.addEventListener('click', () => {
      fetch(`https://coin-tracker-backend.herokuapp.com/search?name_id=${input.toLowerCase()}`)
        .then(handleResponse)
        .then(data => {
          cryptoID = data.id
        }).then(data => {
          fetch(`https://coin-tracker-backend.herokuapp.com/favorites?cryptocurrency_id=${cryptoID}&user_id=${user_id}`, {
        method: 'POST'
      }).then(data => {
        addRemove.append(remove)
        add.remove()
        console.log(nameRefresh)
        console.log(options)
        // 
        // 
        // HERE
        // 
        // 
      }
      )
    })})
    remove.addEventListener('click', () => {
      const select = document.querySelector('select')
      fetch(`https://coin-tracker-backend.herokuapp.com/search?name_id=${select.value.toLowerCase()}`)
        .then(handleResponse)
        .then(data => {
          cryptoID = data.id
        }).then(data => {
          console.log(`https://coin-tracker-backend.herokuapp.com/removeFav?cryptocurrency_id=${cryptoID}&user_id=${user_id}`)
          fetch(`https://coin-tracker-backend.herokuapp.com/removeFav?cryptocurrency_id=${cryptoID}&user_id=${user_id}`, {
        method: 'DELETE'
      }).then(data => {
        addRemove.append(add)
        remove.remove()
        console.log(nameRefresh)
        console.log(options)
      }
      )
    })})
  }
}

// RENDER CALENDER W/ JQUERY
$(function() {
  $( "#start_date" ).datepicker({ minDate: -4451, maxDate: "+0D" });
  $("#start_date").datepicker("setDate", lastYear);
  $( "#start_date" ).datepicker( "option", "dateFormat", "mm/dd/yy");
});
$(function() {
  $( "#end_date" ).datepicker({ minDate: -4452, maxDate: "+0D" });
  $("#end_date").datepicker("setDate",today);
  $( "#end_date" ).datepicker( "option", "dateFormat", "mm/dd/yy");
});