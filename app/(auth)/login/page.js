"use client";
import Link from 'next/link';
import { useState } from 'react';
import Spinner from '../../../components/Spinner';
import axios from "axios";
import { toast } from "react-toastify"
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { GoogleLogin } from "@react-oauth/google";
import FBLoginButton from '../../../components/FBLoginButton';
import confetti from "canvas-confetti";

const page = () => {

    const router = useRouter();
    const [error, setError] = useState({ emailError: false, passError: false });

    const [passwordVisibility, setPasswordVisibility] = useState(false);

    const [loading, setLoading] = useState(false);

    const [password, setPassword] = useState("");

    const [passValidation, setPassValidation] = useState({
        length: false,
        upperCase: false,
        lowerCase: false,
        number: false,
        specialChar: false
    })

    function checkPassword(password) {
        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (passRegex.test(password)) {
            return true;
        }
        return false;
    }
    function fireConfetti() {
        confetti({
            particleCount: 200,
            spread: 70,
            origin: { y: 1.0 }
        });
    }
    function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        if (data.email.trim() == "") {
            setError(prev => ({ ...prev, emailError: true }))
        }
        else if (checkPassword(data.password.trim()) == false) {
            setError(prev => ({ ...prev, passError: true }))
        }
        else {
            setLoading(true);
            axios.post("http://localhost:8080/api/v1/login", data, { withCredentials: true })
                .then((res) => {
                    console.log(res);
                    toast.success("Login SuccessFull");
                    fireConfetti();
                    router.push("/");
                })
                .catch((err) => {
                    console.log(err);
                    const errCode = err.response.status;
                    if (errCode == 400 || errCode == 404 || errCode == 401 || errCode == 500) {
                        toast.error(err.response.data.message);
                    }
                    else {
                        toast.error("Something went wrong, try again");
                    }
                })
                .finally(() => {
                    setLoading(false);
                })
        }
    }

    function checkLength(pass) {
        if (pass.length >= 8) {
            setPassValidation((prev) => ({ ...prev, length: true }));
        }
        else {
            setPassValidation((prev) => ({ ...prev, length: false }));
        }
    }
    function checkLowerCase(pass) {
        if (/[a-z]/.test(pass)) {
            setPassValidation((prev) => ({ ...prev, lowerCase: true }));
        }
        else {
            setPassValidation((prev) => ({ ...prev, lowerCase: false }));
        }
    }
    function checkUpperCase(pass) {
        if (/[A-Z]/.test(pass)) {
            setPassValidation((prev) => ({ ...prev, upperCase: true }));
        }
        else {
            setPassValidation((prev) => ({ ...prev, upperCase: false }));
        }
    }
    function checkNumber(pass) {
        if (/\d/.test(pass)) {
            setPassValidation((prev) => ({ ...prev, number: true }));
        }
        else {
            setPassValidation((prev) => ({ ...prev, number: false }));
        }
    }
    function checkSpecialCharacter(pass) {
        if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
            setPassValidation((prev) => ({ ...prev, specialChar: true }));
        }
        else {
            setPassValidation((prev) => ({ ...prev, specialChar: false }));
        }
    }

    function handlePasswordInput(e) {
        setPassword(e.target.value);
        checkLength(e.target.value);
        checkUpperCase(e.target.value);
        checkLowerCase(e.target.value);
        checkNumber(e.target.value);
        checkSpecialCharacter(e.target.value);
    }

    async function handleGoogle(res) {
        const credential = res.credential;
        const result = await axios.post(`http://localhost:8080/api/v1/auth/google`, { credential }, { withCredentials: true });
        console.log(result);
        if (result.data.success) {   
            fireConfetti();   
            router.replace("/");
        }
        else {
            console.log(res);
            toast.error("Gmail Verification failed, try again");
        }
    }

    return (
        <div className="relative min-h-screen w-full h-full flex items-center justify-center p-2 bg-white z-[1]">
            {/* for blur */}
            <div className="absolute inset-0 bg-[url('/login-bg.jpg')] bg-cover bg-center blur-sm z-[2]"></div>
            <div className="max-w-[1200px] container px-1 py-4 sm:p-4 rounded-lg flex  gap-6 bg-white z-[3]">
                <div className="hidden  sm:flex sm:w-1/2 rounded-lg px-2 py-4">
                    <Image src="/login_side.png" alt="" width={1200} height={1200} className="w-full h-auto aspect-square self-center" />
                </div>
                <div className="w-full sm:w-1/2 rounded-lg flex flex-col gap-4">
                    <Image src="/logo.avif" alt="Logo" width={50} height={50} className="mx-auto" />
                    <div className="grow flex flex-col gap-2 w-4/5 lg:w-[70%] mx-auto">
                        <h1 className="text-center mx-auto text-xl md:text-3xl ">Welcome Back</h1>
                        <p className="text-center">Enter your email or password to access your account</p>
                        <form onSubmit={handleSubmit} className="pt-4 sm:pt-6 flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className={`font-semibold ${error.emailError ? "text-red-600 animate-bounce transition [animation-iteration-count:1]" : ""}`}>Email</label>
                                <input type="email" placeholder='Enter your email'
                                    onClick={() => { setError((prev) => ({ ...prev, emailError: false })) }}
                                    name="email"
                                    className="px-2 outline-none py-2 w-full rounded-md bg-slate-100"
                                ></input>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className={`font-semibold ${error.passError ? "text-red-600 animate-bounce transition [animation-iteration-count:1]" : ""}`}>Password</label>
                                <div className="relative">
                                    <input type={`${passwordVisibility ? "text" : "password"}`}
                                        placeholder='Enter your Password'
                                        value={password}
                                        onChange={handlePasswordInput}
                                        name="password"
                                        className={`px-2 outline-none py-2 w-full rounded-md bg-slate-100 `}
                                        onClick={() => { setError((prev) => ({ ...prev, passError: false })) }}
                                    ></input>
                                    <i onClick={() => { setPasswordVisibility(!passwordVisibility) }} className={`fa-solid cursor-pointer ${passwordVisibility ? "fa-eye" : "fa-eye-slash"} absolute top-1/2 -translate-y-1/2 right-0 pr-8`}></i>
                                </div>
                                <Link href="/reset-password" className="text-sm underline underline-offset-2 self-end mt-1">Forget Password</Link>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className={` text-xs flex gap-1 items-center ${passValidation.length ? "text-green-600" : "text-red-600"}`}>
                                    <i className={`fa-solid ${passValidation.length ? "fa-check" : "fa-x"} text-[10px]`}></i>
                                    <p className="">Password must have atleast 8 characters.</p>
                                </div>
                                <div className={`text-xs flex gap-1 items-center ${passValidation.upperCase ? "text-green-600" : "text-red-600"}`}>
                                    <i className={`fa-solid fa-x text-[10px] ${passValidation.upperCase ? "fa-check" : "fa-x"}`}></i>
                                    <p className="">Password must contain one UpperCase.</p>
                                </div>
                                <div className={`text-xs flex gap-1 items-center ${passValidation.lowerCase ? "text-green-600" : "text-red-600"}`}>
                                    <i className={`fa-solid fa-x text-[10px] ${passValidation.lowerCase ? "fa-check" : "fa-x"}`}></i>
                                    <p className="">Password must contain one LowerCase.</p>
                                </div>
                                <div className={`text-xs flex gap-1 items-center ${passValidation.number ? "text-green-600" : "text-red-600"}`}>
                                    <i className={`fa-solid fa-x text-[10px] ${passValidation.number ? "fa-check" : "fa-x"}`}></i>
                                    <p className="">Password must Contain one Number</p>
                                </div>
                                <div className={`text-xs flex gap-1 items-center ${passValidation.specialChar ? "text-green-600" : "text-red-600"}`}>
                                    <i className={`fa-solid fa-x text-[10px] ${passValidation.specialChar ? "fa-check" : "fa-x"}`}></i>
                                    <p className="">Password must Contains one Special Character.</p>
                                </div>
                            </div>
                            <button type="submit"
                                disabled={loading}
                                className={`bg-black text-white rounded-lg py-2 mt-2 font-semibold   ${loading ? "cursor-not-allowed opacity-60" : "hover:scale-95 transition cursor-pointer"}`}>
                                {loading ? <Spinner borderColor="border-white" /> : <p>Sign In</p>}
                            </button>
                        </form>
                    </div>
                    {/* for google microsoft login */}
                    <div className="border-t-2 w-4/5 lg:w-[70%] mx-auto relative pt-4 flex flex-col gap-4">
                        <p className="bg-white w-fit px-4 absolute translate-x-1/2 -translate-y-1/2 right-1/2 font-semibold top-0">or</p>
                        <GoogleLogin onSuccess={handleGoogle} onError={() => { toast.error("Google Validation failed") }} />
                        <FBLoginButton fireConfetti={fireConfetti}/>
                    </div>
                    <p className="text-center text-sm">Don't have an account? <Link href="/signup" className="font-semibold hover:underline underline-offset-2">Sign Up</Link></p>
                </div>
            </div>
        </div>
    )
}

export default page;
