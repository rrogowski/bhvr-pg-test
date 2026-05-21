import { useMutation, useQuery } from "@tanstack/react-query";
import { hcWithType } from "server/client";
import beaver from "./assets/beaver.svg";
import "./App.css";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

const client = hcWithType(SERVER_URL);

type ResponseType = Awaited<ReturnType<typeof client.hello.$get>>;

function App() {
  const apiRequestMutation = useMutation({
    mutationFn: async () => {
      const res = await client.hello.$get();
      if (!res.ok) {
        throw new Error("Error fetching data");
      }
      const data = await res.json();
      return data;
    },
    onError: (err: any) => console.log(err),
  });

  const sandboxQuery = useQuery({
    queryFn: async () => {
      const res = await client.sandbox.$post({ json: { foo: 50 } });
      return await res.json();
    },
    queryKey: ["foo"],
  });

  console.log(sandboxQuery);

  return (
    <>
      <div>
        <a
          href="https://github.com/stevedylandev/bhvr"
          target="_blank"
          rel="noopener"
        >
          <img src={beaver} className="logo" alt="beaver logo" />
        </a>
      </div>
      <h1>bhvr</h1>
      <h2>Bun + Hono + Vite + React</h2>
      <p>A typesafe fullstack monorepo</p>
      <div className="card">
        <div className="button-container">
          <button type="button" onClick={() => apiRequestMutation.mutate()}>
            Call API
          </button>
          <a
            className="docs-link"
            target="_blank"
            href="https://bhvr.dev"
            rel="noopener"
          >
            Docs
          </a>
        </div>
        {sandboxQuery.isSuccess && sandboxQuery.data.success && (
          <pre className="response">
            <code>
              Success: {sandboxQuery.data.success.toString()} <br />
              Doubled: {sandboxQuery.data.doubled}
            </code>
          </pre>
        )}
        {sandboxQuery.isSuccess &&
          !sandboxQuery.data.success &&
          sandboxQuery.data.error && (
            <pre className="response">
              <code>
                Error: {sandboxQuery.data.error.message} <br />
              </code>
            </pre>
          )}
        {apiRequestMutation.isSuccess && (
          <pre className="response">
            <code>
              Message: {apiRequestMutation.data.message} <br />
              Success: {apiRequestMutation.data.success.toString()}
            </code>
          </pre>
        )}
      </div>
    </>
  );
}

export default App;
