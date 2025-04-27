// Create admin user
db.createUser({
  user: "mongo",
  pwd: "mongo",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" },
    { role: "dbAdminAnyDatabase", db: "admin" }
  ]
});

// Create application users for specific databases
db = db.getSiblingDB('chat_db');
db.createUser({
  user: "chat_user",
  pwd: "chat_password",
  roles: [
    { role: "readWrite", db: "chat_db" }
  ]
});

db = db.getSiblingDB('notification_db');
db.createUser({
  user: "notification_user",
  pwd: "notification_password",
  roles: [
    { role: "readWrite", db: "notification_db" }
  ]
});
