import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, database } from '../firebase';
import { ref, set, getDatabase, get } from 'firebase/database';
import '../styles/Register.css';
import backgroundImage from '../assets/loginbackground.jpg';

// States and cities data
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

const Register = () => {
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
        address: '',
        state: '',
        city: '',
        suburban: ''
    });
    const [cities, setCities] = useState([]);
    const [suburbans, setSuburbans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const emailPattern1 = /^[a-zA-Z0-9._-]+@[a-z]+\.[a-z]+$/;
    const emailPattern2 = /^[a-zA-Z0-9._-]+@[a-z]+\.[a-z]+\.[a-z]+$/;

    const validate = () => {
        const newErrors = {};
        let isValid = true;

        if (!userDetails.firstName) {
            newErrors.firstName = "FirstName is required";
            isValid = false;
        }
        if (!userDetails.lastName) {
            newErrors.lastName = "LastName is required";
            isValid = false;
        }
        if (!userDetails.email) {
            newErrors.email = "Email is required";
            isValid = false;
        } else if (!emailPattern1.test(userDetails.email) && !emailPattern2.test(userDetails.email)) {
            newErrors.email = "Enter a valid Email Address";
            isValid = false;
        }
        if (!userDetails.mobile) {
            newErrors.mobile = "Mobile number is required";
            isValid = false;
        } else if (userDetails.mobile.length !== 10) {
            newErrors.mobile = "Invalid mobile number";
            isValid = false;
        }
        if (!userDetails.password) {
            newErrors.password = "Password is required";
            isValid = false;
        } else if (userDetails.password.length < 6) {
            newErrors.password = "Password too weak";
            isValid = false;
        }
        if (!userDetails.confirmPassword) {
            newErrors.confirmPassword = "Confirm Password is required";
            isValid = false;
        } else if (userDetails.password !== userDetails.confirmPassword) {
            newErrors.password = "Password doesn't match";
            newErrors.confirmPassword = "Password doesn't match";
            isValid = false;
        }
        if (!userDetails.address) {
            newErrors.address = "Local Address is required";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value
        }));

        if (name === 'state') {
            setCities(statesAndCities[value] || []);
            setUserDetails((prevDetails) => ({
                ...prevDetails,
                city: '',
                suburban: '',
                state: value
            }));
            setSuburbans([]);
        }

        if (name === 'city') {
            fetchSuburbans(value);
            setUserDetails((prevDetails) => ({
                ...prevDetails,
                suburban: '',
                city: value
            }));
        }
    };

    const fetchSuburbans = async (city) => {
        setLoading(true);
        const db = getDatabase();
        const suburbanRef = ref(db, `Spinner Data/${city}`);
        
        try {
            const snapshot = await get(suburbanRef);
            if (snapshot.exists()) {
                setSuburbans(Object.values(snapshot.val()));
            } else {
                setSuburbans([]);
            }
        } catch (error) {
            console.error("Error fetching suburbans:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const { firstName, lastName, email, mobile, password, address, state, city, suburban } = userDetails;

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDetailsToSave = {
                FirstName: firstName,
                LastName: lastName,
                EmailID: email,
                Mobileno: mobile,
                Password: password,
                ConfirmPassword: userDetails.confirmPassword,
                LocalAddress: address,
                State: state,
                City: city,
                Suburban: suburban
            };

            const userId = user.uid;

            // Save the user details to the Customer node
            await set(ref(database, 'Customer/' + userId), userDetailsToSave);

            // Save the role to the User node
            await set(ref(database, 'User/' + userId), { Role: 'Customer' });

            // Send email verification
            await sendEmailVerification(user);

            alert('Registered successfully. Please check your email to verify your account.');

            navigate('/login', { state: { phoneNumber: `+91${mobile}` } });
        } catch (error) {
            alert("Registration failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="container" 
            style={{ 
                background: `url(${backgroundImage}) no-repeat center center fixed`,
                backgroundSize: 'cover'
            }}
        >
            <div className="register-form">
                <h2>Register</h2>
                <form onSubmit={handleRegister}>
                    <div className="input-field">
                        <input 
                            type="text" 
                            placeholder="First Name" 
                            name="firstName"
                            value={userDetails.firstName}
                            onChange={handleInputChange}
                            required 
                        />
                        {errors.firstName && <span className="error">{errors.firstName}</span>}
                    </div>
                    <div className="input-field">
                        <input 
                            type="text" 
                            placeholder="Last Name" 
                            name="lastName"
                            value={userDetails.lastName}
                            onChange={handleInputChange}
                            required 
                        />
                        {errors.lastName && <span className="error">{errors.lastName}</span>}
                    </div>
                    <div className="input-field">
                        <input 
                            type="email" 
                            placeholder="Email id" 
                            name="email"
                            value={userDetails.email}
                            onChange={handleInputChange}
                            required 
                        />
                        {errors.email && <span className="error">{errors.email}</span>}
                    </div>
                    <div className="input-field">
                        <input 
                            type="text" 
                            placeholder="Mobile number" 
                            name="mobile"
                            value={userDetails.mobile}
                            onChange={handleInputChange}
                            required 
                        />
                        {errors.mobile && <span className="error">{errors.mobile}</span>}
                    </div>
                    <div className="input-field">
                        <input 
                            type="password" 
                            placeholder="Password" 
                            name="password"
                            value={userDetails.password}
                            onChange={handleInputChange}
                            required 
                        />
                        {errors.password && <span className="error">{errors.password}</span>}
                    </div>
                    <div className="input-field">
                        <input 
                            type="password" 
                            placeholder="Confirm password" 
                            name="confirmPassword"
                            value={userDetails.confirmPassword}
                            onChange={handleInputChange}
                            required 
                        />
                        {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
                    </div>
                    <div className="input-field">
                        <input 
                            type="text" 
                            placeholder="Local Address" 
                            name="address"
                            value={userDetails.address}
                            onChange={handleInputChange}
                            required 
                        />
                        {errors.address && <span className="error">{errors.address}</span>}
                    </div>
                    <div className="input-field">
                    <label>Order From: </label>
                        <label>State</label>
                        <select 
                            name="state" 
                            value={userDetails.state} 
                            onChange={handleInputChange} 
                            required
                        >
                            <option value="">Select State</option>
                            {Object.keys(statesAndCities).map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-field">
                        <label>City</label>
                        <select 
                            name="city" 
                            value={userDetails.city} 
                            onChange={handleInputChange} 
                            required
                        >
                            <option value="">Select City</option>
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-field">
                        <label>Store</label>
                        <select 
                            name="suburban" 
                            value={userDetails.suburban} 
                            onChange={handleInputChange} 
                            required
                        >
                            <option value="">Select Suburban</option>
                            {suburbans.map(suburban => (
                                <option key={suburban} value={suburban}>{suburban}</option>
                            ))}
                        </select>
                    </div>
                    <div className="actions">
                        <button type="submit" className="btn" disabled={loading}>
                            {loading ? 'Loading...' : 'Register'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
