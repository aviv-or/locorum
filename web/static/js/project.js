let Project = {

  init(socket, element){ if(!element){ return }
    let projectId = element.getAttribute("data-id")
    socket.connect()
    this.onReady(projectId, socket)
  },

  onReady(projectId, socket){
    let searchesContainer = document.getElementById("searches")
    let runSearch = document.getElementById("run-search")
    let projectChannel = socket.channel("projects:" + projectId)

    runSearch.addEventListener("click", e => {
      projectChannel.push("run_test")
                   .receive("error", e => console.log(e) )
      let temp = document.getElementById("title-header")
      temp.innerHTML = `
      Test underway...
      `
    })

    // Need search_id for this one...
    projectChannel.on("backend", (resp) => {
      this.renderBackend(resp)
    })

    projectChannel.on("result", (resp) => {
      this.renderResult(resp)
    })

    projectChannel.join()
      .receive("ok", resp => console.log("Joined project channel", resp))
      .receive("error", resp => console.log("Failed to join project channel", resp))
  },

  renderBackend(resp){
    let dropMenu = document.getElementById(`backendDrop${resp.search_id}-contents`)
    let dropMenuBackend = document.createElement("li")
    dropMenuBackend.innerHTML = `
    <a href="#dropdown-${this.esc(resp.backend)}-${this.esc(resp.search_id)}" role="tab" id="#dropdown-${this.esc(resp.backend)}-${this.esc(resp.search_id)}-tab" data-toggle="tab" aria-controls="#dropdown-${this.esc(resp.backend)}-${this.esc(resp.search_id)}" aria-expanded="false">${this.esc(resp.backend_str)}</a>
    `
    dropMenu.appendChild(dropMenuBackend)

    let tabContent = document.getElementById(`tab-content-${this.esc(resp.search_id)}`)
    let tabContentBackend = document.createElement("div")
    tabContentBackend.setAttribute("class", "tab-pane fade")
    tabContentBackend.setAttribute("role", "tabpanel")
    tabContentBackend.setAttribute("id", `dropdown-${this.esc(resp.backend)}-${this.esc(resp.search_id)}`)
    tabContentBackend.innerHTML = `<h4>${this.esc(resp.backend_str)}</h4>`
    tabContent.appendChild(tabContentBackend)
  },

  renderResult(resp){
    let dropContent = document.getElementById(`dropdown-${this.esc(resp.backend)}-${this.esc(resp.search_id)}`)
    let newContent = document.createElement("div")
    newContent.innerHTML = `
    <b>${this.esc(resp.biz)}</b><br>
    ${this.esc(resp.address)}<br>
    ${this.esc(resp.city)}, ${this.esc(resp.state)} ${this.esc(resp.zip)}<br>
    ${this.esc(resp.phone)}<br>
    <i>Rating: <b>${this.esc(resp.rating)}</b><br>
    <i><a href="${this.esc(resp.url)}" target="_blank">Edit entry</a></i><br><br>
    `
    dropContent.appendChild(newContent)
  },

  esc(str){
    let div = document.createElement("div")
    div.appendChild(document.createTextNode(str))
    return div.innerHTML
  }
}


export default Project
