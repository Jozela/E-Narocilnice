```mermaid
%%{init: {'theme': 'neutral', 'themeVariables': {
  'primaryColor': '#ffffff',
  'secondaryColor': '#f5f7fa',
  'tertiaryColor': '#eef2f7',
  'lineColor': '#374151',
  'textColor': '#111827'
}}}%%
flowchart LR
  %% Swimlanes
  subgraph FE[Frontend (UI)]
    FE_open[Odpri veselico]
    FE_get[GET /events/{id}/menu]
    FE_show[Prikaži meni]
    FE_order[POST /orders]
    FE_pay[POST /payments]
    FE_result[Prikaži rezultat]
  end

  subgraph FO[Food Ordering Service]
    FO_menu[Vrni meni]
    FO_calc[Izračun cene]
    FO_save[Shrani naročilo\nstatus = CREATED]
    FO_reply[Vrnitev: orderId, total, status]
    FO_update[Posodobi status\nPAID ali FAILED]
  end

  subgraph PAY[Payment Service]
    PAY_verify[Preveri plačilo\n(gateway)]
    PAY_ok[Potrditev]
    PAY_err[Napaka]
  end

  subgraph DB[(Podatkovna baza)]
    DB_row[Naročilo + status]
  end

  %% Flow
  FE_open --> FE_get --> FO_menu --> FE_show
  FE_show --> FE_order --> FO_calc --> FO_save --> DB_row
  FO_save --> FO_reply --> FE_pay
  FE_pay --> PAY_verify
  PAY_verify -->|Uspeh| FO_update
  PAY_verify -->|Neuspeh| FO_update
  FO_update --> DB_row
  PAY_verify -->|Uspeh| PAY_ok --> FE_result
  PAY_verify -->|Neuspeh| PAY_err --> FE_result
```