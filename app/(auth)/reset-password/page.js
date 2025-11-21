"use client";
import { useRef, useEffect, useState } from "react";
import Link from "next/link"
import Spinner from "../../../components/Spinner";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";

const page = () => {
    const passConditions = ["Atleast 8 Characters", "1 Uppercase Letter", "1 Lowercase Letter", "1 Number", "1 Special Character"];
    const backendUrl = "http://localhost:8080/api/v1";
    const emailRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [authStep, setauthStep] = useState("otp");
    const router = useRouter();

    // for resend otp timer
    const [resetOtpTimer, setResetOtpTimer] = useState(60);
    const [showTimer, setShowTimer] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    useEffect(() => {
        if (!showTimer) return;
        const interval = setInterval(() => {
            setResetOtpTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [showTimer, resetOtpTimer])

    // these are error fields just for change password
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const [error, setError] = useState({
        passError: false,
        confirmPassError: false,
    });
    const [regexError, setRegexError] = useState({
        lengthError: true,
        upperCaseError: true,
        lowerCaseError: true,
        numberError: true,
        specialCharError: true,
    });
    const [password, setPassword] = useState("");

    const backendReq = (url, data, nextStep, setLoading) => {
        setLoading(true);
        axios.post(url, data)
            .then((res) => {
                toast.success(res.data.message);
                nextStep();
            })
            .catch((err) => {
                console.log(err)
                const errCode = err.response?.status || 800;
                if (errCode == 800) {
                    toast.error("Something Went Wrong");
                }
                else {
                    toast.error(err.response.data.message);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }

    function sendOTP(data) {
        if (data.email == "") {
            toast.error("Enter Email First");
        }
        else {
            try {
                emailRef.current = data.email;
                backendReq(backendUrl + "/send-otp", data, () => { setauthStep("verifyOtp"); setShowTimer(true); setResetOtpTimer(60) }, setLoading);
            }
            catch (err) {
                console.log(err);
                toast.error("Something Went Wrong");
            }
        }
    }

    function verifyOTP(data) {
        if (data.otp == "") {
            toast.error("OTP Required");
        }
        else {
            try {
                backendReq(backendUrl + "/verify-otp", data, () => { setauthStep("changePassword") }, setLoading);
            }
            catch (err) {
                console.log(err);
                toast.error("Something went wrong");
            }
        }
    }

    function checkPassError() {
        if (password.length < 8) {
            setRegexError(p => ({ ...p, }))
        }
        else if (!/[A-Z]/.test(password)) {
            setRegexError(p => ({ ...p, }))
        }
        else if (!/[a-z]/.test(password)) {
            setRegexError(p => ({ ...p, }))
        }
        else if (!/[0-9]/.test(password)) {
            setRegexError(p => ({ ...p, }))
        }
        else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            setRegexError(p => ({ ...p, }))
        }
        else {
            setRegexError(p => ({ ...p }));
        }
    }

    function changePassword(data) {
        if (data.password == "") {
            setError(p => ({ ...p, passError: true }))
        }
        else if (data.confirmPassword == "") {
            setError(p => ({ ...p, confirmPassError: true }))
        }
        else if (data.password !== data.confirmPassword) {
            toast.error("Password and Confirm Password Cant be Different");
        }
        // else if (!passRegex.test(data.password)) {
        //     checkPassError();
        // }
        else {
            backendReq(backendUrl + "/change-password", { email: emailRef.current, password: data.password }, () => { router.replace("/login") }, setLoading);
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        if (authStep == "verifyOtp") {
            verifyOTP({ ...data, email: emailRef.current });
        }
        else if (authStep == "otp") {
            sendOTP(data);
        }
        else {
            changePassword(data);
        }
    }

    function resendOtpButtonClicked() {
        console.log("resend otp button clicked");
        backendReq(backendUrl + "/send-otp", { email: emailRef.current }, () => { setResetOtpTimer(60); }, setOtpLoading);
    }

    return (
        <div className="min-h-screen w-full h-full p-4 flex items-center justify-center">
            <div className="flex flex-col gap-4 w-[90%] sm:w-[400px]">
                <img src="black-flag.png" className="w-[100px] mx-auto" />
                <div className="flex flex-col gap-2">
                    <h1 className="font-semibold text-2xl sm:text-3xl text-center">{authStep == "verifyOtp" ? <p>OTP Sent To Your Mail</p> : authStep == "otp" ? <p>Forgot Your Password?</p> : <p>Change Password</p>}</h1>
                    <p className="text-xs text-center text-black/60">{authStep == "verifyOtp" ? "Your 6 digit OTP code has been successfully sent to the registered email." : authStep == "otp" ? "Provide your registered email to begin the password recovery process safely." : "Enter Your New Password"}
                    </p>
                </div>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    {authStep == "otp" || authStep == "verifyOtp" ?
                        <div className="flex flex-col gap-1">
                            <label>{authStep == "otp" ? "Email" : "Enter OTP"}</label>
                            <input type={authStep == "verifyOtp" ? "number" : "email"} placeholder={authStep == "verifyOtp" ? "Enter OTP" : "Enter Email"} className="border border-black/50 px-2 py-1 rounded-lg outline-none cursor-pointer" name={authStep == "otp" ? "email" : "otp"}></input>
                            {showTimer ? (resetOtpTimer == 0 ? <p className="text-green-600 text-sm text-end underline underline-offset-2 cursor-pointer" onClick={resendOtpButtonClicked} >{otpLoading ? <span>Sending OTP <span className="animate-pulse">...</span></span> : "Send New OTP"}</p> : <p className="text-red-600 text-sm self-end underline underline-offset-2">Send OTP in {resetOtpTimer} secs</p>) : null}
                        </div> : authStep == "changePassword" ?
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className={`${error.passError ? "text-red-600 animate-bounce animate-[bounce_0.6s_ease-in-out_1] transition" : ""}`}>Enter New Password</label>
                                    <input type="Password"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value) }}
                                        onClick={() => { setError(p => ({ ...p, passError: false })) }} placeholder="Enter Password" className="border border-black/50 px-2 py-1 rounded-lg outline-none cursor-pointer" name="password"></input>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className={`${error.confirmPassError ? "text-red-600 animate-bounce animate-[bounce_0.6s_ease-in-out_1] transition" : ""}`}>Confirm Password</label>
                                    <input type="password"
                                        onClick={() => { setError(p => ({ ...p, confirmPassError: false })) }} placeholder="Confirm Password" className="border border-black/50 px-2 py-1 rounded-lg outline-none cursor-pointer" name="confirmPassword"></input>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm">Your Pass Must Contain</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {passConditions.map((condition, id) => (<div className="flex gap-1 items-center border px-1 rounded-md text-xs text-red-600" key={id}>
                                            <i className="fa-solid fa-x"></i>
                                            <p className="">{condition}</p>
                                        </div>))}
                                    </div>
                                </div>
                            </div> : null}
                    <button type="submit" className={`text-white px-4 py-1 rounded-lg ${loading ? "bg-black/50  cursor-not-allowed" : "cursor-pointer bg-black"}`}>{loading ? <Spinner /> : <p>{authStep == "otp" ? "Send OTP" : authStep == "verifyOtp" ? "Verify OTP" : "Change Password"}</p>}</button>
                    <Link href="/login" className="mx-auto text-sm underline cursor-pointer">Back To Login</Link>
                </form>
            </div>
        </div>
    )
}

export default page;

