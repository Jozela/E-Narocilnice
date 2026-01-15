import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function OrderEdit() {
  const { orderId } = useParams();
  console.log(orderId); 

  const [order, setOrder] = useState(null);
  const [formData, setFormData] = useState({
    supplier: "",
    evidence: "",
    orderType: "",
    entryDate: "",
    invoiceNumber: "",
    selectNumber: "",
    quantity: "",
    priceWithoutTax: "",
    itemDescription: "",
    remarks: "",
    acceptConditions: false,
    selectionCriteria: "",
    otherCriteria: "",
    opis_narocila: "",
    opombe: ""
  });

  useEffect(() => {
    axios
      .get(`http://localhost:5000/orders/${orderId}`)
      .then((response) => {
        console.log(response.data);
        const data = response.data;
        setOrder(data);
        setFormData({
            supplier: data.dobavitelj_id || "", 
            evidence: data.evidencno_narocilo || "",
            orderType: data.vrsta_narocila || "",
            entryDate: data.datum_vnosa || "",
            invoiceNumber: data.stevilka_predracuna || "",
            selectNumber: data.stevilka_izbire || "",
            quantity: data.kolicina || "",
            priceWithoutTax: data.cena_brez_DDV || "",
            itemDescription: data.opis_narocila || "",
            remarks: data.opombe || "",
            acceptConditions: data.status === "aktivna" || false, 
            selectionCriteria: data.merilo_izbire || "",
            otherCriteria: data.zaporedna_stevilka || "",
            opis_narocila: data.opis_narocila || "",
            opombe: data.opombe || "" 
          });
      })
      .catch((error) => console.error("Error fetching order:", error));
  }, [orderId]);
  

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/orders/${orderId}`, formData);
      window.location.href = "/orders"; 
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  if (!order) return <p>Loading...</p>;

  return (
    <div className="container mt-5 p-4 bg-light">
      <h3>Edit Order</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Dobavitelj</label>
          <input
            type="text"
            className="form-control"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Evidenčno naročilo</label>
          <select
            className="form-select"
            name="evidence"
            value={formData.evidence}
            onChange={handleChange}
            required
          >
            <option value="">-Izberite-</option>
            <option value="BLAGO">Blago</option>
            <option value="STORITVE">Storitev</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Vrsta naročila</label>
          <select
            className="form-select"
            name="orderType"
            value={formData.orderType}
            onChange={handleChange}
            required
          >
            <option value="">-Izberite-</option>
            <option value="MATERIAL">MATERIAL</option>
            <option value="ŽIVILA">ŽIVILA</option>
            <option value="ENERGIJA">ENERGIJA (elektrika, voda, gorivo, plin)</option>
            <option value="MATERIAL ZA VZDRŽEVANJE">MATERIAL ZA VZDRŽEVANJE</option>
            <option value="STORITVE">STORITVE</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Datum vnosa</label>
          <input
            type="date"
            className="form-control"
            name="entryDate"
            value={formData.entryDate}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Številka predračuna</label>
          <input
            type="text"
            className="form-control"
            name="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Številka izbire</label>
          <input
            type="text"
            className="form-control"
            name="selectNumber"
            value={formData.selectNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Količina</label>
          <input
            type="number"
            className="form-control"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Cena brez DDV</label>
          <input
            type="number"
            className="form-control"
            name="priceWithoutTax"
            value={formData.priceWithoutTax}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Opis naročila</label>
          <textarea
            className="form-control"
            name="itemDescription"
            value={formData.itemDescription}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Opombe</label>
          <textarea
            className="form-control"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
          />
        </div>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            name="acceptConditions"
            checked={formData.acceptConditions}
            onChange={handleChange}
            required
          />
          <label className="form-check-label">Potrjujem pogoje</label>
        </div>

        <div className="form-check mb-3">
          <input
            type="radio"
            id="criteria1"
            name="selectionCriteria"
            value="Ekonomsko najugodnejša ponudba: Cena"
            onChange={handleRadioChange}
            checked={formData.selectionCriteria === "Ekonomsko najugodnejša ponudba: Cena"}
            className="form-check-input"
          />
          <label htmlFor="criteria1" className="form-check-label">
            Ekonomsko najugodnejša ponudba: Cena
          </label>
        </div>

        <div className="form-check mb-3">
          <input
            type="radio"
            id="criteria5"
            name="selectionCriteria"
            value="Prevlada načela učinkovitosti"
            onChange={handleRadioChange}
            checked={formData.selectionCriteria === "Prevlada načela učinkovitosti"}
            className="form-check-input"
          />
          <label htmlFor="criteria5" className="form-check-label">
            Prevlada načela učinkovitosti
          </label>
        </div>

        <button type="submit" className="btn btn-primary">
          Save
        </button>
      </form>
    </div>
  );
}
