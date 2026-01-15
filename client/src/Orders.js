import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './OrderPage.css';

const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [isAscending, setIsAscending] = useState(true);
    const [currentSortColumn, setCurrentSortColumn] = useState('');
    const [username, setUsername] = useState('');
    const savedUsername = localStorage.getItem('username');
    const navigate = useNavigate();

    useEffect(() => {
        if (savedUsername) {
            setUsername(savedUsername);
        }

        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://localhost:5000/orders', {
                    withCredentials: true,
                });            

                if (response?.data) {
                    setOrders(response.data);  
                } else {
                    console.log('No orders data in response');
                }

                console.log('API response:', response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
    }, [savedUsername]);

    useEffect(() => {
        console.log('Updated orders:', orders);
    }, [orders]);

    const handleSort = (column) => {
        const sortedOrders = [...orders];
        sortedOrders.sort((a, b) => {
            if (a[column] < b[column]) return isAscending ? -1 : 1;
            if (a[column] > b[column]) return isAscending ? 1 : -1;
            return 0;
        });

        setOrders(sortedOrders);
        setIsAscending(!isAscending);
        setCurrentSortColumn(column);
    };
    const handleEdit = (orderId) => {
        navigate(`/orders/edit/${orderId}`);
    };
    const DownloadOrderPdf = async (orderId) => {
        try {
          const response = await fetch(`localhost:5000/${orderId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
    
          if (response.ok) {
            const blob = await response.blob(); 
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `Order_${orderId}.pdf`; 
            link.click(); 
          } else {
            console.error("Failed to download PDF");
          }
        } catch (error) {
          console.error("Error during PDF download:", error);
        }
      };

    const handlePrint = () => {
        window.print(); 
    };

    return (
        <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#f8f9fa' }}>
                <h3>Pregled vseh vnešenih naročilnic</h3>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {username && <span style={{ marginRight: '20px' }}>Welcome, {username}</span>}
                </div>
            </header>

            <div style={{ margin: '20px' }}>
                <button className="print-button" onClick={handlePrint}>Print</button>
            </div>

            <table className="table">
                <thead>
                    <tr>
                        <th>
                            <button onClick={() => handleSort('datumVnosa')}>Datum Vnosa</button>
                        </th>
                        <th>
                            <button onClick={() => handleSort('dobaviteljName')}>Dobavitelj</button>
                        </th>
                        <th>
                            <button onClick={() => handleSort('dobaviteljName')}>Opis Narocila</button>
                        </th>
                        <th>
                            <button onClick={() => handleSort('dobaviteljName')}>Naslov</button>
                        </th>
                        <th>
                            <button onClick={() => handleSort('dobaviteljName')}>Status</button>
                        </th>
                        <th>
                            <button onClick={() => handleSort('dobaviteljName')}>Opombe</button>
                        </th>
                        {}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length === 0 ? (
                        <tr><td colSpan="4">No orders found.</td></tr>
                    ) : (
                        orders.map(order => (
                            <tr key={order.id}>
                                <td>{order.datumVnosa}</td>
                                <td>
                                    <button className="btn btn-link" onClick={() => DownloadOrderPdf(order.id)}>
                                    {order.dobaviteljNaziv}
                                    </button>
                                </td>                   
                                <td>{order.opisNarocila}</td>
                                <td>{order.naslov}</td>
                                <td>{order.status}</td>
                                <td>{order.opombe}</td>

                                {}
                                <td>
                                <button className="btn btn-warning btn-sm" onClick={() => handleEdit(order.id)}>Edit</button>
                                <button className="btn btn-danger btn-sm">Cancel</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default OrderPage;
