import {createContext, useContext, useEffect, useState} from 'react'
import axios from "axios";
import {useNavigate} from 'react-router-dom'
import toast from 'react-hot-toast';


// axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
axios.interceptors.request.use((config) => {
    config.headers = {
        ...config.headers,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'If-None-Match': null
    };
    return config;
});

const AppContext = createContext();

export const AppProvider = ({ children })=>{

    const navigate = useNavigate()

    const [token, setToken] = useState(null)
    const [blogs, setBlogs] = useState([])
    const [input, setInput] = useState("")

    console.log("my key is ",import.meta.env.VITE_BASE_URL);

    const fetchBlogs = async () => {
    try {
        const timestamp = new Date().getTime();
        const {data} = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/blog/all`, {
            params: { timestamp },
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'If-None-Match': null
            }
        });
        if (data.success) {
            setBlogs(data.blogs);
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        console.error('Fetch blogs error:', error);
        toast.error(error.response?.data?.message || error.message);
    }
}

    useEffect(()=>{
        fetchBlogs();
        const token = localStorage.getItem('token')
        if(token){
            setToken(token);
            axios.defaults.headers.common['Authorization'] = `${token}`;
        }
    },[])

    const value = {
        axios, navigate, token, setToken, blogs, setBlogs, input, setInput
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = ()=>{
    return useContext(AppContext)
};