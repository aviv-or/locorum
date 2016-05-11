let Project = {

  init(socket, element){ if(!element){ return }
    let projectId = element.getAttribute("data-id")
    socket.connect()
    this.onRead(projectId, socket)
  },

  onReady(projectId, socket){
    let searchesContainer = document.getElementById("searches")
    let projectChannel = socket.channel("projects:" + projectId)

    runSearch.addEventListener("click", e => {
      searchChannel.push("run_search")
                   .receive("error", e => console.log(e) )
    })

    // Need search_id for this one...
    searchChannel.on("backend", (resp) => {
      this.renderBackend(resp)
    })
  },

  renderBackend(resp){
    let template = document.createElement("div")
  },

  esc(str){
    let div = document.createElement("div")
    div.appendChild(document.createTextNode(str))
    return div.innerHTML
  }
}


export default Project
