from flask import Flask, request, jsonify, session, make_response,send_file, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
import base64
import hashlib
import hmac
from io import BytesIO
#from docx import Document
import sys
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
from reportlab.lib.units import cm
import io

app = Flask(__name__, static_folder='client/build', static_url_path='')

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')
app.secret_key = 'supersecretkey'  # Make sure the secret key is set correctly
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_PERMANENT'] = True  # Keep session non-permanent if you're handling authentication via cookies
app.config['PERMANENT_SESSION_LIFETIME'] = 3600
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SECURE'] = False  # Change to True if using HTTPS
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Prevents some browsers from blocking it

app.config['SQLALCHEMY_DATABASE_URI'] = (
    'postgresql://uacllgann1lh52:pb8fd795174bbd64c4dbe1a3b89bf3916540dd739575da57c098074cd7bf86a9e'
    '@cdbag44qc0vu1j.cluster-czz5s0kz4scl.eu-west-1.rds.amazonaws.com:5432/d7dgl7a350n8u'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#CORS(app)
CORS(app, supports_credentials=True)

db = SQLAlchemy(app)
date_str = '2025-02-19'
date_format = '%Y-%m-%d'  # Adjusted format for just date
parsed_date = datetime.strptime(date_str, date_format)

class User(db.Model):
    __tablename__ = 'auth_user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

    def __init__(self, username, password, is_superuser=False):
        self.username = username
        self.password = password
        self.is_superuser = is_superuser if is_superuser is not None else False

def verify_password_django_pbkdf2(password: str, stored_hash: str) -> bool:
    try:
        parts = stored_hash.split('$')
        if len(parts) != 4 or parts[0] != "pbkdf2_sha256":
            return False
        iteration_count = int(parts[1])
        salt = parts[2].encode('utf-8')
        stored_password_hash = base64.b64decode(parts[3])
        generated_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, iteration_count, dklen=len(stored_password_hash))
        return hmac.compare_digest(stored_password_hash, generated_hash)
    except Exception as e:
        print(f"Error during verification: {e}")
        return False

# Login route
@app.route('/login', methods=['POST'])
@cross_origin(origins="https://clever-dasik-75eefa.netlify.app", supports_credentials=True)
def login():
    data = request.get_json()  # Ensure it's a JSON request
    username = data.get('username')
    password = data.get('password')

    # Check if the user exists and password is correct
    user = User.query.filter_by(username=username).first()
    print("username vppisa", username)
    session['username'] = username

    if user and verify_password_django_pbkdf2(password, user.password):  # Replace with actual password check function
        # Store username in session directly
        session['username'] = username
        session.permanent = True

        print(f"Session after login: {session}")  # Debugging

        # Send a response that includes session cookie
        response = make_response(jsonify({"message": "Login successful"}))
        response.set_cookie('session', session.get('username'), httponly=True, samesite='Lax')
        return response, 200

    else:
        return jsonify({"message": "Invalid credentials"}), 401

# Logout route
@app.route('/logout', methods=['POST', 'GET'])
@cross_origin(origins="https://clever-dasik-75eefa.netlify.app", supports_credentials=True)
def logout():
    session.clear()
    session.pop('username', None)  # Clear username from session
    return jsonify({"message": "Logged out"}), 200

# Check if user is logged in (based on session)
@app.route('/check_session', methods=['GET'])
def check_session():
    if 'username' in session:
        return jsonify({"authenticated": True, "username": session['username']}), 200
    return jsonify({"authenticated": False}), 401

@app.route("/orders/<int:order_id>", methods=["GET"])
def get_order(order_id):
    order = Order.query.get(order_id)
    if order:
        return jsonify(order.to_dict())
    return jsonify({"error": "Order not found"}), 404

