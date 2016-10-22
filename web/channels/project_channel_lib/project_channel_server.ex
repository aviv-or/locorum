defmodule Locorum.ProjectChannelServer do
  use GenServer
  import Ecto.Query, only: [from: 2]
  alias Locorum.Repo
  alias Locorum.ResultCollection
  alias Locorum.Backend
  alias Locorum.Search
  alias Locorum.Result

  #######
  # API #
  #######

  def start_link(project_id) do
    GenServer.start_link(__MODULE__, project_id, name: :"Project#{project_id}Server")
  end

  def get_state(project_id) do
    GenServer.call(name(project_id), :get_state)
  end

  def get_dep_state(project_id) do
    GenServer.call(name(project_id), :get_dep_state)
  end

  def is_online(project_id) do
    if GenServer.whereis(name(project_id)) do
      true
    else
      false
    end
  end

  #############
  # Callbacks #
  #############

  def init(project_id) do
    state = init_state(project_id)
    {:ok, state}
  end

  def handle_call(:get_state, _from, state) do
    {:reply, state, state}
  end

  def handle_call(:get_dep_state, _from, %{newest_collections: collections, collection_list: collection_list, backends: backends} = state ) do
    dep_state = %{collections: collections, collection_list: collection_list, backends: backends}
    {:reply, dep_state, state}
  end

  #####################
  # Private Functions #
  #####################

  # This will pull all results_collections, backends, and associations and store
  # in state. Or should it be :ets?
  def init_state(project_id) do
    # Write the queries for preloading ResultCollection and Result for all
    # searches for a given project. Used with Seach query below. Sorts are key
    # here, as they will order the results by most recent.
    preload_collections = from rc in ResultCollection, order_by: [desc: rc.inserted_at]
    preload_results = from r in Result, order_by: [desc: r.rating]

    # Use preload queries written above to return all searches for a given
    # project.
    searches = Repo.all from s in Search,
                        where: s.project_id == ^project_id,
                        preload: [result_collections: ^preload_collections, result_collections: [results: ^preload_results, results: :backend]]

    # Loads all backends
    backends = Backend |> Repo.all

    # Pulls all result_collections from t
    collections =
      searches
      |> Enum.map(&(&1.result_collections))
      |> List.flatten

    # Pulls the most recent result collections for each search.
    newest_collections =
      searches
      |> Enum.map(&(List.first(&1.result_collections)))

    # TODO convert all_collections to :ets
    # Uses JSON rendering from the views in order to construct the state as a
    # JSON object. If there are n collections, will return object with empty
    # values
    if List.first(collections) do
      %{all_collections: Phoenix.View.render_many(collections, Locorum.ResultCollectionView, "result_collection.json"),
        newest_collections: Phoenix.View.render_many(newest_collections, Locorum.ResultCollectionView, "result_collection.json"),
        collection_list: Phoenix.View.render_many(collections, Locorum.ResultCollectionView, "result_collection_list.json"),
        backends: Phoenix.View.render_many(backends, Locorum.BackendView, "backend.json")}
    else
      %{all_collections: [], newest_collections: [], collection_list: [], backends: []}
    end
  end

  # Given a project_id, this will return the name of the channel server for
  # the project.
  def name(project_id) do
    :"Project#{project_id}Server"
  end
end
