defmodule Locorum.SearchChannel do
  use Locorum.Web, :channel

  def join("searches:" <> search_id, _params, socket) do
    :timer.send_interval(5_000, :ping)
    {:ok, assign(socket, :search_id, String.to_integer(search_id))}
  end

  def handle_info(:ping, socket) do
    count = socket.assigns[:count] || 1
    push socket, "ping", %{count: count}

    {:noreply, assign(socket, :count, count + 1)}
  end
end
