import { useEffect, useState } from "react";
import { Data } from "../types";
import { searchData } from "../services/search";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";

const DEBOUNCE_TIME = 500

export const Search = ({ initialData }: { initialData: Data }) => {
  const [data, setData] = useState<Data>(initialData);
  // const [search, setSearch] = useState<string>("");
  // Para leer de la url el estado inicial
  const [search, setSearch] = useState<string>(() => {
    const searchParams = new URLSearchParams(window.location.search)
    return searchParams.get('q') ?? ''
  });

  const debouncedSearch = useDebounce(search, DEBOUNCE_TIME)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  // Para cambiar la url
  useEffect(() => {
    const newPathName =
      debouncedSearch === "" ? window.location.pathname : `?q=${debouncedSearch}`;

    // window.history.pushState({}, '', newPathName) // con pushstate tenemos el histori para el back del navegador
    window.history.replaceState({}, "", newPathName); // con este no lo tenemos
  }, [debouncedSearch]);

  useEffect(() => {

    if (!debouncedSearch) {
      setData(initialData)
      return
    }

    searchData(debouncedSearch).then((response) => {
      const [err, newData] = response;
      if (err) {
        toast.error(err.message);
        return;
      }

      if (newData) {
        setData(newData);
      }
    });
  }, [debouncedSearch, initialData]);

  return (
    <div>
      <h1>Search</h1>
      <form action="">
        <input
          type="search"
          onChange={handleChange}
          placeholder="Buscar informacion..."
          defaultValue={search}
        />
      </form>

      <ul>
        {data.map((row) => {
          return(
            <li key={row.id}>
              <article>
                {
                  Object.entries(row)
                    .map(([key, value])=> (
                      <p key={key}>
                        <strong>{key}</strong>
                        {value}
                      </p>
                    ))
                }
              </article>
            </li>
          )
        })}
      </ul>
    </div>
  );
};
