"use client";

import { useState } from "react";
import s from "./ajuda.module.css";

type Estado = "pronto" | "pedindo" | "enviado" | "negado" | "erro";

/** Só envia se a pessoa tocar no botão e o navegador permitir. Uma vez, e acabou. */
export function EnviarLocalizacao({ token }: { token: string }) {
  const [estado, setEstado] = useState<Estado>("pronto");

  function enviar() {
    if (!("geolocation" in navigator)) {
      setEstado("erro");
      return;
    }
    setEstado("pedindo");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const r = await fetch("/api/public/omniband/localizacao", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ token, lat: pos.coords.latitude, lng: pos.coords.longitude, precisao: pos.coords.accuracy }),
          });
          setEstado(r.ok ? "enviado" : "erro");
        } catch {
          setEstado("erro");
        }
      },
      () => setEstado("negado"),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }

  if (estado === "enviado") {
    return <p className={s.aviso} role="status">Localização enviada. Obrigado por ficar por perto.</p>;
  }
  return (
    <>
      <button type="button" className={s.botaoSecundario} onClick={enviar} disabled={estado === "pedindo"}>
        {estado === "pedindo" ? "Enviando…" : "Enviar minha localização à família"}
      </button>
      {estado === "negado" ? <p className={s.aviso} role="status">Sem permissão de localização. Tudo bem: ligue para a família, se puder.</p> : null}
      {estado === "erro" ? <p className={s.aviso} role="status">Não deu para enviar agora. Ligue para a família, se puder.</p> : null}
    </>
  );
}
