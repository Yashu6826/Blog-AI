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

    const [token, setToken] = useState(() => localStorage.getItem('token'))
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
    const [user, setUser] = useState(null)
    const [blogs, setBlogs] = useState([])
    const [input, setInput] = useState("")
    const [blogsLoading, setBlogsLoading] = useState(true)
    const [authReady, setAuthReady] = useState(false)

    // console.log("my key is ",import.meta.env.VITE_BASE_URL);

    const fetchBlogs = async () => {
    try {
        setBlogsLoading(true);
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
    }finally{
        setBlogsLoading(false);
    }
}

    useEffect(()=>{
        fetchBlogs();
        if(token){
            axios.defaults.headers.common['Authorization'] = `${token}`;
            axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/me`).then(({data}) => {
                if (data.success) setUser(data.user)
            }).catch(() => {
                localStorage.removeItem('token')
                delete axios.defaults.headers.common['Authorization']
                setToken(null)
                setUser(null)
            }).finally(() => setAuthReady(true))
        } else {
            delete axios.defaults.headers.common['Authorization']
            setAuthReady(true)
        }
    },[token])

    useEffect(() => {
        document.documentElement.dataset.theme = theme
        localStorage.setItem('theme', theme)
    }, [theme])

    const canWrite = user?.email?.toLowerCase() === 'yashrajgupta306@gmail.com'
    const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark')

    const value = {
        axios, navigate, token, setToken, user, setUser, blogs, setBlogs, blogsLoading, fetchBlogs, input, setInput, authReady, canWrite, theme, toggleTheme
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
