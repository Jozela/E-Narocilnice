import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from sqlalchemy import text

import sys
import os
from datetime import datetime
from flask import Flask, session
import unittest
from server import app, db, User, Order, Dobavitelj

class FlaskAppTestCase(unittest.TestCase):

    def setUp(self):
        # Set up the application context
        #dobavitelj = Dobavitelj(id=8168, name="Test Supplier")  # Example supplier
        #db.session.add(dobavitelj)
        self.app = app
        self.app_context = self.app.app_context()
        self.app_context.push()

        # Set up the database
        db.create_all()

        # Ensure the user exists, create one if not
        self.existing_user = User.query.filter_by(username='mihalavric').first()
        if not self.existing_user:
            self.user = User(
                username='mihalavric',
                password='narocilnice2017!',
                is_superuser=False,
                last_login=datetime.utcnow(),
                is_staff=False,
                is_active=True,
                date_joined=datetime.utcnow()
            )
            db.session.add(self.user)
            db.session.commit()
        else:
            self.user = self.existing_user

        # Set up the session with the user
        with self.app.test_client() as c:
            with c.session_transaction() as sess:
                sess['user_id'] = self.user.id


    # def tearDown(self):
    #     # Disable foreign key checks if necessary (PostgreSQL example)
    #     db.session.execute(text('SET CONSTRAINTS ALL DEFERRED'))  # PostgreSQL specific (optional)

    #     # Perform the delete operations before committing the session
    #     db.session.execute(text('DELETE FROM narocilnice_narocilnica'))
    #     db.session.execute(text('DELETE FROM narocilnice_dobavitelj'))

    #     db.session.commit()  # Commit changes after executing the SQL statements

    #     db.session.remove()
    #     db.drop_all()  # Drop tables after committing


    def test_check_session_logged_in(self):
        with self.app.test_client() as client:
            with client.session_transaction() as session:
                session['user_id'] = self.user.id
            response = client.get('/check-session')
            self.assertEqual(response.status_code, 200)
            self.assertIn(b"Logged in", response.data)

    def test_check_session_not_logged_in(self):
        with self.app.test_client() as client:
            response = client.get('/check-session')
            self.assertEqual(response.status_code, 200)
            self.assertIn(b"Not logged in", response.data)

    def test_generate_order_pdf(self):
        with self.app.test_client() as client:
            order = Order(user=self.user, product="Test Product", quantity=2)
            db.session.add(order)
            db.session.commit()

            response = client.get(f'/generate-pdf/{order.id}')
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.content_type, 'application/pdf')

    def test_get_orders(self):
        with self.app.test_client() as client:
            with client.session_transaction() as session:
                session['user_id'] = self.user.id
            response = client.get('/orders')
            self.assertEqual(response.status_code, 200)
            self.assertIn(b"Order List", response.data)

    def test_login_invalid_credentials(self):
        with self.app.test_client() as client:
            response = client.post('/login', data={'username': 'wronguser', 'password': 'wrongpass'}, content_type='application/x-www-form-urlencoded')
            self.assertEqual(response.status_code, 200)
            self.assertIn(b"Invalid credentials", response.data)

    def test_login_success(self):
        with self.app.test_client() as client:
            response = client.post('/login', data={'username': self.user.username, 'password': 'testpassword'}, content_type='application/x-www-form-urlencoded')
            self.assertEqual(response.status_code, 200)
            self.assertIn(b"Welcome", response.data)

    def test_logout(self):
        with self.app.test_client() as client:
            with client.session_transaction() as session:
                session['user_id'] = self.user.id
            response = client.get('/logout')
            self.assertEqual(response.status_code, 200)
            self.assertIn(b"Logged out", response.data)

    def test_create_order(self):
        order = Order(
            vnasatelj="Test Vnasatelj",  # Example of the 'Vnasatelj' field
            datum_vnosa=datetime.now(),  # 'DatumVnosa' - DateTime field
            datum_spremembe=datetime.now(),  # 'DatumSpremembe' - DateTime field
            evidencno_narocilo="Testoclo",  # 'EvidencnoNarocilo' - String field
            stevilka_predracuna="Preun",  # 'StevilkaPredracuna' - String field
            stevilka_izbire="1",  # 'StevilkaIzbire' - String field
            opis_narocila="Testcn",  # 'OpisNarocila' - String field
            opombe="Soments",  # 'Opombe' - Text field
            merilo_izbire="Critia",  # 'MeriloIzbire' - String field
            status="Pending",  # 'Status' - String field
            odobril="Teser",  # 'Odobril' - String field
            dobavitelj_id=8168,  # 'DobaviteljId' - Integer field
            organizacija_id=1,  # 'OrganizacijaId' - Integer field
            vrsta_narocila="Proder",  # 'VrstaNarocila' - String field
            kolicina=10,  # 'Kolicina' - Integer field
            narocilo="Test Or",  # 'Narocilo' - String field
            merska_enota="pcs",  # 'MerskaEnota' - String field
            zaporedna_stevilka="SN123",  # 'ZaporednaStevilka' - String field
            cena_brez_DDV="100.00",  # 'CenaBrezDDV' - String field
            skupna_cena=120.00,  # 'SkupnaCena' - Float field
        )
        
        db.session.add(order)
        db.session.commit()
        
        # Assert the order was created and has an id
        self.assertIsNotNone(order.id)
        self.assertEqual(order.vnasatelj, "Test Vnasatelj")
        self.assertEqual(order.status, "Pending")
        self.assertEqual(order.kolicina, 10)

if __name__ == '__main__':
    unittest.main()
