"use client";
import { useRef, useEffect, useState } from "react";
import Link from "next/link"
import Spinner from "../../../components/Spinner";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";

const page = () => {
    const backendUrl = "https://authentication-postgress-backend-95.vercel.app/api/v1";
    const emailRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [authStep, setauthStep] = useState("otp");
    const router = useRouter();
    const [password, setPassword] = useState("");
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

    const [passValidation, setPassValidation] = useState({
        length: false,
        upperCase: false,
        lowerCase: false,
        number: false,
        specialChar: false
    })

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
        else if (passRegex.test(data.password) == false) {
            toast.error("Wrong Password Formate");
        }
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
                                        onChange={handlePasswordInput}
                                        onClick={() => { setError(p => ({ ...p, passError: false })) }} placeholder="Enter Password" className="border border-black/50 px-2 py-1 rounded-lg outline-none cursor-pointer" name="password"></input>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className={`${error.confirmPassError ? "text-red-600 animate-bounce animate-[bounce_0.6s_ease-in-out_1] transition" : ""}`}>Confirm Password</label>
                                    <input type="password"
                                        onClick={() => { setError(p => ({ ...p, confirmPassError: false })) }} placeholder="Confirm Password" className="border border-black/50 px-2 py-1 rounded-lg outline-none cursor-pointer" name="confirmPassword"></input>
                                </div>
                                {/* code pasting */}
                                <div className="flex flex-col gap-2">
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
                            </div> : null}
                    <button type="submit" className={`text-white px-4 py-1 rounded-lg ${loading ? "bg-black/50  cursor-not-allowed" : "cursor-pointer bg-black"}`}>{loading ? <Spinner /> : <p>{authStep == "otp" ? "Send OTP" : authStep == "verifyOtp" ? "Verify OTP" : "Change Password"}</p>}</button>
                    <Link href="/login" className="mx-auto text-sm underline cursor-pointer">Back To Login</Link>
                </form>
            </div>
        </div>
    )
}

export default page;