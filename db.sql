-- PostgreSQL schema
CREATE TABLE items (
id SERIAL PRIMARY KEY,
kind VARCHAR(10) NOT NULL CHECK (kind IN ('found','lost')),
item_type VARCHAR(50) NOT NULL,
item_name VARCHAR(255) NOT NULL,
item_number VARCHAR(255), -- store only if necessary; consider redacting
place VARCHAR(255) NOT NULL,
photo_path VARCHAR(512),
poster_name VARCHAR(255) NOT NULL,
poster_phone VARCHAR(32) NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


CREATE INDEX idx_items_kind ON items(kind);
CREATE INDEX idx_items_item_number ON items(item_number);