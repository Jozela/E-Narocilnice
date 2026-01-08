-- Table: auth_user
CREATE TABLE auth_user (
    id BIGINT PRIMARY KEY DEFAULT unique_rowid(),
    username VARCHAR NOT NULL,
    password VARCHAR NOT NULL,
    is_superuser BOOLEAN,
    email VARCHAR
);

-- Table: narocilnica
CREATE TABLE narocilnica (
    id UUID PRIMARY KEY,
    organizacija_id UUID,
    vnasatelj VARCHAR,
    datum_vnosa TIMESTAMP,
    datum_spremembe TIMESTAMP,
    dobavitelj_id UUID,
    zaporedna_stevilka VARCHAR,
    vrsta_narocila VARCHAR,
    evidencno_narocilo VARCHAR,
    opis_narocila VARCHAR,
    narocilo VARCHAR,
    stevilka_predracuna VARCHAR,
    stevilka_izbire VARCHAR,
    cena_brez_DDV NUMERIC,
    skupna_cena NUMERIC,
    kolicina BIGINT,
    opombe VARCHAR,
    merilo_izbire VARCHAR,
    merska_enota VARCHAR,
    status VARCHAR,
    odobril VARCHAR
);

-- Table: narocilnice_dobavitelj
CREATE TABLE narocilnice_dobavitelj (
    id UUID PRIMARY KEY,
    naziv VARCHAR NOT NULL,
    maticna VARCHAR NOT NULL,
    oblika VARCHAR NOT NULL,
    organ VARCHAR,
    upravna_enota VARCHAR,
    regija VARCHAR,
    obcina VARCHAR,
    posta VARCHAR,
    naselje VARCHAR,
    ulica VARCHAR,
    postna_stevilka VARCHAR,
    hisna_stevilka VARCHAR,
    email VARCHAR
);

-- Table: narocilnice_narocilnica
CREATE TABLE narocilnice_narocilnica (
    id UUID PRIMARY KEY,
    vnasatelj VARCHAR,
    datum_vnosa TIMESTAMP NOT NULL,
    datum_spremembe TIMESTAMP,
    evidencno_narocilo VARCHAR,
    stevilka_predracuna VARCHAR,
    stevilka_izbire VARCHAR,
    opis_narocila VARCHAR,
    opombe TEXT,
    merilo_izbire VARCHAR,
    status VARCHAR,
    odobril VARCHAR,
    dobavitelj_id UUID,
    organizacija_id BIGINT,
    vrsta_narocila VARCHAR,
    kolicina BIGINT,
    narocilo VARCHAR,
    merska_enota VARCHAR,
    zaporedna_stevilka VARCHAR,
    cena_brez_DDV VARCHAR,
    skupna_cena DOUBLE PRECISION
);

-- Table: organizacija
CREATE TABLE organizacija (
    id UUID PRIMARY KEY,
    naziv VARCHAR NOT NULL,
    ulica VARCHAR,
    kraj VARCHAR,
    posta VARCHAR,
    hisna_stevilka VARCHAR,
    davcna_stevilka VARCHAR,
    email VARCHAR,
    telefon VARCHAR,
    stevec_narocilnic BIGINT,
    stevec_narocilnic_2018 BIGINT,
    stevec_narocilnic_2019 BIGINT,
    stevec_narocilnic_2020 BIGINT,
    stevec_narocilnic_2021 BIGINT,
    stevec_narocilnic_2022 BIGINT,
    stevec_narocilnic_2023 BIGINT,
    stevec_narocilnic_2024 BIGINT,
    stevec_narocilnic_2025 BIGINT
);

-- Table: organizacija_dobavitelj
CREATE TABLE organizacija_dobavitelj (
    organizacija_id UUID NOT NULL,
    dobavitelj_id UUID NOT NULL,
    PRIMARY KEY (organizacija_id, dobavitelj_id)
);

-- Table: organizacija_user
CREATE TABLE organizacija_user (
    organizacija_id UUID NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (organizacija_id, user_id)
);

-- Table: storitev_blago
CREATE TABLE storitev_blago (
    id UUID PRIMARY KEY,
    dobavitelj_id UUID,
    blago_storitev VARCHAR,
    vrsta_narocila VARCHAR
);
