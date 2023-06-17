DELETE FROM stocks;
DELETE FROM products;
INSERT INTO products (id, title, description, price) 
VALUES 
  ('7567ec4b-b10c-48c5-9345-fc73c48a80aa', 'Refactoring by M. Fowler', 'Improving the Design of Existing Code shed light on the refactoring process, describing the principles and best practices for its implementation.', 2.4),
  ('7567ec4b-b10c-48c5-9345-fc73c48a80a0', 'Pragmatic programmer. The path from apprentice to master. Andrew Hunt, David Thomas', '"Pragmatic programmer. The path from apprentice to master" will tell you everything a person needs to know, starting his way in the field of IT projects. Almost a cult book. You will learn how to deal with software shortcomings, how to create a dynamic, effective and adaptable program, how to form a successful team of programmers.', 10),
  ('7567ec4b-b10c-48c5-9345-fc73c48a80a3', 'Perfect code. Master Class. Steve McConnell', '"Perfect code. Master-class" - an updated edition of the time-tested bestseller. A book that makes you think and helps you create the perfect code. And it does not matter if you are a beginner or a pro, in this publication you will definitely find information for growth and work on your project.', 23),
  ('7567ec4b-b10c-48c5-9345-fc73c48a80a1', 'At the peak. How to maintain maximum efficiency without burnout. Brad Stahlberg, Steve Magness', 'The book "At the peak. How to maintain maximum efficiency without burnout" is especially necessary for programmers who are accustomed to plunge headlong into work, not keeping track of time and waste of resources such as strength and health.', 15),
  ('7567ec4b-b10c-48c5-9345-fc73c48a80a2', 'Programming without fools. Katrin Passig, Johannes Jander', 'This book is interesting to read for both a beginner and an experienced programmer. The authors clearly and humorously talk about the fact that programming is in many ways communication. Programming style, naming, commenting, working with someone else''s code - often agreements develop exactly where there is strict regulation at the programming language level.', 23);

INSERT INTO stocks (product_id, count)
VALUES
  ('7567ec4b-b10c-48c5-9345-fc73c48a80aa', 10),
  ('7567ec4b-b10c-48c5-9345-fc73c48a80a3', 18),
  ('7567ec4b-b10c-48c5-9345-fc73c48a80a1', 3),
  ('7567ec4b-b10c-48c5-9345-fc73c48a80a2', 20)