@app.route('/orders/<int:order_id>', methods=['PUT'])
def update_order(order_id):
    try:
        # Get JSON data from the request
        order_data = request.get_json()

        # Fetch the order by its ID
        order = Order.query.get(order_id)
        
        if order is None:
            return jsonify({"error": "Order not found"}), 404
        print("orderrrrrrrrr",order_data)
        # Update order fields with values from the request
        order.cena_brez_DDV = order_data.get('cena_brez_DDV', order.cena_brez_DDV)
        order.datum_spremembe = order_data.get('datum_spremembe', order.datum_spremembe)
        order.datum_vnosa = order_data.get('datum_vnosa', order.datum_vnosa)
        order.dobavitelj_id = order_data.get('dobavitelj_id', order.dobavitelj_id)
        order.opis_narocila = order_data.get('itemDescription', order.opis_narocila)
        order.opombe = order_data.get('remarks', order.opis_narocila)
        # Commit the changes to the database
        db.session.commit()

        # Return the updated order
        return jsonify({
            "id": order.id,
            "cena_brez_DDV": order.cena_brez_DDV,
            "datum_spremembe": order.datum_spremembe,
            "datum_vnosa": order.datum_vnosa,
            "dobavitelj_id": order.dobavitelj_id,
            "opis_narocila": order.opis_narocila
        }), 200

    except Exception as e:
        # Log error for debugging
        print(f"Error updating order: {str(e)}")
        # Return error message
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500


# Route to get orders (without Flask-Login)
@app.route('/orders', methods=['GET'])
@cross_origin(origins="https://clever-dasik-75eefa.netlify.app", supports_credentials=True)
def get_orders():
    year = request.args.get('year')  # Get 'year' from query params
    order_type = request.args.get('type')
    print(session.get('username', 'No session data'))
    if 'username' not in session:
        return jsonify({"message": "Not logged in"} + {session['username']}), 401
    current_user_username = session['username']
    #user_orders = Order.query.filter_by(vnasatelj=current_user_username).all()
    #user_orders = Order.query.filter_by(vnasatelj=current_user_username).all() 
    
    if year:
            user_orders = (
        db.session.query(Order, Dobavitelj)
        .join(Dobavitelj, Order.dobavitelj_id == Dobavitelj.id)
        .filter(Order.vnasatelj == current_user_username)
        .filter(Order.datum_vnosa == year)
        .all()
    )
    
    if order_type:
            user_orders = (
        db.session.query(Order, Dobavitelj)
        .join(Dobavitelj, Order.dobavitelj_id == Dobavitelj.id)
        .filter(Order.vnasatelj == current_user_username)
        .filter(Order.evidencno_narocilo == order_type)
        .all())



    else:
            user_orders = (
        db.session.query(Order, Dobavitelj)
        .join(Dobavitelj, Order.dobavitelj_id == Dobavitelj.id)
        .filter(Order.vnasatelj == current_user_username)
        .all()
    )
    

    print(f"User orders: {user_orders}")
    orders_list = [
        {
            "id": order.id,
            "datumVnosa": order.datum_vnosa.strftime('%Y-%m-%d %H:%M:%S'),  # Convert datetime to string
            "opisNarocila": order.opis_narocila,
            "status": order.status,
            "opombe": order.opombe,
            "naslov": dobavitelj.ulica,
            "dobaviteljNaziv": dobavitelj.naziv
        }
        for order, dobavitelj in user_orders
    ]
    print(f"Orders list: {orders_list}")
    
    return jsonify(orders_list)

# Example route to export orders to Word
# @app.route('/api/documents/orders-word', methods=['GET'])
# def export_orders_to_word():
#     if 'username' not in session:
#         return jsonify({"message": "Not logged in"}), 401

#     current_user_username = session['username']
#     user_orders = NarocilniceNarocilnica.query.filter_by(vnasatelj=current_user_username).all()

#     doc = Document()
#     doc.add_heading('Orders Report', 0)
#     for order in user_orders:
#         doc.add_paragraph(f"Order ID: {order.id} | Date: {order.datum_vnosa} | Supplier: {order.opis_narocila}")
    
