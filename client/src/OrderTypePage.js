import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const OrderTypePage = () => {
    const { type } = useParams(); // Get type from URL (storitev or blago)
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`https://e-narocilnice-5.onrender.com/orders?type=${type}`, {
                    withCredentials: true,
                });

                if (response?.data) {
                    setOrders(response.data);
                } else {
                    console.log('No orders data in response');
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
    }, [type]);

    return (
        <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#f8f9fa' }}>
                <h3>Orders - {type.charAt(0).toUpperCase() + type.slice(1)}</h3>
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
                        <tr><td colSpan="6">No {type} orders found.</td></tr>
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

export default OrderTypePage;
