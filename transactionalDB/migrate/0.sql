create table transactions
(
    id         integer not null
        constraint transactions_pk
            primary key autoincrement,
    timestamp  integer not null,
    database   text    not null,
    operation  text    not null,
    payloadId  integer,
    payloadKey text,
    value      text    not null
);

create unique index transactions_id_uindex
    on transactions (id);

create unique index transactions_timestamp_uindex
    on transactions (timestamp);