#     byte_io = BytesIO()
#     doc.save(byte_io)
#     byte_io.seek(0)
#     return send_file(byte_io, as_attachment=True, download_name="orders.docx", mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
class Order(db.Model):
    __tablename__ = 'narocilnice_narocilnica'
    
    # Primary key
    id = db.Column(db.Integer, primary_key=True)
    
    # Other fields with correct names as per Blazor model
    vnasatelj = db.Column(db.String(255), nullable=True)  # Corresponds to 'Vnasatelj'
    datum_vnosa = db.Column(db.DateTime, nullable=False)  # Corresponds to 'DatumVnosa'
    datum_spremembe = db.Column(db.DateTime, nullable=True)  # Corresponds to 'DatumSpremembe'
    evidencno_narocilo = db.Column(db.String(255), nullable=True)  # Corresponds to 'EvidencnoNarocilo'
    stevilka_predracuna = db.Column(db.String(255), nullable=True)  # Corresponds to 'StevilkaPredracuna'
    stevilka_izbire = db.Column(db.String(255), nullable=True)  # Corresponds to 'StevilkaIzbire'
    opis_narocila = db.Column(db.String(255), nullable=True)  # Corresponds to 'OpisNarocila'
    opombe = db.Column(db.Text, nullable=True)  # Corresponds to 'Opombe'
    merilo_izbire = db.Column(db.String(255), nullable=True)  # Corresponds to 'MeriloIzbire'
    status = db.Column(db.String(50), nullable=True)  # Corresponds to 'Status'
    odobril = db.Column(db.String(255), nullable=True)  # Corresponds to 'Odobril'
    dobavitelj_id = db.Column(db.Integer, nullable=True)  # Corresponds to 'DobaviteljId'
    organizacija_id = db.Column(db.Integer, nullable=True)  # Corresponds to 'OrganizacijaId'
    vrsta_narocila = db.Column(db.String(255), nullable=True)  # Corresponds to 'VrstaNarocila'
    kolicina = db.Column(db.Integer, nullable=True)  # Corresponds to 'Kolicina'
    narocilo = db.Column(db.String(255), nullable=True)  # Corresponds to 'Narocilo'
    merska_enota = db.Column(db.String(50), nullable=True)  # Corresponds to 'MerskaEnota'
    zaporedna_stevilka = db.Column(db.String(255), nullable=True) 
    cena_brez_DDV = db.Column(db.String(255), nullable=True) 
    skupna_cena = db.Column(db.Float, nullable=True)  # Corresponds to 'SkupnaCena'
    zaporedna_stevilka_2018 = db.Column(db.String(255), nullable=True)  # Corresponds to 'ZaporednaStevilka2018'
    zaporedna_stevilka_2019 = db.Column(db.String(255), nullable=True)  # Corresponds to 'ZaporednaStevilka2019'
    zaporedna_stevilka_2020 = db.Column(db.String(255), nullable=True)  # Corresponds to 'ZaporednaStevilka2020'
    zaporedna_stevilka_2021 = db.Column(db.String(255), nullable=True)  # Corresponds to 'ZaporednaStevilka2021'
    zaporedna_stevilka_2022 = db.Column(db.String(255), nullable=True)  # Corresponds to 'ZaporednaStevilka2022'
    zaporedna_stevilka_2024 = db.Column(db.String(255), nullable=True)  # Corresponds to 'ZaporednaStevilka2024'
    zaporedna_stevilka_2023 = db.Column(db.String(255), nullable=True)  # Corresponds to 'ZaporednaStevilka2023'

    def to_dict(self):
        """Convert the Order object to a dictionary."""
        return {
            'id': self.id,
            'vnasatelj': self.vnasatelj,
            'datum_vnosa': self.datum_vnosa,
            'datum_spremembe': self.datum_spremembe,
            'evidencno_narocilo': self.evidencno_narocilo,
            'stevilka_predracuna': self.stevilka_predracuna,
            'stevilka_izbire': self.stevilka_izbire,
            'opis_narocila': self.opis_narocila,
            'opombe': self.opombe,
            'merilo_izbire': self.merilo_izbire,
            'status': self.status,
            'odobril': self.odobril,
            'dobavitelj_id': self.dobavitelj_id,
            'organizacija_id': self.organizacija_id,
            'vrsta_narocila': self.vrsta_narocila,
            'kolicina': self.kolicina,
            'narocilo': self.narocilo,
            'merska_enota': self.merska_enota,
            'zaporedna_stevilka': self.zaporedna_stevilka,
            'cena_brez_DDV': self.cena_brez_DDV,
            'skupna_cena': self.skupna_cena,
            'zaporedna_stevilka_2018': self.zaporedna_stevilka_2018,
            'zaporedna_stevilka_2019': self.zaporedna_stevilka_2019,
            'zaporedna_stevilka_2020': self.zaporedna_stevilka_2020,
            'zaporedna_stevilka_2021': self.zaporedna_stevilka_2021,
            'zaporedna_stevilka_2022': self.zaporedna_stevilka_2022,
            'zaporedna_stevilka_2024': self.zaporedna_stevilka_2024,
            'zaporedna_stevilka_2023': self.zaporedna_stevilka_2023
        }



class Dobavitelj(db.Model):
    __tablename__ = 'narocilnice_dobavitelj'  # Update to the correct table name
    id = db.Column(db.Integer, primary_key=True)
    naziv = db.Column(db.String(255), nullable=False)
    ulica = db.Column(db.String(255)) 
    postna_stevilka = db.Column(db.String(255)) 
    maticna = db.Column(db.String(255)) 

