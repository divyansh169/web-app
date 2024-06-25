import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import { messaging, requestForToken, functions  } from '../firebase';
import { getToken } from 'firebase/messaging'; 
import { httpsCallable } from 'firebase/functions';
import '../styles/Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [grandTotal, setGrandTotal] = useState(0);
    const [orderMethod, setOrderMethod] = useState('');
    const [availableOrderMethods, setAvailableOrderMethods] = useState([]);
    const [minOrderValue, setMinOrderValue] = useState(0);
    const [locationInfo, setLocationInfo] = useState({ state: '', city: '', suburban: '' });

    useEffect(() => {
        requestForToken();
        const fetchCartItems = async () => {
            const db = getDatabase();
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                const cartRef = ref(db, `Cart/CartItems/${user.uid}`);
                const snapshot = await get(cartRef);

                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const items = Object.keys(data).map(key => ({
                        id: key,
                        ...data[key],
                        quantity: parseInt(data[key].DishQuantity, 10),
                        price: parseFloat(data[key].Price),
                        total: parseFloat(data[key].Totalprice)
                    }));
                    setCartItems(items);
                    calculateGrandTotal(items, user.uid);
                } else {
                    setCartItems([]);
                }
            }
        };

        fetchCartItems();
    }, []);

    useEffect(() => {
        const fetchOrderOptions = async () => {
            const db = getDatabase();
            const auth = getAuth();
            const user = auth.currentUser;

            if (user && cartItems.length > 0) {
                const chefId = cartItems[0].ChefId;
                const chefExtraDetailsRef = ref(db, `ChefExtraDetails/${chefId}`);
                const chefExtraDetailsSnapshot = await get(chefExtraDetailsRef);

                if (chefExtraDetailsSnapshot.exists()) {
                    const data = chefExtraDetailsSnapshot.val();
                    const options = [];

                    if (data.deliveryoption === "1") {
                        options.push("Delivery");
                    }
                    if (data.prebooking === "1") {
                        options.push("Dine-In");
                    }
                    if (data.takeawayoption === "1") {
                        options.push("Takeaway");
                    }

                    setAvailableOrderMethods(options);
                    if (options.length > 0) {
                        setOrderMethod(options[0]);
                    }

                    const minOrderValue = parseFloat(data.minordval) || 0;
                    setMinOrderValue(minOrderValue);
                }
            }
        };

        fetchOrderOptions();
    }, [cartItems]);

    useEffect(() => {
        const fetchCustomerInfo = async () => {
            const db = getDatabase();
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                const customerInfoRef = ref(db, `Customer/${user.uid}`);
                const snapshot = await get(customerInfoRef);

                if (snapshot.exists()) {
                    const data = snapshot.val();
                    if (data && data.State && data.City && data.Suburban) {
                        setLocationInfo({ state: data.State, city: data.City, suburban: data.Suburban });
                    }
                }
            }
        };

        fetchCustomerInfo();
    }, []);

    const calculateGrandTotal = async (items, userId) => {
        const total = items.reduce((sum, item) => sum + item.total, 0);
        setGrandTotal(total);

        if (userId) {
            const db = getDatabase();
            const grandTotalRef = ref(db, `Cart/GrandTotal/${userId}`);
            await set(grandTotalRef, { GrandTotal: total.toString() });
        }
    };

    const updateQuantity = async (item, newQuantity) => {
        const db = getDatabase();
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const cartRef = ref(db, `Cart/CartItems/${user.uid}/${item.id}`);
            if (newQuantity > 0) {
                const totalprice = newQuantity * item.price;

                const cartItem = {
                    DishName: item.DishName,
                    DishID: item.DishID,
                    DishQuantity: newQuantity.toString(),
                    Price: item.price.toString(),
                    Totalprice: totalprice.toString(),
                    ChefId: item.ChefId
                };

                await set(cartRef, cartItem);
                const updatedItems = cartItems.map(cartItem =>
                    cartItem.id === item.id ? { ...cartItem, quantity: newQuantity, total: totalprice } : cartItem
                );
                setCartItems(updatedItems);
                calculateGrandTotal(updatedItems, user.uid);
            } else {
                await remove(cartRef);
                const updatedItems = cartItems.filter(cartItem => cartItem.id !== item.id);
                setCartItems(updatedItems);
                calculateGrandTotal(updatedItems, user.uid);
            }
        }
    };

    const removeAllItems = async () => {
        const db = getDatabase();
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const cartItemsRef = ref(db, `Cart/CartItems/${user.uid}`);
            const grandTotalRef = ref(db, `Cart/GrandTotal/${user.uid}`);
            await remove(cartItemsRef);
            await remove(grandTotalRef);
            setCartItems([]);
            setGrandTotal(0);
        }
    };

    const confirmRemoveAllItems = () => {
        const confirmed = window.confirm("Are you sure you want to remove all items from your cart?");
        if (confirmed) {
            removeAllItems();
        }
    };

    const formatDate = (date) => {
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        return date.toLocaleString('en-GB', options).replace(',', '');
    };

    const placeOrder = async () => {
        const db = getDatabase();
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            alert("You must be logged in to place an order.");
            return;
        }

        const userId = user.uid;

        if (cartItems.length === 0) {
            alert("There should be at least 1 item in the cart.");
            return;
        }

        // Fetch ChefId from FoodSupplyDetails
        const foodSupplyDetailsRef = ref(db, `FoodSupplyDetails/${locationInfo.state}/${locationInfo.city}/${locationInfo.suburban}`);
        const foodSupplySnapshot = await get(foodSupplyDetailsRef);
        let homePageChefId = null;

        if (foodSupplySnapshot.exists()) {
            const foodSupplyData = foodSupplySnapshot.val();
            for (const sellerId in foodSupplyData) {
                if (foodSupplyData.hasOwnProperty(sellerId)) {
                    homePageChefId = sellerId;
                    break; // Assuming the first sellerId is the chefId we need
                }
            }
        }

        if (homePageChefId && cartItems[0].ChefId !== homePageChefId) {
            alert("Home Page items don't match with the cart items. Please select the same store of which items need to be ordered.");
            return;
        }

        const chefId = cartItems[0].ChefId;
        const chefExtraDetailsRef = ref(db, `ChefExtraDetails/${chefId}/ordertimings`);
        const chefExtraDetailsSnapshot = await get(chefExtraDetailsRef);

        if (chefExtraDetailsSnapshot.exists()) {
            const orderTimings = chefExtraDetailsSnapshot.val();
            const [startHour, startMinute, startSecond, endHour, endMinute, endSecond] = orderTimings.split(',').map(Number);

            const now = new Date();
            const currentTime = new Date(now.getTime());

            const startTime = new Date();
            startTime.setHours(startHour, startMinute, startSecond, 0);

            const endTime = new Date();
            endTime.setHours(endHour, endMinute, endSecond, 0);

            const beforeMidnight = new Date();
            beforeMidnight.setHours(23, 59, 59, 999);

            const afterMidnight = new Date();
            afterMidnight.setHours(0, 0, 0, 0);

            const isInTimeRange = (
                (currentTime >= startTime && currentTime <= endTime && startHour <= endHour) ||
                (startHour > endHour && (
                    (currentTime >= startTime && currentTime <= beforeMidnight) ||
                    (currentTime >= afterMidnight && currentTime <= endTime)
                ))
            );

            if (!isInTimeRange) {
                alert(`You can order only between ${startHour}:${startMinute}:${startSecond} and ${endHour}:${endMinute}:${endSecond}`);
                return;
            }
        }

        const chefStoppedRef = ref(db, `ChefStopped/${chefId}`);
        const chefStoppedSnapshot = await get(chefStoppedRef);

        if (chefStoppedSnapshot.exists() && chefStoppedSnapshot.val().stopped === 1) {
            alert("The chef has paused accepting orders. Please try again later.");
            return;
        }

        
            const alreadyOrderedRef = ref(db, `AlreadyOrdered/${userId}/isOrdered`);
            const alreadyOrderedSnapshot = await get(alreadyOrderedRef);

            if (alreadyOrderedSnapshot.exists() && alreadyOrderedSnapshot.val() === "true") {
                alert("You have already placed an order. Please wait until the current order is delivered.");
                return;
            }

            const grandTotalRef = ref(db, `Cart/GrandTotal/${userId}`);
            const grandTotalSnapshot = await get(grandTotalRef);

            if (!grandTotalSnapshot.exists()) {
                alert("Error retrieving grand total.");
                return;
            }

            const grandTotalValue = grandTotalSnapshot.val().GrandTotal;

            if (grandTotalValue < minOrderValue) {
                alert(`Order must be above ₹${minOrderValue}. Current total: ₹${grandTotalValue}`);
                return;
            }

            // const localAddress = prompt("Enter your local address:");
        // if (!localAddress) {

        // Fetch the local address
    const customerInfoRef = ref(db, `Customer/${userId}/LocalAddress`);
    const customerInfoSnapshot = await get(customerInfoRef);

    let localAddress = '';
    if (customerInfoSnapshot.exists()) {
        localAddress = customerInfoSnapshot.val() || '';
    }

    const enteredAddress = prompt("Enter your address:", localAddress);
    if (!enteredAddress) {
            alert("Address is required.");
            return;
        }

        const note = prompt("Enter a note for the seller (optional):");

        if (!orderMethod || !availableOrderMethods.includes(orderMethod)) {
            alert("Invalid order method.");
            return;
        }

        alert("Please wait..."); // Show please wait alert after user clicks OK for the note

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const loadrr = `${latitude},${longitude}`;


            const customerRef = ref(db, `Customer/${userId}`);
            const customerSnapshot = await get(customerRef);

            if (!customerSnapshot.exists()) {
                alert("Error retrieving customer information.");
                return;
            }

            const customerData = customerSnapshot.val();
            const firstName = customerData.FirstName;
            const lastName = customerData.LastName;
            const mobileNumber = customerData.Mobileno;
            const suburban = customerData.Suburban;
            const customerName = `${firstName} ${lastName}`;

            const address = `${loadrr}: ${enteredAddress.trim()}, ${suburban}`;

            const RandomUId = `${Math.floor(Date.now() / 1000)}-${uuidv4()}`;

            const dishesData = cartItems.reduce((acc, item) => {
                acc[item.id] = {
                    ChefId: item.ChefId,
                    DishID: item.DishID,
                    DishName: item.DishName,
                    DishQuantity: item.quantity.toString(),
                    Price: item.price.toString(),
                    TotalPrice: item.total.toString()
                };
                return acc;
            }, {});

            await set(ref(db, `CustomerPendingOrders/${userId}/${RandomUId}/Dishes`), dishesData);

            const customerInfo = {
                Address: address,
                GrandTotalPrice: grandTotalValue.toString(),
                MobileNumber: mobileNumber,
                Name: customerName,
                Note: note || ''
            };

            await set(ref(db, `CustomerPendingOrders/${userId}/${RandomUId}/OtherInformation`), customerInfo);

            for (const itemId in dishesData) {
                const dish = dishesData[itemId];
                const chefOrderData = {
                    ChefId: dish.ChefId,
                    DishId: dish.DishID,
                    DishName: dish.DishName,
                    DishQuantity: dish.DishQuantity,
                    Price: dish.Price,
                    RandomUID: RandomUId,
                    TotalPrice: dish.TotalPrice,
                    UserId: userId
                };

                await set(ref(db, `ChefPendingOrders/${dish.ChefId}/${RandomUId}/Dishes/${dish.DishID}`), chefOrderData);
            }

            const chefOtherInfo = {
                Address: address,
                GrandTotalPrice: grandTotalValue.toString(),
                MobileNumber: mobileNumber,
                Name: customerName,
                Note: note || '',
                RandomUID: RandomUId
            };

            await set(ref(db, `ChefPendingOrders/${chefId}/${RandomUId}/OtherInformation`), chefOtherInfo);

            await set(ref(db, `ordertype/${userId}/ordermethod`), orderMethod);

            // Set CustomerOrderTime
            const currentTime = formatDate(new Date());
            await set(ref(db, `CustomerOrderTime/${userId}/ordertime`), currentTime);

            await set(alreadyOrderedRef, "true");

            alert("Order placed successfully!");





