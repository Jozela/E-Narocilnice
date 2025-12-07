import React, { useState, useEffect } from "react";

const OrderForm = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [currentUser] = useState(null); 
    const [formData, setFormData] = useState({
        supplier: "",
        evidence: "",
        orderType: "",
        entryDate: "",
        invoiceNumber: "",
        selectNumber: "",
        quantity: 1,
        me: "",
        priceWithoutTax: 0,
        itemDescription: "",
        item: "",
        remarks: "",
        acceptConditions: false,
        selectionCriteria: "",
        otherCriteria: "",
        username: currentUser ? currentUser.username : ""
    });

    useEffect(() => {
        fetch("http://localhost:5000/suppliers") // include full URL with port
            .then((res) => res.json())
            .then((data) => setSuppliers(data))
            .catch((error) => console.error("Error fetching suppliers:", error));
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };
    const handleRadioChange = (event) => {
        const { value } = event.target;
        setFormData((prevFormData) => ({
          ...prevFormData,
          selectionCriteria: value,
          isCriteria6Selected: value === 'Druga merila' ? true : prevFormData.isCriteria6Selected
        }));
      };
    
      const handleCheckboxChange = (event) => {
        const { id, checked } = event.target;
        console.log(`${id} is ${checked ? 'checked' : 'unchecked'}`);
      };
    
      const handleTextareaChange = (event) => {
        setFormData((prevFormData) => ({
          ...prevFormData,
          otherCriteria: event.target.value
        }));
      };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/vnos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (response.ok) {
                alert("Order submitted successfully!");
                setFormData({ ...formData, supplier: "", item: "" });
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error("Submission error:", error);
        }
    };

    return (
        <div className="container mt-5 p-4 bg-light">
            <h3>Vnesite podatke za naročilnico</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Dobavitelj</label>
                    <input
                        type="text"
                        className="form-control"
                        name="supplier"
                        list="suppliers"
                        value={formData.supplier}
                        onChange={handleChange}
                        required
                    />
                    <datalist id="suppliers">
                        {suppliers.map((s) => (
                            <option key={s.id} value={s.name} />
                        ))}
                    </datalist>
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
                        <option value="ENERGIJA (elektrika, voda, gorivo, plin)">ENERGIJA (elektrika, voda, gorivo, plin)</option>
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
                    <label className="form-label">M.E.</label>
                    <input
                        type="text"
                        className="form-control"
                        name="me"
                        value={formData.me}
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
                    <label className="form-label">Naročilo</label>
                    <input
                        type="text"
                        className="form-control"
                        name="item"
                        value={formData.item}
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

                <div className="mb-3">
                    <label className="form-label">Izberite merila za naročilo:</label>
                    <div className="form-check">
                        <input
                        type="radio"
                        id="criteria1"
                        name="selectionCriteria"
                        value="Ekonomsko najugodnejša ponudba: Cena"
                        onChange={handleRadioChange}
                        checked={formData.selectionCriteria === "Ekonomsko najugodnejša ponudba: Cena"}
                        className="form-check-input"
                        />
                        <label htmlFor="criteria1" className="form-check-label">Ekonomsko najugodnejša ponudba: Cena</label>
                    </div>

                    <div className="form-check">
                        <input
                        type="radio"
                        id="criteria2"
                        name="selectionCriteria"
                        value="Ekonomsko najugodnejša ponudba - ostalo (opredeljeno v Navodilih)"
                        onChange={handleRadioChange}
                        checked={formData.selectionCriteria === "Ekonomsko najugodnejša ponudba - ostalo (opredeljeno v Navodilih)"}
                        className="form-check-input"
                        />
                        <label htmlFor="criteria2" className="form-check-label">
                        Ekonomsko najugodnejša ponudba - ostalo (opredeljeno v Navodilih)
                        </label>
                    </div>

                    <div className="form-check">
                        <input
                        type="radio"
                        id="criteria3"
                        name="selectionCriteria"
                        value="Ustreznost predmeta naročila glede vsebine, programa, lokacije, termina"
                        onChange={handleRadioChange}
                        checked={formData.selectionCriteria === "Ustreznost predmeta naročila glede vsebine, programa, lokacije, termina"}
                        className="form-check-input"
                        />
                        <label htmlFor="criteria3" className="form-check-label">
                        Ustreznost predmeta naročila glede vsebine, programa, lokacije, termina
                        </label>
                    </div>

                    <div className="form-check">
                        <input
                        type="radio"
                        id="criteria4"
                        name="selectionCriteria"
                        value="Naročilo lahko izpolni le določen ponudnik"
                        onChange={handleRadioChange}
                        checked={formData.selectionCriteria === "Naročilo lahko izpolni le določen ponudnik"}
                        className="form-check-input"
                        />
                        <label htmlFor="criteria4" className="form-check-label">
                        Naročilo lahko izpolni le določen ponudnik iz naslednjih razlogov:
                        </label>
                        <ul style={{ listStyleType: 'none', paddingLeft: '1' }}>
                        <li>
                            <input
                            type="checkbox"
                            id="reason1"
                            onChange={handleCheckboxChange}
                            className="form-check-input"
                            />
                                unikatno umetniško delo ali umetniško uprizoritev
                        </li>
                        <li>
                            <input
                            type="checkbox"
                            id="reason2"
                            onChange={handleCheckboxChange}
                            className="form-check-input"
                            />
                                ne obstaja konkurenca za predmet naročila
                        </li>
                        </ul>
                    </div>

                    <div className="form-check">
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
                        Prevlada načela učinkovitosti v primerih ...
                        </label>
                    </div>

                    <div className="form-check">
                        <input
                        type="radio"
                        id="criteria6"
                        name="selectionCriteria"
                        value="Druga merila"
                        onChange={handleRadioChange}
                        checked={formData.selectionCriteria === "Druga merila"}
                        className="form-check-input"
                        />
                        <label htmlFor="criteria6" className="form-check-label">
                        Druga merila
                        </label>
                        {formData.selectionCriteria === 'Druga merila' && (
                        <textarea
                            id="drugo"
                            className="form-control border-primary"
                            placeholder="Drugo"
                            value={formData.otherCriteria}
                            onChange={handleTextareaChange}
                        />
                        )}
                    </div>
                </div>

                <button type="submit" className="btn btn-primary">Vnesi za tekoče leto</button>
            </form>
        </div>
    );
};

export default OrderForm;
