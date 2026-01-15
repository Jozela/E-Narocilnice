# tests/test.py

import pytest
from server import app, db, User, Order
from datetime import datetime
import json

# -----------------------------
# Pytest fixture for test client
# -----------------------------
@pytest.fixture
def client():
    # Enable testing mode
    app.config['TESTING'] = True

    # Use in-memory SQLite for tests (no connection to RDS)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SESSION_COOKIE_SECURE'] = False
    app.config['SESSION_COOKIE_SAMESITE'] = None

    with app.test_client() as client:
        with app.app_context():
            db.create_all()  # create all tables in memory

            # Optionally add a test user
            test_user = User(username="testuser", password="pbkdf2_sha256$1$test$dummyhash")
            db.session.add(test_user)
            db.session.commit()

        yield client

        # Cleanup
        with app.app_context():
            db.drop_all()


# -----------------------------
# 1. Test index route
# -----------------------------
def test_index(client):
    response = client.get('/')
    assert response.status_code in (200, 404)

# -----------------------------
# 2. Test login with invalid credentials
# -----------------------------
def test_login_invalid_credentials(client):
    response = client.post('/login', json={'username': 'wrong', 'password': 'wrong'})
    assert response.status_code == 401
    data = response.get_json()
    assert data['message'] == "Invalid credentials"

# -----------------------------
# 3. Test logout
# -----------------------------
def test_logout(client):
    response = client.post('/logout')
    assert response.status_code == 200
    data = response.get_json()
    assert data['message'] == "Logged out"

# -----------------------------
# 4. Test check_session when not logged in
# -----------------------------
def test_check_session_not_logged_in(client):
    response = client.get('/check_session')
    assert response.status_code == 401
    data = response.get_json()
    assert data['authenticated'] is False

# -----------------------------
# 5. Test set and get session
# -----------------------------
def test_set_and_get_session(client):
    client.get('/set_session')
    response = client.get('/get_session')
    assert response.data.decode() == 'mihalavric'

# -----------------------------
# 6. Test submit order
# -----------------------------
def test_submit_order(client):
    # First, set a session username
    with client.session_transaction() as sess:
        sess['username'] = 'testuser'

    order_data = {
        "entryDate": "2025-12-01",
        "evidence": "E1",
        "itemDescription": "Test Item",
        "selectionCriteria": "Criteria1",
        "orderType": "Type1",
        "quantity": 5,
        "item": "Item1",
        "me": "pcs"
    }
    response = client.post('/vnos', json=order_data)
    assert response.status_code == 201
    data = response.get_json()
    assert data['message'] == "Order submitted successfully!"

# -----------------------------
# 7. Test get orders (empty DB)
# -----------------------------
def test_get_orders(client):
    with client.session_transaction() as sess:
        sess['username'] = 'testuser'
    response = client.get('/orders')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)

# -----------------------------
# 8. Test update order
# -----------------------------
def test_update_order(client):
    with client.session_transaction() as sess:
        sess['username'] = 'testuser'

    # Create an order inside the app context
    with app.app_context():
        test_order = Order(
            vnasatelj='testuser',
            datum_vnosa=datetime.now(),
            datum_spremembe=datetime.now(),
            opis_narocila="Original Item"
        )
        db.session.add(test_order)
        db.session.commit()
        order_id = test_order.id

    update_data = {"itemDescription": "Updated Item"}
    response = client.put(f'/orders/{order_id}', json=update_data)
    assert response.status_code == 200
    data = response.get_json()
    assert data['opis_narocila'] == "Updated Item"


# -----------------------------
# 9. Test get order not found
# -----------------------------
def test_get_order_not_found(client):
    response = client.get('/orders/999')
    assert response.status_code == 404
    data = response.get_json()
    assert "error" in data

# -----------------------------
# 10. Test PDF generation (without real file)
# -----------------------------
def test_generate_order_pdf(client):
    with client.session_transaction() as sess:
        sess['username'] = 'testuser'

    # Create test order inside app context
    with app.app_context():
        test_order = Order(
            vnasatelj='testuser',
            datum_vnosa=datetime.now(),
            datum_spremembe=datetime.now(),
            opis_narocila="PDF Item",
            dobavitelj_id=None
        )
        db.session.add(test_order)
        db.session.commit()
        order_id = test_order.id

    response = client.get(f'/api/orders-pdf/{order_id}')
    assert response.status_code in (200, 404)
    if response.status_code == 200:
        assert response.mimetype == "application/pdf"

