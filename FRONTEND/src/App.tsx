import React, { useState } from "react";
import "./App.css";
import { uploadFile } from "./services/upload";
import { Toaster, toast } from "sonner";
import { Data } from "./types";
import { Search } from "./steps/Search";

const APP_STATUS = {
  IDLE: "idle", // Ni bien entremos a la aplicacion
  ERROR: "error", // Cuando haya un error
  READY_UPLOAD: "ready_upload", // Al elegir el archivo
  UPLOADING: "uploading", // Mientras se sube el archivo
  READY_USAGE: "ready_usage", // Despues de subir
} as const;

const BUTTON_TEXT = {
  [APP_STATUS.READY_UPLOAD]: "Subir archivo",
  [APP_STATUS.UPLOADING]: "Subiendo...",
};

type AppStatusType = (typeof APP_STATUS)[keyof typeof APP_STATUS];

function App() {
  const [appStatus, setAppStatus] = useState<AppStatusType>(APP_STATUS.IDLE);
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Data>([]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? [];
    console.log(file);

    if (file) {
      setFile(file);
      setAppStatus(APP_STATUS.READY_UPLOAD);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (appStatus !== APP_STATUS.READY_UPLOAD || !file) {
      return;
    }

    setAppStatus(APP_STATUS.UPLOADING);

    // estilo de golang donde las solicitudes asincronas devuelven una tupla con un error y el dato
    const [err, newData] = await uploadFile(file);
    console.log({ err, newData });
    if (err) {
      setAppStatus(APP_STATUS.ERROR);
      toast.error(err.message);
      return;
    }

    setAppStatus(APP_STATUS.READY_USAGE);
    if (newData) {
      setData(newData);
      toast.success("Archivo subido correctamente");
    }
  };

  const showButton =
    appStatus === APP_STATUS.READY_UPLOAD || appStatus === APP_STATUS.UPLOADING;
  const showInput = appStatus !== APP_STATUS.READY_USAGE;

  return (
    <>
      <Toaster />
      <h2>Challenge : Upload CSV + Search</h2>
      {showInput && (
        <form onSubmit={handleSubmit}>
          <label>
            <input
              disabled={appStatus === APP_STATUS.UPLOADING}
              required
              type="file"
              accept=".csv"
              name="file"
              onChange={handleInputChange}
            />
          </label>
          {showButton && (
            <button disabled={appStatus === APP_STATUS.UPLOADING}>
              {BUTTON_TEXT[appStatus]}
            </button>
          )}
        </form>
      )}

      {
        appStatus === APP_STATUS.READY_USAGE
        &&
        (
          <Search initialData={data} />
        )
      }

    </>
  );
}

export default App;
