const currencyOneEl = document.querySelector('[data-js="currency-one"]')
const currencyTwoEl = document.querySelector('[data-js="currency-two"]')
const timesCurrencyOneEl = document.querySelector('[data-js="currency-one-times"]')
const convertedValueEl = document.querySelector('[data-js="converted-value"]')
const valuePrecisionEl = document.querySelector('[data-js="conversion-precision"]')
const currencyEl = document.querySelector('[data-js="currencyEl"]')

const keyAPI = "a98ed45ccab965f0a5726a9e"
const getUrl = (currency) => `https://v6.exchangerate-api.com/v6/${keyAPI}/latest/${currency}`

const showAlert = ({ message }) => {
    const div = document.createElement('div');
    const button = document.createElement("button")

    div.textContent = message;
    div.classList.add("alert", "alert-warning", 'alert-dismissible', 'fade', 'show')
    div.setAttribute('role', 'alert')
    button.setAttribute('type', 'button')
    button.classList.add('btn-close')
    button.setAttribute("data-bs-dismiss", "alert")
    button.setAttribute('aria-label', 'Close')

    div.appendChild(button)
    currencyEl.insertAdjacentElement('afterend', div)

    const removeAlert = () =>div.remove()

    button.addEventListener('click', removeAlert)
}

const state = (() => {
    let exchangeRate = {}

    return {
        getExchangeRate: () => exchangeRate,
        setExchangeRate: newExchangeRate => {
            if (newExchangeRate && !newExchangeRate.conversion_rates) {
                showAlert({
                     message: 'O objeto precisa conter a propriedade "conversion_rates"' })
                return
            }
            exchangeRate = newExchangeRate;
            return exchangeRate
        }
    }
})()

const getErrorMessage = errorType => ({
    "unsupported-code": "A moeda não existe em nosso banco de dados.",
    "malformed-request": "Quando alguma parte da sua solicitação não segue a estrutura https://v6.exchangerate-api.com/v6/YOUR-API-KEY/latest/USD .",
    "invalid-key": "Sua chave de API não é válida.",
    "inactive-account": "Seu endereço de e-mail não foi confirmado.",
    "quota-reached": "Sua conta atingir o número de solicitações permitidas pelo seu plano.",

})[errorType] || "Não foi possível obter as informações"


const fetchExchangeRate = async (url) => {
    try {
        const response = await fetch(url)
        const exchangeRateData = await response.json()

        if (exchangeRateData.result === 'error') {
            const erroMessage = exchangeRateData['error-type']
            throw new Error(getErrorMessage(erroMessage))
        }

        if (!response.ok) {
            throw new Error('Sua conexão falhou, verifique sua conexão com a internet.')
        }

        return state.setExchangeRate(exchangeRateData);

    } catch (error) {
        showAlert(error)
    }
}

const getOptions = (selectedCurrency, conversion_rates) => {
    const setSelectedAttribute = currency => {
        return currency === selectedCurrency ? 'selected' : ''
    }

        const getOptionAsArray = currency => 
            `<option ${setSelectedAttribute(currency)}>${currency}</option>`
            
        return Object.keys(conversion_rates)
        .map(getOptionAsArray)
        .join('')
}

const multipliedExchangeRate = conversion_rates => {
    const currencyTwo = conversion_rates[currencyTwoEl.value]
    return (timesCurrencyOneEl.value * currencyTwo).toFixed(2)
}

const getNotRoundedExchangeRate = conversion_rates => {
    const currencyTwo = conversion_rates[currencyTwoEl.value]
    return `1 ${currencyOneEl.value} = ${1 * currencyTwo} ${currencyTwoEl.value}`
}

const showUpdataRates = ({ conversion_rates }) => {
    convertedValueEl.textContent = multipliedExchangeRate(conversion_rates)
    valuePrecisionEl.textContent = getNotRoundedExchangeRate(conversion_rates)
}

const showInitialInfo = ({ conversion_rates }) => {
    currencyOneEl.innerHTML = getOptions('USD', conversion_rates);
    currencyTwoEl.innerHTML = getOptions('BRL', conversion_rates);

    showUpdataRates({conversion_rates})
}

const init = async () => {
    const URL = getUrl('USD')
    const exchangeRate = await fetchExchangeRate(URL)


    if (exchangeRate && exchangeRate.conversion_rates) {
        showInitialInfo(exchangeRate)
    }
}

const handleTimesCurrencyOneElInput = (e) => {
    const { conversion_rates } = state.getExchangeRate()

    convertedValueEl.textContent = multipliedExchangeRate(conversion_rates)
}

const handleCurrencyTwoElInput =  () => {
    const exchangeRate = state.getExchangeRate()
    showUpdataRates(exchangeRate)
}

const handleCurrencyOneElInput = async (e) => {
    const url = getUrl(e.target.value)
    const exchangeRate = await fetchExchangeRate(url)


    showUpdataRates(exchangeRate)
}

timesCurrencyOneEl.addEventListener('input', handleTimesCurrencyOneElInput)
currencyTwoEl.addEventListener('input', handleCurrencyTwoElInput)
currencyOneEl.addEventListener('input', handleCurrencyOneElInput)

init()
