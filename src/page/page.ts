import './page.css'

const form = document.querySelector('form')
form?.addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)
    let data: { [key: string]: any } = {}
    for(var pair of formData.entries()) {
      if (pair[0] in data) {
        if (!Array.isArray(data[pair[0]])) {
          data[pair[0]] = [data[pair[0]]]
        }
        data[pair[0]].push(pair[1])
        continue
      }
      data[pair[0]] = pair[1]
    }
    const resultElement = document.querySelector('#result pre')
    if (resultElement) {
        resultElement.textContent = JSON.stringify(data, null, 2)
    }
})