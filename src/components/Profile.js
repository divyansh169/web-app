import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, update, set } from 'firebase/database';
import { getAuth, onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, linkWithCredential } from 'firebase/auth';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/Profile.css';

const statesAndCities = {
    AndhraPradesh: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Kakinada", "Rajahmundry", "Kadapa", "Tirupati", "Anantapuram", "Vizianagaram", "Eluru", "Nandyal", "Ongole", "Adoni", "Madanapalle", "Machilipatnam", "Tenali", "Proddatur", "Chittoor", "Hindupur", "Srikakulam", "Bhimavaram", "Tadepalligudem", "Guntakal", "Dharmavaram", "Gudivada", "Narasaraopet", "Kadiri", "Tadipatri", "Mangalagin", "Chilakaluripet"],
    ArunachalPradesh: ["ChanglangDistrict", "DibangValleyDistrict", "EastKamengDistrict", "EastSiangDistrict", "KurungKumeyDistrict", "LohitDistrict", "LowerDibangValleyDistrict", "LowerSubansiriDistrict", "PapumPareDistrict", "TawangDistrict", "TirapDistrict", "UpperSiangDistrict", "UpperSubansiriDistrict", "WestKamengDistrict", "WestSiangDistrict"],
    Assam: ["Guwahat", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Bongaigaon", "Tinsukia", "Tezpur", "Diphu", "Dhubri", "NorthLakhimpur", "Karimganj", "Sivasagar", "Goalpara", "BarpetaTown", "Golaghat", "Hafiong", "Mangaldai", "Tangla", "Lanka", "Hojai", "BarpetaRoad", "Kokrajhar", "Hailakandi", "Morigaon", "Nalbari", "Rangia", "Silapathar", "Dhekiajuli", "Dergaon", "Sonari", "Kharupetia", "Nazira", "Lakhipur"],
    Bihar: ["Patna", "Gaya", "Bhagalpur", "Purnia", "Muzafaffarpur", "Darbhanga", "BiharShaif", "Arrah", "Begusald", "Katihar", "Munger", "Chhapra", "Danapur", "Bettian", "saharsa", "Hajipur", "Sasaram", "Dehri", "Siwan", "Motihar", "Nawada", "Bagand", "Buxar", "Kishanganj", "Sitamarhi", "Jamalpur", "Jehanabad", "Aurangabadd"],
    Chandigarh: ["Chandigarhh"],
    Chattisgarh: ["NayaRaipur", "Raipur", "Bhilai", "Bilaaspur", "Korba", "Rajnandgaon", "Raiigarh", "Ambikapur", "Jagdalpur", "Chirmiri", "Dhamtari", "Mahasamund"],
    DadraandNagarHaveli: ["DadraandNagarHavelii"],
    DamanandDiu: ["DamanandDiuu"],
    Delhi: ["Delhii"],
    Goa: ["Bicholim", "Canacona", "Cuncolim", "Curchorem", "Mapusa", "Margao", "Mormugao", "Panaji", "Pernem", "Ponda", "Quepem", "Sanguem", "Sanquelim", "Valpoi"],
    Gujarat: ["Amdavad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Gandhidham", "Anand", "Navsari", "Morbi", "Nadiad", "Surendranagar", "Bharuch", "Mehsana", "Bhuj", "Porbandar", "Palanpur", "Valsad", "Vapi", "Gondal", "Veraval", "Godhra", "Patan", "Kalol", "Dahod", "Botad", "Amreli", "Deesa", "Jetpur"],
    Haryana: ["Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula", "Bhiwani", "Sirsa", "Bahadurgarn", "Jind", "Thanesar", "Kaithal", "Rewari", "Narnaul", "Pundri", "Kosli", "Palwal"],
    HimachalPradesh: ["Shimla", "Dharamsala", "Solan", "Mandi", "Palampur", "Baddi", "Nahan", "PaontaSahib", "Sundanagar", "Chamba", "Una", "Kullu", "Hamirpur", "Bilaspur", "YolCantonment", "Nalagarh", "Nurpur", "Kangra", "Santokhgarh", "MehatpurBasdehra", "Shamshi", "Parwanoo", "Manali", "TiraSujanpur", "Ghumarwin", "Dalhousie", "Rohru", "NagrotaBagwan", "Raampur", "Jawalamukhi", "Jogindernagar", "DeraGopipur", "Sarkaghat", "Jhakhri", "Indora", "Bhuntar", "Nadaun", "Theog", "KasauliCantonment", "Gagret", "ChuariKhas", "Daulatpur", "SabathuCantonment", "DalhousieCantonment", "Raigarh", "Arki", "DagshaiCantonment", "Seoni", "Talai", "JutoghCantonment", "Chaupal", "Rewalsar", "BaklohCantonment", "Jubbal", "Bhota", "Banjar", "NainaDevi", "Kotkhai", "Narkanda"],
    JammuandKashmir: ["Srinagar", "Jammu", "Anantnag"],
    Jharkhand: ["Jamshedpur", "Dhanbad", "Ranchi", "BokaroSteelCity", "Deoghar", "Phusro", "Hazaribagh", "Giridih", "Ramgarh", "Medininagar", "Chirkunda"],
    Karnataka: ["Bangalore", "HubliDharwad", "Mysore", "Gulbarga", "Mangalore", "Belgaum", "Davanagere", "Bellary", "Bijapur", "Shimoga", "Tumkur", "Raichur", "Bidar", "Hospet", "GadagBetageri", "Robertsonpet", "Hassan", "Bhadravati", "Chitradurga", "Udupi", "Kolar", "Mandya", "Chikmagalur", "Gangavati", "Bagalkot", "Ranebennuru"],
    Kerala: ["Thiruvananthapuram", "Kozhikode", "Kochi", "Kollam", "Thrissur", "Kannur", "Alappuzha", "Kottayam", "Palakkad", "Manjeri", "Thalassery", "Ponnani", "Vatakara", "Kanhangad", "Payyanur", "Koyilandy", "Parappanangadi", "Kalamassery", "Neyyattinkara", "Tanur", "Thrippunithura", "Kayamkulam", "Malappuram", "Thrikkakkara", "Wadakkancherry", "Nedumangad", "Kondotty", "Tirurangad", "irur", "Panoor", "Nileshwaram", "Kasaragod", "Feroke", "KunnamkUlam", "Ottappalam", "Tiruvalla", "Thodupuzha", "Perinthalmanna", "Chalakudy", "Payyoll", "Koduvally", "Mananthavady", "Changanassery", "Mattanur", "Punalur", "Nilambur", "Cherthala", "SultanBathery", "Maradu", "Kottakkal", "Taliparamba", "Shornur", "ndalam", "Kattappana", "Mukkam", "ty", "chery", "Varkala", "Cherpulassery", "Chavakkad", "Kothamangalam", "Pathanamthitta", "Atingal", "aravur", "Ramanattukara", "Mannarkkad", "rattupetta", "Kodungallur", "Sreekandapuram", "Anganiauy", "Chittur", "Thathamangalam", "Kalpetta", "NorthParavur", "Haripad", "Muvattupuzha", "Kottarakara", "Kuthuparamba", "Adoor", "Piravom", "Irinjalakuda", "Pattambi", "Anthoor", "Perumbavoor", "Ettumanoor", "Mavelikkara", "Karunagappalli", "Eloor", "Chengannur", "Vaikom", "Aluva", "Pala", "Guruvayur", "Koothattukulam", "Avinissery"],
    Ladakh: ["Ladakhh"],
    MadhyaPradesh: ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Katni", "Ujjain", "Dewas", "Satna", "Ratlam", "Rewa", "Sagar", "Singrauli", "Burhanpur", "Khandwa", "Bhind", "Chhindwara", "Guna", "Shivpuri", "Vidisha", "Chhatarpur", "Damoh", "Mandsaur", "Khargone", "Neemuch", "Pithampur", "Narmadapuram", "Itarsi", "Sehore", "Morena", "Betul", "Seonii", "Datia", "Nagda", "Dindori"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur", "Thane", "PCMCPune", "Nashik", "KalyanDombivli", "VasaiVirarCityMC", "Aurangabad", "NaviMumbai", "Solapur", "MiraBhayandar", "BhiwandiNizampurMC", "Jalgaon", "Amravati", "Nanded", "Kolhapur", "Ulhasnagar", "SangliMirajKupwad", "Malegaon", "Akola", "Latur", "Dhule", "Ahmednagar", "Chandrapur", "Parbhani", "Ichalkaranji", "Jalna", "Ambarnath", "Bhusawal", "Panvel", "Badlapur", "Beed", "Gondia", "Satara", "Barshi", "Yavatmal", "Achalpur", "Osmanabad", "Nandurbar", "Wardha", "Udgir", "Hinganghat"],
    Manipur: ["Bishnupur", "Thoubal", "ImphalEast", "ImphalWest", "Senapati", "Ukhrul", "Chandel", "Churachandpur", "Tamenglong", "Jiribam", "Kangpokpi", "Kakching", "Tengnoupal", "Kamjong", "Noney", "Pherzawi"],
    Meghalaya: ["Meghalayaa"],
    Mizoram: ["Aizawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip", "Champhai", "Hnahthial", "Khawzawl", "Saitual"],
    Nagaland: ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunhebote"],
    Odisha: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada"],
    Puducherry: ["Puducherryy"],
    Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Firozpur", "Batala", "Pathankot", "Moga", "Abohar", "Malerkotla", "Khanna", "Phagwara", "Muktsar", "Barnala", "Rajpura", "Hoshiarpur", "Kapurthala", "Faridkot", "Sunam"],
    Rajasthan: ["Jaipur", "Jodhpur", "Kota", "Bhiwadi", "Bikaner", "Udaipur", "Ajmer", "Bhilwara", "Alwar", "Sikar", "Bharatpur", "Pali", "SriGanganagar", "Kishangarh", "Baran", "Dhaulpur", "Tonk", "Beawar", "Hanumangarh"],
    Sikkim: ["Gangtok", "Mangan", "Namchi", "Gyalshing", "Pakyong", "Soreng"],
    TamilNadu: ["Chennai", "Coimbatore", "Madural", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Vellore", "Erode", "Thoothukkudi", "Dindigul", "Thanjavur", "Ranipet", "Sivakasi", "Karur", "Udhagamandalam", "Hosur", "Nagercoil", "Kanchipuram", "Kumarapalayam", "Karaikkudi", "Neyveli", "Cuddalore", "Kumbakonam", "Tiruvannamalai", "Pollachi", "Rajapalayam", "Gudiyatham", "Pudukkottai", "Vaniyambadi", "Ambur", "Nagapattinam"],
    Telangana: ["Hyderabad", "Warangala", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahabubnagar", "Nalgonda", "Adilabad", "Suryapet", "Siddipet", "Miryalaguda", "Jagtial", "Mancherial", "Nimal", "Sircilla", "Kamareddy", "Palwancha", "Kothagudem", "Bodhan", "Sangareddy", "Metpally", "Zahirabad", "MeerpetJillelguda", "Korutla", "Tandur", "Badangpet", "Kodad", "Armur", "Gadwal", "Wanaparthy", "Kagaznagar", "Bellampalle", "KhanapuramHaveli", "Bhuvanagiri", "Vikarabad", "Jangaon", "Mandamam", "Peerzadiguda", "Bhadrachalam", "Bhainsa", "Boduppal", "Jawaharnagar", "Medak", "Shamshabad", "Mahabubabad", "Bhupalpally", "Narayanpet", "Peddapaill", "Dundigal", "Huzumagar", "Medchal", "BandlagudaJagir", "Kyathanpally", "Manuguru", "Naspur", "Narsampet", "Devarakonda", "Dubbaka", "Nakrekal", "Banswada", "Kalwakurthy", "NagarKurnool", "Parigi", "Thumkunta", "Neredcherla", "Nagaram", "Gajwel", "Chennur", "Asifabad", "Madhira", "Ghatkesar", "Kompally", "Dasnapur", "Sarapaka", "Husnabad", "Pocharam", "Dammaiguda", "Achampet"],
    Tripura: ["Agartala", "Dharmanagar", "Udaipurr", "Kailashahar", "Bishalgarh", "Teliamura", "Khowai", "Belonia", "Melaghar", "Mohanpur", "Ambassa", "Ranirbazar", "Santirbazar", "Kumarghat", "Sonamura", "Panisagar", "Amarpur", "Jirania", "Kamalpur", "Sabroom"],
    UttarPradesh: ["Mathura", "Agra", "Aligarh", "Kanpur", "Lucknow", "Ghaziabad", "Meerut", "Varanasi", "Prayagraj", "Bareilly", "Moradabad", "Saharanpur", "Gorakhpur", "Noida", "Firozabad", "Jhansi", "Muzaffarnagar", "Goverdhan", "Vrindavan", "Budaun", "Rampur", "Shahjahanpur", "FarrukhabadcumFategarh", "FaizabadandAyodhya", "MaunathBhanjan", "Hapur", "Ayodhya", "Etawah", "MirzapurcumVindhyachal", "Bulandshahr", "Sambhal", "Amroha", "Hardoi", "Fatehpur", "Raebareli", "Orai", "Sitapur", "Bahraich", "Modinagar", "Unnao", "Jaunpur", "Lakhimpur", "Hathras", "Banda", "Pilibhit", "Barabanki", "Khurja", "Gonda", "Mainpuri", "Lalitpur", "Etah", "Deoria", "Ujhani", "Ghazipur", "Sultanpur", "Azamgarh", "Bijnor", "Sahaswan", "Basti", "Chandausi", "Akbarpur", "Ballia", "Tanda", "GreaterNoida", "Shikohabad", "Shamli", "Awagarh", "Kasganj"],
    Uttarakhand: ["Dehradun", "Haridwar", "Roorkee", "HaldwanicumKathgodamNainital", "Rudrapur", "Kashipur", "Rishikesh"],
    WestBengal: ["Kolkata", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur", "Shantipur", "Dankuni", "Dhulian", "Ranaghat", "Haldia", "Raiganj", "Krishnanagar", "Nabadwip", "Medinipur", "Jalpaiguri", "Balurghat", "Basirhat", "Bankura", "Chakdaha", "Darjeeling", "Alipurduar", "Purulia", "Jangipur", "Bolpur", "Bangaon", "CoochBehar"]
};


const Profile = () => {
    const [userDetails, setUserDetails] = useState({
        FirstName: '',
        LastName: '',
        EmailID: '',
        Mobileno: '',
        LocalAddress: '',
        State: '',
        City: '',
        Suburban: ''
    });

    const [cities, setCities] = useState([]);
    const [suburbans, setSuburbans] = useState([]);
    const [chefId, setChefId] = useState('');
    const [orders, setOrders] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [verificationId, setVerificationId] = useState('');
    const [otp, setOtp] = useState('');
    const [resendActive, setResendActive] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [otpSent, setOtpSent] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const auth = getAuth();

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchUserDetails(user.uid);
            }
        });
    }, [auth]);

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            if (location.pathname.endsWith('/order-chatbot') || location.pathname.endsWith('/chats-messages')) {
                fetchChefId(user.uid);
            }
        }
    }, [location, auth.currentUser]);

    useEffect(() => {
        if (chefId && location.pathname.endsWith('/chats-messages')) {
            fetchMessages();
        }
    }, [chefId, location.pathname]);

    useEffect(() => {
        if (location.pathname.endsWith('/verify-phone')) {
            initializeRecaptcha();
        }
    }, [location.pathname]);

    const initializeRecaptcha = () => {
        try {
            console.log("Initializing reCAPTCHA...");
            window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    console.log("reCAPTCHA solved");
                },
                'expired-callback': () => {
                    console.log("reCAPTCHA expired, reinitializing...");
                    initializeRecaptcha();
                }
            }, auth);
            window.recaptchaVerifier.render().then(widgetId => {
                window.recaptchaWidgetId = widgetId;
            });
        } catch (error) {
            console.error("Error initializing reCAPTCHA:", error);
        }
    };

    const fetchUserDetails = async (userId) => {
        const db = getDatabase();
        const userRef = ref(db, `Customer/${userId}`);

        try {
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                setUserDetails(data);

                if (data.State) {
                    setCities(statesAndCities[data.State] || []);
                }
                if (data.City) {
                    await fetchSuburbans(data.City);
                }
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    const fetchSuburbans = async (city) => {
        const db = getDatabase();
        const suburbanRef = ref(db, `Spinner Data/${city}`);
        
        try {
            const snapshot = await get(suburbanRef);
            if (snapshot.exists()) {
                setSuburbans(Object.values(snapshot.val()));
            }
        } catch (error) {
            console.error("Error fetching suburbans:", error);
        }
    };

    const fetchChefId = async (userId) => {
        const db = getDatabase();
        const userRef = ref(db, `Customer/${userId}`);

        try {
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                const { State, City, Suburban } = data;

                if (State && City && Suburban) {
                    const chefRef = ref(db, `FoodSupplyDetails/${State}/${City}/${Suburban}`);
                    const chefSnapshot = await get(chefRef);

                    if (chefSnapshot.exists()) {
                        const chefData = chefSnapshot.val();
                        const chefId = Object.keys(chefData)[0];
                        setChefId(chefId);
                    } else {
                        console.log("Chef ID does not exist in the database.");
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching chef ID:", error);
        }
    };

    const fetchAvailableDates = async () => {
        const user = auth.currentUser;
        if (user) {
            const userId = user.uid;
            const db = getDatabase();
            const datesRef = ref(db, `CustomerHistory/${userId}`);

            try {
                const snapshot = await get(datesRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const formattedDates = Object.keys(data).map(date => {
                        const year = date.slice(0, 4);
                        const month = date.slice(4, 6);
                        const day = date.slice(6, 8);
                        return { value: date, label: `${day}-${month}-${year}` };
                    });
                    setAvailableDates(formattedDates);
                }
            } catch (error) {
                console.error("Error fetching dates:", error);
            }
        }
    };

    const fetchOrderHistory = async (formattedDate) => {
        const user = auth.currentUser;
        if (user) {
            const userId = user.uid;
            const db = getDatabase();
            const ordersRef = ref(db, `CustomerHistory/${userId}/${formattedDate}`);

            try {
                const snapshot = await get(ordersRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const formattedOrders = Object.keys(data).map(randomUID => ({
                        orderDetails: data[randomUID].OtherInformation,
                        dishes: data[randomUID].Dishes,
                    }));
                    setOrders(formattedOrders);
                } else {
                    setOrders([]);
                }
            } catch (error) {
                console.error("Error fetching order history:", error);
            }
        }
    };

    const fetchMessages = async () => {
        const user = auth.currentUser;
        if (user) {
            const userId = user.uid;
            const db = getDatabase();
            const messagesRef = ref(db, `UserChats/${userId}/${chefId}`);

            try {
                const snapshot = await get(messagesRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const messagesArray = [];

                    Object.keys(data).forEach(timestamp => {
                        const messageData = data[timestamp];
                        messagesArray.push({
                            ...messageData,
                            timestamp: parseInt(timestamp, 10)
                        });
                    });

                    setMessages(groupMessagesByDate(messagesArray));
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        }
    };

    const groupMessagesByDate = (messages) => {
        const groupedMessages = new Map();

        messages.forEach((msg) => {
            const date = new Date(msg.timestamp);
            const dateString = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

            if (!groupedMessages.has(dateString)) {
                groupedMessages.set(dateString, []);
            }

            groupedMessages.get(dateString).push(msg);
        });

        const sortedGroupedMessages = Array.from(groupedMessages.entries())
            .sort(([dateA], [dateB]) => new Date(dateB.split('/').reverse().join('/')) - new Date(dateA.split('/').reverse().join('/')))
            .map(([date, msgs]) => ({
                type: 'date',
                date: date,
                messages: msgs
            }));

        return sortedGroupedMessages;
    };

    const handleSendMessage = async () => {
        const user = auth.currentUser;
        if (user && newMessage.trim() !== '') {
            const userId = user.uid;
            const db = getDatabase();
            const timestamp = Date.now();
            const messagesRef = ref(db, `UserChats/${userId}/${chefId}/${timestamp}`);

            const message = {
                message: `User: ${newMessage}`,
                timestamp: timestamp,
                userId: userId
            };

            try {
                await set(messagesRef, message);
                setNewMessage(''); // Clear the input field
                setLoading(true); // Set loading state to true
                await fetchMessages(); // Reload the messages
            } catch (error) {
                console.error("Error sending message:", error);
            } finally {
                setLoading(false); // Reset loading state
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserDetails({
            ...userDetails,
            [name]: value
        });

        if (name === 'State') {
            setCities(statesAndCities[value] || []);
            setUserDetails(prevDetails => ({
                ...prevDetails,
                City: '',
                Suburban: ''
            }));
            setSuburbans([]);
        }

        if (name === 'City') {
            fetchSuburbans(value);
            setUserDetails(prevDetails => ({
                ...prevDetails,
                Suburban: ''
            }));
        }
    };

    const handleUpdate = async () => {
        const userId = auth.currentUser.uid;
        const db = getDatabase();
        const userRef = ref(db, `Customer/${userId}`);

        try {
            await update(userRef, userDetails);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Error updating user details:", error);
        }
    };

    const handleLogout = () => {
        auth.signOut().then(() => {
            navigate('/');
        }).catch((error) => {
            console.error("Error signing out:", error);
        });
    };

    const handleDateChange = (selectedOption) => {
        setSelectedDate(selectedOption);
        fetchOrderHistory(selectedOption.value);
    };

    const checkPhoneNumber = async (phoneNumber) => {
        const db = getDatabase();
        const user = auth.currentUser;
        const userRef = ref(db, `Customer/${user.uid}`);
        
        try {
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (data.Mobileno === phoneNumber) {
                    alert('Phone number is already verified and linked to ' + data.EmailID);
                    return true;
                }
            }
        } catch (error) {
            console.error("Error checking phone number:", error);
        }
        return false;
    };

    const handleSendOtp = async () => {
        const phoneNumber = `+91${userDetails.Mobileno}`;
        const appVerifier = window.recaptchaVerifier;
        
        console.log("Sending OTP to:", phoneNumber);

        const isVerified = await checkPhoneNumber(phoneNumber);
        if (isVerified) return;

        try {
            PhoneAuthProvider.verifyPhoneNumber({
                phoneNumber: phoneNumber,
                timeout: 60000,
                appVerifier,
                callback: {
                    onVerificationCompleted: (credential) => {
                        console.log("Verification completed automatically", credential);
                    },
                    onVerificationFailed: (error) => {
                        console.error("Verification failed", error);
                        alert("Error sending OTP: " + error.message);
                    },
                    onCodeSent: (verificationId, forceResendingToken) => {
                        console.log("Code sent", verificationId);
                        setVerificationId(verificationId);
                        setResendActive(false);
                        setCountdown(60);
                        setOtpSent(true);
                        startCountdown();
                    }
                }
            });
        } catch (error) {
            console.error("Error sending OTP:", error);
            alert("Error sending OTP: " + error.message);
        }
    };

    const startCountdown = () => {
        const timer = setInterval(() => {
            setCountdown((prevCountdown) => {
                if (prevCountdown <= 1) {
                    clearInterval(timer);
                    setResendActive(true);
                    return 0;
                }
                return prevCountdown - 1;
            });
        }, 1000);
    };

    const handleResendOtp = async () => {
        handleSendOtp();
    };

    const handleVerifyOtp = async () => {
        try {
            const credential = PhoneAuthProvider.credential(verificationId, otp);
            const user = auth.currentUser;

            await linkWithCredential(user, credential);
            alert(`Phone number verified and linked to email ID: ${userDetails.EmailID}`);
        } catch (error) {
            console.error("Error verifying OTP:", error);
            alert('Error verifying OTP. Please try again.');
        }
    };

    const isAccountTabActive = location.pathname.endsWith('/account');
    const isChatbotTabActive = location.pathname.endsWith('/order-chatbot');
    const isOrderHistoryTabActive = location.pathname.endsWith('/order-history');
    const isChatsMessagesTabActive = location.pathname.endsWith('/chats-messages');
    const isVerifyPhoneTabActive = location.pathname.endsWith('/verify-phone');

    useEffect(() => {
        if (isOrderHistoryTabActive) {
            fetchAvailableDates();
        }
    }, [isOrderHistoryTabActive]);

    return (
        <div className="profile-container">
            <nav className="profile-tab-navigation">
                <NavLink to="account" className={({ isActive }) => isActive ? "profile-tab active" : "profile-tab"}>Account</NavLink>
                <NavLink to="order-chatbot" className={({ isActive }) => isActive ? "profile-tab active" : "profile-tab"}>Order Using Chatbot</NavLink>
                <NavLink to="order-history" className={({ isActive }) => isActive ? "profile-tab active" : "profile-tab"}>Order History</NavLink>
                <NavLink to="chats-messages" className={({ isActive }) => isActive ? "profile-tab active" : "profile-tab"}>Chats and Messages</NavLink>
                <NavLink to="verify-phone" className={({ isActive }) => isActive ? "profile-tab active" : "profile-tab"}>Verify Phone</NavLink>
                <NavLink to="tech-support" className={({ isActive }) => isActive ? "profile-tab active" : "profile-tab"}>Tech Support</NavLink>
            </nav>
            <div className="profile-tab-content">
                <Outlet />
                {isAccountTabActive && (
                    <div className="account-tab">
                        <h2>My Account</h2>
                        <div className="profile-field">
                            <label>First Name</label>
                            <input type="text" name="FirstName" value={userDetails.FirstName} onChange={handleInputChange} />
                        </div>
                        <div className="profile-field">
                            <label>Last Name</label>
                            <input type="text" name="LastName" value={userDetails.LastName} onChange={handleInputChange} />
                        </div>
                        <div className="profile-field">
                            <label>Mobile Number</label>
                            <div className="input-group">
                                <input type="text" name="Mobileno" value={userDetails.Mobileno} onChange={handleInputChange} disabled />
                                <button className="verify-button" disabled>Verify</button>
                            </div>
                        </div>
                        <div className="profile-field">
                            <label>Email</label>
                            <div className="input-group">
                                <input type="email" name="EmailID" value={userDetails.EmailID} onChange={handleInputChange} disabled />
                                <button className="verify-button" disabled>Verify</button>
                            </div>
                        </div>
                        <div className="profile-field">
                            <label>Address</label>
                            <input type="text" name="LocalAddress" value={userDetails.LocalAddress} onChange={handleInputChange} />
                        </div>
                        <div className="profile-field">
                            <label>State</label>
                            <select name="State" value={userDetails.State} onChange={handleInputChange}>
                                <option value="">Select State</option>
                                {Object.keys(statesAndCities).map((state) => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                        <div className="profile-field">
                            <label>City</label>
                            <select name="City" value={userDetails.City} onChange={handleInputChange}>
                                <option value="">Select City</option>
                                {cities.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                        <div className="profile-field">
                            <label>Store/Order From:</label>
                            <select name="Suburban" value={userDetails.Suburban} onChange={handleInputChange}>
                                <option value="">Select Suburban</option>
                                {suburbans.map((suburban) => (
                                    <option key={suburban} value={suburban}>{suburban}</option>
                                ))}
                            </select>
                        </div>
                        <button className="update-button" onClick={handleUpdate}>Update</button>
                        <button className="logout-button" onClick={handleLogout}>Logout</button>
                    </div>
                )}
                {isChatbotTabActive && (
                    <div className="chatbot-tab">
                        <h2>Order Using Chatbot</h2>
                        <div className="chatbot-container" style={{ width: '100%', height: '100vh' }}>
                            <iframe
                                allow="microphone;"
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                src="https://console.dialogflow.com/api-client/demo/embedded/1095da52-d908-49dd-8cc8-e66646df2a87"
                                title="Dialogflow Chatbot"
                            ></iframe>
                        </div>
                        {/* <div style={{ marginTop: '20px' }}>
                            <strong>Chef ID: </strong> {chefId}
                        </div> */}
                    </div>
                )}
                {isOrderHistoryTabActive && (
                    <div className="order-history-tab">
                        <h2>Select Date:</h2>
                        <Select
                            options={availableDates}
                            onChange={handleDateChange}
                            className="custom-select"
                        />
                        {orders.length === 0 ? (
                            <p>No Orders Available for {selectedDate?.label}</p>
                        ) : (
                            orders.map((order, index) => (
                                <div key={index} className="order-card">
                                    <div className="user-details">
                                        <p className="finish-date">#{selectedDate.label}</p>
                                        <p className="company-name">{order.orderDetails.CompanyName}</p>
                                        <p>{order.orderDetails.Name}</p>
                                        <p>{order.orderDetails.MobileNumber}</p>
                                        <p>Address: {order.orderDetails.Address.split(':')[1]}</p>
                                        <p>Grand Total Price: ₹{order.orderDetails.GrandTotalPrice}</p>
                                    </div>
                                    <div className="dish-details">
                                        {Object.keys(order.dishes).map((dishId, idx) => (
                                            <div key={idx} className="dish-item">
                                                <p>{order.dishes[dishId].DishName} <span className="dish-price">₹{order.dishes[dishId].DishPrice} x {order.dishes[dishId].DishQuantity}</span></p>
                                                <p>Total Price: ₹{order.dishes[dishId].TotalPrice}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
                {isChatsMessagesTabActive && (
                    <div className="chats-messages-tab">
                        <h2>Chats and Messages</h2>
                        {loading ? (
                            <div>Loading messages...</div>
                        ) : (
                            <div className="messages-list">
                                {messages && messages.map((group, idx) => (
                                    <div key={idx}>
                                        <div className="message-date">{group.date}</div>
                                        {group.messages.map((msg, msgIdx) => (
                                            <div key={msgIdx} className={`message ${msg.message?.startsWith('User:') ? 'user-message' : 'response-message'}`}>
                                                <p>{msg.message}</p>
                                                <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="message-input">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message"
                            />
                            <button onClick={handleSendMessage}>Send</button>
                        </div>
                    </div>
                )}
                {isVerifyPhoneTabActive && (
                    <div className="verify-phone-tab">
                        <h2>Verify Phone</h2>
                        {!otpSent ? (
                            <div className="verify-phone-field">
                                <input
                                    type="text"
                                    name="Mobileno"
                                    value={userDetails.Mobileno}
                                    onChange={handleInputChange}
                                    disabled
                                />
                                <button onClick={handleSendOtp} disabled={!resendActive && countdown > 0}>Send OTP</button>
                            </div>
                        ) : (
                            <div className="verify-phone-field">
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter OTP"
                                />
                                <button onClick={handleVerifyOtp}>Verify OTP</button>
                                <button onClick={handleResendOtp} disabled={!resendActive && countdown > 0}>
                                    {resendActive ? 'Resend OTP' : `Resend OTP in ${countdown} seconds`}
                                </button>
                            </div>
                        )}
                        <div id="recaptcha-container"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
