defmodule Locorum.ProjectControllerServerTest do
  use Locorum.ConnCase
  alias Locorum.{TestHelpers, ProjectChannelSupervisor, ProjectChannelServer}

  #########
  # Setup #
  #########

  @empty_project_id 1
  @not_started_project_id 111

  setup %{conn: conn} = config do
    if config[:full_project] do
      project = TestHelpers.insert_full_project
      {:ok, conn: conn, project_id: project.id}
    else
      :ok
    end
  end

  #########
  # Tests #
  #########

  # Tags used:
  # :project_server -> Every test related to the server
  # :full_project -> Setup config with a full project in the Test Repo

  @tag :project_server
  test "get_state on project with no results returns empty state" do
    ProjectChannelSupervisor.start_link(@empty_project_id)
    assert ProjectChannelServer.get_state(@empty_project_id) == %{all_collections: [], newest_collections: [], collection_list: [], backends: [], searches: []}
  end

  @tag :full_project
  @tag :project_server
  test "get_state on full project returns correct results", %{project_id: project_id} do
    ProjectChannelSupervisor.start_link(project_id)
    state = ProjectChannelServer.get_state(project_id)

    assert state.backends |> List.first |> Map.fetch(:backend) == {:ok, "Google"}
    assert state.all_collections == :all_collections
    assert length(state.collection_list) == 2
    assert length(state.newest_collections) == 2
    assert length(state.searches) == 2
  end

  @tag :project_server
  test "get_dep_state on project with no results returns empty state in deprecated format" do
    ProjectChannelSupervisor.start_link(@empty_project_id)
    assert ProjectChannelServer.get_dep_state(@empty_project_id) == %{collections: [], collection_list: [], backends: []}
  end

  @tag :full_project
  @tag :project_server
  test "get_dep_state on full project returns correct results", %{project_id: project_id} do
    ProjectChannelSupervisor.start_link(project_id)
    state = ProjectChannelServer.get_dep_state(project_id)

    assert state.backends |> List.first |> Map.fetch(:backend) == {:ok, "Google"}
    assert state.collections |> List.first |> Map.fetch(:id) == state.collection_list |> List.first |> Map.fetch(:result_collection_id)
  end

  @tag :project_server
  test "is_online returns accurate online status for server" do
    ProjectChannelSupervisor.start_link(@empty_project_id)
    assert ProjectChannelServer.is_online(@empty_project_id)
    refute ProjectChannelServer.is_online(@not_started_project_id)
  end

  @tag :full_project
  @tag :project_server
  test "get_searches returns all searches for a project", %{project_id: project_id} do
    ProjectChannelSupervisor.start_link(project_id)
    assert length(ProjectChannelServer.get_searches(project_id)) == 2
  end

  @tag :full_project
  @tag :project_server
  test "get_single_search returns a single search", %{project_id: project_id} do
    ProjectChannelSupervisor.start_link(project_id)
    search_to_check = ProjectChannelServer.get_searches(project_id) |> List.first
    assert ProjectChannelServer.get_single_search(project_id, search_to_check.id) == search_to_check
    assert ProjectChannelServer.get_single_search(project_id, Integer.to_string(search_to_check.id)) == search_to_check
  end

  @tag :full_project
  @tag :project_server
  test "get_updated_results/1 returns the newest collections", %{project_id: project_id} do
    ProjectChannelSupervisor.start_link(project_id)
    collections_to_fetch = ProjectChannelServer.get_state(project_id) |> Map.get(:newest_collections)
    assert ProjectChannelServer.get_updated_results(project_id) == collections_to_fetch
  end

  @tag :full_project
  @tag :project_server
  test "get_updated_result/2 returns most recent collection for a given search", %{project_id: project_id} do
    ProjectChannelSupervisor.start_link(project_id)
    results_to_check = ProjectChannelServer.get_updated_results(project_id) |> List.first
    assert ProjectChannelServer.get_updated_result(project_id, results_to_check.search_id) == results_to_check
    assert ProjectChannelServer.get_updated_result(project_id, Integer.to_string(results_to_check.search_id)) == results_to_check
  end

  @tag :current_test
  @tag :full_project
  @tag :project_server
  test "get_collection returns the correct collection", %{project_id: project_id} do
    ProjectChannelSupervisor.start_link(project_id)
    collection = ProjectChannelServer.get_updated_results(project_id) |> List.first
    assert ProjectChannelServer.get_collection(project_id, collection.id) == collection
  end
end
