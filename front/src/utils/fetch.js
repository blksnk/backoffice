
export const f = (method, url, body) => new Promise((resolve, reject) => {
  fetch('http://localhost:3000' + url, {
    method,
    body,
  }).then(res => {
    return resolve(res.json());
  }).catch(err => {
    console.error(e);
    return reject(err)
  })
})

export default class Fetcher {
  constructor() {
    this.history = []
  }

  get(url) {
    this.addToHistory(url, 'GET')
    return f('GET', url);
  }

  post(url, body) {
    this.addToHistory(url, 'POST', body)
    return f('POST', url, body);
  }

  put(url, body) {
    this.addToHistory(url, 'PUT', body)
    return f('PUT', url, body);
  }

  delete(url) {
    this.addToHistory(url, 'DELETE')
    return f('DELETE', url);
  }

  addToHistory(url, method, body) {
    this.history.push({url, method, body, ts: Date.now()})
  }

  clearHistory() {
    this.history.length = 0;
  }
}

export const fetcher = new Fetcher();
