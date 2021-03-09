const backendBaseAPI = "http://localhost:3000/search?name_id="
const coinGeckoAPI = "https://api.coingecko.com/api/v3/coins/list"
const coinSearch = document.querySelector('#coin_search')
const searchSuggestion = document.querySelector('#search_suggestion')
const searchInput = document.querySelector('#search_input')
const priceButton = document.querySelector('#price')
const marCapButton = document.querySelector('#mar_cap')
const chart = document.querySelector('#myChart')
const priceArray = []
const marketArray = []
const timeArray = []

priceButton.addEventListener('click', function(){
  fetch(`https://api.coingecko.com/api/v3/coins/${input.toLowerCase()}/market_chart?vs_currency=usd&days=365&interval=daily`)
  .then(handleResponse)
  .then(data => {
    marketArray.length = 0
    createChartData(data, priceArray, "prices")
    renderChart(timeArray,priceArray, marketArray)
  })
})

marCapButton.addEventListener('click', function(){
  fetch(`https://api.coingecko.com/api/v3/coins/${input.toLowerCase()}/market_chart?vs_currency=usd&days=365&interval=daily`)
  .then(handleResponse)
  .then(data => {
    priceArray.length = 0
    createChartData(data, priceArray, "market_caps")
    renderChart(timeArray,priceArray, marketArray)
  })
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
    priceArray.length = 0
    timeArray.length = 0
    fetch(`https://api.coingecko.com/api/v3/coins/${input.toLowerCase()}/market_chart?vs_currency=usd&days=365&interval=daily`)
      .then(handleResponse)
      .then(data => {
        createChartData(data, priceArray, "prices")
        createChartData(data, marketArray, "market_caps")
        renderChart(timeArray,priceArray, marketArray)
      })
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
            )}