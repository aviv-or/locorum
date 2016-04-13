defmodule Locorum.BackendSys.Local do
  require Logger
  alias Locorum.BackendSys.Result
  alias Locorum.BackendSys.Header

  @backend_url "http://www.local.com/"

  def start_link(query, query_ref, owner, limit) do
    HTTPoison.start
    Task.start_link(__MODULE__, :fetch, [query, query_ref, owner, limit])
  end

  def fetch(query, query_ref, owner, _limit) do
    get_url(query.city, query.state, query.biz)
     |> fetch_html
     |> parse_data
     |> send_results(query_ref, owner, get_url(query.city, query.state, query.biz))
  end

  defp fetch_html(url) do
    case HTTPoison.get(url) do
      {:ok, %HTTPoison.Response{status_code: 200, body: body}} ->
        body
      {:ok, %HTTPoison.Response{status_code: 301, headers: headers}} ->
        [headers|_] = headers
        headers = elem(headers, 1)
        fetch_html(get_url(headers))
      {:ok, %HTTPoison.Response{status_code: 404}} ->
        Logger.error("404 redirect, Local backend, #{inspect url}")
        {:error, "404"}
      {:ok, %HTTPoison.Response{status_code: 403}} ->
        Logger.error("403 redirect, Local backend, #{inspect url}")
        {:error, "403"}
      {:error, %HTTPoison.Error{reason: reason}} ->
        Logger.error("HTTPoison error: #{inspect reason}, Local backend, #{inspect url}")
        {:error, reason}
    end
  end

  defp get_url(city, state, biz) do
    city =
      city
      |> String.downcase
      |> String.replace(~r/[^\w-]+/, "%2520")
    state = String.downcase(state)
    biz =
      biz
      |> String.downcase
      |> String.replace(~r/[^\w-]+/, "%20")

    "http://www.local.com/business/results/?keyword=#{biz}&location=#{city}%252C%2520#{state}"
  end
  defp get_url(redirect) do
    "http://www.local.com#{redirect}"
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

  defp send_results(nil, query_ref, owner, url), do: send(owner, {:ignore, query_ref, url})
  defp send_results(results, query_ref, owner, url) do
    send(owner, {:results, query_ref, %Header{backend: "local", url_search: url, url_site: @backend_url}, results})
  end
end
