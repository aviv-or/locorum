defmodule Locorum.BackendSys.Local do
  alias Locorum.BackendSys.Result
  alias Locorum.BackendSys.Header
  alias Locorum.BackendSys.Helpers

  @backend %Header{backend: "local", backend_str: "Local", url_site: "http://www.local.com"}

  def start_link(query, query_ref, owner, limit) do
    Task.start_link(__MODULE__, :fetch, [query, query_ref, owner, limit])
  end

  def fetch(query, _query_ref, owner, _limit) do
    get_url(query)
    |> Helpers.init_html(@backend, owner)
    |> parse_data
    |> Helpers.send_results(@backend, owner)
  end

  def get_url(query) do
    city =
      query.city
      |> Helpers.convert_to_utf("%2520")
    state = String.downcase(query.state)
    biz =
      query.biz
      |> Helpers.convert_to_utf("%20")

    "http://www.local.com/business/results/?keyword=#{biz}&location=#{city}%252C%2520#{state}"
  end

  defp parse_data(body) do
    address = parse_item(Floki.find(body, "span.street-address"))
    [city, state] =
      parse_item(Floki.find(body, "span.locality"))
      |> extract_city_state
    biz = extract_title(Floki.find(body, "h2.title"))

    add_to_result(List.zip([biz, address, city, state]))
  end

  defp parse_item([]), do: []
  defp parse_item([{_, _,[item]} | tail]), do: [String.strip(item) | parse_item(tail)]
  defp parse_item([item | tail]), do: [String.strip(item) | parse_item(tail)]

  defp extract_city_state(initial_value), do: extract_city_state(initial_value, [], [])
  defp extract_city_state([head|tail], city, state) do
    [new_city|new_state] = String.split(head, ", ")
    extract_city_state(tail, city ++ [new_city], state ++ new_state)
  end
  defp extract_city_state([], city, state), do: [city, state]

  defp extract_title([]), do: []
  defp extract_title([{_, _, item} | tail]), do: [join_string_elements(parse_item(item)) | extract_title(tail)]

  defp join_string_elements(list), do: join_string_elements(list, "")
  defp join_string_elements([head|tail], acc), do: join_string_elements(tail, "#{acc} #{head}")
  defp join_string_elements([], acc), do: String.strip(acc)

  defp add_to_result([]), do: []
  defp add_to_result([{name, address, city, state} | tail]) do
    [%Result{biz: name, address: address, city: city, state: state } | add_to_result(tail)]
  end
end