suppliers = [
    {"id": 1, "name": "Supplier 1"},
    {"id": 2, "name": "Supplier 2"},
    {"id": 3, "name": "Supplier 3"},
]
@app.route('/api/orders-pdf/<int:order_id>', methods=['GET'])
def generate_order_pdf(order_id):
    order = Order.query.get(order_id)
    dobavitelj = Dobavitelj.query.get(order.dobavitelj_id)
    if order.id != order_id:
        return jsonify({"error": "Order not found"}), 404

    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    pdfmetrics.registerFont(TTFont("DejaVuSans", "DejaVuSans.ttf"))
    pdf.setFont("DejaVuSans", 10)
    # Naslovna vrstica
    pdf.setFillColor(colors.black)
    pdf.setFont("Helvetica-Bold", 16)
    pdf.rect(0, height - 50, width, 30, fill=1)
    pdf.setFillColor(colors.white)
    pdf.drawString(250, height - 40, "N A R O Č I L N I C A")

    pdf.setFillColor(colors.black)
    pdf.setFont("Helvetica", 10)

    # Podatki o naročniku
    # pdf.drawString(40, height - 80, "Test")
    # pdf.drawString(40, height - 95, "Test 1")
    # pdf.drawString(40, height - 110, "1111 Test")
    # pdf.drawString(40, height - 125, "tel:")
    # pdf.drawString(40, height - 140, "E-mail:")

    # Dobavitelj podatki
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(40, height - 170, dobavitelj.naziv)
    pdf.setFont("Helvetica", 10)
    pdf.drawString(40, height - 185, f"{dobavitelj.postna_stevilka}")
    pdf.drawString(40, height - 200, f"{dobavitelj.ulica}")
    pdf.drawString(40, height - 215, f"Matična: {dobavitelj.maticna}")

    # Podatki o naročilu
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(width - 180, height - 190, "Številka naročilnice")
    pdf.drawString(width - 180, height - 210, "Datum")
    pdf.drawString(width - 180, height - 230, "Kraj")
    order_date = order.datum_vnosa.strftime("%d.%m.%Y") if order.datum_vnosa else "N/A"
    pdf.setFont("Helvetica", 10)
    pdf.drawString(width - 60, height - 190, f"{order.id}")
    pdf.drawString(width - 60, height - 210, f"{order_date}")
    #pdf.drawString(width - 60, height - 230, f"{order.kraj}")

    # Tabela naročila
    table_data = [
        ["Zap. št.", "Naziv", "Količina", "M.E.", "Cena", "Vrednost"],
        [1, order.opis_narocila, order.kolicina, order.merska_enota, f"{order.cena_brez_DDV:.2f}", "-"]
    ]

    table = Table(table_data, colWidths=[2 * cm, 6 * cm, 2.5 * cm, 2.5 * cm, 3 * cm, 3 * cm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.black),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 5),
        ("BACKGROUND", (0, 1), (-1, -1), colors.white),
    ]))

    table.wrapOn(pdf, width, height)
    table.drawOn(pdf, 40, height - 350)

    # Opombe
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(40, height - 380, "Opombe:")
    pdf.setFont("Helvetica", 10)
    pdf.drawString(100, height - 380, order.opombe)

    # Skupna vrednost
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(width - 180, height - 410, "Skupaj:")
    pdf.drawString(width - 180, height - 430, "Vrednost naročila v EUR brez DDV:")

    pdf.setFont("Helvetica", 10)
    pdf.drawString(width - 60, height - 410, "-")
    pdf.drawString(width - 60, height - 430, "-")

    # Obvezna e-račun izdaja
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(40, height - 470, "Obvezna izdaja e-računa!")
    pdf.setFont("Helvetica", 10)
    pdf.drawString(40, height - 485, "Na računu obvezno navedite številko naročilnice!")

    # Podpis in rok plačila
    pdf.drawString(40, height - 510, f"Naročilo pripravil-a: {order.vnasatelj}")
    pdf.drawString(40, height - 525, "Rok plačila 30 dni")

    pdf.save()
    buffer.seek(0)

    return send_file(buffer, mimetype="application/pdf", as_attachment=True, download_name=f"Narocilnica_{order_id}.pdf")

