defmodule Locorum.ResultCollectionController do
  use Locorum.Web, :controller
  alias Locorum.Repo
  alias Locorum.ResultCollection

  def index(conn, _params) do
    collections = Repo.all(ResultCollection)
    render conn, "index.html", collections: collections
  end

  def delete(conn, %{"id" => id}) do
    collection =
      ResultCollection
      |> Repo.get(id)
      |> Repo.preload([:results])

    for result <- collection.results do
      Repo.delete result
    end

    Repo.delete collection
    redirect conn, external: get_refer(conn)
  end

  # TODO DRY refactor
  defp get_refer(conn) do
    {_, referer} = List.keyfind(conn.req_headers, "referer", 0) || {0, backend_path(conn, :index)}
    referer
  end
end
