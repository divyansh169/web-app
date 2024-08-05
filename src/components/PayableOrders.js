import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import '../styles/PayableOrders.css';

const PayableOrders = () => {
    const [payableOrders, setPayableOrders] = useState([]);
    const [grandTotal, setGrandTotal] = useState("0");
    const [deliveryCharge, setDeliveryCharge] = useState("0");
    const [discount, setDiscount] = useState("0");
    const [amountToPay, setAmountToPay] = useState("0");
    const [couponCode, setCouponCode] = useState('');
    const [isCouponApplied, setIsCouponApplied] = useState(false);
    const [enablePOD, setEnablePOD] = useState(false);
    const [chefMessage, setChefMessage] = useState('');
    const [chefId, setChefId] = useState('');
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
        const fetchPayableOrders = async (userId) => {
            const db = getDatabase();
            const payableOrdersRef = ref(db, `CustomerPaymentOrders/${userId}`);
            const deliveryChargeRef = ref(db, `deliveryCharge/${userId}`);
            
            try {
                const [payableOrdersSnapshot, deliveryChargeSnapshot] = await Promise.all([
                    get(payableOrdersRef),
                    get(deliveryChargeRef)
                ]);

                if (payableOrdersSnapshot.exists()) {
                    const data = payableOrdersSnapshot.val();
                    const ordersList = Object.keys(data).map(orderId => ({
                        orderId,
                        ...data[orderId]
                    }));
                    setPayableOrders(ordersList);
                    fetchChefId(userId);
                    fetchCustomerDetails(userId);
                    calculateTotals(data, deliveryChargeSnapshot.val());
                }

                if (deliveryChargeSnapshot.exists()) {
                    const data = deliveryChargeSnapshot.val();
                    setDeliveryCharge(data.deliverychargetext);
                    setDiscount(data.discnttext);
                    setEnablePOD(data.enablepodt_flag === "1");
                    setChefMessage(data.chefmessage);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        const calculateTotals = (ordersData, deliveryChargeData) => {
            let total = 0;
            let deliveryCharge = parseFloat(deliveryChargeData.deliverychargetext);
            let discount = parseFloat(deliveryChargeData.discnttext);
            Object.values(ordersData).forEach(order => {
                total += parseFloat(order.OtherInformation.GrandTotalPrice);
            });

            const originalGrandTotal = total + discount - deliveryCharge;
            setGrandTotal(originalGrandTotal.toString());
            setAmountToPay(total.toString());
        };

        const fetchChefId = async (userId) => {
            const db = getDatabase();
            const ordersRef = ref(db, `CustomerPaymentOrders/${userId}`);

            try {
                const ordersSnapshot = await get(ordersRef);
                if (ordersSnapshot.exists()) {
                    const ordersData = ordersSnapshot.val();
                    for (let randomUID in ordersData) {
                        if (ordersData[randomUID].Dishes) {
                            for (let dishId in ordersData[randomUID].Dishes) {
                                const chefId = ordersData[randomUID].Dishes[dishId].ChefId;
                                setChefId(chefId);
                                fetchChefDetails(chefId);
                                break;
                            }
                        }
                        break;
                    }
                }
            } catch (error) {
                console.error("Error fetching chef ID:", error);
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

        const auth = getAuth();
        auth.onAuthStateChanged((user) => {
            if (user) {
                fetchPayableOrders(user.uid);
            }
        });
    }, [deliveryCharge, discount]);

    const applyCoupon = async () => {
        if (!chefId) {
            alert("No Coupon exists for this seller");
            return;
        }

        const db = getDatabase();
        const chefCouponsRef = ref(db, `chefCoupons/${chefId}`);

        try {
            const snapshot = await get(chefCouponsRef);
            if (!snapshot.exists()) {
                alert("No Coupon exists for this seller");
                return;
            }

            const coupons = snapshot.val();
            const { cpntxt, cpntxt1, cpntxt2, cpntxt3 } = coupons;

            if (couponCode === cpntxt && parseFloat(grandTotal) >= parseFloat(cpntxt2)) {
                setIsCouponApplied(true);
                alert("Coupon Applied Successfully!!");

                if (cpntxt1 === "1") {
                    const newAmountToPay = parseFloat(amountToPay) - parseFloat(cpntxt3);
                    alert(`Discount of Rs. ${cpntxt3} is added`);
                    setAmountToPay(newAmountToPay.toString());
                } else if (cpntxt1 === "2") {
                    alert(`Offer of Free ${cpntxt3} is added`);
                }

                // Hide or disable the "Click to Apply" button
                document.querySelector('.apply-coupon-btn').style.display = 'none';
            } else {
                alert(`Invalid Coupon Code or Condition. Please Check Minimum Order Value Before Applying. The minimum order value should be above ${cpntxt2} to use the coupon. Your grand total is ₹${grandTotal}`);
            }
        } catch (error) {
            console.error("Error applying coupon:", error);
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
                    // alert("Starting Razorpay payment with ID: " + rzpid + " and Key: " + rzpkey);
                    alert("Click OK to open the Payment Page");
                    createRazorpayOrder(rzpid, rzpkey, amountToPay);
                } else {
                    alert("Choose Pay on Delivery for making payment for this seller");
                }
            } else {
                alert("Choose Pay on Delivery for making payment for this seller");
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
            "amount": parseInt(amountToPay) * 100, // Razorpay accepts amount in paise
            "currency": "INR",
            "name": suburban,
            "description": orderID,
            "image": "/assets/beef.png", // Assuming assets folder is served from the public directory
            "order_id": orderID,
            "handler": function (response) {
                alert("Payment Successful");
                console.log(response);
                handlePaymentSuccess(response.razorpay_payment_id, "Payment Done");
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
                "color": "#3399cc"
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();

        rzp.on('payment.failed', function (response){
            alert("Payment Failed");
            console.log(response);
            // Handle payment failure here
        });
    };

    const handlePaymentSuccess = async (paymentId, paymentStatus = "Payment Done") => {
        const db = getDatabase();
        const auth = getAuth();
        const userId = auth.currentUser.uid;
        const randomuidd = payableOrders[0].orderId; // Assuming you have at least one order

        try {
            // Update ChefOrderCounter and ChefStatus
            const chefOrderCounterRef = ref(db, `ChefOrderCounter/${chefId}`);
            const chefOrderCounterSnapshot = await get(chefOrderCounterRef);
            let orderNo = "1";
            if (chefOrderCounterSnapshot.exists()) {
                const data = chefOrderCounterSnapshot.val();
                orderNo = (parseInt(data.cunt) + 1).toString();
            }
            await set(ref(db, `ChefOrderCounter/${chefId}/cunt`), orderNo);
            await set(ref(db, `ChefStatus/${randomuidd}`), { chefsts: paymentStatus, ordn: orderNo });

            // Move dishes to CustomerFinalOrders and ChefWaitingOrders
            const dishesRef = ref(db, `CustomerPaymentOrders/${userId}/${randomuidd}/Dishes`);
            const dishesSnapshot = await get(dishesRef);
            if (dishesSnapshot.exists()) {
                dishesSnapshot.forEach(async (dishSnapshot) => {
                    const dishData = dishSnapshot.val();
                    const dishId = dishSnapshot.key;
                    const dishDetails = {
                        ChefId: dishData.ChefId,
                        DishId: dishData.DishId,
                        DishName: dishData.DishName,
                        DishPrice: dishData.DishPrice,
                        DishQuantity: dishData.DishQuantity,
                        RandomUID: randomuidd,
                        TotalPrice: dishData.TotalPrice,
                        UserId: dishData.UserId
                    };
                    await set(ref(db, `CustomerFinalOrders/${userId}/${randomuidd}/Dishes/${dishId}`), dishDetails);
                    await set(ref(db, `ChefWaitingOrders/${chefId}/${randomuidd}/Dishes/${dishId}`), dishDetails);
                });
            }

            // Move OtherInformation to CustomerFinalOrders and ChefWaitingOrders
            const otherInfoRef = ref(db, `CustomerPaymentOrders/${userId}/${randomuidd}/OtherInformation`);
            const otherInfoSnapshot = await get(otherInfoRef);
            if (otherInfoSnapshot.exists()) {
                const otherInfoData = otherInfoSnapshot.val();
                let newNote = otherInfoData.Note;
                if (isCouponApplied) {
                    const db = getDatabase();
                    const chefCouponsRef = ref(db, `chefCoupons/${chefId}`);
                    const snapshot = await get(chefCouponsRef);
                    const coupons = snapshot.val();
                    const { cpntxt1, cpntxt3 } = coupons;
                    if (cpntxt1 === "1") {
                        newNote += `. Discount of Rs. ${cpntxt3} is added`;
                    } else if (cpntxt1 === "2") {
                        newNote += `. Offer of Free ${cpntxt3} is added`;
                    }
                }
                const otherInfoDetails = {
                    Address: otherInfoData.Address,
                    GrandTotalPrice: amountToPay,
                    MobileNumber: otherInfoData.MobileNumber,
                    Name: otherInfoData.Name,
                    Note: newNote,
                    RandomUID: randomuidd,
                    Status: "Your order is waiting to be prepared by Seller..."
                };
                await set(ref(db, `CustomerFinalOrders/${userId}/${randomuidd}/OtherInformation`), otherInfoDetails);
                await set(ref(db, `ChefWaitingOrders/${chefId}/${randomuidd}/OtherInformation`), otherInfoDetails);
            }

            // Clean up payment orders
            await remove(ref(db, `CustomerPaymentOrders/${userId}/${randomuidd}`));
            await remove(ref(db, `ChefPaymentOrders/${chefId}/${randomuidd}`));

            alert("Payment mode confirmed, Now you can track your order.");
            window.location.reload();
            // Redirect or perform any additional actions
        } catch (error) {
            console.error("Error handling payment success:", error);
        }
    };

    const handlePayOnDelivery = () => {
        handlePaymentSuccess(null, "Pay on Delivery");
    };

    const handleCancelOrder = async () => {
        const db = getDatabase();
        const auth = getAuth();
        const userId = auth.currentUser.uid;
        const randomuidd = payableOrders[0].orderId; // Assuming you have at least one order

        try {
            await remove(ref(db, `ordertype/${userId}`));
            await remove(ref(db, `deliveryCharge/${userId}`));
            await remove(ref(db, `ChefPaymentOrders/${chefId}/${randomuidd}`));
            await remove(ref(db, `AlreadyOrdered/${userId}`));
            await remove(ref(db, `CustomerPaymentOrders/${userId}/${randomuidd}`));
            await remove(ref(db, `CustomerOrderTime/${userId}`));

            alert("Order cancelled successfully");
            window.location.reload();
        } catch (error) {
            console.error("Error cancelling order:", error);
            alert("Error cancelling order. Please try again.");
        }
    };

    return (
        <div className="payable-orders-container">
            {payableOrders.length > 0 ? (
                <div>
                    {payableOrders.map((order) => (
                        <OrderCard key={order.orderId} order={order} />
                    ))}
                    {chefMessage && (
                        <div className="chef-message-card">
                            <p className="chef-message"><strong>Message from Seller:</strong> {chefMessage}</p>
                        </div>
                    )}
                    <div className="payment-section">
                        <div className="coupon-section">
                            <input
                                type="text"
                                placeholder="Enter Coupon Code Here"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                className="coupon-input"
                            />
                            <button onClick={applyCoupon} className="apply-coupon-btn">Click to Apply</button>
                        </div>
                        {isCouponApplied && <p className="coupon-valid">Coupon Applied Successfully</p>}
                        <div className="price-details">
                            <div className="price-item">
                                <span>Grand Total:</span>
                                <span>₹{grandTotal}</span>
                            </div>
                            <div className="price-item">
                                <span>Delivery Charge / Add Ons:</span>
                                <span>₹{deliveryCharge}</span>
                            </div>
                            <div className="price-item">
                                <span>Discount / Offers:</span>
                                <span>₹{discount}</span>
                            </div>
                            <div className="price-item total-amount">
                                <span>Amount to Pay:</span>
                                <span>₹{amountToPay}</span>
                            </div>
                        </div>
                        {enablePOD && <button className="pay-on-delivery-btn" onClick={handlePayOnDelivery}>Pay On Delivery/TakeAway</button>}
                        <button className="add-payment-method-btn" onClick={handleAddPaymentMethod}>Add Payment Method</button>
                        <button className="cancel-order-btn" onClick={handleCancelOrder}>Cancel Order</button>
                    </div>
                </div>
            ) : (
                <p>No payable orders</p>
            )}
        </div>
    );
};

const OrderCard = ({ order }) => (
    <div className="order-card">
        <div className="order-details">
            {order.Dishes && Object.values(order.Dishes).map((dish, index) => (
                <div key={index} className="dish-details">
                    <p className="dish-name"><strong>{dish.DishName}</strong></p>
                    <div className="dish-info">
                        <p>Price: ₹{dish.Price} x {dish.DishQuantity}</p>
                        <p className="dish-total">Total: ₹{dish.TotalPrice}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default PayableOrders;
