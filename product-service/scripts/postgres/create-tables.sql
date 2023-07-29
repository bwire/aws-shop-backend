CREATE TABLE IF NOT EXISTS products(
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  image TEXT,
  description TEXT,
  price INT
);

CREATE TABLE IF NOT EXISTS stocks(
  product_id UUID,
  count INT,
  CONSTRAINT fk_products
    FOREIGN KEY(product_id) 
    REFERENCES products(id) 
);