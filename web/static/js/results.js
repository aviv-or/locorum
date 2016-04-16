let Results = {

  init(socket, element){ if(!element){ return }
    let searchId = element.getAttribute("data-id")
    socket.connect()
    this.onReady(searchId, socket)
  },

  onReady(searchId, socket){
    let resultsContainer = document.getElementById("results")
    let runSearch = document.getElementById("run-search")
    let addResult = document.getElementById("add-result")
    let searchChannel   = socket.channel("searches:" + searchId)

    runSearch.addEventListener("click", e => {
      searchChannel.push("run_test")
                   .receive("error", e => console.log(e) )
    })

    searchChannel.on("backend", (resp) => {
      this.renderBackend(resultsContainer, resp)
    })

    searchChannel.on("result", (resp) => {
      let backendContainer = document.getElementById(resp.backend)
      this.renderResult(backendContainer, resp)
    })

    searchChannel.on("no_result", (resp) => {
      let backendContainer = document.getElementById(resp.backend)
      this.renderNoResult(backendContainer)
    })

    searchChannel.join()
      .receive("ok", resp => console.log("Joined search channel", resp))
      .receive("error", reason => console.log("Join failed", reason))

  },

  renderBackend(resultsContainer, {backend, backend_str, backend_url, results_url}){
    let template = document.createElement("div")
    template.setAttribute("class", "panel panel-info")
    template.innerHTML = `
    <div class="panel-heading">
    <h4><a href="${backend_url}">${backend_str}</a></h4>
    </div>
    <div class="panel-body" id="${backend}"></div>
    <div class="panel-footer">
    <a href="${results_url}">Go to results on ${backend_str}...</a>
    </div>
    `
    resultsContainer.appendChild(template)
  },

  renderResult(backendContainer, {backend, biz, address, city, state, zip}){
    let template = document.createElement("div")
    template.innerHTML = `
    <b>${biz}</b><br>
    ${address}<br>
    ${city}, ${state} ${zip}<br>
    <br>
    `
    backendContainer.appendChild(template)
  },

  renderNoResult(backendContainer){
    let template = document.createElement("div")
    template.innerHTML = `
    <i>No results</i>
    `
    backendContainer.appendChild(template)
  }
}
export default Results
