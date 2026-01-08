db = db.getSiblingDB("mydb");

db.users.insertOne({
  username: "admin",
  email: "admin@example.com",
  role: "superuser"
});

db.orders.insertOne({
  orderId: "123e4567-e89b-12d3-a456-426614174000",
  orgId: "org-uuid",
  submittedBy: "John Doe"
});
