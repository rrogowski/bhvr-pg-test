import { useMutation, useQuery } from "@tanstack/react-query";
import { hcWithType } from "server/client";
import beaver from "./assets/beaver.svg";
import "./App.css";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

const client = hcWithType(SERVER_URL);

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
    onError: (err) => console.log(err),
  });

  const createUserMutation = useMutation({
    mutationFn: async () => {
      const result = await client.users.$post({
        json: { name: "Bob", age: 24 },
      });
      const json = await result.json();
      console.log(json);
      if (json.success) {
        return json.data;
      } else {
        console.error(json.errors);
      }
    },
    onError: (err) => alert(err),
  });

  console.log(createUserMutation.isSuccess && createUserMutation.data);

  const sandboxQuery = useQuery({
    queryFn: async () => {
      const res = await client.sandbox.$post({ json: { foo: 50 } });
      return await res.json();
    },
    queryKey: ["foo"],
  });

  const doubledQuery = useQuery({
    queryFn: () =>
      client.double[":value"]
        .$get({ param: { value: "300" } })
        .then((r) => r.json()),
    queryKey: [],
  });

  const usersQuery = useQuery({
    queryFn: () => client.users.$get().then((r) => r.json()),
    queryKey: ["users"],
  });

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
      <button onClick={() => createUserMutation.mutate()}>Create Bob</button>
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
        {doubledQuery.isSuccess && (
          <pre className="response">
            <code>Doubled Result: {doubledQuery.data.sum}</code>
          </pre>
        )}
        {usersQuery.isSuccess && (
          <pre className="response">
            <code>
              Users:{" "}
              {usersQuery.data.map((u) => {
                return (
                  <p key={u.name}>
                    {u.name} is {u.age} years old.
                  </p>
                );
              })}{" "}
              <br />
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
