import React, { useEffect, useState } from 'react';
import { getDatabase, ref, get, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import '../styles/Track.css';

const Track = () => {
    const [orders, setOrders] = useState([]);
    const [dishes, setDishes] = useState([]);
    const [grandTotal, setGrandTotal] = useState('');
    const [status, setStatus] = useState('');
    const [orderTime, setOrderTime] = useState('');
    const [orderCount, setOrderCount] = useState('');
    const [chefMessage, setChefMessage] = useState('');
    const [payOnDelivery, setPayOnDelivery] = useState(false);
    const [paymentDone, setPaymentDone] = useState(false);
    const [showPayOnDelivery, setShowPayOnDelivery] = useState(false);
    const [chefId, setChefId] = useState('');
    const [userId, setUserId] = useState('');
    const [rozarId, setRozarId] = useState('');
    const [rozarKey, setRozarKey] = useState('');
    const [suburban, setSuburban] = useState('');
    const [userDetails, setUserDetails] = useState({
        EmailID: '',
        FirstName: '',
        LastName: '',
        Mobileno: ''
    });

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            setUserId(user.uid);
            fetchOrders(user.uid);
            fetchCustomerDetails(user.uid);
        }
    }, []);

    const fetchOrders = async (userId) => {
        const db = getDatabase();
        const ordersRef = ref(db, `CustomerFinalOrders/${userId}`);
        const snapshot = await get(ordersRef);
        const ordersList = [];

        snapshot.forEach((childSnapshot) => {
            const order = childSnapshot.val();
            ordersList.push({ ...order, id: childSnapshot.key });
        });

        setOrders(ordersList);
        if (ordersList.length > 0) {
            fetchOrderDetails(userId, ordersList[0].id);
        }
    };

    const fetchOrderDetails = async (userId, orderId) => {
        const db = getDatabase();
        const orderRef = ref(db, `CustomerFinalOrders/${userId}/${orderId}/OtherInformation`);
        const dishesRef = ref(db, `CustomerFinalOrders/${userId}/${orderId}/Dishes`);
        const orderSnapshot = await get(orderRef);
        const dishesSnapshot = await get(dishesRef);

        const orderDetails = orderSnapshot.val();
        const dishesList = [];

        dishesSnapshot.forEach((dishSnapshot) => {
            const dish = dishSnapshot.val();
            if (dish) {
                dishesList.push({
                    DishName: dish.DishName,
                    DishPrice: dish.DishPrice,
                    DishQuantity: dish.DishQuantity,
                    TotalPrice: dish.TotalPrice,
                    ChefId: dish.ChefId
                });
                if (!chefId) {
                    setChefId(dish.ChefId);
                    fetchChefDetails(dish.ChefId);
                }
            }
        });

        setDishes(dishesList);

        if (orderDetails) {
            setGrandTotal(orderDetails.GrandTotalPrice || 'N/A');
            setStatus(orderDetails.Status || 'N/A');
            fetchOrderTime(userId);
            fetchChefMessage(userId);
            fetchChefStatus(orderId);
        } else {
            console.error('Order details not found.');
        }
    };

    const fetchChefDetails = async (chefId) => {
        const db = getDatabase();
        const chefRef = ref(db, `Chef/${chefId}`);

        try {
            const chefSnapshot = await get(chefRef);
            if (chefSnapshot.exists()) {
                const chefData = chefSnapshot.val();
                setSuburban(chefData.Suburban);
            }
        } catch (error) {
            console.error("Error fetching chef details:", error);
        }
    };

    const fetchCustomerDetails = async (userId) => {
        const db = getDatabase();
        const customerRef = ref(db, `Customer/${userId}`);

        try {
            const customerSnapshot = await get(customerRef);
            if (customerSnapshot.exists()) {
                const customerData = customerSnapshot.val();
                setUserDetails({
                    EmailID: customerData.EmailID,
                    FirstName: customerData.FirstName,
                    LastName: customerData.LastName,
                    Mobileno: customerData.Mobileno
                });
            }
        } catch (error) {
            console.error("Error fetching customer details:", error);
        }
    };

    const fetchOrderTime = async (userId) => {
        const db = getDatabase();
        const timeRef = ref(db, `CustomerOrderTime/${userId}`);
        const snapshot = await get(timeRef);
        const timeData = snapshot.val();
        setOrderTime(timeData ? calculateTimeAgo(timeData.ordertime) : 'N/A');
    };

    const calculateTimeAgo = (orderTime) => {
        const formatDate = (dateString) => {
            const [date, time, modifier] = dateString.split(' ');
            let [hours, minutes, seconds] = time.split(':');
            if (modifier.toLowerCase() === 'pm' && hours !== '12') {
                hours = parseInt(hours, 10) + 12;
            } else if (modifier.toLowerCase() === 'am' && hours === '12') {
                hours = '00';
            }
            return new Date(`${date.split('/').reverse().join('-')}T${hours}:${minutes}:${seconds}`);
        };

        const orderDate = formatDate(orderTime);
        const currentDate = new Date();
        const diffInMillis = currentDate - orderDate;
        const diffInMinutes = Math.floor(diffInMillis / 60000);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        return `${diffInDays} days ago`;
    };

    const fetchChefMessage = async (userId) => {
        const db = getDatabase();
        const chefMessageRef = ref(db, `deliveryCharge/${userId}`);
        const snapshot = await get(chefMessageRef);
        const chefData = snapshot.val();
        if (chefData && chefData.chefmessage) {
            setChefMessage(chefData.chefmessage);
        } else {
            setChefMessage('N/A');
        }
    };

    const fetchChefStatus = async (orderId) => {
        const db = getDatabase();
        const chefStatusRef = ref(db, `ChefStatus/${orderId}`);
        const snapshot = await get(chefStatusRef);
        const chefStatusData = snapshot.val();

        if (chefStatusData) {
            if (chefStatusData.ordn) {
                setOrderCount(chefStatusData.ordn);
            }

            if (chefStatusData.chefsts === "Payment Done") {
                setPaymentDone(true);
                setShowPayOnDelivery(false);
            } else if (chefStatusData.chefsts === "Pay on Delivery") {
                setPaymentDone(false);
                setShowPayOnDelivery(true);
            } else {
                setPaymentDone(false);
                setShowPayOnDelivery(false);
            }
        } else {
            console.error('Chef status not found.');
        }
    };

    const handleAddPaymentMethod = async () => {
        const db = getDatabase();
        const chefRzpRef = ref(db, `chefrzp/${chefId}`);

        try {
            const snapshot = await get(chefRzpRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                const { rzpid, rzpkey } = data;

                if (rzpid && rzpkey) {
                    setRozarId(rzpid);
                    setRozarKey(rzpkey);
                    alert("Click OK to open the Payment Page");
                    createRazorpayOrder(rzpid, rzpkey, grandTotal);
                } else {
                    alert("Choose Other Method for making payment for this Seller");
                }
            } else {
                alert("Choose Other Method for making payment for this Seller");
            }
        } catch (error) {
            console.error("Error fetching Razorpay credentials:", error);
        }
    };

    const createRazorpayOrder = (rzpid, rzpkey, amount) => {
        const url = `https://us-central1-fooddelivery-d9c7a.cloudfunctions.net/createRazorpayOrder?kid=${rzpid}&ksec=${rzpkey}&amt=${parseInt(amount) * 100}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Razorpay order creation response:", data);
                parseResponse(data);
            })
            .catch(error => {
                console.error("Error creating Razorpay order:", error);
                alert("Error creating Razorpay order. Please try again.");
            });
    };

    const parseResponse = (response) => {
        try {
            const orderID = response.orderID;
            startPayment(orderID);
        } catch (error) {
            console.error("Error parsing Razorpay order response:", error);
        }
    };

    const startPayment = (orderID) => {
        const { FirstName, LastName, EmailID, Mobileno } = userDetails;
        const options = {
            "key": rozarId,
            "amount": parseInt(grandTotal) * 100, // Razorpay accepts amount in paise
            "currency": "INR",
            "name": suburban,
            "description": orderID,
            "image": "/assets/beef.png", // Assuming assets folder is served from the public directory
            "order_id": orderID,
            "handler": function (response) {
                alert("Payment Successful");
                console.log(response);
                handlePaymentSuccess(response.razorpay_payment_id);
            },
            "prefill": {
                "name": `${FirstName} ${LastName}`,
                "email": EmailID,
                "contact": Mobileno
            },
            "notes": {
                "address": "Razorpay Corporate Office"
            },
            "theme": {
                "color": "#ff8c00"
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();

        rzp.on('payment.failed', function (response) {
            alert("Payment Failed");
            console.log(response);
            // Handle payment failure here
        });
    };

    const handlePaymentSuccess = async (paymentId) => {
        const db = getDatabase();
        const randomuid = orders[0].id; // Assuming you have at least one order

        try {
            await set(ref(db, `ChefStatus/${randomuid}/chefsts`), "Payment Done");
            alert("Payment done successfully");
            window.location.reload();
        } catch (error) {
            console.error("Error handling payment success:", error);
        }
    };

    return (
        <div className="track-container">
            <h1>Track Orders</h1>
            <div className="chef-message-card card">Message from Chef: {chefMessage}</div>
            <div className="order-info-card card">
                <div>Order Time: {orderTime}</div>
                <div>Status: {status}</div>
                <div>Order No: {orderCount}</div>
            </div>
            <div className="dishes-list">
                {dishes.map((dish, index) => (
                    <div key={index} className="dish-details">
                        <div className="dish-name">{dish.DishName}</div>
                        <div className="dish-info">
                            <div className="dish-price-quantity">₹{dish.DishPrice} x {dish.DishQuantity}</div>
                            <div className="dish-total">Total: ₹{dish.TotalPrice}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="grand-total-card card">Grand Total: ₹{grandTotal}</div>
            <div className="pay-on-delivery">
                {paymentDone ? (
                    <div className="payment-done-text">Payment already done!</div>
                ) : (
                    showPayOnDelivery && <button className="pay-on-delivery-btn" onClick={handleAddPaymentMethod}>Online Payment</button>
                )}
            </div>
        </div>
    );
};

export default Track;
