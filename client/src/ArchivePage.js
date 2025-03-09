import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ArchivePage = () => {
    const { year } = useParams(); // Get the year from the URL
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://localhost:5000/orders', {
                    withCredentials: true,
                });

                if (response?.data) {
                    // Filter orders by the selected year
                    const filteredOrders = response.data.filter(order => {
                        const orderYear = new Date(order.datumVnosa).getFullYear();
                        return orderYear.toString() === year;
                    });
                    setOrders(filteredOrders);
                } else {
                    console.log('No orders data in response');
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
    }, [year]);

    return (
        <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#f8f9fa' }}>
                <h3>Archive - Orders from {year}</h3>
                <button onClick={() => navigate('/')}>Back to Orders</button>
            </header>

            <table className="table">
                <thead>
                    <tr>
                        <th>Datum Vnosa</th>
                        <th>Dobavitelj</th>
                        <th>Opis Narocila</th>
                        <th>Naslov</th>
                        <th>Status</th>
                        <th>Opombe</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length === 0 ? (
                        <tr><td colSpan="6">No orders found for {year}.</td></tr>
                    ) : (
                        orders.map(order => (
                            <tr key={order.id}>
                                <td>{order.datumVnosa}</td>
                                <td>{order.dobaviteljNaziv}</td>
                                <td>{order.opisNarocila}</td>
                                <td>{order.naslov}</td>
                                <td>{order.status}</td>
                                <td>{order.opombe}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ArchivePage;
