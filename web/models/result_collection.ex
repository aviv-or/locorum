defmodule Locorum.ResultCollection do
  use Locorum.Web, :model

  schema "result_collections" do
    belongs_to :search, Locorum.Search
    has_many :results, Locorum.Result, on_delete: :fetch_and_delete
    has_many :no_results, Locorum.NoResult, on_delete: :fetch_and_delete

    timestamps
  end

  @required_fields ~w()
  @optional_fields ~w()

  def changeset(model, params \\ :empty) do
    model
    |> cast(params, @required_fields, @optional_fields)
  end
end
