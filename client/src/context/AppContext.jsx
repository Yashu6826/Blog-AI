import {createContext, useCallback, useContext, useEffect, useRef, useState} from 'react'
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
let googleScriptPromise = null;

const loadGoogleScript = () => {
    if (window.google?.accounts?.id) return Promise.resolve()
    if (googleScriptPromise) return googleScriptPromise

    googleScriptPromise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(), { once: true })
            existingScript.addEventListener('error', () => reject(new Error('Unable to load Google sign in.')), { once: true })
            return
        }

        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Unable to load Google sign in.'))
        document.body.appendChild(script)
    })

    return googleScriptPromise
}

export const AppProvider = ({ children })=>{

    const navigate = useNavigate()

    const [token, setToken] = useState(() => localStorage.getItem('token'))
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
    const [user, setUser] = useState(null)
    const [blogs, setBlogs] = useState([])
    const [input, setInput] = useState("")
    const [blogsLoading, setBlogsLoading] = useState(true)
    const [authReady, setAuthReady] = useState(false)
    const [googleAuthLoading, setGoogleAuthLoading] = useState(false)
    const googleInitializedRef = useRef(false)
    const oneTapPromptedRef = useRef(false)
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

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

    const finishGoogleAuth = useCallback((data) => {
        localStorage.setItem('token', data.token)
        axios.defaults.headers.common.Authorization = data.token
        setToken(data.token)
        setUser(data.user)
        toast.success(`Welcome, ${data.user.name}.`)
        navigate('/')
    }, [navigate])

    const handleGoogleCredential = useCallback(async (response) => {
        if (!response.credential) {
            toast.error('Google did not return a credential.')
            return
        }

        setGoogleAuthLoading(true)
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/users/google`, { credential: response.credential })
            if (!data.success) {
                toast.error(data.message)
                return
            }
            finishGoogleAuth(data)
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Google sign in failed.')
        } finally {
            setGoogleAuthLoading(false)
        }
    }, [finishGoogleAuth])

    const ensureGoogleInitialized = useCallback(async () => {
        if (!googleClientId) {
            throw new Error('Add VITE_GOOGLE_CLIENT_ID to client/.env to enable Google sign in.')
        }

        await loadGoogleScript()
        if (googleInitializedRef.current) return

        window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredential,
            context: 'signin',
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: true,
            itp_support: true,
        })
        googleInitializedRef.current = true
    }, [googleClientId, handleGoogleCredential])

    const renderGoogleButton = useCallback(async (container, options = {}) => {
        if (!container) return

        try {
            await ensureGoogleInitialized()
            container.innerHTML = ''
            window.google.accounts.id.renderButton(container, {
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular',
                type: 'standard',
                width: options.width || 112,
                use_fedcm_for_button: true,
            })
        } catch (error) {
            toast.error(error.message || 'Google sign in failed to load.')
        }
    }, [ensureGoogleInitialized])

    const startGoogleSignIn = useCallback(async ({ silent = false } = {}) => {
        if (!silent) setGoogleAuthLoading(true)
        try {
            await ensureGoogleInitialized()
            window.google.accounts.id.prompt((notification) => {
                const blocked = notification.isNotDisplayed?.() || notification.isSkippedMoment?.()
                const dismissed = notification.isDismissedMoment?.()
                if (blocked && !silent) {
                    toast.error('Google sign in could not open. Check browser sign-in or pop-up settings.')
                }
                if (blocked || dismissed) setGoogleAuthLoading(false)
            })
        } catch (error) {
            if (!silent) toast.error(error.message || 'Google sign in failed to load.')
            setGoogleAuthLoading(false)
        }
    }, [ensureGoogleInitialized])

    useEffect(() => {
        if (!authReady || token || oneTapPromptedRef.current) return
        oneTapPromptedRef.current = true
        const promptDelay = window.setTimeout(() => {
            startGoogleSignIn({ silent: true })
        }, 3500)

        return () => window.clearTimeout(promptDelay)
    }, [authReady, startGoogleSignIn, token])

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
    const logout = useCallback(() => {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
        setToken(null)
        setUser(null)
        window.google?.accounts?.id?.disableAutoSelect()
        navigate('/')
    }, [navigate])

    const value = {
        axios, navigate, token, setToken, user, setUser, blogs, setBlogs, blogsLoading, fetchBlogs, input, setInput, authReady, canWrite, theme, toggleTheme, logout, startGoogleSignIn, renderGoogleButton, googleAuthLoading
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