# @app.route('/api/orders-pdf/<int:order_id>', methods=['GET'])
# def generate_order_pdf(order_id):
#     order = Order.query.get(order_id)
#     order_dict = order.__dict__
#     if not order:
#         return jsonify({"error": "Order not found"}), 404
#     dobavitelj = Dobavitelj.query.get(order.dobavitelj_id)

#     buffer = io.BytesIO()
#     pdf = canvas.Canvas(buffer, pagesize=A4)
    
#     pdf.setFont("Helvetica-Bold", 14)
#     pdf.drawString(200, 800, "NAROČILNICA")
    
#     pdf.setFont("Helvetica", 12)
#     pdf.drawString(50, 750, f"Dobavitelj: {dobavitelj.naziv}")
#     pdf.drawString(50, 730, f"Opis: {order_dict['opis_narocila']}")
#     pdf.drawString(50, 710, f"Količina: {order_dict['kolicina']} {order_dict['merska_enota']}")
#     pdf.drawString(50, 690, f"Cena: {order_dict['cena_brez_DDV']} EUR")

#     pdf.save()
#     buffer.seek(0)
    
#     return send_file(buffer, mimetype='application/pdf', as_attachment=True, download_name=f"Order_{order_id}.pdf")

@app.route('/suppliers', methods=['GET'])
def get_suppliers():
    return jsonify(suppliers)
# def get_suppliers():
#     suppliers = Supplier.query.all()
#     return jsonify([{'id': s.id, 'name': s.naziv} for s in suppliers])

@app.route('/vnos', methods=['POST'])
def submit_order():
    data = request.json
    try:
        new_order = Order(
            vnasatelj=session['username'],  # Corresponds to 'Vnasatelj'
            datum_vnosa=datetime.strptime(data['entryDate'], '%Y-%m-%d'),  # Corresponds to 'DatumVnosa'
            datum_spremembe=datetime.strptime(data['entryDate'], '%Y-%m-%d'),  # Corresponds to 'DatumSpremembe' (if available)
            evidencno_narocilo=data['evidence'],  # Corresponds to 'EvidencnoNarocilo'
            stevilka_predracuna=data.get('invoiceNumber', None),  # Corresponds to 'StevilkaPredracuna'
            stevilka_izbire=data.get('selectNumber', None),  # Corresponds to 'StevilkaIzbire'
            opis_narocila=data['itemDescription'],  # Corresponds to 'OpisNarocila'
            opombe=data.get('remarks', None),  # Corresponds to 'Opombe'
            merilo_izbire=data['selectionCriteria'],  # Corresponds to 'MeriloIzbire'
            status="aktivna",  # Corresponds to 'Status'
            odobril=data.get('approval', None),  # Corresponds to 'Odobril'
            dobavitelj_id=1900,  # Corresponds to 'DobaviteljId'
            organizacija_id=1,  # Corresponds to 'OrganizacijaId'
            vrsta_narocila=data['orderType'],  # Corresponds to 'VrstaNarocila'
            kolicina=data['quantity'],  # Corresponds to 'Kolicina'
            narocilo=data['item'],  # Corresponds to 'Narocilo'
            merska_enota=data['me'],  # Corresponds to 'MerskaEnota'
            zaporedna_stevilka=data.get('serialNumber', None),  # Corresponds to 'ZaporednaStevilka'
            skupna_cena=data.get('totalPrice', None),
            cena_brez_DDV = data.get('priceWithoutTax', None)
        )
        db.session.add(new_order)
        db.session.commit()
        return jsonify({'message': 'Order submitted successfully!'}), 201
    except Exception as e:
        print(data)
        import traceback
        print("Error Traceback:", traceback.format_exc())
        return jsonify({'error': str(e)}), 400

@app.route('/set_session')
def set_session():
    session['username'] = 'mihalavric'
    print(f"Session after setting: {session}")  # Debugging
    return "Session set!"


@app.route('/get_session')
def get_session():
    print(session['username'])
    return session.get('username', 'No session data')

# Model for orders (no changes)
# class NarocilniceNarocilnica(db.Model):
#     __tablename__ = 'narocilnice_narocilnica'
#     id = db.Column(db.Integer, primary_key=True)
#     datum_vnosa = db.Column(db.String(50), nullable=False)
#     opis_narocila = db.Column(db.String(255), nullable=False)
#     status = db.Column(db.String(50), default='Active')
#     vnasatelj = db.Column(db.String(150), nullable=False)  # This is the username field

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
