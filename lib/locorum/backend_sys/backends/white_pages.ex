defmodule Locorum.BackendSys.WhitePages do
  alias Locorum.BackendSys.{Helpers, Result}

  def start_link(query, query_ref, owner, limit) do
    Task.start_link(__MODULE__, :fetch, [query, query_ref, owner, limit])
  end

  def fetch(query, _query_ref, owner, _limit) do
    query
    |> get_url
    |> Helpers.fetch_html
    |> parse_data
    |> Helpers.display_results(__MODULE__, owner, query, get_url(query))
  end

  def get_url(query) do
    city =
      query.city
      |> Helpers.convert_to_utf("-")
    state = String.upcase(query.state)
    biz =
      query.biz
      |> Helpers.convert_to_utf("-")

    "http://www.whitepages.com/business/" <> state <> "/" <> city <> "/" <> biz
  end

  def parse_data(body) do
    name = parse_item(Floki.find(body, "p[itemprop=name]"))
    address = parse_item(Floki.find(body, "span[itemprop=streetAddress]"))
    city = parse_item(Floki.find(body, "span[itemprop=addressLocality]"))
    state = parse_item(Floki.find(body, "span[itemprop=addressRegion]"))
    zip = parse_item(Floki.find(body, "span[itemprop=postalCode]"))
    phone = parse_item(Floki.find(body, "span[itemprop=telephone]"))
    url = parse_url(Floki.find(body, "span[itemprop=shortId]"))

    add_to_result(List.zip([name, address, city, state, zip, phone, url]))
  end

  def parse_item([]), do: []
  def parse_item([{_, _,[item]} | tail]), do: [String.strip(item) | parse_item(tail)]

  def parse_url([]), do: []
  def parse_url([{_, _,[item]} | tail]), do: ["http://www.whitepages.com/business/#{item}" | parse_url(tail)]

  def add_to_result([]), do: []
  def add_to_result([{name, address, city, state, zip, phone, url} | tail]) do
    [%Result{biz: name, address: address, city: city, state: state, zip: zip, phone: phone, url: url } | add_to_result(tail)]
  end
end