// Fetch Chef's mobile number
const chefMobileRef = ref(db, `Chef/${chefId}/Mobile`);
const chefMobileSnapshot = await get(chefMobileRef);

if (chefMobileSnapshot.exists()) {
    const chefMobile = chefMobileSnapshot.val();

    // Use FCM to send notification
    // const functions = getFunctions();
    const sendOrderNotification = httpsCallable(functions, 'sendOrderNotification');
    try {
        const result = await sendOrderNotification({
            chefId: chefId,
            message: 'You have a new order'
        });
        if (result.data.success) {
            alert('Notification sent');
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
    getToken(messaging, { vapidKey: 'BNHTM8VddjWUeTw6hYvF9EP1yd0LmvsQ3kOg2BZPp0459wE3rdpxP-0nhe1OsksEVRY5Sn1ZVrtJlccJiD1NGYk' }).then((currentToken) => {
        if (currentToken) {
            fetch('https://fcm.googleapis.com/fcm/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `key=AAAACsNsjOs:APA91bGQ391e_WUGlXCU8zxoAsLC-SQ4FUyWVZTJEWon0KXQBKVvjgQRRP6br5A3TGFb7kNhEaNF780ReBKGe1D9R1NsK0AukKXOps6tqGq_eyyylQHAbCAnjHbC3j81lVu2BTI0-_G-`
                },
                body: JSON.stringify({
                    to: currentToken,
                    notification: {
                        title: 'New Order',
                        body: 'You have a new order',
                    },
                    data: {
                        message: `New Order : You have a New Order`,
                        number: `+91${chefMobile}`
                    }
                })
            }).then(response => {
                if (response.ok) {
                    alert('Notification sent');
                } else {
                    console.error('Error sending notification:', response);
                }
            }).catch(error => {
                console.error('Error sending notification:', error);
            });
        } else {
            console.warn('No registration token available. Request permission to generate one.');
        }
    }).catch((err) => {
        console.error('An error occurred while retrieving token. ', err);
    });
}










            await removeAllItems();
        }, (error) => {
            alert(`Error getting location: ${error.message}`);
        });
    };

    return (
        <div className="cart-container">
            <h1>Your Cart</h1>
            {cartItems.length > 0 ? (
                <div className="cart-items-wrapper">
                    {cartItems.map(item => (
                        <div key={item.id} className="cart-item">
                            <div className="cart-item-header">
                                <h2>{item.DishName}</h2>
                                <div className="quantity-controls">
                                    <button onClick={() => updateQuantity(item, item.quantity - 1)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item, item.quantity + 1)}>+</button>
                                </div>
                            </div>
                            <div className="cart-item-details">
                                <p>Price: ₹ {item.price}</p>
                                <p>Total: ₹ {item.total}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Your cart is empty</p>
            )}
            <div className="cart-footer">
                <h2>Grand Total: ₹ {grandTotal}</h2>
                {cartItems.length > 0 && availableOrderMethods.length > 0 && (
                    <div className="order-method-selection">
                        <label htmlFor="order-method">Order Method:</label>
                        <select
                            id="order-method"
                            value={orderMethod}
                            onChange={(e) => setOrderMethod(e.target.value)}
                            className="order-method-dropdown"
                        >
                            {availableOrderMethods.map((method) => (
                                <option key={method} value={method}>
                                    {method}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <button onClick={confirmRemoveAllItems} className="remove-all-button">Remove All</button>
                <button onClick={placeOrder} className="place-order-button">Place Order</button>
            </div>
        </div>
    );
};

export default Cart;
