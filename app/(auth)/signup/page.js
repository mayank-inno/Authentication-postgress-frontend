"use client";
import Link from 'next/link';
import { useState } from 'react';
import Spinner from '../../../components/Spinner';
import axios from "axios";
import { toast } from "react-toastify"
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { GoogleLogin } from '@react-oauth/google';

const page = () => {

    const router = useRouter();
    const [error, setError] = useState({ emailError: false, passError: false, confirmPassError: false });
    const [loading, setLoading] = useState(false);
    const [showPassValidation, setShowPassValidation] = useState(false);

    function checkPassword(password) {
        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (passRegex.test(password)) {
            setShowPassValidation(false);
            return true;
        }
        setShowPassValidation(true);
        return false;
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
        else if (checkPassword(data.confirmPassword.trim()) == false) {
            setError(prev => ({ ...prev, confirmPassError: true }))
        }
        else if (data.password !== data.confirmPassword) {
            toast.error("Password and Confirm Password is not matching");
        }
        else {
            setLoading(true);
            axios.post("https://authentication-postgress-backend-95.vercel.app/api/v1/sign-up", { email: data.email, password: data.password })
                .then((res) => {
                    toast.success("Account Created SuccessFull");
                    router.replace("/login");
                })
                .catch((err) => {
                    const errCode = err.response?.status || 800;
                    if (errCode == 400 || errCode == 500) {
                        toast.error(err.response.data.message);
                    }
                    else {
                        toast.error("Something Went Wrong, try again");
                    }
                })
                .finally(() => {
                    setLoading(false);
                })
        }
    }

    async function handleGoogle(res) {
        const credential = res.credential;
        const result = await axios.post(`https://authentication-postgress-backend-95.vercel.app/api/v1/auth/google`, { credential }, { withCredentials: true });
        console.log(result);
        if (result.data.success) {
            router.push("/");
        }
        else {
            console.log(res);
            toast.error("Gmail Verification failed, try again");
        }
    }

    return (
        <div className="min-h-screen w-full h-full flex items-center justify-center p-2 bg-white/90 z-[1] relative">
            <div className="absolute inset-0 z-[2] bg-[url('/signup-bg.jpg')] bg-cover bg-center"></div>
            <div className="z-[3] max-w-[1200px] container px-1 py-4 sm:p-4 rounded-lg flex  gap-6 bg-white">
                <div className="w-full sm:w-1/2 rounded-lg flex flex-col gap-4">
                    <Image src="/logo.avif" alt="Logo" className=" mx-auto" width={50} height={50} />
                    <div className="grow flex flex-col gap-2 w-4/5 lg:w-[70%] mx-auto">
                        <h1 className="text-center mx-auto text-xl md:text-3xl ">Create Account</h1>
                        <p className="text-center">Register your account today and enjoy seamless access. </p>
                        <form onSubmit={handleSubmit} className=" py-6 flex flex-col gap-6">
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
                                <input type="password" placeholder='Enter Password'
                                    onClick={() => { setError((prev) => ({ ...prev, passError: false })) }}
                                    name="password"
                                    className="px-2 outline-none py-2 w-full rounded-md bg-slate-100"
                                ></input>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className={`font-semibold ${error.confirmPassError ? "text-red-600 animate-bounce transition [animation-iteration-count:1]" : ""}`}>Confirm Password</label>
                                <input type="password" placeholder='Enter Password'
                                    onClick={() => { setError((prev) => ({ ...prev, confirmPassError: false })) }}
                                    name="confirmPassword"
                                    className="px-2 outline-none py-2 w-full rounded-md bg-slate-100"
                                ></input>
                            </div>
                            {showPassValidation ? <p className="text-xs text-red-600">Password must contain one Upper Case, One Lower Case, One Number, one Special Characacter and  must be greater then 8 characters.</p> : null}
                            <button type="submit"
                                disabled={loading}
                                className={`bg-black text-white rounded-lg py-2 mt-2 font-semibold   ${loading ? "cursor-not-allowed opacity-60" : "hover:scale-95 transition cursor-pointer"}`}>
                                {loading ? <Spinner borderColor="border-white" /> : <p>Sign Up</p>}
                            </button>
                        </form>
                        <div className="border-t-2 mx-auto relative pt-4 flex flex-col gap-4 w-full">
                            <p className="bg-white w-fit px-4 absolute translate-x-1/2 -translate-y-1/2 right-1/2 font-semibold top-0">or</p>
                            <GoogleLogin onSuccess={handleGoogle} onError={() => { toast.error("Google Verification Failed") }} />
                        </div>
                    </div>
                    <p className="text-center text-sm">Already a User? <Link href="/login" className="font-semibold hover:underline underline-offset-2">Login</Link></p>
                </div>
                <div className="hidden  sm:flex sm:w-1/2 rounded-lg px-2 py-4 self-center">
                    <Image src="/login_side.jpg" alt="" width={400} height={640} className="w-full h-auto aspect-square" />
                </div>
            </div>
        </div>
    )
}

export default page;
