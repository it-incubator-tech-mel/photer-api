-- add checks in user model
ALTER TABLE "User"
  ADD CONSTRAINT "check_username_length" CHECK (length(username) >= 3);

ALTER TABLE "User"
  ADD CONSTRAINT "check_password_length" CHECK (length(password) >= 6);
