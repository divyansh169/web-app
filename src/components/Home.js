import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../styles/Home.css';

const Home = () => {
    const [locationInfo, setLocationInfo] = useState({ city: '', state: '', suburban: '' });
    const [dishes, setDishes] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchCustomerInfo = async (userId) => {
            const db = getDatabase();
            const customerInfoRef = ref(db, `Customer/${userId}`);

            try {
                const snapshot = await get(customerInfoRef);

                if (snapshot.exists()) {
                    const data = snapshot.val();
                    console.log("Fetched customer info:", data);

                    if (data && data.Suburban) {
                        const { State, City, Suburban } = data;
                        setLocationInfo({ city: City, state: State, suburban: Suburban });
                        fetchDishes(State, City, Suburban, userId);
                    } else {
                        console.log("No customer info available or Suburban not found");
                    }
                }
            } catch (error) {
                console.error("Error fetching customer info:", error);
            }
        };

        const fetchDishes = async (state, city, suburban, userId) => {
            const db = getDatabase();
            const dishesRef = ref(db, `FoodSupplyDetails/${state}/${city}/${suburban}`);
            const cartRef = ref(db, `Cart/CartItems/${userId}`);

            try {
                const [dishesSnapshot, cartSnapshot] = await Promise.all([get(dishesRef), get(cartRef)]);

                let cartData = {};
                if (cartSnapshot.exists()) {
                    cartData = cartSnapshot.val();
                }

                if (dishesSnapshot.exists()) {
                    const data = dishesSnapshot.val();
                    console.log("Fetched dishes data:", data);

                    const dishesList = [];
                    for (const sellerId in data) {
                        const sellerData = data[sellerId];
                        for (const dishId in sellerData) {
                            const dish = sellerData[dishId];
                            const quantity = cartData[dishId] ? parseInt(cartData[dishId].DishQuantity, 10) : 0;
                            dishesList.push({ id: dishId, quantity, ...dish });
                        }
                    }

                    setDishes(dishesList);
                } else {
                    setDishes([]);
                }
            } catch (error) {
                console.error("Error fetching dishes:", error);
            }
        };

        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchCustomerInfo(user.uid);
            }
        });
    }, []);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const totalPages = Math.ceil(dishes.length / itemsPerPage);
    const displayedDishes = dishes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="home-container">
            <div className="location-info">
                <p>City: {locationInfo.city}</p>
                <p>State: {locationInfo.state}</p>
                <p>Suburban: {locationInfo.suburban}</p>
            </div>
            <div className="dishes-list">
                {displayedDishes.length > 0 ? (
                    displayedDishes.map((dish) => (
                        <DishCard
                            key={dish.id}
                            dish={dish}
                            locationInfo={locationInfo}
                        />
                    ))
                ) : (
                    <p>No dishes available</p>
                )}
            </div>
            <div className="pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        className={currentPage === index + 1 ? 'active' : ''}
                        onClick={() => handlePageChange(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

const DishCard = ({ dish, locationInfo }) => {
    const [quantity, setQuantity] = useState(dish.quantity || 0);
    const [animationClass, setAnimationClass] = useState('');

    useEffect(() => {
        const fetchCartQuantity = async () => {
            const db = getDatabase();
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                const cartRef = ref(db, `Cart/CartItems/${user.uid}/${dish.id}`);
                const snapshot = await get(cartRef);

                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setQuantity(parseInt(data.DishQuantity, 10));
                }
            }
        };

        fetchCartQuantity();
    }, [dish.id]);

    const handleQuantityChange = async (newQuantity) => {
        const db = getDatabase();
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const cartRef = ref(db, `Cart/CartItems/${user.uid}/${dish.id}`);
            const cartSnapshot = await get(ref(db, `Cart/CartItems/${user.uid}`));

            // Check condition 1: Ensure same ChefId
            if (cartSnapshot.exists()) {
                const cartData = cartSnapshot.val();
                const existingChefIds = Object.values(cartData).map(item => item.ChefId);
                if (existingChefIds.length > 0 && existingChefIds[0] !== dish.ChefId) {
                    alert("You can't add product items of multiple Stores at a time. Try to add items from same Store.");
                    return;
                }
            }

            if (newQuantity > 0) {
                const totalprice = newQuantity * parseFloat(dish.Price);

                const cartItem = {
                    DishName: dish.Dishes,
                    DishID: dish.id,
                    DishQuantity: newQuantity.toString(),
                    Price: dish.Price,
                    Totalprice: totalprice.toString(),
                    ChefId: dish.ChefId
                };

                console.log("Updating cart item:", cartItem); // Debug log

                if (Object.values(cartItem).some(value => value === undefined)) {
                    console.error("Cart item contains undefined values:", cartItem);
                    return;
                }

                await set(cartRef, cartItem);
                if (newQuantity > quantity) {
                    alert("Added to cart"); // Show toast message for adding to cart
                } else {
                    alert("Removed from cart"); // Show toast message for removing from cart
                }
            } else {
                await set(cartRef, null); // Remove item if quantity is zero
                alert("Removed from cart"); // Show toast message for removing from cart
            }
        }
        setAnimationClass(newQuantity > quantity ? 'increase' : 'decrease');
        setQuantity(newQuantity);
        setTimeout(() => setAnimationClass(''), 200);
    };

    const increaseQuantity = () => {
        if (dish.Stockcnt === "0") {
            alert("This item is out of stock");
            return;
        }
        handleQuantityChange(quantity + 1);
    };

    const decreaseQuantity = () => handleQuantityChange(quantity - 1);

    return (
        <div className="dish-card">
            <img src={dish.ImageURL} alt={dish.Dishes} className="dish-image" />
            <div className="dish-info">
                <div className="dish-header">
                    <h2 className="dish-name">{dish.Dishes}</h2>
                    <p className="dish-price">Price: ₹ {dish.Price}</p>
                </div>
                <p className="dish-attributes">{dish.Prodatt}</p>
                {dish.Stockcnt !== "in stock" && (
                    <p className="dish-stock">Stock: {dish.Stockcnt}</p>
                )}
                <div className="order-counter">
                    <button onClick={decreaseQuantity} disabled={quantity <= 0}>-</button>
                    <span className={animationClass}>{quantity}</span>
                    <button onClick={increaseQuantity}>+</button>
                </div>
            </div>
        </div>
    );
};

export default Home;
